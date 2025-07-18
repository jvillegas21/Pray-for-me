-- Enable real-time for encouragements table
-- Run this in your Supabase SQL Editor

-- Enable real-time for the encouragements table
ALTER PUBLICATION supabase_realtime ADD TABLE encouragements;

-- Also enable real-time for prayer_actions table
ALTER PUBLICATION supabase_realtime ADD TABLE prayer_actions;

-- Verify the tables are enabled for real-time
SELECT 
  schemaname,
  tablename,
  pubname
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
  AND tablename IN ('encouragements', 'prayer_actions');

-- If the above doesn't work, try this alternative approach:
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to Database > Replication
-- 3. Make sure "Realtime" is enabled for the encouragements table
-- 4. If not, click "Enable" next to the encouragements table 