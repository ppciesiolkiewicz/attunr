"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { JourneyExercise } from "@/components/JourneyView";
import { useApp } from "@/context/AppContext";
import { JOURNEY_STAGES, TOTAL_JOURNEY_STAGES } from "@/constants/journey";

export default function ExercisePage() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const { settings, pitchHz, pitchHzRef, playTone, updateSettings, openSettings } = useApp();

  // useParams can be empty on first render (Next.js 15+); fallback to parsing from pathname
  const idFromParams = typeof params?.id === "string" ? parseInt(params.id, 10) : NaN;
  const idFromPath = (() => {
    const match = pathname?.match(/^\/journey\/(\d+)$/);
    return match ? parseInt(match[1], 10) : NaN;
  })();
  const id = !isNaN(idFromParams) ? idFromParams : idFromPath;

  const isValid = !isNaN(id) && id >= 1 && id <= TOTAL_JOURNEY_STAGES;
  const stageExists = isValid && JOURNEY_STAGES.some((s) => s.id === id);

  useEffect(() => {
    if (!stageExists) router.replace("/");
  }, [stageExists, router]);

  if (!stageExists) return null;

  return (
    <JourneyExercise
      stageId={id}
      settings={settings}
      pitchHz={pitchHz}
      pitchHzRef={pitchHzRef}
      onPlayTone={playTone}
      onSettingsUpdate={updateSettings}
      onOpenSettings={openSettings}
      onBack={() => router.push("/")}
      onNext={(nextId) => router.push(`/journey/${nextId}`)}
      onPrev={(prevId) => router.push(`/journey/${prevId}`)}
    />
  );
}
