import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Plus, X, List, Type } from "lucide-react";
import TaskCard from "../components/daily/TaskCard";
import NoteCard from "../components/daily/NoteCard";

const DailyLog = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [taskLists, setTaskLists] = useState<any[]>([]);
  const [logEntries, setLogEntries] = useState<any[]>([]); // "Note Cards"
  const [loading, setLoading] = useState(true);
  const [showAddMenu, setShowAddMenu] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];

    // 1. Fetch Task Lists (Widgets) - Optional: filter by date if they are daily?
    // For now, let's just fetch all created today OR generic ones.
    // Plan: Fetch lists created today.
    const { data: lists } = await supabase
      .from("task_lists")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .order("created_at", { ascending: true });

    if (lists) setTaskLists(lists);

    // 2. Fetch Tasks (All for today)
    const { data: t } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .order("created_at", { ascending: true });

    if (t) setTasks(t);

    // 3. Fetch Log Entries (Notes)
    const { data: l } = await supabase
      .from("log_entries")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", `${today}T00:00:00`)
      .order("created_at", { ascending: false });

    if (l) setLogEntries(l);

    setLoading(false);
  };

  const handleAddWidget = async (type: "checklist" | "note") => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];

    if (type === "checklist") {
      const { data } = await supabase
        .from("task_lists")
        .insert({
          user_id: user.id,
          title: "New Checklist",
          date: today,
        })
        .select()
        .single();
      if (data) setTaskLists([...taskLists, data]);
    } else if (type === "note") {
      // Create an empty note entry immediately to "place" the widget
      const { data } = await supabase
        .from("log_entries")
        .insert({
          user_id: user.id,
          content: "",
          title: "",
        })
        .select()
        .single();
      if (data) setLogEntries([data, ...logEntries]);
    }
    setShowAddMenu(false);
  };

  // --- Task Logic ---

  const handleAddTask = async (title: string, listId?: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("tasks")
      .insert({
        user_id: user.id,
        title: title,
        date: new Date().toISOString().split("T")[0],
        list_id: listId || null,
      })
      .select()
      .single();

    if (data) setTasks([...tasks, data]);
  };

  const handleToggleTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const newStatus = !task.is_completed;
    setTasks(
      tasks.map((t) =>
        t.id === taskId ? { ...t, is_completed: newStatus } : t
      )
    );
    await supabase
      .from("tasks")
      .update({ is_completed: newStatus })
      .eq("id", taskId);
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
    await supabase.from("tasks").delete().eq("id", taskId);
  };

  // --- List/Widget Logic ---

  const handleRenameList = async (listId: string, newTitle: string) => {
    setTaskLists(
      taskLists.map((l) => (l.id === listId ? { ...l, title: newTitle } : l))
    );
    await supabase
      .from("task_lists")
      .update({ title: newTitle })
      .eq("id", listId);
  };

  const handleDeleteList = async (listId: string) => {
    if (!confirm("Delete this checklist and all its tasks?")) return;
    setTaskLists(taskLists.filter((l) => l.id !== listId));
    await supabase.from("task_lists").delete().eq("id", listId);
    // Tasks cascade delete automatically via DB constraint
    setTasks(tasks.filter((t) => t.list_id !== listId));
  };

  // --- Note Logic ---

  const handleSaveNote = async (
    title: string,
    content: string,
    id?: string
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (id) {
      // Update existing
      await supabase
        .from("log_entries")
        .update({ title, content })
        .eq("id", id);
      setLogEntries(
        logEntries.map((l) => (l.id === id ? { ...l, title, content } : l))
      );
    } else {
      // Insert new (Fallback if used via main creator)
      const { data } = await supabase
        .from("log_entries")
        .insert({
          user_id: user.id,
          content,
          title,
        })
        .select()
        .single();
      if (data) setLogEntries([data, ...logEntries]);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm("Delete this note?")) return;
    setLogEntries(logEntries.filter((l) => l.id !== id));
    await supabase.from("log_entries").delete().eq("id", id);
  };

  return (
    <div className="min-h-screen bg-pure-black text-white p-8 pl-24 overflow-y-auto custom-scrollbar">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-1 tracking-tight">Daily Hub</h1>
          <p className="text-gray-500">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </header>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
        {/* 1. Main Task List (Default 'Today's Tasks' or Uncategorized) */}
        <div className="col-span-1 md:col-span-1 row-span-2 min-h-[400px]">
          <TaskCard
            title="Today's Tasks"
            tasks={tasks.filter((t) => !t.list_id)}
            onAdd={(title) => handleAddTask(title)} // Main list has undefined listId
            onToggle={handleToggleTask}
            onDelete={handleDeleteTask}
          />
        </div>

        {/* 2. Dynamic Task Lists */}
        {taskLists.map((list) => (
          <div key={list.id} className="col-span-1 row-span-2 min-h-[400px]">
            <TaskCard
              listId={list.id}
              title={list.title}
              tasks={tasks.filter((t) => t.list_id === list.id)}
              onAdd={handleAddTask}
              onToggle={handleToggleTask}
              onDelete={handleDeleteTask}
              onRenameList={handleRenameList}
              onDeleteList={handleDeleteList}
            />
          </div>
        ))}

        {/* 3. Note Widgets */}
        {logEntries.map((log) => (
          <div key={log.id} className="col-span-1 h-[300px]">
            <NoteCard
              id={log.id}
              title={log.title}
              initialContent={log.content}
              onSave={handleSaveNote}
              onDelete={handleDeleteNote}
            />
          </div>
        ))}

        {/* 4. Add Widget Button */}
        <div className="col-span-1 h-[200px] relative">
          <div
            className={`w-full h-full border border-white/5 border-dashed rounded-3xl flex flex-col items-center justify-center text-zinc-600 hover:text-zinc-400 hover:border-zinc-700 transition-all cursor-pointer bg-[#0A0A0A] ${
              showAddMenu ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
            onClick={() => setShowAddMenu(true)}
          >
            <Plus size={32} className="mb-2" />
            <span className="font-medium">Add Widget</span>
          </div>

          {showAddMenu && (
            <div className="absolute top-0 left-0 w-full z-50 bg-[#121212] rounded-3xl border border-white/10 shadow-2xl flex flex-col p-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-4">
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
                  Select Widget
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAddMenu(false);
                  }}
                  className="text-zinc-600 hover:text-white transition-colors p-1"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleAddWidget("checklist")}
                  className="flex items-center gap-3 w-full bg-zinc-900/50 hover:bg-zinc-800 p-3 rounded-xl transition-all border border-white/5 hover:border-white/10 group text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors shrink-0">
                    <List size={20} />
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm">
                      Checklist
                    </div>
                    <div className="text-zinc-500 text-[10px] mt-0.5">
                      Group tasks together
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleAddWidget("note")}
                  className="flex items-center gap-3 w-full bg-zinc-900/50 hover:bg-zinc-800 p-3 rounded-xl transition-all border border-white/5 hover:border-white/10 group text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-colors shrink-0">
                    <Type size={20} />
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm">Note</div>
                    <div className="text-zinc-500 text-[10px] mt-0.5">
                      Rich text editor
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyLog;
