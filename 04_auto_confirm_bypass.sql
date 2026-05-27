-- ==========================================
-- BYPASS EMAIL CONFIRMATION TRIGGER
-- ==========================================
-- This script automatically confirms any new user created,
-- overriding the "Confirm Email" setting in the Supabase Dashboard.

CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS trigger AS $$
BEGIN
  -- Automatically set the email as confirmed right when the user signs up
  NEW.email_confirmed_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove the trigger if it already exists to avoid duplicates
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Attach the trigger to the Supabase authentication table
CREATE TRIGGER on_auth_user_created
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_user();

-- Also confirm any existing users that got stuck in the "unconfirmed" state!
UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;
