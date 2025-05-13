-- Create user_registrations table
CREATE TABLE IF NOT EXISTS user_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  verification_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE user_registrations ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Allow service role full access" ON user_registrations;
CREATE POLICY "Allow service role full access"
ON user_registrations
USING ((auth.jwt() ->> 'role') = 'service_role');

-- Enable realtime - using IF NOT EXISTS to prevent errors if already added
DO $$
BEGIN
    -- Check if the table is already part of the publication
    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND tablename = 'user_registrations'
    ) THEN
        -- Only add if not already a member
        ALTER PUBLICATION supabase_realtime ADD TABLE user_registrations;
    END IF;
END $$;