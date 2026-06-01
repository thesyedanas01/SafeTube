import React from "react";

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenDashboard: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  onOpenDashboard,
}) => {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-white/10">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-sm">
          <span className="text-sm font-bold text-white">ST</span>
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-tight">
            SafeTube
          </h1>
          <p className="text-[10px] text-slate-400 -mt-0.5">
            Child Safety Analyzer
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onOpenDashboard}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors group"
          title="Open Dashboard"
        >
          <svg
            className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        </button>

        <button
          onClick={onToggleDarkMode}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors group"
          title={darkMode ? "Light Mode" : "Dark Mode"}
        >
          {darkMode ? (
            <svg
              className="w-4 h-4 text-yellow-400 group-hover:text-yellow-300 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
            <svg
              className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
};
