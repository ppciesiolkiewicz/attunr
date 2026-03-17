"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import HillBallCanvas from "@/components/HillBallCanvas";
import { Button, CircularProgress, Text } from "@/components/ui";
import { usePitchProgress } from "./PitchExercise/usePitchProgress";
import { useTonePlayer } from "@/hooks/useTonePlayer";
import { ExerciseStartButton } from "./ExerciseStartButton";
import { ProgressArc } from "./components/ProgressArc";
import type { PitchDetectionHillConfig } from "@/constants/journey";
import type { PitchDetectionHillExercise as ResolvedHillExercise } from "@/lib/resolve-exercise";

interface HillExerciseProps {
  exercise: PitchDetectionHillConfig;
  exerciseId: number;
  isLast: boolean;
  resolved: ResolvedHillExercise;
  pitchHz: number | null;
  pitchHzRef: React.RefObject<number | null>;
  isAlreadyCompleted: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onPrev?: () => void;
}

export function HillExercise({
  exercise,
  exerciseId,
  isLast,
  resolved,
  pitchHz,
  pitchHzRef,
  isAlreadyCompleted,
  onComplete,
  onSkip,
  onPrev,
}: HillExerciseProps) {
  const [hasStarted, setHasStarted] = useState(false);
  const [detectionActive, setDetectionActive] = useState(false);
  const { playTone: playRawTone, playWobble, playOwlHoot } = useTonePlayer();

  const exerciseColoredNotes = useMemo(
    () => resolved.targets.map((t) => t.note),
    [resolved],
  );

  const accept: "above" | "below" =
    exercise.direction === "up" ? "above" : "below";

  // usePitchProgress expects PitchDetectionConfig | PitchDetectionSlideConfig.
  // We cast since PitchDetectionHillConfig has the same note/target structure.
  const progressExercise = useMemo(
    () => ({
      ...exercise,
      exerciseTypeId: "pitch-detection" as const,
    }),
    [exercise],
  );

  const progressResolved = useMemo(
    () => ({
      ...resolved,
      exerciseTypeId: "pitch-detection" as const,
    }),
    [resolved],
  );

  const { progress, stageComplete: exerciseComplete, resetProgress } =
    usePitchProgress({
      exercise: progressExercise,
      exerciseId,
      resolved: progressResolved,
      pitchHzRef,
      enabled: detectionActive,
    });

  const [showCongrats, setShowCongrats] = useState(false);

  useEffect(() => {
    if (!exerciseComplete) return;
    setShowCongrats(true);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.45 } });
    const id = setTimeout(() => setShowCongrats(false), 2400);
    return () => clearTimeout(id);
  }, [exerciseComplete]);

  // Tone playback
  const toneShape = resolved.toneShape;

  const playReferenceTone = useCallback(() => {
    const freq = exerciseColoredNotes[0]?.frequencyHz;
    if (!freq) return;
    switch (toneShape.kind) {
      case "wobble":
        playWobble(freq, { binaural: true });
        break;
      case "owl-hoot":
        playOwlHoot(freq, { binaural: true });
        break;
      default:
        playRawTone(freq, { binaural: true });
        break;
    }
  }, [toneShape, exerciseColoredNotes, playWobble, playOwlHoot, playRawTone]);

  const handleExerciseStart = useCallback(() => {
    setHasStarted(true);
    setTimeout(() => {
      playReferenceTone();
      setDetectionActive(true);
    }, 500);
  }, [playReferenceTone]);

  const handleRestart = useCallback(() => {
    resetProgress();
    playReferenceTone();
  }, [resetProgress, playReferenceTone]);

  useEffect(() => {
    setHasStarted(false);
    setDetectionActive(false);
  }, [exerciseId]);

  return (
    <>
      <div className="relative flex-1 min-h-0">
        {/* Instruction cue — always visible */}
        <div className="absolute top-2 left-0 right-0 z-10 pointer-events-none flex justify-center px-12">
          <Text variant="caption" color="muted-1" className="text-center leading-snug max-w-[320px]">
            {exercise.instruction.split("\n")[0]}
          </Text>
        </div>

        {/* Canvas */}
        <HillBallCanvas
          bands={exerciseColoredNotes}
          currentHzRef={pitchHzRef}
          direction={exercise.direction}
          accept={accept}
        />

        {/* Start button */}
        {!hasStarted && <ExerciseStartButton onStart={handleExerciseStart} />}

        {/* Progress ring */}
        {!exerciseComplete && !showCongrats && pitchHz !== null && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-5 transition-opacity duration-300">
            <CircularProgress
              progress={progress}
              size={200}
              strokeWidth={5}
              showLabel
              className="opacity-35"
            />
          </div>
        )}

        {/* Completion checkmark */}
        {showCongrats && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
            <div className="congrats-appear flex items-center justify-center w-20 h-20 rounded-full bg-violet-600/25 drop-shadow-lg">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
        )}

        {/* Pitch info overlay */}
        {pitchHz !== null && (
          <div className="pointer-events-none absolute top-3 left-4 right-4 fade-in flex items-start justify-between gap-4">
            <div className="shrink-0">
              <Text
                as="div"
                variant="heading-lg"
                className="font-light"
                style={{ color: exerciseColoredNotes[0]?.color ?? "#fff" }}
              >
                {exerciseComplete ? "✓ " : ""}
                {exercise.direction === "up" ? "Go higher" : "Go lower"}
              </Text>
            </div>
          </div>
        )}
      </div>

      {/* Bottom panel */}
      <div className="border-t border-white/[0.06] bg-white/[0.02] px-3 sm:px-5 py-2 sm:pt-2.5 sm:pb-1.5 flex flex-row flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-4 shrink-0">
        <div className="shrink-0 order-first sm:order-none flex items-center gap-2">
          <ProgressArc progress={exerciseComplete ? 1 : progress} complete={exerciseComplete} />
        </div>

        <div className="flex flex-row items-center gap-2 sm:gap-3 flex-1 min-w-0 sm:flex-initial sm:min-w-0 justify-end sm:ml-auto">
          {hasStarted && (
            <Button
              variant="outline"
              onClick={handleRestart}
              className="shrink-0 px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm"
              title="Restart exercise"
            >
              ↺ Restart
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
