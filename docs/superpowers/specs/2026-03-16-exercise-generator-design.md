# Exercise Generator Design

## Problem

The journey has 20 parts (116 exercises planned) but only 5 are active. Exercise configs are verbose — each manually specifies note targets, scales, display settings, and melody events. Adding new exercises is slow and error-prone. We need a generator class that makes it easy to create exercise configs with sensible defaults.

## Scope

1. **ExerciseGenerator class** — stateless class with generic and named convenience methods that produce `JourneyExerciseInput` configs
2. **Remove `technique`** — delete `TechniqueId` and the `technique` field from `BaseExerciseConfig`; hardcode tolerance (0.03) in the two places that check it (`MelodyExercise.tsx`, `usePitchProgress.ts`)

## Unify on ChromaticDegree everywhere

Currently `ChromaticDegree` is 1-indexed (positive from bottom) while `NoteTarget.i` is 0-indexed — a constant source of off-by-one confusion. We unify on `ChromaticDegree` everywhere:

- **Positive** = chromatic degree from bottom (1-indexed, as today)
- **Negative** = from top (-1 = highest note, -2 = second highest)

Changes:
1. Update `ChromaticDegree` doc comment to note that negative values are supported
2. Change `NoteTarget.i` to use 1-indexed `ChromaticDegree` instead of 0-indexed
3. Update `Scale` resolver to handle 1-indexed `i` values (and negative)
4. Update existing exercise configs in parts 1-5 (shift `i` values by +1). Parts 6-20 are commented out — update them when uncommenting.
5. The generator passes `ChromaticDegree` values straight through — no conversion needed

## Exercise Types Produced

The generator produces 4 exercise types:

| Category | Exercise type | Methods |
|----------|--------------|---------|
| Melody | `melody` | `interval`, `scale`, `scaleDegrees`, `fifth`, `octave`, `majorScale`, `minorScale`, `pentatonic` |
| Zone | `pitch-detection` (Range targets) | `zoneBelow`, `zoneAbove`, `zoneBetween` |
| Tone-follow | `tone-follow` (lip rolls) | `lipRoll` |
| Breathwork | `breathwork-farinelli` | `farinelli` |

Hand-written configs remain for `learn`, `learn-notes-1`, and any exercise that doesn't fit the generator patterns.

## API

### Common Optional Fields

All methods accept these alongside their specific params:

```ts
interface CommonParams {
  part: number;           // required — journey part number
  title: string;          // required
  subtitle?: string;
  cardCue?: string;
  instruction: string;    // required
  introModal?: ModalConfig;
  completionModal?: ModalConfig;
}
```

### Melody Generators

**Generic methods** — full control over exercise structure:

```ts
// Interval exercise — ascending pairs across range
// chromaticDegree: 1 = unison, 2 = minor 2nd, 8 = perfect 5th, 13 = octave
interval(params: CommonParams & {
  startNote: number;
  endNote: number;
  chromaticDegree: number;
  tempo?: number;          // default 80
  noteDuration?: NoteDuration; // default Half
  minScore?: number;       // default 0 (any score passes)
})

// Scale run — ascend then descend through scale
scale(params: CommonParams & {
  startNote: number;
  endNote: number;
  scaleType: string;       // tonal.js name: "major", "minor", "chromatic", etc.
  tempo?: number;
  noteDuration?: NoteDuration;
  minScore?: number;       // default 0
})

// Scale degree patterns — root-degree-root for each degree
// e.g. do-re-do, do-mi-do, ... do-do(octave)-do
scaleDegrees(params: CommonParams & {
  startNote: number;
  endNote: number;
  scaleType?: string;      // default "major"
  tempo?: number;
  noteDuration?: NoteDuration;
  minScore?: number;       // default 0
})
```

**Named convenience methods** — predefined structure, accept overrides:

```ts
fifth(params: CommonParams & { startNote?: number; endNote?: number; tempo?: number; minScore?: number })
octave(params: CommonParams & { startNote?: number; endNote?: number; tempo?: number; minScore?: number })
majorScale(params: CommonParams & { startNote?: number; endNote?: number; tempo?: number; minScore?: number })
minorScale(params: CommonParams & { startNote?: number; endNote?: number; tempo?: number; minScore?: number })
pentatonic(params: CommonParams & { startNote?: number; endNote?: number; tempo?: number; minScore?: number })
```

Named methods delegate to generic methods:
- `fifth()` → `interval({ chromaticDegree: 8 })`
- `octave()` → `interval({ chromaticDegree: 13 })`
- `majorScale()` → `scale({ scaleType: "major" })`
- `minorScale()` → `scale({ scaleType: "minor" })`
- `pentatonic()` → `scale({ scaleType: "major pentatonic" })`

Default `startNote: 4, endNote: -4` for all named methods (comfortable range — 3 semitones from each edge).

### Zone Generators

Return `PitchDetectionExercise` configs with `Range` targets:

```ts
zoneBelow(params: CommonParams & { boundaryNote: number; seconds: number })
zoneAbove(params: CommonParams & { boundaryNote: number; seconds: number })
zoneBetween(params: CommonParams & { lowNote: number; highNote: number; seconds: number })
```

- `zoneBelow` → `accept: "below"`, range from 0 to boundary
- `zoneAbove` → `accept: "above"`, range from boundary to -1
- `zoneBetween` → `accept: "within"`, range from low to high

### Tone-Follow (Lip Rolls)

```ts
lipRoll(params: CommonParams & {
  startNote: number;
  endNote: number;
  requiredPlays: number;   // times user must play along
})
```

Returns `ToneFollowExercise` with `kind: "slide"` tone shape, chromatic scale, and major scale display notes.

### Farinelli

```ts
farinelli(params: CommonParams & { maxCount: number })
```

## DisplayNotes Generation

All melody and zone exercises auto-generate `displayNotes` so that every note between the exercise's lowest and highest target is visible on the canvas. Notes actively used in the exercise get `style: "full"`; intermediate notes get `style: "muted"`.

## Melody Event Generation

**`interval()`** — For each root stepping chromatically from `startNote` to `endNote - chromaticDegree + 1`:
1. Play chord (root + interval via `"play"` event, `Quarter` duration)
2. Pause (`Eighth` duration)
3. Sing root note
4. Sing interval note

**`scale()`** — Single `MelodyScale` with `root` derived from `startNote` and given `scaleType`. Events walk each scale degree ascending then descending, each as a `"note"` event.

**`scaleDegrees()`** — For each degree `d` in the scale (2nd through octave): generates root → degree → root pattern as note events.

## Progression Model

No "difficulty" abstraction. Part files control progression by passing different params to the same methods:

```ts
// Part 3 — beginner
gen.fifth({ startNote: 6, endNote: -6, tempo: 60, ... })

// Part 12 — intermediate
gen.fifth({ startNote: 3, endNote: -3, tempo: 90, ... })
```

## File Location

`src/constants/journey/generator.ts` — alongside types and part files.

## Usage Example

```ts
// part6.ts
import { ExerciseGenerator } from "./generator";

const gen = new ExerciseGenerator();

export const PART_6_EXERCISES: JourneyExerciseInput[] = [
  gen.fifth({
    part: 6,
    title: "Perfect Fifth — wider range",
    instruction: "Sing the two notes as they appear",
    startNote: 3,
    endNote: -3,
    tempo: 85,
  }),
  gen.zoneBelow({
    part: 6,
    title: "Low tone",
    instruction: "Keep your pitch below the boundary",
    boundaryNote: 4,
    seconds: 6,
  }),
  gen.farinelli({
    part: 6,
    title: "Farinelli breathwork",
    instruction: "Inhale, hold, exhale — each cycle adds one beat",
    maxCount: 6,
  }),
  gen.majorScale({
    part: 6,
    title: "Major scale",
    instruction: "Sing up and down the major scale",
    startNote: 4,
    endNote: -4,
    tempo: 90,
  }),
];
```

## Remove `technique`

The `technique` field currently only affects tolerance in two places (puffy-cheeks gets 0.08, everything else gets 0.03). All exercises using wider tolerance (puffy-cheeks, lip-rolls) are in parts 6-20 which are currently commented out. A separate tolerance mechanism will be introduced later. For now, hardcode 0.03.

1. Delete `TechniqueId` type and `technique` field from `BaseExerciseConfig` in `types.ts`
2. Remove all `technique` assignments from part files (1-20)
3. In `MelodyExercise.tsx:261` and `usePitchProgress.ts:69`, replace `exercise.technique === "puffy-cheeks" ? 0.08 : 0.03` with hardcoded `0.03`
