-- Migration: Add avatar_color column to profiles table
-- Run this in your Supabase SQL Editor

-- Add avatar_color column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_color TEXT;

-- Set a default avatar color for existing users (optional)
-- This will give existing users a default color so they don't have null values
UPDATE profiles 
SET avatar_color = '#6366F1' 
WHERE avatar_color IS NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'avatar_color';