"use client";

import { useEffect } from "react";
import PracticeView from "@/components/PracticeView";
import { useApp } from "@/context/AppContext";
import { analytics } from "@/lib/analytics";

export default function PracticePage() {
  const { settings, pitchHz, pitchHzRef, playTone, updateSettings } = useApp();

  useEffect(() => {
    analytics.exploreViewed();
  }, []);

  return (
    <PracticeView
      settings={settings}
      pitchHz={pitchHz}
      pitchHzRef={pitchHzRef}
      onPlayTone={playTone}
      onSettingsUpdate={updateSettings}
    />
  );
}
