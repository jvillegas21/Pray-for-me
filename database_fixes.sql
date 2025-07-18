-- Database Migration to Fix Prayer Requests Table
-- Run this in your Supabase SQL Editor

-- Add missing columns to prayer_requests table
ALTER TABLE prayer_requests 
ADD COLUMN IF NOT EXISTS anonymous BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS first_name_only BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS share_facebook BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS share_x BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS share_instagram BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS bible_study BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS resource_rec BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'answered', 'closed')),
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pray_count INTEGER DEFAULT 0;

-- Update existing records to have the new columns with default values
UPDATE prayer_requests 
SET 
  anonymous = is_anonymous,
  status = CASE WHEN is_answered THEN 'answered' ELSE 'active' END
WHERE anonymous IS NULL;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_prayer_requests_anonymous ON prayer_requests(anonymous);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_status ON prayer_requests(status);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_city ON prayer_requests(city);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_state ON prayer_requests(state);

-- Update RLS policies to include new columns
DROP POLICY IF EXISTS "Users can create prayer requests" ON prayer_requests;
CREATE POLICY "Users can create prayer requests" ON prayer_requests 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add a function to increment view count
CREATE OR REPLACE FUNCTION increment_prayer_view_count(prayer_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE prayer_requests 
  SET view_count = view_count + 1 
  WHERE id = prayer_id;
END;
$$ LANGUAGE plpgsql;

-- Add a function to increment pray count
CREATE OR REPLACE FUNCTION increment_prayer_pray_count(prayer_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE prayer_requests 
  SET pray_count = pray_count + 1 
  WHERE id = prayer_id;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions for the new functions
GRANT EXECUTE ON FUNCTION increment_prayer_view_count(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_prayer_pray_count(UUID) TO anon, authenticated; 