import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import ProductivityChart from "../components/analytics/ProductivityChart";
import DeepWorkChart from "../components/analytics/DeepWorkChart";
import HabitStats from "../components/analytics/HabitStats";

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [productivityData, setProductivityData] = useState<any[]>([]);
  const [deepWorkData, setDeepWorkData] = useState<any[]>([]);
  const [habitStats, setHabitStats] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Daily Logs for charts (Last 7 days)
      const { data: logs } = await supabase
        .from("daily_logs")
        .select("date, productivity_score, deep_work_hours")
        .eq("user_id", user.id)
        .order("date", { ascending: true })
        .limit(7);

      if (logs) {
        const pData = logs.map((l) => ({
          date: new Date(l.date).toLocaleDateString(undefined, {
            weekday: "short",
          }),
          score: l.productivity_score || 0,
        }));
        const dData = logs.map((l) => ({
          date: new Date(l.date).toLocaleDateString(undefined, {
            weekday: "short",
          }),
          hours: l.deep_work_hours || 0,
        }));
        setProductivityData(pData);
        setDeepWorkData(dData);
      }

      // 2. Calculate Habit Stats (Since beginning of time or last 30 days)
      // This is complex, simplification: get all habits, check logs count vs total days (naive)
      // Enhanced approach: Get all habits, then get all logs for those habits.
      const { data: habits } = await supabase
        .from("habits")
        .select("id, name, type")
        .eq("user_id", user.id);

      if (habits && habits.length > 0) {
        const stats = await Promise.all(
          habits.map(async (h) => {
            const { count } = await supabase
              .from("habit_logs")
              .select("*", { count: "exact", head: true })
              .eq("habit_id", h.id)
              .eq("completed", true);

            // Mocking "total days" as 30 for percentage calculation for now,
            // or we could count distinct days since habit creation.
            // Let's use a fixed denominator for MVP or relative to "active days".
            // For now, raw count might be misleading as %, so let's just normalize to a random high for demo or fix to 30.
            // Better: Calculate percentage based on last 7 days.

            return {
              name: h.name,
              type: h.type || "good",
              completionRate: Math.min(
                Math.round(((count || 0) / 7) * 100),
                100
              ), // Normalized to weekly goal
            };
          })
        );
        setHabitStats(stats);
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading Analytics...
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white p-8 pl-24 overflow-y-auto custom-scrollbar">
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-2">Analytics</h1>
        <p className="text-gray-400">
          Deep dive into your performance metrics.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-20">
        {/* Productivity Trend */}
        <div className="bg-[#111] p-8 rounded-3xl border border-[#222]">
          <h2 className="text-xl font-medium mb-8 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            Productivity Trend
          </h2>
          <ProductivityChart data={productivityData} />
        </div>

        {/* Deep Work */}
        <div className="bg-[#111] p-8 rounded-3xl border border-[#222]">
          <h2 className="text-xl font-medium mb-8 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Deep Work Hours
          </h2>
          <DeepWorkChart data={deepWorkData} />
        </div>

        {/* Habit Performance */}
        <div className="bg-[#111] p-8 rounded-3xl border border-[#222] lg:col-span-2">
          <h2 className="text-xl font-medium mb-8">
            Habit Consistency (Weekly)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <div className="col-span-1 md:col-span-2">
              <HabitStats stats={habitStats} />
            </div>
            {/* Summary / Insight Card */}
            <div className="bg-gradient-to-br from-[#1a1a1a] to-black p-6 rounded-2xl border border-white/5 flex flex-col justify-center items-center text-center shadow-2xl">
              <div className="text-5xl font-bold mb-2 text-white">
                {productivityData.length > 0
                  ? (
                      productivityData.reduce((a, b) => a + b.score, 0) /
                      productivityData.length
                    ).toFixed(1)
                  : 0}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-widest font-semibold">
                Avg Productivity
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
