"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { journey } from "@/constants/journey";
import { Text, Button } from "@/components/ui";
import { toRoman } from "@/lib/format";
import { ExerciseCard } from "@/components/JourneyView/components/ExerciseCard";
import type { Chapter } from "@/constants/journey";
import type { Settings } from "@/hooks/useSettings";

interface ChapterDetailProps {
  chapter: Chapter;
  settings: Settings;
}

export function ChapterDetail({ chapter, settings }: ChapterDetailProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const unlockAll = searchParams.has("unlock");
  const highestCompleted = unlockAll ? Infinity : settings.journeyStage;

  const allStages = chapter.warmup
    ? [chapter.warmup, ...chapter.stages]
    : chapter.stages;
  const allExercises = allStages.flatMap((s) => s.exercises);

  // Find next exercise
  const nextExercise = allExercises.find((e) => e.id > highestCompleted);
  const nextHref = nextExercise ? journey.exerciseHref(nextExercise.id) : null;
  const isStarted = allExercises.some((e) => e.id <= highestCompleted);

  function handleSelect(exerciseId: number) {
    router.push(journey.exerciseHref(exerciseId));
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex flex-col gap-4 px-5 py-5 max-w-2xl mx-auto w-full">
        {/* Back link */}
        <Button
          variant="ghost"
          onClick={() => router.push("/journey")}
          className="self-start text-xs hover:text-white/72 -ml-2"
          style={{ color: "rgba(255,255,255,0.48)" }}
        >
          &larr; Journey
        </Button>

        {/* Chapter header */}
        <div>
          <Text variant="label" as="span" style={{ color: "rgba(168,133,246,0.5)" }}>
            Chapter {toRoman(chapter.chapter)}
          </Text>
          <Text variant="heading" as="h1" className="mt-1 sm:text-2xl">
            {chapter.title}
          </Text>
          <Text variant="body-sm" as="p" className="mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
            {chapter.description}
          </Text>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {nextHref && (
            <Button variant="primary" onClick={() => router.push(nextHref)}>
              {isStarted ? `Continue — ${nextExercise!.title}` : "Start"}
            </Button>
          )}
          {isStarted && (
            <Button variant="ghost" onClick={() => router.push(`/ch/${chapter.chapter}/1`)}>
              Start from beginning
            </Button>
          )}
        </div>

        {/* Exercise list by stage */}
        {allStages.map((stage) => (
          <div key={stage.id} className="flex flex-col gap-1.5">
            <Text variant="caption" as="span" className="pl-1 pt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
              {stage.title}
            </Text>
            {stage.exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                highestCompleted={highestCompleted}
                onSelect={handleSelect}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
