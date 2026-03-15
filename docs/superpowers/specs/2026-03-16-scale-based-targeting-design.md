# Scale-Based Targeting & Slot Removal

## Context

Exercises target notes using `BandTarget`, a discriminated union with three kinds: `slot` (7 evenly-spaced reference points), `index` (position in a note array), and `range` (inclusive span). The `slot` kind is tightly coupled to a hardcoded 7-slot system (`Slot`, `SlotId`, `SLOTS`, `SLOT_ORDER` in `tone-slots.ts`) that doesn't compose with the scale-based system melody exercises already use.

This spec removes `slot`, makes every exercise declare its own scale, and renames the core types for clarity.

## Design

### New types

**`ChromaticDegree`** — type alias for `number`. Semantics: 1-indexed chromatic degree from the user's lowest note (1 = lowest, 12 = 11 semitones above, etc.).

```ts
type ChromaticDegree = number;
```

**`BandTargetKind`** — string enum replacing string literal discriminant:

```ts
enum BandTargetKind {
  Index = "index",
  Range = "range",
}
```

**`NoteTarget`** (renamed from `BandTarget`) — drops `slot`:

```ts
type NoteTarget =
  | { kind: BandTargetKind.Index; i: number }
  | {
      kind: BandTargetKind.Range;
      from: number;
      to: number;
      accept?: "within" | "below" | "above";
    };
```

**`BaseScale`** — shared scale interface:

```ts
interface BaseScale {
  /** Tonal.js scale name or custom identifier (e.g. "even-7-from-major"). */
  type: string;
  /** 1-indexed chromatic degree from user's lowest note. */
  root: ChromaticDegree;
}
```

**`MelodyScale`** extends `BaseScale`:

```ts
interface MelodyScale extends BaseScale {
  events: MelodyEvent[];
}
```

**`ResolvedNote`** (renamed from `Band`) — drops `isSlot`, `slotId`, and color fields. Represents a resolved note from a scale without visual styling:

```ts
interface ResolvedNote {
  id: string;
  midi: number;
  frequencyHz: number;
  note: string;
  octave: number;
  name: string;
}
```

**`ColoredNote`** — extends `ResolvedNote` with color. Used by `VocalRange` and canvas components:

```ts
interface ColoredNote extends ResolvedNote {
  color: string;
  rgb: string;
}
```

### Exercise type changes

`PitchDetectionExercise` gains `scale: BaseScale`:

```ts
interface PitchDetectionExercise extends BaseExerciseConfig {
  exerciseTypeId: "pitch-detection";
  scale: BaseScale;
  notes: SustainNoteConfig[];
  instruction: string;
}
```

`PitchDetectionSlideExercise` gains `scale: BaseScale` and optional `displayNotes`:

```ts
interface PitchDetectionSlideExercise extends BaseExerciseConfig {
  exerciseTypeId: "pitch-detection-slide";
  scale: BaseScale;
  notes: SlideConfig[];
  displayNotes?: DisplayScale[];
  instruction: string;
}
```

`ToneFollowExercise` gains `scale: BaseScale` and optional `displayNotes`:

```ts
interface ToneFollowExercise extends BaseExerciseConfig {
  exerciseTypeId: "tone-follow";
  scale: BaseScale;
  toneShape: ToneFollowShape;
  displayNotes?: DisplayScale[];
  requiredPlays: number;
  instruction: string;
}
```

`MelodyExercise` — unchanged (already has scale info via `MelodyScale[]`).

### Rename: `BandTarget` → `NoteTarget`, `Band` → `ResolvedNote`

All references throughout the codebase update:

- `BandTarget` → `NoteTarget`
- `Band` → `ResolvedNote` (colorless) / `ColoredNote` (with color, extends `ResolvedNote`)
- `resolveBandTarget` → `Scale.resolve` (method, not standalone function)
- `matchesBandTarget` → `matchesNoteTarget`
- `findClosestBand` → `findClosestNote`
- `isInBandRange` → `isInNoteRange`
- `VocalRange.allBands` → `VocalRange.allNotes`

Types that reference `BandTarget` and update to `NoteTarget`:

- `SustainNoteConfig` — `target: NoteTarget`
- `SlideConfig` — `from: NoteTarget; to: NoteTarget`
- `ToneFollowShape` — `from`/`to`/`target` fields become `NoteTarget`
- `MelodyEvent` — `target` and `targets` fields become `NoteTarget`
- `DisplayNote` — `target: NoteTarget`

### Scale type: `even-7-from-major`

A custom scale type that preserves exact current slot behavior: build all major scale notes across the vocal range, then pick 7 at evenly-spaced array indices (`Math.round(i * (N-1) / 6)` for i=0..6). Handled in `buildScaleForRange`.

### `Scale` class

A class that encapsulates note pool construction, target resolution, and colorization:

```ts
class Scale {
  /** All notes in this scale, sorted low → high. */
  readonly notes: ResolvedNote[];

  constructor(definition: BaseScale, vocalRange: VocalRange);

  /** Pick specific note(s) by index or range. */
  resolve(target: NoteTarget): ResolvedNote[];

  /** Map colors from VocalRange onto the scale's notes. */
  colorize(): ColoredNote[];
}
```

- **Constructor** builds the note pool from the scale definition + vocal range (replaces `buildScaleForRange`)
- **`resolve`** selects from the pool by index/range (replaces `resolveNoteTarget` / `resolveBandTarget`)
- **`colorize`** looks up each note's color by midi from `vocalRange.allNotes` (replaces `colorizeNotes`)
- **`notes`** exposes the full pool for pitch detection logic

This eliminates `buildScaleForRange`, `resolveNoteTarget`/`resolveBandTarget`, and `colorizeNotes` as standalone functions.

### Color assignment

Colors are a property of the user's vocal range, not the exercise's scale. A given note (e.g. C3) always has the same color for a given user, regardless of which exercise is playing.

**`VocalRange.allNotes`** is `ColoredNote[]` — `getScaleNotesForRange` assigns colors across the range using the existing 7-color palette with interpolation (same as current behavior). This is the single source of truth for note colors.

**`Scale.colorize()`** looks up each note's color by midi from `vocalRange.allNotes`. Fallback for notes not in the vocal range: interpolate from nearest colored notes.

### `getScaleNotesForRange` consolidation

`getScaleNotesForRange` is kept but simplified: it uses `Scale` internally with `"even-7-from-major"`. It remains the entry point for `VocalRange.allNotes` construction (used by `TrainView` and `JourneyExercise` to build the default vocal range).

### Exercise config migration

**Former slot exercises** (parts 3–20) get `scale: { type: "even-7-from-major", root: 1 }`. Slot `n` becomes `{ kind: BandTargetKind.Index, i: n - 1 }`:

```ts
// Before
{ target: { kind: "slot", n: 3 }, seconds: 6 }

// After
scale: { type: "even-7-from-major", root: 1 },
{ target: { kind: BandTargetKind.Index, i: 2 }, seconds: 6 }
```

**Range exercises** (part 2 Low U, part 3 Low hum) get a chromatic scale:

```ts
// Before
notes: [{ target: { kind: "range", from: 0, to: 2, accept: "below" }, seconds: 5 }]

// After
scale: { type: "chromatic", root: 1 },
notes: [{ target: { kind: BandTargetKind.Range, from: 0, to: 2, accept: "below" }, seconds: 5 }]
```

**Slide / tone-follow exercises** get a chromatic scale plus `displayNotes` with major scale reference lines:

```ts
// Before
toneShape: { kind: "slide", from: { kind: "index", i: -1 }, to: { kind: "index", i: 0 } }

// After
scale: { type: "chromatic", root: 1 },
displayNotes: [{ type: "major", root: 1, notes: [
  { target: { kind: BandTargetKind.Index, i: 0 }, style: "full" },
  // ... major scale degrees
]}],
toneShape: { kind: "slide", from: { kind: BandTargetKind.Index, i: -1 }, to: { kind: BandTargetKind.Index, i: 0 } }
```

**Melody exercises** — update `kind` string literals to `BandTargetKind` enum values.

### Runtime changes

**`Scale` class** (new, in `src/lib/scale.ts`) — encapsulates pool building, target resolution, and colorization. Replaces standalone `buildScaleForRange`, `resolveBandTarget`, and the proposed `colorizeNotes`. Handles `"even-7-from-major"` and delegates to tonal.js for standard scale types.

**`pitch.ts`** — standalone pitch utilities (`findClosestNote`, `isInTune`, `isInNoteRange`, `matchesNoteTarget`, `pitchConfidence`) remain as free functions. They operate on `ResolvedNote[]` and don't need scale context. `resolveBandTarget` is removed (replaced by `Scale.resolve`). Remove slot branch from `matchesNoteTarget`.

**Exercise components** (`PitchExercise`, `ToneFollowExercise`) — construct `new Scale(exercise.scale, vocalRange)`. Use `scale.resolve(target)` for pitch detection, `scale.colorize()` for canvas rendering.

**`MelodyExercise`** — constructs a `Scale` per `MelodyScale` segment (same pattern, `MelodyScale extends BaseScale`).

**`JourneyView/utils.ts`** — `getExerciseDisplayColors` uses `Scale` to derive colors. `getExerciseSlot` and `getExerciseSlotIds` removed.

**`tone-slots.ts`** — `Slot`, `SlotId`, `SLOTS`, `SLOT_ORDER` removed. The 7-color palette is kept as a standalone constant (e.g. `NOTE_PALETTE`). `ResolvedNote` and `ColoredNote` interfaces live here. `VocalRange.allBands` → `VocalRange.allNotes: ColoredNote[]`.

## Files to modify

| File                                                          | Change                                                                                                                                                                                                                                 |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/constants/journey/types.ts`                              | Add `ChromaticDegree`, `BandTargetKind`, `BaseScale`. Rename `BandTarget` → `NoteTarget`, remove `slot`. Add `scale` to exercise types. `MelodyScale extends BaseScale`.                                                               |
| `src/constants/tone-slots.ts`                                 | Remove `Slot`, `SlotId`, `SLOTS`, `SLOT_ORDER`. Replace `Band` with `ResolvedNote` + `ColoredNote`, drop `isSlot`/`slotId`. Keep 7-color palette as `NOTE_PALETTE`. `VocalRange.allBands` → `allNotes: ColoredNote[]`. Update re-exports. |
| `src/lib/scale.ts`                                            | New file: `Scale` class with constructor, `resolve`, `colorize`. Handles `"even-7-from-major"` and tonal.js scale types.                                                                                                               |
| `src/lib/pitch.ts`                                            | Remove `resolveBandTarget` (moved to `Scale.resolve`). Rename remaining functions: `Band` → `ResolvedNote`, `findClosestBand` → `findClosestNote`, etc. Remove slot branch from `matchesNoteTarget`.                                    |
| `src/lib/vocal-scale.ts`                                      | Simplify `getScaleNotesForRange` to use `Scale` internally. Remove `buildScaleForRange` (moved to `Scale` constructor).                                                                                                                |
| `src/constants/journey/part2.ts` – `part20.ts`                | Migrate slot targets to index with `scale`. Add `scale` to range/slide exercises. Update `kind` strings to enum.                                                                                                                       |
| `src/constants/journey/index.ts`                              | Update exports.                                                                                                                                                                                                                        |
| `src/components/Exercise/PitchExercise/PitchExercise.tsx`     | Construct `Scale` from `exercise.scale`. Use `scale.resolve()` + `scale.colorize()`. `Band` → `ColoredNote`/`ResolvedNote`.                                                                                                           |
| `src/components/Exercise/PitchExercise/usePitchProgress.ts`   | `Band` → `ResolvedNote` (pitch detection doesn't need color).                                                                                                                                                                             |
| `src/components/Exercise/ToneFollowExercise.tsx`              | Construct `Scale`, use `scale.resolve()` + `scale.colorize()`, add `displayNotes` support.                                                                                                                                             |
| `src/components/Exercise/MelodyExercise.tsx`                  | Update `kind` strings to enum, `Band` → `ColoredNote`/`ResolvedNote`.                                                                                                                                                                     |
| `src/components/PitchCanvas.tsx`                              | `Band` → `ColoredNote` (needs color for rendering).                                                                                                                                                                                    |
| `src/components/HillBallCanvas.tsx`                           | `Band` → `ColoredNote`.                                                                                                                                                                                                                |
| `src/components/BalanceBallCanvas.tsx`                        | `Band` → `ColoredNote`.                                                                                                                                                                                                                |
| `src/components/JourneyView/utils.ts`                         | Remove slot-based color/id logic (`getExerciseSlot`, `getExerciseSlotIds`), derive colors from scale.                                                                                                                                  |
| `src/components/JourneyView/JourneyView.tsx`                  | `Band` → `ColoredNote` in props.                                                                                                                                                                                                       |
| `src/components/JourneyView/components/JourneyExercise.tsx`   | `Band` → `ColoredNote`, `allBands` → `allNotes`.                                                                                                                                                                                       |
| `src/components/JourneyView/components/ExerciseCard.tsx`      | Update `getExerciseDisplayColors` call (signature may change).                                                                                                                                                                         |
| `src/components/JourneyView/components/ExerciseInfoModal.tsx` | Update `getExerciseDisplayColors` call (signature may change).                                                                                                                                                                         |
| `src/components/TrainView.tsx`                                | `Band` → `ColoredNote`, `allBands` → `allNotes`.                                                                                                                                                                                       |
| `src/components/AppShell/AppShell.tsx`                        | `Band` → `ColoredNote` in callbacks (`playTone`, `playSlide`).                                                                                                                                                                         |
| `src/context/AppContext.tsx`                                  | `Band` → `ColoredNote` in context type.                                                                                                                                                                                                |
| `src/components/Exercise/BaseExercise.tsx`                    | `Band` → `ColoredNote` in props.                                                                                                                                                                                                       |
| `src/components/Exercise/LearnNotesExercise.tsx`              | `Band` → `ColoredNote`.                                                                                                                                                                                                                |
| `src/components/HillBallCanvas.stories.tsx`                   | `Band` → `ColoredNote` in story data.                                                                                                                                                                                                  |
| `src/components/BalanceBallCanvas.stories.tsx`                | `Band` → `ColoredNote` in story data.                                                                                                                                                                                                  |
| `specs/exercise-config-flow.md`                               | Update to reflect new types and slot removal.                                                                                                                                                                                          |

## What does NOT change

- Scale building core logic (tonal.js scale resolution) — unchanged, moved into `Scale` class and extended with `"even-7-from-major"`
- `MelodyExercise` structure — already scale-based, only `kind` strings update to enum
- PitchCanvas rendering logic — same, just renamed types
- Scoring logic — unchanged
- `usePianoSampler` — unchanged
- `VoiceType` / voice detection — unchanged
- `DisplayNote` / `DisplayScale` — structure unchanged (already used by melody, now shared with slide/tone-follow); `DisplayNote.target` type updates from `BandTarget` to `NoteTarget`

## Verification

1. `npx tsc --noEmit` — no type errors
2. Run dev server, verify all exercise types work:
   - Pitch detection (single note, sequence, range) — parts 2–20
   - Slides (tone-follow) — parts 2, 3, 7, 10, 14, 15, 17, 20
   - Melody (Perfect Fifth) — part 2
3. Verify `getExerciseDisplayColors` produces correct card strip colors
4. Verify Storybook builds (`npm run storybook`)
5. Grep for any remaining `"slot"`, `isSlot`, `slotId`, `BandTarget`, `Band` references
