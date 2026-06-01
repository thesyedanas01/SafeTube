import React from "react";

export const LoadingState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-4 animate-fade-in">
      {/* Animated shield */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full border-2 border-cyan-500/20 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full border-2 border-cyan-500/40 flex items-center justify-center animate-pulse">
            <svg
              className="w-8 h-8 text-cyan-400 animate-bounce-slow"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
        </div>

        {/* Scanning ring */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 animate-spin" />
      </div>

      <div className="text-center">
        <p className="text-sm font-semibold text-white">Analyzing Video</p>
        <p className="text-xs text-slate-400 mt-1">
          Running AI content analysis...
        </p>
      </div>

      {/* Progress steps */}
      <div className="w-full px-6 space-y-2">
        {[
          "Extracting metadata",
          "Processing transcript",
          "AI toxicity scan",
          "Computing age rating",
        ].map((step, i) => (
          <div
            key={step}
            className="flex items-center gap-2 animate-slide-in"
            style={{ animationDelay: `${i * 400}ms` }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"
              style={{ animationDelay: `${i * 200}ms` }}
            />
            <span className="text-[11px] text-slate-500">{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
