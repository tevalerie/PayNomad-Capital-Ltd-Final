-- Drop existing RLS policies for contacts table
DROP POLICY IF EXISTS "Allow anon to insert into contacts" ON "public"."contacts";
DROP POLICY IF EXISTS "Users can update their own data" ON "public"."contacts";
DROP POLICY IF EXISTS "Allow public read access" ON "public"."contacts";

-- Create new RLS policies with proper permissions
CREATE POLICY "Allow anon to insert into contacts"
ON "public"."contacts"
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Users can update their own data"
ON "public"."contacts"
FOR UPDATE
TO authenticated
USING (email = auth.email());

CREATE POLICY "Allow public read access"
ON "public"."contacts"
FOR SELECT
TO anon, authenticated
USING (true);

-- Make sure realtime is enabled for contacts table
alter publication supabase_realtime add table contacts;
