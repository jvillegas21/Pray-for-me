-- Pray For Me Database Setup Script
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Prayer Requests Table
CREATE TABLE IF NOT EXISTS prayer_requests (
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

-- Create policies for prayer_requests
CREATE POLICY "Public prayer requests are viewable by everyone" ON prayer_requests FOR SELECT USING (privacy_level = 'public');
CREATE POLICY "Users can view their own prayer requests" ON prayer_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create prayer requests" ON prayer_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own prayer requests" ON prayer_requests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own prayer requests" ON prayer_requests FOR DELETE USING (auth.uid() = user_id);

-- 3. Prayer Responses Table
CREATE TABLE IF NOT EXISTS prayer_responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  prayer_request_id UUID REFERENCES prayer_requests ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE prayer_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for prayer_responses
CREATE POLICY "Prayer responses are viewable by everyone" ON prayer_responses FOR SELECT USING (true);
CREATE POLICY "Users can create prayer responses" ON prayer_responses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Prayer Reports Table
CREATE TABLE IF NOT EXISTS prayer_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  prayer_request_id UUID REFERENCES prayer_requests ON DELETE CASCADE NOT NULL,
  reported_by UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE prayer_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for prayer_reports
CREATE POLICY "Users can create reports" ON prayer_reports FOR INSERT WITH CHECK (auth.uid() = reported_by);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_prayer_requests_user_id ON prayer_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_privacy_level ON prayer_requests(privacy_level);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_urgency_level ON prayer_requests(urgency_level);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_category ON prayer_requests(category);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_created_at ON prayer_requests(created_at);

CREATE INDEX IF NOT EXISTS idx_prayer_responses_prayer_request_id ON prayer_responses(prayer_request_id);
CREATE INDEX IF NOT EXISTS idx_prayer_responses_user_id ON prayer_responses(user_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prayer_requests_updated_at BEFORE UPDATE ON prayer_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing
INSERT INTO profiles (id, name, email, created_at, updated_at) 
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Test User', 'test@example.com', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO prayer_requests (id, user_id, title, description, category, privacy_level, urgency_level, created_at, updated_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Sample Prayer Request', 'This is a sample prayer request for testing purposes.', 'health', 'public', 'medium', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated; 