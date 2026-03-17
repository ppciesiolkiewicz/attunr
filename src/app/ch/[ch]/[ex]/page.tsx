"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { JourneyExercise } from "@/components/JourneyView";
import { useApp } from "@/context/AppContext";
import { journey } from "@/constants/journey";

/**
 * Chapter exercise page — URL-driven: /ch/[ch]/[ex]
 * [ch] = 1-based chapter number
 * [ex] = 1-based exercise index within chapter
 */
export default function ChapterExercisePage() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const { settings, pitchHz, pitchHzRef, playTone, playSlide, updateSettings } =
    useApp();

  // Parse route params
  const ch = typeof params?.ch === "string" ? parseInt(params.ch, 10) : NaN;
  const ex = typeof params?.ex === "string" ? parseInt(params.ex, 10) : NaN;

  const exercise =
    !isNaN(ch) && !isNaN(ex) ? journey.exerciseByRoute(ch, ex) : null;

  useEffect(() => {
    if (!exercise) router.replace("/journey");
  }, [exercise, router]);

  if (!exercise) return null;

  return (
    <JourneyExercise
      exerciseId={exercise.id}
      settings={settings}
      pitchHz={pitchHz}
      pitchHzRef={pitchHzRef}
      onPlayTone={playTone}
      onPlaySlide={playSlide}
      onSettingsUpdate={updateSettings}
      onBack={() => router.push(`/ch/${ch}`)}
      onNext={(nextId) => router.push(journey.exerciseHref(nextId))}
      onPrev={(prevId) => router.push(journey.exerciseHref(prevId))}
    />
  );
}
