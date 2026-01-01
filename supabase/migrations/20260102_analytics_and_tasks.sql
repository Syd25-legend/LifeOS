-- Create tasks table for customizable checklists
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own tasks" ON tasks
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Add title to log_entries if it doesn't exist
-- We use a DO block to check for existence easily or just try adding it.
ALTER TABLE log_entries ADD COLUMN IF NOT EXISTS title TEXT;
