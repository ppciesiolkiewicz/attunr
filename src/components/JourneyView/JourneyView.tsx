"use client";

import { useRouter } from "next/navigation";
import { JourneyList } from "./components/JourneyList";
import type { Settings } from "@/hooks/useSettings";
import type { Band } from "@/constants/tone-slots";

interface JourneyViewProps {
  settings: Settings;
  pitchHz: number | null;
  pitchHzRef: React.RefObject<number | null>;
  onPlayTone: (band: Band) => void;
  onSettingsUpdate: <K extends keyof Settings>(
    key: K,
    value: Settings[K],
  ) => void;
}

export default function JourneyView({
  settings,
  pitchHz,
  pitchHzRef,
  onPlayTone,
  onSettingsUpdate,
}: JourneyViewProps) {
  const router = useRouter();

  return (
    <div className="h-full">
      <JourneyList
        settings={settings}
        onSelect={(stageId) => router.push(`/journey/${stageId}`)}
      />
    </div>
  );
}
