/**
 * Show a browser notification using the Service Worker when available
 * (required for Chrome on Android and modern desktop Chrome).
 * Falls back to direct Notification API.
 */
export async function showPushNotification(
  title: string,
  body: string,
  tag?: string,
): Promise<void> {
  if (typeof Notification === "undefined") return;
  if (Notification.permission !== "granted") return;

  try {
    // Prefer service worker showNotification (works on all Chrome versions)
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, {
        body,
        icon: "/assets/favicon.ico",
        badge: "/assets/favicon.ico",
        tag: tag || "hn-coach-notification",
      } as NotificationOptions);
      return;
    }
  } catch {
    // fall through to direct Notification
  }

  // Fallback: direct Notification constructor
  try {
    new Notification(title, { body, icon: "/assets/favicon.ico" });
  } catch {
    // ignore
  }
}

/**
 * Request notification permission and return the result.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof Notification === "undefined") return "denied";
  return Notification.requestPermission();
}
