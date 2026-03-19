"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { JourneyExercise } from "@/components/JourneyView";
import { useApp } from "@/context/AppContext";
import { journey } from "@/constants/journey";

export default function ExercisePageClient() {
  const params = useParams();
  const router = useRouter();
  const { settings, pitchHz, pitchHzRef, playTone, playSlide } = useApp();

  const chapterSlug = typeof params?.chapter === "string" ? params.chapter : "";
  const exerciseSlug = typeof params?.exercise === "string" ? params.exercise : "";

  const exercise = journey.getExerciseByRoute(chapterSlug, exerciseSlug) ?? null;
  const chapter = journey.getChapterBySlug(chapterSlug);

  useEffect(() => {
    if (!exercise) router.replace("/journey");
  }, [exercise, router]);

  if (!exercise || !chapter) return null;

  return (
    <JourneyExercise
      exercise={exercise}
      backLabel="← Chapter"
      settings={settings}
      pitchHz={pitchHz}
      pitchHzRef={pitchHzRef}
      onPlayTone={playTone}
      onPlaySlide={playSlide}
      onBack={() => router.push(journey.chapterHref(chapter))}
      onNext={(next) => router.push(journey.exerciseHref(next))}
      onPrev={(prev) => router.push(journey.exerciseHref(prev))}
    />
  );
}
