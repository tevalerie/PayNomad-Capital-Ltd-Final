-- Add verification_token column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'user_registrations' 
                AND column_name = 'verification_token') THEN
    ALTER TABLE public.user_registrations ADD COLUMN verification_token TEXT;
  END IF;
END $$;

-- Add verified_at column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'user_registrations' 
                AND column_name = 'verified_at') THEN
    ALTER TABLE public.user_registrations ADD COLUMN verified_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Make sure the table has the correct structure
ALTER TABLE IF EXISTS public.user_registrations
  ALTER COLUMN email TYPE TEXT,
  ALTER COLUMN first_name TYPE TEXT,
  ALTER COLUMN last_name TYPE TEXT,
  ALTER COLUMN status TYPE TEXT,
  ALTER COLUMN referral_code TYPE TEXT;

-- Add unique constraint on email if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint 
                WHERE conname = 'user_registrations_email_key' 
                AND conrelid = 'public.user_registrations'::regclass) THEN
    ALTER TABLE public.user_registrations ADD CONSTRAINT user_registrations_email_key UNIQUE (email);
  END IF;
END $$;

-- Enable realtime for this table
alter publication supabase_realtime add table user_registrations;
