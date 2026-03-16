"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { JourneyList } from "./components/JourneyList";
import type { Settings } from "@/hooks/useSettings";
import type { ColoredNote } from "@/constants/tone-slots";

interface JourneyViewProps {
  settings: Settings;
  pitchHz: number | null;
  pitchHzRef: React.RefObject<number | null>;
  onPlayTone: (band: ColoredNote) => void;
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
      <Suspense>
        <JourneyList
          settings={settings}
          onSelect={(exerciseId) => router.push(`/journey/${exerciseId}`)}
        />
      </Suspense>
    </div>
  );
}
