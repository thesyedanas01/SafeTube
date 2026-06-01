import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { AgeRating } from "./components/AgeRating";
import { ConfidenceMeter } from "./components/ConfidenceMeter";
import { RiskCard } from "./components/RiskCard";
import { EducationalScore } from "./components/EducationalScore";
import { AISummary } from "./components/AISummary";
import { AnalyzeButton } from "./components/AnalyzeButton";
import { LoadingState } from "./components/LoadingState";
import { ErrorState } from "./components/ErrorState";
import { ExportButton } from "./components/ExportButton";
import { useAnalysis } from "../hooks/useAnalysis";
import { getSettings, saveSettings } from "../utils/storage";
import { RISK_CATEGORIES } from "../types";

const App: React.FC = () => {
  const { state, result, error, videoTitle, extractAndAnalyze, reset } =
    useAnalysis();
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    getSettings().then((s) => setDarkMode(s.darkMode));
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    saveSettings({ darkMode: newMode });
  };

  const openDashboard = () => {
    if (typeof chrome !== "undefined" && chrome.runtime) {
      chrome.runtime.sendMessage({ type: "OPEN_DASHBOARD" });
    }
  };

  return (
    <div
      className={`w-[380px] min-h-[500px] max-h-[600px] overflow-y-auto
                   ${darkMode ? "bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white" : "bg-gradient-to-b from-gray-50 to-white text-gray-900"}
                   font-sans`}
    >
      <Header
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenDashboard={openDashboard}
      />

      <main className="px-4 py-3 space-y-3">
        {/* Idle state — ready to analyze */}
        {state === "idle" && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-800 flex items-center justify-center mb-3 border border-slate-700">
                <svg
                  className="w-8 h-8 text-slate-300"
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
              <h2 className="text-base font-bold text-white">
                Ready to Analyze
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-[260px] mx-auto">
                Open a YouTube video and click below to check if it's age-appropriate.
              </p>
            </div>
            <AnalyzeButton onClick={extractAndAnalyze} loading={false} />
          </div>
        )}

        {/* Not on YouTube */}
        {state === "not-youtube" && (
          <div className="text-center py-8 animate-fade-in">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 flex items-center justify-center mb-3">
              <svg
                className="w-7 h-7 text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
            </div>
            <p className="text-sm font-semibold text-white">
              Not a YouTube Video
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Navigate to a YouTube video page to use SafeTube AI.
            </p>
            <button
              onClick={reset}
              className="mt-3 text-xs text-indigo-400 hover:text-indigo-300"
            >
              ← Go Back
            </button>
          </div>
        )}

        {/* Loading */}
        {state === "loading" && <LoadingState />}

        {/* Error */}
        {state === "error" && (
          <ErrorState message={error || "Unknown error"} onRetry={extractAndAnalyze} />
        )}

        {/* Results */}
        {state === "success" && result && (
          <div className="space-y-3 animate-fade-in">
            {/* Video title */}
            {videoTitle && (
              <p className="text-xs text-slate-400 truncate px-1" title={videoTitle}>
                🎬 {videoTitle}
              </p>
            )}

            {/* Age + Confidence row */}
            <div className="flex items-center justify-center gap-6 py-2">
              <AgeRating age={result.recommended_age} />
              <ConfidenceMeter confidence={result.confidence} />
            </div>

            {/* Risk Scores */}
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">
                Risk Analysis
              </h3>
              <div className="space-y-1">
                {RISK_CATEGORIES.map((cat, index) => (
                  <RiskCard
                    key={cat.key}
                    label={cat.label}
                    score={result.risk_scores[cat.key]}
                    icon={cat.icon}
                    index={index}
                  />
                ))}
              </div>
            </div>

            {/* Educational Score */}
            <EducationalScore score={result.educational_score} />

            {/* AI Summary */}
            <AISummary summary={result.summary} />

            {/* Actions */}
            <div className="flex items-center justify-between pt-1 pb-2">
              <button
                onClick={reset}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                ← Analyze Another
              </button>
              <ExportButton analysis={result} videoTitle={videoTitle} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
