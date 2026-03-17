# Tone Shapes & Start Button Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add shaped reference tones (wobble, owl-hoot) to pitch-detection exercises, introduce a shared Start overlay for pitch-detection and melody exercises, and replace "Play tone" with "Restart".

**Architecture:** Config-driven tone shapes on `PitchDetectionExercise` flow through `resolve-exercise.ts` to the UI. A new `ExerciseStartOverlay` component gates exercise start for both pitch-detection and melody. `useTonePlayer` gains two new audio methods. The `onPlayTone` prop chain through AppShell is replaced by direct `useTonePlayer` usage in exercise components.

**Tech Stack:** React, Next.js App Router, Web Audio API, TypeScript

---

## Chunk 1: Audio & Config Layer

### Task 1: Add `playWobble` and `playOwlHoot` to `useTonePlayer`

**Files:**
- Modify: `src/hooks/useTonePlayer.ts`

- [ ] **Step 1: Add `playWobble` method**

Add after the existing `playSlide` method (after line 167). This creates a sine oscillator with an LFO modulating pitch ±20% at ~1.25 Hz (800ms period), duration ~2500ms:

```ts
/**
 * Play a slow wobble tone — pitch oscillates ±20% around the target
 * with an ~800ms period. Used for Low U (chest voice) exercises.
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

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(GAIN, now + FADE_IN_S);
    masterGain.gain.setValueAtTime(GAIN, now + dur - FADE_OUT_S);
    masterGain.gain.linearRampToValueAtTime(0, now + dur);
    masterGain.connect(ctx.destination);

    // LFO: ±20% pitch at 1.25 Hz (800ms period)
    const lfoDepth = frequencyHz * 0.2;

    function createWobbleOsc(baseHz: number): OscillatorNode {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = baseHz;

      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = 1.25;

      const lfoGain = ctx.createGain();
      lfoGain.gain.value = lfoDepth;

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      lfo.start(now);
      lfo.stop(now + dur);

      return osc;
    }

    if (binaural) {
      const merger = ctx.createChannelMerger(2);
      merger.connect(masterGain);

      const oscL = createWobbleOsc(frequencyHz);
      const gL = ctx.createGain();
      gL.gain.value = 1;
      oscL.connect(gL);
      gL.connect(merger, 0, 0);

      const oscR = createWobbleOsc(frequencyHz + BINAURAL_BEAT_HZ);
      const gR = ctx.createGain();
      gR.gain.value = 1;
      oscR.connect(gR);
      gR.connect(merger, 0, 1);

      oscL.start(now); oscL.stop(now + dur);
      oscR.start(now); oscR.stop(now + dur);
    } else {
      const osc = createWobbleOsc(frequencyHz);
      osc.connect(masterGain);
      osc.start(now);
      osc.stop(now + dur);
    }
  },
  [getCtx]
);
```

- [ ] **Step 2: Add `playOwlHoot` method**

Add after `playWobble`. Two sequential hoots — each starts ~30% above target, swoops down, short hold, fade out (~400ms per hoot), 200ms gap:

```ts
/**
 * Play two owl-like hoots — each swoops from ~30% above target down
 * to the target frequency. Used for Hoo Hoo (head voice) exercises.
 */
const playOwlHoot = useCallback(
  (
    frequencyHz: number,
    options?: { binaural?: boolean }
  ) => {
    const ctx = getCtx();
    const { binaural = true } = options ?? {};

    const hootDur = 0.4;   // seconds per hoot
    const gap = 0.2;        // seconds between hoots
    const startHz = frequencyHz * 1.3; // 30% above target

    function scheduleHoot(startTime: number) {
      const hootGain = ctx.createGain();
      hootGain.gain.setValueAtTime(0, startTime);
      hootGain.gain.linearRampToValueAtTime(GAIN, startTime + FADE_IN_S);
      hootGain.gain.setValueAtTime(GAIN, startTime + hootDur - FADE_OUT_S);
      hootGain.gain.linearRampToValueAtTime(0, startTime + hootDur);
      hootGain.connect(ctx.destination);

      function createHootOsc(baseStartHz: number, baseEndHz: number): OscillatorNode {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(baseStartHz, startTime);
        // Quick swoop down in first 60% of hoot, then hold
        osc.frequency.exponentialRampToValueAtTime(baseEndHz, startTime + hootDur * 0.6);
        return osc;
      }

      if (binaural) {
        const merger = ctx.createChannelMerger(2);
        merger.connect(hootGain);

        const oscL = createHootOsc(startHz, frequencyHz);
        const gL = ctx.createGain();
        gL.gain.value = 1;
        oscL.connect(gL);
        gL.connect(merger, 0, 0);

        const oscR = createHootOsc(startHz + BINAURAL_BEAT_HZ, frequencyHz + BINAURAL_BEAT_HZ);
        const gR = ctx.createGain();
        gR.gain.value = 1;
        oscR.connect(gR);
        gR.connect(merger, 0, 1);

        oscL.start(startTime); oscL.stop(startTime + hootDur);
        oscR.start(startTime); oscR.stop(startTime + hootDur);
      } else {
        const osc = createHootOsc(startHz, frequencyHz);
        osc.connect(hootGain);
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

- [ ] **Step 3: Update the return statement**

Change line 169 from:
```ts
return { playTone, playSlide, getCtx };
```
to:
```ts
return { playTone, playSlide, playWobble, playOwlHoot, getCtx };
```

- [ ] **Step 4: Verify it compiles**

Run: `npx tsc --noEmit 2>&1 | grep -v "generator.test\|resolve-exercise.test"`
Expected: no new errors

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useTonePlayer.ts
git commit -m "feat: add playWobble and playOwlHoot to useTonePlayer"
```

---

### Task 2: Add `toneShape` type to exercise config and resolution

**Files:**
- Modify: `src/constants/journey/types.ts` (line 138-144, `PitchDetectionExercise`)
- Modify: `src/lib/resolve-exercise.ts` (lines 20-25, `ResolvedPitchTarget` and `ResolvedPitchDetection`)

- [ ] **Step 1: Add `ToneShape` type and `toneShape` field to `PitchDetectionExercise`**

In `src/constants/journey/types.ts`, add the type before `PitchDetectionExercise` (around line 137):

```ts
/** Shape of the reference tone played before a pitch-detection exercise. */
export type ToneShape =
  | { kind: "sustain" }
  | { kind: "wobble" }
  | { kind: "owl-hoot" };
```

Then add `toneShape?` to `PitchDetectionExercise` (after line 142, after `scale`):

```ts
export interface PitchDetectionExercise extends BaseExerciseConfig {
  exerciseTypeId: "pitch-detection";
  scale: BaseScale;
  /** Shape of the reference tone. Defaults to sustain (flat sine). */
  toneShape?: ToneShape;
  /** One note = single-tone hold; multiple = sing in sequence. */
  notes: SustainNoteConfig[];
  instruction: string;
}
```

- [ ] **Step 2: Add `toneShape` to `ResolvedPitchDetection`**

In `src/lib/resolve-exercise.ts`, import `ToneShape`:

```ts
import type { ToneShape } from "@/constants/journey/types";
```

Add to `ResolvedPitchDetection` interface (after line 29):

```ts
export interface ResolvedPitchDetection extends ResolvedExerciseBase {
  exerciseTypeId: "pitch-detection";
  targets: ResolvedPitchTarget[];
  toneShape: ToneShape;
}
```

- [ ] **Step 3: Pass `toneShape` through in `resolvePitchDetection`**

In `resolvePitchDetection` function (line 132), update the return to include `toneShape`:

```ts
return {
  exerciseTypeId: "pitch-detection",
  targets,
  displayNotes,
  highlightIds,
  toneShape: exercise.toneShape ?? { kind: "sustain" },
};
```

- [ ] **Step 4: Verify it compiles**

Run: `npx tsc --noEmit 2>&1 | grep -v "generator.test\|resolve-exercise.test"`
Expected: no new errors

- [ ] **Step 5: Commit**

```bash
git add src/constants/journey/types.ts src/lib/resolve-exercise.ts
git commit -m "feat: add toneShape type to exercise config and resolution"
```

---

### Task 3: Update exercise configs (part2, part3)

**Files:**
- Modify: `src/constants/journey/part2.ts` (lines 17-33)
- Modify: `src/constants/journey/part3.ts` (lines 37-46)

- [ ] **Step 1: Update Part 2 Low U exercise**

In `src/constants/journey/part2.ts`, update the Low U exercise (lines 17-26):

Change:
```ts
notes: [{ target: { kind: BandTargetKind.Range, from: 1, to: 3, accept: "below" }, seconds: 5 }],
```
to:
```ts
toneShape: { kind: "wobble" },
notes: [{ target: { kind: BandTargetKind.Range, from: 3, to: 5, accept: "below" }, seconds: 5 }],
```

- [ ] **Step 2: Update Part 2 Hoo Hoo exercise**

In `src/constants/journey/part2.ts`, update the Hoo Hoo exercise (lines 27-35):

Change:
```ts
notes: [{ target: { kind: BandTargetKind.Range, from: -3, to: -1, accept: "above" }, seconds: 5 }],
```
to:
```ts
toneShape: { kind: "owl-hoot" },
notes: [{ target: { kind: BandTargetKind.Range, from: -5, to: -3, accept: "above" }, seconds: 5 }],
```

- [ ] **Step 3: Update Part 3 Low U exercise**

In `src/constants/journey/part3.ts`, update the Low U exercise (around line 43):

Change the range from `from: 1, to: 3` to `from: 3, to: 5`, and add `toneShape: { kind: "wobble" }`.

- [ ] **Step 4: Verify it compiles**

Run: `npx tsc --noEmit 2>&1 | grep -v "generator.test\|resolve-exercise.test"`
Expected: no new errors

- [ ] **Step 5: Commit**

```bash
git add src/constants/journey/part2.ts src/constants/journey/part3.ts
git commit -m "feat: add tone shapes and adjust target ranges for Low U and Hoo Hoo"
```

---

## Chunk 2: Start Overlay & Exercise Integration

### Task 4: Create `ExerciseStartOverlay` component

**Files:**
- Create: `src/components/Exercise/ExerciseStartOverlay.tsx`

**Context:** This is a centered overlay shown on top of the exercise canvas before the user starts. It has a prominent "Start" button. When tapped, it fades out and triggers the `onStart` callback. The overlay dims the content behind it with a semi-transparent background.

Existing atoms to use: `Button` from `@ui` (variant `primary`, size `lg`). Import via `import { Button } from "@ui";`.

- [ ] **Step 1: Create the component**

The overlay manages its own fade state. The parent keeps it mounted until `onStart` fires (after the fade completes), then unmounts it. This ensures the CSS opacity transition actually runs before DOM removal.

```tsx
"use client";

import { useState, useCallback } from "react";
import { Button } from "@ui";

interface ExerciseStartOverlayProps {
  /** Called after the overlay has fully faded out (~300ms). */
  onStart: () => void;
}

export function ExerciseStartOverlay({ onStart }: ExerciseStartOverlayProps) {
  const [fading, setFading] = useState(false);

  const handleStart = useCallback(() => {
    setFading(true);
    // Wait for CSS fade-out to complete, then notify parent
    setTimeout(() => {
      onStart();
    }, 300);
  }, [onStart]);

  return (
    <div
      className={`absolute inset-0 z-20 flex items-center justify-center bg-black/40 transition-opacity duration-300 ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <Button variant="primary" size="lg" onClick={handleStart}>
        Start
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit 2>&1 | grep -v "generator.test\|resolve-exercise.test"`
Expected: no new errors

- [ ] **Step 3: Commit**

```bash
git add src/components/Exercise/ExerciseStartOverlay.tsx
git commit -m "feat: add ExerciseStartOverlay component"
```

---

### Task 5: Integrate overlay and tone shapes into PitchExercise

**Files:**
- Modify: `src/components/Exercise/PitchExercise/PitchExercise.tsx`

**Context:**
- Current "Play tone" button is at lines 334-358 with `handleHearTone` at lines 97-110
- `onPlayTone` prop comes from AppShell via BaseExercise
- `isRangeTarget` logic at lines 55-58
- Canvas container needs `relative` positioning for the overlay
- The exercise should NOT start pitch detection until user taps Start
- After Start, the tone plays (shaped per `toneShape`) and detection begins
- "Restart" replaces "Play tone" — resets hold timer and replays tone

Key changes:
1. Add `useState` for `hasStarted` (gates pitch detection and shows/hides overlay)
2. Import and use `useTonePlayer` directly instead of `onPlayTone` prop
3. Read `toneShape` from resolved exercise to pick the right player method
4. Replace "Play tone" button text with "Restart" and add reset logic
5. Wrap canvas in `relative` container and conditionally render `ExerciseStartOverlay`
6. On Start: set `hasStarted`, wait 500ms, play tone, begin detection

- [ ] **Step 1: Add imports and state**

Add imports at top:
```ts
import { ExerciseStartOverlay } from "../ExerciseStartOverlay";
import { useTonePlayer } from "@/hooks/useTonePlayer";
```

Add state inside the component:
```ts
const [hasStarted, setHasStarted] = useState(false);
const { playTone: playRawTone, playWobble, playOwlHoot } = useTonePlayer();
```

- [ ] **Step 2: Create a `playReferenceTone` helper**

This picks the right player method based on `toneShape`:

```ts
const toneShape = resolved.exerciseTypeId === "pitch-detection" ? resolved.toneShape : { kind: "sustain" as const };

const playReferenceTone = useCallback(() => {
  const freq = toneNotes[0]?.frequencyHz;
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
}, [toneShape, toneNotes, playWobble, playOwlHoot, playRawTone]);
```

- [ ] **Step 3: Add Start handler with detection timing**

The overlay's `onStart` fires after the 300ms fade. Then we wait 500ms for UX pacing, play the tone, and enable detection simultaneously — so the hold timer starts when the user hears the reference tone (per spec).

Use two state flags: `hasStarted` (controls overlay visibility) and `detectionActive` (gates pitch detection):

```ts
const [detectionActive, setDetectionActive] = useState(false);

const handleExerciseStart = useCallback(() => {
  setHasStarted(true); // overlay already faded, now remove it from DOM
  setTimeout(() => {
    playReferenceTone();
    setDetectionActive(true); // start detection simultaneously with tone
  }, 500);
}, [playReferenceTone]);
```

- [ ] **Step 4: Add Restart handler**

Replace `handleHearTone` with a restart handler that resets progress and replays tone. Look at `usePitchProgress.ts` — it already exposes a `resetProgress` function. Call it to reset the hold timer:

```ts
const handleRestart = useCallback(() => {
  resetProgress(); // from usePitchProgress — resets holdRef to 0, stageComplete to false
  playReferenceTone();
}, [resetProgress, playReferenceTone]);
```

- [ ] **Step 5: Gate pitch detection on `detectionActive`**

The pitch detection / hold timer should only run when `detectionActive` is true (not `hasStarted`, which triggers 500ms earlier). Find where `usePitchProgress` is called and pass `enabled: detectionActive`. Add `enabled` to `UsePitchProgressOptions` if it doesn't exist — when false, the tick function returns early without accumulating hold time.

Also modify `usePitchProgress.ts` to accept and respect the `enabled` flag. Add to git staging in Step 11.

- [ ] **Step 6: Add overlay to canvas container**

Wrap the canvas section in a `relative` container and conditionally render the overlay:

```tsx
<div className="relative flex-1">
  {/* existing canvas (HillBallCanvas, BalanceBallCanvas, or PitchCanvas) */}
  {!hasStarted && <ExerciseStartOverlay onStart={handleExerciseStart} />}
</div>
```

- [ ] **Step 7: Replace "Play tone" button with "Restart"**

In the bottom panel (lines 334-358), change the button:
- Label: "Restart" instead of "Play tone" / "Playing…"
- Handler: `handleRestart` instead of `handleHearTone`
- Only show when `hasStarted` is true

- [ ] **Step 8: Remove `onPlayTone` usage**

Remove references to `onPlayTone` prop in this component. The tone is now played via `useTonePlayer` directly.

- [ ] **Step 9: Verify it compiles**

Run: `npx tsc --noEmit 2>&1 | grep -v "generator.test\|resolve-exercise.test"`
Expected: no new errors (there may be unused prop warnings — address in Task 7)

- [ ] **Step 10: Manual test in browser**

1. Navigate to Part 2 → Low U exercise
2. Verify Start overlay appears over dimmed canvas
3. Tap Start → overlay fades, wobble tone plays after ~500ms
4. Verify pitch detection starts
5. Tap Restart → progress resets, wobble tone replays
6. Navigate to Hoo Hoo → verify owl hoot plays
7. Verify a sustain-type exercise still plays normal tone

- [ ] **Step 11: Commit**

```bash
git add src/components/Exercise/PitchExercise/PitchExercise.tsx src/components/Exercise/PitchExercise/usePitchProgress.ts
git commit -m "feat: integrate ExerciseStartOverlay and tone shapes into PitchExercise"
```

---

### Task 6: Integrate overlay and restart into MelodyExercise

**Files:**
- Modify: `src/components/Exercise/MelodyExercise.tsx`

**Context:**
- Existing Start button is in the bottom panel (lines 273-281), shown when `!isPlaying && !showScoreModal`
- `handleStart()` at lines 99-126 builds audio schedule and starts playback
- `handleRetry()` at lines 224-232 clears scores, stops sampler, calls `handleStart()` after 100ms delay
- `usePianoSampler()` provides `scheduleMelody()` and `stop()` (line 45)
- MelodyExercise does NOT use `onPlayTone` — it uses the piano sampler directly
- Score modal has its own Retry button (lines 341-354)

Key changes:
1. Add `hasStarted` state (gates showing overlay vs exercise)
2. Replace bottom-panel Start button with the shared `ExerciseStartOverlay`
3. Add "Restart" button in bottom panel (shown during play or after score modal dismiss)
4. Restart = `handleRetry` behavior (already implemented, just wire it to new button)

- [ ] **Step 1: Add imports and state**

```ts
import { ExerciseStartOverlay } from "../ExerciseStartOverlay";

// Inside component:
const [hasStarted, setHasStarted] = useState(false);
```

- [ ] **Step 2: Create start handler that triggers overlay dismiss + start**

```ts
const handleExerciseStart = useCallback(() => {
  setHasStarted(true);
  // Wait 500ms for pacing, then start the melody
  setTimeout(() => {
    handleStart();
  }, 500);
}, [handleStart]);
```

- [ ] **Step 3: Add overlay to canvas container**

Wrap the canvas section in a `relative` container:

```tsx
<div className="relative flex-1">
  {/* existing melody canvas */}
  {!hasStarted && <ExerciseStartOverlay onStart={handleExerciseStart} />}
</div>
```

- [ ] **Step 4: Replace bottom-panel Start button with Restart**

Remove the existing Start button (lines 273-281). Replace with a Restart button shown when `hasStarted` is true and exercise is not currently playing:

```tsx
{hasStarted && !isPlaying && !showScoreModal && (
  <Button variant="ghost" size="sm" onClick={handleRetry}>
    Restart
  </Button>
)}
```

The "Singing…" status text during playback (lines 283-286) remains unchanged.

- [ ] **Step 5: Verify score modal Retry still works**

The existing Retry button in the score modal (lines 341-354) calls `handleRetry`. This should continue working as-is — it doesn't need to go through the overlay.

- [ ] **Step 6: Verify it compiles**

Run: `npx tsc --noEmit 2>&1 | grep -v "generator.test\|resolve-exercise.test"`
Expected: no new errors

- [ ] **Step 7: Manual test in browser**

1. Navigate to a melody exercise (Part 2 → Perfect Fifth)
2. Verify Start overlay appears
3. Tap Start → overlay fades, melody begins after ~500ms
4. Verify scoring works
5. After melody ends, verify score modal shows
6. Tap Retry → melody restarts
7. During idle (not playing, no score modal), verify Restart button visible

- [ ] **Step 8: Commit**

```bash
git add src/components/Exercise/MelodyExercise.tsx
git commit -m "feat: integrate ExerciseStartOverlay and Restart into MelodyExercise"
```

---

## Chunk 3: Cleanup

### Task 7: Clean up `onPlayTone` prop threading

**Files:**
- Modify: `src/components/AppShell/AppShell.tsx`
- Modify: `src/components/Exercise/BaseExercise.tsx`
- Possibly modify: `src/components/Exercise/PitchExercise/PitchExercise.tsx` (remove prop from interface)

**Context:**
- `onPlayTone` is defined in AppShell (lines 74-77), put into AppContext (line 93), and threaded through BaseExercise (lines 30, 155) to PitchExercise
- PitchExercise no longer uses `onPlayTone` after Task 5 — it calls `useTonePlayer` directly
- `onPlaySlide` is still used by `ToneFollowExercise` — do NOT remove it
- `onPlayTone` may still be used by `ToneFollowExercise` — check before removing

- [ ] **Step 1: Check if `onPlayTone` is still used anywhere**

Search for `onPlayTone` usage across all exercise components. If `ToneFollowExercise` still uses it, keep the prop threading but remove it only from `PitchExercise`'s interface. If nothing uses it, remove from AppShell context entirely.

- [ ] **Step 2: Remove unused prop references**

Based on Step 1 findings:
- If `onPlayTone` is only unused in PitchExercise: remove from PitchExercise's props interface
- If unused everywhere: remove `handlePlayTone` from AppShell, remove from AppContext, remove from BaseExercise props

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit 2>&1 | grep -v "generator.test\|resolve-exercise.test"`
Expected: no new errors

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: clean up unused onPlayTone prop threading"
```

---

### Task 8: Final verification

**Files:** None (verification only)

- [ ] **Step 1: Full type check**

Run: `npx tsc --noEmit`
Expected: only the 2 pre-existing errors in test files

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: successful build

- [ ] **Step 3: End-to-end manual test**

Test the full flow:
1. Part 2 → Low U: Start overlay → wobble tone → pitch detection with accept:below → Restart works
2. Part 2 → Hoo Hoo: Start overlay → owl hoot → pitch detection with accept:above → Restart works
3. Part 2 → Perfect Fifth (melody): Start overlay → melody plays → scoring → Retry works → Restart works
4. Part 3 → Low U: Same as Part 2 Low U
5. Any single-note pitch-detection exercise: Start overlay → sustain tone → Restart works
6. Tone-follow exercise: Verify it still works (no overlay — not in scope)
7. Breathwork exercise: Verify it still works (no overlay — not in scope)
