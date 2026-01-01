-- Create task_lists table to group tasks into "widgets"
CREATE TABLE IF NOT EXISTS task_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Untitled List',
  date DATE DEFAULT CURRENT_DATE, -- Optional: if lists are daily specific
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add list_id to tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS list_id UUID REFERENCES task_lists(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE task_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own task lists" ON task_lists
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Optional: Seed a default "Today's Tasks" list for existing tasks if desired, 
-- but for now we let existing tasks exist without a list (or treat null list_id as "General")
