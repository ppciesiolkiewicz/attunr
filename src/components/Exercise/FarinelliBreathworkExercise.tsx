"use client";

import { useState, useEffect } from "react";
import { useRepCompletion, CongratsOverlay } from "@/features/rep-progress";
import { FarinelliExercise } from "@/components/FarinelliExercise";
import { Button } from "@/components/ui";
import type { FarinelliBreathworkConfig } from "@/constants/journey";

interface FarinelliBreathworkExerciseProps {
  exercise: FarinelliBreathworkConfig;
  exerciseId: number;
  isLast: boolean;
  isAlreadyCompleted: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onPrev?: () => void;
}

export function FarinelliBreathworkExerciseContent({
  exercise,
  exerciseId,
  isLast,
  isAlreadyCompleted,
  onComplete,
  onSkip,
  onPrev,
}: FarinelliBreathworkExerciseProps) {
  const [exerciseComplete, setExerciseComplete] = useState(false);
  const [prevExerciseId, setPrevExerciseId] = useState(exerciseId);

  if (prevExerciseId !== exerciseId) {
    setPrevExerciseId(exerciseId);
    setExerciseComplete(false);
  }

  const { showCongrats, completeRep: completeFinal } = useRepCompletion({
    totalReps: 1,
    exerciseId,
  });

  useEffect(() => {
    if (exerciseComplete) completeFinal();
  }, [exerciseComplete, completeFinal]);

  return (
    <>
      <div className="relative flex-1 min-h-0 flex items-center justify-center">
        <FarinelliExercise
          maxCount={exercise.maxCount}
          startCount={4}
          onComplete={() => setExerciseComplete(true)}
        />
        <CongratsOverlay show={showCongrats} />
      </div>

      <div className="border-t border-white/[0.06] bg-white/[0.02] px-3 sm:px-5 py-2 sm:pt-2.5 sm:pb-1.5 flex flex-row flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-4 shrink-0">
        <div className="flex flex-row items-center gap-2 sm:gap-3 flex-1 min-w-0 sm:flex-initial sm:min-w-0 justify-end sm:ml-auto">
          <div className="flex gap-2 flex-1 sm:flex-initial min-w-0">
            {exerciseId > 1 && onPrev && (
              <Button variant="outline" onClick={onPrev} title="Previous exercise" className="flex-1 sm:flex-initial sm:min-w-[6.5rem] px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm min-w-0">
                ← Prev
              </Button>
            )}
            {(exerciseComplete || isAlreadyCompleted) ? (
              <Button onClick={onComplete} className="flex-1 sm:flex-initial sm:min-w-[6.5rem] px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm min-w-0">
                {isLast ? "Complete ✓" : "Next →"}
              </Button>
            ) : (
              <Button onClick={onSkip} title="Skip this step (won't mark as complete)" className="flex-1 sm:flex-initial sm:min-w-[6.5rem] px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm min-w-0">
                Skip →
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
