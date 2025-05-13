-- Create contacts table for storing registration information
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create userData table for logging user actions
CREATE TABLE IF NOT EXISTS userData (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  action TEXT NOT NULL,
  action_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Enable row level security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE userData ENABLE ROW LEVEL SECURITY;

-- Create policies for contacts table
DROP POLICY IF EXISTS "Contacts insert policy" ON contacts;
CREATE POLICY "Contacts insert policy"
ON contacts FOR INSERT
TO authenticated, anon
WITH CHECK (true);

DROP POLICY IF EXISTS "Contacts select policy" ON contacts;
CREATE POLICY "Contacts select policy"
ON contacts FOR SELECT
TO authenticated, anon
USING (true);

-- Create policies for userData table
DROP POLICY IF EXISTS "UserData insert policy" ON userData;
CREATE POLICY "UserData insert policy"
ON userData FOR INSERT
TO authenticated, anon
WITH CHECK (true);

DROP POLICY IF EXISTS "UserData select policy" ON userData;
CREATE POLICY "UserData select policy"
ON userData FOR SELECT
TO authenticated, anon
USING (true);

-- Enable realtime for both tables
-- Table is already in the publication, no need to add it again
-- alter publication supabase_realtime add table contacts;
alter publication supabase_realtime add table userData;