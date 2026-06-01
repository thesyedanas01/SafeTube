import React from "react";

interface RiskCardProps {
  label: string;
  score: number;
  icon: string;
  index: number;
}

export const RiskCard: React.FC<RiskCardProps> = ({
  label,
  score,
  icon,
  index,
}) => {
  const barColor =
    score >= 60
      ? "bg-gradient-to-r from-red-500 to-red-400"
      : score >= 30
        ? "bg-gradient-to-r from-amber-500 to-orange-400"
        : "bg-gradient-to-r from-emerald-500 to-green-400";

  const textColor =
    score >= 60
      ? "text-red-400"
      : score >= 30
        ? "text-amber-400"
        : "text-emerald-400";

  return (
    <div
      className="group flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-300 animate-slide-in"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <span className="text-base flex-shrink-0 w-6 text-center">{icon}</span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-slate-300">{label}</span>
          <span className={`text-xs font-bold tabular-nums ${textColor}`}>
            {score.toFixed(0)}%
          </span>
        </div>

        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className={`h-full rounded-full ${barColor} transition-all duration-1000 ease-out animate-bar-fill`}
            style={{
              width: `${score}%`,
              animationDelay: `${index * 80 + 200}ms`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
