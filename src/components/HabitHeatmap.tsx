import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { format, subDays, eachDayOfInterval, isSameDay } from "date-fns";

interface HabitHeatmapProps {
  userId: string;
}

const HabitHeatmap = ({ userId }: HabitHeatmapProps) => {
  const [days, setDays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      const today = new Date();
      const startDate = subDays(today, 29); // Last 30 days

      // 1. Fetch all active habits to know the denominator
      const { data: habits } = await supabase
        .from("habits")
        .select("id")
        .eq("user_id", userId)
        .eq("active", true);

      const totalHabits = habits?.length || 0;

      // 2. Fetch habit logs for the period
      const { data: logs } = await supabase
        .from("habit_logs")
        .select("date, habit_id")
        .eq("user_id", userId)
        .gte("date", format(startDate, "yyyy-MM-dd"))
        .lte("date", format(today, "yyyy-MM-dd"));

      // 3. Process data
      const interval = eachDayOfInterval({ start: startDate, end: today });

      const heatmapData = interval.map((date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        const logsForDay = logs?.filter((l) => l.date === dateStr);
        const completedCount = logsForDay?.length || 0;

        // Avoid division by zero
        const percentage =
          totalHabits > 0 ? (completedCount / totalHabits) * 100 : 0;

        return {
          date: date,
          dateStr: format(date, "dd MMM"),
          percentage: percentage,
          isSuccess: percentage >= 80,
          count: completedCount,
          total: totalHabits,
        };
      });

      setDays(heatmapData);
    } catch (error) {
      console.error("Error fetching heatmap data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <div className="h-40 animate-pulse bg-white/5 rounded-2xl" />;

  return (
    <div className="w-full">
      <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">
        30-Day Streak View
      </h4>
      <div className="grid grid-cols-10 gap-2">
        {days.map((day, idx) => (
          <div
            key={idx}
            className="aspect-square rounded-md relative group cursor-pointer transition-all hover:scale-110"
            style={{
              backgroundColor: day.isSuccess
                ? `rgba(163, 230, 53, ${0.4 + day.percentage / 200})` // Green intensity
                : day.percentage > 0
                ? `rgba(251, 146, 60, ${0.3 + day.percentage / 200})` // Orange for partial
                : "rgba(255, 255, 255, 0.05)", // Empty
            }}
          >
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-black border border-white/20 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
              <div className="font-bold">{day.dateStr}</div>
              <div>
                {day.count}/{day.total} Habits
              </div>
              <div>{Math.round(day.percentage)}%</div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center mt-4 text-[10px] text-gray-500 font-mono">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-white/5"></div> 0%
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-orange-400/50"></div> 1-79%
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[#a3e635]"></div> 80%+
        </div>
      </div>
    </div>
  );
};

export default HabitHeatmap;
