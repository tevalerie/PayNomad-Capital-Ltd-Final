-- Create magic_links table for storing tokens and metadata
CREATE TABLE IF NOT EXISTS magic_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT magic_links_email_token_key UNIQUE (email, token)
);

-- Add index for faster token lookups
CREATE INDEX IF NOT EXISTS magic_links_token_idx ON magic_links (token);
CREATE INDEX IF NOT EXISTS magic_links_email_idx ON magic_links (email);

-- Enable row level security
ALTER TABLE magic_links ENABLE ROW LEVEL SECURITY;

-- Add to realtime publication
alter publication supabase_realtime add table magic_links;