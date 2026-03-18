"use client";

import { useRouter } from "next/navigation";
import { journey } from "@/constants/journey";
import { Text, Button } from "@/components/ui";
import { toRoman } from "@/lib/format";
import { ExerciseCard } from "@/components/JourneyView";
import type { Chapter, ExerciseConfig } from "@/constants/journey";
import { useApp } from "@/context/AppContext";

interface ChapterDetailProps {
  chapter: Chapter;
}

export function ChapterDetail({ chapter }: ChapterDetailProps) {
  const router = useRouter();
  const { journeyProgress: jp } = useApp();

  const allStages = chapter.warmup
    ? [chapter.warmup, ...chapter.stages]
    : chapter.stages;
  const allExercises = allStages.flatMap((s) => s.exercises);

  const nextExercise = jp.findNextExercise(allExercises);
  const nextHref = nextExercise ? journey.exerciseHref(nextExercise) : null;
  const started = jp.isStarted(allExercises);
  const firstExercise = allExercises[0];

  function handleSelect(exercise: ExerciseConfig) {
    router.push(journey.exerciseHref(exercise));
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
              {started ? `Continue — ${nextExercise!.title}` : "Start"}
            </Button>
          )}
          {started && firstExercise && (
            <Button variant="ghost" onClick={() => router.push(journey.exerciseHref(firstExercise))}>
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
                jp={jp}
                onSelect={handleSelect}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
