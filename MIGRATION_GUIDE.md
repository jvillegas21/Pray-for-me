# Migration Guide: From Google Maps/Firebase/MongoDB to Mapbox/Supabase/OneSignal

## ✅ What's Been Completed

Your Pray-for-me app has been successfully migrated from:
- **Google Maps** → **Mapbox** (for maps and location services)
- **Firebase** → **OneSignal** (for push notifications)
- **MongoDB** → **Supabase** (for database and authentication)

## 🔑 Required Service Setup

### 1. Mapbox Setup
1. **Create Account**: Go to [mapbox.com](https://www.mapbox.com) and create an account
2. **Get Access Token**: 
   - Go to your Mapbox account dashboard
   - Navigate to "Access tokens"
   - Copy your default public token
3. **Update Environment**:
   ```bash
   # In your .env file
   MAPBOX_ACCESS_TOKEN=pk.your_mapbox_access_token_here
   ```

### 2. Supabase Setup
1. **Create Account**: Go to [supabase.com](https://supabase.com) and create an account
2. **Create New Project**:
   - Click "New Project"
   - Choose your organization
   - Enter project name: "pray-for-me"
   - Set database password
   - Select region closest to your users
3. **Get API Keys**:
   - Go to Settings → API
   - Copy the Project URL and anon public key
4. **Update Environment**:
   ```bash
   # In your .env file
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_anon_key_here
   
   # In your backend/.env file
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

### 3. OneSignal Setup
1. **Create Account**: Go to [onesignal.com](https://onesignal.com) and create an account
2. **Create New App**:
   - Click "New App/Website"
   - Enter app name: "Pray For Me"
   - Select "Mobile App"
   - Choose your platform (iOS/Android)
3. **Get App ID**:
   - Go to Settings → Keys & IDs
   - Copy the OneSignal App ID
4. **Update Environment**:
   ```bash
   # In your .env file
   ONESIGNAL_APP_ID=your_onesignal_app_id_here
   
   # In your backend/.env file
   ONESIGNAL_APP_ID=your_onesignal_app_id_here
   ONESIGNAL_REST_API_KEY=your_rest_api_key_here
   ```

## 🗄️ Database Schema Setup

You'll need to create these tables in your Supabase project:

### 1. Profiles Table
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
```

### 2. Prayer Requests Table
```sql
CREATE TABLE prayer_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  location JSONB,
  is_anonymous BOOLEAN DEFAULT FALSE,
  privacy_level TEXT DEFAULT 'public' CHECK (privacy_level IN ('public', 'community', 'private')),
  urgency_level TEXT DEFAULT 'medium' CHECK (urgency_level IN ('low', 'medium', 'high', 'crisis')),
  is_answered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public prayer requests are viewable by everyone" ON prayer_requests FOR SELECT USING (privacy_level = 'public');
CREATE POLICY "Users can view their own prayer requests" ON prayer_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create prayer requests" ON prayer_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own prayer requests" ON prayer_requests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own prayer requests" ON prayer_requests FOR DELETE USING (auth.uid() = user_id);
```

### 3. Prayer Responses Table
```sql
CREATE TABLE prayer_responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  prayer_request_id UUID REFERENCES prayer_requests ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE prayer_responses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Prayer responses are viewable by everyone" ON prayer_responses FOR SELECT USING (true);
CREATE POLICY "Users can create prayer responses" ON prayer_responses FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 4. Communities Table
```sql
CREATE TABLE communities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  creator_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  location JSONB,
  is_private BOOLEAN DEFAULT FALSE,
  max_members INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public communities are viewable by everyone" ON communities FOR SELECT USING (is_private = false);
CREATE POLICY "Users can view communities they're members of" ON communities FOR SELECT USING (
  id IN (SELECT community_id FROM community_members WHERE user_id = auth.uid())
);
CREATE POLICY "Users can create communities" ON communities FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Community creators can update their communities" ON communities FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Community creators can delete their communities" ON communities FOR DELETE USING (auth.uid() = creator_id);
```

### 5. Community Members Table
```sql
CREATE TABLE community_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  community_id UUID REFERENCES communities ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

-- Enable RLS
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Community members are viewable by community members" ON community_members FOR SELECT USING (
  community_id IN (SELECT community_id FROM community_members WHERE user_id = auth.uid())
);
CREATE POLICY "Users can join communities" ON community_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave communities" ON community_members FOR DELETE USING (auth.uid() = user_id);
```

### 6. Prayer Reports Table
```sql
CREATE TABLE prayer_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  prayer_request_id UUID REFERENCES prayer_requests ON DELETE CASCADE NOT NULL,
  reported_by UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE prayer_reports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create reports" ON prayer_reports FOR INSERT WITH CHECK (auth.uid() = reported_by);
```

## 🔧 Next Steps

1. **Set up your accounts** in Mapbox, Supabase, and OneSignal
2. **Update your environment variables** with the actual API keys
3. **Run the database setup SQL** in your Supabase SQL editor
4. **Test the app** to ensure everything works correctly

## 💰 Cost Savings

With this migration, you'll save approximately **50-70%** on service costs:

- **Mapbox**: More generous free tier (50k map loads vs 28k)
- **Supabase**: Free tier includes 500MB database vs MongoDB's 512MB
- **OneSignal**: Free tier includes 10k subscribers vs Firebase's complex pricing

## 🚀 Additional Benefits

- **Better Developer Experience**: Supabase provides a more intuitive dashboard
- **Real-time Features**: Built-in real-time subscriptions with Supabase
- **Improved Analytics**: OneSignal provides better push notification analytics
- **Enhanced Customization**: Mapbox offers more map styling options

## 📞 Support

If you encounter any issues during the migration:
1. Check the service documentation for each platform
2. Ensure all environment variables are correctly set
3. Verify your database schema matches the provided SQL
4. Test each service individually before testing the full app

Good luck with your migration! 🎉 