/** Risk scores per content category (0-100 scale) */
export interface RiskScores {
  violence: number;
  profanity: number;
  sexual_content: number;
  drugs: number;
  hate_speech: number;
  scary_content: number;
}

/** Request payload sent to the backend */
export interface AnalysisRequest {
  title: string;
  description: string;
  transcript: string;
  channel_name?: string;
  video_url?: string;
  thumbnail_url?: string;
  video_frames_b64?: string[];
}

/** Response from the backend analysis endpoint */
export interface AnalysisResponse {
  recommended_age: number;
  confidence: number;
  risk_scores: RiskScores;
  educational_score: number;
  summary: string;
  id?: number;
}

/** A single history item from the backend */
export interface AnalysisHistoryItem extends AnalysisResponse {
  id: number;
  title: string;
  channel_name?: string;
  video_url?: string;
  created_at: string;
}

/** Metadata extracted from a YouTube video page */
export interface VideoMetadata {
  title: string;
  description: string;
  channelName: string;
  transcript: string;
  videoUrl: string;
  thumbnailUrl?: string;
  videoFramesBase64?: string[];
}

/** Extension popup state */
export type ExtensionState = "idle" | "loading" | "success" | "error" | "not-youtube";

/** Messages between popup, background, and content scripts */
export type MessageType =
  | { type: "EXTRACT_VIDEO_DATA" }
  | { type: "VIDEO_DATA_RESULT"; data: VideoMetadata }
  | { type: "VIDEO_DATA_ERROR"; error: string }
  | { type: "ANALYZE_VIDEO"; data: AnalysisRequest }
  | { type: "ANALYSIS_RESULT"; data: AnalysisResponse }
  | { type: "ANALYSIS_ERROR"; error: string }
  | { type: "OPEN_DASHBOARD" };

/** User settings stored in Chrome storage */
export interface UserSettings {
  darkMode: boolean;
  apiUrl: string;
}

/** Risk category display metadata */
export interface RiskCategoryMeta {
  key: keyof RiskScores;
  label: string;
  icon: string;
  colorClass: string;
}

export const RISK_CATEGORIES: RiskCategoryMeta[] = [
  { key: "violence", label: "Violence", icon: "⚔️", colorClass: "text-red-400" },
  { key: "profanity", label: "Profanity", icon: "🤬", colorClass: "text-orange-400" },
  { key: "sexual_content", label: "Sexual Content", icon: "🔞", colorClass: "text-pink-400" },
  { key: "drugs", label: "Drugs", icon: "💊", colorClass: "text-purple-400" },
  { key: "hate_speech", label: "Hate Speech", icon: "🚫", colorClass: "text-yellow-400" },
  { key: "scary_content", label: "Fear / Horror", icon: "👻", colorClass: "text-cyan-400" },
];

/** Maps age ratings to display colors */
export const AGE_COLORS: Record<number, string> = {
  3: "#22c55e",   // green
  7: "#84cc16",   // lime
  10: "#eab308",  // yellow
  13: "#f97316",  // orange
  16: "#ef4444",  // red
  18: "#dc2626",  // dark red
};
