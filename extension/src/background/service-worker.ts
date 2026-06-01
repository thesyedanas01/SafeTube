/**
 * Background service worker for SafeTube AI.
 * Handles message routing and extension badge updates.
 */

const LOG_PREFIX = "[SafeTube:SW]";

console.log(`${LOG_PREFIX} Service worker loaded`);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(`${LOG_PREFIX} Received message:`, message, "from:", sender);

  if (message.type === "OPEN_DASHBOARD") {
    const url = chrome.runtime.getURL("dashboard.html");
    console.log(`${LOG_PREFIX} Opening dashboard:`, url);
    chrome.tabs.create({ url });
    sendResponse({ success: true });
  }

  if (message.type === "UPDATE_BADGE") {
    const age = message.age as number;
    const color =
      age <= 7
        ? "#22c55e"
        : age <= 10
          ? "#eab308"
          : age <= 13
            ? "#f97316"
            : "#ef4444";

    console.log(`${LOG_PREFIX} Setting badge: ${age}+ (${color})`);
    chrome.action.setBadgeText({ text: `${age}+` });
    chrome.action.setBadgeBackgroundColor({ color });
    sendResponse({ success: true });
  }

  if (message.type === "CLEAR_BADGE") {
    console.log(`${LOG_PREFIX} Clearing badge`);
    chrome.action.setBadgeText({ text: "" });
    sendResponse({ success: true });
  }

  return true;
});

// Clear badge when navigating away from YouTube
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url && !changeInfo.url.includes("youtube.com/watch")) {
    console.log(`${LOG_PREFIX} Tab ${tabId} navigated away from YouTube, clearing badge`);
    chrome.action.setBadgeText({ text: "" });
  }
});
