# Supabase Setup Guide

## Initial Setup

1. **Create a Supabase Project**
   - Go to [https://supabase.com](https://supabase.com)
   - Create a new project
   - Note your Project URL and anon key

2. **Configure Environment Variables**
   - Create a `.env` file in your project root
   - Add your Supabase credentials:
   ```
   SUPABASE_URL=your_project_url_here
   SUPABASE_ANON_KEY=your_anon_key_here
   ```

3. **Run Database Setup**
   - Go to your Supabase project SQL Editor
   - Run the `database_setup.sql` script first
   - Then run the `database_fixes.sql` script to fix any issues

## Database Fixes

If you encounter these errors:
- `"new row violates row-level security policy for table \"profiles\""`
- `"column prayer_requests.status does not exist"`

Run the `database_fixes.sql` script in your Supabase SQL Editor.

## Troubleshooting

### Common Issues

1. **Profile Creation Error During Login**
   - The RLS policies have been updated to allow profile creation
   - A trigger automatically creates profiles for new users
   - Run `database_fixes.sql` to fix existing issues

2. **Missing Columns Error**
   - The `prayer_requests` table now includes `status`, `tags`, and `expires_at` columns
   - Run `database_fixes.sql` to add missing columns

3. **Environment Variables Not Working**
   - Ensure your `.env` file is in the project root
   - Restart Metro bundler after changing environment variables
   - Check that the variables are properly loaded in the app

### Verification Steps

1. **Check Database Tables**
   ```sql
   -- Verify tables exist
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_name IN ('profiles', 'prayer_requests', 'prayer_responses');
   ```

2. **Check RLS Policies**
   ```sql
   -- Verify RLS policies
   SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
   FROM pg_policies 
   WHERE tablename IN ('profiles', 'prayer_requests');
   ```

3. **Test Profile Creation**
   ```sql
   -- Test profile creation (run as authenticated user)
   INSERT INTO profiles (id, name, email) 
   VALUES (gen_random_uuid(), 'Test User', 'test@example.com');
   ```

## API Endpoints

The app uses these Supabase tables:
- `profiles` - User profiles
- `prayer_requests` - Prayer requests with status, tags, and expiration
- `prayer_responses` - Responses to prayer requests
- `prayer_reports` - Reports for inappropriate content

## Security

- Row Level Security (RLS) is enabled on all tables
- Users can only access their own data and public content
- Anonymous users have limited access
- Authenticated users can view public profiles and prayer requests 
