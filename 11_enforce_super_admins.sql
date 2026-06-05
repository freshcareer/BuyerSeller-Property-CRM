-- 1. Remove admin and super_admin privileges from everyone else
UPDATE public.profiles
SET role = 'user', is_super_admin = false
WHERE email NOT IN ('freshcareer4@gmail.com', 'rajeshrshiv@gmail.com');

-- 2. Strictly Enforce the 2 Super Admins
UPDATE public.profiles
SET role = 'super_admin', is_super_admin = true
WHERE email IN ('freshcareer4@gmail.com', 'rajeshrshiv@gmail.com');

-- 3. [OPTIONAL] DELETE ALL OTHER ACCOUNTS FROM THE CRM
-- If you want to permanently remove all other accounts so they can't even login,
-- run this delete statement below. This deletes them from auth.users (which cascades to profiles).
-- 
-- WARNING: Un-commenting the code below will permanently delete data for all other users!
-- 
-- DELETE FROM auth.users 
-- WHERE email NOT IN ('freshcareer4@gmail.com', 'rajeshrshiv@gmail.com');
