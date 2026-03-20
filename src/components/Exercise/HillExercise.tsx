"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  useRepCompletion,
  CongratsOverlay,
  StepCheckOverlay,
  RepDots,
} from "@/features/rep-progress";
import HillBallCanvas from "@/components/HillBallCanvas";
import BalanceBallCanvas from "@/components/BalanceBallCanvas";
import type { InTuneOverride } from "@/components/PitchCanvas";
import { Button, CircularProgress, Text } from "@/components/ui";
import { findClosestNote, matchesNoteTarget } from "@/lib/pitch";
import type { ColoredNote } from "@/lib/VocalRange";
import { usePitchProgress } from "./PitchExercise/usePitchProgress";
import { useTonePlayer } from "@/hooks/useTonePlayer";
import { ProgressArc } from "./components/ProgressArc";
import type { PitchDetectionHillConfig } from "@/constants/journey";
import type { PitchDetectionHillExercise as ResolvedHillExercise } from "@/constants/journey";

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
  const [detectionActive, setDetectionActive] = useState(false);
  const { playTone: playRawTone, playWobble, playOwlHoot } = useTonePlayer();

  const exerciseColoredNotes = useMemo(
    () => resolved.targets.map((t) => t.note),
    [resolved],
  );

  const canvasBands = useMemo(
    () =>
      exercise.direction === "between"
        ? resolved.displayNotes
        : exerciseColoredNotes,
    [exercise.direction, resolved.displayNotes, exerciseColoredNotes],
  );

  const accept: "above" | "below" =
    exercise.direction === "up" ? "above" : "below";

  const inTuneOverride: InTuneOverride | undefined = useMemo(() => {
    if (exercise.direction !== "between") return undefined;
    const rangeNotes = resolved.targets[0]?.rangeNotes;
    if (!rangeNotes || rangeNotes.length < 2) return undefined;
    return { bands: rangeNotes, accept: "within" as const };
  }, [exercise.direction, resolved.targets]);

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

  const {
    progress,
    seqIndex,
    stageComplete: exerciseComplete,
    showStepCheck,
    resetProgress,
  } = usePitchProgress({
    exercise: progressExercise,
    exerciseId,
    resolved: progressResolved,
    pitchHzRef,
    enabled: detectionActive,
  });

  const totalTargets = resolved.targets.length;
  const overallProgress =
    totalTargets > 1 ? (seqIndex + progress) / totalTargets : progress;

  const REP_PHRASES = ["Nice!", "Good one!", "Keep going!"];
  const repPhrase = REP_PHRASES[(seqIndex - 1) % REP_PHRASES.length];

  const { showCongrats, completeRep: completeFinal } = useRepCompletion({
    totalReps: 1,
    exerciseId,
  });

  useEffect(() => {
    if (exerciseComplete) completeFinal();
  }, [exerciseComplete, completeFinal]);

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

  useEffect(() => {
    setDetectionActive(false);
    const id = setTimeout(() => {
      playReferenceTone();
      setDetectionActive(true);
    }, 500);
    return () => clearTimeout(id);
  }, [exerciseId, playReferenceTone]);

  return (
    <>
      <div className="relative flex-1 min-h-0">
        {/* Instruction cue — always visible */}
        <div className="absolute top-2 left-0 right-0 z-10 pointer-events-none flex justify-center px-12">
          <Text
            variant="caption"
            color="muted-1"
            className="text-center leading-snug max-w-[320px]"
          >
            {exercise.instruction.split("\n")[0]}
          </Text>
        </div>

        {/* Canvas */}
        {exercise.direction === "between" ? (
          <BalanceBallCanvas
            bands={canvasBands}
            currentHzRef={pitchHzRef}
            highlightIds={resolved.highlightIds}
            inTuneOverride={inTuneOverride}
          />
        ) : (
          <HillBallCanvas
            bands={exerciseColoredNotes}
            currentHzRef={pitchHzRef}
            direction={exercise.direction}
            accept={accept}
          />
        )}

        {/* Per-rep progress ring */}
        {!exerciseComplete &&
          !showCongrats &&
          !showStepCheck &&
          pitchHz !== null && (
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

        {/* Rep completion checkmark + text */}
        <StepCheckOverlay
          show={showStepCheck && !exerciseComplete}
          phrase={repPhrase}
          round={seqIndex + 1}
          totalReps={totalTargets}
        />

        {/* Exercise completion checkmark + text */}
        <CongratsOverlay show={showCongrats} />

        {/* Pitch info overlay */}
        {pitchHz !== null &&
          (() => {
            const closest =
              exerciseColoredNotes.length > 0
                ? (findClosestNote(
                    pitchHz,
                    exerciseColoredNotes,
                  ) as ColoredNote)
                : null;
            const target = resolved.targets[0];
            const targetNotes =
              target?.rangeNotes ?? (target ? [target.note] : []);
            const locked = target
              ? matchesNoteTarget(
                  pitchHz,
                  targetNotes,
                  target.accept ?? "within",
                )
              : false;
            return (
              <div className="pointer-events-none absolute top-3 left-4 right-4 fade-in flex items-start justify-between gap-4">
                <div className="shrink-0">
                  <Text
                    as="div"
                    variant="heading-lg"
                    className="text-3xl font-light"
                    style={{ color: closest?.color ?? "#fff" }}
                  >
                    {locked
                      ? "Just right"
                      : pitchHz < (closest?.frequencyHz ?? 0)
                        ? "Too low"
                        : "Too high"}
                  </Text>
                  <Text
                    as="div"
                    variant="body-sm"
                    className="mt-0.5"
                    style={{ color: `${closest?.color ?? "#fff"}cc` }}
                  >
                    {locked
                      ? "Keep it up"
                      : pitchHz < (closest?.frequencyHz ?? 0)
                        ? "Go higher"
                        : "Go lower"}
                  </Text>
                </div>
              </div>
            );
          })()}
      </div>

      {/* Bottom panel */}
      <div className="border-t border-white/[0.06] bg-white/[0.02] px-3 sm:px-5 py-2 sm:pt-2.5 sm:pb-1.5 flex flex-row flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-4 shrink-0">
        <div className="shrink-0 order-first sm:order-none flex items-center gap-2">
          <ProgressArc
            progress={exerciseComplete ? 1 : overallProgress}
            complete={exerciseComplete}
          />
          <RepDots
            totalReps={totalTargets}
            currentRep={seqIndex}
            isComplete={exerciseComplete}
          />
        </div>

        <div className="flex flex-row items-center gap-2 sm:gap-3 flex-1 min-w-0 sm:flex-initial sm:min-w-0 justify-end sm:ml-auto">
          {exerciseComplete ? (
            <Button
              variant="outline"
              onClick={() => {
                resetProgress();
                playReferenceTone();
              }}
              className="shrink-0 px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm"
              title="Restart exercise"
            >
              ↺ Restart
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={playReferenceTone}
              className="shrink-0 px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm"
              title="Play reference tone"
            >
              ♪ Play<span className="hidden sm:inline">&nbsp;tone</span>
            </Button>
          )}
          <div className="flex gap-2 flex-1 sm:flex-initial min-w-0">
            {exerciseId > 1 && onPrev && (
              <Button
                variant="outline"
                onClick={onPrev}
                title="Previous exercise"
                className="flex-1 sm:flex-initial sm:min-w-[6.5rem] px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm min-w-0"
              >
                ←<span className="hidden sm:inline"> Prev</span>
              </Button>
            )}
            {exerciseComplete || isAlreadyCompleted ? (
              <Button
                onClick={onComplete}
                className="flex-1 sm:flex-initial sm:min-w-[6.5rem] px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm min-w-0"
              >
                {isLast ? "Complete ✓" : <><span className="hidden sm:inline">Next </span>→</>}
              </Button>
            ) : (
              <Button
                onClick={onSkip}
                title="Skip this step (won't mark as complete)"
                className="flex-1 sm:flex-initial sm:min-w-[6.5rem] px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm min-w-0"
              >
                <span className="hidden sm:inline">Skip </span>→
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
