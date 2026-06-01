/**
 * Content script for extracting YouTube video metadata.
 * Injected into YouTube watch pages via manifest.json content_scripts.
 */

import type { VideoMetadata } from "../types";

const LOG_PREFIX = "[SafeTube:Content]";

console.log(`${LOG_PREFIX} Content script loaded on:`, window.location.href);

function extractThumbnailUrl(videoUrl: string): string {
  try {
    const url = new URL(videoUrl);
    const videoId = url.searchParams.get("v");
    if (videoId) {
      return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
    }
  } catch (e) {}

  const ogImage = document.querySelector('meta[property="og:image"]');
  if (ogImage) {
    return ogImage.getAttribute("content") || "";
  }

  return "";
}

function captureSingleFrame(videoElement: HTMLVideoElement): string {
  const canvas = document.createElement("canvas");
  // Scale down to max 640px width to keep payload size small
  const scale = Math.min(1, 640 / (videoElement.videoWidth || 640));
  canvas.width = (videoElement.videoWidth || 640) * scale;
  canvas.height = (videoElement.videoHeight || 360) * scale;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    // Use JPEG with 0.6 quality for smaller base64 string
    const base64 = canvas.toDataURL("image/jpeg", 0.6);
    console.log(`${LOG_PREFIX} Captured video frame, size: ${Math.round(base64.length / 1024)}KB`);
    return base64;
  }
  return "";
}

async function captureMultipleFrames(): Promise<string[]> {
  try {
    const videoElement = document.querySelector("video") as HTMLVideoElement;
    if (!videoElement || videoElement.readyState < 2) return [];

    const frames: string[] = [];
    const duration = videoElement.duration;
    
    // If it's a very short video or livesteam, just capture the current frame
    if (!duration || duration < 10 || duration === Infinity) {
      const frame = captureSingleFrame(videoElement);
      return frame ? [frame] : [];
    }

    const originalTime = videoElement.currentTime;
    const wasPlaying = !videoElement.paused;
    
    if (wasPlaying) {
      videoElement.pause();
    }
    
    // Capture 10 frames spaced evenly across the video, up to 95% to avoid autoplaying the next video
    const targetTimes: number[] = [];
    for (let i = 1; i <= 10; i++) {
      // Scale i/10 to max out at 0.95
      targetTimes.push(duration * (i / 10) * 0.95);
    }
    
    for (const time of targetTimes) {
      await new Promise<void>((resolve) => {
        const onSeeked = () => {
          videoElement.removeEventListener("seeked", onSeeked);
          resolve();
        };
        videoElement.addEventListener("seeked", onSeeked);
        videoElement.currentTime = time;
      });
      // Wait a tiny bit for the frame to render to the DOM
      await new Promise(r => setTimeout(r, 100));
      const frame = captureSingleFrame(videoElement);
      if (frame) frames.push(frame);
    }
    
    // Restore original state
    await new Promise<void>((resolve) => {
      const onSeeked = () => {
        videoElement.removeEventListener("seeked", onSeeked);
        resolve();
      };
      videoElement.addEventListener("seeked", onSeeked);
      videoElement.currentTime = originalTime;
    });
    
    if (wasPlaying) {
      videoElement.play();
    }
    
    return frames;
  } catch (e) {
    console.warn(`${LOG_PREFIX} Error capturing video frames:`, e);
  }
  return [];
}

async function extractVideoData(): Promise<VideoMetadata> {
  console.log(`${LOG_PREFIX} Extracting video data...`);

  const title =
    document.querySelector("h1.ytd-watch-metadata yt-formatted-string")?.textContent?.trim() ||
    document.querySelector("h1.ytd-video-primary-info-renderer")?.textContent?.trim() ||
    document.title.replace(" - YouTube", "").trim() ||
    "";
  console.log(`${LOG_PREFIX} Title: "${title}"`);

  const description =
    document.querySelector("ytd-text-inline-expander #attributed-snippet-text")?.textContent?.trim() ||
    document.querySelector("#description-inline-expander")?.textContent?.trim() ||
    document.querySelector("ytd-expander[collapsed] #description")?.textContent?.trim() ||
    document.querySelector("#description")?.textContent?.trim() ||
    "";
  console.log(`${LOG_PREFIX} Description length: ${description.length}`);

  const channelName =
    document.querySelector("ytd-channel-name yt-formatted-string a")?.textContent?.trim() ||
    document.querySelector("#channel-name a")?.textContent?.trim() ||
    "";
  console.log(`${LOG_PREFIX} Channel: "${channelName}"`);

  const transcript = await extractTranscript();
  console.log(`${LOG_PREFIX} Transcript length: ${transcript.length}`);

  const videoUrl = window.location.href;
  const thumbnailUrl = extractThumbnailUrl(videoUrl);
  const videoFramesBase64 = await captureMultipleFrames();

  const result: VideoMetadata = { title, description, channelName, transcript, videoUrl, thumbnailUrl, videoFramesBase64 };
  console.log(`${LOG_PREFIX} Extraction complete:`, {
    title: result.title,
    descLen: result.description.length,
    transLen: result.transcript.length,
    channel: result.channelName,
  });
  return result;
}

async function fetchTranscriptFromUrl(url: string): Promise<string> {
  try {
    console.log(`${LOG_PREFIX} Fetching transcript from:`, url);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    const textNodes = xmlDoc.getElementsByTagName("text");
    const transcriptText = Array.from(textNodes)
      .map((el) => el.textContent || "")
      .filter(Boolean)
      .join(" ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    console.log(`${LOG_PREFIX} Successfully parsed transcript, length: ${transcriptText.length}`);
    return transcriptText;
  } catch (error) {
    console.error(`${LOG_PREFIX} Error fetching transcript:`, error);
    return "";
  }
}

async function extractTranscript(): Promise<string> {
  // Try to get transcript from already-opened transcript panel
  const transcriptSegments = document.querySelectorAll(
    "ytd-transcript-segment-renderer .segment-text"
  );

  if (transcriptSegments.length > 0) {
    console.log(`${LOG_PREFIX} Found ${transcriptSegments.length} transcript segments`);
    return Array.from(transcriptSegments)
      .map((el) => el.textContent?.trim() || "")
      .filter(Boolean)
      .join(" ");
  }

  // Try legacy transcript format
  const legacySegments = document.querySelectorAll(
    ".ytd-transcript-body-renderer .cue"
  );

  if (legacySegments.length > 0) {
    console.log(`${LOG_PREFIX} Found ${legacySegments.length} legacy transcript segments`);
    return Array.from(legacySegments)
      .map((el) => el.textContent?.trim() || "")
      .filter(Boolean)
      .join(" ");
  }

  // Fallback: try to extract caption track URL from page scripts
  try {
    const scripts = document.querySelectorAll("script");
    for (const script of scripts) {
      const content = script.textContent || "";
      if (content.includes("captionTracks")) {
        const match = content.match(/"captionTracks":\s*(\[.*?\])/);
        if (match) {
          const tracks = JSON.parse(match[1]);
          if (tracks.length > 0) {
            // Prioritize English track, otherwise fallback to the first available track
            const englishTrack = tracks.find((t: any) => t.languageCode === "en") || tracks[0];
            if (englishTrack && englishTrack.baseUrl) {
              let trackUrl = englishTrack.baseUrl;
              // If the track is not in English, request auto-translation to English
              if (englishTrack.languageCode !== "en" && !trackUrl.includes("&tlang=en")) {
                trackUrl += "&tlang=en";
              }
              console.log(`${LOG_PREFIX} Found caption tracks (selected language: ${englishTrack.languageCode}), URL available`);
              return await fetchTranscriptFromUrl(trackUrl);
            }
          }
        }
      }
    }
  } catch (e) {
    console.warn(`${LOG_PREFIX} Caption extraction error:`, e);
  }

  console.log(`${LOG_PREFIX} No transcript found`);
  return "";
}

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(`${LOG_PREFIX} Received message:`, message, "from:", sender);

  if (message.type === "EXTRACT_VIDEO_DATA") {
    extractVideoData()
      .then((data) => {
        console.log(`${LOG_PREFIX} Sending VIDEO_DATA_RESULT`);
        sendResponse({ type: "VIDEO_DATA_RESULT", data });
      })
      .catch((error) => {
        const errorMsg = error instanceof Error ? error.message : "Failed to extract video data";
        console.error(`${LOG_PREFIX} Extraction error:`, errorMsg, error);
        sendResponse({
          type: "VIDEO_DATA_ERROR",
          error: errorMsg,
        });
      });
    return true; // Keep channel open for async response
  }
  return true; // Keep channel open for other potential async responses
});

console.log(`${LOG_PREFIX} Message listener registered`);
