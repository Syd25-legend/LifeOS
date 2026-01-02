import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import type { FocusLog } from "../../lib/types";
import { format, getHours, subDays } from "date-fns";

const FocusTracker: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<FocusLog[]>([]);
  const [heatmapData, setHeatmapData] = useState<number[]>(
    new Array(24).fill(0)
  );

  useEffect(() => {
    fetchFocusLogs();
  }, []);

  const fetchFocusLogs = async () => {
    const { data, error } = await supabase
      .from("focus_logs")
      .select("*")
      .gte("created_at", subDays(new Date(), 7).toISOString());

    if (error) console.error("Error fetching focus logs:", error);
    else {
      setLogs(data || []);
      calculateHeatmap(data || []);
    }
  };

  const calculateHeatmap = (data: FocusLog[]) => {
    const hourlyScores: { [hour: number]: number[] } = {};
    for (let i = 0; i < 24; i++) hourlyScores[i] = [];

    data.forEach((log) => {
      const hour = getHours(new Date(log.created_at));
      hourlyScores[hour].push(log.focus_score);
    });

    const averages = new Array(24).fill(0).map((_, i) => {
      const scores = hourlyScores[i];
      if (scores.length === 0) return 0;
      return scores.reduce((a, b) => a + b, 0) / scores.length;
    });
    setHeatmapData(averages);
  };

  const logFocus = async (score: number) => {
    setLoading(true);
    const { error } = await supabase
      .from("focus_logs")
      .insert([{ focus_score: score }]);
    if (error) console.error("Error logging focus:", error);
    else {
      fetchFocusLogs();
    }
    setLoading(false);
  };

  const getHeatmapColor = (score: number) => {
    if (score === 0) return "bg-gray-800"; // No data
    if (score < 2) return "bg-red-900";
    if (score < 3) return "bg-yellow-900";
    if (score < 4) return "bg-green-900";
    return "bg-green-500"; // Peak focus
  };

  return (
    <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
      <h2 className="text-xl font-bold text-gray-100 mb-4">
        🧬 Biological Prime Time
      </h2>

      {/* Input Section */}
      <div className="mb-6">
        <p className="text-gray-400 mb-2">How is your focus right now?</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((score) => (
            <button
              key={score}
              onClick={() => logFocus(score)}
              disabled={loading}
              className={`px-4 py-2 rounded transition-colors ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
              } bg-gray-700 text-white`}
            >
              {score} ⚡
            </button>
          ))}
        </div>
      </div>

      {/* Heatmap Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-300 mb-2">
          7-Day Focus Heatmap
        </h3>
        <div className="grid grid-cols-12 gap-1">
          {heatmapData.map((avgScore, hour) => (
            <div key={hour} className="flex flex-col items-center">
              <div
                className={`w-full h-8 rounded ${getHeatmapColor(avgScore)}`}
                title={`Hour: ${hour}:00, Avg Score: ${avgScore.toFixed(1)}`}
              />
              <span className="text-xs text-gray-500 mt-1">{hour}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs text-gray-500 flex justify-between">
          <span>00:00</span>
          <span>12:00</span>
          <span>23:00</span>
        </div>
      </div>
    </div>
  );
};

export default FocusTracker;
