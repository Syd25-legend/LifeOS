import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import type { DailyWin } from "../../lib/types";
import { format, isSameDay, startOfWeek, endOfWeek } from "date-fns";
import { Trophy, Plus, CheckCircle2 } from "lucide-react";

const AntiToDoLog: React.FC = () => {
  const [wins, setWins] = useState<DailyWin[]>([]);
  const [newWin, setNewWin] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWins();
  }, []);

  const fetchWins = async () => {
    const { data, error } = await supabase
      .from("daily_wins")
      .select("*")
      .gte("created_at", startOfWeek(new Date()).toISOString())
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching wins:", error);
    else setWins(data || []);
  };

  const addWin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWin.trim()) return;

    setLoading(true);
    const { error } = await supabase
      .from("daily_wins")
      .insert([{ title: newWin }]);
    if (error) console.error("Error adding win:", error);
    else {
      setNewWin("");
      fetchWins();
    }
    setLoading(false);
  };

  const todayWins = wins.filter((w) =>
    isSameDay(new Date(w.created_at), new Date())
  );
  const weeklyWinsCount = wins.length;

  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Wins of the Day
        </h2>
        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
          Weekly Wins: {weeklyWinsCount}
        </span>
      </div>

      <form onSubmit={addWin} className="mb-4 relative">
        <input
          type="text"
          value={newWin}
          onChange={(e) => setNewWin(e.target.value)}
          placeholder="What did you accomplish unexpectedly?"
          className="w-full bg-gray-800 text-white rounded-lg pl-4 pr-10 py-3 focus:ring-2 focus:ring-yellow-500/50 focus:outline-none border border-gray-700 placeholder-gray-500"
        />
        <button
          type="submit"
          disabled={loading || !newWin.trim()}
          className="absolute right-2 top-2 p-1.5 bg-yellow-600 rounded text-white hover:bg-yellow-500 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
        </button>
      </form>

      <div className="space-y-2">
        {todayWins.length === 0 ? (
          <p className="text-gray-500 text-sm italic text-center py-4">
            No wins logged yet today. Celebrate your small victories!
          </p>
        ) : (
          todayWins.map((win) => (
            <div
              key={win.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 animate-in fade-in slide-in-from-bottom-2"
            >
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-gray-200">{win.title}</p>
                <span className="text-xs text-gray-500">
                  {format(new Date(win.created_at), "h:mm a")}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {wins.length > todayWins.length && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Earlier this week
          </h3>
          <div className="space-y-1">
            {wins
              .filter((w) => !isSameDay(new Date(w.created_at), new Date()))
              .slice(0, 3)
              .map((win) => (
                <p
                  key={win.id}
                  className="text-xs text-gray-500 truncate flex items-center gap-2"
                >
                  <span className="w-1 h-1 rounded-full bg-yellow-500/50"></span>
                  {win.title}
                </p>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AntiToDoLog;
