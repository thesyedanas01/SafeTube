import { useState, useCallback } from "react";
import type {
  AnalysisResponse,
  AnalysisRequest,
  ExtensionState,
  VideoMetadata,
} from "../types";
import { analyzeVideo } from "../api/client";
import { addToLocalHistory } from "../utils/storage";
import type { AnalysisHistoryItem } from "../types";

const LOG_PREFIX = "[SafeTube:Popup]";

export function useAnalysis() {
  const [state, setState] = useState<ExtensionState>("idle");
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>("");

  const extractAndAnalyze = useCallback(async () => {
    setState("loading");
    setError(null);
    setResult(null);
    console.log(`${LOG_PREFIX} === Starting analysis flow ===`);

    try {
      // Step 1: Get active tab
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      console.log(`${LOG_PREFIX} Active tab:`, { id: tab?.id, url: tab?.url });

      if (!tab?.id || !tab.url?.includes("youtube.com/watch")) {
        console.warn(`${LOG_PREFIX} Not a YouTube watch page, aborting.`);
        setState("not-youtube");
        return;
      }

      // Step 2: Send message to content script to extract video data
      console.log(`${LOG_PREFIX} Sending EXTRACT_VIDEO_DATA to tab ${tab.id}`);
      let videoData: VideoMetadata;

      try {
        const response = await chrome.tabs.sendMessage(tab.id, {
          type: "EXTRACT_VIDEO_DATA",
        });
        console.log(`${LOG_PREFIX} Content script response:`, response);

        if (response?.type === "VIDEO_DATA_ERROR") {
          throw new Error(response.error);
        }
        if (!response?.data) {
          throw new Error("Empty response from content script");
        }
        videoData = response.data;
      } catch (msgError) {
        // Content script may not be injected yet (e.g. tab opened before extension install).
        // Re-inject using the BUILT filename, then retry.
        console.warn(
          `${LOG_PREFIX} Initial sendMessage failed, attempting re-injection:`,
          msgError instanceof Error ? msgError.message : msgError
        );

        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content-script.js"],
          });
          console.log(`${LOG_PREFIX} Content script re-injected, retrying message...`);
        } catch (injectError) {
          console.error(`${LOG_PREFIX} Failed to inject content script:`, injectError);
          throw new Error(
            "Could not communicate with the YouTube page. Please refresh the page and try again."
          );
        }

        // Wait for content script to initialize, then retry
        await new Promise((r) => setTimeout(r, 300));
        const retryResponse = await chrome.tabs.sendMessage(tab.id, {
          type: "EXTRACT_VIDEO_DATA",
        });
        console.log(`${LOG_PREFIX} Retry response:`, retryResponse);

        if (retryResponse?.type === "VIDEO_DATA_ERROR") {
          throw new Error(retryResponse.error);
        }
        if (!retryResponse?.data) {
          throw new Error("Empty response from content script after re-injection");
        }
        videoData = retryResponse.data;
      }

      console.log(`${LOG_PREFIX} Extracted video data:`, {
        title: videoData.title,
        descriptionLength: videoData.description?.length,
        transcriptLength: videoData.transcript?.length,
        channelName: videoData.channelName,
        videoUrl: videoData.videoUrl,
      });
      setVideoTitle(videoData.title);

      // Step 3: Build analysis request and call backend
      const request: AnalysisRequest = {
        title: videoData.title,
        description: videoData.description,
        transcript: videoData.transcript,
        channel_name: videoData.channelName,
        video_url: videoData.videoUrl,
        thumbnail_url: videoData.thumbnailUrl,
        video_frames_b64: videoData.videoFramesBase64,
      };

      console.log(`${LOG_PREFIX} Sending analysis request to backend...`);
      const analysisResult = await analyzeVideo(request);
      console.log(`${LOG_PREFIX} Backend response:`, analysisResult);

      setResult(analysisResult);
      setState("success");

      // Step 4: Update badge
      console.log(`${LOG_PREFIX} Updating badge: ${analysisResult.recommended_age}+`);
      chrome.runtime.sendMessage({
        type: "UPDATE_BADGE",
        age: analysisResult.recommended_age,
      });

      // Step 5: Save to local history
      const historyItem: AnalysisHistoryItem = {
        ...analysisResult,
        id: analysisResult.id || Date.now(),
        title: videoData.title,
        channel_name: videoData.channelName,
        video_url: videoData.videoUrl,
        created_at: new Date().toISOString(),
      };
      await addToLocalHistory(historyItem);
      console.log(`${LOG_PREFIX} === Analysis complete ===`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      console.error(`${LOG_PREFIX} Analysis failed:`, message, err);
      setError(message);
      setState("error");
    }
  }, []);

  const reset = useCallback(() => {
    console.log(`${LOG_PREFIX} State reset to idle`);
    setState("idle");
    setResult(null);
    setError(null);
  }, []);

  return { state, result, error, videoTitle, extractAndAnalyze, reset };
}
