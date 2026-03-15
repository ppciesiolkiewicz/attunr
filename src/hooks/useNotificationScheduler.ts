"use client";

import { useEffect } from "react";
import type { Settings } from "./useSettings";
import { isNotificationSupported, showNotification, isReminderDue } from "@/lib/notifications";

const LAST_VISIT_KEY = "attunr.lastVisit";
const LAST_REMINDER_KEY = "attunr.lastReminderShown";

function getStoredMs(key: string): number {
  try {
    return parseInt(localStorage.getItem(key) || "0", 10) || 0;
  } catch {
    return 0;
  }
}

function storeMs(key: string): void {
  try {
    localStorage.setItem(key, String(Date.now()));
  } catch {
    // localStorage unavailable
  }
}

/**
 * Client-side notification scheduler.
 * - Records each visit timestamp
 * - On app open, checks if a reminder is due based on practiceFrequency
 * - Shows a browser Notification if tab is not focused, or skips if focused (user is already practicing)
 */
export function useNotificationScheduler(settings: Settings) {
  useEffect(() => {
    // Always record visit
    storeMs(LAST_VISIT_KEY);

    if (!settings.notificationsEnabled) return;
    if (!isNotificationSupported()) return;
    if (Notification.permission !== "granted") return;

    const lastReminder = getStoredMs(LAST_REMINDER_KEY);

    // First time enabling — seed the reminder timestamp so we don't fire immediately
    if (lastReminder === 0) {
      storeMs(LAST_REMINDER_KEY);
      return;
    }

    if (!isReminderDue(settings.practiceFrequency, lastReminder)) return;

    // Only show notification if the tab is not focused (user came back to browser, not this tab)
    if (document.hasFocus()) return;

    showNotification("Time to practice", {
      body: "A few minutes of vocal practice can make a big difference.",
    });
    storeMs(LAST_REMINDER_KEY);
  }, [settings.notificationsEnabled, settings.practiceFrequency]);
}
