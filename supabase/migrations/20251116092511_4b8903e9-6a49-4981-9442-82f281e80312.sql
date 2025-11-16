-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  maker_address TEXT NOT NULL,
  vote_count INTEGER NOT NULL DEFAULT 0,
  payout_status TEXT NOT NULL DEFAULT 'none' CHECK (payout_status IN ('none', 'pending', 'paid', 'failed')),
  payout_data JSONB,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create votes table to track individual votes
CREATE TABLE public.votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  voter_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, voter_address)
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Products are viewable by everyone
CREATE POLICY "Products are viewable by everyone" 
ON public.products 
FOR SELECT 
USING (true);

-- Anyone can insert products (public submission)
CREATE POLICY "Anyone can insert products" 
ON public.products 
FOR INSERT 
WITH CHECK (true);

-- Votes are viewable by everyone
CREATE POLICY "Votes are viewable by everyone" 
ON public.votes 
FOR SELECT 
USING (true);

-- Anyone can insert votes (public voting)
CREATE POLICY "Anyone can insert votes" 
ON public.votes 
FOR INSERT 
WITH CHECK (true);

-- Create index for faster vote queries
CREATE INDEX idx_votes_product_id ON public.votes(product_id);
CREATE INDEX idx_votes_voter_address ON public.votes(voter_address);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();