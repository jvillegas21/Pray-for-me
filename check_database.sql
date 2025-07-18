-- Database Verification Script
-- Run this in your Supabase SQL Editor to check if everything is set up correctly

-- 1. Check if tables exist
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('profiles', 'prayer_requests', 'prayer_responses', 'prayer_reports') 
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'prayer_requests', 'prayer_responses', 'prayer_reports');

-- 2. Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'prayer_requests', 'prayer_responses', 'prayer_reports');

-- 3. Check RLS policies
SELECT 
  tablename,
  policyname,
  permissive,
  cmd,
  CASE 
    WHEN cmd = 'SELECT' THEN '✅ SELECT Policy'
    WHEN cmd = 'INSERT' THEN '✅ INSERT Policy'
    WHEN cmd = 'UPDATE' THEN '✅ UPDATE Policy'
    WHEN cmd = 'DELETE' THEN '✅ DELETE Policy'
    ELSE '❌ Unknown Policy'
  END as policy_status
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'prayer_requests', 'prayer_responses', 'prayer_reports')
ORDER BY tablename, cmd;

-- 4. Check if required columns exist in prayer_requests
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  CASE 
    WHEN column_name IN ('id', 'user_id', 'title', 'description', 'category', 'status', 'tags', 'expires_at') 
    THEN '✅ Required Column'
    ELSE 'ℹ️ Optional Column'
  END as column_status
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'prayer_requests'
ORDER BY ordinal_position;

-- 5. Check if triggers exist
SELECT 
  trigger_name,
  event_manipulation,
  action_statement,
  CASE 
    WHEN trigger_name LIKE '%updated_at%' THEN '✅ Auto-update Trigger'
    WHEN trigger_name LIKE '%new_user%' THEN '✅ Profile Creation Trigger'
    ELSE 'ℹ️ Other Trigger'
  END as trigger_status
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY trigger_name;

-- 6. Check if functions exist
SELECT 
  routine_name,
  routine_type,
  CASE 
    WHEN routine_name = 'update_updated_at_column' THEN '✅ Auto-update Function'
    WHEN routine_name = 'handle_new_user' THEN '✅ Profile Creation Function'
    WHEN routine_name = 'ensure_profile_exists' THEN '✅ Profile Check Function'
    ELSE 'ℹ️ Other Function'
  END as function_status
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN ('update_updated_at_column', 'handle_new_user', 'ensure_profile_exists');

-- 7. Check sample data
SELECT 
  'profiles' as table_name,
  COUNT(*) as record_count
FROM profiles
UNION ALL
SELECT 
  'prayer_requests' as table_name,
  COUNT(*) as record_count
FROM prayer_requests
UNION ALL
SELECT 
  'prayer_responses' as table_name,
  COUNT(*) as record_count
FROM prayer_responses;

-- 8. Test profile creation (this will fail if RLS is blocking it)
-- Uncomment the line below to test profile creation
-- INSERT INTO profiles (id, name, email) VALUES (gen_random_uuid(), 'Test User', 'test@example.com') ON CONFLICT DO NOTHING; 