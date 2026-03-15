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
  | { kind: BandTargetKind.Range; from: number; to: number; accept?: "within" | "below" | "above" };
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

**`ScaleNote`** (renamed from `Band`) — drops `isSlot` and `slotId`:

```ts
interface ScaleNote {
  id: string;
  midi: number;
  frequencyHz: number;
  note: string;
  octave: number;
  color: string;
  rgb: string;
  name: string;
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

### Rename: `BandTarget` → `NoteTarget`, `Band` → `ScaleNote`

All references throughout the codebase update:

- `BandTarget` → `NoteTarget`
- `Band` → `ScaleNote`
- `resolveBandTarget` → `resolveNoteTarget`
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

### Color assignment

`buildScaleForRange` assigns colors to `ScaleNote` entries. The existing 7-color palette (`SLOTS` colors) is kept as a constant (no longer tied to slot identity). Color strategy per scale type:

- **`even-7-from-major`** — 7 notes, each gets one of the 7 palette colors in order (same as current slots).
- **`major` and other diatonic scales** — cycle through the 7-color palette (`idx % 7`), same as current `buildScaleForRange` behavior.
- **`chromatic`** — interpolate colors between the 7 palette anchors across the full note array, same as current `getScaleNotesForRange` interpolation logic.

### `getScaleNotesForRange` consolidation

`getScaleNotesForRange` is kept but simplified: it delegates to `buildScaleForRange("even-7-from-major", ...)` internally. It remains the entry point for `VocalRange.allNotes` construction (used by `TrainView` and `JourneyExercise` to build the default vocal range). Exercise components with an explicit `scale` field call `buildScaleForRange` directly.

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

**`resolveNoteTarget`** (in `pitch.ts`) — remove slot branch, use `BandTargetKind` enum. Signature: `(target: NoteTarget, notes: ScaleNote[]) => ScaleNote[]`.

**`buildScaleForRange`** (in `vocal-scale.ts`) — add `"even-7-from-major"` handler that extracts current `getScaleNotesForRange` logic. Returns `ScaleNote[]` without slot metadata.

**Exercise components** (`PitchExercise`, `ToneFollowExercise`) — switch from `vocalRange.allNotes` to `buildScaleForRange(lowNote, highNote, exercise.scale.type, exercise.scale.root)` for their note pool.

**`JourneyView/utils.ts`** — `getExerciseDisplayColors` derives colors from the exercise's resolved scale notes instead of slot lookups. `getExerciseSlot` and `getExerciseSlotIds` removed or reworked.

**`tone-slots.ts`** — `Slot`, `SlotId`, `SLOTS`, `SLOT_ORDER` removed. `ScaleNote` interface lives here (or moves to a new file). `VocalRange.allBands` → `VocalRange.allNotes`.

## Files to modify

| File | Change |
|------|--------|
| `src/constants/journey/types.ts` | Add `ChromaticDegree`, `BandTargetKind`, `BaseScale`. Rename `BandTarget` → `NoteTarget`, remove `slot`. Add `scale` to exercise types. `MelodyScale extends BaseScale`. |
| `src/constants/tone-slots.ts` | Remove `Slot`, `SlotId`, `SLOTS`, `SLOT_ORDER`. Rename `Band` → `ScaleNote`, drop `isSlot`/`slotId`. `VocalRange.allBands` → `allNotes`. Update re-exports (`resolveBandTarget` → `resolveNoteTarget`, etc.). |
| `src/lib/pitch.ts` | Rename functions and types: `resolveBandTarget` → `resolveNoteTarget`, `Band` → `ScaleNote`, etc. Remove slot branch. Use `BandTargetKind` enum. |
| `src/lib/vocal-scale.ts` | Add `"even-7-from-major"` to `buildScaleForRange`. Remove slot metadata from output. Rename `Band` → `ScaleNote`. |
| `src/constants/journey/part2.ts` – `part20.ts` | Migrate slot targets to index with `scale`. Add `scale` to range/slide exercises. Update `kind` strings to enum. |
| `src/constants/journey/index.ts` | Update exports. |
| `src/components/Exercise/PitchExercise/PitchExercise.tsx` | Use `exercise.scale` to build note pool. Rename `Band` → `ScaleNote`. |
| `src/components/Exercise/PitchExercise/usePitchProgress.ts` | Rename `Band` → `ScaleNote`. |
| `src/components/Exercise/ToneFollowExercise.tsx` | Use `exercise.scale`, add `displayNotes` support, rename. |
| `src/components/Exercise/MelodyExercise.tsx` | Update `kind` strings to enum, rename `Band` → `ScaleNote`. |
| `src/components/PitchCanvas.tsx` | Rename `Band` → `ScaleNote`. |
| `src/components/HillBallCanvas.tsx` | Rename `Band` → `ScaleNote`. |
| `src/components/BalanceBallCanvas.tsx` | Rename `Band` → `ScaleNote`. |
| `src/components/JourneyView/utils.ts` | Remove slot-based color/id logic (`getExerciseSlot`, `getExerciseSlotIds`), derive colors from scale. |
| `src/components/JourneyView/JourneyView.tsx` | Rename `Band` → `ScaleNote` in props. |
| `src/components/JourneyView/components/JourneyExercise.tsx` | Rename `Band` → `ScaleNote`, update `allBands` → `allNotes`. |
| `src/components/JourneyView/components/ExerciseCard.tsx` | Update `getExerciseDisplayColors` call (signature may change). |
| `src/components/JourneyView/components/ExerciseInfoModal.tsx` | Update `getExerciseDisplayColors` call (signature may change). |
| `src/components/TrainView.tsx` | Rename `Band` → `ScaleNote`, `allBands` → `allNotes`. |
| `src/components/AppShell/AppShell.tsx` | Rename `Band` → `ScaleNote` in callbacks. |
| `src/context/AppContext.tsx` | Rename `Band` → `ScaleNote` in context type. |
| `src/components/Exercise/BaseExercise.tsx` | Rename `Band` → `ScaleNote`. |
| `src/components/Exercise/LearnNotesExercise.tsx` | Rename `Band` → `ScaleNote`. |
| `src/components/HillBallCanvas.stories.tsx` | Update `Band` → `ScaleNote` in story data. |
| `src/components/BalanceBallCanvas.stories.tsx` | Update `Band` → `ScaleNote` in story data. |
| `specs/exercise-config-flow.md` | Update to reflect new types and slot removal. |

## What does NOT change

- `buildScaleForRange` core logic (tonal.js scale resolution) — unchanged, just extended with `"even-7-from-major"`
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
