import type { PracticeFrequency } from "@/constants/notifications";
import { FREQUENCY_MS } from "@/constants/notifications";

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return "denied";
  return Notification.requestPermission();
}

export function showNotification(title: string, options?: NotificationOptions): void {
  if (!isNotificationSupported()) return;
  if (Notification.permission !== "granted") return;
  new Notification(title, {
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    ...options,
  });
}

export function getNextReminderDate(frequency: PracticeFrequency, lastDate: Date): Date {
  return new Date(lastDate.getTime() + FREQUENCY_MS[frequency]);
}

export function isReminderDue(frequency: PracticeFrequency, lastReminderMs: number): boolean {
  if (lastReminderMs === 0) return false; // never prompted before
  return Date.now() >= lastReminderMs + FREQUENCY_MS[frequency];
}
