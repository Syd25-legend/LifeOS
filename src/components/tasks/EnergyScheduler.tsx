import React, { useState, useMemo } from "react";
import type { Task } from "../../lib/types";
import { Battery, Zap, ZapOff } from "lucide-react";

export const useEnergyFilter = (tasks: Task[]) => {
  const [lowEnergyMode, setLowEnergyMode] = useState(false);

  const filteredTasks = useMemo(() => {
    if (!lowEnergyMode) return tasks;
    return tasks.filter((t) => t.energy_level !== "High");
  }, [tasks, lowEnergyMode]);

  return { lowEnergyMode, setLowEnergyMode, filteredTasks };
};

interface EnergyToggleProps {
  lowEnergyMode: boolean;
  setLowEnergyMode: (mode: boolean) => void;
}

export const EnergyToggle: React.FC<EnergyToggleProps> = ({
  lowEnergyMode,
  setLowEnergyMode,
}) => {
  return (
    <button
      onClick={() => setLowEnergyMode(!lowEnergyMode)}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
        lowEnergyMode
          ? "bg-blue-500/20 text-blue-300 border border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]"
          : "bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700"
      }`}
    >
      {lowEnergyMode ? (
        <Battery className="w-4 h-4" />
      ) : (
        <Zap className="w-4 h-4" />
      )}
      {lowEnergyMode ? "Low Energy Mode On" : "Normal Energy Mode"}
    </button>
  );
};

export const EnergyBadge: React.FC<{ level?: "High" | "Medium" | "Low" }> = ({
  level,
}) => {
  if (!level) return null;

  const colors = {
    High: "text-red-400 bg-red-900/30 border-red-800",
    Medium: "text-yellow-400 bg-yellow-900/30 border-yellow-800",
    Low: "text-green-400 bg-green-900/30 border-green-800",
  };

  return (
    <span
      className={`text-xs px-2 py-0.5 rounded border ${colors[level]} flex items-center gap-1`}
    >
      {level === "High" && <Zap className="w-3 h-3" />}
      {level === "Medium" && <Battery className="w-3 h-3" />}
      {level === "Low" && <ZapOff className="w-3 h-3" />}
      {level}
    </span>
  );
};
