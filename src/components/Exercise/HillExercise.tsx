"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
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
    () => exercise.direction === "between" ? resolved.displayNotes : exerciseColoredNotes,
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

  const { progress, seqIndex, stageComplete: exerciseComplete, showStepCheck, resetProgress } =
    usePitchProgress({
      exercise: progressExercise,
      exerciseId,
      resolved: progressResolved,
      pitchHzRef,
      enabled: detectionActive,
    });

  const totalTargets = resolved.targets.length;
  const overallProgress = totalTargets > 1
    ? (seqIndex + progress) / totalTargets
    : progress;

  const REP_PHRASES = ["Nice!", "Good one!", "Keep going!"];
  const repPhrase = REP_PHRASES[(seqIndex - 1) % REP_PHRASES.length];

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
          <Text variant="caption" color="muted-1" className="text-center leading-snug max-w-[320px]">
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
        {!exerciseComplete && !showCongrats && !showStepCheck && pitchHz !== null && (
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
        {showStepCheck && !exerciseComplete && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
            <div className="step-check-appear flex flex-col items-center gap-2">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-violet-600/25 drop-shadow-lg">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <Text variant="body" className="text-violet-300 font-medium">{repPhrase}</Text>
              <Text variant="caption" color="muted-1">Round {seqIndex + 1}</Text>
            </div>
          </div>
        )}

        {/* Exercise completion checkmark + text */}
        {showCongrats && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
            <div className="congrats-appear flex flex-col items-center gap-2">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-violet-600/25 drop-shadow-lg">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <Text variant="heading-sm" className="text-violet-300">Congratulations!</Text>
            </div>
          </div>
        )}

        {/* Pitch info overlay */}
        {pitchHz !== null && (() => {
          const closest = exerciseColoredNotes.length > 0
            ? findClosestNote(pitchHz, exerciseColoredNotes) as ColoredNote
            : null;
          const target = resolved.targets[0];
          const targetNotes = target?.rangeNotes ?? (target ? [target.note] : []);
          const locked = target
            ? matchesNoteTarget(pitchHz, targetNotes, target.accept ?? "within")
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
                  {locked ? "Just right" : pitchHz < (closest?.frequencyHz ?? 0) ? "Too low" : "Too high"}
                </Text>
                <Text
                  as="div"
                  variant="body-sm"
                  className="mt-0.5"
                  style={{ color: `${closest?.color ?? "#fff"}cc` }}
                >
                  {locked ? "Keep it up" : pitchHz < (closest?.frequencyHz ?? 0) ? "Go higher" : "Go lower"}
                </Text>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Bottom panel */}
      <div className="border-t border-white/[0.06] bg-white/[0.02] px-3 sm:px-5 py-2 sm:pt-2.5 sm:pb-1.5 flex flex-row flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-4 shrink-0">
        <div className="shrink-0 order-first sm:order-none flex items-center gap-2">
          <ProgressArc progress={exerciseComplete ? 1 : overallProgress} complete={exerciseComplete} />
          {totalTargets > 1 && (
            <div className="flex items-center gap-1.5">
              {resolved.targets.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                    i < seqIndex
                      ? "bg-violet-400"
                      : i === seqIndex && !exerciseComplete
                        ? "bg-violet-400/50"
                        : "bg-white/15"
                  }`}
                />
              ))}
              <Text variant="caption" color="muted-1" className="ml-0.5 tabular-nums">
                {Math.min(seqIndex + 1, totalTargets)}/{totalTargets}
              </Text>
            </div>
          )}
        </div>

        <div className="flex flex-row items-center gap-2 sm:gap-3 flex-1 min-w-0 sm:flex-initial sm:min-w-0 justify-end sm:ml-auto">
          {exerciseComplete ? (
            <Button
              variant="outline"
              onClick={() => { resetProgress(); playReferenceTone(); }}
              className="shrink-0 px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm"
              title="Restart exercise"
            >
              ↺  Restart
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={playReferenceTone}
              className="shrink-0 px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm"
              title="Play reference tone"
            >
              ♪  Play tone
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
