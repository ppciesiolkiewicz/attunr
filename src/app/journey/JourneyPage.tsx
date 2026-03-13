"use client";

import JourneyView from "@/components/JourneyView";
import { useApp } from "@/context/AppContext";

export default function JourneyPage() {
  const { settings, pitchHz, pitchHzRef, playTone, updateSettings, openSettings } = useApp();

  return (
    <JourneyView
      settings={settings}
      pitchHz={pitchHz}
      pitchHzRef={pitchHzRef}
      onPlayTone={playTone}
      onSettingsUpdate={updateSettings}
      onOpenSettings={openSettings}
    />
  );
}
