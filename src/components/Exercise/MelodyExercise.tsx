"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";
import PitchCanvas from "@/components/PitchCanvas";
import type { MelodyRectNote } from "@/components/PitchCanvas";
import { Button, Text, Modal } from "@/components/ui";
import { ProgressArc } from "./components/ProgressArc";
import type { MelodyExercise as MelodyConfig } from "@/constants/journey";
import { isInTune } from "@/lib/pitch";
import { Scale } from "@/lib/scale";
import type { ColoredNote, VocalRange } from "@/constants/tone-slots";
import { usePianoSampler } from "@/hooks/usePianoSampler";

/** Pre-roll time (ms) — visual lead-in before first note */
const PRE_ROLL_MS = 2000;

/** Scoring thresholds for per-note classification */
const HIT_THRESHOLD = 0.7;
const CLOSE_THRESHOLD = 0.4;

interface MelodyExerciseProps {
  exercise: MelodyConfig;
  exerciseId: number;
  isLast: boolean;
  vocalRange: VocalRange;
  pitchHzRef: React.RefObject<number | null>;
  isAlreadyCompleted: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onPrev?: () => void;
}

interface NoteTimeline {
  note: ColoredNote;
  startMs: number;
  durationMs: number;
  silent?: boolean;
  audioOnly?: boolean;
  isRest: false;
}

interface RestTimeline {
  startMs: number;
  durationMs: number;
  isRest: true;
}

type TimelineEntry = NoteTimeline | RestTimeline;

/** Convert a NoteDuration to milliseconds at a given tempo. */
function durationToMs(duration: number, tempo: number): number {
  return (duration / 4) * (60 / tempo) * 1000;
}

/** Resolve MelodyScale[] segments into a flat timeline of entries. */
function resolveScaleTimeline(
  scales: MelodyConfig["melody"],
  tempo: number,
  vocalRange: VocalRange,
): { entries: TimelineEntry[]; totalDurationMs: number } {
  const entries: TimelineEntry[] = [];
  let cursor = 0;
  for (const segment of scales) {
    const localScale = new Scale({ type: segment.type, root: segment.root }, vocalRange);
    const localColoredNotes = localScale.colorize();
    for (const event of segment.events) {
      const durationMs = durationToMs(event.duration, tempo);
      if (event.type === "pause") {
        // Advance cursor only — no entry emitted
      } else if (event.type === "play") {
        // Audio-only: emit one entry per target at same startMs
        for (const target of event.targets) {
          const resolved = localScale.resolve(target);
          if (resolved.length > 0) {
            const colored = localColoredNotes.find((cn) => cn.id === resolved[0].id);
            if (colored) {
              entries.push({
                note: colored,
                startMs: cursor,
                durationMs,
                audioOnly: true,
                isRest: false,
              });
            }
          }
        }
      } else {
        // note: singable, shown on canvas, scored
        const resolved = localScale.resolve(event.target);
        if (resolved.length > 0) {
          const colored = localColoredNotes.find((cn) => cn.id === resolved[0].id);
          if (colored) {
            entries.push({
              note: colored,
              startMs: cursor,
              durationMs,
              silent: event.silent,
              isRest: false,
            });
          }
        }
      }
      cursor += durationMs;
    }
  }
  return { entries, totalDurationMs: cursor };
}

export function MelodyExercise({
  exercise,
  exerciseId,
  isLast,
  vocalRange,
  pitchHzRef,
  isAlreadyCompleted,
  onComplete,
  onSkip,
  onPrev,
}: MelodyExerciseProps) {
  const { scheduleMelody, stop: stopSampler, isLoaded } = usePianoSampler();

  // ── Resolve melody timeline ─────────────────────────────────────────────
  const { entries: melodyTimeline, totalDurationMs } = useMemo(
    () => resolveScaleTimeline(exercise.melody, exercise.tempo, vocalRange),
    [exercise.melody, exercise.tempo, vocalRange],
  );

  // Singable notes only (no rests, no audioOnly) — used for scoring and rendering
  const singableNotes = useMemo(
    () => melodyTimeline.filter((e): e is NoteTimeline => !e.isRest && !e.audioOnly),
    [melodyTimeline],
  );

  // ── Display notes — melody notes ±1 neighbor ───────────────────────────
  const exerciseNotes = useMemo(
    () => singableNotes.map((n) => n.note),
    [singableNotes],
  );

  const displayNotes = useMemo(() => {
    if (exerciseNotes.length === 0) return vocalRange.allNotes.slice(0, 3);
    // Deduplicate by id, sort by frequency
    const seen = new Set<string>();
    const unique: ColoredNote[] = [];
    for (const n of exerciseNotes) {
      if (!seen.has(n.id)) { seen.add(n.id); unique.push(n); }
    }
    unique.sort((a, b) => a.frequencyHz - b.frequencyHz);
    return unique;
  }, [exerciseNotes, vocalRange.allNotes]);

  const highlightIds = useMemo(
    () => exerciseNotes.map((n) => n.id),
    [exerciseNotes],
  );

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
      if (n.isRest) continue;
      // Skip silent notes (shown but not played)
      if (n.silent) continue;
      audioNotes.push({
        frequencyHz: n.note.frequencyHz,
        startSec: (n.startMs + PRE_ROLL_MS) / 1000,
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
            const tolerance = exercise.technique === "puffy-cheeks" ? 0.08 : 0.03;
            if (isInTune(hz, rect.note.frequencyHz, tolerance)) {
              inTuneTimeRef.current[i] += dt;
            }
          }
        } else {
          // Past — classify if not already done
          if (rect.status === "active" || rect.status === "upcoming") {
            const noteSeconds = rect.durationMs / 1000;
            const score = noteSeconds > 0 ? inTuneTimeRef.current[i] / noteSeconds : 0;
            const status = score >= HIT_THRESHOLD ? "hit" : score >= CLOSE_THRESHOLD ? "close" : "missed";
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
              status: score >= HIT_THRESHOLD ? "hit" : score >= CLOSE_THRESHOLD ? "close" : "missed",
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
      </div>

      {/* ── Bottom panel ──────────────────────────────────────────────────── */}
      <div className="border-t border-white/[0.06] bg-white/[0.02] px-3 sm:px-5 py-2 sm:pt-2.5 sm:pb-1.5 flex flex-row flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-4 shrink-0">
        <div className="shrink-0 order-first sm:order-none flex items-center gap-2">
          <ProgressArc progress={progress} complete={showScoreModal && passed} />
        </div>

        <div className="flex flex-row items-center gap-2 sm:gap-3 flex-1 min-w-0 sm:flex-initial sm:min-w-0 justify-end sm:ml-auto">
          {!isPlaying && !showScoreModal && (
            <Button
              variant="outline"
              onClick={handleStart}
              disabled={!isLoaded}
              className="shrink-0 px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm flex items-center gap-2"
            >
              {isLoaded ? "▶ Start" : "Loading…"}
            </Button>
          )}
          {isPlaying && (
            <Text variant="caption" color="muted-1" className="text-xs">
              Singing…
            </Text>
          )}
          <div className="flex gap-2 flex-1 sm:flex-initial min-w-0">
            {exerciseId > 1 && onPrev && (
              <Button variant="outline" onClick={onPrev} title="Previous exercise" className="flex-1 sm:flex-initial sm:min-w-[6.5rem] px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm min-w-0">
                ← Prev
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
                      score >= HIT_THRESHOLD ? "#50dc64"
                      : score >= CLOSE_THRESHOLD ? "#dccc3c"
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
