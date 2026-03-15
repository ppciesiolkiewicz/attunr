"use client";

import {
  JOURNEY_CONFIG,
} from "@/constants/journey";
import type { Settings } from "@/hooks/useSettings";
import { ExerciseCard } from "./ExerciseCard";
import { BadgeIcon } from "./BadgeIcon";
import { toRoman } from "../utils";

interface JourneyListProps {
  settings: Settings;
  onSelect: (exerciseId: number) => void;
}

export function JourneyList({ settings, onSelect }: JourneyListProps) {
  const { journeyStage: highestCompleted } = settings;

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex flex-col gap-4 px-5 py-5 max-w-2xl mx-auto w-full">
        <h1 className="text-xl sm:text-2xl font-semibold text-white">Journey</h1>
        <div className="flex flex-col gap-2 text-sm text-white/75 leading-relaxed">
          <p>
            This is where your journey begins. You&apos;ll be guided through
            learning and practice — from vocal warmups to sustaining each tone
            and exploring techniques like mantras and vowels.
          </p>
          <p>
            When you&apos;ve built confidence, switch to Train for freeform
            practice — any tone, any order.
          </p>
        </div>

        {JOURNEY_CONFIG.map((part) => {
          if (part.exercises.length === 0) return null;
          const lastExerciseId = part.exercises[part.exercises.length - 1].id;
          const partComplete = highestCompleted >= lastExerciseId;
          return (
            <section key={part.part} className="flex flex-col gap-2">
              <header className="flex items-center gap-3 mb-0.5">
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs uppercase tracking-widest text-white/55">
                    Part {toRoman(part.part)}
                  </span>
                  <span className="text-xs text-white/80 font-medium">
                    {part.title}
                  </span>
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
