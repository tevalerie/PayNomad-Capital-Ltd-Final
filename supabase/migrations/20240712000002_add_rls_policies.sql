-- Enable RLS on user_registrations table
ALTER TABLE user_registrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$
BEGIN
    -- Check if policy exists before dropping
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_registrations' AND policyname = 'Allow full access to authenticated users'
    ) THEN
        DROP POLICY "Allow full access to authenticated users" ON user_registrations;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_registrations' AND policyname = 'Allow select access to all users'
    ) THEN
        DROP POLICY "Allow select access to all users" ON user_registrations;
    END IF;
END $$;

-- Create policies
CREATE POLICY "Allow full access to authenticated users"
    ON user_registrations
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow select access to all users"
    ON user_registrations
    FOR SELECT
    USING (true);
