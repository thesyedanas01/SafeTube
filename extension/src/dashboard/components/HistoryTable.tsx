import React from "react";
import type { AnalysisHistoryItem } from "../../types";
import { AGE_COLORS } from "../../types";

interface HistoryTableProps {
  history: AnalysisHistoryItem[];
}

export const HistoryTable: React.FC<HistoryTableProps> = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-500">No analyses yet.</p>
        <p className="text-xs text-slate-600 mt-1">
          Analyze a YouTube video to see results here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-white/10">
            <th className="pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Video
            </th>
            <th className="pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Channel
            </th>
            <th className="pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
              Age
            </th>
            <th className="pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
              Confidence
            </th>
            <th className="pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Date
            </th>
          </tr>
        </thead>
        <tbody>
          {history.map((item, index) => {
            const color = AGE_COLORS[item.recommended_age] || "#ef4444";
            return (
              <tr
                key={item.id || index}
                className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
              >
                <td className="py-3 pr-4">
                  <div className="max-w-[280px]">
                    {item.video_url ? (
                      <a
                        href={item.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-slate-300 hover:text-cyan-400 transition-colors truncate block"
                      >
                        {item.title}
                      </a>
                    ) : (
                      <span className="text-sm text-slate-300 truncate block">
                        {item.title}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <span className="text-xs text-slate-500">
                    {item.channel_name || "—"}
                  </span>
                </td>
                <td className="py-3 text-center">
                  <span
                    className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{
                      color,
                      backgroundColor: `${color}15`,
                    }}
                  >
                    {item.recommended_age}+
                  </span>
                </td>
                <td className="py-3 text-center">
                  <span className="text-xs text-slate-400">
                    {item.confidence.toFixed(0)}%
                  </span>
                </td>
                <td className="py-3">
                  <span className="text-xs text-slate-600">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
