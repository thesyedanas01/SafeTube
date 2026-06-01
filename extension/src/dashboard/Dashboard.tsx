import React from "react";
import { useHistory } from "../hooks/useHistory";
import { HistoryTable } from "./components/HistoryTable";
import { RiskChart } from "./components/RiskChart";
import { AgeDistribution } from "./components/AgeDistribution";
import type { AnalysisHistoryItem } from "../types";

const Dashboard: React.FC = () => {
  const { history, loading, error, refresh } = useHistory();

  const avgRisks = React.useMemo(() => {
    if (history.length === 0) return null;
    const sums = {
      violence: 0,
      profanity: 0,
      sexual_content: 0,
      drugs: 0,
      hate_speech: 0,
      scary_content: 0,
    };
    for (const item of history) {
      sums.violence += item.risk_scores.violence;
      sums.profanity += item.risk_scores.profanity;
      sums.sexual_content += item.risk_scores.sexual_content;
      sums.drugs += item.risk_scores.drugs;
      sums.hate_speech += item.risk_scores.hate_speech;
      sums.scary_content += item.risk_scores.scary_content;
    }
    const n = history.length;
    return {
      violence: +(sums.violence / n).toFixed(1),
      profanity: +(sums.profanity / n).toFixed(1),
      sexual_content: +(sums.sexual_content / n).toFixed(1),
      drugs: +(sums.drugs / n).toFixed(1),
      hate_speech: +(sums.hate_speech / n).toFixed(1),
      scary_content: +(sums.scary_content / n).toFixed(1),
    };
  }, [history]);

  const ageCounts = React.useMemo(() => {
    const counts: Record<number, number> = {};
    for (const item of history) {
      counts[item.recommended_age] = (counts[item.recommended_age] || 0) + 1;
    }
    return Object.entries(counts).map(([age, count]) => ({
      age: `${age}+`,
      count,
    }));
  }, [history]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white font-sans">
      {/* Header */}
      <header className="border-b border-white/10 px-8 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="text-base font-bold text-slate-900">ST</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">
                SafeTube AI Dashboard
              </h1>
              <p className="text-xs text-slate-400">
                Analysis History & Insights
              </p>
            </div>
          </div>

          <button
            onClick={refresh}
            className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/10 text-sm font-medium transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            Refresh
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-6 space-y-6">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4">
                <p className="text-xs text-slate-400 mb-1">Total Analyses</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {history.length}
                </p>
              </div>
              <div className="bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4">
                <p className="text-xs text-slate-400 mb-1">
                  Most Common Rating
                </p>
                <p className="text-2xl font-bold text-cyan-400">
                  {ageCounts.length > 0
                    ? ageCounts.sort((a, b) => b.count - a.count)[0]?.age
                    : "—"}
                </p>
              </div>
              <div className="bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4">
                <p className="text-xs text-slate-400 mb-1">Avg Confidence</p>
                <p className="text-2xl font-bold text-amber-400">
                  {history.length > 0
                    ? (
                        history.reduce((s, h) => s + h.confidence, 0) /
                        history.length
                      ).toFixed(0) + "%"
                    : "—"}
                </p>
              </div>
            </div>

            {/* Charts row */}
            {history.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
                  <h2 className="text-sm font-semibold mb-4">
                    Average Risk Distribution
                  </h2>
                  {avgRisks && <RiskChart risks={avgRisks} />}
                </div>
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
                  <h2 className="text-sm font-semibold mb-4">
                    Age Rating Distribution
                  </h2>
                  <AgeDistribution data={ageCounts} />
                </div>
              </div>
            )}

            {/* History table */}
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
              <h2 className="text-sm font-semibold mb-4">
                Analysis History
              </h2>
              <HistoryTable history={history} />
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
