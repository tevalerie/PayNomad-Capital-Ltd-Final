-- Create contacts table if it doesn't exist
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting contacts (anyone can insert)
DROP POLICY IF EXISTS "Anyone can insert contacts" ON contacts;
CREATE POLICY "Anyone can insert contacts"
ON contacts FOR INSERT
TO public
USING (true);

-- Create policy for admins to view all contacts
DROP POLICY IF EXISTS "Admins can view all contacts" ON contacts;
CREATE POLICY "Admins can view all contacts"
ON contacts FOR SELECT
TO authenticated
USING (auth.role() = 'authenticated');

-- Enable realtime for contacts table
alter publication supabase_realtime add table contacts;
