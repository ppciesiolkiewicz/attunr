"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import PitchCanvas from "@/components/PitchCanvas";
import BalanceBallCanvas from "@/components/BalanceBallCanvas";
import HillBallCanvas from "@/components/HillBallCanvas";
import { Button, CircularProgress, Text } from "@/components/ui";
import { usePitchProgress } from "./usePitchProgress";
import { ProgressArc } from "../components/ProgressArc";
import type { PitchDetectionExercise, PitchDetectionSlideExercise } from "@/constants/journey";
import { findClosestNote, isInTune, matchesNoteTarget } from "@/lib/pitch";
import type { ColoredNote } from "@/constants/tone-slots";
import type { ResolvedPitchDetection, ResolvedPitchDetectionSlide } from "@/lib/resolve-exercise";

interface PitchExerciseProps {
  exercise: PitchDetectionExercise | PitchDetectionSlideExercise;
  exerciseId: number;
  isLast: boolean;
  resolved: ResolvedPitchDetection | ResolvedPitchDetectionSlide;
  pitchHz: number | null;
  pitchHzRef: React.RefObject<number | null>;
  isAlreadyCompleted: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onPrev?: () => void;
  onPlayTone: (note: ColoredNote) => void;
  onPlaySlide?: (from: ColoredNote, to: ColoredNote) => void;
}

export function PitchExercise({
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
  onPlayTone,
  onPlaySlide,
}: PitchExerciseProps) {
  // ── Derived from resolved data ──────────────────────────────────────────────
  const { displayNotes, highlightIds } = resolved;

  const exerciseColoredNotes = useMemo(() => {
    if (resolved.exerciseTypeId === "pitch-detection") {
      return resolved.targets.map((t) => t.note);
    }
    return [resolved.from, resolved.to];
  }, [resolved]);

  const isRangeTarget =
    resolved.exerciseTypeId === "pitch-detection" &&
    resolved.targets.length === 1 &&
    resolved.targets[0].accept !== undefined;

  const toneNotes = exerciseColoredNotes;

  const seqStepNotes = useMemo(() => {
    if (resolved.exerciseTypeId !== "pitch-detection" || resolved.targets.length <= 1) return [];
    return resolved.targets.map((t) => t.note);
  }, [resolved]);

  // ── Progress (RAF loop in hook) ──────────────────────────────────────────
  const { progress, seqIndex, slideCount, stageComplete: exerciseComplete, showStepCheck } =
    usePitchProgress({ exercise, exerciseId, resolved, pitchHzRef });

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

    toneNotes.forEach((note, i) => {
      setTimeout(() => onPlayTone(note), i * TONE_GAP_MS);
    });
    const totalMs = (toneNotes.length - 1) * TONE_GAP_MS + TONE_DURATION_MS;
    if (toneTimeoutRef.current) clearTimeout(toneTimeoutRef.current);
    toneTimeoutRef.current = setTimeout(() => {
      toneTimeoutRef.current = null;
      setIsTonePlaying(false);
    }, totalMs);
  }

  // ── Derived values for pitch overlay ─────────────────────────────────────
  const closestNote =
    pitchHz && exerciseColoredNotes.length > 0
      ? findClosestNote(pitchHz, exerciseColoredNotes)
      : null;
  const rangeAccept =
    isRangeTarget && resolved.exerciseTypeId === "pitch-detection"
      ? resolved.targets[0].accept ?? "within"
      : "within";
  const rangeNotes =
    isRangeTarget && resolved.exerciseTypeId === "pitch-detection"
      ? resolved.targets[0].rangeNotes ?? exerciseColoredNotes
      : exerciseColoredNotes;
  const locked =
    pitchHz && closestNote &&
    (isRangeTarget
      ? matchesNoteTarget(pitchHz, rangeNotes, rangeAccept)
      : isInTune(pitchHz, closestNote.frequencyHz));

  const targetNote = (() => {
    if (resolved.exerciseTypeId !== "pitch-detection") return null;
    if (isRangeTarget) return null;
    if (resolved.targets.length === 1) return exerciseColoredNotes[0] ?? null;
    return seqStepNotes[seqIndex] ?? null;
  })();

  return (
    <>
      {/* ── Canvas + overlays ─────────────────────────────────────────────── */}
      <div className="relative flex-1 min-h-0">
        {/* Brief instruction cue */}
        {!(pitchHz !== null) && (
          <div className="absolute top-2 left-0 right-0 z-10 pointer-events-none flex justify-center px-12">
            <Text variant="caption" color="muted-1" className="text-center leading-snug max-w-[320px]">
              {exercise.instruction.split("\n")[0]}
            </Text>
          </div>
        )}

        {/* Canvas */}
        {resolved.exerciseTypeId === "pitch-detection" && resolved.targets.length === 1 && isRangeTarget ? (
          <HillBallCanvas
            bands={exerciseColoredNotes}
            currentHzRef={pitchHzRef}
            direction={rangeAccept === "below" ? "down" : "up"}
            accept={rangeAccept as "above" | "below"}
          />
        ) : resolved.exerciseTypeId === "pitch-detection" && resolved.targets.length === 1 ? (
          <BalanceBallCanvas
            bands={exerciseColoredNotes}
            currentHzRef={pitchHzRef}
            highlightIds={highlightIds}
            inTuneOverride={undefined}
          />
        ) : (
          <PitchCanvas
            bands={displayNotes}
            currentHzRef={pitchHzRef}
            highlightIds={highlightIds}
            inTuneOverride={
              isRangeTarget
                ? { bands: exerciseColoredNotes, accept: rangeAccept }
                : undefined
            }
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
              <Text variant="caption" color="muted-1" className="text-center leading-snug max-w-80">
                {exercise.instruction.split("\n")[0]}
              </Text>
            </div>
            <div className="pointer-events-none absolute top-3 left-4 right-4 fade-in flex items-start justify-between gap-4">
              <div className="shrink-0">
                {isRangeTarget ? (
                  <>
                    <Text
                      as="div"
                      variant="heading-lg"
                      className="font-light"
                      style={{ color: closestNote?.color ?? "#fff" }}
                    >
                      {locked ? "✓ " : ""}
                      {locked
                        ? (rangeAccept === "below" || rangeAccept === "within" ? "Low tone" : "High tone")
                        : (rangeAccept === "below" ? "Too high" : "Too low")}
                    </Text>
                    {!locked && (
                      <Text variant="body-sm" as="div" color="muted-1" className="mt-1">
                        {rangeAccept === "below" ? "Push lower" : rangeAccept === "above" ? "Push higher" : ""}
                      </Text>
                    )}
                  </>
                ) : (
                  <>
                    <Text
                      as="div"
                      variant="heading-lg"
                      className="text-3xl font-light tabular-nums"
                      style={{ color: closestNote?.color ?? "#fff" }}
                    >
                      {Math.round(pitchHz)} Hz
                    </Text>
                    {closestNote && (
                      <Text
                        as="div"
                        variant="body-sm"
                        className="mt-0.5"
                        style={{ color: `${closestNote?.color ?? "#fff"}cc` }}
                      >
                        {locked ? "✓ " : "→ "}
                        {closestNote.name}
                      </Text>
                    )}
                    {!locked && targetNote && (
                      <Text variant="body-sm" as="div" color="muted-1" className="mt-1">
                        {pitchHz < targetNote.frequencyHz ? "↓ Too low" : "↑ Too high"}
                      </Text>
                    )}
                  </>
                )}
              </div>
              <Text variant="caption" color="muted-1" className="text-right leading-snug max-w-50 sm:hidden">
                {exercise.instruction.split("\n")[0]}
              </Text>
            </div>
          </>
        )}

        {/* Step indicator dots */}
        {resolved.exerciseTypeId === "pitch-detection-slide" && !exerciseComplete && (
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
            <Text variant="caption" as="span" color="text-2" className="ml-1">slide {slideCount}/2</Text>
          </div>
        )}
        {resolved.exerciseTypeId === "pitch-detection" && resolved.targets.length > 1 && !exerciseComplete && (
          <div className="pointer-events-none absolute bottom-3 left-4 flex items-center gap-2">
            {seqStepNotes.map((n, i) => {
              const done = i < seqIndex;
              const active = i === seqIndex;
              return (
                <div
                  key={n.id}
                  className="rounded-full transition-all"
                  style={{
                    width: active ? 10 : 7,
                    height: active ? 10 : 7,
                    backgroundColor: done ? n.color : active ? `${n.color}99` : "rgba(255,255,255,0.15)",
                    boxShadow: active ? `0 0 8px ${n.color}88` : "none",
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
              <>▶ Play {toneNotes.length > 1 ? "tones" : "tone"}</>
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
