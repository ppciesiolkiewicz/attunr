# Melody Event Queue & Musical Timing

## Context

Melody exercises have two separate timelines (`melody` and `backingTrack`) with independent cursors and raw `seconds` durations. This makes it hard to align backing track chords with melody notes — timing must be manually matched. There's also no concept of musical tempo.

This spec replaces the dual-timeline system with a unified event queue using musical durations and tempo.

## Design

### Unified event queue

`MelodyScale` contains `events: MelodyEvent[]` instead of `notes: MelodyNoteConfig[]`. All audio (chords, single notes, melody notes) and silence live in one flat timeline. No separate `backingTrack`.

### Musical durations

A numeric enum based on sixteenths for integer math:

```ts
enum NoteDuration {
  Whole = 16,
  DottedHalf = 12,
  Half = 8,
  DottedQuarter = 6,
  Quarter = 4,
  DottedEighth = 3,
  Eighth = 2,
  Sixteenth = 1,
}
```

Duration in seconds: `(value / 4) * (60 / tempo)`.

### Event types

```ts
type MelodyEvent =
  | { type: "note"; target: BandTarget; duration: NoteDuration; silent?: boolean }
  | { type: "play"; targets: BandTarget[]; duration: NoteDuration }
  | { type: "pause"; duration: NoteDuration }
```

| Event | Audio | Rectangle | Scored |
|-------|-------|-----------|--------|
| `note` | plays piano | yes | yes |
| `note` (silent) | no | dashed | yes |
| `play` | plays piano (1+ notes) | no | no |
| `pause` | no | no | no |

- `note` — user sings along, shown on canvas, scored for pitch accuracy
- `play` — audio-only, `targets: BandTarget[]` (always array — single element for one note, multiple for chord)
- `pause` — silence gap, no visual or audio

### Updated types

```ts
interface MelodyScale {
  type: string;       // tonal.js scale name
  root: number;       // 1-indexed chromatic degree from user's lowest note
  events: MelodyEvent[];
}

interface MelodyExercise extends BaseExerciseConfig {
  exerciseTypeId: "melody";
  tempo: number;                // BPM — quarter note = 1 beat
  melody: MelodyScale[];        // single unified timeline (no backingTrack)
  displayNotes?: DisplayScale[];
  minScore: number;
  instruction: string;
}
```

### Timeline resolution

`resolveScaleTimeline` iterates `MelodyScale[]` as before but:

1. Computes `durationMs` from `event.duration` and `tempo`: `(event.duration / 4) * (60 / tempo) * 1000`
2. For `note` events: resolves `target` against the segment's scale pool, emits a `NoteTimeline` entry (shown, scored)
3. For `play` events: resolves each target in `targets` against the segment's scale pool, emits entries at the same `startMs` (audio only — a new `audioOnly` flag on `NoteTimeline`, or a separate `AudioTimeline` type)
4. For `pause` events: advances cursor, no entry emitted
5. Cursor advances by `durationMs` for all event types

### Audio scheduling

`handleStart` builds the audio schedule from the resolved timeline. All entries with audio (both `note` and `play` types) are scheduled on `Tone.Transport`. `play` entries at the same `startMs` produce simultaneous notes (chords).

### Perfect Fifth config example

At tempo 60 (quarter = 1s, half = 2s):

```ts
{
  tempo: 60,
  melody: [1, 2, 3, 4, 5, 6, 7].flatMap((root, i) => [
    // Previous chord (or pause for first segment)
    i === 0
      ? { type: "major", root: 1, events: [
          { type: "pause", duration: NoteDuration.Quarter },
        ]}
      : { type: "major", root: i, events: [
          { type: "play", targets: [
            { kind: "index", i: 0 },
            { kind: "index", i: 2 },
            { kind: "index", i: 4 },
          ], duration: NoteDuration.Quarter },
        ]},
    // Current chord → pause → sing root → sing fifth
    { type: "major", root, events: [
      { type: "play", targets: [
        { kind: "index", i: 0 },
        { kind: "index", i: 2 },
        { kind: "index", i: 4 },
      ], duration: NoteDuration.Quarter },
      { type: "pause", duration: NoteDuration.Eighth },
      { type: "note", target: { kind: "index", i: 0 }, duration: NoteDuration.Half },
      { type: "note", target: { kind: "index", i: 4 }, duration: NoteDuration.Half },
    ]},
  ]),
}
```

Per pair: quarter (1s) + quarter (1s) + eighth (0.5s) + half (2s) + half (2s) = 5.5s. Full exercise: ~38.5s.

## Files to modify

| File | Change |
|------|--------|
| `src/constants/journey/types.ts` | Replace `MelodyNoteConfig` with `MelodyEvent`, add `NoteDuration` enum, update `MelodyScale.events`, add `tempo` to `MelodyExercise`, remove `backingTrack` |
| `src/components/Exercise/MelodyExercise.tsx` | Update `resolveScaleTimeline` for new event types + tempo, remove `backingTimeline` memo, update audio scheduling to handle `play` events |
| `src/constants/journey/part2.ts` | Migrate Perfect Fifth to new format |
| `src/constants/journey/index.ts` | Update exports (`MelodyEvent`, `NoteDuration`; remove `MelodyNoteConfig`) |

## What does NOT change

- `MelodyScale.type` and `MelodyScale.root` — same meaning
- `buildScaleForRange()` — unchanged
- `resolveBandTarget()` — unchanged
- PitchCanvas rendering — accepts same `MelodyRectNote[]`
- `usePianoSampler` — unchanged, receives same `{ frequencyHz, startSec, durationSec }[]`
- `VocalRange` — unchanged
- `DisplayNote` / `DisplayScale` — unchanged
- Scoring logic — unchanged (operates on resolved note entries)

## Migration

`MelodyNoteConfig` is removed. The mapping:

| Old | New |
|-----|-----|
| `{ target, seconds }` | `{ type: "note", target, duration }` |
| `{ target, seconds, silent: true }` | `{ type: "note", target, duration, silent: true }` |
| `{ rest: true, seconds }` | `{ type: "pause", duration }` |
| `backingTrack` notes | `{ type: "play", targets: [...], duration }` inline in `melody` |

## Verification

1. `npx tsc --noEmit` — no type errors
2. Run dev server, navigate to Perfect Fifth exercise
3. Verify chords play simultaneously, correctly timed before each singing pair
4. Verify note rectangles render and scoring works
5. Verify all non-melody exercises still work (no changes to their types)
