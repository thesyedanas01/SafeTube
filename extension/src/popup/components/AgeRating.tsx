import React from "react";
import { AGE_COLORS } from "../../types";

interface AgeRatingProps {
  age: number;
  className?: string;
}

export const AgeRating: React.FC<AgeRatingProps> = ({ age, className = "" }) => {
  const color = AGE_COLORS[age] || AGE_COLORS[18];

  const label =
    age <= 3
      ? "Safe for All"
      : age <= 7
        ? "Young Children"
        : age <= 10
          ? "Older Children"
          : age <= 13
            ? "Teens"
            : age <= 16
              ? "Older Teens"
              : "Adults Only";

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className="relative">
        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-30 animate-pulse-slow"
          style={{ backgroundColor: color }}
        />

        {/* Age badge */}
        <div
          className="relative w-24 h-24 rounded-full flex flex-col items-center justify-center border-[3px] shadow-2xl"
          style={{
            borderColor: color,
            background: `radial-gradient(circle at 30% 30%, ${color}20, transparent 70%)`,
          }}
        >
          <span
            className="text-3xl font-black tracking-tighter"
            style={{ color }}
          >
            {age}+
          </span>
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs font-semibold text-slate-300">Recommended Age</p>
        <p className="text-[11px] mt-0.5" style={{ color }}>
          {label}
        </p>
      </div>
    </div>
  );
};
