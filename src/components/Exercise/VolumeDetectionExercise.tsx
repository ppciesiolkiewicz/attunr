"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button, Text } from "@/components/ui";
import { useVolumeDetection } from "@/hooks/useVolumeDetection";
import { useRepCompletion, CongratsOverlay, StepCheckOverlay, RepDots } from "@/features/rep-progress";
import { ProgressArc } from "./components/ProgressArc";
import type { VolumeDetectionConfig } from "@/constants/journey";

interface VolumeDetectionExerciseProps {
  exercise: VolumeDetectionConfig;
  exerciseId: number;
  isLast: boolean;
  isAlreadyCompleted: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onPrev?: () => void;
}

export function VolumeDetectionExerciseContent({
  exercise,
  exerciseId,
  isLast,
  isAlreadyCompleted,
  onComplete,
  onSkip,
  onPrev,
}: VolumeDetectionExerciseProps) {
  const { volume, isActive, status, error, startListening, stopListening } = useVolumeDetection();
  const [accumulatedSeconds, setAccumulatedSeconds] = useState(0);
  const lastTickRef = useRef<number | null>(null);
  const repCompleteRef = useRef(false);

  const totalReps = exercise.reps ?? 1;

  const resetAccumulation = useCallback(() => {
    setAccumulatedSeconds(0);
    lastTickRef.current = null;
    repCompleteRef.current = false;
  }, []);

  const {
    currentRep,
    isComplete: exerciseComplete,
    completeRep,
    showStepCheck,
    showCongrats,
    repPhrase,
    resetProgress,
  } = useRepCompletion({
    totalReps,
    exerciseId,
    onRepAdvanced: resetAccumulation,
  });

  // Start listening on mount
  useEffect(() => {
    startListening();
    return () => stopListening();
  }, [startListening, stopListening]);

  // Reset accumulation on exercise change
  useEffect(() => {
    queueMicrotask(resetAccumulation);
  }, [exerciseId, resetAccumulation]);

  // Accumulate seconds when active.
  // Intentionally no dependency array — runs every render to sample time deltas.
  useEffect(() => {
    if (exerciseComplete || showStepCheck) return;

    if (isActive) {
      const now = performance.now();
      if (lastTickRef.current !== null) {
        const delta = (now - lastTickRef.current) / 1000;
        setAccumulatedSeconds((prev) => {
          const next = prev + delta;
          if (next >= exercise.targetSeconds && !repCompleteRef.current) {
            repCompleteRef.current = true;
            // Schedule completeRep outside of setState
            queueMicrotask(() => completeRep());
            return exercise.targetSeconds;
          }
          return next;
        });
      }
      lastTickRef.current = now;
    } else {
      lastTickRef.current = null;
    }
  });

  // Cycle through timed cues based on accumulated time
  const cues = exercise.cues;
  const cycleDuration = cues.reduce((sum, c) => sum + c.seconds, 0);
  let currentCue = cues[0]?.text ?? "";
  if (cycleDuration > 0) {
    const elapsed = accumulatedSeconds % cycleDuration;
    let cumulative = 0;
    for (const cue of cues) {
      cumulative += cue.seconds;
      if (elapsed < cumulative) {
        currentCue = cue.text;
        break;
      }
    }
  }

  const perRepProgress = exercise.targetSeconds > 0
    ? Math.min(accumulatedSeconds / exercise.targetSeconds, 1)
    : 0;

  const smoothOverallProgress = totalReps > 0
    ? (currentRep + perRepProgress) / totalReps
    : 0;

  const handleRestart = useCallback(() => {
    resetProgress();
    resetAccumulation();
  }, [resetProgress, resetAccumulation]);

  return (
    <>
      <div className="relative flex-1 min-h-0 flex flex-col items-center justify-center gap-6">
        {/* Instruction */}
        <div className="absolute top-2 left-0 right-0 z-10 pointer-events-none flex justify-center px-12">
          <Text variant="caption" color="muted-1" className="text-center leading-snug max-w-[320px]">
            {exercise.instruction.split("\n")[0]}
          </Text>
        </div>

        {/* Current cue */}
        <div className="text-4xl sm:text-5xl font-light text-white/90 tracking-wide">
          {currentCue}
        </div>

        {/* Vertical progress bar */}
        <div className="relative w-12 h-48 sm:h-64 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="absolute bottom-0 left-0 right-0 rounded-full bg-violet-500/60 transition-all duration-150"
            style={{ height: `${perRepProgress * 100}%` }}
          />
          {/* Volume indicator — thin bright bar showing current amplitude */}
          {isActive && (
            <div
              className="absolute bottom-0 left-0 right-0 bg-violet-300/40 transition-all duration-75"
              style={{ height: `${Math.min(volume * 500, 100)}%` }}
            />
          )}
        </div>

        {/* Time display */}
        <div className="text-sm text-white/50">
          {Math.floor(accumulatedSeconds)}s / {exercise.targetSeconds}s
        </div>

        {/* Status */}
        {status === "requesting-mic" && (
          <div className="text-sm text-white/40">Requesting microphone...</div>
        )}
        {error && (
          <div className="text-sm text-red-400">{error}</div>
        )}



        <StepCheckOverlay
          show={showStepCheck && !exerciseComplete}
          phrase={repPhrase}
          round={currentRep + 1}
          totalReps={totalReps}
        />

        <CongratsOverlay show={showCongrats} />
      </div>

      {/* Bottom panel */}
      <div className="border-t border-white/[0.06] bg-white/[0.02] px-3 sm:px-5 py-2 sm:pt-2.5 sm:pb-1.5 flex flex-row flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-4 shrink-0">
        <div className="shrink-0 order-first sm:order-0 flex items-center gap-2">
          <ProgressArc progress={exerciseComplete ? 1 : smoothOverallProgress} complete={exerciseComplete} />
          <RepDots totalReps={totalReps} currentRep={currentRep} isComplete={exerciseComplete} />
        </div>

        <div className="flex flex-row items-center gap-2 sm:gap-3 flex-1 min-w-0 sm:flex-initial sm:min-w-0 justify-end sm:ml-auto">
          {exerciseComplete && (
            <Button
              variant="outline"
              onClick={handleRestart}
              className="shrink-0 px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm"
              title="Restart exercise"
            >
              ↺  Restart
            </Button>
          )}
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
