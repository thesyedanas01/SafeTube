import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { AGE_COLORS } from "../../types";

interface AgeDistributionProps {
  data: { age: string; count: number }[];
}

const COLORS = [
  "#22c55e",
  "#84cc16",
  "#eab308",
  "#f97316",
  "#ef4444",
  "#dc2626",
];

export const AgeDistribution: React.FC<AgeDistributionProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[220px] text-sm text-slate-500">
        No data yet
      </div>
    );
  }

  // Sort by age number
  const sorted = [...data].sort((a, b) => {
    const ageA = parseInt(a.age);
    const ageB = parseInt(b.age);
    return ageA - ageB;
  });

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={sorted}
          dataKey="count"
          nameKey="age"
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={3}
          stroke="none"
        >
          {sorted.map((entry, index) => {
            const ageNum = parseInt(entry.age);
            const color = AGE_COLORS[ageNum] || COLORS[index % COLORS.length];
            return <Cell key={entry.age} fill={color} fillOpacity={0.85} />;
          })}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#1e293b",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            fontSize: "12px",
            color: "#e2e8f0",
          }}
          formatter={(value: number) => [value, "Videos"]}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};
