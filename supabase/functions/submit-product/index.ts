import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { submitProductSchema, checkRateLimit, verifySignatureMessage, sanitizeText } from "../_shared/validation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate input schema
    const validation = submitProductSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validation.error.issues[0].message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { title, tagline, description, makerAddress, category, signature, message, timestamp } = validation.data;
    
    // Verify signature message format
    const sigVerification = verifySignatureMessage(makerAddress, message, timestamp);
    if (!sigVerification.valid) {
      return new Response(
        JSON.stringify({ error: sigVerification.error || 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting per wallet address
    if (!checkRateLimit(`submit:${makerAddress}`, 5, 24 * 60 * 60 * 1000)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Maximum 5 products per wallet per day.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        title: sanitizeText(title),
        tagline: tagline ? sanitizeText(tagline) : null,
        description: description ? sanitizeText(description) : null,
        maker_address: makerAddress,
        category,
        vote_count: 0,
        payout_status: 'none'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to create product' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Product created:', product.id);
    return new Response(
      JSON.stringify({ product }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in submit-product:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred while processing your request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});