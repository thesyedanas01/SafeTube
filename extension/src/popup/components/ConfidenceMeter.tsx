import React from "react";

interface ConfidenceMeterProps {
  confidence: number;
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({
  confidence,
}) => {
  const circumference = 2 * Math.PI * 28;
  const strokeDashoffset =
    circumference - (confidence / 100) * circumference;

  const color =
    confidence >= 80
      ? "#22c55e"
      : confidence >= 60
        ? "#eab308"
        : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-16 h-16">
        {/* Background circle */}
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="4"
          />
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-white">
            {confidence.toFixed(0)}%
          </span>
        </div>
      </div>
      <p className="text-[10px] font-medium text-slate-400">Confidence</p>
    </div>
  );
};
