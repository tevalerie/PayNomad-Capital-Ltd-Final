-- Drop the migration that's causing issues
DROP FUNCTION IF EXISTS handle_new_user();

-- Ensure we have a clean users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  referral_code TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Make sure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Admin can manage all users" ON public.users;

-- Create simple policies
CREATE POLICY "Users can view their own data"
  ON public.users
  FOR SELECT
  USING (email = current_user);

CREATE POLICY "Users can update their own data"
  ON public.users
  FOR UPDATE
  USING (email = current_user);

CREATE POLICY "Admin can manage all users"
  ON public.users
  USING (auth.role() = 'service_role');

-- Check if the table is already in the realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'users'
  ) THEN
    -- Add to realtime publication if not already added
    ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
  END IF;
END $$;
