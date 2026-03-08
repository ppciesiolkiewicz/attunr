"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { JourneyExercise } from "@/components/JourneyView";
import { useApp } from "@/context/AppContext";
import { JOURNEY_STAGES, TOTAL_JOURNEY_STAGES } from "@/constants/journey";

export default function ExercisePage() {
  const params = useParams();
  const router = useRouter();
  const { settings, pitchHz, pitchHzRef, playTone, updateSettings, openSettings } = useApp();

  const id = typeof params.id === "string" ? parseInt(params.id, 10) : NaN;
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
    />
  );
}
