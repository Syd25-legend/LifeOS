import { useState, useEffect } from "react";
import { MoreHorizontal, User, Zap, Trophy } from "lucide-react";
import { supabase } from "../lib/supabase";
import HabitHeatmap from "../components/HabitHeatmap";
import FocusTracker from "../components/bpt/FocusTracker";
import ProjectHealthCard from "../components/projects/ProjectHealth";
import AntiToDoLog from "../components/wins/AntiToDoLog";

const Dashboard = () => {
  const [userEmail, setUserEmail] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<any[]>([]);

  // New Stats
  const [monthlyCompletion, setMonthlyCompletion] = useState(0);
  const [correlationData, setCorrelationData] = useState({
    diff: 0,
    goodDaysAvg: 0,
    badDaysAvg: 0,
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserEmail(data.user.email || "");
        setUserId(data.user.id);
        fetchData(data.user.id);
      }
    });
  }, []);

  const fetchData = async (uid: string) => {
    // 1. Fetch Daily Analysis (Timeline + Deep Work Correlation)
    const { data: analysis } = await supabase
      .from("daily_logs")
      .select("date, productivity_score, deep_work_hours")
      .eq("user_id", uid)
      .order("date", { ascending: false })
      .limit(60);

    const { data: logs } = await supabase
      .from("habit_logs")
      .select("date")
      .eq("user_id", uid);

    if (analysis && logs) {
      // --- Analysis Timeline ---
      const formattedAnalysis = analysis.slice(0, 30).map((entry: any) => ({
        date: new Date(entry.date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
        }),
        score: entry.productivity_score * 10, // Scale 1-10 to 10-100
        color:
          entry.productivity_score >= 8
            ? "#a3e635"
            : entry.productivity_score >= 5
            ? "#fb923c"
            : "#ffffff",
        summary: `Deep Work: ${entry.deep_work_hours}h`,
      }));
      setAnalysisData(formattedAnalysis);

      // --- Correlation Logic ---
      const logsByDate: Record<string, number> = {};
      logs.forEach((l) => {
        logsByDate[l.date] = (logsByDate[l.date] || 0) + 1;
      });

      let goodDaysWork = 0,
        goodDaysCount = 0;
      let badDaysWork = 0,
        badDaysCount = 0;

      analysis.forEach((day) => {
        const dateStr = day.date;
        const habitCount = logsByDate[dateStr] || 0;
        const work = day.deep_work_hours || 0;

        if (habitCount >= 3) {
          goodDaysWork += work;
          goodDaysCount++;
        } else {
          badDaysWork += work;
          badDaysCount++;
        }
      });

      const avgGood = goodDaysCount ? goodDaysWork / goodDaysCount : 0;
      const avgBad = badDaysCount ? badDaysWork / badDaysCount : 0;
      setCorrelationData({
        diff: parseFloat((avgGood - avgBad).toFixed(1)),
        goodDaysAvg: parseFloat(avgGood.toFixed(1)),
        badDaysAvg: parseFloat(avgBad.toFixed(1)),
      });

      // --- Monthly Completion ---
      const startOfMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      )
        .toISOString()
        .split("T")[0];
      const logsThisMonth = logs.filter((l) => l.date >= startOfMonth).length;
      const daysPassed = new Date().getDate();
      const estimatedTotal = daysPassed * 4; // Assuming 4 habits/day
      setMonthlyCompletion(
        Math.min(100, Math.round((logsThisMonth / estimatedTotal) * 100))
      );
    }
  };

  return (
    <div className="h-screen bg-black text-white p-6 overflow-y-auto font-sans flex flex-col custom-scrollbar pb-40">
      {/* Top Bar - Compact */}
      <header className="flex justify-end items-center mb-4">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="w-8 h-8 bg-[#2a2a2a] rounded-full overflow-hidden flex items-center justify-center border border-white/10 cursor-pointer">
              <User size={16} className="text-gray-400" />
            </div>
            <div className="absolute right-0 top-full mt-2 px-3 py-1 bg-[#1C1C1C] border border-white/10 rounded text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              {userEmail}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-header font-bold tracking-tight uppercase">
          DASHBOARD
        </h1>
      </div>

      <div className="grid grid-cols-12 gap-6 flex-1 h-[calc(100%-80px)]">
        {/* Left Column (Widgets) */}
        <div className="col-span-12 lg:col-span-7 grid grid-cols-2 gap-6 content-start">
          {/* New Habit Heatmap (Full Width) */}
          <div className="col-span-2 bg-[#121212] rounded-3xl p-5 border border-[#1f1f1f]">
            {userId && <HabitHeatmap userId={userId} />}
          </div>

          {/* Deep Work Correlation Card */}
          <div className="col-span-1 bg-[#121212] rounded-3xl p-5 border border-[#1f1f1f] flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <h3 className="text-gray-400 font-medium uppercase text-xs tracking-wider flex items-center gap-2">
                <Zap size={14} className="text-yellow-400" /> IMPACT
              </h3>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-header font-bold text-white mb-1">
                +{correlationData.diff}h
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                extra Deep Work on days you hit your habit goals.
              </p>
            </div>
            <div className="mt-4 flex gap-2 text-[10px] text-gray-500 font-mono">
              <span className="text-green-400">
                High: {correlationData.goodDaysAvg}h
              </span>
              <span>vs</span>
              <span className="text-orange-400">
                Low: {correlationData.badDaysAvg}h
              </span>
            </div>
          </div>

          {/* Monthly Completion Card */}
          <div className="col-span-1 bg-[#121212] rounded-3xl p-5 border border-[#1f1f1f] flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <h3 className="text-gray-400 font-medium uppercase text-xs tracking-wider flex items-center gap-2">
                <Trophy size={14} className="text-purple-400" /> MONTHLY
              </h3>
            </div>
            <div className="mt-4 relative">
              <div className="text-4xl font-header font-bold text-white mb-1">
                {monthlyCompletion}%
              </div>
              <p className="text-gray-400 text-xs">Consistency Score</p>
            </div>
            <div className="mt-4 w-full bg-white/10 rounded-full h-1.5">
              <div
                className="bg-purple-500 h-1.5 rounded-full"
                style={{ width: `${monthlyCompletion}%` }}
              ></div>
            </div>
          </div>

          {/* Project Health Dashboard (Replaces Intensity) */}
          <div className="col-span-2">
            <ProjectHealthCard />
          </div>

          {/* Biological Prime Time Tracker */}
          <div className="col-span-2">
            <FocusTracker />
          </div>

          {/* Anti-To-Do List */}
          <div className="col-span-2">
            <AntiToDoLog />
          </div>
        </div>

        {/* Right Column (Analysis Timeline) */}
        <div className="col-span-12 lg:col-span-5 bg-[#121212] rounded-3xl p-8 border border-[#1f1f1f] h-full flex flex-col">
          <div className="flex justify-between items-start mb-8">
            <h3 className="text-gray-400 font-medium uppercase text-xs tracking-wider">
              RECENT LOGS
            </h3>
            <MoreHorizontal
              size={20}
              className="text-gray-500 cursor-pointer"
            />
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {analysisData.length > 0 ? (
              analysisData.map((day, i) => (
                <div
                  key={i}
                  className="group relative flex items-center gap-4 cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-colors"
                  onClick={() => alert(day.summary || "No summary available.")}
                >
                  <div className="w-12 text-sm font-medium text-gray-400">
                    {day.date}
                  </div>
                  <div className="flex-1 h-12 bg-[#1C1C1C] rounded-full relative overflow-hidden flex items-center px-4">
                    <div
                      className="absolute left-0 top-0 bottom-0 opacity-20"
                      style={{
                        width: `${day.score}%`,
                        backgroundColor: day.color,
                      }}
                    ></div>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black z-10"
                      style={{ backgroundColor: day.color }}
                    >
                      {day.score / 10}
                    </div>
                    <div className="ml-4 text-xs text-gray-400 z-10">
                      {day.summary}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 mt-10">
                No logs found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
