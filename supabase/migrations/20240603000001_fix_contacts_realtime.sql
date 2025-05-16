-- Create contacts table if it doesn't exist
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ
);

-- Create userData table if it doesn't exist
CREATE TABLE IF NOT EXISTS userData (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  email TEXT NOT NULL,
  action TEXT NOT NULL,
  action_details JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL
);

-- Set up RLS policies for contacts table
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to contacts
DROP POLICY IF EXISTS "Public read access" ON contacts;
CREATE POLICY "Public read access"
  ON contacts FOR SELECT
  USING (true);

-- Allow authenticated users to update their own contact
DROP POLICY IF EXISTS "Users can update own contact" ON contacts;
CREATE POLICY "Users can update own contact"
  ON contacts FOR UPDATE
  USING (auth.uid()::text = email);

-- Allow public insert access to contacts
DROP POLICY IF EXISTS "Public insert access" ON contacts;
CREATE POLICY "Public insert access"
  ON contacts FOR INSERT
  WITH CHECK (true);

-- Set up RLS policies for userData table
ALTER TABLE userData ENABLE ROW LEVEL SECURITY;

-- Allow public insert access to userData
DROP POLICY IF EXISTS "Public insert access" ON userData;
CREATE POLICY "Public insert access"
  ON userData FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to read their own userData
DROP POLICY IF EXISTS "Users can read own userData" ON userData;
CREATE POLICY "Users can read own userData"
  ON userData FOR SELECT
  USING (auth.uid()::text = email OR auth.uid() = user_id);

-- Note: We're not adding the contacts table to supabase_realtime publication
-- because it's already a member of that publication
