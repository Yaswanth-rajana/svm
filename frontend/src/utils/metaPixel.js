export function trackMetaEvent(eventName, parameters = {}) {
  if (typeof window === "undefined") return;

  if (typeof window.fbq !== "function") {
    console.warn(`Meta Pixel is not available. Event skipped: ${eventName}`);
    return;
  }

  window.fbq("track", eventName, parameters);
}
