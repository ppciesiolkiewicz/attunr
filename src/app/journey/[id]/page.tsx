"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { JourneyExercise } from "@/components/JourneyView";
import { useApp } from "@/context/AppContext";
import { JOURNEY_EXERCISES } from "@/constants/journey";

/**
 * Journey step page — URL-driven: /journey/[id]
 * 1. Get exercise id from URL
 * 2. Validate & find exercise
 * 3. Render JourneyExercise (exercise or learn content by exercise type)
 * 4. Completion modal on last step of part → Continue navigates to next URL
 */
export default function ExercisePage() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const { settings, pitchHz, pitchHzRef, playTone, playSlide, updateSettings } = useApp();

  // useParams can be empty on first render (Next.js 15+); fallback to parsing from pathname
  const idFromParams = typeof params?.id === "string" ? parseInt(params.id, 10) : NaN;
  const idFromPath = (() => {
    const match = pathname?.match(/^\/journey\/(\d+)$/);
    return match ? parseInt(match[1], 10) : NaN;
  })();
  const id = !isNaN(idFromParams) ? idFromParams : idFromPath;

  const isValid = !isNaN(id) && id >= 1 && id <= JOURNEY_EXERCISES.length;
  const exerciseExists = isValid && JOURNEY_EXERCISES.some((e) => e.id === id);

  useEffect(() => {
    if (!exerciseExists) router.replace("/");
  }, [exerciseExists, router]);

  if (!exerciseExists) return null;

  return (
    <JourneyExercise
      exerciseId={id}
      settings={settings}
      pitchHz={pitchHz}
      pitchHzRef={pitchHzRef}
      onPlayTone={playTone}
      onPlaySlide={playSlide}
      onSettingsUpdate={updateSettings}
      onBack={() => router.push("/journey")}
      onNext={(nextId) => router.push(`/journey/${nextId}`)}
      onPrev={(prevId) => router.push(`/journey/${prevId}`)}
    />
  );
}
