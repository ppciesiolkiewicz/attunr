# Rep Progress Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract shared rep-completion logic (confetti, overlays, rep dots) into a feature module and add multi-rep support to VolumeDetectionExercise.

**Architecture:** A new `src/features/rep-progress/` module provides a `useRepCompletion` hook (owns rep counting, congrats/step-check timing, confetti) and three presentational components (`CongratsOverlay`, `StepCheckOverlay`, `RepDots`). Exercises call `completeRep()` when their domain-specific condition is met; the hook handles the celebration lifecycle. VolumeDetectionExercise gains a `reps` config field and uses the hook for multi-rep accumulation.

**Tech Stack:** React 19, TypeScript, Next.js App Router, canvas-confetti, CVA (for any variant styling)

**Spec:** `docs/superpowers/specs/2026-03-19-rep-progress-design.md`

---

## File Map

### New files
- `src/features/rep-progress/index.ts` — public API barrel
- `src/features/rep-progress/useRepCompletion.ts` — shared hook
- `src/features/rep-progress/CongratsOverlay.tsx` — completion overlay component
- `src/features/rep-progress/StepCheckOverlay.tsx` — per-rep overlay component
- `src/features/rep-progress/RepDots.tsx` — dot progress indicators

### Modified files
- `src/constants/journey/types.ts` — add `reps?` to `VolumeDetectionConfig`
- `src/components/Exercise/VolumeDetectionExercise.tsx` — full rewrite with rep support + shared components
- `src/components/Exercise/HillExercise.tsx` — replace inline congrats/step-check/rep-dots with shared components + hook
- `src/components/Exercise/PitchExercise/PitchExercise.tsx` — replace inline overlay JSX with shared components (keep `usePitchProgress`)
- `src/components/Exercise/ToneFollowExercise.tsx` — replace inline congrats with shared hook + component
- `src/components/Exercise/FarinelliBreathworkExercise.tsx` — replace inline congrats with shared hook + component

---

## Task 1: Create `useRepCompletion` hook

**Files:**
- Create: `src/features/rep-progress/useRepCompletion.ts`

- [ ] **Step 1: Create the hook file**

```ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import confetti from "canvas-confetti";

const REP_PHRASES = ["Nice!", "Good one!", "Keep going!"];
const STEP_CHECK_DURATION_MS = 1500;
const CONGRATS_DURATION_MS = 2400;

interface UseRepCompletionOptions {
  totalReps: number;
  exerciseId: number;
  onRepAdvanced?: () => void;
}

interface UseRepCompletionResult {
  currentRep: number;
  isComplete: boolean;
  completeRep: () => void;
  showStepCheck: boolean;
  showCongrats: boolean;
  repPhrase: string;
  overallProgress: number;
  resetProgress: () => void;
}

export function useRepCompletion({
  totalReps,
  exerciseId,
  onRepAdvanced,
}: UseRepCompletionOptions): UseRepCompletionResult {
  const [currentRep, setCurrentRep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showStepCheck, setShowStepCheck] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const onRepAdvancedRef = useRef(onRepAdvanced);
  onRepAdvancedRef.current = onRepAdvanced;
  // Guard against double-calls (e.g. React Strict Mode, rapid triggers)
  const completingRef = useRef(false);

  // Reset on exercise change
  useEffect(() => {
    setCurrentRep(0);
    setIsComplete(false);
    setShowStepCheck(false);
    setShowCongrats(false);
    completingRef.current = false;
  }, [exerciseId]);

  const completeRep = useCallback(() => {
    if (completingRef.current) return;
    completingRef.current = true;

    setCurrentRep((prev) => prev + 1);

    // Use queueMicrotask to run side effects outside the state updater,
    // avoiding React 19 Strict Mode double-invocation and nested setState issues.
    queueMicrotask(() => {
      setCurrentRep((current) => {
        if (current >= totalReps) {
          // Final rep
          setIsComplete(true);
          setShowCongrats(true);
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.45 } });
          setTimeout(() => setShowCongrats(false), CONGRATS_DURATION_MS);
        } else {
          // Intermediate rep
          setShowStepCheck(true);
          setTimeout(() => setShowStepCheck(false), STEP_CHECK_DURATION_MS);
          onRepAdvancedRef.current?.();
        }
        completingRef.current = false;
        return current; // Don't change — already incremented
      });
    });
  }, [totalReps]);

  const resetProgress = useCallback(() => {
    setCurrentRep(0);
    setIsComplete(false);
    setShowStepCheck(false);
    setShowCongrats(false);
    completingRef.current = false;
  }, []);

  const repPhrase = REP_PHRASES[((currentRep || 1) - 1) % REP_PHRASES.length];
  const overallProgress = totalReps > 0 ? currentRep / totalReps : 0;

  return {
    currentRep,
    isComplete,
    completeRep,
    showStepCheck,
    showCongrats,
    repPhrase,
    overallProgress,
    resetProgress,
  };
}
```

> **Note:** `resetProgress` does NOT call `onRepAdvanced`. The caller is responsible for resetting their own state alongside calling `resetProgress` (e.g., VolumeDetectionExercise's `handleRestart` calls both `resetProgress()` and `resetAccumulation()`).

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 3: Commit**

```bash
git add src/features/rep-progress/useRepCompletion.ts
git commit -m "feat: add useRepCompletion hook"
```

---

## Task 2: Create overlay components + barrel

**Files:**
- Create: `src/features/rep-progress/CongratsOverlay.tsx`
- Create: `src/features/rep-progress/StepCheckOverlay.tsx`
- Create: `src/features/rep-progress/RepDots.tsx`
- Create: `src/features/rep-progress/index.ts`

- [ ] **Step 1: Create `CongratsOverlay.tsx`**

Extract the exact JSX from HillExercise lines 194-205:

```tsx
import { Text } from "@/components/ui";

interface CongratsOverlayProps {
  show: boolean;
}

export function CongratsOverlay({ show }: CongratsOverlayProps) {
  if (!show) return null;
  return (
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
  );
}
```

- [ ] **Step 2: Create `StepCheckOverlay.tsx`**

Extract from HillExercise lines 179-191:

```tsx
import { Text } from "@/components/ui";

interface StepCheckOverlayProps {
  show: boolean;
  phrase: string;
  round: number;
  totalReps: number;
}

export function StepCheckOverlay({ show, phrase, round, totalReps }: StepCheckOverlayProps) {
  if (!show) return null;
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
      <div className="step-check-appear flex flex-col items-center gap-2">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-violet-600/25 drop-shadow-lg">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <Text variant="body" className="text-violet-300 font-medium">{phrase}</Text>
        <Text variant="caption" color="muted-1">Round {round}/{totalReps}</Text>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `RepDots.tsx`**

Extract from HillExercise lines 246-263:

```tsx
import { Text } from "@/components/ui";

interface RepDotsProps {
  totalReps: number;
  currentRep: number;
  isComplete: boolean;
}

export function RepDots({ totalReps, currentRep, isComplete }: RepDotsProps) {
  if (totalReps <= 1) return null;
  return (
    <div className="hidden sm:flex items-center gap-1.5">
      {Array.from({ length: totalReps }, (_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full transition-colors duration-300 ${
            i < currentRep
              ? "bg-violet-400"
              : i === currentRep && !isComplete
                ? "bg-violet-400/50"
                : "bg-white/15"
          }`}
        />
      ))}
      <Text variant="caption" color="muted-1" className="ml-0.5 tabular-nums">
        {Math.min(currentRep + 1, totalReps)}/{totalReps}
      </Text>
    </div>
  );
}
```

- [ ] **Step 4: Create `index.ts` barrel**

```ts
export { useRepCompletion } from "./useRepCompletion";
export { CongratsOverlay } from "./CongratsOverlay";
export { StepCheckOverlay } from "./StepCheckOverlay";
export { RepDots } from "./RepDots";
```

- [ ] **Step 5: Verify no TypeScript errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 6: Commit**

```bash
git add src/features/rep-progress/
git commit -m "feat: add rep-progress overlay components and barrel"
```

---

## Task 3: Add `reps` to VolumeDetectionConfig

**Files:**
- Modify: `src/constants/journey/types.ts:279-286`

- [ ] **Step 1: Add `reps?` field**

In `src/constants/journey/types.ts`, add `reps?: number;` to `VolumeDetectionConfig`:

```ts
export interface VolumeDetectionConfig extends BaseExerciseConfig {
  exerciseTypeId: "volume-detection";
  /** Seconds of accumulated sound needed per rep. */
  targetSeconds: number;
  /** Number of reps (defaults to 1). */
  reps?: number;
  /** Timed cue labels that cycle on screen. */
  cues: TimedCue[];
  instruction: string;
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 3: Commit**

```bash
git add src/constants/journey/types.ts
git commit -m "feat: add reps field to VolumeDetectionConfig"
```

---

## Task 4: Rewrite VolumeDetectionExercise with rep support

**Files:**
- Modify: `src/components/Exercise/VolumeDetectionExercise.tsx`

This is a full rewrite. The exercise gains: multi-rep support via `useRepCompletion`, `CircularProgress` center overlay, `ProgressArc` + `RepDots` in bottom panel, `StepCheckOverlay` + `CongratsOverlay`, and a Restart button.

- [ ] **Step 1: Rewrite VolumeDetectionExercise**

```tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button, CircularProgress, Text } from "@/components/ui";
import { useVolumeDetection } from "@/hooks/useVolumeDetection";
import { useRepCompletion, CongratsOverlay, StepCheckOverlay, RepDots } from "@/features/rep-progress";
import { ProgressArc } from "./components/ProgressArc";
import type { VolumeDetectionConfig } from "@/constants/journey";

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
  const lastTickRef = useRef<number | null>(null);
  const repCompleteRef = useRef(false);

  const totalReps = exercise.reps ?? 1;

  const resetAccumulation = useCallback(() => {
    setAccumulatedSeconds(0);
    lastTickRef.current = null;
    repCompleteRef.current = false;
  }, []);

  const {
    currentRep,
    isComplete: exerciseComplete,
    completeRep,
    showStepCheck,
    showCongrats,
    repPhrase,
    resetProgress,
  } = useRepCompletion({
    totalReps,
    exerciseId,
    onRepAdvanced: resetAccumulation,
  });

  // Start listening on mount
  useEffect(() => {
    startListening();
    return () => stopListening();
  }, [startListening, stopListening]);

  // Reset accumulation on exercise change
  useEffect(() => {
    resetAccumulation();
  }, [exerciseId, resetAccumulation]);

  // Accumulate seconds when active.
  // Intentionally no dependency array — runs every render to sample time deltas.
  useEffect(() => {
    if (exerciseComplete || showStepCheck) return;

    if (isActive) {
      const now = performance.now();
      if (lastTickRef.current !== null) {
        const delta = (now - lastTickRef.current) / 1000;
        setAccumulatedSeconds((prev) => {
          const next = prev + delta;
          if (next >= exercise.targetSeconds && !repCompleteRef.current) {
            repCompleteRef.current = true;
            // Schedule completeRep outside of setState
            queueMicrotask(() => completeRep());
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

  // Cycle through timed cues based on accumulated time
  const cues = exercise.cues;
  const cycleDuration = cues.reduce((sum, c) => sum + c.seconds, 0);
  let currentCue = cues[0]?.text ?? "";
  if (cycleDuration > 0) {
    const elapsed = accumulatedSeconds % cycleDuration;
    let cumulative = 0;
    for (const cue of cues) {
      cumulative += cue.seconds;
      if (elapsed < cumulative) {
        currentCue = cue.text;
        break;
      }
    }
  }

  const perRepProgress = exercise.targetSeconds > 0
    ? Math.min(accumulatedSeconds / exercise.targetSeconds, 1)
    : 0;

  const smoothOverallProgress = totalReps > 0
    ? (currentRep + perRepProgress) / totalReps
    : 0;

  const handleRestart = useCallback(() => {
    resetProgress();
    resetAccumulation();
  }, [resetProgress, resetAccumulation]);

  return (
    <>
      <div className="relative flex-1 min-h-0 flex flex-col items-center justify-center gap-6">
        {/* Instruction */}
        <div className="absolute top-2 left-0 right-0 z-10 pointer-events-none flex justify-center px-12">
          <Text variant="caption" color="muted-1" className="text-center leading-snug max-w-[320px]">
            {exercise.instruction.split("\n")[0]}
          </Text>
        </div>

        {/* Current cue */}
        <div className="text-4xl sm:text-5xl font-light text-white/90 tracking-wide">
          {currentCue}
        </div>

        {/* Vertical progress bar */}
        <div className="relative w-12 h-48 sm:h-64 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="absolute bottom-0 left-0 right-0 rounded-full bg-violet-500/60 transition-all duration-150"
            style={{ height: `${perRepProgress * 100}%` }}
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

        {/* Per-rep progress ring */}
        {!exerciseComplete && !showCongrats && !showStepCheck && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-5 transition-opacity duration-300">
            <CircularProgress
              progress={perRepProgress}
              size={200}
              strokeWidth={5}
              showLabel
              className="opacity-35"
            />
          </div>
        )}

        <StepCheckOverlay
          show={showStepCheck && !exerciseComplete}
          phrase={repPhrase}
          round={currentRep + 1}
          totalReps={totalReps}
        />

        <CongratsOverlay show={showCongrats} />
      </div>

      {/* Bottom panel */}
      <div className="border-t border-white/[0.06] bg-white/[0.02] px-3 sm:px-5 py-2 sm:pt-2.5 sm:pb-1.5 flex flex-row flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-4 shrink-0">
        <div className="shrink-0 order-first sm:order-none flex items-center gap-2">
          <ProgressArc progress={exerciseComplete ? 1 : smoothOverallProgress} complete={exerciseComplete} />
          <RepDots totalReps={totalReps} currentRep={currentRep} isComplete={exerciseComplete} />
        </div>

        <div className="flex flex-row items-center gap-2 sm:gap-3 flex-1 min-w-0 sm:flex-initial sm:min-w-0 justify-end sm:ml-auto">
          {exerciseComplete && (
            <Button
              variant="outline"
              onClick={handleRestart}
              className="shrink-0 px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm"
              title="Restart exercise"
            >
              ↺  Restart
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
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 3: Manual test**

Open a volume-detection exercise in the browser. Verify:
- Volume bar fills as you make sound
- CircularProgress ring shows per-rep progress in center
- ProgressArc shows in bottom panel
- Exercise completes with confetti + congrats overlay
- If you add `reps: 2` to a test exercise config, verify step-check shows between reps

- [ ] **Step 4: Commit**

```bash
git add src/components/Exercise/VolumeDetectionExercise.tsx
git commit -m "feat: rewrite VolumeDetectionExercise with rep support and shared progress components"
```

---

## Task 5: Refactor HillExercise to use shared components

**Files:**
- Modify: `src/components/Exercise/HillExercise.tsx`

HillExercise currently uses `usePitchProgress` for per-rep tracking (which returns `seqIndex`, `showStepCheck`, `stageComplete`). We replace the inline congrats state/effect/JSX and the inline step-check/rep-dots JSX with the shared components. We wire `useRepCompletion` for congrats only (since `usePitchProgress` already handles step timing).

**Strategy:** Use `useRepCompletion` with `totalReps: 1` purely for congrats lifecycle (confetti + overlay), and use `<StepCheckOverlay>` and `<RepDots>` as presentational components driven by `usePitchProgress`'s `showStepCheck` and `seqIndex`.

- [ ] **Step 1: Update imports**

Replace:
```ts
import confetti from "canvas-confetti";
```

Add:
```ts
import { useRepCompletion, CongratsOverlay, StepCheckOverlay, RepDots } from "@/features/rep-progress";
```

- [ ] **Step 2: Replace congrats state management**

Remove lines 97-108 (REP_PHRASES, showCongrats state, useEffect with confetti).

Add after usePitchProgress:
```ts
const REP_PHRASES = ["Nice!", "Good one!", "Keep going!"];
const repPhrase = REP_PHRASES[(seqIndex - 1) % REP_PHRASES.length];

const { showCongrats, completeRep: completeFinal } = useRepCompletion({
  totalReps: 1,
  exerciseId,
});
```

Wire `completeFinal` to fire when `exerciseComplete` becomes true:
```ts
useEffect(() => {
  if (exerciseComplete) completeFinal();
}, [exerciseComplete, completeFinal]);
```

- [ ] **Step 3: Replace inline overlay JSX**

Replace the step-check block (lines 179-191) with:
```tsx
<StepCheckOverlay
  show={showStepCheck && !exerciseComplete}
  phrase={repPhrase}
  round={seqIndex + 1}
  totalReps={totalTargets}
/>
```

Replace the congrats block (lines 194-205) with:
```tsx
<CongratsOverlay show={showCongrats} />
```

- [ ] **Step 4: Replace inline rep dots**

Replace the rep dots block (lines 246-263) with:
```tsx
<RepDots totalReps={totalTargets} currentRep={seqIndex} isComplete={exerciseComplete} />
```

- [ ] **Step 5: Remove unused imports**

Remove `confetti` import. Verify `canvas-confetti` is no longer directly imported.

- [ ] **Step 6: Verify no TypeScript errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 7: Commit**

```bash
git add src/components/Exercise/HillExercise.tsx
git commit -m "refactor: HillExercise uses shared rep-progress components"
```

---

## Task 6: Refactor PitchExercise to use shared overlay components (presentational only)

**Files:**
- Modify: `src/components/Exercise/PitchExercise/PitchExercise.tsx`

Per the spec, PitchExercise does NOT use `useRepCompletion` — `usePitchProgress` continues to own all progress/step logic. We only replace the inline overlay JSX with the shared presentational components. The existing `showCongrats` state + confetti useEffect stays as-is.

> **Visual change:** PitchExercise's step check grows from w-12 h-12 (no text) to w-16 h-16 with phrase + round text. This is an intentional visual upgrade.

- [ ] **Step 1: Update imports**

Add (keep existing `confetti` import — still used for congrats):
```ts
import { CongratsOverlay, StepCheckOverlay } from "@/features/rep-progress";
```

- [ ] **Step 2: Add REP_PHRASES constant**

Add near the top of the component:
```ts
const REP_PHRASES = ["Nice!", "Good one!", "Keep going!"];
```

- [ ] **Step 3: Replace inline overlay JSX**

Replace the step-check block (lines 195-203) with:
```tsx
<StepCheckOverlay
  show={showStepCheck}
  phrase={REP_PHRASES[(seqIndex - 1) % REP_PHRASES.length]}
  round={seqIndex + 1}
  totalReps={resolved.targets.length}
/>
```

Replace the congrats block (lines 219-227) with:
```tsx
<CongratsOverlay show={showCongrats} />
```

- [ ] **Step 4: Remove unused imports**

Remove `confetti` import if it's no longer used directly (check — the `showCongrats` useEffect still fires confetti). If the useEffect still uses `confetti`, keep the import.

- [ ] **Step 5: Verify no TypeScript errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 6: Commit**

```bash
git add src/components/Exercise/PitchExercise/PitchExercise.tsx
git commit -m "refactor: PitchExercise uses shared overlay components (presentational only)"
```

---

## Task 7: Refactor ToneFollowExercise to use shared hook + component

**Files:**
- Modify: `src/components/Exercise/ToneFollowExercise.tsx`

ToneFollowExercise has no reps — just a single completion. Use `useRepCompletion` with `totalReps: 1`. The existing play-count dots (lines 183-202) are exercise-specific UI and stay unchanged.

- [ ] **Step 1: Update imports**

Replace `import confetti from "canvas-confetti"` with:
```ts
import { useRepCompletion, CongratsOverlay } from "@/features/rep-progress";
```

- [ ] **Step 2: Replace congrats state management**

Remove `showCongrats` useState and the useEffect with confetti (lines 56, 67-73).

Add:
```ts
const { showCongrats, completeRep: completeFinal } = useRepCompletion({
  totalReps: 1,
  exerciseId,
});

useEffect(() => {
  if (exerciseComplete) completeFinal();
}, [exerciseComplete, completeFinal]);
```

- [ ] **Step 3: Replace inline congrats JSX**

Replace the congrats overlay block (lines 164-172) with:
```tsx
<CongratsOverlay show={showCongrats} />
```

- [ ] **Step 4: Remove unused imports**

Remove `confetti` import.

- [ ] **Step 5: Verify no TypeScript errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 6: Commit**

```bash
git add src/components/Exercise/ToneFollowExercise.tsx
git commit -m "refactor: ToneFollowExercise uses shared rep-progress components"
```

---

## Task 8: Refactor FarinelliBreathworkExercise to use shared hook + component

**Files:**
- Modify: `src/components/Exercise/FarinelliBreathworkExercise.tsx`

Simplest refactor — just congrats with `totalReps: 1`.

> **Important:** FarinelliBreathworkExercise's `exerciseComplete` is local state (`useState(false)`) with no reset on `exerciseId` change. We must add a reset effect to prevent stale state from triggering congrats on the next exercise.

- [ ] **Step 1: Update imports**

Replace `import confetti from "canvas-confetti"` with:
```ts
import { useRepCompletion, CongratsOverlay } from "@/features/rep-progress";
```

- [ ] **Step 2: Add exerciseComplete reset on exercise change**

Add a reset effect that clears `exerciseComplete` when `exerciseId` changes:
```ts
useEffect(() => {
  setExerciseComplete(false);
}, [exerciseId]);
```

- [ ] **Step 3: Replace congrats state management**

Remove `showCongrats` useState and the useEffect with confetti (lines 29-37).

Add:
```ts
const { showCongrats, completeRep: completeFinal } = useRepCompletion({
  totalReps: 1,
  exerciseId,
});

useEffect(() => {
  if (exerciseComplete) completeFinal();
}, [exerciseComplete, completeFinal]);
```

- [ ] **Step 4: Replace inline congrats JSX**

Replace the congrats overlay block (lines 47-55) with:
```tsx
<CongratsOverlay show={showCongrats} />
```

- [ ] **Step 5: Remove unused imports**

Remove `confetti` import.

- [ ] **Step 6: Verify no TypeScript errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 7: Commit**

```bash
git add src/components/Exercise/FarinelliBreathworkExercise.tsx
git commit -m "refactor: FarinelliBreathworkExercise uses shared rep-progress components"
```

---

## Task 9: Final verification

- [ ] **Step 1: Full TypeScript check**

Run: `npx tsc --noEmit --pretty`
Expected: No errors.

- [ ] **Step 2: Verify no direct confetti imports remain in refactored exercises**

Run: `grep -r "from \"canvas-confetti\"" src/components/Exercise/ --include="*.tsx" --include="*.ts"`

Expected: Only MelodyExercise.tsx and RhythmExercise.tsx (deferred — they use confetti in modal flows).

- [ ] **Step 3: Build check**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds.

- [ ] **Step 4: Commit any remaining fixes**

If any fixes were needed, commit them.

---

## Out of Scope (Deferred)

- **MelodyExercise / RhythmExercise** — fire confetti inside modal result flows. Extracting requires rethinking modal integration. Defer.
- **Refactoring `usePitchProgress` to delegate to `useRepCompletion`** — would clean up PitchExercise/HillExercise further but is a larger change.
- **Storybook stories for overlay components** — should be added but can be a follow-up.
