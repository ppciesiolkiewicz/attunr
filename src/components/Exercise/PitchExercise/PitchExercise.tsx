"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import PitchCanvas from "@/components/PitchCanvas";
import BalanceBallCanvas from "@/components/BalanceBallCanvas";
import HillBallCanvas from "@/components/HillBallCanvas";
import { Button, CircularProgress } from "@/components/ui";
import { usePitchProgress } from "./usePitchProgress";
import { ProgressArc } from "../components/ProgressArc";
import type { PitchDetectionExercise, PitchDetectionSlideExercise } from "@/constants/journey";
import { findClosestBand, isInTune, matchesBandTarget, resolveBandTarget } from "@/lib/pitch";
import type { Band } from "@/constants/tone-slots";

interface PitchExerciseProps {
  exercise: PitchDetectionExercise | PitchDetectionSlideExercise;
  exerciseId: number;
  isLast: boolean;
  allBands: Band[];
  pitchHz: number | null;
  pitchHzRef: React.RefObject<number | null>;
  isAlreadyCompleted: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onPrev?: () => void;
  onPlayTone: (band: Band) => void;
  onPlaySlide?: (fromBand: Band, toBand: Band) => void;
}

export function PitchExercise({
  exercise,
  exerciseId,
  isLast,
  allBands,
  pitchHz,
  pitchHzRef,
  isAlreadyCompleted,
  onComplete,
  onSkip,
  onPrev,
  onPlayTone,
  onPlaySlide,
}: PitchExerciseProps) {
  // ── Band resolution ──────────────────────────────────────────────────────
  const exerciseBands = useMemo(() => {
    if (exercise.exerciseTypeId === "pitch-detection") {
      return exercise.notes.flatMap((n) => resolveBandTarget(n.target, allBands));
    }
    const fromBands = resolveBandTarget(exercise.notes[0].from, allBands);
    const toBands = resolveBandTarget(exercise.notes[0].to, allBands);
    const fromIdx = fromBands[0] ? allBands.indexOf(fromBands[0]) : 0;
    const toIdx = toBands[0] ? allBands.indexOf(toBands[0]) : allBands.length - 1;
    const lo = Math.min(fromIdx, toIdx);
    const hi = Math.max(fromIdx, toIdx);
    return allBands.slice(lo, hi + 1);
  }, [exercise, allBands]);

  const isRangeTarget =
    exercise.exerciseTypeId === "pitch-detection" &&
    exercise.notes.length === 1 &&
    exercise.notes[0].target.kind === "range";

  const displayBands = useMemo(() => {
    if (exerciseBands.length <= 1) return exerciseBands;
    const indices = exerciseBands
      .map((b) => allBands.findIndex((ab) => ab.id === b.id))
      .filter((i) => i >= 0);
    if (indices.length === 0) return exerciseBands;
    const minIdx = Math.max(0, Math.min(...indices) - 1);
    const maxIdx = Math.min(allBands.length - 1, Math.max(...indices) + 1);
    return allBands.slice(minIdx, maxIdx + 1);
  }, [exerciseBands, allBands]);

  const highlightIds = useMemo(() => exerciseBands.map((b) => b.id), [exerciseBands]);

  const toneBands = useMemo(() => {
    if (exercise.exerciseTypeId === "pitch-detection") {
      return exercise.notes.flatMap((n) => resolveBandTarget(n.target, allBands));
    }
    return [
      ...resolveBandTarget(exercise.notes[0].from, allBands),
      ...resolveBandTarget(exercise.notes[0].to, allBands),
    ];
  }, [exercise, allBands]);

  const seqStepBands = useMemo(() => {
    if (exercise.exerciseTypeId !== "pitch-detection" || exercise.notes.length <= 1) return [];
    return exercise.notes.map((n) => resolveBandTarget(n.target, allBands)[0]).filter(Boolean);
  }, [exercise, allBands]);

  // ── Progress (RAF loop in hook) ──────────────────────────────────────────
  const { progress, seqIndex, slideCount, stageComplete: exerciseComplete, showStepCheck } =
    usePitchProgress({ exercise, exerciseId, allBands, exerciseBands, pitchHzRef });

  const [showCongrats, setShowCongrats] = useState(false);

  useEffect(() => {
    if (!exerciseComplete) return;
    setShowCongrats(true);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.45 } });
    const id = setTimeout(() => setShowCongrats(false), 2400);
    return () => clearTimeout(id);
  }, [exerciseComplete]);

  // ── Tone playback ────────────────────────────────────────────────────────
  const TONE_DURATION_MS = 1800;
  const TONE_GAP_MS = 2000;
  const SLIDE_DURATION_MS = 400 + 2500 + 600;

  const [isTonePlaying, setIsTonePlaying] = useState(false);
  const toneTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset tone state on exercise change
  useEffect(() => {
    if (toneTimeoutRef.current) {
      clearTimeout(toneTimeoutRef.current);
      toneTimeoutRef.current = null;
    }
    setIsTonePlaying(false);
  }, [exerciseId]);

  function handleHearTone() {
    if (isTonePlaying) return;
    setIsTonePlaying(true);

    if (
      exercise.exerciseTypeId === "pitch-detection-slide" &&
      exercise.technique === "lip-rolls" &&
      onPlaySlide &&
      toneBands.length >= 2
    ) {
      const freqs = toneBands.map((b) => b.frequencyHz);
      const highBand = toneBands[freqs.indexOf(Math.max(...freqs))];
      const lowBand = toneBands[freqs.indexOf(Math.min(...freqs))];
      onPlaySlide(highBand, lowBand);
      if (toneTimeoutRef.current) clearTimeout(toneTimeoutRef.current);
      toneTimeoutRef.current = setTimeout(() => {
        toneTimeoutRef.current = null;
        setIsTonePlaying(false);
      }, SLIDE_DURATION_MS);
      return;
    }

    toneBands.forEach((band, i) => {
      setTimeout(() => onPlayTone(band), i * TONE_GAP_MS);
    });
    const totalMs = (toneBands.length - 1) * TONE_GAP_MS + TONE_DURATION_MS;
    if (toneTimeoutRef.current) clearTimeout(toneTimeoutRef.current);
    toneTimeoutRef.current = setTimeout(() => {
      toneTimeoutRef.current = null;
      setIsTonePlaying(false);
    }, totalMs);
  }

  // ── Derived values for pitch overlay ─────────────────────────────────────
  const closestBand =
    pitchHz && exerciseBands.length > 0
      ? findClosestBand(pitchHz, exerciseBands)
      : null;
  const rangeAccept =
    isRangeTarget && exercise.notes[0].target.kind === "range"
      ? exercise.notes[0].target.accept ?? "within"
      : "within";
  const lipRollTolerance = exercise.technique === "lip-rolls" ? 0.08 : 0.03;
  const locked =
    pitchHz && closestBand &&
    (isRangeTarget
      ? matchesBandTarget(pitchHz, exerciseBands, rangeAccept)
      : isInTune(pitchHz, closestBand.frequencyHz, lipRollTolerance));

  const targetBand = (() => {
    if (exercise.exerciseTypeId !== "pitch-detection") return null;
    if (isRangeTarget) return null;
    if (exercise.notes.length === 1) return exerciseBands[0] ?? null;
    return seqStepBands[seqIndex] ?? null;
  })();

  return (
    <>
      {/* ── Canvas + overlays ─────────────────────────────────────────────── */}
      <div className="relative flex-1 min-h-0">
        {/* Brief instruction cue */}
        {!(pitchHz !== null) && (
          <div className="absolute top-2 left-0 right-0 z-10 pointer-events-none flex justify-center px-12">
            <p className="text-xs text-white/50 text-center leading-snug max-w-[320px]">
              {exercise.instruction.split("\n")[0]}
            </p>
          </div>
        )}

        {/* Canvas */}
        {exercise.exerciseTypeId === "pitch-detection" && exercise.notes.length === 1 && isRangeTarget && exercise.notes[0].target.kind === "range" ? (
          <HillBallCanvas
            bands={exerciseBands}
            currentHzRef={pitchHzRef}
            direction={rangeAccept === "below" ? "down" : "up"}
            accept={rangeAccept as "above" | "below"}
          />
        ) : exercise.exerciseTypeId === "pitch-detection" && exercise.notes.length === 1 ? (
          <BalanceBallCanvas
            bands={exerciseBands}
            currentHzRef={pitchHzRef}
            highlightIds={highlightIds}
            inTuneOverride={undefined}
          />
        ) : (
          <PitchCanvas
            bands={displayBands}
            currentHzRef={pitchHzRef}
            highlightIds={highlightIds}
            inTuneOverride={
              isRangeTarget && exercise.notes[0].target.kind === "range"
                ? { bands: exerciseBands, accept: rangeAccept }
                : undefined
            }
            lipRollMode={exercise.technique === "lip-rolls"}
          />
        )}

        {/* Per-step checkmark (sequences only) */}
        {showStepCheck && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
            <div className="step-check-appear flex items-center justify-center w-12 h-12 rounded-full bg-violet-600/20">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
        )}

        {/* Centered progress ring */}
        {!exerciseComplete && !showCongrats && pitchHz !== null && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-5 transition-opacity duration-300">
            <CircularProgress
              progress={exercise.exerciseTypeId === "pitch-detection-slide" ? slideCount / 2 : progress}
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

        {/* Pitch overlay */}
        {pitchHz !== null && (
          <>
            <div className="pointer-events-none absolute top-2 left-0 right-0 z-10 hidden sm:flex justify-center px-12">
              <p className="text-xs text-white/50 text-center leading-snug max-w-80">
                {exercise.instruction.split("\n")[0]}
              </p>
            </div>
            <div className="pointer-events-none absolute top-3 left-4 right-4 fade-in flex items-start justify-between gap-4">
              <div className="shrink-0">
                {isRangeTarget ? (
                  <>
                    <div
                      className="text-2xl font-light"
                      style={{ color: closestBand?.color ?? "#fff" }}
                    >
                      {locked ? "✓ " : ""}
                      {exercise.exerciseTypeId === "pitch-detection" && exercise.notes[0].target.kind === "range" && exercise.notes[0].target.from >= 0 ? "Low tone" : "High tone"}
                    </div>
                    {!locked && (
                      <div className="text-sm mt-1 text-white/55">
                        {rangeAccept === "below" ? "Push lower" : rangeAccept === "above" ? "Push higher" : ""}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div
                      className="text-3xl font-light tabular-nums"
                      style={{ color: closestBand?.color ?? "#fff" }}
                    >
                      {Math.round(pitchHz)} Hz
                    </div>
                    {closestBand && (
                      <div
                        className="text-sm mt-0.5"
                        style={{ color: `${closestBand.color}cc` }}
                      >
                        {locked ? "✓ " : "→ "}
                        {closestBand.isSlot
                          ? `${closestBand.note}${closestBand.octave}`
                          : closestBand.name}
                      </div>
                    )}
                    {!locked && targetBand && (
                      <div className="text-sm mt-1 text-white/55">
                        {pitchHz < targetBand.frequencyHz ? "↓ Too low" : "↑ Too high"}
                      </div>
                    )}
                  </>
                )}
              </div>
              <p className="text-xs text-white/50 text-right leading-snug max-w-50 sm:hidden">
                {exercise.instruction.split("\n")[0]}
              </p>
            </div>
          </>
        )}

        {/* Step indicator dots */}
        {exercise.exerciseTypeId === "pitch-detection-slide" && !exerciseComplete && (
          <div className="pointer-events-none absolute bottom-3 left-4 flex items-center gap-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="rounded-full transition-all"
                style={{
                  width: 10,
                  height: 10,
                  backgroundColor: i <= slideCount ? "#a78bfa" : "rgba(255,255,255,0.15)",
                }}
              />
            ))}
            <span className="text-xs text-white/65 ml-1">slide {slideCount}/2</span>
          </div>
        )}
        {exercise.exerciseTypeId === "pitch-detection" && exercise.notes.length > 1 && !exerciseComplete && (
          <div className="pointer-events-none absolute bottom-3 left-4 flex items-center gap-2">
            {seqStepBands.map((b, i) => {
              const done = i < seqIndex;
              const active = i === seqIndex;
              return (
                <div
                  key={b.id}
                  className="rounded-full transition-all"
                  style={{
                    width: active ? 10 : 7,
                    height: active ? 10 : 7,
                    backgroundColor: done ? b.color : active ? `${b.color}99` : "rgba(255,255,255,0.15)",
                    boxShadow: active ? `0 0 8px ${b.color}88` : "none",
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* ── Bottom panel ──────────────────────────────────────────────────── */}
      <div className="border-t border-white/[0.06] bg-white/[0.02] px-3 sm:px-5 py-2 sm:pt-2.5 sm:pb-1.5 flex flex-row flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-4 shrink-0">
        <div className="shrink-0 order-first sm:order-none flex items-center gap-2">
          <ProgressArc
            progress={
              exerciseComplete
                ? 1
                : exercise.exerciseTypeId === "pitch-detection-slide"
                  ? slideCount / 2
                  : progress
            }
            complete={exerciseComplete}
          />
        </div>

        <div className="flex flex-row items-center gap-2 sm:gap-3 flex-1 min-w-0 sm:flex-initial sm:min-w-0 justify-end sm:ml-auto">
          <Button
            variant="outline"
            onClick={handleHearTone}
            disabled={isTonePlaying}
            className={`shrink-0 px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm flex items-center gap-2 ${
              isTonePlaying
                ? "border-violet-500/50 bg-violet-600/30 text-white cursor-default"
                : ""
            }`}
            title={isTonePlaying ? "Playing…" : "Play the target tone"}
          >
            {isTonePlaying ? (
              <>
                <span className="inline-flex gap-0.5">
                  <span className="w-0.5 h-3 bg-current rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
                  <span className="w-0.5 h-4 bg-current rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
                  <span className="w-0.5 h-3 bg-current rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
                  <span className="w-0.5 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: "75ms" }} />
                </span>
                Playing…
              </>
            ) : (
              <>▶ Play {toneBands.length > 1 ? "tones" : "tone"}</>
            )}
          </Button>
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
