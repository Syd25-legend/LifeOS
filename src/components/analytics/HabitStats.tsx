import React from "react";

interface HabitStat {
  name: string;
  completionRate: number; // 0-100
  type: "good" | "bad";
}

interface Props {
  stats: HabitStat[];
}

const HabitStats: React.FC<Props> = ({ stats }) => {
  return (
    <div className="space-y-6">
      {stats.map((stat, idx) => (
        <div key={idx} className="group">
          <div className="flex justify-between text-sm font-medium mb-2">
            <span className="text-gray-400 group-hover:text-white transition-colors">
              {stat.name}
            </span>
            <span
              className={
                stat.type === "good" ? "text-green-500" : "text-orange-500"
              }
            >
              {stat.completionRate}%
            </span>
          </div>
          <div className="h-2 w-full bg-[#222] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                stat.type === "good" ? "bg-green-500" : "bg-orange-500"
              }`}
              style={{ width: `${stat.completionRate}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default HabitStats;
