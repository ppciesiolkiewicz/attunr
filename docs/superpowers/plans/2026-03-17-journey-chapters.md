# Journey Chapters Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the journey from flat parts into Chapters (warmup + stages), add volume-detection exercise type, and create Chapter 1 (Introduction) and Chapter 2 (Building Foundation) content.

**Architecture:** Replace `JourneyPart[]` with `Chapter[]` where each chapter has an optional warmup and ordered stages. Add `volume-detection` as a new exercise type that uses mic amplitude (no pitch model). Track warmup staleness via localStorage timestamp.

**Tech Stack:** Next.js App Router, React, TypeScript, Web Audio API (AnalyserNode for volume), localStorage, canvas-confetti

**Spec:** `docs/superpowers/specs/2026-03-17-journey-chapters-design.md`

---

## File Structure

### New files
- `src/constants/journey/chapter1.ts` — Chapter 1 exercise configs (4 stages)
- `src/constants/journey/chapter2.ts` — Chapter 2 exercise configs (warmup + 3 stages)
- `src/hooks/useVolumeDetection.ts` — mic volume detection hook (Web Audio AnalyserNode)
- `src/components/Exercise/VolumeDetectionExercise.tsx` — volume exercise component + canvas
- `specs/exercise-catalog.md` — reference catalog of old exercise content

### Modified files
- `src/constants/journey/types.ts` — add `VolumeDetectionExercise`, `Chapter`, `StageConfig`; update `BaseExerciseConfig` (`part` → `chapter` + `stageId`)
- `src/constants/journey/index.ts` — new `JOURNEY_CONFIG` as `Chapter[]`, update `assignIds`, `buildIntroModal`, exports
- `src/components/Exercise/BaseExercise.tsx` — add `volume-detection` case to dispatcher
- `src/components/JourneyView/utils.ts` — rename `getStepInPart` → `getStepInStage`, remove `toRoman`
- `src/components/JourneyView/components/JourneyList.tsx` — render chapters with stages instead of parts
- `src/components/JourneyView/components/JourneyExercise.tsx` — update sub-nav (chapter/stage labels), warmup flow
- `src/components/JourneyView/components/ExerciseInfoModal.tsx` — update part→chapter references
- `src/hooks/useSettings.ts` — add `lastWarmupCompletedAt` setting

### Deleted files
- `src/constants/journey/part1.ts` through `part20.ts` — replaced by chapter1.ts and chapter2.ts

---

## Chunk 1: Types & Volume Detection Hook

### Task 1: Add volume-detection type and Chapter/StageConfig to types.ts

**Files:**
- Modify: `src/constants/journey/types.ts`

- [ ] **Step 1: Add `"volume-detection"` to `ExerciseTypeId` union**

In `src/constants/journey/types.ts`, add `"volume-detection"` to the `ExerciseTypeId` type:

```typescript
export type ExerciseTypeId =
  | "learn"
  | "learn-notes-1"
  | "pitch-detection"
  | "pitch-detection-slide"
  | "breathwork-farinelli"
  | "tone-follow"
  | "melody"
  | "volume-detection";
```

- [ ] **Step 2: Add `VolumeDetectionExercise` interface**

After `MelodyExercise` interface, add:

```typescript
export interface VolumeDetectionExercise extends BaseExerciseConfig {
  exerciseTypeId: "volume-detection";
  /** Seconds of accumulated sound needed to complete. */
  targetSeconds: number;
  /** Cue labels that cycle on screen (e.g. ["sss", "zzz", "sss"]). */
  cues: string[];
  instruction: string;
}
```

- [ ] **Step 3: Add `VolumeDetectionExercise` to `JourneyExercise` union**

```typescript
export type JourneyExercise =
  | LearnExercise
  | LearnNotesExercise
  | PitchDetectionExercise
  | PitchDetectionSlideExercise
  | FarinelliBreathworkExercise
  | ToneFollowExercise
  | MelodyExercise
  | VolumeDetectionExercise;
```

- [ ] **Step 4: Update `BaseExerciseConfig` — replace `part` with `chapter` + `stageId`**

```typescript
export interface BaseExerciseConfig {
  id: number;
  exerciseTypeId: ExerciseTypeId;
  /** Chapter number (1-indexed). Assigned automatically. */
  chapter: number;
  /** Stage ID slug (e.g. "ch1-wake-up"). Assigned automatically. */
  stageId: string;
  title: string;
  subtitle?: string;
  cardCue?: string;
  introModal?: ModalConfig;
  completionModal?: ModalConfig;
  showEnableNotificationsPrompt?: boolean;
}
```

- [ ] **Step 5: Add `Chapter` and `StageConfig` types, replace `JourneyPart`**

Replace `JourneyPart` and `JourneyPartInput` with:

```typescript
export interface StageConfig {
  /** Stable slug for progress tracking (e.g. "ch1-wake-up", "ch2-warmup"). */
  id: string;
  title: string;
  exercises: JourneyExercise[];
}

export interface Chapter {
  /** 1-indexed chapter number. */
  chapter: number;
  title: string;
  /** Warmup stage — prompted if >4h since last warmup. Chapter 1 has none. */
  warmup?: StageConfig;
  stages: StageConfig[];
}

/** Input types — id/chapter/stageId assigned automatically. */
export interface StageConfigInput {
  id: string;
  title: string;
  exercises: JourneyExerciseInput[];
}

export interface ChapterInput {
  chapter: number;
  title: string;
  warmup?: StageConfigInput;
  stages: StageConfigInput[];
}
```

Remove `JourneyPart` and `JourneyPartInput` interfaces. Update `JourneyExerciseInput` to also omit `chapter` and `stageId`:

```typescript
export type JourneyExerciseInput = DistributiveOmit<JourneyExercise, "id" | "chapter" | "stageId">;
```

- [ ] **Step 6: Verify build compiles (expect errors in consumers — that's expected)**

Run: `npx tsc --noEmit 2>&1 | head -30`

This will show errors in `index.ts`, `JourneyList.tsx`, `JourneyExercise.tsx`, etc. — those are expected and will be fixed in later tasks.

- [ ] **Step 7: Commit**

```bash
git add src/constants/journey/types.ts
git commit -m "feat: add volume-detection type, Chapter/StageConfig, replace JourneyPart"
```

### Task 2: Create useVolumeDetection hook

**Files:**
- Create: `src/hooks/useVolumeDetection.ts`

- [ ] **Step 1: Create the hook**

Create `src/hooks/useVolumeDetection.ts`. This hook uses Web Audio API `AnalyserNode` to detect volume (RMS amplitude) — no ML model needed.

```typescript
"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export type VolumeDetectionStatus =
  | "idle"
  | "requesting-mic"
  | "listening"
  | "error";

interface VolumeDetectionState {
  /** Current RMS volume level (0–1), updated ~30fps. */
  volume: number;
  /** Whether sound is currently detected above threshold. */
  isActive: boolean;
  status: VolumeDetectionStatus;
  error: string | null;
  startListening: () => Promise<void>;
  stopListening: () => void;
}

/** RMS threshold below which we consider "silence". */
const SILENCE_THRESHOLD = 0.02;
/** How often to sample volume (ms). */
const SAMPLE_INTERVAL_MS = 33; // ~30 fps

export function useVolumeDetection(): VolumeDetectionState {
  const [volume, setVolume] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<VolumeDetectionStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sample = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const data = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(data);

    // Compute RMS
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i] * data[i];
    }
    const rms = Math.sqrt(sum / data.length);

    setVolume(rms);
    setIsActive(rms > SILENCE_THRESHOLD);
  }, []);

  const startListening = useCallback(async () => {
    try {
      setError(null);
      setStatus("requesting-mic");

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Microphone not supported.");
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: false, noiseSuppression: false },
          video: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      }
      streamRef.current = stream;

      const AudioCtx =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioCtxRef.current = audioCtx;

      if (audioCtx.state === "suspended") {
        await audioCtx.resume();
      }

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      intervalRef.current = setInterval(sample, SAMPLE_INTERVAL_MS);

      setStatus("listening");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start volume detection");
      setStatus("error");
    }
  }, [sample]);

  const stopListening = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    analyserRef.current = null;
    setVolume(0);
    setIsActive(false);
    setStatus("idle");

    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    audioCtxRef.current?.close();
    audioCtxRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioCtxRef.current?.close();
    };
  }, []);

  return { volume, isActive, status, error, startListening, stopListening };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useVolumeDetection.ts
git commit -m "feat: add useVolumeDetection hook (Web Audio AnalyserNode RMS)"
```

---

## Chunk 2: Volume Detection Exercise Component

### Task 3: Create VolumeDetectionExercise component

**Files:**
- Create: `src/components/Exercise/VolumeDetectionExercise.tsx`

- [ ] **Step 1: Create the component**

Follow the pattern from `FarinelliBreathworkExercise.tsx` — self-contained component with progress tracking and bottom panel.

```typescript
"use client";

import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui";
import { useVolumeDetection } from "@/hooks/useVolumeDetection";
import type { VolumeDetectionExercise as VolumeDetectionConfig } from "@/constants/journey";

interface VolumeDetectionExerciseProps {
  exercise: VolumeDetectionConfig;
  exerciseId: number;
  isLast: boolean;
  isAlreadyCompleted: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onPrev?: () => void;
}

export function VolumeDetectionExerciseContent({
  exercise,
  exerciseId,
  isLast,
  isAlreadyCompleted,
  onComplete,
  onSkip,
  onPrev,
}: VolumeDetectionExerciseProps) {
  const { volume, isActive, status, error, startListening, stopListening } = useVolumeDetection();
  const [accumulatedSeconds, setAccumulatedSeconds] = useState(0);
  const [exerciseComplete, setExerciseComplete] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const lastTickRef = useRef<number | null>(null);
  const cueIndexRef = useRef(0);

  // Start listening on mount
  useEffect(() => {
    startListening();
    return () => stopListening();
  }, [startListening, stopListening]);

  // Accumulate seconds when active.
  // Intentionally no dependency array — runs every render to sample time deltas.
  useEffect(() => {
    if (exerciseComplete) return;

    if (isActive) {
      const now = performance.now();
      if (lastTickRef.current !== null) {
        const delta = (now - lastTickRef.current) / 1000;
        setAccumulatedSeconds((prev) => {
          const next = prev + delta;
          if (next >= exercise.targetSeconds) {
            setExerciseComplete(true);
            return exercise.targetSeconds;
          }
          return next;
        });
      }
      lastTickRef.current = now;
    } else {
      lastTickRef.current = null;
    }
  });

  // Congrats animation
  useEffect(() => {
    if (!exerciseComplete) return;
    setShowCongrats(true);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.45 } });
    const id = setTimeout(() => setShowCongrats(false), 2400);
    return () => clearTimeout(id);
  }, [exerciseComplete]);

  // Cycle cues based on accumulated time (every 3 seconds)
  const cueDuration = 3;
  const currentCueIndex = exercise.cues.length > 0
    ? Math.floor(accumulatedSeconds / cueDuration) % exercise.cues.length
    : 0;
  const currentCue = exercise.cues[currentCueIndex] ?? "";

  const progress = exercise.targetSeconds > 0
    ? Math.min(accumulatedSeconds / exercise.targetSeconds, 1)
    : 0;

  return (
    <>
      <div className="relative flex-1 min-h-0 flex flex-col items-center justify-center gap-6">
        {/* Current cue */}
        <div className="text-4xl sm:text-5xl font-light text-white/90 tracking-wide">
          {currentCue}
        </div>

        {/* Vertical progress bar */}
        <div className="relative w-12 h-48 sm:h-64 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="absolute bottom-0 left-0 right-0 rounded-full bg-violet-500/60 transition-all duration-150"
            style={{ height: `${progress * 100}%` }}
          />
          {/* Volume indicator — thin bright bar showing current amplitude */}
          {isActive && (
            <div
              className="absolute bottom-0 left-0 right-0 bg-violet-300/40 transition-all duration-75"
              style={{ height: `${Math.min(volume * 500, 100)}%` }}
            />
          )}
        </div>

        {/* Time display */}
        <div className="text-sm text-white/50">
          {Math.floor(accumulatedSeconds)}s / {exercise.targetSeconds}s
        </div>

        {/* Status */}
        {status === "requesting-mic" && (
          <div className="text-sm text-white/40">Requesting microphone...</div>
        )}
        {error && (
          <div className="text-sm text-red-400">{error}</div>
        )}

        {showCongrats && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
            <div className="congrats-appear flex items-center justify-center w-20 h-20 rounded-full bg-violet-600/25 drop-shadow-lg">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Bottom panel — same pattern as FarinelliBreathworkExercise */}
      <div className="border-t border-white/[0.06] bg-white/[0.02] px-3 sm:px-5 py-2 sm:pt-2.5 sm:pb-1.5 flex flex-row flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-4 shrink-0">
        <div className="flex flex-row items-center gap-2 sm:gap-3 flex-1 min-w-0 sm:flex-initial sm:min-w-0 justify-end sm:ml-auto">
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
```

- [ ] **Step 2: Add volume-detection case to BaseExercise dispatcher**

In `src/components/Exercise/BaseExercise.tsx`:

1. Add import: `import { VolumeDetectionExerciseContent } from "./VolumeDetectionExercise";`
2. In the `resolved` useMemo, add `"volume-detection"` to the types that return `null` (no resolution needed):

```typescript
const resolved = useMemo(() => {
  if (
    exercise.exerciseTypeId === "learn" ||
    exercise.exerciseTypeId === "learn-notes-1" ||
    exercise.exerciseTypeId === "breathwork-farinelli" ||
    exercise.exerciseTypeId === "volume-detection"
  ) {
    return null;
  }
  return resolveExercise(exercise, vocalRange);
}, [exercise, vocalRange]);
```

3. Add case before the `default` (or at end of switch):

```typescript
case "volume-detection":
  return (
    <VolumeDetectionExerciseContent
      exercise={exercise}
      exerciseId={exerciseId}
      isLast={isLast}
      isAlreadyCompleted={isAlreadyCompleted}
      onComplete={onComplete}
      onSkip={onSkip}
      onPrev={onPrev}
    />
  );
```

- [ ] **Step 3: Add volume-detection branch to buildIntroModal**

In `src/constants/journey/index.ts`, add a new branch in `buildIntroModal` before the pitch-detection fallthrough:

```typescript
if (exercise.exerciseTypeId === "volume-detection") {
  for (const line of exercise.instruction.split("\n")) {
    if (line.trim()) {
      elements.push({
        type: "paragraph",
        text: line,
        variant: elements.length === 0 ? undefined : "secondary",
      });
    }
  }
  return {
    title: exercise.title,
    subtitle: `Make sound for ${exercise.targetSeconds} seconds`,
    elements,
  };
}
```

- [ ] **Step 4: Export new types from index.ts barrel**

In `src/constants/journey/index.ts`, add to the type exports:

```typescript
export type {
  // ... existing exports ...
  VolumeDetectionExercise,
  Chapter,
  ChapterInput,
  StageConfig,
  StageConfigInput,
} from "./types";
```

Remove `JourneyPart` and `JourneyPartInput` from exports.

- [ ] **Step 5: Commit**

```bash
git add src/components/Exercise/VolumeDetectionExercise.tsx src/components/Exercise/BaseExercise.tsx src/constants/journey/index.ts
git commit -m "feat: add VolumeDetectionExercise component and wire into dispatcher"
```

---

## Chunk 3: Chapter Configs & Journey Index Rewrite

### Task 4: Create Chapter 1 exercise config

**Files:**
- Create: `src/constants/journey/chapter1.ts`

- [ ] **Step 1: Create chapter1.ts**

Create `src/constants/journey/chapter1.ts` with 4 stages. Use the same config patterns as existing part files. Import types from `./types`.

```typescript
import { BandTargetKind } from "./types";
import type { StageConfigInput } from "./types";

// ── Chapter 1: Introduction ─────────────────────────────────────────────────
// No warmup — the user's very first experience.

export const CHAPTER_1_STAGES: StageConfigInput[] = [
  // ── Stage 1: Wake Up ────────────────────────────────────────────────────
  {
    id: "ch1-wake-up",
    title: "Wake Up",
    exercises: [
      {
        exerciseTypeId: "learn",
        title: "Vocal placement",
        cardCue: "Discover vocal placement and how it connects voice to body awareness",
        elements: [
          {
            type: "paragraph",
            text: "Vocal placement is the practice of directing your voice to resonate in different parts of your body. Lower tones naturally settle in the chest, mid-range tones open in the throat and mouth, and higher tones lift into the sinuses and head.",
          },
          {
            type: "paragraph",
            text: "By singing across your range, you develop awareness of where sound lives in your body and build a deeper connection between voice, breath, and presence. The goal is not perfection, but feeling where the sound lands and how it shifts your state.",
            variant: "secondary",
          },
          { type: "video" },
        ],
      },
      {
        exerciseTypeId: "learn-notes-1",
        title: "Understanding notes",
        cardCue: "Learn how musical notes work and see your vocal range",
      },
      {
        exerciseTypeId: "volume-detection",
        title: "Sss-Zzz-Sss",
        subtitle: "Make sound · 15 seconds",
        cardCue: "Wake up your breath with simple sounds",
        targetSeconds: 15,
        cues: ["sss", "zzz", "sss"],
        instruction: "Alternate between sss and zzz sounds. No pitch needed — just feel the vibration shift from voiceless to voiced.",
      },
      {
        exerciseTypeId: "volume-detection",
        title: "Voiceless lip roll",
        subtitle: "Lip buzz · 15 seconds",
        cardCue: "Get your lips buzzing without pitch pressure",
        targetSeconds: 15,
        cues: ["lip roll"],
        instruction: "Let your lips buzz loosely — like a motorboat. No pitch, just the buzz. Keep your jaw relaxed.",
      },
    ],
  },

  // ── Stage 2: First Sounds ───────────────────────────────────────────────
  {
    id: "ch1-first-sounds",
    title: "First Sounds",
    exercises: [
      {
        exerciseTypeId: "pitch-detection",
        title: "Gentle hum",
        subtitle: "Hum · 5 seconds × 3",
        cardCue: "Your first pitched sound — a low, steady hum",
        scale: { type: "chromatic", root: 1 },
        notes: [
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 5 },
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 5 },
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 5 },
        ],
        instruction: "Close your lips and hum mmmm on a low tone.\nFeel the buzz in your lips and teeth.\nKeep it gentle and relaxed.",
      },
      {
        exerciseTypeId: "pitch-detection",
        title: "Hoo hoo",
        subtitle: "Head voice · 5 seconds × 3",
        cardCue: "Find your head voice with a light, owl-like sound",
        scale: { type: "chromatic", root: -1 },
        notes: [
          { target: { kind: BandTargetKind.Range, from: -4, to: -1, accept: "above" }, seconds: 5 },
          { target: { kind: BandTargetKind.Range, from: -4, to: -1, accept: "above" }, seconds: 5 },
          { target: { kind: BandTargetKind.Range, from: -4, to: -1, accept: "above" }, seconds: 5 },
        ],
        instruction: "Sing 'hoo hoo' on a high tone, like an owl.\nThis is head voice — a lighter, higher resonance.\nFeel the sound in your head and face. Keep it gentle.",
      },
      {
        exerciseTypeId: "pitch-detection",
        title: "Simple U",
        subtitle: "Chest voice · 6 seconds × 3",
        cardCue: "Warm up your chest voice with a low U vowel",
        scale: { type: "chromatic", root: 1 },
        notes: [
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 6 },
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 6 },
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 6 },
        ],
        instruction: "Sing uuuu (as in 'moon') on a low tone.\nSlightly wobble your voice to keep it loose.\nThis warms up your lower register.",
      },
      {
        exerciseTypeId: "tone-follow",
        title: "Lip roll slide",
        subtitle: "Glide low to high · play 3 times",
        cardCue: "Slide your voice from low to high with a lip roll",
        scale: { type: "chromatic", root: 1 },
        toneShape: {
          kind: "slide",
          from: { kind: BandTargetKind.Index, i: 1 },
          to: { kind: BandTargetKind.Index, i: -1 },
        },
        displayNotes: [],
        requiredPlays: 3,
        instruction: "Play the tone and lip roll alongside it.\nSlide smoothly from low to high — feel the glide in your lips.",
      },
    ],
  },

  // ── Stage 3: First Melody ──────────────────────────────────────────────
  {
    id: "ch1-first-melody",
    title: "First Melody",
    exercises: [
      {
        exerciseTypeId: "pitch-detection",
        title: "Hum — mid-low",
        subtitle: "Hum · 5 seconds × 3",
        scale: { type: "chromatic", root: 4 },
        notes: [
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 5 },
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 5 },
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 5 },
        ],
        instruction: "Hum just above your lowest tone.\nFeel the warmth spread through your chest.\nKeep the buzz steady.",
      },
      {
        exerciseTypeId: "melody",
        title: "Major Second",
        subtitle: "Sing two notes · intervals",
        cardCue: "Your first melody — just two adjacent notes",
        tempo: 50,
        melody: [
          {
            type: "major",
            root: 3,
            events: [
              { type: "note", target: { kind: BandTargetKind.Index, i: 1 }, duration: 8 },
              { type: "note", target: { kind: BandTargetKind.Index, i: 2 }, duration: 8 },
              { type: "note", target: { kind: BandTargetKind.Index, i: 1 }, duration: 8 },
            ],
          },
        ],
        minScore: 0,
        instruction: "Sing the two notes as they appear — the piano plays each note for you.\nThis is a major second — the smallest melodic step.\nListen and match.",
      },
      {
        exerciseTypeId: "pitch-detection",
        title: "U — mid-low",
        subtitle: "Vowel U · 6 seconds × 3",
        scale: { type: "chromatic", root: 4 },
        notes: [
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 6 },
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 6 },
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 6 },
        ],
        instruction: "Sing uuu on the mid-low tone.\nKeep it warm and full.\nFeel the vowel open from the hum.",
      },
    ],
  },

  // ── Stage 4: Breath ────────────────────────────────────────────────────
  {
    id: "ch1-breath",
    title: "Breath",
    exercises: [
      {
        exerciseTypeId: "breathwork-farinelli",
        title: "Farinelli breathwork",
        cardCue: "Calm your nervous system and build steady diaphragm control",
        maxCount: 5,
        instruction: "Build diaphragm control and calm your nervous system. Inhale, hold, and exhale for the same count — each cycle adds one beat.",
      },
      {
        exerciseTypeId: "tone-follow",
        title: "Lip roll sustain",
        subtitle: "Hold the buzz · play 3 times",
        scale: { type: "chromatic", root: 5 },
        toneShape: {
          kind: "sustain",
          target: { kind: BandTargetKind.Index, i: 1 },
          seconds: 5,
        },
        displayNotes: [],
        requiredPlays: 3,
        instruction: "Play the tone and lip roll alongside it.\nKeep the buzz steady — lips vibrating without force.",
      },
      {
        exerciseTypeId: "pitch-detection",
        title: "Hum — mid",
        subtitle: "Hum · 6 seconds × 3",
        scale: { type: "chromatic", root: 7 },
        notes: [
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 6 },
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 6 },
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 6 },
        ],
        instruction: "Hum on a mid tone.\nFeel the buzz in your chest and face.\nStay relaxed and present.",
        completionModal: {
          title: "Chapter 1 Complete",
          subtitle: "Introduction",
          elements: [
            {
              type: "paragraph",
              text: "You've learned vocal placement, made your first sounds, sung your first melody, and built breath control. A solid foundation.",
            },
            {
              type: "paragraph",
              text: "Chapter 2 introduces a warmup routine and builds on everything you've learned here.",
              variant: "secondary",
            },
          ],
          confetti: true,
        },
      },
    ],
  },
];
```

- [ ] **Step 2: Commit**

```bash
git add src/constants/journey/chapter1.ts
git commit -m "feat: add Chapter 1 (Introduction) exercise configs"
```

### Task 5: Create Chapter 2 exercise config

**Files:**
- Create: `src/constants/journey/chapter2.ts`

- [ ] **Step 1: Create chapter2.ts**

```typescript
import { BandTargetKind } from "./types";
import type { StageConfigInput } from "./types";

// ── Chapter 2: Building Foundation ──────────────────────────────────────────
// Has a warmup — prompted if >4h since last warmup.

export const CHAPTER_2_WARMUP: StageConfigInput = {
  id: "ch2-warmup",
  title: "Warmup",
  exercises: [
    {
      exerciseTypeId: "volume-detection",
      title: "Sss-Zzz-Sss",
      subtitle: "Wake up breath · 15 seconds",
      targetSeconds: 15,
      cues: ["sss", "zzz", "sss"],
      instruction: "Alternate between sss and zzz sounds to wake up your breath.",
    },
    {
      exerciseTypeId: "tone-follow",
      title: "Lip rolls — low to high",
      subtitle: "Glide low to high · play 2 times",
      scale: { type: "chromatic", root: 1 },
      toneShape: {
        kind: "slide",
        from: { kind: BandTargetKind.Index, i: 1 },
        to: { kind: BandTargetKind.Index, i: -1 },
      },
      displayNotes: [],
      requiredPlays: 2,
      instruction: "Play the tone and lip roll alongside it.\nSlide smoothly from low to high — loosen your lips.",
    },
    {
      exerciseTypeId: "pitch-detection",
      title: "Gentle hum",
      subtitle: "Hum · 5 seconds × 2",
      scale: { type: "chromatic", root: 1 },
      notes: [
        { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 5 },
        { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 5 },
      ],
      instruction: "Close your lips and hum mmmm on a low tone.\nFirst pitched sound of the session.",
    },
    {
      exerciseTypeId: "breathwork-farinelli",
      title: "Farinelli breathwork",
      maxCount: 5,
      instruction: "Inhale, hold, and exhale for the same count. Each cycle adds one beat. Center your breathing.",
    },
  ],
};

export const CHAPTER_2_STAGES: StageConfigInput[] = [
  // ── Stage 1: Finding Your Range ─────────────────────────────────────────
  {
    id: "ch2-finding-range",
    title: "Finding Your Range",
    exercises: [
      {
        exerciseTypeId: "pitch-detection",
        title: "Hum — low to mid",
        subtitle: "Hum · 5 seconds × 3 pitches",
        scale: { type: "chromatic", root: 1 },
        notes: [
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 5 },
          { target: { kind: BandTargetKind.Index, i: 4 }, seconds: 5 },
          { target: { kind: BandTargetKind.Index, i: 7 }, seconds: 5 },
        ],
        instruction: "Hum at three rising pitches — low, mid-low, mid.\nFeel the resonance shift as you rise.\nKeep each hum steady and relaxed.",
      },
      {
        exerciseTypeId: "pitch-detection",
        title: "U — low to mid",
        subtitle: "Vowel U · 6 seconds × 3 pitches",
        scale: { type: "chromatic", root: 1 },
        notes: [
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 6 },
          { target: { kind: BandTargetKind.Index, i: 4 }, seconds: 6 },
          { target: { kind: BandTargetKind.Index, i: 7 }, seconds: 6 },
        ],
        instruction: "Sing uuu, stepping from low to mid-low to mid.\nFeel the resonance shift as you rise.\nKeep each tone warm and open.",
      },
      {
        exerciseTypeId: "tone-follow",
        title: "Lip rolls — high to low",
        subtitle: "Glide high to low · play 3 times",
        scale: { type: "chromatic", root: 1 },
        toneShape: {
          kind: "slide",
          from: { kind: BandTargetKind.Index, i: -1 },
          to: { kind: BandTargetKind.Index, i: 1 },
        },
        displayNotes: [],
        requiredPlays: 3,
        instruction: "Play the tone and lip roll alongside it.\nSlide smoothly from high to low — keep it smooth and easy.",
      },
    ],
  },

  // ── Stage 2: First Scale ────────────────────────────────────────────────
  {
    id: "ch2-first-scale",
    title: "First Scale",
    exercises: [
      {
        exerciseTypeId: "melody",
        title: "5-tone scale",
        subtitle: "Sing 5 notes up and back down",
        cardCue: "Your first scale — stepping up and back down",
        tempo: 55,
        melody: [
          {
            type: "major",
            root: 3,
            events: [
              { type: "note", target: { kind: BandTargetKind.Index, i: 1 }, duration: 8 },
              { type: "note", target: { kind: BandTargetKind.Index, i: 2 }, duration: 8 },
              { type: "note", target: { kind: BandTargetKind.Index, i: 3 }, duration: 8 },
              { type: "note", target: { kind: BandTargetKind.Index, i: 4 }, duration: 8 },
              { type: "note", target: { kind: BandTargetKind.Index, i: 5 }, duration: 8 },
              { type: "note", target: { kind: BandTargetKind.Index, i: 4 }, duration: 8 },
              { type: "note", target: { kind: BandTargetKind.Index, i: 3 }, duration: 8 },
              { type: "note", target: { kind: BandTargetKind.Index, i: 2 }, duration: 8 },
              { type: "note", target: { kind: BandTargetKind.Index, i: 1 }, duration: 8 },
            ],
          },
        ],
        minScore: 0,
        instruction: "Sing each note as it scrolls past.\nThis is a 5-tone major scale — up five notes, then back down.\nListen to the piano and follow along.",
      },
      {
        exerciseTypeId: "pitch-detection",
        title: "Hum sequence",
        subtitle: "3 tones rising · 5 seconds each",
        scale: { type: "chromatic", root: 1 },
        notes: [
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 5 },
          { target: { kind: BandTargetKind.Index, i: 3 }, seconds: 5 },
          { target: { kind: BandTargetKind.Index, i: 5 }, seconds: 5 },
        ],
        instruction: "Hum three tones rising from low.\nMove smoothly between each tone.\nFeel the resonance shift as you rise.",
      },
      {
        exerciseTypeId: "pitch-detection",
        title: "U sequence",
        subtitle: "3 tones rising · 6 seconds each",
        scale: { type: "chromatic", root: 1 },
        notes: [
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 6 },
          { target: { kind: BandTargetKind.Index, i: 3 }, seconds: 6 },
          { target: { kind: BandTargetKind.Index, i: 5 }, seconds: 6 },
        ],
        instruction: "Sing uuu on three rising tones.\nKeep each tone warm and open.\nFeel the vowel resonate differently at each pitch.",
      },
    ],
  },

  // ── Stage 3: Sustain & Control ──────────────────────────────────────────
  {
    id: "ch2-sustain-control",
    title: "Sustain & Control",
    exercises: [
      {
        exerciseTypeId: "pitch-detection",
        title: "Hum — mid",
        subtitle: "Hum · 8 seconds × 3",
        scale: { type: "chromatic", root: 7 },
        notes: [
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 8 },
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 8 },
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 8 },
        ],
        instruction: "Hum on a mid tone — longer holds this time.\nFocus on keeping the tone steady.\nFeel the buzz settle.",
      },
      {
        exerciseTypeId: "pitch-detection",
        title: "U — mid",
        subtitle: "Vowel U · 8 seconds × 3",
        scale: { type: "chromatic", root: 7 },
        notes: [
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 8 },
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 8 },
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 8 },
        ],
        instruction: "Sing uuu on the mid tone — longer holds.\nOpen and soft — keep it relaxed.\nFeel the resonance in your chest and face.",
      },
      {
        exerciseTypeId: "tone-follow",
        title: "Lip roll sustain",
        subtitle: "Hold the buzz · play 3 times",
        scale: { type: "chromatic", root: 7 },
        toneShape: {
          kind: "sustain",
          target: { kind: BandTargetKind.Index, i: 1 },
          seconds: 6,
        },
        displayNotes: [],
        requiredPlays: 3,
        instruction: "Play the tone and lip roll alongside it.\nKeep the buzz steady at mid pitch.",
      },
      {
        exerciseTypeId: "breathwork-farinelli",
        title: "Farinelli breathwork",
        maxCount: 7,
        instruction: "Inhale, hold, and exhale for the same count. Each cycle adds one beat. Deeper breathing this time.",
        completionModal: {
          title: "Chapter 2 Complete",
          subtitle: "Building Foundation",
          elements: [
            {
              type: "paragraph",
              text: "Range exploration, your first scale, and longer sustained tones — your foundation is growing.",
            },
            {
              type: "paragraph",
              text: "Keep practicing — the warmup will help you stay ready for each session.",
              variant: "secondary",
            },
          ],
          confetti: true,
        },
      },
    ],
  },
];
```

- [ ] **Step 2: Commit**

```bash
git add src/constants/journey/chapter2.ts
git commit -m "feat: add Chapter 2 (Building Foundation) exercise configs with warmup"
```

### Task 6: Rewrite journey index.ts for Chapter structure

**Files:**
- Modify: `src/constants/journey/index.ts`

- [ ] **Step 1: Rewrite index.ts**

Replace the entire file. Key changes:
- Import from `chapter1.ts` and `chapter2.ts` instead of `part1-5.ts`
- `JOURNEY_CONFIG` is now `Chapter[]`
- `assignIds` assigns `id`, `chapter`, and `stageId` to each exercise
- `buildIntroModal` has the `volume-detection` branch
- `JOURNEY_EXERCISES` flattens chapters → warmup + stages → exercises
- Remove old part imports

```typescript
import type { JourneyExercise, Chapter, ChapterInput, StageConfigInput, ModalConfig, ContentElement } from "./types";
import { FARINELLI_TIPS } from "@/constants/farinelli-tips";
import { CHAPTER_1_STAGES } from "./chapter1";
import { CHAPTER_2_WARMUP, CHAPTER_2_STAGES } from "./chapter2";

export type {
  JourneyExercise,
  JourneyExerciseInput,
  Chapter,
  ChapterInput,
  StageConfig,
  StageConfigInput,
  ExerciseTypeId,
  ModalConfig,
  ContentElement,
  WarningElement,
  ParagraphElement,
  VideoElement,
  HeadphonesNoticeElement,
  TipListElement,
  SeparatorElement,
  NoteTarget,
  BaseScale,
  ChromaticDegree,
  SustainNoteConfig,
  SlideConfig,
  BaseExerciseConfig,
  LearnExercise,
  LearnNotesExercise,
  PitchDetectionExercise,
  PitchDetectionSlideExercise,
  FarinelliBreathworkExercise,
  ToneFollowExercise,
  ToneFollowShape,
  MelodyExercise,
  MelodyScale,
  MelodyEvent,
  DisplayNote,
  DisplayScale,
  VolumeDetectionExercise,
} from "./types";

export { NoteDuration, BandTargetKind } from "./types";

/** Build introModal for a non-learn exercise from its existing properties. */
function buildIntroModal(exercise: JourneyExercise): ModalConfig | undefined {
  if (exercise.exerciseTypeId === "learn") return undefined;
  if (exercise.exerciseTypeId === "learn-notes-1") return undefined;
  if (exercise.introModal) return exercise.introModal;

  const elements: ContentElement[] = [];

  if (exercise.exerciseTypeId === "breathwork-farinelli") {
    elements.push({
      type: "warning",
      text: "If you have heart or respiratory conditions, or are pregnant, check with your doctor first. Stop immediately if you feel dizzy, lightheaded, or unwell at any time.",
    });
    elements.push({ type: "separator" });
    const firstParagraph = exercise.instruction.split("\n\n")[0];
    elements.push({ type: "paragraph", text: firstParagraph });
    elements.push({ type: "video" });
    elements.push({
      type: "tip-list",
      title: "Key tips",
      tips: [...FARINELLI_TIPS],
    });
    return {
      title: exercise.title,
      subtitle: `Complete ${exercise.maxCount} cycles — each a bit longer than the last`,
      elements,
    };
  }

  if (exercise.exerciseTypeId === "volume-detection") {
    for (const line of exercise.instruction.split("\n")) {
      if (line.trim()) {
        elements.push({
          type: "paragraph",
          text: line,
          variant: elements.length === 0 ? undefined : "secondary",
        });
      }
    }
    return {
      title: exercise.title,
      subtitle: `Make sound for ${exercise.targetSeconds} seconds`,
      elements,
    };
  }

  if (exercise.exerciseTypeId === "melody") {
    for (const line of exercise.instruction.split("\n")) {
      if (line.trim()) {
        elements.push({
          type: "paragraph",
          text: line,
          variant: elements.length === 0 ? undefined : "secondary",
        });
      }
    }
    elements.push({ type: "headphones-notice" });
    const noteCount = exercise.melody.flatMap((s) => s.events).filter((e) => e.type === "note").length;
    return {
      title: exercise.title,
      subtitle: `Sing along to ${noteCount} notes — score ${exercise.minScore}% to pass`,
      elements,
    };
  }

  if (exercise.exerciseTypeId === "tone-follow") {
    for (const line of exercise.instruction.split("\n")) {
      if (line.trim()) {
        elements.push({
          type: "paragraph",
          text: line,
          variant: elements.length === 0 ? undefined : "secondary",
        });
      }
    }
    elements.push({ type: "headphones-notice" });
    return {
      title: exercise.title,
      subtitle: `Play the tone ${exercise.requiredPlays} times and lip roll along`,
      elements,
    };
  }

  // Pitch exercises — instruction paragraphs
  for (const line of exercise.instruction.split("\n")) {
    if (line.trim()) {
      elements.push({
        type: "paragraph",
        text: line,
        variant: elements.length === 0 ? undefined : "secondary",
      });
    }
  }

  elements.push({ type: "headphones-notice" });

  let subtitle: string;
  if (exercise.exerciseTypeId === "pitch-detection-slide") {
    subtitle = "Slide smoothly through the range two or three times";
  } else if (exercise.notes.length > 1) {
    subtitle = `Sing each tone in sequence, ${exercise.notes[0]?.seconds ?? 0} seconds each`;
  } else {
    subtitle = `Hold the tone in tune for ${exercise.notes[0]?.seconds ?? 0} seconds`;
  }

  return { title: exercise.title, subtitle, elements };
}

/** Collect all stages from a chapter (warmup + stages) in order. */
function allStages(chapter: ChapterInput): StageConfigInput[] {
  return chapter.warmup ? [chapter.warmup, ...chapter.stages] : [...chapter.stages];
}

/** Assign sequential IDs and chapter/stageId to all exercises. */
function assignIds(chapters: ChapterInput[]): Chapter[] {
  let nextId = 1;
  return chapters.map((ch) => {
    function processStage(stage: StageConfigInput) {
      return {
        ...stage,
        exercises: stage.exercises.map((ex) => ({
          ...ex,
          id: nextId++,
          chapter: ch.chapter,
          stageId: stage.id,
        }) as JourneyExercise),
      };
    }
    return {
      ...ch,
      warmup: ch.warmup ? processStage(ch.warmup) : undefined,
      stages: ch.stages.map(processStage),
    };
  });
}

/** Walk all exercises and generate introModal for non-learn exercises. */
function withIntroModals(config: Chapter[]): Chapter[] {
  function processStage(stage: Chapter["stages"][number]) {
    return {
      ...stage,
      exercises: stage.exercises.map((ex) => {
        const introModal = buildIntroModal(ex);
        return introModal ? { ...ex, introModal } : ex;
      }),
    };
  }
  return config.map((ch) => ({
    ...ch,
    warmup: ch.warmup ? processStage(ch.warmup) : undefined,
    stages: ch.stages.map(processStage),
  }));
}

export const JOURNEY_CONFIG: Chapter[] = withIntroModals(assignIds([
  { chapter: 1, title: "Introduction", stages: CHAPTER_1_STAGES },
  { chapter: 2, title: "Building Foundation", warmup: CHAPTER_2_WARMUP, stages: CHAPTER_2_STAGES },
]));

/** Flat list of all exercises across all chapters (warmup + stages). */
export const JOURNEY_EXERCISES: JourneyExercise[] =
  JOURNEY_CONFIG.flatMap((ch) => {
    const stages = ch.warmup ? [ch.warmup, ...ch.stages] : ch.stages;
    return stages.flatMap((s) => s.exercises);
  });

/** Find the next available exercise after the given ID. */
export function getNextExerciseId(currentId: number): number | null {
  const idx = JOURNEY_EXERCISES.findIndex((e) => e.id === currentId);
  if (idx < 0 || idx >= JOURNEY_EXERCISES.length - 1) return null;
  return JOURNEY_EXERCISES[idx + 1].id;
}
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit 2>&1 | head -40`

Expect errors only in UI components (`JourneyList.tsx`, `JourneyExercise.tsx`, `utils.ts`) — those are fixed in Task 7.

- [ ] **Step 3: Commit**

```bash
git add src/constants/journey/index.ts
git commit -m "feat: rewrite journey index for Chapter[] structure"
```

---

## Chunk 4: UI Updates

### Task 7: Update JourneyView utils

**Files:**
- Modify: `src/components/JourneyView/utils.ts`

- [ ] **Step 1: Rename `getStepInPart` → `getStepInStage` and update logic**

Replace the `getStepInPart` function:

```typescript
export function getStepInStage(exerciseId: number): {
  stepIndex: number;
  stepsInStage: number;
} {
  const exercise = JOURNEY_EXERCISES.find((e) => e.id === exerciseId);
  if (!exercise) return { stepIndex: 1, stepsInStage: 1 };
  const stageExercises = JOURNEY_EXERCISES.filter((e) => e.stageId === exercise.stageId);
  const stepIndex = stageExercises.findIndex((e) => e.id === exerciseId) + 1;
  return { stepIndex, stepsInStage: stageExercises.length };
}
```

- [ ] **Step 2: Remove `toRoman` utility**

Delete the `toRoman` function from `utils.ts` — it's no longer needed since we display "Chapter {n}" (plain number) instead of "Part {roman}".

- [ ] **Step 3: Commit**

```bash
git add src/components/JourneyView/utils.ts
git commit -m "refactor: rename getStepInPart to getStepInStage, remove toRoman"
```

### Task 8: Update JourneyList to render chapters

**Files:**
- Modify: `src/components/JourneyView/components/JourneyList.tsx`

- [ ] **Step 1: Update JourneyList to iterate chapters and stages**

Replace the component body. Key changes:
- Import `Chapter` type and `JOURNEY_CONFIG` (now `Chapter[]`)
- Iterate chapters → stages (including warmup) → exercise cards
- Display "Chapter {n}" instead of "Part {roman}"
- Show stage titles as sub-headers

```typescript
"use client";

import { useSearchParams } from "next/navigation";
import { JOURNEY_CONFIG } from "@/constants/journey";
import { Text } from "@/components/ui";
import type { Settings } from "@/hooks/useSettings";
import { ExerciseCard } from "./ExerciseCard";
import { BadgeIcon } from "./BadgeIcon";

interface JourneyListProps {
  settings: Settings;
  onSelect: (exerciseId: number) => void;
}

export function JourneyList({ settings, onSelect }: JourneyListProps) {
  const searchParams = useSearchParams();
  const unlockAll = searchParams.has("unlock");
  const { journeyStage } = settings;
  const highestCompleted = unlockAll ? Infinity : journeyStage;

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex flex-col gap-4 px-5 py-5 max-w-2xl mx-auto w-full">
        <Text variant="heading" as="h1" className="sm:text-2xl">Journey</Text>
        <div className="flex flex-col gap-2">
          <Text variant="body-sm" color="text-2">
            This is where your journey begins. You&apos;ll be guided through
            learning and practice — from vocal warmups to sustaining each tone
            and exploring techniques like mantras and vowels.
          </Text>
          <Text variant="body-sm" color="text-2">
            When you&apos;ve built confidence, switch to Train for freeform
            practice — any tone, any order.
          </Text>
        </div>

        {JOURNEY_CONFIG.map((chapter) => {
          const allStages = chapter.warmup
            ? [chapter.warmup, ...chapter.stages]
            : chapter.stages;
          const allExercises = allStages.flatMap((s) => s.exercises);
          if (allExercises.length === 0) return null;
          const lastExerciseId = allExercises[allExercises.length - 1].id;
          const chapterComplete = highestCompleted >= lastExerciseId;

          return (
            <section key={chapter.chapter} className="flex flex-col gap-2">
              <header className="flex items-center gap-3 mb-0.5">
                <div className="flex items-center gap-2 shrink-0">
                  <Text variant="label" as="span" color="muted-1">
                    Chapter {chapter.chapter}
                  </Text>
                  <Text variant="caption" as="span" color="text-2" className="font-medium">
                    {chapter.title}
                  </Text>
                  {chapterComplete && (
                    <BadgeIcon
                      className="text-violet-400/90"
                      style={{ width: 12, height: 12 }}
                    />
                  )}
                </div>
                <div className="flex-1 h-px bg-white/[0.05]" />
              </header>

              {allStages.map((stage) => (
                <div key={stage.id} className="flex flex-col gap-1.5">
                  <Text variant="caption" as="span" color="muted-2" className="pl-1 pt-1">
                    {stage.title}
                  </Text>
                  {stage.exercises.map((exercise) => (
                    <ExerciseCard
                      key={exercise.id}
                      exercise={exercise}
                      highestCompleted={highestCompleted}
                      onSelect={onSelect}
                    />
                  ))}
                </div>
              ))}
            </section>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/JourneyView/components/JourneyList.tsx
git commit -m "feat: update JourneyList to render chapters and stages"
```

### Task 9: Update JourneyExercise sub-nav and references

**Files:**
- Modify: `src/components/JourneyView/components/JourneyExercise.tsx`

- [ ] **Step 1: Update imports and references**

1. Replace `getStepInPart` → `getStepInStage` import, remove `toRoman`
2. Replace `JOURNEY_CONFIG.find((p) => p.part === exercise.part)?.title` with chapter/stage title lookup:

```typescript
import { getSkippedInfoExerciseIds, getStepInStage } from "../utils";
```

3. Replace `partTitle` derivation:

```typescript
const chapter = JOURNEY_CONFIG.find((ch) => ch.chapter === exercise.chapter);
const chapterTitle = chapter?.title ?? "";
const allStages = chapter ? (chapter.warmup ? [chapter.warmup, ...chapter.stages] : chapter.stages) : [];
const stageTitle = allStages.find((s) => s.id === exercise.stageId)?.title ?? "";
```

4. Update the sub-nav to show "Chapter {n}" instead of "Part {roman}":

Replace:
```tsx
Part {toRoman(exercise.part)}
```
With:
```tsx
Chapter {exercise.chapter}
```

Replace:
```tsx
— {partTitle}
```
With:
```tsx
— {stageTitle}
```

5. Replace all `getStepInPart(exerciseId)` calls with `getStepInStage(exerciseId)`:

```tsx
{getStepInStage(exerciseId).stepIndex} of{" "}
{getStepInStage(exerciseId).stepsInStage}
```

6. Update `BaseExercise` props — pass stage info instead of part:

```tsx
<BaseExercise
  exercise={exercise}
  exerciseId={exerciseId}
  partTitle={stageTitle}
  partRoman={`${exercise.chapter}`}
  stepIndex={getStepInStage(exerciseId).stepIndex}
  stepsInPart={getStepInStage(exerciseId).stepsInStage}
  ...
/>
```

Note: We keep the `BaseExercise` prop names (`partTitle`, `partRoman`, `stepsInPart`) for now to avoid cascading changes through all exercise components. These are just labels passed down — a rename can happen later.

7. Update analytics calls: replace `exercise.part` with `exercise.chapter`:

```typescript
analytics.journeyExerciseStarted(exerciseId, exercise.chapter, stageTitle);
// ...
analytics.journeyExerciseCompleted(exerciseId, exercise.chapter);
// ...
analytics.journeyPartCompleted(exercise.chapter, stageTitle);
```

- [ ] **Step 2: Verify build compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/JourneyView/components/JourneyExercise.tsx
git commit -m "refactor: update JourneyExercise for chapter/stage structure"
```

### Task 9b: Update ExerciseInfoModal references

**Files:**
- Modify: `src/components/JourneyView/components/ExerciseInfoModal.tsx`

- [ ] **Step 1: Update imports**

Replace imports:

```typescript
import {
  addSkippedInfoExerciseId,
  getExerciseDisplayColors,
  getStepInStage,
} from "../utils";
```

Remove `toRoman` from the import.

- [ ] **Step 2: Replace Part → Chapter in the modal header**

Replace:
```tsx
<Text as="span" variant="label" color="muted-1">
  Part{" "}
  {toRoman(exercise.part)}
</Text>
```
With:
```tsx
<Text as="span" variant="label" color="muted-1">
  Chapter {exercise.chapter}
</Text>
```

- [ ] **Step 3: Replace getStepInPart → getStepInStage**

Replace:
```tsx
{getStepInPart(exerciseId).stepIndex} of{" "}
{getStepInPart(exerciseId).stepsInPart}
```
With:
```tsx
{getStepInStage(exerciseId).stepIndex} of{" "}
{getStepInStage(exerciseId).stepsInStage}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/JourneyView/components/ExerciseInfoModal.tsx
git commit -m "refactor: update ExerciseInfoModal for chapter/stage structure"
```

### Task 10: Add lastWarmupCompletedAt to settings

**Files:**
- Modify: `src/hooks/useSettings.ts`

- [ ] **Step 1: Add the setting**

1. Add to `Settings` interface:
```typescript
lastWarmupCompletedAt: number; // epoch ms, 0 = never
```

2. Add to `DEFAULTS`:
```typescript
lastWarmupCompletedAt: 0,
```

3. Add to `KEYS`:
```typescript
lastWarmupCompletedAt: "attunr.lastWarmupCompletedAt",
```

4. Add to `readStorage`:
```typescript
const warmupRaw = localStorage.getItem(KEYS.lastWarmupCompletedAt);
return {
  // ... existing fields ...
  ...(warmupRaw && { lastWarmupCompletedAt: parseInt(warmupRaw, 10) }),
};
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useSettings.ts
git commit -m "feat: add lastWarmupCompletedAt setting for warmup staleness tracking"
```

### Task 10b: Implement warmup staleness prompting flow

**Files:**
- Modify: `src/components/JourneyView/components/JourneyExercise.tsx`

- [ ] **Step 1: Add warmup staleness check**

When navigating to a stage exercise in a chapter that has a warmup, check if the warmup is stale (>4h since `lastWarmupCompletedAt`) and redirect to warmup if needed.

Add this logic near the top of `JourneyExercise`:

```typescript
const WARMUP_STALE_MS = 4 * 60 * 60 * 1000; // 4 hours

// Check if this exercise belongs to a warmup stage
const isWarmupExercise = chapter?.warmup?.id === exercise.stageId;

// Determine if warmup is needed
const warmupStale = chapter?.warmup
  ? (Date.now() - settings.lastWarmupCompletedAt > WARMUP_STALE_MS)
  : false;
```

- [ ] **Step 2: Add warmup redirect logic**

When the user navigates to a non-warmup stage exercise and the warmup is stale, redirect them to the first warmup exercise:

```typescript
useEffect(() => {
  if (!chapter?.warmup || isWarmupExercise || !warmupStale) return;
  // Redirect to first warmup exercise
  const firstWarmupExerciseId = chapter.warmup.exercises[0]?.id;
  if (firstWarmupExerciseId && firstWarmupExerciseId !== exerciseId) {
    onNext(firstWarmupExerciseId);
  }
}, [chapter, isWarmupExercise, warmupStale, exerciseId, onNext]);
```

- [ ] **Step 3: Update warmup timestamp on warmup completion**

In the `goToNextExercise` function, when the last exercise in a warmup stage is completed, update `lastWarmupCompletedAt`:

```typescript
function goToNextExercise(markComplete: boolean) {
  if (markComplete) {
    onSettingsUpdate("journeyStage", Math.max(highestCompleted, exerciseId));
    analytics.journeyExerciseCompleted(exerciseId, exercise.chapter);

    // Update warmup timestamp if this is the last warmup exercise
    if (isWarmupExercise) {
      const warmupExercises = chapter?.warmup?.exercises ?? [];
      const isLastWarmupExercise = exerciseId === warmupExercises[warmupExercises.length - 1]?.id;
      if (isLastWarmupExercise) {
        onSettingsUpdate("lastWarmupCompletedAt", Date.now());
      }
    }
  }
  // ... rest of existing logic
}
```

- [ ] **Step 4: Verify build**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add src/components/JourneyView/components/JourneyExercise.tsx
git commit -m "feat: add warmup staleness check and redirect flow"
```

---

## Chunk 5: Reference Catalog & Cleanup

### Task 11: Extract exercise reference catalog

**Files:**
- Create: `specs/exercise-catalog.md`

- [ ] **Step 1: Create reference catalog**

Extract all learn screen text, instructions, modal content, and exercise ideas from the existing part files (part1-part5 active, parts 6-20 commented out). Create `specs/exercise-catalog.md` with sections:

- Learn screens (vocal placement, chest/head voice, lip rolls, humming/resonance)
- Vowel progression (U → OO → OH → AH → EH → EE)
- Exercise instructions by type
- Completion modal text
- Ideas from parts 6-20 (extract from commented-out files if they exist)

This is a manual extraction task — read each part file and copy the relevant text content into the catalog.

- [ ] **Step 2: Remove old part files**

Delete `src/constants/journey/part1.ts` through `part5.ts` (and any part6-20 files that exist).

- [ ] **Step 3: Verify build**

Run: `npx tsc --noEmit`
Expected: no errors (index.ts no longer imports old part files)

- [ ] **Step 4: Commit**

```bash
git add specs/exercise-catalog.md
git rm src/constants/journey/part{1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20}.ts
git commit -m "docs: extract exercise catalog, remove old part files"
```

### Task 12: Final verification

- [ ] **Step 1: Run full build**

Run: `npm run build`
Expected: builds successfully

- [ ] **Step 2: Run dev server and manually verify**

Run: `npm run dev`

Check:
- Journey list shows "Chapter 1" and "Chapter 2" with stage sub-headers
- Volume detection exercises work (sss-zzz-sss, voiceless lip roll)
- Pitch detection exercises work (gentle hum, hoo hoo, simple U)
- Melody exercise works (major second)
- Tone follow exercises work (lip roll slide/sustain)
- Farinelli breathwork works
- Exercise completion advances progress
- Sub-nav shows "Chapter 1 — Wake Up · 1 of 4"
- Chapter 1 completion modal fires
- Chapter 2 warmup exercises appear
- Warmup staleness: if >4h since last warmup, navigating to a Chapter 2 stage redirects to warmup
- After completing warmup, navigating to a Chapter 2 stage goes directly to the stage

- [ ] **Step 3: Commit any fixes found during verification**
