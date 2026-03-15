# Melody Scale Support

## Context

Melody exercises are locked to the major scale derived from the user's vocal range. The `BandTarget` system (`slot`, `index`, `range`) resolves against `allBands` — always a major scale rooted at the user's lowest note. This prevents authoring melodies with minor scales, chromatic patterns, pentatonic scales, or othOkayer scale types.

This spec adds per-exercise scale configuration to melody exercises and introduces `VocalRange` as a cleaner way to pass vocal range data to exercises.

A broader rethink of the `Band` type across all exercise types is deferred.

## Design

### `melody` becomes `MelodyScale[]`

Instead of a flat `MelodyNoteConfig[]`, `melody` is a list of **scale segments**. Each segment defines its own scale type and root. Notes within a segment resolve their `index` targets against that segment's note pool.

**Only `index` and `range` targets are supported inside scale segments.** `slot` targets are tied to the user's full vocal range and are not meaningful inside a custom scale pool. Existing exercises using `slot` targets must be migrated to `index` targets when wrapped in a `MelodyScale`.

```ts
interface MelodyScale {
  type: string; // tonal scale name: "major", "minor", "chromatic", "pentatonic"...
  root: number; // 1-12, chromatic degree from user's lowest note (1 = user's lowest)
  notes: MelodyNoteConfig[]; // targets resolved against THIS scale's note pool
}

interface MelodyExercise extends BaseExerciseConfig {
  exerciseTypeId: "melody";
  melody: MelodyScale[]; // was MelodyNoteConfig[]
  backingTrack?: MelodyScale[]; // same structure — not scored, audio only
  minScore: number;
  instruction: string;
}
```

### How `root` works

`root` is a 1-indexed chromatic degree from the user's lowest detected note:

- `root: 1` = user's lowest note (e.g. if low is C3, root = C3)
- `root: 3` = 2 semitones above (e.g. D3)
- `root: 8` = 7 semitones above (e.g. G3)

The scale `type` is applied from that root note. Only notes within the user's vocal range are included in the pool.

### `VocalRange` replaces `allBands` prop

```ts
interface VocalRange {
  lowNote: string; // e.g. "C3"
  highNote: string; // e.g. "C5"
  /** Major scale bands with 7 slots — default note pool for non-melody exercises. */
  allBands: Band[];
}
```

- JourneyExercise builds this object: converts `settings.vocalRangeLowHz`/`highHz` to note names via `hzToNoteName`, builds `allBands` as today.
- BaseExercise receives `vocalRange: VocalRange` instead of `allBands: Band[]`.
- Existing exercises use `vocalRange.allBands` — no behavior change.
- MelodyExercise uses `vocalRange.lowNote`/`highNote` for building custom scale pools. No Hz values in the exercise flow.

### Scale pool construction

New function `buildScaleForRange(lowNote, highNote, scaleType, root)` in `vocal-scale.ts`:

1. Compute root MIDI: `Note.midi(lowNote) + (root - 1)`
2. Get pitch classes from tonal: `Scale.get(rootNoteName + " " + scaleType).notes`
3. Collect all matching MIDI notes from root through `Note.midi(highNote)`
4. Convert to `Band[]` with cycling slot colors (all bands have `isSlot: false`, id/name = `"${noteName}${octave}"`)
5. If the scale + root + range produces fewer than 2 notes, fall back to chromatic fill (same pattern as existing `buildScaleMidi`)

### Timeline resolution

MelodyExercise iterates `exercise.melody` as `MelodyScale[]`. For each segment:

1. Build a local `Band[]` via `buildScaleForRange(vocalRange.lowNote, vocalRange.highNote, segment.type, segment.root)`
2. Resolve each note's `BandTarget` against that local `Band[]` using existing `resolveBandTarget()`
3. Append resolved timeline entries (with cumulative timing across segments)

Display bands derivation stays the same — collected from resolved melody notes ±1 neighbor.

## Config examples

**Minor scale:**

```ts
melody: [
  {
    type: "minor",
    root: 1,
    notes: [
      { target: { kind: "index", i: 0 }, seconds: 1.5 },
      { target: { kind: "index", i: 1 }, seconds: 1.5 },
      { target: { kind: "index", i: 2 }, seconds: 1.5 },
      { target: { kind: "index", i: 3 }, seconds: 1.5 },
      { target: { kind: "index", i: 4 }, seconds: 1.5 },
    ],
  },
];
```

**Chromatic with specific intervals:**

```ts
melody: [
  {
    type: "chromatic",
    root: 1,
    notes: [
      { target: { kind: "index", i: 0 }, seconds: 1 },
      { target: { kind: "index", i: 3 }, seconds: 1 },
      { target: { kind: "index", i: 7 }, seconds: 1 },
    ],
  },
];
```

**Two scales in one melody:**

```ts
melody: [
  {
    type: "minor",
    root: 1,
    notes: [
      { target: { kind: "index", i: 0 }, seconds: 1.5 },
      { target: { kind: "index", i: 2 }, seconds: 1.5 },
    ],
  },
  {
    type: "major",
    root: 5,
    notes: [
      { target: { kind: "index", i: 0 }, seconds: 1.5 },
      { target: { kind: "index", i: 2 }, seconds: 1.5 },
    ],
  },
];
```

**Migrated existing Perfect Fifth:**

```ts
melody: [
  {
    type: "major",
    root: 1,
    notes: [
      { target: { kind: "index", i: 0 }, seconds: 2 }, // root
      { target: { kind: "index", i: 4 }, seconds: 2 }, // perfect 5th
    ],
  },
];
```

## Files to modify

| File                                                        | Change                                                                         |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `src/constants/journey/types.ts`                            | Add `MelodyScale` interface; change `MelodyExercise.melody` to `MelodyScale[]` |
| `src/constants/tone-slots.ts`                               | Add `VocalRange` interface                                                     |
| `src/lib/vocal-scale.ts`                                    | Add `buildScaleForRange()` function                                            |
| `src/components/Exercise/BaseExercise.tsx`                  | Replace `allBands: Band[]` with `vocalRange: VocalRange`                       |
| `src/components/Exercise/MelodyExercise.tsx`                | Accept `VocalRange`; iterate `MelodyScale[]` with per-segment scale building   |
| `src/components/Exercise/PitchExercise.tsx`                 | Accept `VocalRange`, use `.allBands`                                           |
| `src/components/Exercise/ToneFollowExercise.tsx`            | Accept `VocalRange`, use `.allBands`                                           |
| `src/components/Exercise/LearnNotesExercise.tsx`            | Accept `VocalRange`, use `.allBands`                                           |
| `src/components/JourneyView/components/JourneyExercise.tsx` | Build `VocalRange` from settings + `allBands`                                  |
| `src/constants/journey/part2.ts`                            | Migrate Perfect Fifth to `MelodyScale[]` format                                |

## What does NOT change

- `BandTarget` union — no new kinds
- `Band` type — unchanged (rethink deferred)
- `resolveBandTarget()` — unchanged, called with different `Band[]`
- `getScaleNotesForRange()` — still builds `allBands` inside `VocalRange`
- PitchCanvas — accepts any `Band[]`, positions by frequency
- `isInTune` scoring — compares Hz values
- Piano sampler — needs `frequencyHz`
- `backingTrack` — now also `MelodyScale[]` (same as `melody`), so it can match the melody's scale. Still not scored and not rendered on canvas — audio only

## Verification

1. Migrate existing Perfect Fifth exercise to new format — verify unchanged behavior
2. Add a test melody exercise with `type: "minor"` + index targets
3. Add a test melody exercise with `type: "chromatic"`
4. Verify all non-melody exercises still work (prop rename only)
5. `npm run dev` — notes play at correct pitches, rectangles render, scoring works
6. `npx tsc --noEmit` — no type errors
