-- Fix userData table structure
ALTER TABLE IF EXISTS userData
ADD COLUMN IF NOT EXISTS user_id UUID;

-- Ensure the userData table has proper indexes
CREATE INDEX IF NOT EXISTS idx_userData_email ON userData(email);
CREATE INDEX IF NOT EXISTS idx_userData_user_id ON userData(user_id);

-- Update RLS policies for userData table
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
