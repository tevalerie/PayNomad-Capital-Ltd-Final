-- Create magic_links table
CREATE TABLE IF NOT EXISTS magic_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  token TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS magic_links_email_idx ON magic_links(email);

-- Create index on token for faster lookups
CREATE INDEX IF NOT EXISTS magic_links_token_idx ON magic_links(token);

-- Create index on expires_at for cleanup jobs
CREATE INDEX IF NOT EXISTS magic_links_expires_at_idx ON magic_links(expires_at);

-- Enable Row Level Security
ALTER TABLE magic_links ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting magic links (only service role)
DROP POLICY IF EXISTS "Service role can insert magic links" ON magic_links;
CREATE POLICY "Service role can insert magic links"
  ON magic_links FOR INSERT
  TO service_role
  USING (true);

-- Create policy for reading magic links (only service role)
DROP POLICY IF EXISTS "Service role can read magic links" ON magic_links;
CREATE POLICY "Service role can read magic links"
  ON magic_links FOR SELECT
  TO service_role
  USING (true);