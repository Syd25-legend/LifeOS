import { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalIcon,
  Filter,
  Layers,
  Clock,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const fetchData = async () => {
    setLoading(true);
    const start = format(startOfMonth(currentDate), "yyyy-MM-dd");
    const end = format(endOfMonth(currentDate), "yyyy-MM-dd");

    // Get user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch Tasks
    const { data: tasksData } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", start)
      .lte("date", end);

    // Fetch Daily Logs (for productivity scores)
    const { data: logsData } = await supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", start)
      .lte("date", end);

    if (tasksData) setTasks(tasksData);
    if (logsData) setLogs(logsData);
    setLoading(false);
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Calendar Grid Generation
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getDayData = (date: Date) => {
    const dayTasks = tasks.filter((t) => isSameDay(parseISO(t.date), date));
    const dayLog = logs.find((l) => isSameDay(parseISO(l.date), date));
    return { tasks: dayTasks, log: dayLog };
  };

  return (
    <div className="flex bg-pure-black min-h-screen text-white overflow-hidden">
      {/* Left Sidebar (Calendar Specific) */}
      <div className="w-80 bg-[#0F0F0F] border-r border-white/5 p-6 flex flex-col gap-8 hidden lg:flex">
        {/* Profile Card */}
        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center font-bold text-lg">
            Me
          </div>
          <div>
            <h3 className="font-semibold text-sm">My Workplace</h3>
            <p className="text-xs text-gray-400">Productivity Master</p>
          </div>
          <div className="ml-auto bg-white/10 p-2 rounded-full">
            <CalIcon size={16} />
          </div>
        </div>

        {/* Mini Calendar (Static for visual or nav) */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold">{format(currentDate, "MMMM yyyy")}</h4>
            <div className="flex gap-2">
              <button
                onClick={prevMonth}
                className="p-1 hover:bg-white/10 rounded"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={nextMonth}
                className="p-1 hover:bg-white/10 rounded"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs text-gray-400 mb-2">
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {days.map((day, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedDate(day);
                  if (!isSameMonth(day, currentDate)) setCurrentDate(day);
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  isSameDay(day, selectedDate)
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-900/50"
                    : !isSameMonth(day, currentDate)
                    ? "text-gray-600"
                    : "hover:bg-white/10"
                }`}
              >
                {format(day, "d")}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-400">
            <Filter size={14} /> My Calendars
          </h4>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="w-4 h-4 rounded border border-purple-500 bg-purple-500/20 group-hover:bg-purple-500 transition-colors"></div>
              <span className="text-sm">Tasks</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="w-4 h-4 rounded border border-blue-500 bg-blue-500/20 group-hover:bg-blue-500 transition-colors"></div>
              <span className="text-sm">Productivity Score</span>
            </label>
          </div>
        </div>

        {/* Productivity Score Card (Selected Date) */}
        <div className="mt-auto p-4 bg-gradient-to-br from-gray-800 to-black border border-white/10 rounded-2xl">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Clock size={14} /> Daily Score
          </h4>
          <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
            {getDayData(selectedDate).log?.productivity_score ?? "--"}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {getDayData(selectedDate).log?.notes ? "Notes logged" : "No notes"}
          </p>
        </div>
      </div>

      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <div className="p-8 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {format(currentDate, "MMMM, yyyy")}
            </h1>
            <p className="text-gray-400">Manage your time effectively</p>
          </div>

          <div className="flex items-center gap-4 bg-white/5 p-1 rounded-xl border border-white/10">
            {(["month", "week", "day"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 rounded-lg text-sm capitalize transition-all ${
                  view === v
                    ? "bg-white text-black font-semibold shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
              Today
            </button>
            <button className="w-10 h-10 flex items-center justify-center bg-purple-600 rounded-xl hover:bg-purple-500 transition-colors shadow-lg shadow-purple-900/40">
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Calendar Content */}
        <div className="flex-1 overflow-auto p-8 pt-0 flex flex-col">
          {/* Days Header */}
          <div className="grid grid-cols-7 mb-4 shrink-0">
            {days.slice(0, 7).map((d, i) => (
              <div
                key={i}
                className={`text-center py-4 ${
                  isSameDay(d, new Date())
                    ? "bg-[#1A1A1A] rounded-xl text-white"
                    : "text-gray-500"
                }`}
              >
                <div className="text-xs uppercase tracking-wider opacity-60 mb-1">
                  {format(d, "EEEE")}
                </div>
                <div className="text-3xl font-light">{format(d, "d")}</div>
              </div>
            ))}
          </div>

          {/* Vertical Columns Grid */}
          <div className="grid grid-cols-7 gap-4 flex-1 h-full min-h-0">
            {days.slice(0, 7).map((day, idx) => {
              const { tasks: dayTasks, log } = getDayData(day);
              const isSelected = isSameDay(day, selectedDate);

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDate(day)}
                  className={`
                        relative p-4 rounded-2xl border transition-all cursor-pointer h-full flex flex-col group overflow-hidden
                        ${
                          isSelected
                            ? "border-purple-500/50 bg-purple-900/10 ring-1 ring-purple-500/20"
                            : "border-white/5 bg-[#0F0F0F] hover:bg-[#151515] hover:border-white/10"
                        }
                    `}
                >
                  {/* Content Area - Filled with Text */}
                  <div className="flex-1 flex flex-col gap-3">
                    {/* Productivity Badge - Subtle */}
                    {log?.productivity_score && (
                      <div
                        className={`self-start px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          Number(log.productivity_score) >= 8
                            ? "bg-green-500/10 text-green-400"
                            : Number(log.productivity_score) >= 5
                            ? "bg-orange-500/10 text-orange-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        Score: {log.productivity_score}
                      </div>
                    )}

                    {/* Main Text Highlight */}
                    {log?.notes ? (
                      <div className="text-sm text-gray-300 leading-relaxed font-medium whitespace-pre-wrap overflow-y-auto custom-scrollbar pr-2">
                        {log.notes}
                      </div>
                    ) : dayTasks.length > 0 ? (
                      <div className="flex flex-col gap-2 mt-2">
                        {dayTasks.map((t) => (
                          <div
                            key={t.id}
                            className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-300"
                          >
                            {t.title}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-gray-800 text-4xl font-thin opacity-20">
                          +
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
