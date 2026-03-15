"use client";

import { useState, useCallback } from "react";
import { useToast } from "@/context/ToastContext";
import { isNotificationSupported } from "@/lib/notifications";
import { analytics } from "@/lib/analytics";
import type { Settings } from "./useSettings";
import type { PracticeFrequency } from "@/constants/notifications";

/**
 * Encapsulates the notification prompt flow.
 *
 * - `triggerPrompt()` — call when an exercise with `showNotificationPrompt: true`
 *   shows its info modal. Guards: only fires if notifications are not yet enabled
 *   and browser permission is not denied.
 * - Manages frequency modal state and save handler.
 */
export function useNotificationPrompt(
  settings: Settings,
  update: <K extends keyof Settings>(key: K, value: Settings[K]) => void,
) {
  const { toast } = useToast();
  const [frequencyModalOpen, setFrequencyModalOpen] = useState(false);

  const openFrequencyModal = useCallback(() => setFrequencyModalOpen(true), []);
  const closeFrequencyModal = useCallback(() => setFrequencyModalOpen(false), []);

  /** Call when an exercise's info modal is shown (only if exercise has showNotificationPrompt). */
  const triggerPrompt = useCallback(() => {
    if (settings.notificationsEnabled) return;
    if (!isNotificationSupported()) return;
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "denied") return;

    analytics.notificationPromptShown();
    toast({
      variant: "info",
      title: "Stay on track with reminders",
      message: "We only send practice reminders — nothing else.",
      cta: { label: "Enable reminders", onClick: openFrequencyModal },
      duration: 15000,
    });
  }, [settings.notificationsEnabled, toast, openFrequencyModal]);

  const handleFrequencySave = useCallback((frequency: PracticeFrequency) => {
    update("notificationsEnabled", true);
    update("practiceFrequency", frequency);
    analytics.notificationToggled(true);
  }, [update]);

  return { frequencyModalOpen, openFrequencyModal, closeFrequencyModal, handleFrequencySave, triggerPrompt };
}
