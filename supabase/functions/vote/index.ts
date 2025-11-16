import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VOTE_THRESHOLD = 10;
const PAYOUT_AMOUNT = "1.00";
const CIRCLE_ENV = "sandbox";
const CIRCLE_BASE = "https://api-sandbox.circle.com";

async function triggerPayout(product: any) {
  const CIRCLE_API_KEY = Deno.env.get('CIRCLE_API_KEY');
  if (!CIRCLE_API_KEY) {
    throw new Error('CIRCLE_API_KEY not configured');
  }

  const idempotencyKey = crypto.randomUUID();
  
  const body = {
    amount: { amount: PAYOUT_AMOUNT, currency: 'USD' },
    destination: {
      type: 'blockchain',
      chain: 'arc', // Arc testnet
      address: product.maker_address
    },
    idempotencyKey
  };

  console.log('Triggering Circle payout:', { productId: product.id, amount: PAYOUT_AMOUNT });

  const response = await fetch(`${CIRCLE_BASE}/v1/payouts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CIRCLE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('Circle payout error:', data);
    throw new Error(`Payout failed: ${JSON.stringify(data)}`);
  }

  console.log('Payout successful:', data);
  return data;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productId, voterAddress } = await req.json();
    
    if (!productId || !voterAddress) {
      return new Response(
        JSON.stringify({ error: 'productId and voterAddress required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if product exists
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return new Response(
        JSON.stringify({ error: 'Product not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try to insert vote (will fail if duplicate due to UNIQUE constraint)
    const { error: voteError } = await supabase
      .from('votes')
      .insert({
        product_id: productId,
        voter_address: voterAddress.toLowerCase()
      });

    if (voteError) {
      if (voteError.code === '23505') { // Duplicate key error
        return new Response(
          JSON.stringify({ error: 'You have already voted for this product', votes: product.vote_count, payoutStatus: product.payout_status }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.error('Error inserting vote:', voteError);
      return new Response(
        JSON.stringify({ error: voteError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get current vote count
    const { count } = await supabase
      .from('votes')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', productId);

    const voteCount = count || 0;

    // Update product vote count
    const { error: updateError } = await supabase
      .from('products')
      .update({ vote_count: voteCount })
      .eq('id', productId);

    if (updateError) {
      console.error('Error updating vote count:', updateError);
    }

    // Check if we hit threshold and should trigger payout
    let payoutStatus = product.payout_status;
    let payoutData = product.payout_data;

    if (voteCount >= VOTE_THRESHOLD && product.payout_status === 'none') {
      // Set status to pending
      await supabase
        .from('products')
        .update({ payout_status: 'pending' })
        .eq('id', productId);

      payoutStatus = 'pending';

      // Trigger payout asynchronously
      try {
        const payout = await triggerPayout(product);
        
        // Update to paid status with payout data
        await supabase
          .from('products')
          .update({ 
            payout_status: 'paid',
            payout_data: payout
          })
          .eq('id', productId);

        payoutStatus = 'paid';
        payoutData = payout;
      } catch (error) {
        console.error('Payout failed:', error);
        await supabase
          .from('products')
          .update({ payout_status: 'failed' })
          .eq('id', productId);
        
        payoutStatus = 'failed';
      }
    }

    console.log('Vote recorded:', { productId, voterAddress, voteCount });
    return new Response(
      JSON.stringify({ votes: voteCount, payoutStatus, payoutData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in vote:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});