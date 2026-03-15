"use client";

import { Button } from "@/components/ui";
import { ContentElements } from "./components/ContentElements";
import type { LearnExercise as LearnExerciseConfig } from "@/constants/journey";

interface LearnExerciseProps {
  exercise: LearnExerciseConfig;
  exerciseId: number;
  partTitle: string;
  partRoman: string;
  stepIndex: number;
  stepsInPart: number;
  isLast: boolean;
  onComplete: () => void;
  onPrev?: () => void;
}

export function LearnExercise({
  exercise,
  exerciseId,
  partTitle,
  partRoman,
  stepIndex,
  stepsInPart,
  isLast,
  onComplete,
  onPrev,
}: LearnExerciseProps) {
  return (
    <>
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-lg mx-auto px-5 py-6 flex flex-col gap-6">
          <div className="pb-2 border-b border-white/[0.08]">
            <h2 className="text-xl font-semibold text-white">
              Part {partRoman} — {partTitle}
            </h2>
            <p className="text-sm text-white/65 mt-0.5">
              {exercise.title} · {stepIndex} of {stepsInPart}
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <ContentElements elements={exercise.elements} />
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.06] bg-white/[0.02] px-3 sm:px-5 py-2 sm:pt-2.5 sm:pb-1.5 flex flex-row flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-4 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 ml-auto w-full sm:w-auto justify-end">
          {exerciseId > 1 && onPrev && (
            <Button variant="outline" onClick={onPrev} title="Previous" className="flex-1 sm:flex-none px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm min-w-0">
              ← Prev
            </Button>
          )}
          <Button onClick={onComplete} className="flex-1 sm:flex-none px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm min-w-0">
            {isLast ? "Complete ✓" : "Next →"}
          </Button>
        </div>
      </div>
    </>
  );
}
