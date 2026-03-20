"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";
import PitchCanvas from "@/components/PitchCanvas";
import type { MelodyRectNote } from "@/components/PitchCanvas";
import { Button, Text, Modal } from "@/components/ui";
import { ExerciseStartButton } from "./ExerciseStartButton";
import { ProgressArc } from "./components/ProgressArc";
import type { MelodyConfig } from "@/constants/journey";
import { isInTune } from "@/lib/pitch";
import type { ColoredNote } from "@/lib/VocalRange";
import type { MelodyExercise as MelodyExerciseType } from "@/constants/journey";
import { usePianoSampler } from "@/hooks/usePianoSampler";
import {
  PRE_ROLL_MS,
  AUDIO_LEAD_MS,
  MELODY_HIT_THRESHOLD,
  MELODY_CLOSE_THRESHOLD,
} from "@/constants/settings";

interface MelodyExerciseProps {
  exercise: MelodyConfig;
  exerciseId: number;
  isLast: boolean;
  resolved: MelodyExerciseType;
  pitchHzRef: React.RefObject<number | null>;
  isAlreadyCompleted: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onPrev?: () => void;
}

export function MelodyExercise({
  exercise,
  exerciseId,
  isLast,
  resolved,
  pitchHzRef,
  isAlreadyCompleted,
  onComplete,
  onSkip,
  onPrev,
}: MelodyExerciseProps) {
  const { scheduleMelody, stop: stopSampler, isLoaded } = usePianoSampler();

  // ── Derived from resolved data ──────────────────────────────────────────────
  const { timeline: melodyTimeline, totalDurationMs, displayNotes, highlightIds } = resolved;

  const singableNotes = useMemo(
    () => melodyTimeline.filter((e) => !e.audioOnly),
    [melodyTimeline],
  );

  // ── Start gating ──────────────────────────────────────────────────────
  const [hasStarted, setHasStarted] = useState(false);

  // ── Playback state ─────────────────────────────────────────────────────
  const [isPlaying, setIsPlaying] = useState(false);
  const [melodyStartTime, setMelodyStartTime] = useState<number | undefined>();
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [overallScore, setOverallScore] = useState(0);
  const [noteScores, setNoteScores] = useState<number[]>([]);

  // Per-note in-tune accumulation (refs for RAF)
  const inTuneTimeRef = useRef<number[]>([]);
  const lastTickRef = useRef(0);
  const rafRef = useRef<number>(0);

  // MelodyRectNote state for PitchCanvas
  const [melodyRectNotes, setMelodyRectNotes] = useState<MelodyRectNote[]>([]);
  const melodyRectNotesRef = useRef<MelodyRectNote[]>([]);

  // Reset on exercise change
  useEffect(() => {
    setHasStarted(false);
    setIsPlaying(false);
    setMelodyStartTime(undefined);
    setShowScoreModal(false);
    setOverallScore(0);
    setNoteScores([]);
    setMelodyRectNotes([]);
    melodyRectNotesRef.current = [];
    inTuneTimeRef.current = [];
    lastTickRef.current = 0;
    stopSampler();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, [exerciseId, stopSampler]);

  // ── Build initial MelodyRectNotes ──────────────────────────────────────
  const buildRectNotes = useCallback((): MelodyRectNote[] => {
    return singableNotes.map((n, i) => ({
      index: i,
      note: n.note,
      startMs: n.startMs + PRE_ROLL_MS,
      durationMs: n.durationMs,
      silent: n.silent,
      status: "upcoming" as const,
    }));
  }, [singableNotes]);

  // ── Start playback ─────────────────────────────────────────────────────
  const handleStart = useCallback(() => {
    if (!isLoaded || isPlaying) return;

    // Build schedule for Tone.js — all non-silent entries with audio
    const audioNotes: { frequencyHz: number; startSec: number; durationSec: number }[] = [];

    for (const n of melodyTimeline) {
      // Skip silent notes (shown but not played)
      if (n.silent) continue;
      audioNotes.push({
        frequencyHz: n.note.frequencyHz,
        startSec: (n.startMs + PRE_ROLL_MS - AUDIO_LEAD_MS) / 1000,
        durationSec: n.durationMs / 1000,
      });
    }

    scheduleMelody(audioNotes);

    const rects = buildRectNotes();
    melodyRectNotesRef.current = rects;
    setMelodyRectNotes(rects);
    inTuneTimeRef.current = new Array(singableNotes.length).fill(0);
    lastTickRef.current = 0;

    const startTime = performance.now();
    setMelodyStartTime(startTime);
    setIsPlaying(true);
  }, [isLoaded, isPlaying, singableNotes, melodyTimeline, scheduleMelody, buildRectNotes]);

  const handleExerciseStart = useCallback(() => {
    setHasStarted(true);
    setTimeout(() => handleStart(), 500);
  }, [handleStart]);

  // ── RAF scoring loop ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isPlaying || melodyStartTime == null) return;

    function tick() {
      const now = performance.now();
      const dt = lastTickRef.current ? (now - lastTickRef.current) / 1000 : 0;
      lastTickRef.current = now;

      const elapsedMs = now - melodyStartTime!;
      const rects = melodyRectNotesRef.current;
      const hz = pitchHzRef.current;
      let changed = false;

      for (let i = 0; i < rects.length; i++) {
        const rect = rects[i];
        const noteStartMs = rect.startMs;
        const noteEndMs = rect.startMs + rect.durationMs;

        if (elapsedMs < noteStartMs) {
          // upcoming — no change needed
        } else if (elapsedMs >= noteStartMs && elapsedMs < noteEndMs) {
          // active
          if (rect.status !== "active") {
            rects[i] = { ...rect, status: "active" };
            changed = true;
          }
          // Score: check pitch
          if (hz !== null && dt > 0) {
            const tolerance = 0.03;
            if (isInTune(hz, rect.note.frequencyHz, tolerance)) {
              inTuneTimeRef.current[i] += dt;
            }
          }
        } else {
          // Past — classify if not already done
          if (rect.status === "active" || rect.status === "upcoming") {
            const noteSeconds = rect.durationMs / 1000;
            const score = noteSeconds > 0 ? inTuneTimeRef.current[i] / noteSeconds : 0;
            const status = score >= MELODY_HIT_THRESHOLD ? "hit" : score >= MELODY_CLOSE_THRESHOLD ? "close" : "missed";
            rects[i] = { ...rect, status };
            changed = true;
          }
        }
      }

      if (changed) {
        melodyRectNotesRef.current = [...rects];
        setMelodyRectNotes([...rects]);
      }

      // Check if melody is done
      if (elapsedMs >= totalDurationMs + PRE_ROLL_MS) {
        // Finalize any remaining active notes
        const finalRects = [...melodyRectNotesRef.current];
        const scores: number[] = [];
        for (let i = 0; i < finalRects.length; i++) {
          const noteSeconds = finalRects[i].durationMs / 1000;
          const score = noteSeconds > 0 ? inTuneTimeRef.current[i] / noteSeconds : 0;
          scores.push(score);
          if (finalRects[i].status === "active" || finalRects[i].status === "upcoming") {
            finalRects[i] = {
              ...finalRects[i],
              status: score >= MELODY_HIT_THRESHOLD ? "hit" : score >= MELODY_CLOSE_THRESHOLD ? "close" : "missed",
            };
          }
        }
        melodyRectNotesRef.current = finalRects;
        setMelodyRectNotes(finalRects);

        const overall = scores.length > 0
          ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100)
          : 0;

        setNoteScores(scores);
        setOverallScore(overall);
        setIsPlaying(false);
        setShowScoreModal(true);

        if (overall >= exercise.minScore) {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.45 } });
        }
        return; // don't schedule another frame
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, melodyStartTime, exerciseId]);

  // ── Retry ──────────────────────────────────────────────────────────────
  const handleRetry = useCallback(() => {
    setShowScoreModal(false);
    setOverallScore(0);
    setNoteScores([]);
    stopSampler();

    // Small delay to let modal close, then restart
    setTimeout(() => handleStart(), 100);
  }, [stopSampler, handleStart]);

  // ── Score modal handlers ───────────────────────────────────────────────
  const passed = overallScore >= exercise.minScore;

  const handleContinue = useCallback(() => {
    setShowScoreModal(false);
    onComplete();
  }, [onComplete]);

  const progress = isPlaying && melodyStartTime != null
    ? Math.min(1, (performance.now() - melodyStartTime) / (totalDurationMs + PRE_ROLL_MS))
    : showScoreModal ? 1 : 0;

  return (
    <>
      {/* ── Canvas + overlays ─────────────────────────────────────────────── */}
      <div className="relative flex-1 min-h-0">
        {/* Instruction cue */}
        <div className="absolute top-2 left-0 right-0 z-10 pointer-events-none flex justify-center px-12">
          <Text variant="caption" color="muted-1" className="text-center leading-snug max-w-[320px]">
            {exercise.instruction}
          </Text>
        </div>

        <PitchCanvas
          bands={displayNotes}
          currentHzRef={pitchHzRef}
          highlightIds={highlightIds}
          melodyNotes={isPlaying || showScoreModal ? melodyRectNotes : undefined}
          melodyStartTime={melodyStartTime}
        />

        {/* Start overlay */}
        {!hasStarted && <ExerciseStartButton onStart={handleExerciseStart} />}
      </div>

      {/* ── Bottom panel ──────────────────────────────────────────────────── */}
      <div className="border-t border-white/[0.06] bg-white/[0.02] px-3 sm:px-5 py-2 sm:pt-2.5 sm:pb-1.5 flex flex-row flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-4 shrink-0">
        <div className="shrink-0 order-first sm:order-none flex items-center gap-2">
          <ProgressArc progress={progress} complete={showScoreModal && passed} />
        </div>

        <div className="flex flex-row items-center gap-2 sm:gap-3 flex-1 min-w-0 sm:flex-initial sm:min-w-0 justify-end sm:ml-auto">
          {hasStarted && !isPlaying && !showScoreModal && (
            <Button
              variant="outline"
              onClick={handleRetry}
              className="shrink-0 px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm"
              title="Restart exercise"
            >
              ▶ Restart
            </Button>
          )}
          <div className="flex gap-2 flex-1 sm:flex-initial min-w-0">
            {exerciseId > 1 && onPrev && (
              <Button variant="outline" onClick={onPrev} title="Previous exercise" className="flex-1 sm:flex-initial sm:min-w-[6.5rem] px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm min-w-0">
                ← <span className="hidden sm:inline">Prev</span>
              </Button>
            )}
            {(isAlreadyCompleted && !isPlaying) && (
              <Button onClick={onComplete} className="flex-1 sm:flex-initial sm:min-w-[6.5rem] px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm min-w-0">
                {isLast ? "Complete ✓" : "Next →"}
              </Button>
            )}
            {(!isAlreadyCompleted && !isPlaying && !showScoreModal) && (
              <Button onClick={onSkip} title="Skip this step (won't mark as complete)" className="flex-1 sm:flex-initial sm:min-w-[6.5rem] px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm min-w-0">
                Skip →
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Score modal ───────────────────────────────────────────────────── */}
      {showScoreModal && (
        <Modal onBackdropClick={() => setShowScoreModal(false)}>
          <div className="flex flex-col items-center gap-4 py-4 px-6">
            <Text variant="heading" className="text-center">
              {passed ? "Nice work!" : "Keep practicing!"}
            </Text>

            {/* Overall score */}
            <div className="text-5xl font-bold" style={{
              color: overallScore >= 70 ? "#50dc64" : overallScore >= 40 ? "#dccc3c" : "#dc3c3c",
            }}>
              {overallScore}%
            </div>

            {/* Per-note indicators */}
            <div className="flex gap-1.5 flex-wrap justify-center max-w-[280px]">
              {noteScores.map((score, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor:
                      score >= MELODY_HIT_THRESHOLD ? "#50dc64"
                      : score >= MELODY_CLOSE_THRESHOLD ? "#dccc3c"
                      : "#dc3c3c",
                  }}
                  title={`Note ${i + 1}: ${Math.round(score * 100)}%`}
                />
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mt-2">
              <Button variant="outline" onClick={handleRetry} className="px-5 py-2.5 rounded-xl text-sm">
                {passed ? "Repeat exercise" : "Try again"}
              </Button>
              {passed ? (
                <Button onClick={handleContinue} className="px-5 py-2.5 rounded-xl text-sm">
                  Continue →
                </Button>
              ) : (
                <Button variant="outline" onClick={onSkip} className="px-5 py-2.5 rounded-xl text-sm">
                  Skip
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
