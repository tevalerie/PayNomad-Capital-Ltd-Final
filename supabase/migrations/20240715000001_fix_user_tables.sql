-- Rename users table to paynomad_users if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
    ALTER TABLE public.users RENAME TO paynomad_users;
  END IF;
END $$;

-- Add verification_token and verified_at columns to user_registrations if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.user_registrations'::regclass AND attname = 'verification_token') THEN
    ALTER TABLE public.user_registrations ADD COLUMN verification_token TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.user_registrations'::regclass AND attname = 'verified_at') THEN
    ALTER TABLE public.user_registrations ADD COLUMN verified_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Update policies for user_registrations
DROP POLICY IF EXISTS "Users can view their own data" ON public.user_registrations;
CREATE POLICY "Users can view their own data" ON public.user_registrations
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own data" ON public.user_registrations;
CREATE POLICY "Users can update their own data" ON public.user_registrations
  FOR UPDATE USING (auth.uid() = user_id);

-- Enable realtime for tables
DO $$ 
BEGIN
  -- Check if user_registrations is already in the publication
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'user_registrations') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_registrations;
  END IF;
  
  -- Check if paynomad_users is already in the publication
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'paynomad_users') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'paynomad_users') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.paynomad_users;
    END IF;
  END IF;
END $$;