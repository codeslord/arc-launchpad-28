import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

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

// Rate limiting helper
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(identifier: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
}

// Signature verification helper
export function verifySignatureMessage(
  address: string, 
  message: string, 
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
  
  return { valid: true };
}

// Sanitize text to prevent XSS
export function sanitizeText(text: string): string {
  return text
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim();
}
