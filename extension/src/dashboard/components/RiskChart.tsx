import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface RiskChartProps {
  risks: {
    violence: number;
    profanity: number;
    sexual_content: number;
    drugs: number;
    hate_speech: number;
    scary_content: number;
  };
}

const CHART_COLORS: Record<string, string> = {
  Violence: "#ef4444",
  Profanity: "#f97316",
  Sexual: "#ec4899",
  Drugs: "#a855f7",
  "Hate Speech": "#eab308",
  Fear: "#06b6d4",
};

export const RiskChart: React.FC<RiskChartProps> = ({ risks }) => {
  const data = [
    { name: "Violence", value: risks.violence },
    { name: "Profanity", value: risks.profanity },
    { name: "Sexual", value: risks.sexual_content },
    { name: "Drugs", value: risks.drugs },
    { name: "Hate Speech", value: risks.hate_speech },
    { name: "Fear", value: risks.scary_content },
  ];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <XAxis
          dataKey="name"
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: "#64748b", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1e293b",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            fontSize: "12px",
            color: "#e2e8f0",
          }}
          formatter={(value: number) => [`${value.toFixed(1)}%`, "Score"]}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
          {data.map((entry) => (
            <Cell
              key={entry.name}
              fill={CHART_COLORS[entry.name] || "#64748b"}
              fillOpacity={0.8}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
