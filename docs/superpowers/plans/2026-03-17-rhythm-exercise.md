# Rhythm Exercise Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new `rhythm` exercise type where users tap along to a scrolling timeline of beat markers via spacebar, touch, or click.

**Architecture:** Config-driven rhythm pattern → resolver produces `ResolvedRhythm` with absolute-timed beats → `RhythmExercise` component renders a `RhythmCanvas` with RAF scoring loop. Follows the same patterns as the existing melody exercise.

**Tech Stack:** React, TypeScript, Canvas API, Web Audio API (metronome), Vitest

**Spec:** `docs/superpowers/specs/2026-03-17-rhythm-exercise-design.md`

---

## Chunk 1: Types & Resolution

### Task 1: Add rhythm types to journey config

**Files:**
- Modify: `src/constants/journey/types.ts:9-16` (ExerciseTypeId union)
- Modify: `src/constants/journey/types.ts:241-248` (JourneyExercise union)

- [ ] **Step 1: Add `RhythmEvent` type and `RhythmExercise` interface**

In `src/constants/journey/types.ts`, add after the `MelodyExercise` interface (after line 239):

```typescript
/** A rhythm timeline event — tap (user must hit) or pause (gap). */
export type RhythmEvent =
  | { type: "tap"; duration: NoteDuration }
  | { type: "pause"; duration: NoteDuration };

export interface RhythmExercise extends BaseExerciseConfig {
  exerciseTypeId: "rhythm";
  /** BPM — quarter note = 1 beat. Duration formula: (NoteDuration / 4) * (60 / tempo) seconds. */
  tempo: number;
  /** Tap/pause sequence defining the rhythm pattern. */
  pattern: RhythmEvent[];
  /** Play an audible click on each beat marker (default false). */
  metronome?: boolean;
  /** Score threshold (0–100) to complete. 0 = any score passes. */
  minScore: number;
  instruction: string;
}
```

- [ ] **Step 2: Add `"rhythm"` to `ExerciseTypeId` union**

In `src/constants/journey/types.ts`, add `| "rhythm"` to the `ExerciseTypeId` type (after `| "melody"`):

```typescript
export type ExerciseTypeId =
  | "learn"
  | "learn-notes-1"
  | "pitch-detection"
  | "pitch-detection-slide"
  | "breathwork-farinelli"
  | "tone-follow"
  | "melody"
  | "rhythm";
```

- [ ] **Step 3: Add `RhythmExercise` to `JourneyExercise` union**

In `src/constants/journey/types.ts`, add `| RhythmExercise` to the union:

```typescript
export type JourneyExercise =
  | LearnExercise
  | LearnNotesExercise
  | PitchDetectionExercise
  | PitchDetectionSlideExercise
  | FarinelliBreathworkExercise
  | ToneFollowExercise
  | MelodyExercise
  | RhythmExercise;
```

`JourneyExerciseInput` updates automatically via `DistributiveOmit`.

- [ ] **Step 4: Add rhythm type exports to `index.ts`**

In `src/constants/journey/index.ts`, add to the `export type` block:

```typescript
  RhythmExercise,
  RhythmEvent,
```

- [ ] **Step 5: Verify the project compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/constants/journey/types.ts src/constants/journey/index.ts
git commit -m "feat: add RhythmExercise and RhythmEvent types"
```

---

### Task 2: Add rhythm resolver with tests

**Files:**
- Modify: `src/lib/resolve-exercise.ts:1-10` (imports), `:62-66` (ResolvedExercise union), `:292-308` (resolveExercise switch)
- Modify: `src/lib/resolve-exercise.test.ts`

- [ ] **Step 1: Write the failing tests**

In `src/lib/resolve-exercise.test.ts`, add a new `describe` block after the melody tests and before the "unsupported types" block. Import `RhythmExercise` from types:

```typescript
import type {
  PitchDetectionExercise,
  PitchDetectionSlideExercise,
  ToneFollowExercise,
  MelodyExercise,
  RhythmExercise,
} from "@/constants/journey/types";
```

Add `ResolvedRhythm` to the resolve-exercise imports:

```typescript
import type {
  ResolvedPitchDetection,
  ResolvedPitchDetectionSlide,
  ResolvedToneFollow,
  ResolvedMelody,
  ResolvedRhythm,
} from "./resolve-exercise";
```

Add the test block:

```typescript
// ── rhythm ─────────────────────────────────────────────────────────────────

describe("resolveExercise — rhythm", () => {
  const exercise: RhythmExercise = {
    ...base,
    exerciseTypeId: "rhythm",
    tempo: 120,
    minScore: 60,
    pattern: [
      { type: "tap", duration: NoteDuration.Quarter },
      { type: "pause", duration: NoteDuration.Quarter },
      { type: "tap", duration: NoteDuration.Half },
    ],
    metronome: true,
  };

  it("returns correct type and metadata", () => {
    const result = resolveExercise(exercise, testVocalRange) as ResolvedRhythm;
    expect(result.exerciseTypeId).toBe("rhythm");
    expect(result.tempo).toBe(120);
    expect(result.minScore).toBe(60);
    expect(result.metronome).toBe(true);
  });

  it("produces beats only for tap events", () => {
    const result = resolveExercise(exercise, testVocalRange) as ResolvedRhythm;
    expect(result.beats).toHaveLength(2); // 2 taps, 1 pause
  });

  it("computes correct startMs with pause gap", () => {
    const result = resolveExercise(exercise, testVocalRange) as ResolvedRhythm;
    const quarterMs = durationToMs(NoteDuration.Quarter, 120);
    expect(result.beats[0].startMs).toBe(0);
    expect(result.beats[1].startMs).toBe(quarterMs * 2); // tap + pause
  });

  it("computes correct durationMs per beat", () => {
    const result = resolveExercise(exercise, testVocalRange) as ResolvedRhythm;
    const quarterMs = durationToMs(NoteDuration.Quarter, 120);
    const halfMs = durationToMs(NoteDuration.Half, 120);
    expect(result.beats[0].durationMs).toBe(quarterMs);
    expect(result.beats[1].durationMs).toBe(halfMs);
  });

  it("computes correct totalDurationMs", () => {
    const result = resolveExercise(exercise, testVocalRange) as ResolvedRhythm;
    // Q + Q(pause) + H = 4+4+8 = 16 sixteenths = 4 quarters
    const expectedMs = 4 * (60 / 120) * 1000;
    expect(result.totalDurationMs).toBe(expectedMs);
  });

  it("sets displayNotes and highlightIds to empty arrays", () => {
    const result = resolveExercise(exercise, testVocalRange) as ResolvedRhythm;
    expect(result.displayNotes).toEqual([]);
    expect(result.highlightIds).toEqual([]);
  });

  it("defaults metronome to false when omitted", () => {
    const noMetronome: RhythmExercise = {
      ...base,
      exerciseTypeId: "rhythm",
      tempo: 80,
      minScore: 50,
      pattern: [{ type: "tap", duration: NoteDuration.Quarter }],
    };
    const result = resolveExercise(noMetronome, testVocalRange) as ResolvedRhythm;
    expect(result.metronome).toBe(false);
  });

  it("handles all-pause pattern with no beats", () => {
    const allPause: RhythmExercise = {
      ...base,
      exerciseTypeId: "rhythm",
      tempo: 120,
      minScore: 0,
      pattern: [
        { type: "pause", duration: NoteDuration.Quarter },
        { type: "pause", duration: NoteDuration.Quarter },
      ],
    };
    const result = resolveExercise(allPause, testVocalRange) as ResolvedRhythm;
    expect(result.beats).toHaveLength(0);
    const expectedMs = 2 * durationToMs(NoteDuration.Quarter, 120);
    expect(result.totalDurationMs).toBe(expectedMs);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/resolve-exercise.test.ts`
Expected: FAIL — `ResolvedRhythm` type not found, `resolveExercise` throws for `"rhythm"`

- [ ] **Step 3: Add `ResolvedRhythm`, `ResolvedBeat`, and `resolveRhythm()` to resolve-exercise.ts**

In `src/lib/resolve-exercise.ts`, add the import for `RhythmExercise`:

```typescript
import type {
  JourneyExercise,
  PitchDetectionExercise,
  PitchDetectionSlideExercise,
  ToneFollowExercise,
  MelodyExercise,
  RhythmExercise,
  DisplayNote,
} from "@/constants/journey/types";
```

Add the resolved types after `ResolvedMelody`:

```typescript
export interface ResolvedBeat {
  startMs: number;
  durationMs: number;
}

export interface ResolvedRhythm extends ResolvedExerciseBase {
  exerciseTypeId: "rhythm";
  tempo: number;
  metronome: boolean;
  minScore: number;
  beats: ResolvedBeat[];
  totalDurationMs: number;
}
```

Add `ResolvedRhythm` to the `ResolvedExercise` union:

```typescript
export type ResolvedExercise =
  | ResolvedPitchDetection
  | ResolvedPitchDetectionSlide
  | ResolvedToneFollow
  | ResolvedMelody
  | ResolvedRhythm;
```

Add the resolver function before `resolveExercise()`:

```typescript
function resolveRhythm(
  exercise: RhythmExercise,
  _vocalRange: VocalRange,
): ResolvedRhythm {
  const beats: ResolvedBeat[] = [];
  let cursor = 0;

  for (const event of exercise.pattern) {
    const ms = durationToMs(event.duration, exercise.tempo);
    if (event.type === "tap") {
      beats.push({ startMs: cursor, durationMs: ms });
    }
    cursor += ms;
  }

  return {
    exerciseTypeId: "rhythm",
    tempo: exercise.tempo,
    metronome: exercise.metronome ?? false,
    minScore: exercise.minScore,
    beats,
    totalDurationMs: cursor,
    displayNotes: [],
    highlightIds: [],
  };
}
```

Add the case to `resolveExercise()`:

```typescript
case "rhythm":
  return resolveRhythm(exercise, vocalRange);
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/resolve-exercise.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Run full type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/lib/resolve-exercise.ts src/lib/resolve-exercise.test.ts
git commit -m "feat: add resolveRhythm() resolver with tests"
```

---

## Chunk 2: Canvas & Component

### Task 3: Create RhythmCanvas

**Files:**
- Create: `src/components/Exercise/RhythmCanvas.tsx`

- [ ] **Step 1: Create the canvas component**

Create `src/components/Exercise/RhythmCanvas.tsx`:

```typescript
"use client";

import { useRef, useEffect, useCallback } from "react";
import type { ResolvedBeat } from "@/lib/resolve-exercise";

/** Beat status for rendering */
export type BeatStatus = "upcoming" | "active" | "hit" | "close" | "missed";

export interface RhythmBeatState {
  beat: ResolvedBeat;
  status: BeatStatus;
}

/** Scroll speed — matches PitchCanvas DOT_SPACING_PX / DOT_INTERVAL_MS */
const PX_PER_MS = 8 / 85;
/** "Now" line position as fraction of canvas width (matches PitchCanvas) */
const NEWEST_X = 0.68;
/** Canvas height */
const CANVAS_H = 200;
/** Beat marker height */
const BEAT_H = 40;

const STATUS_COLORS: Record<BeatStatus, string> = {
  upcoming: "rgba(255, 255, 255, 0.25)",
  active: "rgba(255, 255, 255, 0.9)",
  hit: "#50dc64",
  close: "#dccc3c",
  missed: "#dc3c3c",
};

interface RhythmCanvasProps {
  beats: RhythmBeatState[];
  elapsedMs: number;
  tapFlash: boolean;
}

export function RhythmCanvas({ beats, elapsedMs, tapFlash }: RhythmCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const dpr = window.devicePixelRatio || 1;

    ctx.clearRect(0, 0, w, h);

    const nowX = w * NEWEST_X;
    const centerY = h / 2;

    // Draw "now" line
    ctx.strokeStyle = tapFlash ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = tapFlash ? 3 * dpr : 1.5 * dpr;
    ctx.beginPath();
    ctx.moveTo(nowX, 0);
    ctx.lineTo(nowX, h);
    ctx.stroke();

    // Draw tap flash circle
    if (tapFlash) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.beginPath();
      ctx.arc(nowX, centerY, 30 * dpr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw beat markers
    for (const { beat, status } of beats) {
      const beatCenterMs = beat.startMs + beat.durationMs / 2;
      const offsetMs = beatCenterMs - elapsedMs;
      const x = nowX + offsetMs * PX_PER_MS * dpr;
      const beatW = Math.max(beat.durationMs * PX_PER_MS * dpr, 8 * dpr);
      const beatH = BEAT_H * dpr;

      // Skip if off-screen
      if (x + beatW / 2 < 0 || x - beatW / 2 > w) continue;

      ctx.fillStyle = STATUS_COLORS[status];
      const radius = 6 * dpr;
      const rx = x - beatW / 2;
      const ry = centerY - beatH / 2;

      ctx.beginPath();
      ctx.roundRect(rx, ry, beatW, beatH, radius);
      ctx.fill();

      // Active pulse — brighter border
      if (status === "active") {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
        ctx.lineWidth = 2 * dpr;
        ctx.beginPath();
        ctx.roundRect(rx, ry, beatW, beatH, radius);
        ctx.stroke();
      }
    }
  }, [beats, elapsedMs, tapFlash]);

  // Resize canvas to container
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const observer = new ResizeObserver(() => {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = CANVAS_H * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${CANVAS_H}px`;
      draw();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [draw]);

  // Redraw on state changes
  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <div ref={containerRef} className="w-full" style={{ height: CANVAS_H }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/Exercise/RhythmCanvas.tsx
git commit -m "feat: add RhythmCanvas component"
```

---

### Task 4: Create RhythmExercise component

**Files:**
- Create: `src/components/Exercise/RhythmExercise.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/Exercise/RhythmExercise.tsx`:

```typescript
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";
import { Button, Text, Modal } from "@/components/ui";
import { ProgressArc } from "./components/ProgressArc";
import { RhythmCanvas } from "./RhythmCanvas";
import type { RhythmBeatState, BeatStatus } from "./RhythmCanvas";
import type { RhythmExercise as RhythmConfig } from "@/constants/journey";
import type { ResolvedRhythm } from "@/lib/resolve-exercise";

/** Pre-roll time (ms) — visual lead-in before first beat */
const PRE_ROLL_MS = 2000;

/** Scoring windows (ms) */
const HIT_WINDOW_MS = 80;
const CLOSE_WINDOW_MS = 150;

/** Score weights per classification */
const HIT_WEIGHT = 1.0;
const CLOSE_WEIGHT = 0.5;

/** Ignore taps within this window of the previous tap */
const TAP_DEBOUNCE_MS = 50;

/** Tap flash duration (ms) */
const TAP_FLASH_MS = 120;

interface RhythmExerciseProps {
  exercise: RhythmConfig;
  exerciseId: number;
  isLast: boolean;
  resolved: ResolvedRhythm;
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
  const { beats, totalDurationMs, metronome, minScore } = resolved;

  // ── Playback state ──────────────────────────────────────────────────────
  const [isPlaying, setIsPlaying] = useState(false);
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
  const tapFlashTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const audioCtxRef = useRef<AudioContext | null>(null);
  const metronomePlayedRef = useRef<boolean[]>([]);

  // State for canvas rendering (updated from RAF)
  const [beatStates, setBeatStates] = useState<RhythmBeatState[]>([]);
  const [elapsedMs, setElapsedMs] = useState(0);

  // ── Reset on exercise change ────────────────────────────────────────────
  useEffect(() => {
    setIsPlaying(false);
    setShowScoreModal(false);
    setOverallScore(0);
    setTapFlash(false);
    setBeatStates([]);
    setElapsedMs(0);
    beatStatesRef.current = [];
    tapMatchedRef.current = [];
    metronomePlayedRef.current = [];
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
    if (now - lastTapTimeRef.current < TAP_DEBOUNCE_MS) return;
    lastTapTimeRef.current = now;

    // Visual flash
    setTapFlash(true);
    if (tapFlashTimerRef.current) clearTimeout(tapFlashTimerRef.current);
    tapFlashTimerRef.current = setTimeout(() => setTapFlash(false), TAP_FLASH_MS);

    const tapElapsed = now - startTimeRef.current;

    // Find nearest unmatched beat
    let bestIdx = -1;
    let bestDist = Infinity;

    for (let i = 0; i < beats.length; i++) {
      if (tapMatchedRef.current[i]) continue;
      const beatCenter = beats[i].startMs + PRE_ROLL_MS + beats[i].durationMs / 2;
      const dist = Math.abs(tapElapsed - beatCenter);
      if (dist < bestDist && dist <= CLOSE_WINDOW_MS) {
        bestDist = dist;
        bestIdx = i;
      }
    }

    if (bestIdx >= 0) {
      tapMatchedRef.current[bestIdx] = true;
      const status: BeatStatus = bestDist <= HIT_WINDOW_MS ? "hit" : "close";
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

    // Initialize AudioContext on user gesture
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }

    beatStatesRef.current = beats.map(() => "upcoming" as BeatStatus);
    tapMatchedRef.current = beats.map(() => false);
    metronomePlayedRef.current = beats.map(() => false);

    // Bake PRE_ROLL_MS into beat startMs for the canvas (resolver returns 0-based)
    const initialStates: RhythmBeatState[] = beats.map((beat) => ({
      beat: { ...beat, startMs: beat.startMs + PRE_ROLL_MS },
      status: "upcoming" as BeatStatus,
    }));
    setBeatStates(initialStates);

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

      let changed = false;

      for (let i = 0; i < beats.length; i++) {
        const beatStartMs = beats[i].startMs + PRE_ROLL_MS;
        const beatEndMs = beatStartMs + beats[i].durationMs;

        // Metronome click
        if (metronome && !metronomePlayedRef.current[i] && elapsed >= beatStartMs) {
          metronomePlayedRef.current[i] = true;
          playClick();
        }

        const current = beatStatesRef.current[i];

        if (elapsed < beatStartMs) {
          // Still upcoming
        } else if (elapsed < beatEndMs) {
          // Active — only update if not already scored
          if (current === "upcoming") {
            beatStatesRef.current[i] = "active";
            changed = true;
          }
        } else {
          // Past — classify if not already done
          if (current === "upcoming" || current === "active") {
            beatStatesRef.current[i] = tapMatchedRef.current[i]
              ? beatStatesRef.current[i] // already scored by handleTap
              : "missed";
            changed = true;
          }
        }
      }

      // Sync state for canvas (bake PRE_ROLL_MS into startMs for canvas positioning)
      const states: RhythmBeatState[] = beats.map((beat, i) => ({
        beat: { ...beat, startMs: beat.startMs + PRE_ROLL_MS },
        status: beatStatesRef.current[i],
      }));
      setBeatStates(states);
      setElapsedMs(elapsed);

      // Check completion
      if (elapsed >= totalDurationMs + PRE_ROLL_MS) {
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
          if (status === "hit") weightSum += HIT_WEIGHT;
          else if (status === "close") weightSum += CLOSE_WEIGHT;
        }
        const score = beats.length > 0 ? Math.round((weightSum / beats.length) * 100) : 0;

        // Final canvas update
        setBeatStates(beats.map((beat, i) => ({
          beat: { ...beat, startMs: beat.startMs + PRE_ROLL_MS },
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
    ? Math.min(1, elapsedMs / (totalDurationMs + PRE_ROLL_MS))
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
          {!isPlaying && !showScoreModal && (
            <Button
              variant="outline"
              onClick={handleStart}
              className="shrink-0 px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm flex items-center gap-2"
            >
              ▶ Start
            </Button>
          )}
          {isPlaying && (
            <Text variant="caption" color="muted-1" className="text-xs">
              Tap on each beat…
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
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/Exercise/RhythmExercise.tsx
git commit -m "feat: add RhythmExercise component with scoring and canvas"
```

---

## Chunk 3: Integration & Starter Exercise

### Task 5: Wire up BaseExercise and introModal

**Files:**
- Modify: `src/components/Exercise/BaseExercise.tsx`
- Modify: `src/constants/journey/index.ts` (buildIntroModal)

- [ ] **Step 1: Add rhythm case to BaseExercise**

In `src/components/Exercise/BaseExercise.tsx`, add import:

```typescript
import { RhythmExercise } from "./RhythmExercise";
```

Add to the imports from resolve-exercise:

```typescript
import type { ResolvedPitchDetection, ResolvedPitchDetectionSlide, ResolvedToneFollow, ResolvedMelody, ResolvedRhythm } from "@/lib/resolve-exercise";
```

Add a new case in the switch before the `pitch-detection` cases:

```typescript
    case "rhythm":
      return (
        <RhythmExercise
          exercise={exercise}
          exerciseId={exerciseId}
          isLast={isLast}
          resolved={resolved as ResolvedRhythm}
          isAlreadyCompleted={isAlreadyCompleted}
          onComplete={onComplete}
          onSkip={onSkip}
          onPrev={onPrev}
        />
      );
```

- [ ] **Step 2: Add rhythm introModal builder to index.ts**

In `src/constants/journey/index.ts`, add a rhythm block in `buildIntroModal()` before the melody block (before the `if (exercise.exerciseTypeId === "melody")` line):

```typescript
  // Rhythm exercises — tap along to the beat
  if (exercise.exerciseTypeId === "rhythm") {
    for (const line of exercise.instruction.split("\n")) {
      if (line.trim()) {
        elements.push({
          type: "paragraph",
          text: line,
          variant: elements.length === 0 ? undefined : "secondary",
        });
      }
    }
    const tapCount = exercise.pattern.filter((e) => e.type === "tap").length;
    return {
      title: exercise.title,
      subtitle: `Tap along to ${tapCount} beats — score ${exercise.minScore}% to pass`,
      elements,
    };
  }
```

Import `RhythmExercise` type is not needed — it's already part of `JourneyExercise` which is imported.

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/Exercise/BaseExercise.tsx src/constants/journey/index.ts
git commit -m "feat: wire rhythm exercise into BaseExercise and introModal"
```

---

### Task 6: Add starter exercise to journey config

**Files:**
- Modify: `src/constants/journey/part2.ts` (add rhythm exercise, move completionModal)

- [ ] **Step 1: Move `completionModal` from the last exercise to the new rhythm exercise**

The current last exercise in `part2.ts` ("Lip rolls — high to low") has a `completionModal` for "Part II Complete". Since the rhythm exercise will be the new last exercise, remove the `completionModal` from the lip rolls exercise.

Remove the `completionModal` property from the "Lip rolls — high to low" exercise (lines 110-118 of `part2.ts`).

- [ ] **Step 2: Add the rhythm exercise with the `completionModal`**

`NoteDuration` is already imported in `part2.ts`. Add the rhythm exercise at the end of the array (before the closing `]`):

```typescript
  {
    part: 2,
    exerciseTypeId: "rhythm",
    title: "Feel the Beat",
    cardCue: "Tap along to the beat",
    tempo: 80,
    pattern: [
      { type: "tap", duration: NoteDuration.Quarter },
      { type: "tap", duration: NoteDuration.Quarter },
      { type: "tap", duration: NoteDuration.Quarter },
      { type: "tap", duration: NoteDuration.Quarter },
      { type: "pause", duration: NoteDuration.Quarter },
      { type: "tap", duration: NoteDuration.Quarter },
      { type: "tap", duration: NoteDuration.Quarter },
      { type: "tap", duration: NoteDuration.Quarter },
      { type: "tap", duration: NoteDuration.Quarter },
    ],
    metronome: true,
    minScore: 60,
    instruction: "Tap the spacebar or touch the screen on each beat",
    completionModal: {
      title: "Part II Complete",
      subtitle: "First Sounds",
      elements: [
        { type: "paragraph", text: "Chest voice (Low U), head voice (Hoo hoo), Farinelli breathwork, lip roll slides, and your first rhythm exercise — the foundations of every warmup." },
        { type: "paragraph", text: "Always warm up before each practice session!" },
      ],
      confetti: true,
    },
  },
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Run all tests**

Run: `npx vitest run`
Expected: All tests PASS

- [ ] **Step 4: Run the dev server and manually test**

Run: `npm run dev`
Navigate to the rhythm exercise in Part 2. Verify:
- The exercise loads and shows the instruction modal
- Pressing "Start" starts the scrolling timeline
- Beat markers scroll right-to-left
- Pressing spacebar / tapping scores beats as hit/close/missed
- Score modal appears at the end with correct percentage
- Metronome click plays on each beat
- Retry and continue buttons work

- [ ] **Step 5: Commit**

```bash
git add src/constants/journey/part2.ts
git commit -m "feat: add 'Feel the Beat' starter rhythm exercise to part 2"
```
