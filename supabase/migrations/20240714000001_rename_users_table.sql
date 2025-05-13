-- Rename users table to paynomad_users to avoid conflicts with auth.users
ALTER TABLE IF EXISTS public.users RENAME TO paynomad_users;

-- Update any references in existing policies
DROP POLICY IF EXISTS "Public access" ON public.paynomad_users;
CREATE POLICY "Public access"
ON public.paynomad_users FOR SELECT
USING (true);

-- Enable realtime for the renamed table
alter publication supabase_realtime add table paynomad_users;
