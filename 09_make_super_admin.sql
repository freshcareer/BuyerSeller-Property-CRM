-- This script gives Super Admin privileges to your account
-- so you have full control over the CRM.

UPDATE public.profiles
SET is_super_admin = true
WHERE email = 'rajeshrshiv@gmail.com' 
   OR email = 'phone_8488075196@user.propconnect.com';
