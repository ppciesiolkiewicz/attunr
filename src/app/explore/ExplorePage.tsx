"use client";

import { useEffect } from "react";
import TrainView from "@/components/TrainView";
import { useApp } from "@/context/AppContext";
import { analytics } from "@/lib/analytics";

export default function ExplorePage() {
  const { settings, pitchHz, pitchHzRef, playTone, updateSettings } = useApp();

  useEffect(() => {
    analytics.exploreViewed();
  }, []);

  return (
    <TrainView
      settings={settings}
      pitchHz={pitchHz}
      pitchHzRef={pitchHzRef}
      onPlayTone={playTone}
      onSettingsUpdate={updateSettings}
    />
  );
}
