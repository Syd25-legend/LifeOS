import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import type { Project, ProjectHealth } from "../../lib/types";
import { BarChart, Activity, AlertTriangle, CheckCircle } from "lucide-react";

const ProjectHealthCard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [healthStats, setHealthStats] = useState<{
    [key: string]: ProjectHealth;
  }>({});

  useEffect(() => {
    fetchProjectsAndStats();
  }, []);

  const fetchProjectsAndStats = async () => {
    // Fetch projects
    const { data: projectsData, error: projectsError } = await supabase
      .from("projects")
      .select("*")
      .eq("status", "active");

    if (projectsError) {
      console.error("Error fetching projects:", projectsError);
      return;
    }

    setProjects(projectsData || []);

    if (projectsData && projectsData.length > 0) {
      const stats: { [key: string]: ProjectHealth } = {};

      for (const project of projectsData) {
        // Fetch tasks for each project
        const { data: tasks } = await supabase
          .from("tasks")
          .select("*")
          .eq("project_id", project.id);

        if (tasks) {
          const totalTasks = tasks.length;
          const completedTasks = tasks.filter((t) => t.is_completed).length;
          const overdueTasks = tasks.filter(
            (t) =>
              !t.is_completed && t.due_date && new Date(t.due_date) < new Date()
          ).length;

          // Simple Health Algo:
          // Base health = Completion %
          // Penalty = Overdue tasks (e.g., -10% per overdue task)
          let healthScore =
            totalTasks === 0 ? 100 : (completedTasks / totalTasks) * 100;
          healthScore -= overdueTasks * 10;
          if (healthScore < 0) healthScore = 0;

          // Velocity: Tasks completed in last 7 days vs previous 7 days (mock for now or complex query)
          // For MVP simplicity, just count completed tasks today as velocity
          const velocity = tasks.filter(
            (t) =>
              t.is_completed &&
              new Date(t.created_at) > new Date(Date.now() - 86400000)
          ).length;

          stats[project.id] = {
            projectId: project.id,
            healthScore,
            tasksCompleted: completedTasks,
            totalTasks,
            overdueTasks,
            velocity,
          };
        }
      }
      setHealthStats(stats);
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80)
      return "text-green-500 bg-green-500/10 border-green-500/20";
    if (score >= 50)
      return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
    return "text-red-500 bg-red-500/10 border-red-500/20";
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-blue-500" />
        Project Health
      </h2>

      <div className="space-y-4">
        {projects.map((project) => {
          const stats = healthStats[project.id] || {
            healthScore: 100,
            velocity: 0,
            overdueTasks: 0,
          };

          return (
            <div
              key={project.id}
              className="p-4 rounded-lg bg-gray-800/50 border border-gray-700/50"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-200">
                    {project.name}
                  </h3>
                  <p className="text-xs text-gray-500">{project.description}</p>
                </div>
                <div
                  className={`px-2 py-1 rounded text-xs font-bold border ${getHealthColor(
                    stats.healthScore
                  )}`}
                >
                  Health: {Math.round(stats.healthScore)}%
                </div>
              </div>

              {/* Health Bar */}
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full transition-all duration-500 ${getProgressBarColor(
                    stats.healthScore
                  )}`}
                  style={{ width: `${stats.healthScore}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  {stats.tasksCompleted}/{stats.totalTasks} Done
                </span>
                <span className="flex items-center gap-1">
                  <BarChart className="w-3 h-3 text-blue-500" />
                  Velocity: {stats.velocity}/day
                </span>
                {stats.overdueTasks > 0 && (
                  <span className="flex items-center gap-1 text-red-400">
                    <AlertTriangle className="w-3 h-3" />
                    {stats.overdueTasks} Overdue
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {projects.length === 0 && (
          <div className="text-center py-6 text-gray-500 text-sm">
            No active projects found.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectHealthCard;
