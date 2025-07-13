# Supabase Setup Guide

## ✅ Current Status
Your app is now configured to use Supabase but needs actual credentials to work properly.

## 📋 Step-by-Step Setup

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account
3. Click "New Project"
4. Choose your organization
5. Enter project name: `pray-for-me`
6. Create a strong database password
7. Select the region closest to you
8. Click "Create new project"

### 2. Get Your Project Credentials
Once your project is created:
1. Go to **Settings** → **API**
2. Copy the **Project URL** (starts with `https://`)
3. Copy the **anon public** key (starts with `eyJ`)

### 3. Update Your Environment Variables
1. Open the `.env` file in your project root
2. Replace the placeholder values:
   ```
   SUPABASE_URL=https://your-actual-project-url.supabase.co
   SUPABASE_ANON_KEY=your_actual_anon_key_here
   ```

### 4. Restart Your App
1. Stop Metro (Ctrl+C or Cmd+C)
2. Run `npx react-native start --reset-cache`
3. Run your iOS/Android app

## 🔧 What's Been Fixed
- ✅ Environment variable support with `react-native-dotenv`
- ✅ Proper Supabase client configuration
- ✅ Helpful error messages when credentials are missing
- ✅ TypeScript support for environment variables

## 🛠️ Current Error Handling
If you haven't configured Supabase yet, you'll see helpful console messages:
- ❌ SUPABASE_URL is not configured!
- ❌ SUPABASE_ANON_KEY is not configured!

## 📱 Next Steps
After setting up Supabase:
1. Create database tables (see `MIGRATION_GUIDE.md`)
2. Set up authentication policies
3. Test login/registration functionality

## 🔍 Troubleshooting
- If you see "supabaseUrl is required" error → Check your .env file
- If environment variables aren't loading → Restart Metro with `--reset-cache`
- If TypeScript errors → The app includes proper type definitions

## 📞 Need Help?
The app includes detailed logging to help you debug any issues. Check the console for specific error messages and setup instructions. 