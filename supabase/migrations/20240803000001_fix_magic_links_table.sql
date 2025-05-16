-- Check if the table exists before creating it
CREATE TABLE IF NOT EXISTS magic_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS magic_links_email_idx ON magic_links (email);

-- Create index on token for faster verification
CREATE INDEX IF NOT EXISTS magic_links_token_idx ON magic_links (token);

-- Check if the table is already in the publication before adding it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'magic_links'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE magic_links;
  END IF;
END
$$;

-- Ensure RLS is enabled for the table
ALTER TABLE magic_links ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow select access to magic_links" ON magic_links;
DROP POLICY IF EXISTS "Allow insert access to magic_links" ON magic_links;

-- Create policies
CREATE POLICY "Allow select access to magic_links"
  ON magic_links FOR SELECT
  USING (true);

CREATE POLICY "Allow insert access to magic_links"
  ON magic_links FOR INSERT
  WITH CHECK (true);
