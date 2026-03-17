# Journey Class & Type Simplification

## Summary

Introduce a `Journey` class that encapsulates exercise configs (relative/unresolved types) and provides a `getExercise()` method that returns resolved, component-ready data. Convert `VocalRange` from an interface to a class that owns its own construction (absorbing color interpolation and `NOTE_PALETTE`). Simplify the type naming convention and make `ExerciseGenerator` the primary way to define exercises in chapter configs.

## Goals

1. Single entry point for all journey data access (`Journey` class)
2. `VocalRange` as a class that owns construction and note lookup
3. Clean type naming: internal `*Config` types, external `*Exercise` types
4. Simplify chapter configs by using `ExerciseGenerator` more heavily
5. Convert multi-note pitch-detection exercises to melody exercises

## Type Naming

### Internal types (config layer, not exported publicly)

These live in `constants/journey/types.ts` and represent unresolved exercise definitions with relative note targets.

| Current | New |
|---------|-----|
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

### External types (resolved, exported from Journey)

Types returned by `getExercise()`. Components consume these.

| Current | New |
|---------|-----|
| `ResolvedExercise` | `Exercise` |
| `ResolvedPitchDetection` | `PitchDetectionExercise` |
| `ResolvedPitchDetectionSlide` | `PitchDetectionSlideExercise` |
| `ResolvedToneFollow` | `ToneFollowExercise` |
| `ResolvedMelody` | `MelodyExercise` |
| `ResolvedRhythm` | `RhythmExercise` |

Sub-structures (no `Exercise` suffix):

| Current | New |
|---------|-----|
| `ResolvedPitchTarget` | `PitchTarget` |
| `ResolvedTimelineEntry` | `TimelineEntry` |
| `ResolvedBeat` | `Beat` |

### Non-resolved exercise types

Some exercise types (`learn`, `learn-notes-1`, `breathwork-farinelli`, `volume-detection`) don't go through resolution — components receive the config directly. These are re-exported from Journey with `Exercise` suffix names:

| Config name | Re-exported as |
|-------------|---------------|
| `LearnConfig` | `LearnExercise` |
| `LearnNotesConfig` | `LearnNotesExercise` |
| `FarinelliBreathworkConfig` | `FarinelliBreathworkExercise` |
| `VolumeDetectionConfig` | `VolumeDetectionExercise` |

Note: The internal `*Config` name and the external `*Exercise` name currently refer to the same underlying type for these non-resolved exercises. Both renames happen atomically to avoid collision.

## Journey Class

```ts
// constants/journey/Journey.ts (re-exported from index.ts)

class Journey {
  constructor(chapters: ChapterInput[])

  // Public API
  readonly chapters: Chapter[]
  readonly exercises: ExerciseConfig[]  // flat list with assigned IDs + intro modals

  getExercise(id: number, vocalRange: VocalRange): Exercise
  getNextExerciseId(currentId: number): number | null
}

// Exported as singleton from index.ts
export const journey = new Journey([...chapters])
```

### Responsibilities absorbed from current `index.ts`

- ID assignment (`assignIds`)
- Intro modal generation (`buildIntroModal`, `withIntroModals`)
- Building the flat exercises list (replaces `JOURNEY_EXERCISES`)
- Deriving chapters with assigned exercises (replaces `JOURNEY_CONFIG`)
- Next exercise lookup (replaces `getNextExerciseId`)

### Migration mapping

| Current import | New import |
|---------------|------------|
| `JOURNEY_CONFIG` | `journey.chapters` |
| `JOURNEY_EXERCISES` | `journey.exercises` |
| `getNextExerciseId(id)` | `journey.getNextExerciseId(id)` |
| `resolveExercise(ex, range)` | `journey.getExercise(id, range)` |

### Resolution

`getExercise(id, vocalRange)` delegates to resolution logic in `lib/resolve-exercise.ts`. The resolution module becomes an internal implementation detail — consumers never import it directly.

## VocalRange Class

`VocalRange` becomes a class at `lib/VocalRange.ts`, absorbing `getScaleNotesForRange()` from `lib/vocal-scale.ts` and `NOTE_PALETTE` from `constants/tone-slots.ts`.

```ts
// lib/VocalRange.ts

class VocalRange {
  constructor(lowHz: number, highHz: number, tuning: TuningStandard)

  readonly lowNote: string        // e.g. "C3"
  readonly highNote: string       // e.g. "C5"
  readonly allNotes: ColoredNote[]

  /** Find the closest ColoredNote by MIDI number. */
  findNote(midi: number): ColoredNote | null

  /** Build colored chromatic notes from NOTE_PALETTE. Called in constructor. */
  private colorize(): ColoredNote[]
}
```

### What it absorbs

| Current location | Absorbed into |
|-----------------|---------------|
| `NOTE_PALETTE` (`constants/tone-slots.ts`) | Private constant in `VocalRange.ts` |
| `getScaleNotesForRange()` (`lib/vocal-scale.ts`) | Private `colorize()` method |
| `lookupColoredNote()` (`lib/resolve-exercise.ts`) | Public `findNote()` method |

### Types that move

`ResolvedNote`, `ColoredNote` move from `constants/tone-slots.ts` to `lib/VocalRange.ts` and are exported from there.

### Files deleted

| File | Reason |
|------|--------|
| `lib/vocal-scale.ts` | Logic absorbed into `VocalRange.colorize()` |
| `constants/tone-slots.ts` | Types move to `VocalRange.ts`, re-exports removed (consumers import directly) |

### Migration mapping

| Current | New |
|---------|-----|
| `getScaleNotesForRange(lowHz, highHz, tuning)` + manual object | `new VocalRange(lowHz, highHz, tuning)` |
| `import { ColoredNote } from "@/constants/tone-slots"` | `import { ColoredNote } from "@/lib/VocalRange"` |
| `import { VocalRange } from "@/constants/tone-slots"` | `import { VocalRange } from "@/lib/VocalRange"` |
| `lookupColoredNote(midi, allNotes)` in `resolve-exercise.ts` | `vocalRange.findNote(midi)` |

### Consumer sites

- `components/JourneyView/components/JourneyExercise.tsx` — `new VocalRange(lowHz, highHz, tuning)`
- `components/TrainView.tsx` — `new VocalRange(lowHz, highHz, tuning)`
- `lib/resolve-exercise.test.ts` — `new VocalRange(131, 523, "A440")`
- `lib/resolve-exercise.ts` — uses `vocalRange.findNote()` instead of local `lookupColoredNote()`

## ExerciseGenerator Changes

### File rename

`generator.ts` -> `exercise-generator.ts`

### New `sustain()` method

For single-note BalanceBall exercises (the most common pattern in chapters 1-2):

```ts
interface SustainParams extends CommonParams {
  note: number;        // ChromaticDegree — used as scale root, target is always i: 1
  seconds: number;
  repeats?: number;    // default 3
  toneShape?: ToneShape;
}

sustain(params: SustainParams): ExerciseConfigInput
// Produces a pitch-detection config with:
//   scale: { type: "chromatic", root: note }
//   notes: [{ target: { kind: Index, i: 1 }, seconds }] repeated `repeats` times
```

### New `lipRollSustain()` method

For tone-follow sustain exercises:

```ts
interface LipRollSustainParams extends CommonParams {
  note: number;        // ChromaticDegree — scale root, target is i: 1
  seconds: number;
  requiredPlays: number;
}

lipRollSustain(params: LipRollSustainParams): ExerciseConfigInput
// Produces a tone-follow config with:
//   scale: { type: "chromatic", root: note }
//   toneShape: { kind: "sustain", target: { kind: Index, i: 1 }, seconds }
//   displayNotes: []
```

## Chapter Config Simplification

### Multi-note pitch-detection -> melody

These exercises have sequential note targets held for N seconds each. Converting them to melody exercises changes the UX from time-based completion (hold each note for N seconds) to tempo-based scoring (sing along to scrolling notes). This is intentional — melody exercises provide a better experience for sequential pitch work.

**Exercises to convert:**

Chapter 1:
- "Hum — mid-low" (3 × same note at root 4) — stays as `sustain()` since single note repeated

Chapter 2:
- "Hum — low to mid" (3 rising notes: i:1, i:4, i:7)
- "U — low to mid" (3 rising notes: i:1, i:4, i:7)
- "Hum sequence" (3 rising notes: i:1, i:3, i:5)
- "U sequence" (3 rising notes: i:1, i:3, i:5)

### Single-note pitch-detection -> generator.sustain()

**Exercises to convert:**

Chapter 1:
- "Gentle hum" — `sustain({ note: 1, seconds: 5 })`
- "Hoo hoo" — `zoneAbove({ boundaryNote: -6, seconds: 5 })`
- "Simple U" — `sustain({ note: 1, seconds: 6 })`
- "Hum — mid-low" — `sustain({ note: 4, seconds: 5 })`
- "U — mid-low" — `sustain({ note: 4, seconds: 6 })`
- "Hum — mid" — `sustain({ note: 7, seconds: 6 })`

Chapter 2 warmup:
- "Gentle hum" — `sustain({ note: 1, seconds: 5, repeats: 2 })`

Chapter 2:
- "Hum — mid" — `sustain({ note: 7, seconds: 8 })`
- "U — mid" — `sustain({ note: 7, seconds: 8 })`

### Tone-follow exercises -> generator

Chapter 1:
- "Lip roll slide" — `lipRoll({ startNote: 1, endNote: -1, requiredPlays: 3 })`
- "Lip roll sustain" — `lipRollSustain({ note: 5, seconds: 5, requiredPlays: 3 })`

Chapter 2 warmup:
- "Lip rolls — low to high" — `lipRoll({ startNote: 1, endNote: -1, requiredPlays: 2 })`

Chapter 2:
- "Lip rolls — high to low" — `lipRoll({ startNote: -1, endNote: 1, requiredPlays: 3 })`
- "Lip roll sustain" — `lipRollSustain({ note: 7, seconds: 6, requiredPlays: 3 })`

### Breathwork exercises -> generator

Chapter 1:
- "Farinelli breathwork" — `farinelli({ maxCount: 5 })`

Chapter 2 warmup:
- "Farinelli breathwork" — `farinelli({ maxCount: 5 })`

Chapter 2:
- "Farinelli breathwork" — `farinelli({ maxCount: 7 })`

### What stays inline

Volume-detection exercises stay inline — they're already minimal. Any exercise with unique structure or one-off config can remain inline.

## File Changes

| File | Change |
|------|--------|
| `constants/journey/types.ts` | Rename types to `*Config` naming |
| `constants/journey/generator.ts` | Rename to `exercise-generator.ts`, add `sustain()`, `lipRollSustain()` |
| `constants/journey/index.ts` | Re-export from `Journey.ts`, export singleton |
| `constants/journey/Journey.ts` | New file — `Journey` class |
| `constants/journey/chapter1.ts` | Use generator, convert multi-note to melody |
| `constants/journey/chapter2.ts` | Same |
| `lib/VocalRange.ts` | New file — `VocalRange` class, `ColoredNote`, `ResolvedNote` types |
| `lib/resolve-exercise.ts` | Rename types, use `vocalRange.findNote()` instead of local helper |
| `lib/vocal-scale.ts` | Delete — absorbed into `VocalRange.colorize()` |
| `constants/tone-slots.ts` | Delete — types moved to `VocalRange.ts`, re-exports removed |
| `components/Exercise/BaseExercise.tsx` | Use `journey.getExercise()` instead of `resolveExercise` |
| `components/Exercise/PitchExercise/PitchExercise.tsx` | Update type imports |
| `components/Exercise/PitchExercise/usePitchProgress.ts` | Update type imports |
| `components/Exercise/MelodyExercise.tsx` | Update type imports |
| `components/Exercise/RhythmExercise.tsx` | Update type imports |
| `components/Exercise/RhythmCanvas.tsx` | Update type imports |
| `components/Exercise/ToneFollowExercise.tsx` | Update type imports |
| `components/JourneyView/components/JourneyExercise.tsx` | Use `new VocalRange()`, `journey.*` |
| `components/TrainView.tsx` | Use `new VocalRange()` |
| All files importing from `@/constants/tone-slots` | Import from `@/lib/VocalRange` or direct sources |

## Architecture

```
Consumers (components)
    │
    ▼
journey.getExercise(id, vocalRange) → Exercise (PitchDetectionExercise | MelodyExercise | ...)
    │
    ├── internally: looks up ExerciseConfig by id
    └── internally: delegates to lib/resolve-exercise.ts
                        │
                        └── uses lib/scale.ts, lib/VocalRange.ts

new VocalRange(lowHz, highHz, tuning)
    │
    ├── colorize() — builds ColoredNote[] from NOTE_PALETTE
    └── findNote(midi) — lookup by MIDI number

Chapter files (chapter1.ts, chapter2.ts)
    │
    ├── use ExerciseGenerator for common patterns
    └── inline configs for unique exercises
    │
    ▼
Journey constructor
    │
    ├── assigns IDs
    ├── generates intro modals
    └── builds flat exercise list
```
