-- Add website_url, youtube_url, and image_url columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS youtube_url TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT;