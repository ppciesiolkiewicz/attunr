"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";
import { Button, Text, Modal } from "@/components/ui";
import { ExerciseStartButton } from "./ExerciseStartButton";
import { ProgressArc } from "./components/ProgressArc";
import { RhythmCanvas } from "./RhythmCanvas";
import type { RhythmBeatState, BeatStatus } from "./RhythmCanvas";
import type { RhythmConfig } from "@/constants/journey";
import type { RhythmExercise as RhythmExerciseType } from "@/constants/journey";

import {
  RHYTHM_HIT_WINDOW_MS,
  RHYTHM_CLOSE_WINDOW_MS,
  RHYTHM_HIT_WEIGHT,
  RHYTHM_CLOSE_WEIGHT,
  RHYTHM_TAP_DEBOUNCE_MS,
  RHYTHM_TAP_FLASH_MS,
} from "@/constants/settings";

interface RhythmExerciseProps {
  exercise: RhythmConfig;
  exerciseId: number;
  isLast: boolean;
  resolved: RhythmExerciseType;
  isAlreadyCompleted: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onPrev?: () => void;
}

export function RhythmExercise({
  exercise,
  exerciseId,
  isLast,
  resolved,
  isAlreadyCompleted,
  onComplete,
  onSkip,
  onPrev,
}: RhythmExerciseProps) {
  const { beats, metronomeTicks, totalDurationMs, metronome, minScore } = resolved;

  // ── Playback state ──────────────────────────────────────────────────────
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStartedOnce, setHasStartedOnce] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [overallScore, setOverallScore] = useState(0);
  const [tapFlash, setTapFlash] = useState(false);

  // Refs for RAF loop
  const startTimeRef = useRef(0);
  const elapsedMsRef = useRef(0);
  const rafRef = useRef(0);
  const beatStatesRef = useRef<BeatStatus[]>([]);
  const lastTapTimeRef = useRef(0);
  const tapMatchedRef = useRef<boolean[]>([]);
  const tapFlashTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const metronomeTickPlayedRef = useRef<boolean[]>([]);

  // State for canvas rendering (updated from RAF)
  const [beatStates, setBeatStates] = useState<RhythmBeatState[]>([]);
  const [elapsedMs, setElapsedMs] = useState(0);

  // ── Reset on exercise change ────────────────────────────────────────────
  useEffect(() => {
    setIsPlaying(false);
    setHasStartedOnce(false);
    setShowScoreModal(false);
    setOverallScore(0);
    setTapFlash(false);
    setBeatStates([]);
    setElapsedMs(0);
    beatStatesRef.current = [];
    tapMatchedRef.current = [];
    metronomeTickPlayedRef.current = [];
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (tapFlashTimerRef.current) clearTimeout(tapFlashTimerRef.current);
  }, [exerciseId]);

  // ── Metronome click ─────────────────────────────────────────────────────
  const playClick = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = 800;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.03);
  }, []);

  // ── Handle tap ──────────────────────────────────────────────────────────
  const handleTap = useCallback(() => {
    if (!isPlaying) return;

    const now = performance.now();

    // Debounce
    if (now - lastTapTimeRef.current < RHYTHM_TAP_DEBOUNCE_MS) return;
    lastTapTimeRef.current = now;

    // Visual flash
    setTapFlash(true);
    if (tapFlashTimerRef.current) clearTimeout(tapFlashTimerRef.current);
    tapFlashTimerRef.current = setTimeout(() => setTapFlash(false), RHYTHM_TAP_FLASH_MS);

    const tapElapsed = now - startTimeRef.current;

    // Find nearest unmatched beat
    let bestIdx = -1;
    let bestDist = Infinity;

    for (let i = 0; i < beats.length; i++) {
      if (tapMatchedRef.current[i]) continue;
      const beatStart = beats[i].startMs;
      const dist = Math.abs(tapElapsed - beatStart);
      if (dist < bestDist && dist <= RHYTHM_CLOSE_WINDOW_MS) {
        bestDist = dist;
        bestIdx = i;
      }
    }

    if (bestIdx >= 0) {
      tapMatchedRef.current[bestIdx] = true;
      const status: BeatStatus = bestDist <= RHYTHM_HIT_WINDOW_MS ? "hit" : "close";
      beatStatesRef.current[bestIdx] = status;
    }
  }, [isPlaying, beats]);

  // ── Input listeners ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!isPlaying) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        handleTap();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isPlaying, handleTap]);

  // ── Start playback ──────────────────────────────────────────────────────
  const handleStart = useCallback(() => {
    if (isPlaying) return;
    setHasStartedOnce(true);

    // Initialize AudioContext on user gesture
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }

    beatStatesRef.current = beats.map(() => "upcoming" as BeatStatus);
    tapMatchedRef.current = beats.map(() => false);

    const initialStates: RhythmBeatState[] = beats.map((beat) => ({
      beat,
      status: "upcoming" as BeatStatus,
    }));
    setBeatStates(initialStates);
    metronomeTickPlayedRef.current = metronomeTicks.map(() => false);

    startTimeRef.current = performance.now();
    elapsedMsRef.current = 0;
    setIsPlaying(true);
  }, [isPlaying, beats]);

  // ── RAF loop ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isPlaying) return;

    function tick() {
      const now = performance.now();
      const elapsed = now - startTimeRef.current;
      elapsedMsRef.current = elapsed;

      // New metronome tick loop
      if (metronome) {
        for (let t = 0; t < metronomeTicks.length; t++) {
          if (!metronomeTickPlayedRef.current[t] && elapsed >= metronomeTicks[t]) {
            metronomeTickPlayedRef.current[t] = true;
            playClick();
          }
        }
      }

      for (let i = 0; i < beats.length; i++) {
        const beatStartMs = beats[i].startMs;
        const beatEndMs = beatStartMs + beats[i].durationMs;

        const current = beatStatesRef.current[i];

        if (elapsed < beatStartMs) {
          // Still upcoming
        } else if (elapsed < beatEndMs) {
          // Active — only update if not already scored
          if (current === "upcoming") {
            beatStatesRef.current[i] = "active";
          }
        } else {
          // Past — classify if not already done
          if (current === "upcoming" || current === "active") {
            beatStatesRef.current[i] = tapMatchedRef.current[i]
              ? beatStatesRef.current[i] // already scored by handleTap
              : "missed";
          }
        }
      }

      // Sync state for canvas
      const states: RhythmBeatState[] = beats.map((beat, i) => ({
        beat,
        status: beatStatesRef.current[i],
      }));
      setBeatStates(states);
      setElapsedMs(elapsed);

      // Check completion
      if (elapsed >= totalDurationMs) {
        // Finalize any remaining active beats as missed
        for (let i = 0; i < beats.length; i++) {
          if (beatStatesRef.current[i] === "upcoming" || beatStatesRef.current[i] === "active") {
            if (!tapMatchedRef.current[i]) {
              beatStatesRef.current[i] = "missed";
            }
          }
        }

        // Calculate score
        let weightSum = 0;
        for (let i = 0; i < beats.length; i++) {
          const status = beatStatesRef.current[i];
          if (status === "hit") weightSum += RHYTHM_HIT_WEIGHT;
          else if (status === "close") weightSum += RHYTHM_CLOSE_WEIGHT;
        }
        const score = beats.length > 0 ? Math.round((weightSum / beats.length) * 100) : 0;

        // Final canvas update
        setBeatStates(beats.map((beat, i) => ({
          beat,
          status: beatStatesRef.current[i],
        })));

        setOverallScore(score);
        setIsPlaying(false);
        setShowScoreModal(true);

        if (score >= minScore) {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.45 } });
        }
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, exerciseId]);

  // ── Retry ───────────────────────────────────────────────────────────────
  const handleRetry = useCallback(() => {
    setShowScoreModal(false);
    setOverallScore(0);
    setTimeout(() => handleStart(), 100);
  }, [handleStart]);

  // ── Score modal handlers ────────────────────────────────────────────────
  const passed = overallScore >= minScore;

  const handleContinue = useCallback(() => {
    setShowScoreModal(false);
    onComplete();
  }, [onComplete]);

  const progress = isPlaying
    ? Math.min(1, elapsedMs / totalDurationMs)
    : showScoreModal ? 1 : 0;

  return (
    <>
      {/* ── Canvas + overlays ──────────────────────────────────────────── */}
      <div className="relative flex-1 min-h-0 flex items-center justify-center">
        {/* Instruction cue */}
        <div className="absolute top-2 left-0 right-0 z-10 pointer-events-none flex justify-center px-12">
          <Text variant="caption" color="muted-1" className="text-center leading-snug max-w-[320px]">
            {exercise.instruction}
          </Text>
        </div>

        <RhythmCanvas
          beats={beatStates}
          elapsedMs={elapsedMs}
          tapFlash={tapFlash}
        />

        {/* Start overlay */}
        {!hasStartedOnce && <ExerciseStartButton onStart={handleStart} />}
      </div>

      {/* ── Touch/click handler on canvas area ─────────────────────────── */}
      {isPlaying && (
        <div
          className="absolute inset-0 z-20"
          onMouseDown={(e) => { e.preventDefault(); handleTap(); }}
          onTouchStart={(e) => { e.preventDefault(); handleTap(); }}
        />
      )}

      {/* ── Bottom panel ───────────────────────────────────────────────── */}
      <div className="border-t border-white/[0.06] bg-white/[0.02] px-3 sm:px-5 py-2 sm:pt-2.5 sm:pb-1.5 flex flex-row flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-4 shrink-0">
        <div className="shrink-0 order-first sm:order-none flex items-center gap-2">
          <ProgressArc progress={progress} complete={showScoreModal && passed} />
        </div>

        <div className="flex flex-row items-center gap-2 sm:gap-3 flex-1 min-w-0 sm:flex-initial sm:min-w-0 justify-end sm:ml-auto">
          {hasStartedOnce && !showScoreModal && (
            <Button
              variant="outline"
              onClick={handleStart}
              className="shrink-0 px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm flex items-center gap-2"
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
            {isAlreadyCompleted && (
              <Button onClick={onComplete} className="flex-1 sm:flex-initial sm:min-w-[6.5rem] px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm min-w-0">
                {isLast ? "Complete ✓" : "Next →"}
              </Button>
            )}
            {(!isAlreadyCompleted && !showScoreModal) && (
              <Button onClick={onSkip} title="Skip this step (won't mark as complete)" className="flex-1 sm:flex-initial sm:min-w-[6.5rem] px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm min-w-0">
                Skip →
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Score modal ────────────────────────────────────────────────── */}
      {showScoreModal && (
        <Modal onBackdropClick={() => setShowScoreModal(false)}>
          <div className="flex flex-col items-center gap-4 py-4 px-6">
            <Text variant="heading" className="text-center">
              {passed ? "Nice work!" : "Keep practicing!"}
            </Text>

            <div className="text-5xl font-bold" style={{
              color: overallScore >= 70 ? "#50dc64" : overallScore >= 40 ? "#dccc3c" : "#dc3c3c",
            }}>
              {overallScore}%
            </div>

            {/* Per-beat indicators */}
            <div className="flex gap-1.5 flex-wrap justify-center max-w-[280px]">
              {beatStates.map(({ status }, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor:
                      status === "hit" ? "#50dc64"
                      : status === "close" ? "#dccc3c"
                      : "#dc3c3c",
                  }}
                  title={`Beat ${i + 1}: ${status}`}
                />
              ))}
            </div>

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
