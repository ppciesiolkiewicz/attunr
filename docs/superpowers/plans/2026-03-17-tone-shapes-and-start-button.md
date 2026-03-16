# Tone Shapes & Exercise Start Button Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add wobble/owl-hoot tone shapes, a central Start button overlay, and Restart button to pitch-detection and melody exercises.

**Architecture:** Config-driven `toneShape` on pitch-detection exercises flows through resolution to the UI. A shared `ExerciseStartOverlay` component gates exercise start for both pitch-detection and melody. `useTonePlayer` gets two new synthesis methods (`playWobble`, `playOwlHoot`). The `onPlayTone`/`onPlaySlide` prop chain through AppContext is replaced by exercises calling `useTonePlayer` directly.

**Tech Stack:** React, Web Audio API, TypeScript, Vitest, Tailwind CSS

**Spec:** `docs/superpowers/specs/2026-03-17-tone-shapes-and-start-button-design.md`

---

## Chunk 1: Tone Shapes (useTonePlayer + types + resolution)

### Task 1: Add `toneShape` type to exercise config

**Files:**
- Modify: `src/constants/journey/types.ts` — add `ToneShapeConfig` type and `toneShape?` field to `PitchDetectionExercise`

- [ ] **Step 1: Add `ToneShapeConfig` type and field**

In `src/constants/journey/types.ts`, add the type above `PitchDetectionExercise`:

```ts
/** Shape of the reference tone played before a pitch-detection exercise. */
export type ToneShapeConfig =
  | { kind: "sustain" }
  | { kind: "wobble" }
  | { kind: "owl-hoot" };
```

Then add to the `PitchDetectionExercise` interface, after the `notes` field:

```ts
  /** Reference tone shape. Defaults to "sustain" (flat sine). */
  toneShape?: ToneShapeConfig;
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: no errors (field is optional, nothing uses it yet)

- [ ] **Step 3: Commit**

```bash
git add src/constants/journey/types.ts
git commit -m "feat: add ToneShapeConfig type to pitch-detection exercises"
```

---

### Task 2: Pass `toneShape` through resolution

**Files:**
- Modify: `src/lib/resolve-exercise.ts` — add `toneShape` to `ResolvedPitchDetection`
- Modify: `src/lib/resolve-exercise.test.ts` — test the passthrough

- [ ] **Step 1: Write the failing test**

Add to `src/lib/resolve-exercise.test.ts` inside the `resolveExercise — pitch-detection` describe block:

```ts
  it("passes toneShape through to resolved output", () => {
    const ex: PitchDetectionExercise = {
      ...base,
      exerciseTypeId: "pitch-detection",
      scale: { type: "chromatic", root: 1 },
      notes: [{ target: { kind: BandTargetKind.Index, i: 3 }, seconds: 4 }],
      toneShape: { kind: "wobble" },
    };
    const result = resolveExercise(ex, testVocalRange) as ResolvedPitchDetection;
    expect(result.toneShape).toEqual({ kind: "wobble" });
  });

  it("defaults toneShape to sustain when omitted", () => {
    const result = resolveExercise(exercise, testVocalRange) as ResolvedPitchDetection;
    expect(result.toneShape).toEqual({ kind: "sustain" });
  });
```

Add `ToneShapeConfig` to the imports from `@/constants/journey/types` if not already there.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/resolve-exercise.test.ts`
Expected: 2 FAIL — `toneShape` is `undefined`

- [ ] **Step 3: Add `toneShape` to `ResolvedPitchDetection` and resolution**

In `src/lib/resolve-exercise.ts`:

1. Import `ToneShapeConfig` from types:
```ts
import type {
  // ...existing imports...
  ToneShapeConfig,
} from "@/constants/journey/types";
```

2. Add to `ResolvedPitchDetection` interface:
```ts
export interface ResolvedPitchDetection extends ResolvedExerciseBase {
  exerciseTypeId: "pitch-detection";
  targets: ResolvedPitchTarget[];
  toneShape: ToneShapeConfig;
}
```

3. In `resolvePitchDetection()`, add `toneShape` to the return object (before the closing `}`):
```ts
  return {
    exerciseTypeId: "pitch-detection",
    targets,
    displayNotes,
    highlightIds,
    toneShape: exercise.toneShape ?? { kind: "sustain" },
  };
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/resolve-exercise.test.ts`
Expected: all PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/resolve-exercise.ts src/lib/resolve-exercise.test.ts
git commit -m "feat: pass toneShape through exercise resolution"
```

---

### Task 3: Add `playWobble` to `useTonePlayer`

**Files:**
- Modify: `src/hooks/useTonePlayer.ts` — add `playWobble` method

- [ ] **Step 1: Add `playWobble` method**

In `src/hooks/useTonePlayer.ts`, add this method after `playSlide` and before the `return` statement:

```ts
  /**
   * Play a wobbling tone — pitch oscillates ±20% around frequencyHz with ~800ms period.
   * Used for Low U (chest voice) exercises.
   */
  const playWobble = useCallback(
    (
      frequencyHz: number,
      options?: { binaural?: boolean; durationMs?: number }
    ) => {
      const ctx = getCtx();
      const {
        binaural = true,
        durationMs = 2500,
      } = options ?? {};

      const now = ctx.currentTime;
      const dur = durationMs / 1000;
      const lfoFreq = 1.25; // ~800ms period
      const lfoDepth = frequencyHz * 0.20; // ±20%

      // Master gain envelope
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, now);
      masterGain.gain.linearRampToValueAtTime(GAIN, now + FADE_IN_S);
      masterGain.gain.setValueAtTime(GAIN, now + dur - FADE_OUT_S);
      masterGain.gain.linearRampToValueAtTime(0, now + dur);
      masterGain.connect(ctx.destination);

      // LFO for pitch modulation
      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = lfoFreq;

      const lfoGain = ctx.createGain();
      lfoGain.gain.value = lfoDepth;
      lfo.connect(lfoGain);

      if (binaural) {
        const merger = ctx.createChannelMerger(2);
        merger.connect(masterGain);

        const oscL = ctx.createOscillator();
        oscL.type = "sine";
        oscL.frequency.value = frequencyHz;
        lfoGain.connect(oscL.frequency);
        const gL = ctx.createGain();
        gL.gain.value = 1;
        oscL.connect(gL);
        gL.connect(merger, 0, 0);

        const oscR = ctx.createOscillator();
        oscR.type = "sine";
        oscR.frequency.value = frequencyHz + BINAURAL_BEAT_HZ;
        // Second LFO gain for right channel (same LFO source)
        const lfoGainR = ctx.createGain();
        lfoGainR.gain.value = lfoDepth;
        lfo.connect(lfoGainR);
        lfoGainR.connect(oscR.frequency);
        const gR = ctx.createGain();
        gR.gain.value = 1;
        oscR.connect(gR);
        gR.connect(merger, 0, 1);

        oscL.start(now); oscL.stop(now + dur);
        oscR.start(now); oscR.stop(now + dur);
      } else {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = frequencyHz;
        lfoGain.connect(osc.frequency);
        osc.connect(masterGain);
        osc.start(now);
        osc.stop(now + dur);
      }

      lfo.start(now);
      lfo.stop(now + dur);
    },
    [getCtx]
  );
```

- [ ] **Step 2: Add to return statement**

Change the return to:
```ts
  return { playTone, playSlide, playWobble, getCtx };
```

- [ ] **Step 3: Verify build**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useTonePlayer.ts
git commit -m "feat: add playWobble method to useTonePlayer"
```

---

### Task 4: Add `playOwlHoot` to `useTonePlayer`

**Files:**
- Modify: `src/hooks/useTonePlayer.ts` — add `playOwlHoot` method

- [ ] **Step 1: Add `playOwlHoot` method**

In `src/hooks/useTonePlayer.ts`, add after `playWobble` and before the `return`:

```ts
  /**
   * Play two short owl-like hoots — each starts ~30% above target and swoops down.
   * Used for Hoo Hoo (head voice) exercises.
   */
  const playOwlHoot = useCallback(
    (
      frequencyHz: number,
      options?: { binaural?: boolean }
    ) => {
      const ctx = getCtx();
      const { binaural = true } = options ?? {};

      const hootDur = 0.4;     // each hoot duration
      const gap = 0.2;         // gap between hoots
      const startHz = frequencyHz * 1.3; // 30% above target
      const swoopTime = 0.15;  // fast swoop down

      function scheduleHoot(startTime: number) {
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(GAIN, startTime + FADE_IN_S);
        gain.gain.setValueAtTime(GAIN, startTime + hootDur - FADE_OUT_S);
        gain.gain.linearRampToValueAtTime(0, startTime + hootDur);
        gain.connect(ctx.destination);

        function makeOsc(freq: number, endFreq: number): OscillatorNode {
          const osc = ctx.createOscillator();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, startTime);
          osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + swoopTime);
          return osc;
        }

        if (binaural) {
          const merger = ctx.createChannelMerger(2);
          merger.connect(gain);

          const oscL = makeOsc(startHz, frequencyHz);
          const gL = ctx.createGain();
          gL.gain.value = 1;
          oscL.connect(gL);
          gL.connect(merger, 0, 0);

          const oscR = makeOsc(startHz + BINAURAL_BEAT_HZ, frequencyHz + BINAURAL_BEAT_HZ);
          const gR = ctx.createGain();
          gR.gain.value = 1;
          oscR.connect(gR);
          gR.connect(merger, 0, 1);

          oscL.start(startTime); oscL.stop(startTime + hootDur);
          oscR.start(startTime); oscR.stop(startTime + hootDur);
        } else {
          const osc = makeOsc(startHz, frequencyHz);
          osc.connect(gain);
          osc.start(startTime);
          osc.stop(startTime + hootDur);
        }
      }

      const now = ctx.currentTime;
      scheduleHoot(now);
      scheduleHoot(now + hootDur + gap);
    },
    [getCtx]
  );
```

- [ ] **Step 2: Add to return statement**

Change the return to:
```ts
  return { playTone, playSlide, playWobble, playOwlHoot, getCtx };
```

- [ ] **Step 3: Verify build**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useTonePlayer.ts
git commit -m "feat: add playOwlHoot method to useTonePlayer"
```

---

### Task 5: Update exercise configs (Part 2 + Part 3)

**Files:**
- Modify: `src/constants/journey/part2.ts` — add toneShape, adjust ranges
- Modify: `src/constants/journey/part3.ts` — same for Low U

- [ ] **Step 1: Update Part 2 Low U**

In `src/constants/journey/part2.ts`, find the Low U exercise (title: "Low U") and change:

```ts
    notes: [{ target: { kind: BandTargetKind.Range, from: 1, to: 3, accept: "below" }, seconds: 5 }],
```
to:
```ts
    notes: [{ target: { kind: BandTargetKind.Range, from: 3, to: 5, accept: "below" }, seconds: 5 }],
    toneShape: { kind: "wobble" },
```

- [ ] **Step 2: Update Part 2 Hoo Hoo**

In `src/constants/journey/part2.ts`, find the Hoo hoo exercise (title: "Hoo hoo") and change:

```ts
    notes: [{ target: { kind: BandTargetKind.Range, from: -3, to: -1, accept: "above" }, seconds: 5 }],
```
to:
```ts
    notes: [{ target: { kind: BandTargetKind.Range, from: -5, to: -3, accept: "above" }, seconds: 5 }],
    toneShape: { kind: "owl-hoot" },
```

- [ ] **Step 3: Update Part 3 Low U**

In `src/constants/journey/part3.ts`, find the Low U exercise (title: "Low U") and change:

```ts
    notes: [{ target: { kind: BandTargetKind.Range, from: 1, to: 3, accept: "below" }, seconds: 5 }],
```
to:
```ts
    notes: [{ target: { kind: BandTargetKind.Range, from: 3, to: 5, accept: "below" }, seconds: 5 }],
    toneShape: { kind: "wobble" },
```

- [ ] **Step 4: Verify build**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add src/constants/journey/part2.ts src/constants/journey/part3.ts
git commit -m "feat: add tone shapes and adjust ranges for Low U and Hoo Hoo"
```

---

## Chunk 2: ExerciseStartOverlay + Restart button

### Task 6: Create `ExerciseStartOverlay` component

**Files:**
- Create: `src/components/Exercise/ExerciseStartOverlay.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/Exercise/ExerciseStartOverlay.tsx`:

```tsx
"use client";

import { Button } from "@ui";

interface ExerciseStartOverlayProps {
  onStart: () => void;
}

export function ExerciseStartOverlay({ onStart }: ExerciseStartOverlayProps) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-2xl transition-opacity duration-300">
      <Button
        size="lg"
        className="px-10"
        onClick={onStart}
      >
        Start
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/Exercise/ExerciseStartOverlay.tsx
git commit -m "feat: add ExerciseStartOverlay component"
```

---

### Task 7: Wire ExerciseStartOverlay into PitchExercise

**Files:**
- Modify: `src/components/Exercise/PitchExercise/PitchExercise.tsx` — add overlay, replace "Play tone" with "Restart"

This task modifies PitchExercise to:
1. Show `ExerciseStartOverlay` before the exercise begins
2. On "Start": dismiss overlay, wait 500ms, play reference tone (using toneShape), begin detection
3. Replace "Play tone" button with "Restart" button that resets hold timer + replays tone
4. Call `useTonePlayer` directly instead of `onPlayTone` prop

- [ ] **Step 1: Add imports and state**

Add imports at top of `PitchExercise.tsx`:

```ts
import { ExerciseStartOverlay } from "../ExerciseStartOverlay";
import { useTonePlayer } from "@/hooks/useTonePlayer";
import type { ToneShapeConfig } from "@/constants/journey/types";
```

Add new state variable alongside existing state:

```ts
const [hasStarted, setHasStarted] = useState(false);
```

Reset `hasStarted` when navigating between exercises:

```ts
useEffect(() => { setHasStarted(false); }, [exerciseId]);
```

- [ ] **Step 2: Add tone playback helper**

Add a helper function that plays the right tone based on `toneShape`. Place it after the existing `handleHearTone`:

```ts
  const { playTone: playToneRaw, playWobble, playOwlHoot } = useTonePlayer();

  const toneShape: ToneShapeConfig = useMemo(
    () => resolved.exerciseTypeId === "pitch-detection"
      ? resolved.toneShape
      : { kind: "sustain" },
    [resolved]
  );

  const { playSlide: playSlideRaw } = useTonePlayer();

  const playReferenceTone = useCallback(() => {
    if (resolved.exerciseTypeId === "pitch-detection-slide") {
      // Slides play the slide as reference tone
      playSlideRaw(resolved.from.frequencyHz, resolved.to.frequencyHz, { binaural: true });
      return;
    }
    const note = resolved.targets[0]?.note;
    if (!note) return;

    switch (toneShape.kind) {
      case "wobble":
        playWobble(note.frequencyHz);
        break;
      case "owl-hoot":
        playOwlHoot(note.frequencyHz);
        break;
      default:
        playToneRaw(note.frequencyHz, { binaural: true });
    }
  }, [resolved, toneShape, playToneRaw, playSlideRaw, playWobble, playOwlHoot]);
```

- [ ] **Step 3: Add start handler**

```ts
  const handleStart = useCallback(() => {
    setHasStarted(true);
    setTimeout(() => {
      playReferenceTone();
    }, 500);
  }, [playReferenceTone]);
```

- [ ] **Step 4: Add restart handler**

Add a restart handler that resets progress and replays the tone. This uses `resetProgress` from `usePitchProgress`:

```ts
  const handleRestart = useCallback(() => {
    resetProgress();
    playReferenceTone();
  }, [resetProgress, playReferenceTone]);
```

Note: `resetProgress` must be available from `usePitchProgress`. Check if it's already exported — the explore report showed it in the return type. If not, it needs to be added (see step 5).

- [ ] **Step 5: Ensure `resetProgress` is available from `usePitchProgress`**

Check `src/components/Exercise/PitchExercise/usePitchProgress.ts` — the hook already returns `resetProgress` in its output. If it does, this step is done. If not, add a `resetProgress` function that resets `holdRef.current = 0`, `seqIndexRef`, and `stageComplete` state, and include it in the return.

- [ ] **Step 6: Add overlay to JSX**

In the JSX, wrap the canvas area in a `relative` container (if not already) and add the overlay conditionally:

```tsx
{!hasStarted && <ExerciseStartOverlay onStart={handleStart} />}
```

Place this inside the canvas container `div`, as a sibling of the canvas component.

- [ ] **Step 7: Replace "Play tone" button with "Restart"**

Find the existing "Play tone" button (the `handleHearTone` button) and replace it with:

```tsx
{hasStarted && !stageComplete && (
  <Button
    variant="outline"
    size="sm"
    onClick={handleRestart}
  >
    Restart
  </Button>
)}
```

Remove the old `handleHearTone` function and `isTonePlaying` state if no longer used. Remove the `onPlayTone` prop usage (it's now called directly via `useTonePlayer`).

- [ ] **Step 8: Guard pitch detection until started**

In `usePitchProgress`, the RAF loop must not accumulate hold time before "Start" is pressed. The mic is already active (AppShell starts it on mount), so the user's ambient sound would fill the hold timer.

1. Add `hasStarted: boolean` to `UsePitchProgressOptions` interface.
2. At the top of the `tick()` function in the RAF loop, add: `if (!hasStarted) { rafRef.current = requestAnimationFrame(tick); return; }`
3. Pass `hasStarted` from PitchExercise into the `usePitchProgress` call.

Also add `usePitchProgress.ts` to the commit in Step 11.

- [ ] **Step 9: Verify build**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 10: Manual test**

Run: `npm run dev`
Navigate to a Low U or Hoo Hoo exercise. Verify:
- Start overlay appears centered over canvas
- Tapping "Start" dismisses overlay, tone plays after ~500ms
- Low U plays wobbling tone, Hoo Hoo plays owl hoot
- "Restart" button appears in bottom panel
- Tapping "Restart" resets progress and replays tone

- [ ] **Step 11: Commit**

```bash
git add src/components/Exercise/PitchExercise/PitchExercise.tsx
git commit -m "feat: wire start overlay and restart button into PitchExercise"
```

---

### Task 8: Wire ExerciseStartOverlay into MelodyExercise

**Files:**
- Modify: `src/components/Exercise/MelodyExercise.tsx` — replace bottom-panel Start with overlay, add Restart

- [ ] **Step 1: Add imports and state**

Add import:
```ts
import { ExerciseStartOverlay } from "./ExerciseStartOverlay";
```

The existing `isPlaying` state and `handleStart`/`handleRetry` functions already handle the lifecycle. Add:

```ts
const [hasStarted, setHasStarted] = useState(false);
```

Add to the existing `exerciseId` reset effect (around line 72-84): `setHasStarted(false);`

- [ ] **Step 2: Create overlay start handler**

```ts
  const handleOverlayStart = useCallback(() => {
    setHasStarted(true);
    setTimeout(() => {
      handleStart();
    }, 500);
  }, [handleStart]);
```

- [ ] **Step 3: Add overlay to JSX**

Add the overlay as a sibling of the canvas inside the relative container:

```tsx
{!hasStarted && <ExerciseStartOverlay onStart={handleOverlayStart} />}
```

- [ ] **Step 4: Replace bottom-panel Start with Restart**

Find the existing bottom-panel Start button and replace with:

```tsx
{hasStarted && !showScoreModal && (
  <Button
    variant="outline"
    size="sm"
    onClick={() => {
      handleRetry();
      // handleRetry already resets and restarts
    }}
  >
    Restart
  </Button>
)}
```

Fully remove the existing bottom-panel Start button block (the `!isPlaying && !showScoreModal` conditional, around lines 273-281). Do not leave remnants — the overlay replaces it entirely.

- [ ] **Step 5: Verify build**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 6: Manual test**

Run: `npm run dev`
Navigate to a melody exercise (Perfect Fifth in Part 2). Verify:
- Start overlay appears
- Tapping "Start" dismisses overlay, melody begins after ~500ms
- "Restart" button visible during playback
- "Restart" resets and replays from beginning

- [ ] **Step 7: Commit**

```bash
git add src/components/Exercise/MelodyExercise.tsx
git commit -m "feat: wire start overlay and restart button into MelodyExercise"
```

---

### Task 9: Clean up onPlayTone prop from PitchExercise

**Files:**
- Modify: `src/components/Exercise/PitchExercise/PitchExercise.tsx` — remove `onPlayTone` and `onPlaySlide` from props
- Modify: `src/components/Exercise/BaseExercise.tsx` — stop passing `onPlayTone`/`onPlaySlide` to PitchExercise

**Note:** `ToneFollowExercise` still uses `onPlayTone`/`onPlaySlide` via AppContext, so `AppContext.tsx`, `AppShell.tsx`, and the rest of the prop chain must remain unchanged. This task only removes the props from PitchExercise.

- [ ] **Step 1: Remove from PitchExercise props**

Remove `onPlayTone` and `onPlaySlide` from `PitchExerciseProps` interface. Remove any remaining usage of these props in the component (they're now replaced by direct `useTonePlayer` calls).

- [ ] **Step 2: Update BaseExercise**

Stop passing `onPlayTone`/`onPlaySlide` to `<PitchExercise>`. Keep passing them to `<ToneFollowExercise>`.

- [ ] **Step 4: Verify build**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 5: Manual test**

Quick smoke test — exercises should still work without the removed props.

- [ ] **Step 6: Commit**

```bash
git add src/components/Exercise/PitchExercise/PitchExercise.tsx src/components/Exercise/BaseExercise.tsx
git commit -m "refactor: remove onPlayTone prop from PitchExercise (now uses useTonePlayer directly)"
```

---

### Task 10: Final verification

- [ ] **Step 1: Run full test suite**

Run: `npx vitest run`
Expected: all tests pass

- [ ] **Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Run linter**

Run: `npx next lint`
Expected: no errors

- [ ] **Step 4: Full manual smoke test**

Run: `npm run dev`
Test all exercise types to verify nothing is broken:
- Low U (Part 2) — wobble tone, start overlay, restart
- Hoo Hoo (Part 2) — owl hoot, start overlay, restart
- Low U (Part 3) — wobble tone
- Perfect Fifth melody — start overlay, restart
- Lip rolls tone-follow — unchanged, still works
- Farinelli breathwork — unchanged
- Regular pitch-detection (non-range) — sustain tone, start overlay, restart
