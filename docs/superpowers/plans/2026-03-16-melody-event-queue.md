# Melody Event Queue Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace dual-timeline melody system (melody + backingTrack with seconds) with a unified event queue using musical durations and tempo.

**Architecture:** `MelodyNoteConfig` is replaced by `MelodyEvent` (note/play/pause). `MelodyScale.notes` becomes `MelodyScale.events`. `backingTrack` is removed — `play` events live inline. `NoteDuration` enum provides musical timing resolved via `tempo` BPM.

**Tech Stack:** TypeScript, React, tonal.js, Tone.js

---

## File Structure

| File | Responsibility | Change |
|------|---------------|--------|
| `src/constants/journey/types.ts` | Exercise config types | Add `NoteDuration`, `MelodyEvent`; update `MelodyScale`, `MelodyExercise`; remove `MelodyNoteConfig` |
| `src/components/Exercise/MelodyExercise.tsx` | Melody exercise component | Update `resolveScaleTimeline`, `NoteTimeline`, audio scheduling; remove `backingTimeline` |
| `src/constants/journey/part2.ts` | Part 2 exercise configs | Migrate Perfect Fifth to event queue format |
| `src/constants/journey/index.ts` | Journey exports + intro modal builder | Update exports; fix `buildIntroModal` note counting |

---

### Task 1: Update types — `NoteDuration`, `MelodyEvent`, `MelodyScale`, `MelodyExercise`

**Files:**
- Modify: `src/constants/journey/types.ts:174-218`

- [ ] **Step 1: Replace `MelodyNoteConfig` with `NoteDuration` enum and `MelodyEvent` type**

Replace lines 174-178 with:

```ts
/** Musical note duration in sixteenths. Duration in seconds: (value / 4) * (60 / tempo). */
export enum NoteDuration {
  Whole = 16,
  DottedHalf = 12,
  Half = 8,
  DottedQuarter = 6,
  Quarter = 4,
  DottedEighth = 3,
  Eighth = 2,
  Sixteenth = 1,
}

/** A melody timeline event. */
export type MelodyEvent =
  | { type: "note"; target: BandTarget; duration: NoteDuration; silent?: boolean }
  | { type: "play"; targets: BandTarget[]; duration: NoteDuration }
  | { type: "pause"; duration: NoteDuration };
```

- [ ] **Step 2: Update `MelodyScale` — `notes` → `events`**

Replace lines 180-188 with:

```ts
/** A scale segment — defines a note pool for a group of melody events. */
export interface MelodyScale {
  /** Tonal.js scale name: "major", "minor", "chromatic", "pentatonic", etc. */
  type: string;
  /** 1-indexed chromatic degree from user's lowest note (1 = lowest, 12 = 11 semitones above). */
  root: number;
  /** Events resolved against this scale's note pool. Only index/range targets — not slot. */
  events: MelodyEvent[];
}
```

- [ ] **Step 3: Update `MelodyExercise` — add `tempo`, remove `backingTrack`**

Replace lines 207-218 with:

```ts
export interface MelodyExercise extends BaseExerciseConfig {
  exerciseTypeId: "melody";
  /** BPM — quarter note = 1 beat. Duration formula: (NoteDuration / 4) * (60 / tempo) seconds. */
  tempo: number;
  /** Scale segments with events — single unified timeline (chords, notes, pauses). */
  melody: MelodyScale[];
  /** Optional override for which notes appear on the canvas. Omit to auto-derive from melody. */
  displayNotes?: DisplayScale[];
  /** Score threshold (0–100) to complete. Always shown. 0 = any score passes. */
  minScore: number;
  instruction: string;
}
```

- [ ] **Step 4: Verify types compile**

Run: `npx tsc --noEmit 2>&1 | head -30`
Expected: Type errors in `MelodyExercise.tsx`, `part2.ts`, `index.ts` (expected — they reference old types). No errors in `types.ts` itself.

- [ ] **Step 5: Commit**

```bash
git add src/constants/journey/types.ts
git commit -m "feat: replace MelodyNoteConfig with MelodyEvent + NoteDuration enum"
```

---

### Task 2: Update exports and `buildIntroModal` in `index.ts`

**Files:**
- Modify: `src/constants/journey/index.ts:24-55,86-103`

- [ ] **Step 1: Update type exports**

Replace the export block. Remove `MelodyNoteConfig`, add `MelodyEvent` and `NoteDuration`:

```ts
export type {
  // ... all existing types except MelodyNoteConfig ...
  MelodyExercise,
  MelodyScale,
  DisplayNote,
  DisplayScale,
} from "./types";

export { NoteDuration } from "./types";
export type { MelodyEvent } from "./types";
```

Note: `NoteDuration` is an enum (value export), not just a type.

- [ ] **Step 2: Update `buildIntroModal` melody note counting**

Replace line 98:

```ts
// Old:
const noteCount = exercise.melody.flatMap((s) => s.notes).filter((n) => !("rest" in n && n.rest)).length;

// New:
const noteCount = exercise.melody.flatMap((s) => s.events).filter((e) => e.type === "note").length;
```

- [ ] **Step 3: Commit**

```bash
git add src/constants/journey/index.ts
git commit -m "chore: update journey exports for MelodyEvent, fix intro modal note count"
```

---

### Task 3: Update `resolveScaleTimeline` and component in `MelodyExercise.tsx`

**Files:**
- Modify: `src/components/Exercise/MelodyExercise.tsx`

This is the core change. The file currently has ~472 lines.

- [ ] **Step 1: Update imports**

Replace line 9:

```ts
// Old:
import type { MelodyExercise as MelodyConfig, MelodyNoteConfig, MelodyScale } from "@/constants/journey";

// New:
import type { MelodyExercise as MelodyConfig, MelodyEvent } from "@/constants/journey";
```

- [ ] **Step 2: Add `audioOnly` to `NoteTimeline`**

Update the `NoteTimeline` interface (lines 34-40):

```ts
interface NoteTimeline {
  band: Band;
  startMs: number;
  durationMs: number;
  silent?: boolean;
  audioOnly?: boolean;
  isRest: false;
}
```

- [ ] **Step 3: Add `durationToMs` helper**

Add after the `CLOSE_THRESHOLD` constant (line 20):

```ts
/** Convert a NoteDuration to milliseconds at a given tempo. */
function durationToMs(duration: number, tempo: number): number {
  return (duration / 4) * (60 / tempo) * 1000;
}
```

- [ ] **Step 4: Rewrite `resolveScaleTimeline`**

Replace the entire function (lines 50-95) with:

```ts
/** Resolve MelodyScale[] segments into a flat timeline of entries. */
function resolveScaleTimeline(
  scales: MelodyScale[],
  tempo: number,
  vocalRange: VocalRange,
): TimelineEntry[] {
  const entries: TimelineEntry[] = [];
  let cursor = 0;
  for (const segment of scales) {
    const localBands = buildScaleForRange(
      vocalRange.lowNote, vocalRange.highNote, segment.type, segment.root,
    );
    for (const event of segment.events) {
      const durationMs = durationToMs(event.duration, tempo);
      if (event.type === "pause") {
        // Advance cursor only — no entry emitted
      } else if (event.type === "play") {
        // Audio-only: emit one entry per target at same startMs
        for (const target of event.targets) {
          const bands = resolveBandTarget(target, localBands);
          if (bands.length > 0) {
            entries.push({
              band: bands[0],
              startMs: cursor,
              durationMs,
              audioOnly: true,
              isRest: false,
            });
          }
        }
      } else {
        // note: singable, shown on canvas, scored
        const bands = resolveBandTarget(event.target, localBands);
        if (bands.length > 0) {
          entries.push({
            band: bands[0],
            startMs: cursor,
            durationMs,
            silent: event.silent,
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

Note: `MelodyScale` type is inferred from the `scales` parameter — no explicit import needed since it's the element type of `MelodyConfig["melody"]`.

- [ ] **Step 5: Update `melodyTimeline` memo — pass `tempo`, remove `backingTimeline`**

Replace lines 110-121:

```ts
  // ── Resolve melody timeline ─────────────────────────────────────────────
  const melodyTimeline = useMemo(
    () => resolveScaleTimeline(exercise.melody, exercise.tempo, vocalRange),
    [exercise.melody, exercise.tempo, vocalRange],
  );
```

Delete the entire `backingTimeline` memo (lines 116-121).

- [ ] **Step 6: Update `singableNotes` to exclude `audioOnly`**

Replace lines 128-132:

```ts
  // Singable notes only (no rests, no audioOnly) — used for scoring and rendering
  const singableNotes = useMemo(
    () => melodyTimeline.filter((e): e is NoteTimeline => !e.isRest && !e.audioOnly),
    [melodyTimeline],
  );
```

- [ ] **Step 7: Update `handleStart` audio scheduling — remove `backingTimeline` loop**

Replace the audio scheduling in `handleStart` (lines 204-226):

```ts
    // Build schedule for Tone.js — all non-silent entries with audio
    const audioNotes: { frequencyHz: number; startSec: number; durationSec: number }[] = [];

    for (const n of melodyTimeline) {
      if (n.isRest) continue;
      // Skip silent notes (shown but not played)
      if (n.silent) continue;
      audioNotes.push({
        frequencyHz: n.band.frequencyHz,
        startSec: (n.startMs + PRE_ROLL_MS) / 1000,
        durationSec: n.durationMs / 1000,
      });
    }

    scheduleMelody(audioNotes);
```

Also remove `backingTimeline` from the `useCallback` dependency array (line 237):

```ts
  // Old:
  }, [isLoaded, isPlaying, singableNotes, backingTimeline, scheduleMelody, buildRectNotes]);
  // New:
  }, [isLoaded, isPlaying, singableNotes, melodyTimeline, scheduleMelody, buildRectNotes]);
```

- [ ] **Step 8: Verify types compile**

Run: `npx tsc --noEmit 2>&1 | head -30`
Expected: Errors only in `part2.ts` (old config format). `MelodyExercise.tsx` should compile clean.

- [ ] **Step 9: Commit**

```bash
git add src/components/Exercise/MelodyExercise.tsx
git commit -m "feat: unified event queue in resolveScaleTimeline with tempo support"
```

---

### Task 4: Migrate Perfect Fifth config in `part2.ts`

**Files:**
- Modify: `src/constants/journey/part2.ts:46-89`

- [ ] **Step 1: Import `NoteDuration`**

Add to line 1:

```ts
import type { JourneyExerciseInput } from "./types";
import { NoteDuration } from "./types";
```

- [ ] **Step 2: Replace Perfect Fifth config**

Replace lines 46-89 with:

```ts
  {
    part: 2,
    exerciseTypeId: "melody",
    title: "Perfect Fifth",
    subtitle: "Sing two notes · intervals",
    technique: "sustain",
    tempo: 60,
    melody: [1, 2, 3, 4, 5, 6, 7].flatMap((root, i) => {
      const majorChord = (r: number) => ({
        type: "major",
        root: r,
        events: [
          { type: "play" as const, targets: [
            { kind: "index" as const, i: 0 },
            { kind: "index" as const, i: 2 },
            { kind: "index" as const, i: 4 },
          ], duration: NoteDuration.Quarter },
        ],
      });
      return [
        // Previous chord (or pause for first pair)
        i === 0
          ? { type: "major", root: 1, events: [
              { type: "pause" as const, duration: NoteDuration.Quarter },
            ]}
          : majorChord(i),
        // Current chord → pause → sing root → sing fifth
        {
          type: "major",
          root,
          events: [
            { type: "play" as const, targets: [
              { kind: "index" as const, i: 0 },
              { kind: "index" as const, i: 2 },
              { kind: "index" as const, i: 4 },
            ], duration: NoteDuration.Quarter },
            { type: "pause" as const, duration: NoteDuration.Eighth },
            { type: "note" as const, target: { kind: "index" as const, i: 0 }, duration: NoteDuration.Half },
            { type: "note" as const, target: { kind: "index" as const, i: 4 }, duration: NoteDuration.Half },
          ],
        },
      ];
    }),
    minScore: 0,
    instruction: "Sing the two notes as they appear — the piano plays each note for you",
  },
```

- [ ] **Step 3: Verify full compilation**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/constants/journey/part2.ts
git commit -m "feat: migrate Perfect Fifth to event queue with chord lead-ins"
```

---

### Task 5: Verify

- [ ] **Step 1: Full type check**

Run: `npx tsc --noEmit`
Expected: Clean — no errors.

- [ ] **Step 2: Production build**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds.

- [ ] **Step 3: Verify no remaining references to old types**

Search for `MelodyNoteConfig`, `backingTrack`, `\.notes` on MelodyScale:

```bash
grep -r "MelodyNoteConfig\|backingTrack" src/ --include="*.ts" --include="*.tsx"
grep -rn "\.notes" src/constants/journey/ --include="*.ts" | grep -v "displayNotes\|\.notes\[" | grep -i melody
```

Expected: No matches (except possibly comments or unrelated code).
