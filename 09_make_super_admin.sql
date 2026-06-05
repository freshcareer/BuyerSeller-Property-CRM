-- This script gives Super Admin privileges to your specified accounts
-- and ensures no one else is a super admin.

-- 1. First, remove super admin privileges from everyone
UPDATE public.profiles
SET is_super_admin = false;

-- If you also added a 'role' column later, you can run this:
-- UPDATE public.profiles SET role = 'user' WHERE role = 'super_admin';

-- 2. Grant super admin to only the two requested accounts
UPDATE public.profiles
SET is_super_admin = true
-- If 'role' exists, use: SET is_super_admin = true, role = 'super_admin'
WHERE email IN ('freshcareer4@gmail.com', 'rajeshrshiv@gmail.com');

-- 3. (Optional) If you literally want to DELETE all other accounts from the system,
-- run the following DELETE command. WARNING: This will permanently delete other users 
-- and their associated data!
-- 
-- DELETE FROM auth.users 
-- WHERE email NOT IN ('freshcareer4@gmail.com', 'rajeshrshiv@gmail.com');
