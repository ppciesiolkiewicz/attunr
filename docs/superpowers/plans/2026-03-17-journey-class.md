# Journey Class & Type Simplification Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introduce a Journey class and VocalRange class to simplify the exercise type system, consolidate entry points, and clean up chapter configs.

**Architecture:** Journey class wraps chapter configs (with ID assignment and intro modal generation) and exposes `getExercise(id, vocalRange)` that delegates to internal resolution logic. VocalRange becomes a class that owns its own construction from Hz values, absorbing color interpolation. ExerciseGenerator gets new methods and chapter configs are simplified to use it.

**Tech Stack:** TypeScript, Next.js, Vitest

**Spec:** `docs/superpowers/specs/2026-03-17-journey-class-design.md`

---

## File Structure

### New files
- `src/lib/VocalRange.ts` — VocalRange class, ColoredNote, ResolvedNote types
- `src/constants/journey/Journey.ts` — Journey class

### Renamed files
- `src/constants/journey/generator.ts` → `src/constants/journey/exercise-generator.ts`
- `src/constants/journey/generator.test.ts` → `src/constants/journey/exercise-generator.test.ts`

### Deleted files
- `src/lib/vocal-scale.ts` — absorbed into VocalRange.colorize()
- `src/constants/tone-slots.ts` — types moved to VocalRange.ts, re-exports removed

### Modified files
- `src/constants/journey/types.ts` — rename types to `*Config`
- `src/constants/journey/index.ts` — export Journey singleton
- `src/constants/journey/chapter1.ts` — use generator, convert multi-note to melody
- `src/constants/journey/chapter2.ts` — same
- `src/lib/resolve-exercise.ts` — rename types, use vocalRange.findNote()
- `src/lib/resolve-exercise.test.ts` — update imports
- `src/lib/scale.ts` — update imports
- `src/lib/pitch.ts` — update imports
- `src/components/Exercise/BaseExercise.tsx` — use journey.getExercise()
- `src/components/Exercise/PitchExercise/PitchExercise.tsx` — update type imports
- `src/components/Exercise/PitchExercise/usePitchProgress.ts` — update type imports
- `src/components/Exercise/MelodyExercise.tsx` — update type imports
- `src/components/Exercise/RhythmExercise.tsx` — update type imports
- `src/components/Exercise/RhythmCanvas.tsx` — update type imports
- `src/components/Exercise/ToneFollowExercise.tsx` — update type imports
- `src/components/Exercise/VolumeDetectionExercise.tsx` — update type imports
- `src/components/Exercise/LearnExercise.tsx` — update type imports
- `src/components/Exercise/FarinelliBreathworkExercise.tsx` — update type imports
- `src/components/Exercise/components/ContentElements.tsx` — update imports
- `src/components/Exercise/LearnNotesExercise.tsx` — update imports
- `src/components/JourneyView/JourneyView.tsx` — update imports
- `src/components/JourneyView/utils.ts` — use journey.exercises
- `src/components/JourneyView/components/JourneyList.tsx` — use journey.chapters
- `src/components/JourneyView/components/JourneyExercise.tsx` — use new VocalRange(), journey.*
- `src/components/JourneyView/components/ExerciseInfoModal.tsx` — use journey.exercises
- `src/components/JourneyView/components/ExerciseCard.tsx` — update imports
- `src/components/JourneyView/components/PartCompleteModal.tsx` — update imports
- `src/components/TrainView.tsx` — use new VocalRange()
- `src/components/OnboardingModal/components/ToneSpectrum.tsx` — update NOTE_PALETTE import
- `src/components/PitchCanvas.tsx` — update imports
- `src/components/BalanceBallCanvas.tsx` — update imports
- `src/components/HillBallCanvas.tsx` — update imports
- `src/components/BalanceBallCanvas.stories.tsx` — update imports
- `src/components/HillBallCanvas.stories.tsx` — update imports
- `src/components/AppShell/AppShell.tsx` — update imports
- `src/context/AppContext.tsx` — update imports
- `src/app/journey/[id]/layout.tsx` — use journey.exercises
- `src/app/journey/[id]/page.tsx` — use journey.exercises

---

## Task 1: VocalRange class

Create the VocalRange class that absorbs `getScaleNotesForRange()`, `NOTE_PALETTE`, `lookupColoredNote()`, and the `ResolvedNote`/`ColoredNote`/`VocalRange` types.

**Files:**
- Create: `src/lib/VocalRange.ts`
- Read: `src/lib/vocal-scale.ts`, `src/constants/tone-slots.ts`, `src/lib/resolve-exercise.ts` (for `lookupColoredNote`)

- [ ] **Step 1: Create `src/lib/VocalRange.ts`**

Move `ResolvedNote` and `ColoredNote` interfaces from `src/constants/tone-slots.ts`. Move `NOTE_PALETTE` as an exported module-level constant (still needed by `JourneyView/utils.ts` and `ToneSpectrum.tsx`). Move `getScaleNotesForRange()` logic from `src/lib/vocal-scale.ts` into a private `colorize()` method. Move `lookupColoredNote()` from `src/lib/resolve-exercise.ts` into a public `findNote()` method.

```ts
import { hzToMidi, midiToHz, hzToNoteName, NOTE_NAMES } from "@/lib/pitch";
import { parseRgb, lerpColor, toHex } from "@/lib/color";
import type { TuningStandard } from "@/constants/tuning";

export interface ResolvedNote {
  id: string;
  midi: number;
  frequencyHz: number;
  note: string;
  octave: number;
  name: string;
}

export interface ColoredNote extends ResolvedNote {
  color: string;
  rgb: string;
}

export const NOTE_PALETTE = [
  { color: "#ef4444", rgb: "239, 68, 68" },
  { color: "#f97316", rgb: "249, 115, 22" },
  { color: "#eab308", rgb: "234, 179, 8" },
  { color: "#22c55e", rgb: "34, 197, 94" },
  { color: "#3b82f6", rgb: "59, 130, 246" },
  { color: "#6366f1", rgb: "99, 102, 241" },
  { color: "#a855f7", rgb: "168, 85, 247" },
];

export class VocalRange {
  readonly lowNote: string;
  readonly highNote: string;
  readonly allNotes: ColoredNote[];

  constructor(lowHz: number, highHz: number, _tuning: TuningStandard) {
    this.lowNote = hzToNoteName(lowHz);
    this.highNote = hzToNoteName(highHz);
    this.allNotes = this.colorize(lowHz, highHz);
  }

  findNote(midi: number): ColoredNote | null {
    const exact = this.allNotes.find((n) => n.midi === midi);
    if (exact) return exact;
    if (this.allNotes.length === 0) return null;
    let closest = this.allNotes[0];
    let minDist = Math.abs(midi - closest.midi);
    for (let i = 1; i < this.allNotes.length; i++) {
      const dist = Math.abs(midi - this.allNotes[i].midi);
      if (dist < minDist) {
        closest = this.allNotes[i];
        minDist = dist;
      }
    }
    return closest;
  }

  private colorize(lowHz: number, highHz: number): ColoredNote[] {
    // ... move getScaleNotesForRange logic here verbatim
  }
}
```

- [ ] **Step 2: Run build to verify no type errors**

Run: `npx tsc --noEmit`
Expected: PASS (new file, no consumers yet)

- [ ] **Step 3: Commit**

```bash
git add src/lib/VocalRange.ts
git commit -m "feat: add VocalRange class"
```

---

## Task 2: Migrate consumers from tone-slots and vocal-scale to VocalRange

Update all files that import from `@/constants/tone-slots` or `@/lib/vocal-scale` to import from `@/lib/VocalRange`. Then delete the old files.

**Files:**
- Modify: all 22 files importing from `@/constants/tone-slots` + 3 from `@/lib/vocal-scale`
- Delete: `src/constants/tone-slots.ts`, `src/lib/vocal-scale.ts`

- [ ] **Step 1: Update type-only imports across all consumers**

For files importing only `ColoredNote`, `ResolvedNote`, or `VocalRange` types:
```ts
// Before
import type { ColoredNote } from "@/constants/tone-slots";
// After
import type { ColoredNote } from "@/lib/VocalRange";
```

Files to update (type-only imports):
- `src/components/JourneyView/JourneyView.tsx` — `ColoredNote`
- `src/components/TrainView.tsx` — `ColoredNote`
- `src/components/PitchCanvas.tsx` — `ColoredNote`
- `src/components/BalanceBallCanvas.tsx` — `ColoredNote`
- `src/components/HillBallCanvas.tsx` — `ColoredNote`
- `src/components/BalanceBallCanvas.stories.tsx` — `ColoredNote`
- `src/components/HillBallCanvas.stories.tsx` — `ColoredNote`
- `src/components/AppShell/AppShell.tsx` — `ColoredNote`
- `src/components/Exercise/MelodyExercise.tsx` — `ColoredNote`
- `src/components/Exercise/ToneFollowExercise.tsx` — `ColoredNote`
- `src/components/Exercise/PitchExercise/PitchExercise.tsx` — `ColoredNote`
- `src/components/Exercise/LearnNotesExercise.tsx` — `ColoredNote, VocalRange`
- `src/components/Exercise/BaseExercise.tsx` — `ColoredNote, VocalRange`
- `src/context/AppContext.tsx` — `ColoredNote`
- `src/lib/pitch.ts` — `ResolvedNote`
- `src/lib/scale.ts` — `ResolvedNote, ColoredNote, VocalRange`
- `src/lib/resolve-exercise.ts` — `ColoredNote, VocalRange`
- `src/lib/resolve-exercise.test.ts` — `VocalRange`

- [ ] **Step 2: Update NOTE_PALETTE imports**

Files that import `NOTE_PALETTE` — update to import from `@/lib/VocalRange` (already exported there):
```ts
// Before
import { NOTE_PALETTE } from "@/constants/tone-slots";
// After
import { NOTE_PALETTE } from "@/lib/VocalRange";
```

- `src/components/JourneyView/utils.ts`
- `src/components/OnboardingModal/components/ToneSpectrum.tsx`

- [ ] **Step 3: Update VocalRange construction sites**

```ts
// Before (JourneyExercise.tsx)
import { getScaleNotesForRange } from "@/lib/vocal-scale";
import { hzToNoteName } from "@/lib/pitch";
const vocalRange = {
  lowNote: hzToNoteName(lowHz),
  highNote: hzToNoteName(highHz),
  allNotes: getScaleNotesForRange(lowHz, highHz, settings.tuning),
};

// After
import { VocalRange } from "@/lib/VocalRange";
const vocalRange = new VocalRange(lowHz, highHz, settings.tuning);
```

Files:
- `src/components/JourneyView/components/JourneyExercise.tsx`
- `src/components/TrainView.tsx`
- `src/lib/resolve-exercise.test.ts`

- [ ] **Step 4: Update resolve-exercise.ts to use vocalRange.findNote()**

Remove the local `lookupColoredNote()` function. Replace all calls with `vocalRange.findNote()`.

```ts
// Before
const colored = resolved[0] ? lookupColoredNote(resolved[0].midi, allNotes) : null;
// After
const colored = resolved[0] ? vocalRange.findNote(resolved[0].midi) : null;
```

- [ ] **Step 5: Remove re-exports from tone-slots.ts that consumers imported directly**

Check that no file still imports the re-exported functions (`hzToMidi`, `isInTune`, `findClosestNote`, etc.) from `@/constants/tone-slots` rather than `@/lib/pitch` directly. If any do, update them to import from the original source.

Re-exports to check:
- `VOICE_TYPES`, `VoiceTypeId`, `VoiceType` → from `@/constants/voice-types`
- `TUNING_OPTIONS`, `TUNING_A_HZ`, `TuningStandard`, `FrequencyBase` → from `@/constants/tuning`
- `hzToMidi`, `midiToHz`, `hzToNoteName`, `deriveVoiceType`, `isInTune`, `isInNoteRange`, `matchesNoteTarget`, `findClosestNote`, `pitchConfidence` → from `@/lib/pitch`
- `getScaleNotesForRange` → deleted (absorbed into VocalRange)

Search for any file importing these from `@/constants/tone-slots` and update to import from the original source.

- [ ] **Step 6: Delete old files**

Delete `src/constants/tone-slots.ts` and `src/lib/vocal-scale.ts`.

- [ ] **Step 7: Run build and tests**

Run: `npx tsc --noEmit && npx vitest run`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "refactor: migrate to VocalRange class, delete tone-slots and vocal-scale"
```

---

## Task 3: Rename internal types to *Config

Rename all exercise types in `types.ts` and update all consumers.

**Files:**
- Modify: `src/constants/journey/types.ts`
- Modify: all files importing these types

- [ ] **Step 1: Rename types in `src/constants/journey/types.ts`**

| Old | New |
|-----|-----|
| `PitchDetectionExercise` | `PitchDetectionConfig` |
| `PitchDetectionSlideExercise` | `PitchDetectionSlideConfig` |
| `ToneFollowExercise` | `ToneFollowConfig` |
| `MelodyExercise` | `MelodyConfig` |
| `RhythmExercise` | `RhythmConfig` |
| `LearnExercise` | `LearnConfig` |
| `LearnNotesExercise` | `LearnNotesConfig` |
| `FarinelliBreathworkExercise` | `FarinelliBreathworkConfig` |
| `VolumeDetectionExercise` | `VolumeDetectionConfig` |
| `JourneyExercise` | `ExerciseConfig` |
| `JourneyExerciseInput` | `ExerciseConfigInput` |

Also rename the union type and its `DistributiveOmit`:
```ts
export type ExerciseConfig =
  | LearnConfig
  | LearnNotesConfig
  | PitchDetectionConfig
  | PitchDetectionSlideConfig
  | FarinelliBreathworkConfig
  | ToneFollowConfig
  | MelodyConfig
  | VolumeDetectionConfig
  | RhythmConfig;

type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never;
export type ExerciseConfigInput = DistributiveOmit<ExerciseConfig, "id" | "chapter" | "stageId">;
```

Update `StageConfig` and `Chapter` to use `ExerciseConfig`:
```ts
export interface StageConfig {
  id: string;
  title: string;
  exercises: ExerciseConfig[];
}
```

Update `StageConfigInput` and `ChapterInput` to use `ExerciseConfigInput`.

- [ ] **Step 2: Update internal consumers**

Files that import these types from `@/constants/journey/types` or `@/constants/journey`:

- `src/constants/journey/exercise-generator.ts` (or still generator.ts at this point) — `JourneyExerciseInput` → `ExerciseConfigInput`, `MelodyScale`, `MelodyEvent`, `NoteTarget`, etc. (only `JourneyExerciseInput` renamed)
- `src/constants/journey/chapter1.ts` — `StageConfigInput`
- `src/constants/journey/chapter2.ts` — `StageConfigInput`
- `src/constants/journey/index.ts` — `JourneyExercise` → `ExerciseConfig`, `Chapter`, `ChapterInput`, etc.
- `src/lib/resolve-exercise.ts` — `JourneyExercise` → `ExerciseConfig`, `PitchDetectionExercise` → `PitchDetectionConfig`, etc.
- `src/lib/resolve-exercise.test.ts` — same
- `src/lib/scale.ts` — `NoteTarget`, `BaseScale`, `BandTargetKind` (unchanged, no rename needed)

- [ ] **Step 3: Update component consumers**

Components that import exercise types. Many already alias them:
```ts
// Before
import type { MelodyExercise as MelodyConfig } from "@/constants/journey";
// After
import type { MelodyConfig } from "@/constants/journey";
```

Files:
- `src/components/Exercise/BaseExercise.tsx` — `JourneyExercise` → `ExerciseConfig`
- `src/components/Exercise/PitchExercise/PitchExercise.tsx` — `PitchDetectionExercise` → `PitchDetectionConfig`, `PitchDetectionSlideExercise` → `PitchDetectionSlideConfig`
- `src/components/Exercise/PitchExercise/usePitchProgress.ts` — same
- `src/components/Exercise/MelodyExercise.tsx` — `MelodyExercise as MelodyConfig` → `MelodyConfig`
- `src/components/Exercise/RhythmExercise.tsx` — `RhythmExercise as RhythmConfig` → `RhythmConfig`
- `src/components/Exercise/ToneFollowExercise.tsx` — `ToneFollowExercise as ToneFollowConfig` → `ToneFollowConfig`
- `src/components/Exercise/VolumeDetectionExercise.tsx` — `VolumeDetectionExercise as VolumeDetectionConfig` → `VolumeDetectionConfig`
- `src/components/Exercise/LearnExercise.tsx` — `LearnExercise as LearnExerciseConfig` → `LearnConfig`
- `src/components/Exercise/FarinelliBreathworkExercise.tsx` — `FarinelliBreathworkExercise as FarinelliBreathworkConfig` → `FarinelliBreathworkConfig`
- `src/components/JourneyView/utils.ts` — `JourneyExercise` → `ExerciseConfig`
- `src/components/JourneyView/components/ExerciseCard.tsx` — `JourneyExercise` → `ExerciseConfig`
- `src/components/Exercise/components/ContentElements.tsx` — `ContentElement` (unchanged)

- [ ] **Step 4: Run build and tests**

Run: `npx tsc --noEmit && npx vitest run`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: rename exercise types to *Config naming"
```

---

## Task 4: Rename resolved types (drop Resolved prefix, add Exercise suffix)

Rename types in `resolve-exercise.ts` and update all consumers.

**Files:**
- Modify: `src/lib/resolve-exercise.ts`
- Modify: all component files importing resolved types

- [ ] **Step 1: Rename types in `src/lib/resolve-exercise.ts`**

| Old | New |
|-----|-----|
| `ResolvedExercise` | `Exercise` |
| `ResolvedPitchDetection` | `PitchDetectionExercise` |
| `ResolvedPitchDetectionSlide` | `PitchDetectionSlideExercise` |
| `ResolvedToneFollow` | `ToneFollowExercise` |
| `ResolvedMelody` | `MelodyExercise` |
| `ResolvedRhythm` | `RhythmExercise` |
| `ResolvedPitchTarget` | `PitchTarget` |
| `ResolvedTimelineEntry` | `TimelineEntry` |
| `ResolvedBeat` | `Beat` |

- [ ] **Step 2: Update all consumers**

Files importing resolved types from `@/lib/resolve-exercise`:
- `src/components/Exercise/BaseExercise.tsx` — all 5 resolved types
- `src/components/Exercise/PitchExercise/PitchExercise.tsx` — `ResolvedPitchDetection`, `ResolvedPitchDetectionSlide`
- `src/components/Exercise/PitchExercise/usePitchProgress.ts` — `ResolvedPitchDetection`, `ResolvedPitchDetectionSlide`
- `src/components/Exercise/MelodyExercise.tsx` — `ResolvedMelody`, `ResolvedTimelineEntry`
- `src/components/Exercise/RhythmExercise.tsx` — `ResolvedRhythm`
- `src/components/Exercise/RhythmCanvas.tsx` — `ResolvedBeat`
- `src/components/Exercise/ToneFollowExercise.tsx` — `ResolvedToneFollow`
- `src/lib/resolve-exercise.test.ts` — all resolved types

- [ ] **Step 3: Run build and tests**

Run: `npx tsc --noEmit && npx vitest run`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: rename resolved types - drop Resolved prefix, add Exercise suffix"
```

---

## Task 5: Rename generator.ts to exercise-generator.ts and add new methods

**Files:**
- Rename: `src/constants/journey/generator.ts` → `src/constants/journey/exercise-generator.ts`
- Modify: `src/constants/journey/exercise-generator.ts` (add `sustain()`, `lipRollSustain()`)
- Modify: `src/constants/journey/index.ts` (update import path)

- [ ] **Step 1: Rename file**

```bash
git mv src/constants/journey/generator.ts src/constants/journey/exercise-generator.ts
```

- [ ] **Step 2: Rename test file and update imports**

```bash
git mv src/constants/journey/generator.test.ts src/constants/journey/exercise-generator.test.ts
```

Update the import inside the test file:
```ts
// Before
import { ExerciseGenerator } from "./generator";
// After
import { ExerciseGenerator } from "./exercise-generator";
```

- [ ] **Step 3: Update import in `src/constants/journey/index.ts`**

```ts
// Before
import { ExerciseGenerator } from "./generator";
// After
import { ExerciseGenerator } from "./exercise-generator";
```

- [ ] **Step 4: Add `sustain()` method**

Add to `ExerciseGenerator` class in `exercise-generator.ts`:

```ts
export interface SustainParams extends CommonParams {
  note: number;
  seconds: number;
  repeats?: number;
  toneShape?: ToneShape;
}

sustain(params: SustainParams): ExerciseConfigInput {
  const {
    title, subtitle, cardCue, instruction, introModal, completionModal,
    note, seconds, repeats = 3, toneShape,
  } = params;

  const notes = Array.from({ length: repeats }, () => ({
    target: toTarget(1),
    seconds,
  }));

  return {
    title, subtitle, cardCue, instruction, introModal, completionModal,
    exerciseTypeId: "pitch-detection",
    scale: { type: "chromatic", root: note },
    ...(toneShape && { toneShape }),
    notes,
  };
}
```

- [ ] **Step 5: Add `lipRollSustain()` method**

```ts
export interface LipRollSustainParams extends CommonParams {
  note: number;
  seconds: number;
  requiredPlays: number;
}

lipRollSustain(params: LipRollSustainParams): ExerciseConfigInput {
  const {
    title, subtitle, cardCue, instruction, introModal, completionModal,
    note, seconds, requiredPlays,
  } = params;

  return {
    title, subtitle, cardCue, instruction, introModal, completionModal,
    exerciseTypeId: "tone-follow",
    scale: { type: "chromatic", root: note },
    toneShape: { kind: "sustain", target: toTarget(1), seconds },
    displayNotes: [],
    requiredPlays,
  };
}
```

- [ ] **Step 6: Verify type imports in exercise-generator.ts**

Task 3 already renamed `JourneyExerciseInput` → `ExerciseConfigInput`. Verify the import is correct.

- [ ] **Step 7: Run build**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "refactor: rename generator.ts to exercise-generator.ts, add sustain() and lipRollSustain()"
```

---

## Task 6: Simplify chapter configs

Use ExerciseGenerator for all applicable exercises. Convert multi-note pitch-detection to melody.

**Files:**
- Modify: `src/constants/journey/chapter1.ts`
- Modify: `src/constants/journey/chapter2.ts`

- [ ] **Step 1: Rewrite chapter1.ts to use ExerciseGenerator**

Import and instantiate generator:
```ts
import { ExerciseGenerator } from "./exercise-generator";
import type { StageConfigInput } from "./types";

const gen = new ExerciseGenerator();
```

Convert exercises:
- "Gentle hum" → `gen.sustain({ note: 1, seconds: 5, title: "Gentle hum", subtitle: "Hum · 5 seconds × 3", cardCue: "...", instruction: "..." })`
- "Hoo hoo" → `gen.zoneAbove({ boundaryNote: -6, seconds: 5, title: "Hoo hoo", ... })`
  Note: current "Hoo hoo" has 3 repeated range targets with `seconds: 5` each but `zoneAbove` produces a single target. Check if this works with PitchExercise or if `repeats` param is needed on `zoneAbove` too.
- "Simple U" → `gen.sustain({ note: 1, seconds: 6, ... })`
- "Lip roll slide" → `gen.lipRoll({ startNote: 1, endNote: -1, requiredPlays: 3, ... })`
- "Hum — mid-low" → `gen.sustain({ note: 4, seconds: 5, ... })`
- "U — mid-low" → `gen.sustain({ note: 4, seconds: 6, ... })`
- "Lip roll sustain" → `gen.lipRollSustain({ note: 5, seconds: 5, requiredPlays: 3, ... })`
- "Hum — mid" → `gen.sustain({ note: 7, seconds: 6, ... })` (with completionModal)
- "Farinelli breathwork" → `gen.farinelli({ maxCount: 5, ... })`
- Learn, learn-notes-1, volume-detection exercises stay inline.
- "Major Second" melody stays inline.

- [ ] **Step 2: Rewrite chapter2.ts to use ExerciseGenerator**

Convert exercises:
- Warmup: "Sss-Zzz-Sss" stays inline, "Lip rolls" → `gen.lipRoll(...)`, "Gentle hum" → `gen.sustain({ repeats: 2, ... })`, "Farinelli" → `gen.farinelli(...)`
- Stage 1: Convert "Hum — low to mid" and "U — low to mid" (3 rising notes) to melody exercises. "Lip rolls — high to low" → `gen.lipRoll(...)`. "Feel the Beat" stays inline.
- Stage 2: "5-tone scale" stays inline. "Hum sequence" and "U sequence" (3 rising notes) → convert to melody.
- Stage 3: "Hum — mid" → `gen.sustain(...)`. "U — mid" → `gen.sustain(...)`. "Lip roll sustain" → `gen.lipRollSustain(...)`. "Farinelli" → `gen.farinelli(...)` (with completionModal).

For multi-note pitch-detection → melody conversions, create melody configs with appropriate tempo and note durations. Example for "Hum — low to mid" (3 notes at i:1, i:4, i:7 held 5s each):
```ts
{
  exerciseTypeId: "melody",
  title: "Hum — low to mid",
  subtitle: "Hum · 3 rising pitches",
  tempo: 15,  // very slow — (Half=8 sixteenths / 4) * (60/15) = 8 seconds per note
  melody: [{
    type: "chromatic",
    root: 1,
    events: [
      { type: "note", target: { kind: BandTargetKind.Index, i: 1 }, duration: NoteDuration.Half },
      { type: "note", target: { kind: BandTargetKind.Index, i: 4 }, duration: NoteDuration.Half },
      { type: "note", target: { kind: BandTargetKind.Index, i: 7 }, duration: NoteDuration.Half },
    ],
  }],
  minScore: 0,
  instruction: "...",
}
```

Note: exact tempo/duration values need tuning to match the original hold times. The formula is: `seconds = (NoteDuration / 4) * (60 / tempo)`. For 5s holds with Half notes (8 sixteenths): `tempo = (8/4) * (60/5) = 24`.

- [ ] **Step 3: Run build**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: simplify chapter configs with ExerciseGenerator"
```

---

## Task 7: Journey class

Create the Journey class that absorbs index.ts responsibilities and exposes `getExercise()`.

**Files:**
- Create: `src/constants/journey/Journey.ts`
- Modify: `src/constants/journey/index.ts`

- [ ] **Step 1: Create `src/constants/journey/Journey.ts`**

Move the following from `index.ts` into the Journey class:
- `assignIds()` logic → constructor
- `buildIntroModal()` → private method
- `withIntroModals()` → private method
- `getNextExerciseId()` → public method
- `JOURNEY_EXERCISES` → `this.exercises`
- `JOURNEY_CONFIG` → `this.chapters`

Add `getExercise()`:
```ts
import { resolveExercise } from "@/lib/resolve-exercise";
import type { Exercise } from "@/lib/resolve-exercise";
import type { VocalRange } from "@/lib/VocalRange";

class Journey {
  readonly chapters: Chapter[];
  readonly exercises: ExerciseConfig[];

  constructor(chapters: ChapterInput[]) {
    // assign IDs, build intro modals, flatten exercises
  }

  getExercise(id: number, vocalRange: VocalRange): Exercise {
    const config = this.exercises.find((e) => e.id === id);
    if (!config) throw new Error(`Exercise ${id} not found`);
    return resolveExercise(config, vocalRange);
  }

  getNextExerciseId(currentId: number): number | null {
    const idx = this.exercises.findIndex((e) => e.id === currentId);
    return idx >= 0 && idx < this.exercises.length - 1
      ? this.exercises[idx + 1].id
      : null;
  }
}
```

- [ ] **Step 2: Update `src/constants/journey/index.ts`**

Replace current exports with Journey singleton:
```ts
import { Journey } from "./Journey";
import { CHAPTER_1_STAGES } from "./chapter1";
import { CHAPTER_2_WARMUP, CHAPTER_2_STAGES } from "./chapter2";

export const journey = new Journey([
  { chapter: 1, title: "Introduction", stages: CHAPTER_1_STAGES },
  { chapter: 2, title: "Building Foundation", warmup: CHAPTER_2_WARMUP, stages: CHAPTER_2_STAGES },
]);

// Re-export types that components need
export type { ExerciseConfig, ExerciseConfigInput, ModalConfig, ContentElement } from "./types";
export type { Exercise, PitchDetectionExercise, PitchDetectionSlideExercise, ToneFollowExercise, MelodyExercise, RhythmExercise, PitchTarget, TimelineEntry, Beat } from "@/lib/resolve-exercise";

// Re-export config types as *Exercise for non-resolved types consumed by components
export type { LearnConfig as LearnExercise, LearnNotesConfig as LearnNotesExercise, FarinelliBreathworkConfig as FarinelliBreathworkExercise, VolumeDetectionConfig as VolumeDetectionExercise } from "./types";
```

- [ ] **Step 3: Run build**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add Journey class"
```

---

## Task 8: Migrate consumers to Journey class

Update all components importing from `@/constants/journey` to use `journey.*` and `journey.getExercise()`.

**Files:**
- Modify: all component files importing JOURNEY_CONFIG, JOURNEY_EXERCISES, getNextExerciseId, resolveExercise

- [ ] **Step 1: Update journey data access**

```ts
// Before
import { JOURNEY_EXERCISES, JOURNEY_CONFIG, getNextExerciseId } from "@/constants/journey";
// After
import { journey } from "@/constants/journey";
// Then use journey.exercises, journey.chapters, journey.getNextExerciseId()
```

Files:
- `src/components/JourneyView/utils.ts` — `JOURNEY_EXERCISES` → `journey.exercises`
- `src/components/JourneyView/components/JourneyList.tsx` — `JOURNEY_CONFIG` → `journey.chapters`
- `src/components/JourneyView/components/JourneyExercise.tsx` — all three
- `src/components/JourneyView/components/ExerciseInfoModal.tsx` — `JOURNEY_EXERCISES` → `journey.exercises`
- `src/app/journey/[id]/layout.tsx` — `JOURNEY_EXERCISES` → `journey.exercises`
- `src/app/journey/[id]/page.tsx` — `JOURNEY_EXERCISES` → `journey.exercises`

- [ ] **Step 2: Update BaseExercise.tsx to use journey.getExercise()**

Important: `BaseExercise` receives the full `ExerciseConfig` and switches on `exerciseTypeId`. Non-resolvable types (`learn`, `learn-notes-1`, `breathwork-farinelli`, `volume-detection`) are passed directly to their components without resolution. Only resolvable types go through `journey.getExercise()`.

```ts
// Before
import { resolveExercise } from "@/lib/resolve-exercise";
// ... in the resolvable branch:
const resolved = resolveExercise(exercise, vocalRange);

// After
import { journey } from "@/constants/journey";
// ... in the resolvable branch:
const resolved = journey.getExercise(exercise.id, vocalRange);
```

The switch structure stays the same — non-resolvable types are handled before any resolution call. Only the resolution call itself changes.

- [ ] **Step 3: Remove direct imports of resolveExercise from components**

After BaseExercise uses `journey.getExercise()`, no component should import from `@/lib/resolve-exercise` directly. The test file (`resolve-exercise.test.ts`) can keep its direct import since it's testing the internal module.

- [ ] **Step 4: Run build and tests**

Run: `npx tsc --noEmit && npx vitest run`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: migrate consumers to Journey class"
```

---

## Task 9: Final cleanup and verification

- [ ] **Step 1: Verify no stale imports remain**

Search for any remaining imports of deleted/renamed modules:
```bash
grep -r "tone-slots\|vocal-scale\|ResolvedPitchDetection\|ResolvedMelody\|ResolvedExercise\|JOURNEY_CONFIG\|JOURNEY_EXERCISES\|getNextExerciseId\|JourneyExercise\b" src/ --include="*.ts" --include="*.tsx" -l
```

Fix any remaining references. `resolve-exercise.test.ts` may still reference old type names — update if needed.

- [ ] **Step 2: Run full build**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 3: Run all tests**

Run: `npx vitest run`
Expected: PASS

- [ ] **Step 4: Run the app and smoke test**

Run: `npm run dev`
Verify: Journey view loads, exercises render, at least one exercise from each type works.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: final cleanup after Journey class refactor"
```
