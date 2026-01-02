-- Migration: 20260103_advanced_modules
-- Description: Schema updates for Biological Prime Time, Energy Scheduling, Anti-To-Do, and Project Health

-- 1. Biological Prime Time (BPT)
CREATE TABLE IF NOT EXISTS focus_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  focus_score INTEGER CHECK (focus_score BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for focus_logs
ALTER TABLE focus_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own focus logs" ON focus_logs;
CREATE POLICY "Users can manage their own focus logs" ON focus_logs
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- 2. Anti-To-Do List (Reflection Log)
CREATE TABLE IF NOT EXISTS daily_wins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for daily_wins
ALTER TABLE daily_wins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own daily wins" ON daily_wins;
CREATE POLICY "Users can manage their own daily wins" ON daily_wins
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- 3. Project Health Dashboard
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived', 'on_hold')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deadline TIMESTAMPTZ
);

-- Enable RLS for projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own projects" ON projects;
CREATE POLICY "Users can manage their own projects" ON projects
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- 4. Energy-Based Task Scheduling & Project Link
-- Add energy_level and project_id to tasks table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'energy_level') THEN
        ALTER TABLE tasks ADD COLUMN energy_level TEXT CHECK (energy_level IN ('High', 'Medium', 'Low'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'project_id') THEN
        ALTER TABLE tasks ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
    END IF;
    
    -- Also add due_date if not exists (helpful for health calculation)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'due_date') THEN
         ALTER TABLE tasks ADD COLUMN due_date TIMESTAMPTZ;
    END IF;
END $$;
