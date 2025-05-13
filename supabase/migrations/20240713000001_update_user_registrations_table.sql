-- Add constraints and improve the user_registrations table

-- Add check constraint for referral_code
ALTER TABLE user_registrations
ADD CONSTRAINT check_referral_code_length CHECK (LENGTH(referral_code) <= 20);

-- Ensure updated_at is automatically updated
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_user_registrations_updated_at ON user_registrations;
CREATE TRIGGER set_user_registrations_updated_at
BEFORE UPDATE ON user_registrations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_registrations_email ON user_registrations(email);

-- Add index on verification_token for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_registrations_verification_token ON user_registrations(verification_token);