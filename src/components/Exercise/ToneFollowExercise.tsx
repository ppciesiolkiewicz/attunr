"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";
import PitchCanvas from "@/components/PitchCanvas";
import { Button, Text } from "@/components/ui";
import { ProgressArc } from "./components/ProgressArc";
import type { ToneFollowExercise as ToneFollowConfig } from "@/constants/journey";
import { Scale } from "@/lib/scale";
import type { ColoredNote, VocalRange } from "@/constants/tone-slots";

const SLIDE_HOLD_START_MS = 1000;
const SLIDE_RAMP_MS = 2500;
const SLIDE_HOLD_END_MS = 1000;
const SLIDE_TOTAL_MS = SLIDE_HOLD_START_MS + SLIDE_RAMP_MS + SLIDE_HOLD_END_MS;
const TONE_DURATION_MS = 1800;

interface ToneFollowExerciseProps {
  exercise: ToneFollowConfig;
  exerciseId: number;
  isLast: boolean;
  vocalRange: VocalRange;
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
  vocalRange,
  isAlreadyCompleted,
  onComplete,
  onSkip,
  onPrev,
  onPlayTone,
  onPlaySlide,
}: ToneFollowExerciseProps) {
  // ── Scale construction ─────────────────────────────────────────────────────
  const scale = useMemo(
    () => new Scale(exercise.scale, vocalRange),
    [exercise.scale, vocalRange],
  );

  const coloredNotes = useMemo(() => scale.colorize(), [scale]);

  // ── Note resolution ────────────────────────────────────────────────────────
  const exerciseNotes = useMemo(() => {
    if (exercise.toneShape.kind === "sustain") {
      return scale.resolve(exercise.toneShape.target);
    }
    const fromNotes = scale.resolve(exercise.toneShape.from);
    const toNotes = scale.resolve(exercise.toneShape.to);
    const fromIdx = fromNotes[0] ? scale.notes.indexOf(fromNotes[0]) : 0;
    const toIdx = toNotes[0] ? scale.notes.indexOf(toNotes[0]) : scale.notes.length - 1;
    const lo = Math.min(fromIdx, toIdx);
    const hi = Math.max(fromIdx, toIdx);
    return scale.notes.slice(lo, hi + 1);
  }, [exercise, scale]);

  const exerciseColoredNotes = useMemo(() => {
    const noteIds = new Set(exerciseNotes.map((n) => n.id));
    return coloredNotes.filter((n) => noteIds.has(n.id));
  }, [exerciseNotes, coloredNotes]);

  const displayNotes = useMemo(() => {
    if (exerciseColoredNotes.length <= 1) return exerciseColoredNotes;
    const indices = exerciseColoredNotes
      .map((n) => coloredNotes.findIndex((cn) => cn.id === n.id))
      .filter((i) => i >= 0);
    if (indices.length === 0) return exerciseColoredNotes;
    const minIdx = Math.max(0, Math.min(...indices) - 1);
    const maxIdx = Math.min(coloredNotes.length - 1, Math.max(...indices) + 1);
    return coloredNotes.slice(minIdx, maxIdx + 1);
  }, [exerciseColoredNotes, coloredNotes]);

  const highlightIds = useMemo(() => exerciseColoredNotes.map((n) => n.id), [exerciseColoredNotes]);

  // ── Simulated Hz ref (fed to PitchCanvas instead of mic input) ─────────
  const simulatedHzRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  // ── Play count and completion ──────────────────────────────────────────
  const [playCount, setPlayCount] = useState(0);
  const [isTonePlaying, setIsTonePlaying] = useState(false);
  const toneTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const exerciseComplete = playCount >= exercise.requiredPlays;
  const [showCongrats, setShowCongrats] = useState(false);

  // Reset on exercise change
  useEffect(() => {
    setPlayCount(0);
    setIsTonePlaying(false);
    simulatedHzRef.current = null;
    if (toneTimeoutRef.current) clearTimeout(toneTimeoutRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, [exerciseId]);

  useEffect(() => {
    if (!exerciseComplete) return;
    setShowCongrats(true);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.45 } });
    const id = setTimeout(() => setShowCongrats(false), 2400);
    return () => clearTimeout(id);
  }, [exerciseComplete]);

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

    const shape = exercise.toneShape;
    if (shape.kind === "slide" && onPlaySlide) {
      const fromNotes = scale.resolve(shape.from);
      const toNotes = scale.resolve(shape.to);
      const fromResolved = fromNotes[0];
      const toResolved = toNotes[0];
      if (fromResolved && toResolved) {
        const fromColored = coloredNotes.find((cn) => cn.id === fromResolved.id);
        const toColored = coloredNotes.find((cn) => cn.id === toResolved.id);
        if (fromColored && toColored) {
          onPlaySlide(fromColored, toColored);
        }
        animateSlide(fromResolved.frequencyHz, toResolved.frequencyHz);
      }
      toneTimeoutRef.current = setTimeout(() => {
        toneTimeoutRef.current = null;
        setIsTonePlaying(false);
        setPlayCount((c) => c + 1);
      }, SLIDE_TOTAL_MS);
    } else if (shape.kind === "sustain") {
      const notes = scale.resolve(shape.target);
      const resolved = notes[0];
      if (resolved) {
        const colored = coloredNotes.find((cn) => cn.id === resolved.id);
        const durationMs = shape.seconds * 1000;
        if (colored) onPlayTone(colored);
        animateSustain(resolved.frequencyHz, durationMs);
      }
      const durationMs = shape.seconds * 1000;
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
          <Text variant="caption" color="muted-1" className="text-center leading-snug max-w-[320px]">
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
        {showCongrats && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
            <div className="congrats-appear flex items-center justify-center w-20 h-20 rounded-full bg-violet-600/25 drop-shadow-lg">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
        )}

        {/* Play count dots */}
        {!exerciseComplete && (
          <div className="pointer-events-none absolute bottom-3 left-4 flex items-center gap-2">
            {Array.from({ length: exercise.requiredPlays }, (_, i) => (
              <div
                key={i}
                className="rounded-full transition-all"
                style={{
                  width: 10,
                  height: 10,
                  backgroundColor: i < playCount ? "#a78bfa" : "rgba(255,255,255,0.15)",
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
          <ProgressArc progress={exerciseComplete ? 1 : progress} complete={exerciseComplete} />
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
                  <span className="w-0.5 h-3 bg-current rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
                  <span className="w-0.5 h-4 bg-current rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
                  <span className="w-0.5 h-3 bg-current rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
                  <span className="w-0.5 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: "75ms" }} />
                </span>
                Playing…
              </>
            ) : (
              <>▶ Play tone</>
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
