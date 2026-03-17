# Exercise Rethink — Design Spec

## Overview

A set of exercise system improvements: new exercise type for hill-based pitch exercises, improved Start button UX, rhythm exercise rework, chapter roman numerals, updated exercise instructions, and a new `majorSecond()` generator.

---

## 1. New Exercise Type: `pitch-detection-hill`

### Problem

`PitchExercise` conditionally selects between `PitchCanvas`, `BalanceBallCanvas`, and `HillBallCanvas` based on target count and range accept. Multi-repeat range exercises (like Hoo Hoo with `repeats: 3`) fall through to `PitchCanvas` because `isRangeTarget` requires `targets.length === 1`.

### Solution

Introduce `exerciseTypeId: "pitch-detection-hill"` with a dedicated `HillExercise` component.

**Type definition** — extends `BaseExerciseConfig`:

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

**Component: `HillExercise`** — new file `src/components/Exercise/HillExercise.tsx`:
- Always renders `HillBallCanvas` with `direction` from config
- Handles start, progress, tone playback, completion — same logic as PitchExercise but without canvas selection conditionals
- Uses `ExerciseStartButton` (see section 3) instead of `ExerciseStartOverlay`

**BaseExercise dispatcher** — new case:
```ts
case "pitch-detection-hill":
  return <HillExercise ... />;
```

**Generators affected:**
- `gen.zoneAbove()` → change output to `exerciseTypeId: "pitch-detection-hill"`, `direction: "up"`
- New `gen.hillSustain()` → produces `exerciseTypeId: "pitch-detection-hill"`, `direction: "down"`

### `gen.hillSustain()`

```ts
interface HillSustainParams {
  title: string;
  subtitle?: string;
  cardCue?: string;
  instruction: string;
  introModal?: ModalConfig;
  completionModal?: ModalConfig;
  note: number;       // ChromaticDegree
  seconds: number;
  repeats?: number;    // default 3
  direction: "up" | "down";
  toneShape?: ToneShape;
}
```

Produces a `pitch-detection-hill` config. Internally follows the same pattern as `gen.sustain()`: chromatic scale rooted at `note`, targets are `toTarget(1)` repeated `repeats` times. The `direction` field is passed through to the config.

```ts
hillSustain(params: HillSustainParams): ExerciseConfigInput {
  const { note, seconds, repeats = 3, direction, toneShape, ...rest } = params;
  const target = { kind: BandTargetKind.Index, i: 1 };
  const notes = Array.from({ length: repeats }, () => ({ target, seconds }));
  return {
    ...rest,
    exerciseTypeId: "pitch-detection-hill",
    scale: { type: "chromatic", root: note },
    toneShape,
    direction,
    notes,
  };
}
```

### `accept` derivation

`HillBallCanvas` requires an `accept: "above" | "below"` prop. `HillExercise` derives this from `direction`:
- `direction: "up"` → `accept: "above"`
- `direction: "down"` → `accept: "below"`

### `gen.zoneAbove()` changes

Output changes from `exerciseTypeId: "pitch-detection"` to `"pitch-detection-hill"` with `direction: "up"`. The existing `toneShape: { kind: "owl-hoot" }` is preserved. Range-based targets (`BandTargetKind.Range` with from/to/accept) remain unchanged in the notes array — `HillExercise` uses these for progress tracking the same way `PitchExercise` does.

### Exercises affected

- **Hoo Hoo** (chapter 1, stage 2): `gen.zoneAbove()` → now produces `pitch-detection-hill`, direction "up"
- **Low Uu** (chapter 1, stage 2): switch from `gen.sustain()` to `gen.hillSustain({ direction: "down", ... })`

---

## 2. Rename "Simple U" → "Low Uu"

In `chapter1.ts`:
- `title: "Low Uu"`
- Update `subtitle`, `cardCue`, and `instruction` to match the new name

---

## 3. Start Button — Floating Container

### Problem

`ExerciseStartOverlay` covers the entire canvas with `bg-black/40`, hiding the exercise UI. Users can't see the instruction text or canvas before starting.

### Solution

Replace `ExerciseStartOverlay` with a lighter `ExerciseStartButton` component:

- Small floating container, centered on the canvas
- `backdrop-blur-md bg-black/20 rounded-2xl` with padding
- Contains a prominent `Button variant="primary" size="lg"` labeled "Start"
- Canvas, instruction text, and exercise UI remain visible behind it
- Same fade-out animation on click (300ms opacity transition)

**Component: `ExerciseStartButton`** — replaces `ExerciseStartOverlay`:

```tsx
<div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
  <div className="pointer-events-auto backdrop-blur-md bg-black/20 rounded-2xl px-8 py-6">
    <Button variant="primary" size="lg" onClick={handleStart}>
      Start
    </Button>
  </div>
</div>
```

The instruction text (rendered at `z-10` at the top of the canvas) remains fully visible because the floating container only occupies the center — it does not cover the top area where instruction text sits.

All exercises currently using `ExerciseStartOverlay` switch to `ExerciseStartButton`. The file is renamed from `ExerciseStartOverlay.tsx` to `ExerciseStartButton.tsx` — update imports in `PitchExercise.tsx` (and `HillExercise.tsx`). The intro modal is not affected — it continues to work as before.

---

## 4. Rhythm Exercise Rework

### Current state

- `PRE_ROLL_MS = 2000` — visual lead-in, no metronome
- Pattern: 4 taps + 1-beat pause + 4 taps (6.75s at 80 BPM)
- Hit window centered around beat time, but users expect to tap ON the metronome click

### Changes

**4a. 4-beat intro pause with metronome**
- Replace `PRE_ROLL_MS` with 4 leading pause events: `{ type: "pause", duration: NoteDuration.Quarter }` × 4
- Metronome clicks during these pauses so user hears the tempo before tapping
- These pauses are not scored

**4b. 2-beat pauses between rows**
- Each row of 4 taps is followed by `{ type: "pause", duration: NoteDuration.Half }` (2 beats)

**4c. Longer pattern**
- 4 rows of 4 taps = 16 scored beats (was 8)
- Full pattern: 4 pause + 4 tap + 2 pause + 4 tap + 2 pause + 4 tap + 2 pause + 4 tap

**4d. Hit window alignment — fix scoring reference point**
- User should press space ON the metronome click, not after
- Current code measures distance from `beatCenter` (startMs + durationMs/2), but the metronome clicks at `beatStartMs`
- Fix: change distance calculation to measure from `beatStartMs` instead of `beatCenter`
- `HIT_WINDOW_MS` and `CLOSE_WINDOW_MS` remain symmetric around this point (both before and after)

**4e. Remove `PRE_ROLL_MS`**
- The 4-beat intro pauses replace `PRE_ROLL_MS` entirely — remove the constant and its usage

---

## 5. `gen.majorSecond()` Generator

Wraps `gen.interval()` with `chromaticDegree: 3` (major second = 2 semitones, 1-indexed → 3):

```ts
majorSecond(params: NamedMelodyParams): ExerciseConfigInput {
  return this.interval({
    ...params,
    startNote: params.startNote ?? 1,
    endNote: params.endNote ?? 6,
    chromaticDegree: 3,
  });
}
```

Each root step produces: chord (root + interval, Quarter) → pause (Eighth) → sing root (Half) → sing interval (Half).

Replace the inline Major Second config in `chapter1.ts` with `gen.majorSecond({ ... })`.

Note: the current inline config uses `scaleType: "major"` with scale degrees. The new `gen.majorSecond()` uses `gen.interval()` which builds a chromatic scale and steps chromatically through roots. This is an intentional change — chromatic stepping is consistent with `gen.fifth()` and `gen.octave()`.

The defaults `startNote: 1, endNote: 6` are deliberately lower than fifth/octave's `4, -4` — Major Second is an early exercise targeting the low range.

---

## 6. Chapter Roman Numerals

### Current

- Journey list: `Chapter 1`
- Exercise headline (LearnExercise): `Part {partRoman} — {partTitle}` where `partRoman` is just `String(chapter)`

### Changes

**Utility function** `toRoman(n: number): string` in `src/lib/format.ts` — converts 1→"I", 2→"II", etc.

**Exercise headline** — all exercise components:
- Desktop: `Chapter I — Wake Up`
- Mobile: `Ch I — Wake Up`
- Use responsive text or a CSS `hidden sm:inline` / `sm:hidden` pattern

**Journey list** (`JourneyList.tsx`):
- `Chapter I` (with roman numeral)

**`partRoman` prop** — pass actual roman numeral from `JourneyExercise.tsx` instead of `String(exercise.chapter)`.

---

## 7. Instruction Text Updates

### 7a. Voiceless Lip Roll (chapter 1)

Current instruction: "Let your lips buzz loosely — like a motorboat. No pitch, just the buzz. Keep your jaw relaxed."

Updated: "Let your lips buzz loosely — like a motorboat. No pitch, just the buzz.\nFill the bar by lip rolling — it's okay to do several lip rolls and take breaths between them."

### 7b. Sss-Zzz-Sss (chapter 1)

Current instruction: "Alternate between sss and zzz sounds. No pitch needed — just feel the vibration shift from voiceless to voiced."

Updated: "Alternate between sss and zzz sounds. No pitch needed — just feel the vibration shift from voiceless to voiced.\nIt's okay to take breaths between sounds."

---

## Files Affected

| File | Changes |
|------|---------|
| `src/constants/journey/types.ts` | Add `PitchDetectionHillConfig`, add to `ExerciseConfig` union, add to `ExerciseTypeId` |
| `src/constants/journey/exercise-generator.ts` | Add `gen.hillSustain()`, `gen.majorSecond()`, update `gen.zoneAbove()` output type |
| `src/constants/journey/chapter1.ts` | Rename Simple U → Low Uu, switch to `gen.hillSustain()`, use `gen.majorSecond()` |
| `src/constants/journey/chapter2.ts` | Update rhythm pattern config |
| `src/constants/journey/Journey.ts` | Add intro modal builder for `pitch-detection-hill` |
| `src/lib/resolve-exercise.ts` | Add `PitchDetectionHillExercise` resolved type (mirrors `PitchDetectionExercise` + `direction`), add resolution case |
| `src/lib/format.ts` | Add `toRoman()` utility (new file or add to existing) |
| `src/components/Exercise/HillExercise.tsx` | New component |
| `src/components/Exercise/ExerciseStartOverlay.tsx` | Rewrite → `ExerciseStartButton` (floating container) |
| `src/components/Exercise/BaseExercise.tsx` | Add `pitch-detection-hill` case |
| `src/components/Exercise/PitchExercise/PitchExercise.tsx` | Update to use `ExerciseStartButton` |
| `src/components/Exercise/RhythmExercise.tsx` | Rework pattern, intro pause, hit window |
| `src/components/Exercise/LearnExercise.tsx` | Update headline to "Chapter/Ch" + roman numeral |
| `src/components/JourneyView/components/JourneyList.tsx` | Roman numeral chapter labels |
| `src/components/JourneyView/components/JourneyExercise.tsx` | Pass roman numeral |
