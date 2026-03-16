# Resolve Exercise Design

## Problem

Each exercise component (PitchExercise, ToneFollowExercise, MelodyExercise) independently instantiates `Scale`, calls `resolve()` and `colorize()`, and computes display notes. This duplicates ~40 lines of resolution logic per component and means components must understand the abstract config format.

## Solution

A pure function `resolveExercise(exercise, vocalRange)` that transforms abstract exercise configs into resolved exercises with concrete `ColoredNote` references. Called once in `BaseExercise` via `useMemo`. Exercise components receive ready-to-render data — no Scale instantiation needed.

## Resolved Types

All `ColoredNote` references point to objects in `VocalRange.allNotes` (shared references, not copies). The resolver looks up notes by MIDI number in `VocalRange.allNotes` rather than using `Scale.colorize()` output (which creates new objects via spread). This preserves reference equality for React memoization.

```ts
// Base — shared by all resolved exercises
interface ResolvedExerciseBase {
  exerciseTypeId: ExerciseTypeId;
  /** Notes to render on canvas, sorted low→high. */
  displayNotes: ColoredNote[];
  /** IDs of notes to highlight (subset of displayNotes). */
  highlightIds: string[];
}

interface ResolvedPitchDetection extends ResolvedExerciseBase {
  exerciseTypeId: "pitch-detection";
  /** Target notes the user must hit, in sequence. Each with hold duration. */
  targets: { note: ColoredNote; seconds: number }[];
}

interface ResolvedPitchDetectionSlide extends ResolvedExerciseBase {
  exerciseTypeId: "pitch-detection-slide";
  from: ColoredNote;
  to: ColoredNote;
}

interface ResolvedToneFollow extends ResolvedExerciseBase {
  exerciseTypeId: "tone-follow";
  toneShape:
    | { kind: "slide"; from: ColoredNote; to: ColoredNote }
    | { kind: "sustain"; note: ColoredNote; seconds: number };
  requiredPlays: number;
}

interface ResolvedMelody extends ResolvedExerciseBase {
  exerciseTypeId: "melody";
  tempo: number;
  minScore: number;
  /** Pre-resolved timeline — no Scale needed at render time. */
  timeline: ResolvedTimelineEntry[];
  totalDurationMs: number;
}

interface ResolvedTimelineEntry {
  note: ColoredNote;
  startMs: number;
  durationMs: number;
  silent?: boolean;
  /** True for "play" events (piano-only chords) — not scored, not sung, but scheduled for playback. */
  audioOnly?: boolean;
}

type ResolvedExercise =
  | ResolvedPitchDetection
  | ResolvedPitchDetectionSlide
  | ResolvedToneFollow
  | ResolvedMelody;
```

Only note-bearing exercise types are resolved. `learn`, `learn-notes-1`, and `breathwork-farinelli` are passed through unchanged.

## The Resolver Function

```ts
function resolveExercise(
  exercise: JourneyExercise,
  vocalRange: VocalRange,
): ResolvedExercise
```

**File:** `src/lib/resolve-exercise.ts` — pure function, no React dependency.

### Resolution logic per type

**pitch-detection:**
1. Instantiate `Scale(exercise.scale, vocalRange)`
2. `scale.colorize()` to get `ColoredNote[]`
3. For each `exercise.notes[]`, resolve `target` → `ColoredNote`
4. Build display range: exercise notes ±1 neighbor from the colored notes array for context
5. Highlight IDs = exercise note IDs

**pitch-detection-slide:**
1. Instantiate Scale, colorize
2. Resolve `from` and `to` targets → `ColoredNote`
3. Display notes = all colored notes between from and to
4. Highlight IDs = from and to IDs

**tone-follow:**
1. Instantiate Scale, colorize
2. Resolve `toneShape` targets (slide from/to or sustain target) → `ColoredNote`
3. If `exercise.displayNotes` config exists, instantiate a second Scale for the display scale and compute which notes to highlight
4. Display notes = full range between endpoints; highlights from display scale

**melody:**
1. For each `MelodyScale` segment in `exercise.melody`:
   - Instantiate `Scale({ type: segment.type, root: segment.root }, vocalRange)`
   - Colorize the scale
   - For each event:
     - `"note"` → one `ResolvedTimelineEntry` with `audioOnly: false`
     - `"play"` (chord) → one entry per target at the same `startMs`, each with `audioOnly: true` (piano playback only, not scored)
     - `"pause"` → no entry emitted; only advances the cursor (matches existing behavior)
   - Compute `startMs`/`durationMs` from `exercise.tempo`
2. Flatten into `timeline: ResolvedTimelineEntry[]` with cumulative `startMs`
3. Compute `totalDurationMs`
4. Display notes = deduplicated sorted set of all notes in timeline
5. Highlight IDs = all display note IDs

## BaseExercise Integration

```ts
const resolved = useMemo(() => {
  if (exercise.exerciseTypeId === "learn" ||
      exercise.exerciseTypeId === "learn-notes-1" ||
      exercise.exerciseTypeId === "breathwork-farinelli") {
    return null;
  }
  return resolveExercise(exercise, vocalRange);
}, [exercise, vocalRange]);
```

Note-bearing components receive `resolved` as a prop. Non-note components receive the raw config as today.

## Component Changes

**PitchExercise:** Receives `ResolvedPitchDetection | ResolvedPitchDetectionSlide`. Deletes internal Scale instantiation, `colorize()`, `exerciseNotes`/`exerciseColoredNotes`/`displayNotes`/`highlightIds` memos (~40 lines). Uses `resolved.targets` for scoring in `usePitchProgress`.

**ToneFollowExercise:** Receives `ResolvedToneFollow`. Deletes Scale instantiation and display scale resolution. Uses `resolved.toneShape.from`/`.to` directly for audio playback callbacks.

**MelodyExercise:** Receives `ResolvedMelody`. Deletes `resolveScaleTimeline` function entirely. Uses `resolved.timeline` and `resolved.totalDurationMs` directly. Scoring uses `resolved.timeline[i].note.frequencyHz` for pitch comparison.

**usePitchProgress hook:** New interface — receives `ResolvedPitchDetection | ResolvedPitchDetectionSlide` instead of `exercise + scale`. For single-target detection: uses `resolved.targets[0].note.frequencyHz` and `resolved.targets[0].seconds`. For multi-target sequences: iterates `resolved.targets[]`. For slides: uses `resolved.from`/`resolved.to`. Removes all internal `scale.resolve()` calls.

**LearnNotesExercise, FarinelliExercise:** No changes.

## File Location

`src/lib/resolve-exercise.ts` — alongside `scale.ts` and `pitch.ts`.

Resolved types go in `src/lib/resolve-exercise.ts` (co-located with the function that produces them).
