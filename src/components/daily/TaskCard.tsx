import React from "react";
import {
  Check,
  Trash2,
  Plus,
  GripVertical,
  Zap,
  Battery,
  ZapOff,
} from "lucide-react";
import { EnergyBadge } from "../tasks/EnergyScheduler";

interface Task {
  id: string;
  title: string;
  is_completed: boolean;
  list_id?: string;
  energy_level?: "High" | "Medium" | "Low";
}

interface TaskCardProps {
  listId?: string; // If undefined, it's the "Main" or "General" list
  title: string;
  tasks: Task[];
  onToggle: (taskId: string) => void;
  onAdd: (
    title: string,
    listId?: string,
    energyLevel?: "High" | "Medium" | "Low"
  ) => void;
  onDelete: (taskId: string) => void;
  onRenameList?: (listId: string, newTitle: string) => void; // Optional for dynamic lists
  onDeleteList?: (listId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  listId,
  title,
  tasks,
  onToggle,
  onAdd,
  onDelete,
  onRenameList,
  onDeleteList,
}) => {
  const [newTask, setNewTask] = React.useState("");
  const [selectedEnergy, setSelectedEnergy] = React.useState<
    "High" | "Medium" | "Low" | undefined
  >(undefined);
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [editedTitle, setEditedTitle] = React.useState(title);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      onAdd(newTask, listId, selectedEnergy);
      setNewTask("");
      setSelectedEnergy(undefined);
    }
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (listId && onRenameList && editedTitle.trim() !== title) {
      onRenameList(listId, editedTitle);
    }
  };

  return (
    <div className="bg-[#121212] text-white p-6 rounded-3xl shadow-lg border border-white/10 flex flex-col h-full group/card relative">
      {/* List Actions (Delete) */}
      {listId && onDeleteList && (
        <button
          onClick={() => onDeleteList(listId)}
          className="absolute top-4 right-4 text-gray-600 hover:text-red-500 opacity-0 group-hover/card:opacity-100 transition-opacity"
        >
          <Trash2 size={14} />
        </button>
      )}

      {/* Header / Title */}
      <div className="mb-4 pr-8">
        {isEditingTitle && listId ? (
          <input
            autoFocus
            type="text"
            className="bg-transparent text-xl font-bold tracking-tight w-full focus:outline-none border-b border-blue-500"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => e.key === "Enter" && handleTitleBlur()}
          />
        ) : (
          <h3
            onClick={() => listId && setIsEditingTitle(true)}
            className={`text-xl font-bold tracking-tight flex items-center gap-2 ${
              listId
                ? "cursor-pointer hover:text-blue-400 decoration-dashed"
                : ""
            }`}
          >
            {title}
          </h3>
        )}
      </div>

      {/* Tasks List */}
      <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar max-h-[300px] mb-4">
        {tasks.length === 0 && (
          <p className="text-zinc-600 text-sm italic">No tasks yet.</p>
        )}
        {tasks.map((task) => (
          <div
            key={task.id}
            className="group flex items-center justify-between"
          >
            <div
              onClick={() => onToggle(task.id)}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div
                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                  task.is_completed
                    ? "bg-white border-white"
                    : "border-zinc-700 bg-black/20"
                }`}
              >
                {task.is_completed && (
                  <Check size={12} className="text-black" />
                )}
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-base font-medium transition-all ${
                    task.is_completed
                      ? "text-zinc-600 line-through"
                      : "text-zinc-300 group-hover:text-white"
                  }`}
                >
                  {task.title}
                </span>
                <EnergyBadge level={task.energy_level} />
              </div>
            </div>
            <button
              onClick={() => onDelete(task.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 hover:text-red-500"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Add Task Input */}
      <form onSubmit={handleAdd} className="mt-auto relative space-y-2">
        <input
          type="text"
          placeholder="Add a new task..."
          className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-3 pr-10 text-sm focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none placeholder-zinc-600 text-white transition-all"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />

        {/* Energy Selector */}
        <div className="flex gap-2 justify-end">
          {(["High", "Medium", "Low"] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() =>
                setSelectedEnergy(selectedEnergy === level ? undefined : level)
              }
              className={`p-1.5 rounded-full border transition-all ${
                selectedEnergy === level
                  ? level === "High"
                    ? "bg-red-900/50 border-red-500 text-red-400"
                    : level === "Medium"
                    ? "bg-yellow-900/50 border-yellow-500 text-yellow-400"
                    : "bg-green-900/50 border-green-500 text-green-400"
                  : "bg-zinc-900/50 border-zinc-700 text-zinc-600 hover:text-zinc-400"
              }`}
              title={`Tag as ${level} Energy`}
            >
              {level === "High" && <Zap size={12} />}
              {level === "Medium" && <Battery size={12} />}
              {level === "Low" && <ZapOff size={12} />}
            </button>
          ))}
          <button
            type="button"
            className="p-1.5 ml-1 rounded-full bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
            onClick={handleAdd}
            disabled={!newTask.trim()}
          >
            <Plus size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskCard;
