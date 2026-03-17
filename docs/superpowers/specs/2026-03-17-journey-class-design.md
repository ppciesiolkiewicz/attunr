# Journey Class & Type Simplification

## Summary

Introduce a `Journey` class that encapsulates exercise configs (relative/unresolved types) and provides a `getExercise()` method that returns resolved, component-ready data. Simplify the type naming convention and make `ExerciseGenerator` the primary way to define exercises in chapter configs.

## Goals

1. Single entry point for all journey data access (`Journey` class)
2. Clean type naming: internal `*Config` types, external `*Exercise` types
3. Simplify chapter configs by using `ExerciseGenerator` more heavily
4. Convert multi-note pitch-detection exercises to melody exercises

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

These are what `getExercise()` returns. Components consume these types.

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

## Journey Class

```ts
// constants/journey/index.ts (or Journey.ts)

class Journey {
  constructor(chapters: ChapterInput[])

  // Public API
  readonly chapters: Chapter[]
  readonly exercises: ExerciseConfig[]  // flat list with assigned IDs + intro modals

  getExercise(id: number, vocalRange: VocalRange): Exercise
}

// Exported as singleton
export const journey = new Journey([...chapters])
```

### Responsibilities absorbed from current `index.ts`

- ID assignment (`assignIds`)
- Intro modal generation (`buildIntroModal`, `withIntroModals`)
- Building the flat `JOURNEY_EXERCISES` list
- Deriving `JOURNEY_CONFIG` (chapters with assigned exercises)

### Resolution

`getExercise(id, vocalRange)` delegates to resolution logic that stays in `lib/resolve-exercise.ts`. The resolution module becomes an internal implementation detail — consumers never import it directly.

## ExerciseGenerator Changes

### File rename

`generator.ts` -> `exercise-generator.ts`

### New `sustain()` method

For single-note BalanceBall exercises (the most common pattern in chapters 1-2):

```ts
interface SustainParams extends CommonParams {
  note: number;        // ChromaticDegree
  seconds: number;
  repeats?: number;    // default 3
  toneShape?: ToneShape;
}

sustain(params: SustainParams): ExerciseConfigInput
// Produces a pitch-detection config with a single Index target repeated `repeats` times
```

## Chapter Config Simplification

### Multi-note pitch-detection -> melody

Exercises like "Hum — low to mid" (3 rising notes at i:1, i:4, i:7) become melody exercises instead of pitch-detection, since they're sequential note targets.

### Single-note pitch-detection -> generator.sustain()

Exercises like "Gentle hum" (hold note i:1 for 5s, 3 times) use the new `sustain()` method instead of inline config.

### What stays inline

Not every exercise must use the generator. Exercises with unique structure or one-off configs can remain inline.

## File Changes

| File | Change |
|------|--------|
| `constants/journey/types.ts` | Rename types to `*Config` naming |
| `constants/journey/generator.ts` | Rename to `exercise-generator.ts`, add `sustain()` |
| `constants/journey/index.ts` | Replace exports with `Journey` class + singleton |
| `constants/journey/chapter1.ts` | Use generator, convert multi-note to melody |
| `constants/journey/chapter2.ts` | Same |
| `lib/resolve-exercise.ts` | Rename exported types (drop `Resolved` prefix, add `Exercise` suffix) |
| Components + hooks importing resolved types | Update import names |
| `BaseExercise.tsx` | Import from Journey instead of `resolveExercise` directly |

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
                        └── uses lib/scale.ts, constants/tone-slots.ts

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
