import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CIRCLE_API_KEY = Deno.env.get('CIRCLE_API_KEY');
const CIRCLE_BASE_URL = 'https://api.circle.com/v1/w3s';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, userId, userToken } = await req.json();

    if (!CIRCLE_API_KEY) {
      throw new Error('CIRCLE_API_KEY not configured');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (action === 'create') {
      // Create Circle user
      const response = await fetch(`${CIRCLE_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CIRCLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Circle user creation failed:', error);
        throw new Error(`Failed to create user: ${error}`);
      }

      const data = await response.json();
      console.log('Circle user created:', data);

      // Store user token in database
      const { error: dbError } = await supabase
        .from('circle_users')
        .upsert({
          user_id: userId,
          user_token: data.data.userToken,
          created_at: new Date().toISOString()
        });

      if (dbError) {
        console.error('Error storing user token:', dbError);
      }

      return new Response(
        JSON.stringify({ 
          userId: data.data.userId,
          userToken: data.data.userToken
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'initiate-wallet') {
      // Initiate wallet creation challenge
      const response = await fetch(`${CIRCLE_BASE_URL}/user/initialize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CIRCLE_API_KEY}`,
          'Content-Type': 'application/json',
          'X-User-Token': userToken
        },
        body: JSON.stringify({
          accountType: 'SCA',
          blockchains: ['ARC-TESTNET']
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Wallet initialization failed:', error);
        throw new Error(`Failed to initialize wallet: ${error}`);
      }

      const data = await response.json();
      console.log('Wallet challenge created:', data);

      return new Response(
        JSON.stringify({ 
          challengeId: data.data.challengeId
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'get-wallet') {
      // Get user's wallets
      const response = await fetch(`${CIRCLE_BASE_URL}/wallets`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${CIRCLE_API_KEY}`,
          'X-User-Token': userToken
        }
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Get wallet failed:', error);
        throw new Error(`Failed to get wallet: ${error}`);
      }

      const data = await response.json();
      console.log('Wallets retrieved:', data);

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in circle-user:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
