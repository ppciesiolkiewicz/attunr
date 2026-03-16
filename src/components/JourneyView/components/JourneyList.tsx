"use client";

import { useSearchParams } from "next/navigation";
import {
  JOURNEY_CONFIG,
} from "@/constants/journey";
import { Text } from "@/components/ui";
import type { Settings } from "@/hooks/useSettings";
import { ExerciseCard } from "./ExerciseCard";
import { BadgeIcon } from "./BadgeIcon";
import { toRoman } from "../utils";

interface JourneyListProps {
  settings: Settings;
  onSelect: (exerciseId: number) => void;
}

export function JourneyList({ settings, onSelect }: JourneyListProps) {
  const searchParams = useSearchParams();
  const unlockAll = searchParams.has("unlock");
  const { journeyStage } = settings;
  const highestCompleted = unlockAll ? Infinity : journeyStage;

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

        {JOURNEY_CONFIG.map((part) => {
          if (part.exercises.length === 0) return null;
          const lastExerciseId = part.exercises[part.exercises.length - 1].id;
          const partComplete = highestCompleted >= lastExerciseId;
          return (
            <section key={part.part} className="flex flex-col gap-2">
              <header className="flex items-center gap-3 mb-0.5">
                <div className="flex items-center gap-2 shrink-0">
                  <Text variant="label" as="span" color="muted-1">
                    Part {toRoman(part.part)}
                  </Text>
                  <Text variant="caption" as="span" color="text-2" className="font-medium">
                    {part.title}
                  </Text>
                  {partComplete && (
                    <BadgeIcon
                      className="text-violet-400/90"
                      style={{ width: 12, height: 12 }}
                    />
                  )}
                </div>
                <div className="flex-1 h-px bg-white/[0.05]" />
              </header>
              {part.exercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  highestCompleted={highestCompleted}
                  onSelect={onSelect}
                />
              ))}
            </section>
          );
        })}
      </div>
    </div>
  );
}
