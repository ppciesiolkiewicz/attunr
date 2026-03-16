# Rhythm Exercise Design

## Overview

A new `rhythm` exercise type where the user taps along to a scrolling timeline of beat markers. Input is via spacebar (desktop), touch (mobile), or click. Scoring uses timing windows (hit/close/missed), consistent with the melody exercise.

## Config Type

Add `"rhythm"` to `ExerciseTypeId` and a new `RhythmExercise` to the `JourneyExercise` discriminated union in `types.ts`.

```typescript
export interface RhythmExercise extends BaseExerciseConfig {
  exerciseTypeId: "rhythm";
  tempo: number;             // BPM (quarter note = 1 beat)
  pattern: RhythmEvent[];    // tap/pause sequence
  metronome?: boolean;       // audible click on every beat (default false)
  minScore: number;          // 0-100 pass threshold
  instruction: string;
}

export type RhythmEvent =
  | { type: "tap"; duration: NoteDuration }
  | { type: "pause"; duration: NoteDuration };
```

`RhythmEvent` mirrors `MelodyEvent` — `tap` replaces `note`, `pause` is the same. Reuses the existing `NoteDuration` enum. Duration math is identical: `seconds = (value / 4) * (60 / tempo)`.

The `metronome` flag enables an audible tick on every beat marker, useful for simpler exercises where the user needs an audio cue.

## Resolution

Add `resolveRhythm()` to `resolve-exercise.ts`. It follows the same pattern as `resolveMelody()`.

```typescript
export interface ResolvedRhythm extends ResolvedExerciseBase {
  exerciseTypeId: "rhythm";
  tempo: number;
  metronome: boolean;
  minScore: number;
  beats: ResolvedBeat[];
  totalDurationMs: number;
}

export interface ResolvedBeat {
  startMs: number;     // absolute time from exercise start (after PRE_ROLL_MS)
  durationMs: number;  // visual width of the beat marker
}
```

The resolver iterates `pattern`, converts each event's `NoteDuration` to milliseconds using `tempo`, and accumulates absolute `startMs` for each `tap` event. Pauses advance the cursor but don't produce beats. Only taps appear in `beats[]`.

Rhythm exercises don't use pitch or scales, so `displayNotes` and `highlightIds` on `ResolvedExerciseBase` are empty arrays.

## Component: RhythmExercise

New file: `src/components/Exercise/RhythmExercise.tsx`

Mirrors `MelodyExercise.tsx` structure:
- Accepts `ResolvedRhythm` + completion callbacks
- RAF loop tracking elapsed time against `beats`
- On completion, calculates overall score and fires confetti if `>= minScore`

### Input handling

Three input methods, all firing the same `handleTap()`:
- `keydown` (spacebar) — desktop
- `touchstart` on canvas — mobile
- `mousedown` — fallback

Each tap is timestamped with `performance.now()` and matched against the nearest unmatched beat. A tap can only match one beat; each beat can only be matched once (first-come). Debounce: ignore taps within 50ms of the previous tap.

### Scoring

Per-beat classification based on timing error (absolute difference between tap time and beat center):
- **Hit**: within +-80ms — score weight 1.0
- **Close**: within +-150ms — score weight 0.5
- **Missed**: no tap or beyond +-150ms — score weight 0.0

Overall score: `Math.round((sum of weights / beat count) * 100)`

These thresholds are constants, easy to tune later.

## Canvas: RhythmCanvas

New file: `src/components/RhythmCanvas.tsx`

A dedicated canvas for rhythm — simpler than PitchCanvas since there are no pitch bands. Single horizontal lane.

### Layout
- Beat markers scroll right-to-left
- Reuse `PX_PER_MS` (~0.094) scroll speed from PitchCanvas for consistent feel
- "Now" line at `NEWEST_X = 0.68` (68% from left), same as PitchCanvas
- `PRE_ROLL_MS = 2000` lead-in before first beat

### Beat markers
- Rendered as rounded rectangles (or circles), vertically centered in the lane
- Color-coded by status:
  - **Upcoming**: dim white/grey
  - **Active** (within scoring window): bright, subtle pulse
  - **Hit**: green
  - **Close**: yellow
  - **Missed**: red
- Width proportional to `durationMs` (same `PX_PER_MS` scaling)

### Tap feedback
- Visual flash/ripple on the now-line when user taps

## Audio: Metronome

When `metronome: true`, play a short click on each beat marker's `startMs`.

Implementation: Web Audio API oscillator — a brief sine or triangle wave burst (~30ms, ~800Hz). No external audio files needed. Created once, triggered per beat.

## Integration Points

### types.ts
- Add `"rhythm"` to `ExerciseTypeId` union
- Add `RhythmExercise` interface
- Add `RhythmEvent` type
- Add to `JourneyExercise` discriminated union

### resolve-exercise.ts
- Add `ResolvedRhythm` and `ResolvedBeat` interfaces
- Add `resolveRhythm()` function
- Add `case "rhythm"` to `resolveExercise()`

### BaseExercise.tsx
- Add `case "rhythm"` rendering `<RhythmExercise />`

### Journey config
- Add one starter exercise to an appropriate part file:

```typescript
{
  exerciseTypeId: "rhythm",
  title: "Feel the Beat",
  tempo: 80,
  pattern: [
    { type: "tap", duration: NoteDuration.Quarter },
    { type: "tap", duration: NoteDuration.Quarter },
    { type: "tap", duration: NoteDuration.Quarter },
    { type: "tap", duration: NoteDuration.Quarter },
    { type: "pause", duration: NoteDuration.Quarter },
    { type: "tap", duration: NoteDuration.Quarter },
    { type: "tap", duration: NoteDuration.Quarter },
    { type: "tap", duration: NoteDuration.Quarter },
    { type: "tap", duration: NoteDuration.Quarter },
  ],
  metronome: true,
  minScore: 60,
  instruction: "Tap the spacebar or touch the screen on each beat",
}
```

## File structure

```
src/constants/journey/types.ts        — RhythmExercise, RhythmEvent types
src/lib/resolve-exercise.ts           — resolveRhythm(), ResolvedRhythm, ResolvedBeat
src/components/Exercise/RhythmExercise.tsx  — main component + RAF loop + scoring
src/components/RhythmCanvas.tsx        — dedicated canvas
src/components/Exercise/BaseExercise.tsx    — add case
src/constants/journey/partN.ts         — starter exercise config
```

## Out of scope

- Microphone/ml5 clap detection (future enhancement)
- Repeat-after-me mode
- Multiple lanes or simultaneous beats
- Custom click sounds (audio files)
