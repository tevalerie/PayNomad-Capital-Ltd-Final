-- Magic Links feature has been deprioritized
-- This migration adds a comment to the verification_tokens table

COMMENT ON TABLE IF EXISTS verification_tokens IS 'This table was used for magic links feature which has been deprioritized';
