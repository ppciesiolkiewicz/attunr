"use client";

import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui";
import { useVolumeDetection } from "@/hooks/useVolumeDetection";
import type { VolumeDetectionExercise as VolumeDetectionConfig } from "@/constants/journey";

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
  const [exerciseComplete, setExerciseComplete] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const lastTickRef = useRef<number | null>(null);

  // Start listening on mount
  useEffect(() => {
    startListening();
    return () => stopListening();
  }, [startListening, stopListening]);

  // Accumulate seconds when active.
  // Intentionally no dependency array — runs every render to sample time deltas.
  useEffect(() => {
    if (exerciseComplete) return;

    if (isActive) {
      const now = performance.now();
      if (lastTickRef.current !== null) {
        const delta = (now - lastTickRef.current) / 1000;
        setAccumulatedSeconds((prev) => {
          const next = prev + delta;
          if (next >= exercise.targetSeconds) {
            setExerciseComplete(true);
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

  // Congrats animation
  useEffect(() => {
    if (!exerciseComplete) return;
    setShowCongrats(true);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.45 } });
    const id = setTimeout(() => setShowCongrats(false), 2400);
    return () => clearTimeout(id);
  }, [exerciseComplete]);

  // Cycle cues based on accumulated time (every 3 seconds)
  const cueDuration = 3;
  const currentCueIndex = exercise.cues.length > 0
    ? Math.floor(accumulatedSeconds / cueDuration) % exercise.cues.length
    : 0;
  const currentCue = exercise.cues[currentCueIndex] ?? "";

  const progress = exercise.targetSeconds > 0
    ? Math.min(accumulatedSeconds / exercise.targetSeconds, 1)
    : 0;

  return (
    <>
      <div className="relative flex-1 min-h-0 flex flex-col items-center justify-center gap-6">
        {/* Current cue */}
        <div className="text-4xl sm:text-5xl font-light text-white/90 tracking-wide">
          {currentCue}
        </div>

        {/* Vertical progress bar */}
        <div className="relative w-12 h-48 sm:h-64 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="absolute bottom-0 left-0 right-0 rounded-full bg-violet-500/60 transition-all duration-150"
            style={{ height: `${progress * 100}%` }}
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

        {showCongrats && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
            <div className="congrats-appear flex items-center justify-center w-20 h-20 rounded-full bg-violet-600/25 drop-shadow-lg">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
        )}
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
