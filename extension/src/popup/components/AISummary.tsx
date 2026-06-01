import React, { useState } from "react";

interface AISummaryProps {
  summary: string;
}

export const AISummary: React.FC<AISummaryProps> = ({ summary }) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = summary.length > 120;
  const displayText =
    isLong && !expanded ? summary.slice(0, 120) + "..." : summary;

  return (
    <div className="px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 animate-fade-in">
      <div className="flex items-center gap-2 mb-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
        <span className="text-xs font-semibold text-slate-300">
          Summary
        </span>
      </div>

      <p className="text-[11px] leading-relaxed text-slate-400">
        "{displayText}"
      </p>

      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-1 text-[10px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
};
