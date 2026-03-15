# Melody Scale Support — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable melody exercises to use any scale (minor, chromatic, pentatonic, etc.) instead of being locked to the major scale from the user's vocal range.

**Architecture:** Introduce `MelodyScale` type wrapping notes with a scale type + root. Replace `allBands: Band[]` prop with `VocalRange` object throughout exercise components. Add `buildScaleForRange()` utility to construct scale-specific `Band[]` arrays.

**Tech Stack:** TypeScript, React, tonal.js (already installed)

**Spec:** `docs/superpowers/specs/2026-03-15-melody-scale-design.md`

---

## Chunk 1: Types and Scale Builder

### Task 1: Add `VocalRange` interface to `tone-slots.ts`

**Files:**
- Modify: `src/constants/tone-slots.ts:39-58`

- [ ] **Step 1: Add `VocalRange` interface**

After the `Band` interface (line 58), add:

```ts
/** Vocal range data passed to exercises. */
export interface VocalRange {
  /** Lowest detected note, e.g. "C3". */
  lowNote: string;
  /** Highest detected note, e.g. "C5". */
  highNote: string;
  /** Major scale bands with 7 slots — default note pool for non-melody exercises. */
  allBands: Band[];
}
```

- [ ] **Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: PASS (new type, no consumers yet)

- [ ] **Step 3: Commit**

```bash
git add src/constants/tone-slots.ts
git commit -m "feat: add VocalRange interface"
```

### Task 2: Add `MelodyScale` type and update `MelodyExercise`

**Files:**
- Modify: `src/constants/journey/types.ts:174-188`

- [ ] **Step 1: Add `MelodyScale` interface before `MelodyExercise`**

After the `MelodyNoteConfig` type (line 177), add:

```ts
/** A scale segment — defines a note pool for a group of melody notes. */
export interface MelodyScale {
  /** Tonal.js scale name: "major", "minor", "chromatic", "pentatonic", etc. */
  type: string;
  /** 1-indexed chromatic degree from user's lowest note (1 = lowest, 12 = 11 semitones above). */
  root: number;
  /** Notes resolved against this scale's note pool. Only index/range targets — not slot. */
  notes: MelodyNoteConfig[];
}
```

- [ ] **Step 2: Update `MelodyExercise` interface**

Change the `melody` and `backingTrack` fields:

```ts
export interface MelodyExercise extends BaseExerciseConfig {
  exerciseTypeId: "melody";
  /** Scale segments the user sings — rendered as scrolling rectangles, scored for accuracy. */
  melody: MelodyScale[];
  /** Optional accompaniment — same structure, not scored, not shown on canvas. */
  backingTrack?: MelodyScale[];
  /** Score threshold (0–100) to complete. Always shown. 0 = any score passes. */
  minScore: number;
  instruction: string;
}
```

- [ ] **Step 3: Run type check**

Run: `npx tsc --noEmit`
Expected: FAIL — `part2.ts` melody config no longer matches `MelodyScale[]`. This is expected; we fix it in Task 4.

- [ ] **Step 4: Commit**

```bash
git add src/constants/journey/types.ts
git commit -m "feat: add MelodyScale type, update MelodyExercise to use MelodyScale[]"
```

### Task 3: Add `buildScaleForRange()` to `vocal-scale.ts`

**Files:**
- Modify: `src/lib/vocal-scale.ts`

- [ ] **Step 1: Add `buildScaleForRange` function**

Add after the existing `getScaleNotesForRange` function:

```ts
/**
 * Build all notes of a given scale type within a vocal range.
 * Used by melody exercises to create custom scale pools.
 *
 * @param lowNote  Lowest note in range, e.g. "C3"
 * @param highNote Highest note in range, e.g. "C5"
 * @param scaleType Tonal.js scale name, e.g. "minor", "chromatic", "pentatonic"
 * @param root 1-indexed chromatic degree from lowNote (1 = lowNote itself)
 * @returns Band[] sorted low → high, all isSlot: false, with cycling slot colors
 */
export function buildScaleForRange(
  lowNote: string,
  highNote: string,
  scaleType: string,
  root: number,
): Band[] {
  const lowMidi = Note.midi(lowNote);
  const highMidi = Note.midi(highNote);
  if (lowMidi == null || highMidi == null) return [];

  const rootMidi = lowMidi + (root - 1);
  const rootName = NOTE_NAMES[((rootMidi % 12) + 12) % 12];
  const scaleNotes = Scale.get(`${rootName} ${scaleType}`).notes;
  const scalePCs = new Set(scaleNotes.map((n) => Note.chroma(n) ?? -1));

  // Collect matching MIDI notes from root through high range
  const allMidi: number[] = [];
  for (let midi = rootMidi; midi <= highMidi; midi++) {
    if (scalePCs.has(((midi % 12) + 12) % 12)) allMidi.push(midi);
  }

  // Fallback: if fewer than 2 notes, fill chromatically
  if (allMidi.length < 2) {
    for (let midi = rootMidi; midi <= highMidi; midi++) {
      if (!allMidi.includes(midi)) allMidi.push(midi);
    }
    allMidi.sort((a, b) => a - b);
  }

  // Parse slot RGB values for cycling colors
  const slotRgbs = SLOT_ORDER.map((id) => {
    const slot = SLOTS.find((s) => s.id === id)!;
    return parseRgb(slot.rgb);
  });

  return allMidi.map((midi, idx) => {
    const hz = Math.round(midiToHz(midi));
    const noteName = NOTE_NAMES[((midi % 12) + 12) % 12];
    const octave = Math.floor(midi / 12) - 1;
    const [r, g, b] = slotRgbs[idx % slotRgbs.length];
    return {
      id: `${noteName}${octave}`,
      midi,
      frequencyHz: hz,
      note: noteName,
      octave,
      color: toHex(r, g, b),
      rgb: `${r}, ${g}, ${b}`,
      name: `${noteName}${octave}`,
      isSlot: false,
    };
  });
}
```

- [ ] **Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: Type errors from part2.ts (still using old format) — that's fine. No errors in vocal-scale.ts itself.

- [ ] **Step 3: Commit**

```bash
git add src/lib/vocal-scale.ts
git commit -m "feat: add buildScaleForRange() for custom scale pool construction"
```

### Task 4: Migrate part2.ts melody exercise config

**Files:**
- Modify: `src/constants/journey/part2.ts:46-58`

- [ ] **Step 1: Update the Perfect Fifth melody exercise**

Change from flat `MelodyNoteConfig[]` to `MelodyScale[]`:

```ts
// Before:
//   melody: [
//     { target: { kind: "slot", n: 1 }, seconds: 2 },
//     { target: { kind: "slot", n: 5 }, seconds: 2 },
//   ],

// After:
    melody: [
      {
        type: "major",
        root: 1,
        notes: [
          { target: { kind: "index", i: 0 }, seconds: 2 },
          { target: { kind: "index", i: 4 }, seconds: 2 },
        ],
      },
    ],
```

Note: `slot n:1` → `index i:0` (root), `slot n:5` → `index i:4` (perfect 5th in a major scale).

- [ ] **Step 2: Fix `buildIntroModal` in `index.ts`**

In `src/constants/journey/index.ts`, line 95, update the note count to handle `MelodyScale[]`:

```ts
// Before:
const noteCount = exercise.melody.filter((n) => !("rest" in n && n.rest)).length;

// After:
const noteCount = exercise.melody.flatMap((s) => s.notes).filter((n) => !("rest" in n && n.rest)).length;
```

- [ ] **Step 3: Run type check**

Run: `npx tsc --noEmit`
Expected: Still fails — MelodyExercise.tsx still expects old types. That's next.

- [ ] **Step 4: Commit**

```bash
git add src/constants/journey/part2.ts src/constants/journey/index.ts
git commit -m "refactor: migrate Perfect Fifth exercise to MelodyScale[] format"
```

---

## Chunk 2: VocalRange Prop Threading

### Task 5: Update `JourneyExercise.tsx` to build `VocalRange`

**Files:**
- Modify: `src/components/JourneyView/components/JourneyExercise.tsx`

- [ ] **Step 1: Import `VocalRange` and `hzToNoteName`**

Update imports:

```ts
import type { VocalRange } from "@/constants/tone-slots";
import { hzToNoteName } from "@/lib/pitch";
```

Remove the `Band` type import if no longer used directly.

- [ ] **Step 2: Build `VocalRange` object**

Replace the `allBands` memo (lines 52-59) with:

```ts
  const vocalRange: VocalRange = useMemo(() => {
    const lowHz = settings.vocalRangeLowHz > 0 ? settings.vocalRangeLowHz : 131;
    const highHz = settings.vocalRangeHighHz > 0 ? settings.vocalRangeHighHz : 523;
    return {
      lowNote: hzToNoteName(lowHz),
      highNote: hzToNoteName(highHz),
      allBands: getScaleNotesForRange(lowHz, highHz, settings.tuning),
    };
  }, [settings.vocalRangeLowHz, settings.vocalRangeHighHz, settings.tuning]);
```

- [ ] **Step 3: Update `BaseExercise` call**

Change `allBands={allBands}` to `vocalRange={vocalRange}` (line 181).

- [ ] **Step 4: Update `onPlayTone` and `onPlaySlide` type imports if needed**

These still use `Band` directly — check that the `Band` import remains. If `Band` was only imported for the `allBands` variable, keep the import since `onPlayTone` still takes `Band`.

- [ ] **Step 5: Commit**

```bash
git add src/components/JourneyView/components/JourneyExercise.tsx
git commit -m "refactor: build VocalRange object in JourneyExercise"
```

### Task 6: Update `BaseExercise.tsx` to accept `VocalRange`

**Files:**
- Modify: `src/components/Exercise/BaseExercise.tsx`

- [ ] **Step 1: Update imports and props interface**

Add import:
```ts
import type { VocalRange } from "@/constants/tone-slots";
```

In `BaseExerciseProps`, replace `allBands: Band[]` with `vocalRange: VocalRange`.

- [ ] **Step 2: Update destructuring and all child exercise calls**

In the function signature, replace `allBands` with `vocalRange`.

Update each child exercise call:
- `LearnNotesExercise`: change `allBands={allBands}` to `vocalRange={vocalRange}`
- `ToneFollowExercise`: change `allBands={allBands}` to `vocalRange={vocalRange}`
- `MelodyExercise`: change `allBands={allBands}` to `vocalRange={vocalRange}`
- `PitchExercise`: change `allBands={allBands}` to `vocalRange={vocalRange}`

- [ ] **Step 3: Commit**

```bash
git add src/components/Exercise/BaseExercise.tsx
git commit -m "refactor: BaseExercise accepts VocalRange instead of allBands"
```

### Task 7: Update `LearnNotesExercise.tsx`

**Files:**
- Modify: `src/components/Exercise/LearnNotesExercise.tsx`

- [ ] **Step 1: Update props**

In `LearnNotesExerciseProps`, replace `allBands: Band[]` with `vocalRange: VocalRange`. Add the import.

- [ ] **Step 2: Update usage**

In the function body, replace `allBands` with `vocalRange.allBands`:
- Destructure: change `allBands` to `vocalRange` in the function params
- Line 141: `allBands.filter(...)` → `vocalRange.allBands.filter(...)`

- [ ] **Step 3: Commit**

```bash
git add src/components/Exercise/LearnNotesExercise.tsx
git commit -m "refactor: LearnNotesExercise accepts VocalRange"
```

### Task 8: Update `ToneFollowExercise.tsx`

**Files:**
- Modify: `src/components/Exercise/ToneFollowExercise.tsx`

- [ ] **Step 1: Update props**

In `ToneFollowExerciseProps`, replace `allBands: Band[]` with `vocalRange: VocalRange`. Add the import.

- [ ] **Step 2: Update all `allBands` references**

Replace `allBands` with `vocalRange.allBands` everywhere in the file. There are ~15 occurrences — all inside `resolveBandTarget()` calls, `allBands.indexOf()`, `allBands.slice()`, and `useMemo` dependencies.

The pattern is mechanical: `allBands` → `vocalRange.allBands` in every usage.

- [ ] **Step 3: Commit**

```bash
git add src/components/Exercise/ToneFollowExercise.tsx
git commit -m "refactor: ToneFollowExercise accepts VocalRange"
```

### Task 9: Update `PitchExercise.tsx` and `usePitchProgress.ts`

**Files:**
- Modify: `src/components/Exercise/PitchExercise/PitchExercise.tsx`
- Modify: `src/components/Exercise/PitchExercise/usePitchProgress.ts`

- [ ] **Step 1: Update `PitchExercise` props**

In `PitchExerciseProps`, replace `allBands: Band[]` with `vocalRange: VocalRange`. Add the import.

- [ ] **Step 2: Update all `allBands` references in `PitchExercise.tsx`**

Replace `allBands` with `vocalRange.allBands` everywhere (~15 occurrences). Same mechanical pattern as ToneFollowExercise.

For the `usePitchProgress` call (line 93), change:
```ts
usePitchProgress({ exercise, exerciseId, allBands, exerciseBands, pitchHzRef });
```
to:
```ts
usePitchProgress({ exercise, exerciseId, allBands: vocalRange.allBands, exerciseBands, pitchHzRef });
```

Note: `usePitchProgress` keeps its own `allBands` param name internally — no change needed inside the hook file for this iteration.

- [ ] **Step 3: Commit**

```bash
git add src/components/Exercise/PitchExercise/PitchExercise.tsx
git commit -m "refactor: PitchExercise accepts VocalRange"
```

- [ ] **Step 4: Run type check**

Run: `npx tsc --noEmit`
Expected: Errors only from MelodyExercise.tsx (still expects old allBands prop). Everything else should pass.

---

## Chunk 3: MelodyExercise Scale Resolution

### Task 10: Update `MelodyExercise.tsx` for `MelodyScale[]`

**Files:**
- Modify: `src/components/Exercise/MelodyExercise.tsx`

- [ ] **Step 1: Update imports**

Add:
```ts
import type { VocalRange } from "@/constants/tone-slots";
import type { MelodyScale } from "@/constants/journey/types";
import { buildScaleForRange } from "@/lib/vocal-scale";
```

- [ ] **Step 2: Update props interface**

Replace `allBands: Band[]` with `vocalRange: VocalRange` in `MelodyExerciseProps`.

- [ ] **Step 3: Helper to resolve a `MelodyScale[]` into timeline entries**

Add a helper function inside the component (or above it) that resolves a `MelodyScale[]` array:

```ts
function resolveScaleTimeline(
  scales: MelodyScale[],
  vocalRange: VocalRange,
): TimelineEntry[] {
  const entries: TimelineEntry[] = [];
  let cursor = 0;
  for (const segment of scales) {
    const localBands = buildScaleForRange(
      vocalRange.lowNote,
      vocalRange.highNote,
      segment.type,
      segment.root,
    );
    for (const note of segment.notes) {
      const durationMs = note.seconds * 1000;
      if ("rest" in note && note.rest) {
        entries.push({ startMs: cursor, durationMs, isRest: true });
      } else {
        const n = note as Extract<MelodyNoteConfig, { target: unknown }>;
        const bands = resolveBandTarget(n.target, localBands);
        if (bands.length > 0) {
          entries.push({
            band: bands[0],
            startMs: cursor,
            durationMs,
            silent: n.silent,
            isRest: false,
          });
        }
      }
      cursor += durationMs;
    }
  }
  return entries;
}
```

- [ ] **Step 4: Update `melodyTimeline` memo**

Replace the existing memo body with:

```ts
const melodyTimeline = useMemo(
  () => resolveScaleTimeline(exercise.melody, vocalRange),
  [exercise.melody, vocalRange],
);
```

- [ ] **Step 5: Update `backingTimeline` memo**

Replace the existing backingTimeline memo:

```ts
const backingTimeline = useMemo(() => {
  if (!exercise.backingTrack) return [];
  return resolveScaleTimeline(exercise.backingTrack, vocalRange)
    .filter((e): e is NoteTimeline => !e.isRest);
}, [exercise.backingTrack, vocalRange]);
```

- [ ] **Step 6: Update `displayBands` to work without global allBands**

The current `displayBands` uses `allBands` to find neighbors. Since notes now come from custom scale pools, derive display bands directly from the resolved melody notes, sorted by frequency, with padding:

```ts
const displayBands = useMemo(() => {
  if (exerciseBands.length === 0) return vocalRange.allBands.slice(0, 3);
  // Deduplicate and sort by frequency
  const seen = new Set<string>();
  const unique = exerciseBands.filter((b) => {
    if (seen.has(b.id)) return false;
    seen.add(b.id);
    return true;
  });
  unique.sort((a, b) => a.frequencyHz - b.frequencyHz);
  return unique;
}, [exerciseBands, vocalRange.allBands]);
```

- [ ] **Step 7: Run type check**

Run: `npx tsc --noEmit`
Expected: PASS — all types should align now.

- [ ] **Step 8: Commit**

```bash
git add src/components/Exercise/MelodyExercise.tsx
git commit -m "feat: MelodyExercise resolves per-segment scales via MelodyScale[]"
```

### Task 11: Export new types and functions

**Files:**
- Modify: `src/constants/tone-slots.ts` (re-exports)
- Modify: `src/constants/journey/index.ts` (if `MelodyScale` needs exporting)

- [ ] **Step 1: Add `buildScaleForRange` to re-exports in `tone-slots.ts`**

Add to the re-exports section:

```ts
export { getScaleNotesForRange, buildScaleForRange } from "@/lib/vocal-scale";
```

- [ ] **Step 2: Verify `MelodyScale` is exported from journey types**

Check that `src/constants/journey/index.ts` re-exports `MelodyScale` if it re-exports other types. Add if needed:

```ts
export type { MelodyScale } from "./types";
```

- [ ] **Step 3: Run full type check**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/constants/tone-slots.ts src/constants/journey/index.ts
git commit -m "chore: export buildScaleForRange and MelodyScale"
```

---

## Chunk 4: Verification

### Task 12: Manual verification

- [ ] **Step 1: Run dev server**

Run: `npm run dev`

- [ ] **Step 2: Test existing Perfect Fifth exercise**

Navigate to the Perfect Fifth melody exercise. Verify:
- Piano plays the correct two notes (root and 5th)
- Rectangles render at correct Y positions
- Scoring works (hit/close/missed)

- [ ] **Step 3: Final type check**

Run: `npx tsc --noEmit`
Expected: PASS with zero errors

- [ ] **Step 4: Final commit (if any cleanup needed)**

```bash
git add -A
git commit -m "chore: melody scale support cleanup"
```
