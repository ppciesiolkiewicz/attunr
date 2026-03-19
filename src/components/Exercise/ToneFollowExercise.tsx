"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRepCompletion, CongratsOverlay } from "@/features/rep-progress";
import PitchCanvas from "@/components/PitchCanvas";
import { Button, Text } from "@/components/ui";
import { ProgressArc } from "./components/ProgressArc";
import type { ToneFollowConfig } from "@/constants/journey";
import type { ColoredNote } from "@/lib/VocalRange";
import type { ToneFollowExercise as ToneFollowExerciseType } from "@/constants/journey";

const SLIDE_HOLD_START_MS = 1000;
const SLIDE_RAMP_MS = 2500;
const SLIDE_HOLD_END_MS = 1000;
const SLIDE_TOTAL_MS = SLIDE_HOLD_START_MS + SLIDE_RAMP_MS + SLIDE_HOLD_END_MS;
const TONE_DURATION_MS = 1800;

interface ToneFollowExerciseProps {
  exercise: ToneFollowConfig;
  exerciseId: number;
  isLast: boolean;
  resolved: ToneFollowExerciseType;
  isAlreadyCompleted: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onPrev?: () => void;
  onPlayTone: (note: ColoredNote) => void;
  onPlaySlide?: (from: ColoredNote, to: ColoredNote) => void;
}

export function ToneFollowExercise({
  exercise,
  exerciseId,
  isLast,
  resolved,
  isAlreadyCompleted,
  onComplete,
  onSkip,
  onPrev,
  onPlayTone,
  onPlaySlide,
}: ToneFollowExerciseProps) {
  // ── Derived from resolved data ──────────────────────────────────────────────
  const { displayNotes, highlightIds } = resolved;

  // ── Simulated Hz ref (fed to PitchCanvas instead of mic input) ─────────
  const simulatedHzRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  // ── Play count and completion ──────────────────────────────────────────
  const [playCount, setPlayCount] = useState(0);
  const [isTonePlaying, setIsTonePlaying] = useState(false);
  const toneTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const exerciseComplete = playCount >= exercise.requiredPlays;

  const { showCongrats, completeRep: completeFinal } = useRepCompletion({
    totalReps: 1,
    exerciseId,
  });

  useEffect(() => {
    if (exerciseComplete) completeFinal();
  }, [exerciseComplete, completeFinal]);

  // Reset on exercise change
  useEffect(() => {
    setPlayCount(0);
    setIsTonePlaying(false);
    simulatedHzRef.current = null;
    if (toneTimeoutRef.current) clearTimeout(toneTimeoutRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, [exerciseId]);

  // ── Animate simulated Hz ───────────────────────────────────────────────
  const animateSlide = useCallback((fromHz: number, toHz: number) => {
    const startTime = performance.now();
    function tick() {
      const elapsed = performance.now() - startTime;
      if (elapsed < SLIDE_HOLD_START_MS) {
        simulatedHzRef.current = fromHz;
      } else if (elapsed < SLIDE_HOLD_START_MS + SLIDE_RAMP_MS) {
        // Exponential interpolation matching Web Audio exponentialRampToValueAtTime
        const t = (elapsed - SLIDE_HOLD_START_MS) / SLIDE_RAMP_MS;
        simulatedHzRef.current = fromHz * Math.pow(toHz / fromHz, t);
      } else if (elapsed < SLIDE_TOTAL_MS) {
        simulatedHzRef.current = toHz;
      } else {
        simulatedHzRef.current = null;
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const animateSustain = useCallback((hz: number, durationMs: number) => {
    simulatedHzRef.current = hz;
    toneTimeoutRef.current = setTimeout(() => {
      simulatedHzRef.current = null;
      toneTimeoutRef.current = null;
    }, durationMs);
  }, []);

  // ── Handle play ────────────────────────────────────────────────────────
  function handlePlayTone() {
    if (isTonePlaying) return;
    setIsTonePlaying(true);

    const shape = resolved.toneShape;
    if (shape.kind === "slide" && onPlaySlide) {
      onPlaySlide(shape.from, shape.to);
      animateSlide(shape.from.frequencyHz, shape.to.frequencyHz);
      toneTimeoutRef.current = setTimeout(() => {
        toneTimeoutRef.current = null;
        setIsTonePlaying(false);
        setPlayCount((c) => c + 1);
      }, SLIDE_TOTAL_MS);
    } else if (shape.kind === "sustain") {
      const durationMs = shape.seconds * 1000;
      onPlayTone(shape.note);
      animateSustain(shape.note.frequencyHz, durationMs);
      toneTimeoutRef.current = setTimeout(() => {
        toneTimeoutRef.current = null;
        setIsTonePlaying(false);
        setPlayCount((c) => c + 1);
      }, durationMs);
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (toneTimeoutRef.current) clearTimeout(toneTimeoutRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const progress = playCount / exercise.requiredPlays;

  return (
    <>
      {/* ── Canvas + overlays ─────────────────────────────────────────────── */}
      <div className="relative flex-1 min-h-0">
        {/* Instruction cue */}
        <div className="absolute top-2 left-0 right-0 z-10 pointer-events-none flex justify-center px-12">
          <Text
            variant="caption"
            color="muted-1"
            className="text-center leading-snug max-w-[320px]"
          >
            {exercise.instruction.split("\n")[0]}
          </Text>
        </div>

        {/* Canvas — shows notes with simulated cursor when tone plays */}
        <PitchCanvas
          bands={displayNotes}
          currentHzRef={simulatedHzRef}
          highlightIds={highlightIds}
        />

        {/* Completion checkmark */}
        <CongratsOverlay show={showCongrats} />

        {/* Play count dots — desktop only */}
        {!exerciseComplete && (
          <div className="pointer-events-none absolute bottom-3 left-4 hidden sm:flex items-center gap-2">
            {Array.from({ length: exercise.requiredPlays }, (_, i) => (
              <div
                key={i}
                className="rounded-full transition-all"
                style={{
                  width: 10,
                  height: 10,
                  backgroundColor:
                    i < playCount ? "#a78bfa" : "rgba(255,255,255,0.15)",
                }}
              />
            ))}
            <Text variant="caption" as="span" color="text-2" className="ml-1">
              {playCount}/{exercise.requiredPlays}
            </Text>
          </div>
        )}
      </div>

      {/* ── Bottom panel ──────────────────────────────────────────────────── */}
      <div className="border-t border-white/[0.06] bg-white/[0.02] px-3 sm:px-5 py-2 sm:pt-2.5 sm:pb-1.5 flex flex-row flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-4 shrink-0">
        <div className="shrink-0 order-first sm:order-none flex items-center gap-2">
          <ProgressArc
            progress={exerciseComplete ? 1 : progress}
            complete={exerciseComplete}
          />
        </div>

        <div className="flex flex-row items-center gap-2 sm:gap-3 flex-1 min-w-0 sm:flex-initial sm:min-w-0 justify-end sm:ml-auto">
          <Button
            variant="outline"
            onClick={handlePlayTone}
            disabled={isTonePlaying}
            className={`shrink-0 px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm flex items-center gap-2 ${
              isTonePlaying
                ? "border-violet-500/50 bg-violet-600/30 text-white cursor-default"
                : ""
            }`}
            title={isTonePlaying ? "Playing…" : "Play the tone"}
          >
            {isTonePlaying ? (
              <>
                <span className="inline-flex gap-0.5">
                  <span
                    className="w-0.5 h-3 bg-current rounded-full animate-pulse"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-0.5 h-4 bg-current rounded-full animate-pulse"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-0.5 h-3 bg-current rounded-full animate-pulse"
                    style={{ animationDelay: "300ms" }}
                  />
                  <span
                    className="w-0.5 h-2 bg-current rounded-full animate-pulse"
                    style={{ animationDelay: "75ms" }}
                  />
                </span>
                Playing…
              </>
            ) : (
              <>♪ Play<span className="hidden sm:inline">&nbsp;tone</span></>
            )}
          </Button>
          <div className="flex gap-2 flex-1 sm:flex-initial min-w-0">
            {exerciseId > 1 && onPrev && (
              <Button
                variant="outline"
                onClick={onPrev}
                title="Previous exercise"
                className="flex-1 sm:flex-initial sm:min-w-[6.5rem] px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm min-w-0"
              >
                ← Prev
              </Button>
            )}
            {exerciseComplete || isAlreadyCompleted ? (
              <Button
                onClick={onComplete}
                className="flex-1 sm:flex-initial sm:min-w-[6.5rem] px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm min-w-0"
              >
                {isLast ? "Complete ✓" : "Next →"}
              </Button>
            ) : (
              <Button
                onClick={onSkip}
                title="Skip this step (won't mark as complete)"
                className="flex-1 sm:flex-initial sm:min-w-[6.5rem] px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm min-w-0"
              >
                Skip →
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
