-- Create table for storing Circle user tokens
CREATE TABLE IF NOT EXISTS public.circle_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  user_token TEXT NOT NULL,
  wallet_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.circle_users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to manage all records
CREATE POLICY "Service role can manage circle users"
ON public.circle_users
FOR ALL
USING (true)
WITH CHECK (true);

-- Create index on user_id for faster lookups
CREATE INDEX idx_circle_users_user_id ON public.circle_users(user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_circle_users_updated_at
BEFORE UPDATE ON public.circle_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();