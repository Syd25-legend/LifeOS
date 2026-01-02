export interface FocusLog {
  id: string;
  user_id: string;
  focus_score: number; // 1-5
  created_at: string;
}

export interface DailyWin {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  status: 'active' | 'completed' | 'archived' | 'on_hold';
  created_at: string;
  deadline: string | null;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  is_completed: boolean;
  date: string;
  created_at: string;
  // New fields
  energy_level?: 'High' | 'Medium' | 'Low';
  project_id?: string;
  due_date?: string;
}

export interface ProjectHealth {
    projectId: string;
    healthScore: number;
    tasksCompleted: number;
    totalTasks: number;
    overdueTasks: number;
    velocity: number; // tasks/day
}
