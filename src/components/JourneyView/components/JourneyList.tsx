"use client";

import { journey } from "@/constants/journey";
import type { ExerciseConfig } from "@/constants/journey";
import { Text } from "@/components/ui";
import { toRoman } from "@/lib/format";
import { ExerciseCard } from "./ExerciseCard";
import { BadgeIcon } from "./BadgeIcon";
import { useApp } from "@/context/AppContext";

interface JourneyListProps {
  onSelect: (exercise: ExerciseConfig) => void;
}

export function JourneyList({ onSelect }: JourneyListProps) {
  const { journeyProgress: jp } = useApp();

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex flex-col gap-4 px-5 py-5 max-w-2xl mx-auto w-full">
        <Text variant="heading" as="h1" className="sm:text-2xl">Journey</Text>
        <div className="flex flex-col gap-2">
          <Text variant="body-sm" color="text-2">
            This is where your journey begins. You&apos;ll be guided through
            learning and practice — from vocal warmups to sustaining each tone
            and exploring techniques like mantras and vowels.
          </Text>
          <Text variant="body-sm" color="text-2">
            When you&apos;ve built confidence, switch to Train for freeform
            practice — any tone, any order.
          </Text>
        </div>

        {journey.chapters.map((chapter) => {
          const allStages = chapter.warmup
            ? [chapter.warmup, ...chapter.stages]
            : chapter.stages;
          const allExercises = allStages.flatMap((s) => s.exercises);
          if (allExercises.length === 0) return null;
          const chapterComplete = jp.isChapterCompleted(chapter.slug);

          return (
            <section key={chapter.chapter} className="flex flex-col gap-2">
              <header className="flex items-center gap-3 mb-0.5">
                <div className="flex items-center gap-2 shrink-0">
                  <Text variant="label" as="span" color="muted-1">
                    Chapter {toRoman(chapter.chapter)}
                  </Text>
                  <Text variant="caption" as="span" color="text-2" className="font-medium">
                    {chapter.title}
                  </Text>
                  {chapterComplete && (
                    <BadgeIcon
                      className="text-violet-400/90"
                      style={{ width: 12, height: 12 }}
                    />
                  )}
                </div>
                <div className="flex-1 h-px bg-white/[0.05]" />
              </header>

              {allStages.map((stage) => (
                <div key={stage.id} className="flex flex-col gap-1.5">
                  <Text variant="caption" as="span" color="muted-2" className="pl-1 pt-1">
                    {stage.title}
                  </Text>
                  {stage.exercises.map((exercise) => (
                    <ExerciseCard
                      key={exercise.id}
                      exercise={exercise}
                      jp={jp}
                      onSelect={onSelect}
                    />
                  ))}
                </div>
              ))}
            </section>
          );
        })}
      </div>
    </div>
  );
}
