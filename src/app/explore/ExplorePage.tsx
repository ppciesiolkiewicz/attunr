"use client";

import TrainView from "@/components/TrainView";
import { useApp } from "@/context/AppContext";

export default function ExplorePage() {
  const { settings, pitchHz, pitchHzRef, playTone, updateSettings } = useApp();

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
