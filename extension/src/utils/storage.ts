/**
 * Chrome storage helpers for persisting settings and history.
 */

import type { UserSettings, AnalysisHistoryItem } from "../types";

const DEFAULT_SETTINGS: UserSettings = {
  darkMode: true,
  apiUrl: "http://localhost:8000",
};

/** Check if Chrome storage API is available (may not be in dev mode) */
function hasChromeStorage(): boolean {
  return typeof chrome !== "undefined" && !!chrome?.storage?.local;
}

export async function getSettings(): Promise<UserSettings> {
  if (!hasChromeStorage()) return DEFAULT_SETTINGS;

  return new Promise((resolve) => {
    chrome.storage.local.get("settings", (result) => {
      resolve({ ...DEFAULT_SETTINGS, ...result.settings });
    });
  });
}

export async function saveSettings(settings: Partial<UserSettings>): Promise<void> {
  if (!hasChromeStorage()) return;

  const current = await getSettings();
  const updated = { ...current, ...settings };

  return new Promise((resolve) => {
    chrome.storage.local.set({ settings: updated }, resolve);
  });
}

export async function getLocalHistory(): Promise<AnalysisHistoryItem[]> {
  if (!hasChromeStorage()) return [];

  return new Promise((resolve) => {
    chrome.storage.local.get("history", (result) => {
      resolve(result.history || []);
    });
  });
}

export async function addToLocalHistory(item: AnalysisHistoryItem): Promise<void> {
  if (!hasChromeStorage()) return;

  const history = await getLocalHistory();
  history.unshift(item); // Most recent first

  // Keep last 100 entries
  const trimmed = history.slice(0, 100);

  return new Promise((resolve) => {
    chrome.storage.local.set({ history: trimmed }, resolve);
  });
}

export async function clearLocalHistory(): Promise<void> {
  if (!hasChromeStorage()) return;

  return new Promise((resolve) => {
    chrome.storage.local.set({ history: [] }, resolve);
  });
}
