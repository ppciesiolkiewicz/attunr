"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/context/ToastContext";
import { isNotificationSupported } from "@/lib/notifications";
import { analytics } from "@/lib/analytics";
import type { Settings } from "./useSettings";
import type { PracticeFrequency } from "@/constants/notifications";

/**
 * Encapsulates the entire notification prompt flow:
 * - Shows a toast after exercise 3 is completed
 * - Manages the frequency modal open/close state
 * - Handles saving frequency + enabling notifications
 *
 * Returns `{ frequencyModalOpen, closeFrequencyModal, openFrequencyModal, handleFrequencySave }`
 * so AppShell only needs to render <FrequencyModal> with these props.
 */
export function useNotificationPrompt(
  settings: Settings,
  update: <K extends keyof Settings>(key: K, value: Settings[K]) => void,
) {
  const { toast } = useToast();
  const prevStageRef = useRef(settings.journeyStage);
  const [frequencyModalOpen, setFrequencyModalOpen] = useState(false);

  const openFrequencyModal = useCallback(() => setFrequencyModalOpen(true), []);
  const closeFrequencyModal = useCallback(() => setFrequencyModalOpen(false), []);

  // Show toast prompt right after an exercise completion brings stage to 3+
  useEffect(() => {
    const prev = prevStageRef.current;
    prevStageRef.current = settings.journeyStage;

    // Only trigger on an actual completion (stage increased), not on mount
    if (settings.journeyStage <= prev) return;
    if (settings.journeyStage < 3) return;
    if (settings.notificationPromptShown) return;
    if (settings.notificationsEnabled) return;
    if (!isNotificationSupported()) return;
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "denied") return;

    // Delay so it doesn't compete with exercise completion UI
    const t = setTimeout(() => {
      analytics.notificationPromptShown();
      toast({
        variant: "info",
        title: "Stay on track with reminders",
        message: "We only send practice reminders — nothing else.",
        cta: { label: "Enable reminders", onClick: openFrequencyModal },
        duration: 15000,
      });
      update("notificationPromptShown", true);
    }, 2000);

    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.journeyStage]);

  const handleFrequencySave = useCallback((frequency: PracticeFrequency) => {
    update("notificationsEnabled", true);
    update("practiceFrequency", frequency);
    analytics.notificationToggled(true);
  }, [update]);

  return { frequencyModalOpen, openFrequencyModal, closeFrequencyModal, handleFrequencySave };
}
