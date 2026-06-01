import { useState, useEffect, useCallback } from "react";
import type { AnalysisHistoryItem } from "../types";
import { getHistory } from "../api/client";
import { getLocalHistory } from "../utils/storage";

export function useHistory() {
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Try backend first, fall back to local storage
      try {
        const backendHistory = await getHistory();
        setHistory(backendHistory);
      } catch {
        const localHistory = await getLocalHistory();
        setHistory(localHistory);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load history"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { history, loading, error, refresh: fetchHistory };
}
