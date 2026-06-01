import React from "react";

interface EducationalScoreProps {
  score: number;
}

export const EducationalScore: React.FC<EducationalScoreProps> = ({
  score,
}) => {
  const color =
    score >= 70
      ? "#22c55e"
      : score >= 40
        ? "#84cc16"
        : score >= 20
          ? "#eab308"
          : "#64748b";

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/10 animate-fade-in">
      <span className="text-lg">📚</span>

      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-slate-300">
            Educational Value
          </span>
          <span
            className="text-xs font-bold tabular-nums"
            style={{ color }}
          >
            {score.toFixed(0)}%
          </span>
        </div>

        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-1000 ease-out animate-bar-fill"
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    </div>
  );
};
