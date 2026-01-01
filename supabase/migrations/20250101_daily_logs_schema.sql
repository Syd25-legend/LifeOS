-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS daily_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  wake_time TIME,
  sleep_time TIME,
  productivity_score NUMERIC,
  notes TEXT
);

-- If the table already exists, ensure these columns exist
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS date DATE DEFAULT CURRENT_DATE;
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS wake_time TIME;
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS sleep_time TIME;
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS productivity_score NUMERIC;
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS notes TEXT;

-- Enable RLS
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist (Drop and recreate to be safe or use IF NOT EXISTS logic)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'daily_logs' AND policyname = 'Users can view their own logs'
    ) THEN
        CREATE POLICY "Users can view their own logs" ON daily_logs
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'daily_logs' AND policyname = 'Users can insert their own logs'
    ) THEN
        CREATE POLICY "Users can insert their own logs" ON daily_logs
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'daily_logs' AND policyname = 'Users can update their own logs'
    ) THEN
        CREATE POLICY "Users can update their own logs" ON daily_logs
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;
