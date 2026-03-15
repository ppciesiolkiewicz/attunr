# Scale-Based Targeting & Slot Removal — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the `slot` targeting system, make every exercise declare its own scale via `BaseScale`, introduce a `Scale` class for note resolution and colorization, and rename `Band`→`ResolvedNote`/`ColoredNote` and `BandTarget`→`NoteTarget` throughout the codebase.

**Architecture:** New `Scale` class (`src/lib/scale.ts`) encapsulates note pool construction, target resolution (`resolve`), and colorization (`colorize`). Exercise components construct a `Scale` from their config's `BaseScale` + `VocalRange`. All exercise configs gain a `scale` field; former `slot` targets become `index` targets against an `"even-7-from-major"` scale. Colors come from `VocalRange`, not from scale building.

**Tech Stack:** TypeScript, Next.js, tonal.js (scale computation), Tone.js (audio), React

**Spec:** `docs/superpowers/specs/2026-03-16-scale-based-targeting-design.md`

---

## Chunk 1: Foundation Types & Scale Class

### Task 1: Update type definitions in `types.ts`

**Files:**
- Modify: `src/constants/journey/types.ts`

- [ ] **Step 1: Add `ChromaticDegree` type alias and `BandTargetKind` enum**

Add after the `ExerciseTypeId` type (after line 16):

```ts
/** 1-indexed chromatic degree from user's lowest note (1 = lowest). */
export type ChromaticDegree = number;

/** Discriminant for NoteTarget union. */
export enum BandTargetKind {
  Index = "index",
  Range = "range",
}
```

- [ ] **Step 2: Replace `BandTarget` with `NoteTarget`**

Replace the `BandTarget` type (lines 28–36) with:

```ts
/**
 * Describes which note(s) in a scale an exercise targets.
 *
 * - index: 0-based position in the scale's note pool; negative counts from end (-1 = last note)
 * - range: inclusive index range (negative indices supported); used for loose detection exercises
 *   - accept: "below" = any tone at or below the range; "above" = any tone at or above
 */
export type NoteTarget =
  | { kind: BandTargetKind.Index; i: number }
  | {
      kind: BandTargetKind.Range;
      from: number;
      to: number;
      accept?: "within" | "below" | "above";
    };
```

- [ ] **Step 3: Update `SustainNoteConfig` and `SlideConfig`**

Replace `BandTarget` references (lines 39, 42):

```ts
/** A single tone the user must hold in-tune for `seconds`. */
export type SustainNoteConfig = { target: NoteTarget; seconds: number };

/** Start and end targets for a pitch glide exercise. */
export type SlideConfig = { from: NoteTarget; to: NoteTarget };
```

- [ ] **Step 4: Add `BaseScale` interface**

Add before the `ToneFollowShape` type (before line 161):

```ts
/** Shared scale definition — specifies which note pool to build. */
export interface BaseScale {
  /** Tonal.js scale name or custom identifier (e.g. "even-7-from-major"). */
  type: string;
  /** 1-indexed chromatic degree from user's lowest note. */
  root: ChromaticDegree;
}
```

- [ ] **Step 5: Update `ToneFollowShape` to use `NoteTarget`**

Replace `ToneFollowShape` (lines 161–163):

```ts
export type ToneFollowShape =
  | { kind: "slide"; from: NoteTarget; to: NoteTarget }
  | { kind: "sustain"; target: NoteTarget; seconds: number };
```

- [ ] **Step 6: Add `scale` to exercise types**

Update `PitchDetectionExercise` (lines 139–144):

```ts
export interface PitchDetectionExercise extends BaseExerciseConfig {
  exerciseTypeId: "pitch-detection";
  scale: BaseScale;
  notes: SustainNoteConfig[];
  instruction: string;
}
```

Update `PitchDetectionSlideExercise` (lines 146–151):

```ts
export interface PitchDetectionSlideExercise extends BaseExerciseConfig {
  exerciseTypeId: "pitch-detection-slide";
  scale: BaseScale;
  notes: SlideConfig[];
  displayNotes?: DisplayScale[];
  instruction: string;
}
```

Update `ToneFollowExercise` (lines 165–172):

```ts
export interface ToneFollowExercise extends BaseExerciseConfig {
  exerciseTypeId: "tone-follow";
  scale: BaseScale;
  toneShape: ToneFollowShape;
  displayNotes?: DisplayScale[];
  requiredPlays: number;
  instruction: string;
}
```

- [ ] **Step 7: Update `MelodyEvent` to use `NoteTarget`**

Replace `MelodyEvent` (lines 187–190):

```ts
export type MelodyEvent =
  | { type: "note"; target: NoteTarget; duration: NoteDuration; silent?: boolean }
  | { type: "play"; targets: NoteTarget[]; duration: NoteDuration }
  | { type: "pause"; duration: NoteDuration };
```

- [ ] **Step 8: Make `MelodyScale` extend `BaseScale`**

Replace `MelodyScale` (lines 193–200):

```ts
export interface MelodyScale extends BaseScale {
  /** Events resolved against this scale's note pool. */
  events: MelodyEvent[];
}
```

Remove the old `type` and `root` fields — they come from `BaseScale` now.

- [ ] **Step 9: Update `DisplayNote` to use `NoteTarget`**

Replace `DisplayNote` (lines 203–207):

```ts
export interface DisplayNote {
  target: NoteTarget;
  style?: "full" | "muted";
}
```

- [ ] **Step 10: Run type check**

Run: `npx tsc --noEmit`
Expected: Many errors in consuming files (they still reference `BandTarget`, `slot`, etc.) — that's expected at this stage. Verify `types.ts` itself has no internal errors.

- [ ] **Step 11: Commit**

```bash
git add src/constants/journey/types.ts
git commit -m "feat: add ChromaticDegree, BandTargetKind, BaseScale; rename BandTarget to NoteTarget"
```

---

### Task 2: Update `tone-slots.ts` — `ResolvedNote`, `ColoredNote`, remove slots

**Files:**
- Modify: `src/constants/tone-slots.ts`

- [ ] **Step 1: Replace slot types with `NOTE_PALETTE` and new interfaces**

Remove `SlotId`, `Slot`, `SLOTS`, `SLOT_ORDER` type/constants. Replace `Band` with `ResolvedNote` + `ColoredNote`. Add `NOTE_PALETTE` (same colors as old `SLOTS`). Update `VocalRange` (`allBands` → `allNotes`).

```ts
// ── Note types ──────────────────────────────────────────────────────────────

/** 7-color palette for note visualization across the vocal range. */
export const NOTE_PALETTE = [
  { color: "#ef4444", rgb: "239, 68, 68" },
  { color: "#f97316", rgb: "249, 115, 22" },
  { color: "#eab308", rgb: "234, 179, 8" },
  { color: "#22c55e", rgb: "34, 197, 94" },
  { color: "#3b82f6", rgb: "59, 130, 246" },
  { color: "#6366f1", rgb: "99, 102, 241" },
  { color: "#a855f7", rgb: "168, 85, 247" },
];

/** A resolved note from a scale — physical properties without visual styling. */
export interface ResolvedNote {
  id: string;
  midi: number;
  frequencyHz: number;
  note: string;
  octave: number;
  name: string;
}

/** A resolved note with color from the user's vocal range. */
export interface ColoredNote extends ResolvedNote {
  color: string;
  /** Comma-separated RGB for rgba() usage. */
  rgb: string;
}

/** Vocal range data passed to exercises. */
export interface VocalRange {
  /** Lowest detected note, e.g. "C3". */
  lowNote: string;
  /** Highest detected note, e.g. "C5". */
  highNote: string;
  /** All notes in the vocal range with colors. */
  allNotes: ColoredNote[];
}
```

- [ ] **Step 2: Update re-exports**

Keep the old function names in re-exports for now (they'll be renamed in Task 3). Remove `buildScaleForRange` (moved to `Scale` class). Remove `SLOT_ORDER` exports.

```ts
// ── Re-exports ───────────────────────────────────────────────────────────────

export { VOICE_TYPES } from "@/constants/voice-types";
export type { VoiceTypeId, VoiceType } from "@/constants/voice-types";

export { TUNING_OPTIONS, TUNING_A_HZ } from "@/constants/tuning";
export type { TuningStandard, FrequencyBase } from "@/constants/tuning";

export {
  hzToMidi,
  midiToHz,
  hzToNoteName,
  deriveVoiceType,
  isInTune,
  isInBandRange,
  matchesBandTarget,
  findClosestBand,
  pitchConfidence,
} from "@/lib/pitch";

export { getScaleNotesForRange } from "@/lib/vocal-scale";
```

> **Note:** Re-exports keep old names here. Task 3 renames the functions in `pitch.ts` and then updates these re-exports to the new names as a final step.

- [ ] **Step 3: Commit**

```bash
git add src/constants/tone-slots.ts
git commit -m "feat: replace Band with ResolvedNote/ColoredNote, remove slot system"
```

---

### Task 3: Update `pitch.ts` — rename functions, remove slot logic

**Files:**
- Modify: `src/lib/pitch.ts`

- [ ] **Step 1: Update imports**

Replace the imports at the top:

```ts
import type { ResolvedNote } from "@/constants/tone-slots";
```

Remove imports of `Band`, `BandTarget`, `SLOT_ORDER`.

- [ ] **Step 2: Remove `resolveBandTarget` function entirely**

Delete the `resolveBandTarget` function (lines 102–132). This is replaced by `Scale.resolve()`.

- [ ] **Step 3: Rename `isInBandRange` → `isInNoteRange`**

```ts
/** Check if pitch is anywhere within the frequency range of the given notes. Uses ±10% buffer at edges. */
export function isInNoteRange(detectedHz: number, notes: ResolvedNote[]): boolean {
  return matchesNoteTarget(detectedHz, notes, "within");
}
```

- [ ] **Step 4: Rename `matchesBandTarget` → `matchesNoteTarget`**

The function keeps the same semantics — it operates on pre-resolved `ResolvedNote[]` (from `scale.resolve()`), not the full scale pool. No index/range resolution here (that's `Scale.resolve`'s job).

```ts
/**
 * Check if pitch matches resolved notes with optional accept mode.
 * - within: pitch must be in the note range (±10% buffer)
 * - below: accept any pitch at or below the range (chest/low voice)
 * - above: accept any pitch at or above the range (head/high voice)
 */
export function matchesNoteTarget(
  detectedHz: number,
  notes: ResolvedNote[],
  accept: "within" | "below" | "above" = "within",
): boolean {
  if (notes.length === 0) return false;
  const freqs = notes.map((n) => n.frequencyHz);
  const minHz = Math.min(...freqs);
  const maxHz = Math.max(...freqs);
  const buffer = 0.1;
  const low = minHz * (1 - buffer);
  const high = maxHz * (1 + buffer);
  switch (accept) {
    case "below":
      return detectedHz <= high;
    case "above":
      return detectedHz >= low;
    default:
      return detectedHz >= low && detectedHz <= high;
  }
}
```

> **Key design decision:** `matchesNoteTarget` takes **pre-resolved** `ResolvedNote[]` (output of `scale.resolve(target)`) and an `accept` mode, not a `NoteTarget`. Callers call `scale.resolve(target)` first, then pass the result here with `target.accept ?? "within"`. This avoids duplicating `Scale.resolve` logic (DRY).

- [ ] **Step 5: Rename `findClosestBand` → `findClosestNote`**

```ts
export function findClosestNote(hz: number, notes: ResolvedNote[]): ResolvedNote {
  if (notes.length === 0) {
    throw new Error("findClosestNote requires at least one note");
  }
  return notes.reduce((best, n) =>
    Math.abs(n.frequencyHz - hz) < Math.abs(best.frequencyHz - hz) ? n : best
  );
}
```

- [ ] **Step 6: Update `pitchConfidence`**

```ts
export function pitchConfidence(hz: number, notes: ResolvedNote[]): number {
  const closest = findClosestNote(hz, notes);
  const ratio = Math.abs(hz - closest.frequencyHz) / closest.frequencyHz;
  return Math.max(0, 1 - ratio / 0.03);
}
```

- [ ] **Step 7: Update re-exports in `tone-slots.ts`**

Now that functions are renamed, update the re-exports in `src/constants/tone-slots.ts`:

```ts
export {
  hzToMidi,
  midiToHz,
  hzToNoteName,
  deriveVoiceType,
  isInTune,
  isInNoteRange,
  matchesNoteTarget,
  findClosestNote,
  pitchConfidence,
} from "@/lib/pitch";
```

- [ ] **Step 8: Run type check**

Run: `npx tsc --noEmit`
Expected: Errors in consuming files that still import old names — expected.

- [ ] **Step 9: Commit**

```bash
git add src/lib/pitch.ts src/constants/tone-slots.ts
git commit -m "refactor: rename pitch functions Band→ResolvedNote, remove resolveBandTarget"
```

---

### Task 4: Create `Scale` class

**Files:**
- Create: `src/lib/scale.ts`

- [ ] **Step 1: Create the Scale class**

```ts
import { Note, Scale as TonalScale } from "tonal";
import type { ResolvedNote, ColoredNote, VocalRange } from "@/constants/tone-slots";
import type { NoteTarget, BaseScale } from "@/constants/journey/types";
import { BandTargetKind } from "@/constants/journey/types";
import { midiToHz, NOTE_NAMES } from "@/lib/pitch";

/**
 * Encapsulates a note pool built from a scale definition + vocal range.
 * Provides target resolution and colorization.
 */
export class Scale {
  /** All notes in this scale, sorted low → high. */
  readonly notes: ResolvedNote[];
  private readonly vocalRange: VocalRange;

  constructor(definition: BaseScale, vocalRange: VocalRange) {
    this.vocalRange = vocalRange;
    this.notes = Scale.buildNotes(definition, vocalRange);
  }

  /** Pick specific note(s) by index or range. */
  resolve(target: NoteTarget): ResolvedNote[] {
    const n = this.notes.length;
    if (n === 0) return [];

    if (target.kind === BandTargetKind.Index) {
      const i = target.i < 0 ? n + target.i : target.i;
      return i >= 0 && i < n ? [this.notes[i]] : [];
    }

    if (target.kind === BandTargetKind.Range) {
      const from = target.from < 0 ? n + target.from : target.from;
      const to = target.to < 0 ? n + target.to : target.to;
      const lo = Math.max(0, Math.min(from, to));
      const hi = Math.min(n - 1, Math.max(from, to));
      return this.notes.slice(lo, hi + 1);
    }

    return [];
  }

  /** Map colors from VocalRange onto this scale's notes. */
  colorize(): ColoredNote[] {
    const colorMap = new Map<number, { color: string; rgb: string }>();
    for (const cn of this.vocalRange.allNotes) {
      colorMap.set(cn.midi, { color: cn.color, rgb: cn.rgb });
    }

    return this.notes.map((note) => {
      const match = colorMap.get(note.midi);
      if (match) {
        return { ...note, color: match.color, rgb: match.rgb };
      }
      // Fallback: find nearest colored note
      return { ...note, ...Scale.nearestColor(note.midi, this.vocalRange.allNotes) };
    });
  }

  /** Find color of nearest note by midi distance. */
  private static nearestColor(midi: number, allNotes: ColoredNote[]): { color: string; rgb: string } {
    if (allNotes.length === 0) return { color: "#888888", rgb: "136, 136, 136" };
    let closest = allNotes[0];
    let minDist = Math.abs(midi - closest.midi);
    for (let i = 1; i < allNotes.length; i++) {
      const dist = Math.abs(midi - allNotes[i].midi);
      if (dist < minDist) {
        closest = allNotes[i];
        minDist = dist;
      }
    }
    return { color: closest.color, rgb: closest.rgb };
  }

  /** Build the note pool for a scale definition. */
  private static buildNotes(definition: BaseScale, vocalRange: VocalRange): ResolvedNote[] {
    const lowMidi = Note.midi(vocalRange.lowNote);
    const highMidi = Note.midi(vocalRange.highNote);
    if (lowMidi == null || highMidi == null) return [];

    if (definition.type === "even-7-from-major") {
      return Scale.buildEven7FromMajor(lowMidi, highMidi, definition.root);
    }

    return Scale.buildTonalScale(lowMidi, highMidi, definition.type, definition.root);
  }

  /** Build 7 evenly-spaced notes from the major scale across the range. */
  private static buildEven7FromMajor(lowMidi: number, highMidi: number, root: number): ResolvedNote[] {
    const rootMidi = lowMidi + (root - 1);
    const rootName = NOTE_NAMES[((rootMidi % 12) + 12) % 12];
    const scaleNotes = TonalScale.get(`${rootName} major`).notes;
    const scalePCs = new Set(scaleNotes.map((n) => Note.chroma(n) ?? -1));

    const allMidi: number[] = [];
    for (let midi = lowMidi; midi <= highMidi; midi++) {
      if (scalePCs.has(((midi % 12) + 12) % 12)) allMidi.push(midi);
    }

    // Extend above range if fewer than 7
    let ext = highMidi + 1;
    while (allMidi.length < 7 && ext < highMidi + 25) {
      if (scalePCs.has(((ext % 12) + 12) % 12)) allMidi.push(ext);
      ext++;
    }

    // Fallback: chromatic steps
    if (allMidi.length === 0) {
      return Array.from({ length: 7 }, (_, i) => {
        const midi = lowMidi + Math.round((i * (highMidi - lowMidi)) / 6);
        return Scale.midiToResolvedNote(midi);
      });
    }

    // Pick 7 evenly-spaced
    const n = allMidi.length;
    const indices = Array.from({ length: 7 }, (_, i) =>
      n <= 7 ? i : Math.round((i * (n - 1)) / 6)
    );

    return indices
      .filter((idx) => idx < allMidi.length)
      .map((idx) => Scale.midiToResolvedNote(allMidi[idx]));
  }

  /** Build notes for any tonal.js scale type. */
  private static buildTonalScale(lowMidi: number, highMidi: number, scaleType: string, root: number): ResolvedNote[] {
    const rootMidi = lowMidi + (root - 1);
    const rootName = NOTE_NAMES[((rootMidi % 12) + 12) % 12];
    const scaleNotes = TonalScale.get(`${rootName} ${scaleType}`).notes;
    const scalePCs = new Set(scaleNotes.map((n) => Note.chroma(n) ?? -1));

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

    return allMidi.map((midi) => Scale.midiToResolvedNote(midi));
  }

  /** Convert a MIDI number to a ResolvedNote. */
  private static midiToResolvedNote(midi: number): ResolvedNote {
    const hz = Math.round(midiToHz(midi));
    const noteName = NOTE_NAMES[((midi % 12) + 12) % 12];
    const octave = Math.floor(midi / 12) - 1;
    return {
      id: `${noteName}${octave}`,
      midi,
      frequencyHz: hz,
      note: noteName,
      octave,
      name: `${noteName}${octave}`,
    };
  }
}
```

- [ ] **Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: `scale.ts` compiles cleanly. Other files still have errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/scale.ts
git commit -m "feat: add Scale class with resolve, colorize, even-7-from-major"
```

---

### Task 5: Update `vocal-scale.ts` — simplify using Scale

**Files:**
- Modify: `src/lib/vocal-scale.ts`

- [ ] **Step 1: Update imports**

```ts
import { Note, Scale as TonalScale } from "tonal";
import type { ColoredNote } from "@/constants/tone-slots";
import { NOTE_PALETTE } from "@/constants/tone-slots";
import { hzToMidi, midiToHz, NOTE_NAMES } from "@/lib/pitch";
import { parseRgb, lerpColor, toHex } from "@/lib/color";
import type { TuningStandard } from "@/constants/tuning";
```

Remove imports of `SlotId`, `Band`, `SLOTS`, `SLOT_ORDER`.

- [ ] **Step 2: Update `getScaleNotesForRange` return type and remove slot metadata**

Change return type from `Band[]` to `ColoredNote[]`. Replace `SLOT_ORDER`/`SLOTS` usage with `NOTE_PALETTE`:

```ts
// Replace slot RGB parsing:
const slotRgbs = NOTE_PALETTE.map((p) => parseRgb(p.rgb));

// Replace slot index handling — keep the same 7-index color interpolation logic,
// but build ColoredNote objects (no isSlot, no slotId):
return allMidi.map((midi, idx) => {
  const hz = Math.round(midiToHz(midi));
  const noteName = NOTE_NAMES[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  const { hex, rgb } = colorAt(idx);
  return {
    id: `${noteName}${octave}`,
    midi,
    frequencyHz: hz,
    note: noteName,
    octave,
    color: hex,
    rgb,
    name: `${noteName}${octave}`,
  };
});
```

For the 7 slot-index notes, they now get their color from `NOTE_PALETTE[slotNum]` directly instead of looking up in `SLOTS`. The `colorAt` helper uses `NOTE_PALETTE` colors instead of `SLOTS` colors — same values, just different source.

- [ ] **Step 3: Remove `buildScaleForRange` function entirely**

Delete the `buildScaleForRange` function (lines 131–181). This functionality is now in the `Scale` class constructor.

- [ ] **Step 4: Run type check**

Run: `npx tsc --noEmit`
Expected: Fewer errors now. `vocal-scale.ts` and `scale.ts` compile cleanly.

- [ ] **Step 5: Commit**

```bash
git add src/lib/vocal-scale.ts
git commit -m "refactor: simplify vocal-scale.ts, remove buildScaleForRange and slot metadata"
```

---

### Task 6: Update `journey/index.ts` exports

**Files:**
- Modify: `src/constants/journey/index.ts`

- [ ] **Step 1: Update type exports**

In `src/constants/journey/index.ts`, replace the `export type` block (lines 24–55) and `export { NoteDuration }` (line 57).

Replace `BandTarget` with `NoteTarget` in the type exports. Add `BaseScale`, `ChromaticDegree` as type exports. Add `BandTargetKind` as a **value export** (it's an enum, not just a type):

```ts
export type {
  JourneyExercise,
  JourneyExerciseInput,
  JourneyPart,
  JourneyPartInput,
  ExerciseTypeId,
  ModalConfig,
  ContentElement,
  WarningElement,
  ParagraphElement,
  VideoElement,
  HeadphonesNoticeElement,
  TipListElement,
  SeparatorElement,
  TechniqueId,
  NoteTarget,
  BaseScale,
  ChromaticDegree,
  SustainNoteConfig,
  SlideConfig,
  BaseExerciseConfig,
  LearnExercise,
  LearnNotesExercise,
  PitchDetectionExercise,
  PitchDetectionSlideExercise,
  FarinelliBreathworkExercise,
  ToneFollowExercise,
  ToneFollowShape,
  MelodyExercise,
  MelodyScale,
  MelodyEvent,
  DisplayNote,
  DisplayScale,
} from "./types";

export { NoteDuration, BandTargetKind } from "./types";
```

- [ ] **Step 2: Commit**

```bash
git add src/constants/journey/index.ts
git commit -m "chore: update journey exports for NoteTarget, BandTargetKind, BaseScale"
```

---

## Chunk 2: Exercise Config Migration

### Task 7: Migrate exercise configs — parts 2–20

**Files:**
- Modify: `src/constants/journey/part2.ts` through `part20.ts`

All part files follow the same mechanical pattern. Each exercise that uses `BandTarget` needs:

1. Add `import { BandTargetKind } from "./types"` if not already imported
2. Add `scale: { type: "...", root: 1 }` to the exercise
3. Replace `{ kind: "slot", n: X }` → `{ kind: BandTargetKind.Index, i: X - 1 }`
4. Replace `{ kind: "index", i: X }` → `{ kind: BandTargetKind.Index, i: X }`
5. Replace `{ kind: "range", ... }` → `{ kind: BandTargetKind.Range, ... }`
6. For tone-follow exercises: add `displayNotes` with major scale reference notes

**Scale assignments by exercise type:**
- Pitch-detection with former slot targets: `scale: { type: "even-7-from-major", root: 1 }`
- Pitch-detection with range targets (Low U, Low hum): `scale: { type: "chromatic", root: 1 }`
- Pitch-detection-slide: `scale: { type: "chromatic", root: 1 }`
- Tone-follow **slide** (high→low / low→high glides): `scale: { type: "chromatic", root: 1 }`
- Tone-follow **sustain** with former slot targets: `scale: { type: "even-7-from-major", root: 1 }` (must match slot semantics — `index i` resolves against 7 evenly-spaced major notes, not chromatic)
- Melody (part2 only): already has scale in `MelodyScale[]`, just update `kind` strings to enum

> **`displayNotes` for tone-follow/slide exercises:** Intentionally deferred from this migration. The exercises work without `displayNotes` (they display all scale notes). Adding `displayNotes` for major-scale reference lines on chromatic exercises will be a follow-up task.

- [ ] **Step 1: Migrate part2.ts**

This file has:
- 2 range exercises (Low U, Hoo hoo) → `scale: { type: "chromatic", root: 1 }`
- 1 melody exercise (Perfect Fifth) → update `kind` strings to `BandTargetKind.Index`
- 1 tone-follow exercise → `scale: { type: "chromatic", root: 1 }`

Add `import { BandTargetKind } from "./types"` alongside existing `NoteDuration` import.

For melody exercise `kind` updates: replace all `"index" as const` with `BandTargetKind.Index as const` (or just `BandTargetKind.Index`).

For the range exercises, add `scale` field and update `kind`:
```ts
scale: { type: "chromatic", root: 1 },
notes: [{ target: { kind: BandTargetKind.Range, from: 0, to: 2, accept: "below" }, seconds: 5 }],
```

For the tone-follow exercise, add `scale`:
```ts
scale: { type: "chromatic", root: 1 },
toneShape: { kind: "slide", from: { kind: BandTargetKind.Index, i: -1 }, to: { kind: BandTargetKind.Index, i: 0 } },
```

- [ ] **Step 2: Migrate part3.ts**

Has: 2 tone-follow (slides), 1 range exercise (`{ kind: "range", from: 0, to: 2, accept: "below" }`), 1 slot exercise (n=1).

- Tone-follow: add `scale: { type: "chromatic", root: 1 }`
- Range: add `scale: { type: "chromatic", root: 1 }`, update to `BandTargetKind.Range`
- Slot n=1: add `scale: { type: "even-7-from-major", root: 1 }`, target becomes `{ kind: BandTargetKind.Index, i: 0 }`
- Tone-follow sustain (slot n=4): add `scale: { type: "even-7-from-major", root: 1 }`, target becomes `{ kind: BandTargetKind.Index, i: 3 }`

- [ ] **Step 3a: Migrate slot-only parts (4, 5, 6, 8, 9, 11, 12, 13, 16, 18, 19)**

These parts only have pitch-detection exercises with slot targets. Same pattern for all:

1. Add `import { BandTargetKind } from "./types"`
2. Add `scale: { type: "even-7-from-major", root: 1 }` to each exercise
3. Convert `{ kind: "slot", n: X }` → `{ kind: BandTargetKind.Index, i: X - 1 }`

Example (one exercise from part4):
```ts
// Before
{ target: { kind: "slot", n: 1 }, seconds: 6 }
// After
scale: { type: "even-7-from-major", root: 1 },
{ target: { kind: BandTargetKind.Index, i: 0 }, seconds: 6 }
```

- [ ] **Step 3b: Migrate tone-follow slide parts (10, 14, 15, 17, 20)**

These have tone-follow exercises with slide shapes using `index` targets (high→low / low→high glides). Pattern:

1. Add `import { BandTargetKind } from "./types"`
2. Add `scale: { type: "chromatic", root: 1 }` to tone-follow slide exercises
3. Update `{ kind: "index", i: X }` → `{ kind: BandTargetKind.Index, i: X }`
4. Slot exercises in these files still get `scale: { type: "even-7-from-major", root: 1 }`

- [ ] **Step 3c: Migrate tone-follow sustain-with-slot parts (3, 7)**

These have tone-follow exercises with `sustain` shapes targeting a former slot note. **These need `even-7-from-major`, not `chromatic`**, because `index i` must resolve against 7 evenly-spaced major notes to preserve pitch behavior.

Example (part3 sustain):
```ts
// Before
toneShape: { kind: "sustain", target: { kind: "slot", n: 4 }, seconds: 8 }
// After
scale: { type: "even-7-from-major", root: 1 },
toneShape: { kind: "sustain", target: { kind: BandTargetKind.Index, i: 3 }, seconds: 8 }
```

Part 3 also has tone-follow slides (chromatic scale) and a range exercise (chromatic scale) — assign scales per exercise, not per file.
Part 7 also has tone-follow slides (chromatic scale).

- [ ] **Step 4: Run type check**

Run: `npx tsc --noEmit`
Expected: Part files compile. Remaining errors should only be in component files.

- [ ] **Step 5: Commit**

```bash
git add src/constants/journey/part*.ts
git commit -m "feat: migrate all exercise configs to scale-based targeting"
```

---

## Chunk 3: Component Updates

### Task 8: Update `PitchExercise` and `usePitchProgress`

**Files:**
- Modify: `src/components/Exercise/PitchExercise/PitchExercise.tsx`
- Modify: `src/components/Exercise/PitchExercise/usePitchProgress.ts`

- [ ] **Step 1: Update `usePitchProgress.ts`**

Change imports:
- `Band` → `ResolvedNote` from `@/constants/tone-slots`
- `isInTune, matchesBandTarget, resolveBandTarget` → `isInTune, matchesNoteTarget` from `@/lib/pitch`
- Add `import { Scale } from "@/lib/scale"`
- `BandTarget` → `NoteTarget` from journey types

In the hook, replace `resolveBandTarget(target, allBands)` calls with `scale.resolve(target)` — the hook will need a `Scale` instance passed in or constructed internally.

Rename all `Band` type annotations to `ResolvedNote`. Rename `allBands` → `allNotes`. Replace `matchesBandTarget` → `matchesNoteTarget`.

- [ ] **Step 2: Update `PitchExercise.tsx`**

Change imports:
- `Band` → `ColoredNote` from `@/constants/tone-slots` (for canvas props)
- `resolveBandTarget` → remove (use `Scale` instead)
- `matchesBandTarget` → `matchesNoteTarget`, `findClosestBand` → `findClosestNote` from `@/lib/pitch`
- Add `import { Scale } from "@/lib/scale"`

Replace the `exerciseBands` memo that calls `resolveBandTarget` with `Scale` construction:

```ts
const scale = useMemo(() => {
  if (exercise.exerciseTypeId === "pitch-detection" || exercise.exerciseTypeId === "pitch-detection-slide") {
    return new Scale(exercise.scale, vocalRange);
  }
  return null;
}, [exercise, vocalRange]);
```

Replace `resolveBandTarget(target, vocalRange.allBands)` → `scale.resolve(target)`.

Replace `matchesBandTarget(pitchHz, exerciseBands, rangeAccept)` → `matchesNoteTarget(pitchHz, scale.resolve(target), target.accept ?? "within")`.

Replace `findClosestBand(hz, bands)` → `findClosestNote(hz, notes)`.

For canvas rendering, use `scale.colorize()` to get `ColoredNote[]`.

Rename `allBands` → `allNotes` in VocalRange references.

- [ ] **Step 3: Remove `closestBand.isSlot` conditional**

`PitchExercise.tsx` has a conditional that uses `closestBand.isSlot` to switch display format (e.g., line ~281). Since `ColoredNote` has no `isSlot` field, replace with a single display format — always show `note.name` (e.g. "C4").

- [ ] **Step 4: Run type check**

Run: `npx tsc --noEmit`

- [ ] **Step 5: Commit**

```bash
git add src/components/Exercise/PitchExercise/
git commit -m "refactor: PitchExercise uses Scale class, Band→ResolvedNote/ColoredNote"
```

---

### Task 9: Update `ToneFollowExercise`

**Files:**
- Modify: `src/components/Exercise/ToneFollowExercise.tsx`

- [ ] **Step 1: Update imports and scale construction**

Replace `resolveBandTarget` with `Scale`. Construct scale from `exercise.scale`:

```ts
const scale = useMemo(
  () => new Scale(exercise.scale, vocalRange),
  [exercise.scale, vocalRange],
);
```

Replace ALL `resolveBandTarget` call sites:
- The `exerciseBands` memo (~line 44-55) → use `scale.resolve(target)`
- `handlePlayTone` function (~lines 136, 137, 150) → use `scale.resolve(target)`

Update prop types:
- `onPlayTone: (band: Band) => void` → `onPlayTone: (note: ColoredNote) => void`
- `onPlaySlide?: (fromBand: Band, toBand: Band) => void` → `onPlaySlide?: (from: ColoredNote, to: ColoredNote) => void`

Rename `Band` → `ColoredNote` for canvas, `ResolvedNote` for pitch logic. Rename `allBands` → `allNotes`.

- [ ] **Step 2: Commit**

```bash
git add src/components/Exercise/ToneFollowExercise.tsx
git commit -m "refactor: ToneFollowExercise uses Scale class"
```

---

### Task 10: Update `MelodyExercise`

**Files:**
- Modify: `src/components/Exercise/MelodyExercise.tsx`

- [ ] **Step 1: Replace `buildScaleForRange` and `resolveBandTarget` with `Scale`**

In `resolveScaleTimeline`, replace:

```ts
const localBands = buildScaleForRange(
  vocalRange.lowNote, vocalRange.highNote, segment.type, segment.root,
);
```

with:

```ts
const localScale = new Scale(
  { type: segment.type, root: segment.root },
  vocalRange,
);
```

Replace `resolveBandTarget(target, localBands)` → `localScale.resolve(target)`.

Update the `TimelineEntry` type: `band: Band` → `note: ColoredNote`. Update all producers and consumers of this field (`rect.band` → `rect.note`, etc.). The `MelodyRectNote` type in `PitchCanvas.tsx` (Task 11) has the same `band` → `note` rename — coordinate both files together.

- [ ] **Step 2: Update imports**

Remove `buildScaleForRange` import from `@/lib/vocal-scale`. Remove `resolveBandTarget` import from `@/lib/pitch`. Add `import { Scale } from "@/lib/scale"`.

- [ ] **Step 3: Commit**

```bash
git add src/components/Exercise/MelodyExercise.tsx
git commit -m "refactor: MelodyExercise uses Scale class per segment"
```

---

### Task 11: Update canvas components

**Files:**
- Modify: `src/components/PitchCanvas.tsx`
- Modify: `src/components/HillBallCanvas.tsx`
- Modify: `src/components/BalanceBallCanvas.tsx`

- [ ] **Step 1: Update `PitchCanvas.tsx`**

Replace `Band` import with `ColoredNote` from `@/constants/tone-slots`. Update all `Band` type annotations to `ColoredNote`. Keep the `bands` prop name (just change the type to `ColoredNote[]`) to avoid touching all call sites in one step.

Replace function imports: `findClosestBand` → `findClosestNote`, `matchesBandTarget` → `matchesNoteTarget`, `isInBandRange` → `isInNoteRange`.

Update `MelodyRectNote` type: `band: Band` → `note: ColoredNote`. Update all references to `rect.band` → `rect.note` within `PitchCanvas.tsx`.

> **Prop rename strategy:** Canvas component props keep the name `bands` but change the type to `ColoredNote[]`. The `VocalRange.allBands` → `allNotes` rename happens at the interface level (Task 2). This avoids a blast-radius issue of renaming props across all callers simultaneously.

- [ ] **Step 2: Update `HillBallCanvas.tsx`**

Same pattern: `Band` → `ColoredNote`, function renames.

- [ ] **Step 3: Update `BalanceBallCanvas.tsx`**

Same pattern: `Band` → `ColoredNote`, function renames.

- [ ] **Step 4: Commit**

```bash
git add src/components/PitchCanvas.tsx src/components/HillBallCanvas.tsx src/components/BalanceBallCanvas.tsx
git commit -m "refactor: canvas components Band→ColoredNote"
```

---

### Task 12: Update remaining components

**Files:**
- Modify: `src/components/TrainView.tsx`
- Modify: `src/components/AppShell/AppShell.tsx`
- Modify: `src/context/AppContext.tsx`
- Modify: `src/components/Exercise/BaseExercise.tsx`
- Modify: `src/components/Exercise/LearnNotesExercise.tsx`
- Modify: `src/components/JourneyView/JourneyView.tsx`
- Modify: `src/components/JourneyView/components/JourneyExercise.tsx`

- [ ] **Step 1: Update `AppContext.tsx`**

`Band` → `ColoredNote` in context type:
```ts
playTone: (note: ColoredNote) => void;
playSlide: (fromNote: ColoredNote, toNote: ColoredNote) => void;
```

- [ ] **Step 2: Update `AppShell.tsx`**

`Band` → `ColoredNote` in callbacks.

- [ ] **Step 3: Update `BaseExercise.tsx`**

`Band` → `ColoredNote` in props.

- [ ] **Step 4: Update `TrainView.tsx`**

`Band` → `ColoredNote`, `allBands` → `allNotes`. Replace `getScaleNotesForRange` return type handling. Remove `slotBands = allBands.filter(b => b.isSlot)` — this filtering concept goes away. If `TrainView` uses slot bands for UI buttons, this needs a replacement (e.g., show all 7 notes from the `even-7-from-major` scale, or use `NOTE_PALETTE` colors).

- [ ] **Step 5: Update `LearnNotesExercise.tsx`**

`Band` → `ColoredNote`. Remove `isSlot` filtering — show all notes or use a different criterion.

- [ ] **Step 6: Update `JourneyView.tsx`**

`Band` → `ColoredNote` in props.

- [ ] **Step 7: Update `JourneyExercise.tsx`**

`Band` → `ColoredNote`, `allBands` → `allNotes`. Update `getScaleNotesForRange` call.

- [ ] **Step 8: Commit**

```bash
git add src/components/TrainView.tsx src/components/AppShell/AppShell.tsx src/context/AppContext.tsx src/components/Exercise/BaseExercise.tsx src/components/Exercise/LearnNotesExercise.tsx src/components/JourneyView/
git commit -m "refactor: remaining components Band→ColoredNote, allBands→allNotes"
```

---

### Task 13: Update `JourneyView/utils.ts`

**Files:**
- Modify: `src/components/JourneyView/utils.ts`

- [ ] **Step 1: Remove slot-based functions and imports**

Remove imports of `SlotId`, `SLOTS`, `SLOT_ORDER` from `@/constants/tone-slots`.

Remove `getExerciseSlot()` and `getExerciseSlotIds()` functions entirely.

Update `getExerciseDisplayColors()` — replace slot-based color lookup with scale-based derivation. Since this function runs at list/card level (no `VocalRange` available), it can return colors from `NOTE_PALETTE` based on the exercise's scale type:

```ts
import { NOTE_PALETTE } from "@/constants/tone-slots";

export function getExerciseDisplayColors(exercise: JourneyExercise): string[] {
  // Default: full palette
  return NOTE_PALETTE.map((p) => p.color);
}
```

> **Intentional simplification:** The spec says "derive colors from scale" but `getExerciseDisplayColors` runs at card/list level without a `VocalRange`, so we can't construct a `Scale`. Returning the full 7-color palette preserves the current visual appearance (cards already showed all 7 colors). Per-exercise color derivation can be added later if needed.

- [ ] **Step 2: Check callers**

Run `npx tsc --noEmit` and verify `ExerciseCard.tsx` and `ExerciseInfoModal.tsx` still compile — their call signature `getExerciseDisplayColors(exercise): string[]` is unchanged.

- [ ] **Step 3: Commit**

```bash
git add src/components/JourneyView/utils.ts
git commit -m "refactor: remove slot logic from JourneyView utils, simplify display colors"
```

---

### Task 14: Update stories

**Files:**
- Modify: `src/components/HillBallCanvas.stories.tsx`
- Modify: `src/components/BalanceBallCanvas.stories.tsx`

- [ ] **Step 1: Update story mock data**

Replace `Band` type with `ColoredNote` in all mock band objects. Remove `isSlot` and `slotId` fields from mock data.

- [ ] **Step 2: Commit**

```bash
git add src/components/HillBallCanvas.stories.tsx src/components/BalanceBallCanvas.stories.tsx
git commit -m "refactor: update stories Band→ColoredNote"
```

---

## Chunk 4: Verification & Cleanup

### Task 15: Full type check and grep audit

- [ ] **Step 1: Run full type check**

Run: `npx tsc --noEmit`
Expected: Zero errors.

- [ ] **Step 2: Grep for leftover references**

Run: `grep -rn "BandTarget\|\"slot\"\|isSlot\|slotId\|SLOT_ORDER\|\bSLOTS\b\|SlotId\|resolveBandTarget\|findClosestBand\|matchesBandTarget\|isInBandRange\|buildScaleForRange\|allBands" src/ --include="*.ts" --include="*.tsx"`

Expected: No matches (except possibly in comments that can be cleaned up).

Also check for stray `Band` type references: `grep -rn "\bBand\b" src/ --include="*.ts" --include="*.tsx" | grep -v ColoredNote | grep -v ResolvedNote | grep -v bandwidth | grep -v bandpass`

- [ ] **Step 3: Fix any remaining references found in step 2**

- [ ] **Step 4: Commit any fixes**

```bash
git add src/
git commit -m "chore: clean up remaining old type references"
```

---

### Task 16: Update spec documentation

**Files:**
- Modify: `specs/exercise-config-flow.md`

- [ ] **Step 1: Update spec to reflect new types**

Replace references to `BandTarget`, `slot`, `Band` with `NoteTarget`, `BandTargetKind`, `ResolvedNote`/`ColoredNote`. Update the targeting examples.

- [ ] **Step 2: Commit**

```bash
git add specs/exercise-config-flow.md
git commit -m "docs: update exercise-config-flow spec for scale-based targeting"
```

---

### Task 17: Manual verification

- [ ] **Step 1: Run dev server**

Run: `npm run dev`
Navigate through exercises and verify:

- [ ] **Step 2: Verify pitch detection exercises** — parts 2–20, single note and sequence
- [ ] **Step 3: Verify pitch-detection-slide exercises** — parts with `SlideConfig`
- [ ] **Step 4: Verify range exercises** — part 2 Low U, Hoo hoo; part 3 Low hum (accept: below/above)
- [ ] **Step 5: Verify tone-follow slides** — parts 2, 3, 7, 10, 14, 15, 17, 20
- [ ] **Step 6: Verify tone-follow sustain** — parts 3, 7 (former slot targets must produce same pitches)
- [ ] **Step 7: Verify melody** — part 2 Perfect Fifth (chords + singing)
- [ ] **Step 8: Verify learn-notes-1** — confirm it still renders after `Band` → `ColoredNote`
- [ ] **Step 9: Verify breathwork-farinelli** — confirm it still renders (no pitch logic, but imports may have changed)
- [ ] **Step 10: Verify exercise card colors** — journey list shows color strips
- [ ] **Step 11: Verify Storybook builds**

Run: `npm run storybook`
Expected: Stories render without errors.
