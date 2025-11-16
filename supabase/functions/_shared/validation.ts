import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { ethers } from "npm:ethers@6.13.4";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Wallet address validation (Ethereum-compatible format)
const walletAddressSchema = z.string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid wallet address format")
  .transform(addr => addr.toLowerCase());

// Product submission validation
export const submitProductSchema = z.object({
  title: z.string()
    .trim()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  tagline: z.string()
    .trim()
    .max(200, "Tagline must be less than 200 characters")
    .optional(),
  description: z.string()
    .trim()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
  makerAddress: walletAddressSchema,
  category: z.enum([
    "finance", "web3", "ai", "productivity", 
    "developer", "design", "other", "General"
  ]).default("General"),
  websiteUrl: z.string()
    .trim()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  youtubeUrl: z.string()
    .trim()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  imageUrl: z.string()
    .trim()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  signature: z.string().min(1, "Wallet signature required"),
  message: z.string().min(1, "Signed message required"),
  timestamp: z.number().int().positive()
});

// Vote validation
export const voteSchema = z.object({
  productId: z.string().uuid("Invalid product ID format"),
  voterAddress: walletAddressSchema,
  signature: z.string().min(1, "Wallet signature required"),
  message: z.string().min(1, "Signed message required"),
  timestamp: z.number().int().positive()
});

// Database-backed rate limiting helper
export async function checkRateLimit(
  identifier: string, 
  maxRequests: number = 10, 
  windowMs: number = 60000
): Promise<boolean> {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const windowStart = new Date(Date.now() - windowMs);
  
  // Get or create rate limit record
  const { data: existing, error: fetchError } = await supabase
    .from('rate_limits')
    .select('count, window_start')
    .eq('identifier', identifier)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found
    console.error('Rate limit fetch error:', fetchError);
    return true; // Fail open on errors
  }

  const now = new Date();

  // If no record exists or window expired, create new record
  if (!existing || new Date(existing.window_start) < windowStart) {
    const { error: upsertError } = await supabase
      .from('rate_limits')
      .upsert({
        identifier,
        count: 1,
        window_start: now,
        updated_at: now
      });

    if (upsertError) {
      console.error('Rate limit upsert error:', upsertError);
      return true; // Fail open on errors
    }
    
    return true;
  }

  // Check if limit exceeded
  if (existing.count >= maxRequests) {
    return false;
  }

  // Increment count
  const { error: updateError } = await supabase
    .from('rate_limits')
    .update({ 
      count: existing.count + 1,
      updated_at: now
    })
    .eq('identifier', identifier);

  if (updateError) {
    console.error('Rate limit update error:', updateError);
    return true; // Fail open on errors
  }

  return true;
}

// Cryptographic signature verification helper
export function verifySignatureMessage(
  address: string, 
  message: string, 
  signature: string,
  timestamp: number
): { valid: boolean; error?: string } {
  // Verify timestamp is recent (within 5 minutes)
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;
  
  if (Math.abs(now - timestamp) > fiveMinutes) {
    return { valid: false, error: "Signature timestamp expired" };
  }
  
  // Verify message format includes the timestamp and address
  const expectedMessagePrefix = `ArcHunt Action\nWallet: ${address.toLowerCase()}\nTimestamp: ${timestamp}`;
  if (!message.startsWith(expectedMessagePrefix)) {
    return { valid: false, error: "Invalid message format" };
  }
  
  try {
    // Verify the cryptographic signature using ethers.js
    const recoveredAddress = ethers.verifyMessage(message, signature);
    
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return { valid: false, error: "Signature does not match wallet address" };
    }
    
    return { valid: true };
  } catch (error) {
    console.error('Signature verification error:', error);
    return { valid: false, error: "Invalid signature format or verification failed" };
  }
}

// Sanitize text to prevent XSS
export function sanitizeText(text: string): string {
  return text
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim();
}
