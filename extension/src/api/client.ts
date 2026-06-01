/**
 * API client for communicating with the SafeTube AI backend.
 */

import type { AnalysisRequest, AnalysisResponse, AnalysisHistoryItem } from "../types";
import { getSettings } from "../utils/storage";

const LOG_PREFIX = "[SafeTube:API]";
const DEFAULT_API_URL = "http://localhost:8000";
const REQUEST_TIMEOUT_MS = 60000; // 60s — ML inference can be slow

async function getBaseUrl(): Promise<string> {
  const settings = await getSettings();
  return settings.apiUrl || DEFAULT_API_URL;
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = REQUEST_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function analyzeVideo(
  data: AnalysisRequest
): Promise<AnalysisResponse> {
  const baseUrl = await getBaseUrl();
  const url = `${baseUrl}/analyze`;
  console.log(`${LOG_PREFIX} POST ${url}`, { title: data.title, descLen: data.description?.length, transLen: data.transcript?.length });

  const response = await fetchWithTimeout(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  console.log(`${LOG_PREFIX} Response status: ${response.status}`);

  if (!response.ok) {
    const error = await response.text();
    console.error(`${LOG_PREFIX} Backend error:`, response.status, error);
    throw new Error(`Analysis failed (${response.status}): ${error}`);
  }

  const result = await response.json();
  console.log(`${LOG_PREFIX} Analysis result:`, result);
  return result;
}

export async function getHistory(): Promise<AnalysisHistoryItem[]> {
  const baseUrl = await getBaseUrl();
  const url = `${baseUrl}/history`;
  console.log(`${LOG_PREFIX} GET ${url}`);

  const response = await fetchWithTimeout(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch history (${response.status})`);
  }

  return response.json();
}

export async function getAnalysisById(
  id: number
): Promise<AnalysisHistoryItem> {
  const baseUrl = await getBaseUrl();
  const url = `${baseUrl}/history/${id}`;
  console.log(`${LOG_PREFIX} GET ${url}`);

  const response = await fetchWithTimeout(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch analysis (${response.status})`);
  }

  return response.json();
}

export async function checkHealth(): Promise<boolean> {
  try {
    const baseUrl = await getBaseUrl();
    const url = `${baseUrl}/health`;
    console.log(`${LOG_PREFIX} Health check: ${url}`);

    const response = await fetchWithTimeout(url, { method: "GET" }, 5000);
    console.log(`${LOG_PREFIX} Health: ${response.ok ? "OK" : "FAIL"}`);
    return response.ok;
  } catch (e) {
    console.warn(`${LOG_PREFIX} Health check failed:`, e);
    return false;
  }
}
