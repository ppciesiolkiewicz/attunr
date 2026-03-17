# Exercise Rethink — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve exercise UX — new hill exercise type, floating start button, rhythm rework, chapter roman numerals, updated instructions, and majorSecond generator.

**Architecture:** New `pitch-detection-hill` exerciseTypeId with dedicated `HillExercise` component. Replace full-screen start overlay with floating blurred container. Rhythm exercise gets intro pauses and fixed scoring. Chapter numbers become roman numerals throughout.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Canvas API

**Spec:** `docs/superpowers/specs/2026-03-17-exercise-rethink-design.md`

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/constants/journey/types.ts` | Modify | Add `PitchDetectionHillConfig`, update unions |
| `src/constants/journey/exercise-generator.ts` | Modify | Add `HillSustainParams`, `gen.hillSustain()`, `gen.majorSecond()`, update `gen.zoneAbove()` |
| `src/lib/resolve-exercise.ts` | Modify | Add `PitchDetectionHillExercise` type, `resolvePitchDetectionHill()`, update switch, add metronome beats to rhythm resolver |
| `src/constants/journey/index.ts` | Modify | Re-export `PitchDetectionHillConfig` from barrel |
| `src/lib/format.ts` | Create | `toRoman()` utility |
| `src/constants/journey/Journey.ts` | Modify | Add intro modal builder for `pitch-detection-hill` |
| `src/constants/journey/chapter1.ts` | Modify | Rename Simple U → Low Uu, use `gen.hillSustain()`, use `gen.majorSecond()`, update instructions |
| `src/constants/journey/chapter2.ts` | Modify | Rework rhythm pattern |
| `src/components/Exercise/ExerciseStartButton.tsx` | Create (rename) | Floating start button replacing overlay |
| `src/components/Exercise/HillExercise.tsx` | Create | Dedicated hill pitch exercise component |
| `src/components/Exercise/BaseExercise.tsx` | Modify | Add `pitch-detection-hill` dispatch case |
| `src/components/Exercise/PitchExercise/PitchExercise.tsx` | Modify | Switch to `ExerciseStartButton` |
| `src/components/Exercise/MelodyExercise.tsx` | Modify | Switch to `ExerciseStartButton` |
| `src/components/Exercise/RhythmExercise.tsx` | Modify | Rework timing, pattern, hit window |
| `src/components/Exercise/LearnExercise.tsx` | Modify | Chapter/Ch roman numeral headline |
| `src/components/JourneyView/components/JourneyList.tsx` | Modify | Roman numeral chapter labels |
| `src/components/JourneyView/components/JourneyExercise.tsx` | Modify | Pass roman numeral |

---

## Task 1: Types — Add `pitch-detection-hill`

**Files:**
- Modify: `src/constants/journey/types.ts:9-18` (ExerciseTypeId), `src/constants/journey/types.ts:280-289` (ExerciseConfig union)

- [ ] **Step 1: Add `"pitch-detection-hill"` to `ExerciseTypeId`**

In `src/constants/journey/types.ts`, add `"pitch-detection-hill"` to the ExerciseTypeId union at line ~18:

```ts
export type ExerciseTypeId =
  | "learn"
  | "learn-notes-1"
  | "pitch-detection"
  | "pitch-detection-slide"
  | "pitch-detection-hill"    // ← add
  | "breathwork-farinelli"
  | "tone-follow"
  | "melody"
  | "volume-detection"
  | "rhythm";
```

- [ ] **Step 2: Add `PitchDetectionHillConfig` interface**

Add after `PitchDetectionSlideConfig` (around line 165):

```ts
export interface PitchDetectionHillConfig extends BaseExerciseConfig {
  exerciseTypeId: "pitch-detection-hill";
  scale: BaseScale;
  toneShape?: ToneShape;
  notes: SustainNoteConfig[];
  /** Ball rolls uphill or downhill based on pitch direction. */
  direction: "up" | "down";
  instruction: string;
}
```

- [ ] **Step 3: Add to `ExerciseConfig` union**

In the `ExerciseConfig` type union (line ~280), add `PitchDetectionHillConfig`:

```ts
export type ExerciseConfig =
  | LearnConfig
  | LearnNotesConfig
  | PitchDetectionConfig
  | PitchDetectionSlideConfig
  | PitchDetectionHillConfig    // ← add
  | FarinelliBreathworkConfig
  | ToneFollowConfig
  | MelodyConfig
  | VolumeDetectionConfig
  | RhythmConfig;
```

- [ ] **Step 4: Add to barrel export**

In `src/constants/journey/index.ts`, add `PitchDetectionHillConfig` to the type re-exports (after `PitchDetectionSlideConfig`):

```ts
  PitchDetectionHillConfig,
```

- [ ] **Step 5: Verify build**

Run: `npx tsc --noEmit`
Expected: PASS (no type errors)

- [ ] **Step 6: Commit**

```bash
git add src/constants/journey/types.ts src/constants/journey/index.ts
git commit -m "feat: add pitch-detection-hill exercise type"
```

---

## Task 2: Generators — `hillSustain()`, `majorSecond()`, update `zoneAbove()`

**Files:**
- Modify: `src/constants/journey/exercise-generator.ts`

- [ ] **Step 1: Add `HillSustainParams` interface**

Add after `LipRollSustainParams` (around line 97):

```ts
export interface HillSustainParams extends CommonParams {
  note: number;
  seconds: number;
  repeats?: number;
  direction: "up" | "down";
  toneShape?: ToneShape;
}
```

- [ ] **Step 2: Add `gen.hillSustain()` method**

Add before the closing brace of `ExerciseGenerator` class (before line 612):

```ts
  /** Hill sustain exercise. Pitch-detection-hill with sustained note. */
  hillSustain(params: HillSustainParams): ExerciseConfigInput {
    const {
      title,
      subtitle,
      cardCue,
      instruction,
      introModal,
      completionModal,
      note,
      seconds,
      repeats = 3,
      direction,
      toneShape,
    } = params;

    const target = { kind: BandTargetKind.Index as const, i: 1 };
    const notes = Array.from({ length: repeats }, () => ({ target, seconds }));

    return {
      title,
      subtitle,
      cardCue,
      instruction,
      introModal,
      completionModal,
      exerciseTypeId: "pitch-detection-hill",
      scale: { type: "chromatic", root: note },
      toneShape,
      direction,
      notes,
    };
  }
```

- [ ] **Step 3: Add `gen.majorSecond()` method**

Add after `gen.fifth()` (after line 327):

```ts
  /** Major second interval exercise (chromaticDegree = 3, defaults startNote=1, endNote=6). */
  majorSecond(params: NamedMelodyParams): ExerciseConfigInput {
    return this.interval({
      ...params,
      startNote: params.startNote ?? 1,
      endNote: params.endNote ?? 6,
      chromaticDegree: 3,
    });
  }
```

- [ ] **Step 4: Update `gen.zoneAbove()` to produce `pitch-detection-hill`**

In `gen.zoneAbove()` (line ~412), change the return to produce the new type. Replace the return block (around lines 432-444):

```ts
    return {
      title,
      subtitle,
      cardCue,
      instruction,
      introModal,
      completionModal,
      exerciseTypeId: "pitch-detection-hill",
      scale: { type: "chromatic", root: 1 },
      toneShape: { kind: "owl-hoot" },
      direction: "up",
      notes,
    };
```

- [ ] **Step 5: Verify build**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/constants/journey/exercise-generator.ts
git commit -m "feat: add hillSustain, majorSecond generators, update zoneAbove"
```

---

## Task 3: Resolve — Add `PitchDetectionHillExercise` resolution

**Files:**
- Modify: `src/lib/resolve-exercise.ts`

- [ ] **Step 1: Add `PitchDetectionHillExercise` interface**

Add after `PitchDetectionSlideExercise` (around line 39):

```ts
export interface PitchDetectionHillExercise extends ExerciseBase {
  exerciseTypeId: "pitch-detection-hill";
  targets: PitchTarget[];
  toneShape: ToneShape;
  direction: "up" | "down";
}
```

- [ ] **Step 2: Add to `Exercise` union**

Update the `Exercise` type (line ~79):

```ts
export type Exercise =
  | PitchDetectionExercise
  | PitchDetectionSlideExercise
  | PitchDetectionHillExercise    // ← add
  | ToneFollowExercise
  | MelodyExercise
  | RhythmExercise;
```

- [ ] **Step 3: Add `resolvePitchDetectionHill()` function**

Add before `resolveExercise()` (before line 321). This reuses the same resolution logic as `resolvePitchDetection` but adds `direction`:

```ts
function resolvePitchDetectionHill(
  exercise: PitchDetectionHillConfig,
  vocalRange: VocalRange,
): PitchDetectionHillExercise {
  const scale = new Scale(exercise.scale, vocalRange);
  const allNotes = vocalRange.allNotes;

  const targets: PitchTarget[] = [];
  for (const n of exercise.notes) {
    const resolved = scale.resolve(n.target);
    const colored = resolved[0] ? vocalRange.findNote(resolved[0].midi) : null;
    if (!colored) continue;
    const target: PitchTarget = { note: colored, seconds: n.seconds };
    if (n.target.kind === "range") {
      target.accept = n.target.accept ?? "within";
      target.rangeNotes = resolved
        .map((r) => vocalRange.findNote(r.midi))
        .filter((c): c is ColoredNote => c !== null);
    }
    targets.push(target);
  }

  const exerciseColoredNotes = targets.map((t) => t.note);
  const displayNotes = computeDisplayRange(exerciseColoredNotes, allNotes);
  const highlightIds = exerciseColoredNotes.map((n) => n.id);

  return {
    exerciseTypeId: "pitch-detection-hill",
    targets,
    displayNotes,
    highlightIds,
    toneShape: exercise.toneShape ?? { kind: "sustain" },
    direction: exercise.direction,
  };
}
```

- [ ] **Step 4: Add case to `resolveExercise` switch**

Add after the `"pitch-detection-slide"` case (line ~329):

```ts
    case "pitch-detection-hill":
      return resolvePitchDetectionHill(exercise, vocalRange);
```

- [ ] **Step 5: Add import for `PitchDetectionHillConfig`**

Add `PitchDetectionHillConfig` to the imports from `@/constants/journey` at the top of the file.

- [ ] **Step 6: Update `resolveRhythm()` — add metronome beat timeline**

The current `resolveRhythm()` only puts tap events into `beats[]`. But the metronome must also click during pause events (especially the 4-beat intro). Add a separate `metronomeTicks` array to `RhythmExercise`:

First, update the `RhythmExercise` interface (around line 70):

```ts
export interface RhythmExercise extends ExerciseBase {
  exerciseTypeId: "rhythm";
  tempo: number;
  metronome: boolean;
  minScore: number;
  beats: Beat[];
  /** Timestamps (ms) for all metronome clicks (taps + pauses). */
  metronomeTicks: number[];
  totalDurationMs: number;
}
```

Then update `resolveRhythm()` (around line 292):

```ts
function resolveRhythm(
  exercise: RhythmConfig,
  _vocalRange: VocalRange,
): RhythmExercise {
  const beats: Beat[] = [];
  const metronomeTicks: number[] = [];
  let cursor = 0;

  for (const event of exercise.pattern) {
    const ms = durationToMs(event.duration, exercise.tempo);
    if (event.type === "tap") {
      beats.push({ startMs: cursor, durationMs: ms });
    }
    // All events (tap + pause) get a metronome tick at their start
    metronomeTicks.push(cursor);
    cursor += ms;
  }

  return {
    exerciseTypeId: "rhythm",
    tempo: exercise.tempo,
    metronome: exercise.metronome ?? false,
    minScore: exercise.minScore,
    beats,
    metronomeTicks,
    totalDurationMs: cursor,
    displayNotes: [],
    highlightIds: [],
  };
}
```

- [ ] **Step 7: Verify build**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/lib/resolve-exercise.ts
git commit -m "feat: add pitch-detection-hill resolution"
```

---

## Task 4: `ExerciseStartButton` — Floating container

**Files:**
- Create: `src/components/Exercise/ExerciseStartButton.tsx` (replacing `ExerciseStartOverlay.tsx`)
- Modify: `src/components/Exercise/PitchExercise/PitchExercise.tsx:11,192`
- Modify: `src/components/Exercise/MelodyExercise.tsx:8,276`

- [ ] **Step 1: Create `ExerciseStartButton.tsx`**

Create `src/components/Exercise/ExerciseStartButton.tsx`:

```tsx
"use client";

import { useState, useCallback } from "react";
import { Button } from "@ui";

interface ExerciseStartButtonProps {
  onStart: () => void;
}

export function ExerciseStartButton({ onStart }: ExerciseStartButtonProps) {
  const [fading, setFading] = useState(false);

  const handleStart = useCallback(() => {
    setFading(true);
    setTimeout(() => {
      onStart();
    }, 300);
  }, [onStart]);

  return (
    <div
      className={`absolute inset-0 z-20 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="pointer-events-auto backdrop-blur-md bg-black/20 rounded-2xl px-8 py-6">
        <Button variant="primary" size="lg" onClick={handleStart}>
          Start
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update `PitchExercise.tsx` import and usage**

In `src/components/Exercise/PitchExercise/PitchExercise.tsx`:

Replace import (line 11):
```ts
// Old:
import { ExerciseStartOverlay } from "../ExerciseStartOverlay";
// New:
import { ExerciseStartButton } from "../ExerciseStartButton";
```

Replace usage (line 192):
```tsx
// Old:
{!hasStarted && <ExerciseStartOverlay onStart={handleExerciseStart} />}
// New:
{!hasStarted && <ExerciseStartButton onStart={handleExerciseStart} />}
```

- [ ] **Step 3: Update `MelodyExercise.tsx` import and usage**

In `src/components/Exercise/MelodyExercise.tsx`:

Replace import (line 8):
```ts
// Old:
import { ExerciseStartOverlay } from "./ExerciseStartOverlay";
// New:
import { ExerciseStartButton } from "./ExerciseStartButton";
```

Replace usage (line 276):
```tsx
// Old:
{!hasStarted && <ExerciseStartOverlay onStart={handleExerciseStart} />}
// New:
{!hasStarted && <ExerciseStartButton onStart={handleExerciseStart} />}
```

- [ ] **Step 4: Delete old `ExerciseStartOverlay.tsx`**

```bash
rm src/components/Exercise/ExerciseStartOverlay.tsx
```

- [ ] **Step 5: Verify build**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add -A src/components/Exercise/ExerciseStartButton.tsx src/components/Exercise/ExerciseStartOverlay.tsx src/components/Exercise/PitchExercise/PitchExercise.tsx src/components/Exercise/MelodyExercise.tsx
git commit -m "feat: replace ExerciseStartOverlay with floating ExerciseStartButton"
```

---

## Task 5: `HillExercise` component

**Files:**
- Create: `src/components/Exercise/HillExercise.tsx`
- Modify: `src/components/Exercise/BaseExercise.tsx`

- [ ] **Step 1: Create `HillExercise.tsx`**

Create `src/components/Exercise/HillExercise.tsx`. This is a simplified version of `PitchExercise` that always renders `HillBallCanvas`:

```tsx
"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import HillBallCanvas from "@/components/HillBallCanvas";
import { Button, CircularProgress, Text } from "@/components/ui";
import { usePitchProgress } from "./PitchExercise/usePitchProgress";
import { useTonePlayer } from "@/hooks/useTonePlayer";
import { ExerciseStartButton } from "./ExerciseStartButton";
import { ProgressArc } from "./components/ProgressArc";
import type { PitchDetectionHillConfig } from "@/constants/journey";
import type { PitchDetectionHillExercise as ResolvedHillExercise } from "@/lib/resolve-exercise";
import type { ColoredNote } from "@/lib/VocalRange";

interface HillExerciseProps {
  exercise: PitchDetectionHillConfig;
  exerciseId: number;
  isLast: boolean;
  resolved: ResolvedHillExercise;
  pitchHz: number | null;
  pitchHzRef: React.RefObject<number | null>;
  isAlreadyCompleted: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onPrev?: () => void;
}

export function HillExercise({
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
}: HillExerciseProps) {
  const [hasStarted, setHasStarted] = useState(false);
  const [detectionActive, setDetectionActive] = useState(false);
  const { playTone: playRawTone, playWobble, playOwlHoot } = useTonePlayer();

  const exerciseColoredNotes = useMemo(
    () => resolved.targets.map((t) => t.note),
    [resolved],
  );

  const accept: "above" | "below" =
    exercise.direction === "up" ? "above" : "below";

  // usePitchProgress expects PitchDetectionConfig | PitchDetectionSlideConfig.
  // We cast since PitchDetectionHillConfig has the same note/target structure.
  const progressExercise = useMemo(
    () => ({
      ...exercise,
      exerciseTypeId: "pitch-detection" as const,
    }),
    [exercise],
  );

  const progressResolved = useMemo(
    () => ({
      ...resolved,
      exerciseTypeId: "pitch-detection" as const,
    }),
    [resolved],
  );

  const { progress, stageComplete: exerciseComplete, resetProgress } =
    usePitchProgress({
      exercise: progressExercise,
      exerciseId,
      resolved: progressResolved,
      pitchHzRef,
      enabled: detectionActive,
    });

  const [showCongrats, setShowCongrats] = useState(false);

  useEffect(() => {
    if (!exerciseComplete) return;
    setShowCongrats(true);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.45 } });
    const id = setTimeout(() => setShowCongrats(false), 2400);
    return () => clearTimeout(id);
  }, [exerciseComplete]);

  // Tone playback
  const toneShape = resolved.toneShape;

  const playReferenceTone = useCallback(() => {
    const freq = exerciseColoredNotes[0]?.frequencyHz;
    if (!freq) return;
    switch (toneShape.kind) {
      case "wobble":
        playWobble(freq, { binaural: true });
        break;
      case "owl-hoot":
        playOwlHoot(freq, { binaural: true });
        break;
      default:
        playRawTone(freq, { binaural: true });
        break;
    }
  }, [toneShape, exerciseColoredNotes, playWobble, playOwlHoot, playRawTone]);

  const handleExerciseStart = useCallback(() => {
    setHasStarted(true);
    setTimeout(() => {
      playReferenceTone();
      setDetectionActive(true);
    }, 500);
  }, [playReferenceTone]);

  const handleRestart = useCallback(() => {
    resetProgress();
    playReferenceTone();
  }, [resetProgress, playReferenceTone]);

  useEffect(() => {
    setHasStarted(false);
    setDetectionActive(false);
  }, [exerciseId]);

  return (
    <>
      <div className="relative flex-1 min-h-0">
        {/* Instruction cue */}
        <div className="absolute top-2 left-0 right-0 z-10 pointer-events-none flex justify-center px-12">
          <Text variant="caption" color="muted-1" className="text-center leading-snug max-w-[320px]">
            {exercise.instruction.split("\n")[0]}
          </Text>
        </div>

        {/* Canvas */}
        <HillBallCanvas
          bands={exerciseColoredNotes}
          currentHzRef={pitchHzRef}
          direction={exercise.direction}
          accept={accept}
        />

        {/* Start button */}
        {!hasStarted && <ExerciseStartButton onStart={handleExerciseStart} />}

        {/* Progress ring */}
        {!exerciseComplete && !showCongrats && pitchHz !== null && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-5 transition-opacity duration-300">
            <CircularProgress
              progress={progress}
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

        {/* Pitch info overlay */}
        {pitchHz !== null && (
          <div className="pointer-events-none absolute top-3 left-4 right-4 fade-in flex items-start justify-between gap-4">
            <div className="shrink-0">
              <Text
                as="div"
                variant="heading-lg"
                className="font-light"
                style={{ color: exerciseColoredNotes[0]?.color ?? "#fff" }}
              >
                {exerciseComplete ? "✓ " : ""}
                {exercise.direction === "up" ? "Go higher" : "Go lower"}
              </Text>
            </div>
          </div>
        )}
      </div>

      {/* Bottom panel */}
      <div className="border-t border-white/[0.06] bg-white/[0.02] px-3 sm:px-5 py-2 sm:pt-2.5 sm:pb-1.5 flex flex-row flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-4 shrink-0">
        <div className="shrink-0 order-first sm:order-none flex items-center gap-2">
          <ProgressArc progress={exerciseComplete ? 1 : progress} complete={exerciseComplete} />
        </div>

        <div className="flex flex-row items-center gap-2 sm:gap-3 flex-1 min-w-0 sm:flex-initial sm:min-w-0 justify-end sm:ml-auto">
          {hasStarted && (
            <Button
              variant="outline"
              onClick={handleRestart}
              className="shrink-0 px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm"
              title="Restart exercise"
            >
              ↺ Restart
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

- [ ] **Step 2: Add to `BaseExercise.tsx` dispatcher**

In `src/components/Exercise/BaseExercise.tsx`:

Add import:
```ts
import { HillExercise } from "./HillExercise";
```

Add import for the resolved type:
```ts
import type { ..., PitchDetectionHillExercise as ResolvedHillExercise } from "@/lib/resolve-exercise";
```

Add case before `"pitch-detection"` (around line 157):

```tsx
    case "pitch-detection-hill":
      return (
        <HillExercise
          exercise={exercise}
          exerciseId={exerciseId}
          isLast={isLast}
          resolved={resolved as ResolvedHillExercise}
          pitchHz={pitchHz}
          pitchHzRef={pitchHzRef}
          isAlreadyCompleted={isAlreadyCompleted}
          onComplete={onComplete}
          onSkip={onSkip}
          onPrev={onPrev}
        />
      );
```

Also update the `resolved` computation — `pitch-detection-hill` needs resolution (add it to the condition that calls `journey.getExercise` around line 61-71):

The current code at line 62-68 skips resolution for learn/breathwork/volume-detection. `pitch-detection-hill` should NOT be skipped — it needs resolution. No change needed here since it's not in the skip list.

- [ ] **Step 3: Verify build**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/Exercise/HillExercise.tsx src/components/Exercise/BaseExercise.tsx
git commit -m "feat: add HillExercise component and dispatcher case"
```

---

## Task 6: Journey.ts — Intro modal for `pitch-detection-hill`

**Files:**
- Modify: `src/constants/journey/Journey.ts:73-201`

- [ ] **Step 1: Add intro modal case for `pitch-detection-hill`**

In `Journey.ts` `buildIntroModal()`, add a case for `pitch-detection-hill`. Add before the pitch exercises case (before line ~177). The logic mirrors pitch-detection:

```ts
    // Hill pitch exercises (Low Uu, Hoo Hoo)
    if (exercise.exerciseTypeId === "pitch-detection-hill") {
      for (const line of exercise.instruction.split("\n")) {
        if (line.trim()) {
          elements.push({
            type: "paragraph",
            text: line,
            variant: elements.length === 0 ? undefined : "secondary",
          });
        }
      }
      const reps = exercise.notes.length;
      const secs = exercise.notes[0]?.seconds ?? 0;
      return {
        title: exercise.title,
        subtitle: `${secs}s × ${reps} reps`,
        elements,
      };
    }
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/constants/journey/Journey.ts
git commit -m "feat: add intro modal for pitch-detection-hill exercises"
```

---

## Task 7: Chapter configs — Rename, generators, instructions

**Files:**
- Modify: `src/constants/journey/chapter1.ts`
- Modify: `src/constants/journey/chapter2.ts`

- [ ] **Step 1: Update Sss-Zzz-Sss instruction (chapter1.ts line ~45)**

Change instruction:
```ts
instruction: "Alternate between sss and zzz sounds. No pitch needed — just feel the vibration shift from voiceless to voiced.\nIt's okay to take breaths between sounds.",
```

- [ ] **Step 2: Update Voiceless Lip Roll instruction (chapter1.ts line ~54)**

Change instruction:
```ts
instruction: "Let your lips buzz loosely — like a motorboat. No pitch, just the buzz.\nFill the bar by lip rolling — it's okay to do several lip rolls and take breaths between them.",
```

- [ ] **Step 3: Switch Hoo Hoo to use updated `gen.zoneAbove()`**

The `gen.zoneAbove()` call at line ~72 already works — it now produces `pitch-detection-hill` with `direction: "up"`. No change needed in chapter1.ts for this exercise.

- [ ] **Step 4: Rename "Simple U" → "Low Uu" and switch to `gen.hillSustain()`**

Replace the `gen.sustain()` call at line ~81 with `gen.hillSustain()`:

```ts
      gen.hillSustain({
        note: 1,
        seconds: 6,
        direction: "down",
        title: "Low Uu",
        subtitle: "Chest voice · 6 seconds × 3",
        cardCue: "Warm up your chest voice with a low Uu vowel",
        instruction: "Sing uuuu (as in 'moon') on a low tone.\nSlightly wobble your voice to keep it loose.\nThis warms up your lower register.",
      }),
```

- [ ] **Step 5: Replace inline Major Second with `gen.majorSecond()`**

Replace the inline melody config at lines ~113-132 with:

```ts
      gen.majorSecond({
        title: "Major Second",
        subtitle: "Sing two notes · intervals",
        cardCue: "Your first melody — just two adjacent notes",
        tempo: 50,
        instruction: "Sing the two notes as they appear — the piano plays each note for you.\nThis is a major second — the smallest melodic step.\nListen and match.",
      }),
```

- [ ] **Step 6: Update rhythm exercise pattern in chapter2.ts**

Replace the rhythm exercise pattern at lines ~98-117 in `chapter2.ts`:

```ts
      {
        exerciseTypeId: "rhythm",
        title: "Feel the Beat",
        cardCue: "Tap along to the beat",
        tempo: 80,
        pattern: [
          // 4-beat intro (metronome plays, not scored)
          { type: "pause", duration: NoteDuration.Quarter },
          { type: "pause", duration: NoteDuration.Quarter },
          { type: "pause", duration: NoteDuration.Quarter },
          { type: "pause", duration: NoteDuration.Quarter },
          // Row 1
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
          // 2-beat pause
          { type: "pause", duration: NoteDuration.Half },
          // Row 2
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
          // 2-beat pause
          { type: "pause", duration: NoteDuration.Half },
          // Row 3
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
          // 2-beat pause
          { type: "pause", duration: NoteDuration.Half },
          // Row 4
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
        ],
        metronome: true,
        minScore: 60,
        instruction: "Tap the spacebar or touch the screen on each beat",
      },
```

- [ ] **Step 7: Verify build**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add src/constants/journey/chapter1.ts src/constants/journey/chapter2.ts
git commit -m "feat: update exercise configs — Low Uu, majorSecond, rhythm, instructions"
```

---

## Task 8: Rhythm exercise — Timing, metronome, and hit window fixes

**Files:**
- Modify: `src/components/Exercise/RhythmExercise.tsx`

- [ ] **Step 1: Remove `PRE_ROLL_MS` constant**

Delete line 13 (`const PRE_ROLL_MS = 2000;`). The 4-beat intro pauses are now part of the resolved pattern.

- [ ] **Step 2: Fix beat scoring — measure from `beatStartMs` not `beatCenter`**

In `handleTap` (line ~127), change the beat matching:

```ts
// Old:
const beatCenter = beats[i].startMs + PRE_ROLL_MS + beats[i].durationMs / 2;
const dist = Math.abs(tapElapsed - beatCenter);

// New:
const beatStart = beats[i].startMs;
const dist = Math.abs(tapElapsed - beatStart);
```

- [ ] **Step 3: Remove `PRE_ROLL_MS` from `handleStart`**

In `handleStart` (line ~174), remove the PRE_ROLL_MS offset from beat states:

```ts
// Old:
const initialStates: RhythmBeatState[] = beats.map((beat) => ({
  beat: { ...beat, startMs: beat.startMs + PRE_ROLL_MS },
  status: "upcoming" as BeatStatus,
}));

// New:
const initialStates: RhythmBeatState[] = beats.map((beat) => ({
  beat,
  status: "upcoming" as BeatStatus,
}));
```

Also initialize metronome tracking for the new `metronomeTicks` array. Add after beat state init:

```ts
metronomeTickPlayedRef.current = metronomeTicks.map(() => false);
```

(Add `const metronomeTickPlayedRef = useRef<boolean[]>([]);` near the other refs.)

- [ ] **Step 4: Remove all `PRE_ROLL_MS` from RAF loop**

In the RAF tick function, there are multiple `PRE_ROLL_MS` references to remove:

**Line ~195** — beat timing:
```ts
// Old:
const beatStartMs = beats[i].startMs + PRE_ROLL_MS;
// New:
const beatStartMs = beats[i].startMs;
```

**Lines ~224-225** — canvas sync:
```ts
// Old:
const states: RhythmBeatState[] = beats.map((beat, i) => ({
  beat: { ...beat, startMs: beat.startMs + PRE_ROLL_MS },
  status: beatStatesRef.current[i],
}));
// New:
const states: RhythmBeatState[] = beats.map((beat, i) => ({
  beat,
  status: beatStatesRef.current[i],
}));
```

**Line ~232** — completion check:
```ts
// Old:
if (elapsed >= totalDurationMs + PRE_ROLL_MS) {
// New:
if (elapsed >= totalDurationMs) {
```

**Lines ~252-253** — final canvas update:
```ts
// Old:
setBeatStates(beats.map((beat, i) => ({
  beat: { ...beat, startMs: beat.startMs + PRE_ROLL_MS },
  status: beatStatesRef.current[i],
})));
// New:
setBeatStates(beats.map((beat, i) => ({
  beat,
  status: beatStatesRef.current[i],
})));
```

- [ ] **Step 5: Remove `PRE_ROLL_MS` from progress calculation**

Line ~293:
```ts
// Old:
const progress = isPlaying
  ? Math.min(1, elapsedMs / (totalDurationMs + PRE_ROLL_MS))
  : showScoreModal ? 1 : 0;
// New:
const progress = isPlaying
  ? Math.min(1, elapsedMs / totalDurationMs)
  : showScoreModal ? 1 : 0;
```

- [ ] **Step 6: Switch metronome to use `metronomeTicks` array**

Replace the per-beat metronome logic in the RAF loop (lines ~199-202):

```ts
// Old (inside the beats loop):
if (metronome && !metronomePlayedRef.current[i] && elapsed >= beatStartMs) {
  metronomePlayedRef.current[i] = true;
  playClick();
}

// New (separate loop before the beats loop):
if (metronome) {
  for (let t = 0; t < metronomeTicks.length; t++) {
    if (!metronomeTickPlayedRef.current[t] && elapsed >= metronomeTicks[t]) {
      metronomeTickPlayedRef.current[t] = true;
      playClick();
    }
  }
}
```

Remove the old metronome logic from inside the beats loop. Also remove `metronomePlayedRef` (the old per-beat ref) since it's replaced by `metronomeTickPlayedRef`.

- [ ] **Step 7: Destructure `metronomeTicks` from resolved**

Where `beats`, `totalDurationMs`, etc. are destructured from `resolved`, also destructure `metronomeTicks`:

```ts
const { beats, metronomeTicks, totalDurationMs, metronome, minScore } = resolved;
```

- [ ] **Step 8: Verify build**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add src/components/Exercise/RhythmExercise.tsx
git commit -m "feat: rhythm exercise — remove PRE_ROLL_MS, fix scoring, metronome on pauses"
```

---

## Task 9: `toRoman()` utility and chapter roman numerals

**Files:**
- Create: `src/lib/format.ts`
- Modify: `src/components/Exercise/LearnExercise.tsx`
- Modify: `src/components/JourneyView/components/JourneyList.tsx:51`
- Modify: `src/components/JourneyView/components/JourneyExercise.tsx:176`

- [ ] **Step 1: Create `src/lib/format.ts`**

```ts
const ROMAN_NUMERALS: [number, string][] = [
  [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
];

/** Convert a positive integer to a roman numeral string. */
export function toRoman(n: number): string {
  let result = "";
  for (const [value, numeral] of ROMAN_NUMERALS) {
    while (n >= value) {
      result += numeral;
      n -= value;
    }
  }
  return result;
}
```

- [ ] **Step 2: Update `JourneyExercise.tsx` — pass roman numeral**

In `src/components/JourneyView/components/JourneyExercise.tsx`, line 176:

Add import:
```ts
import { toRoman } from "@/lib/format";
```

Change:
```ts
// Old:
partRoman={String(exercise.chapter)}
// New:
partRoman={toRoman(exercise.chapter)}
```

- [ ] **Step 3: Update `JourneyExercise.tsx` sub-nav — roman numeral**

In `src/components/JourneyView/components/JourneyExercise.tsx`, line 140:

```tsx
// Old:
Ch {exercise.chapter}
// New:
Ch {toRoman(exercise.chapter)}
```

(The `toRoman` import was already added in Step 2.)

- [ ] **Step 4: Update `LearnExercise.tsx` — Chapter/Ch headline**

In `src/components/Exercise/LearnExercise.tsx`, line 36:

```tsx
// Old:
Part {partRoman} — {partTitle}

// New:
<span className="hidden sm:inline">Chapter</span>
<span className="sm:hidden">Ch</span>
{" "}{partRoman} — {partTitle}
```

- [ ] **Step 5: Update `JourneyList.tsx` — roman numeral labels**

In `src/components/JourneyView/components/JourneyList.tsx`, line 51:

Add import:
```ts
import { toRoman } from "@/lib/format";
```

Change:
```tsx
// Old:
Chapter {chapter.chapter}
// New:
Chapter {toRoman(chapter.chapter)}
```

- [ ] **Step 6: Verify build**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 7: Visual check**

Run: `npm run dev`
- Journey list should show "Chapter I", "Chapter II"
- Exercise headline should show "Chapter I — Wake Up" on desktop, "Ch I — Wake Up" on mobile
- Sub-nav should show "Ch I" with roman numeral

- [ ] **Step 8: Commit**

```bash
git add src/lib/format.ts src/components/Exercise/LearnExercise.tsx src/components/JourneyView/components/JourneyList.tsx src/components/JourneyView/components/JourneyExercise.tsx
git commit -m "feat: chapter roman numerals throughout UI"
```

---

## Task 10: Final build and smoke test

- [ ] **Step 1: Full build**

Run: `npm run build`
Expected: PASS with no errors

- [ ] **Step 2: Smoke test**

Run: `npm run dev`

Verify:
- Low Uu exercise renders HillBallCanvas with ball rolling downhill
- Hoo Hoo exercise renders HillBallCanvas with ball rolling uphill
- Start button is a floating blurred container (not full-screen overlay)
- Instruction text visible behind start button
- Rhythm "Feel the Beat" has 4-beat intro with metronome, longer pattern
- Major Second exercise uses interval pattern (chord → pause → sing)
- Lip roll instruction mentions "fill the bar" and "take breaths"
- Sss-Zzz-Sss instruction mentions "take breaths"
- Chapter labels show roman numerals
- Intro modals still work as before

- [ ] **Step 3: Commit any fixes**

If any adjustments are needed, commit them.
