# Rhythm Exercise Design

## Overview

A new `rhythm` exercise type where the user taps along to a scrolling timeline of beat markers. Input is via spacebar (desktop), touch (mobile), or click. Scoring uses a similar classification system (hit/close/missed) as melody but with timing-based rather than pitch-based scoring.

## Config Type

Add `"rhythm"` to `ExerciseTypeId` and a new `RhythmExercise` to the `JourneyExercise` discriminated union in `types.ts`. `JourneyExerciseInput` updates automatically via the `DistributiveOmit` pattern.

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

Add `resolveRhythm()` to `resolve-exercise.ts`. It follows the same pattern as `resolveMelody()`. Add `ResolvedRhythm` to the `ResolvedExercise` union type.

`resolveRhythm()` accepts `vocalRange` for signature consistency with `resolveExercise()` but ignores it — rhythm exercises don't use pitch or scales.

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

`displayNotes` and `highlightIds` on `ResolvedExerciseBase` are intentionally empty arrays — rhythm exercises don't render on PitchCanvas.

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

Each tap is timestamped with `performance.now()` and matched against the nearest unmatched beat. A tap can only match one beat; each beat can only be matched once (first-come). Debounce constant `TAP_DEBOUNCE_MS = 50` — ignore taps within this window.

### Scoring

Per-beat classification based on timing error (absolute difference between tap time and beat center). All thresholds are named constants:

```typescript
const HIT_WINDOW_MS = 80;
const CLOSE_WINDOW_MS = 150;
const HIT_WEIGHT = 1.0;
const CLOSE_WEIGHT = 0.5;
```

- **Hit**: within +-`HIT_WINDOW_MS` — weight 1.0
- **Close**: within +-`CLOSE_WINDOW_MS` — weight 0.5
- **Missed**: no tap or beyond `CLOSE_WINDOW_MS` — weight 0.0

Overall score: `Math.round((sum of weights / beat count) * 100)`

## Canvas: RhythmCanvas

New file: `src/components/Exercise/RhythmCanvas.tsx` (co-located with `RhythmExercise.tsx` since it's single-use, unlike PitchCanvas which is shared across multiple exercise types).

A dedicated canvas for rhythm — simpler than PitchCanvas since there are no pitch bands. Single horizontal lane.

### Layout
- Beat markers scroll right-to-left
- Reuse `PX_PER_MS` (~0.094) scroll speed from PitchCanvas for consistent feel
- "Now" line at `NEWEST_X = 0.68` (68% from left), same as PitchCanvas
- `PRE_ROLL_MS = 2000` as a local constant in `RhythmExercise.tsx` (same pattern as MelodyExercise where it's a local constant)

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

Implementation: Web Audio API oscillator — a brief sine or triangle wave burst (~30ms, ~800Hz). No external audio files needed. `AudioContext` should be created/resumed on user gesture (required by mobile browsers). Consider a `useMetronome` hook that takes `beats[]` and `isPlaying`, scheduling clicks via `AudioContext.currentTime`.

## Integration Points

### types.ts
- Add `"rhythm"` to `ExerciseTypeId` union
- Add `RhythmExercise` interface and `RhythmEvent` type
- Add to `JourneyExercise` discriminated union
- `JourneyExerciseInput` updates automatically via `DistributiveOmit`

### resolve-exercise.ts
- Add `ResolvedRhythm` and `ResolvedBeat` interfaces
- Add `ResolvedRhythm` to `ResolvedExercise` union type
- Add `resolveRhythm()` function (accepts `vocalRange` for signature consistency, ignores it)
- Add `case "rhythm"` to `resolveExercise()`

### BaseExercise.tsx
- Add `case "rhythm"` rendering `<RhythmExercise />`
- Rhythm exercises pass through to `resolveExercise()` (not added to the skip-list with learn/breathwork types)

### Journey config
- Add one starter exercise to an appropriate part file. Example config (as `JourneyExerciseInput` — `id` and `part` are auto-assigned by `index.ts`):

```typescript
{
  exerciseTypeId: "rhythm",
  title: "Feel the Beat",
  cardCue: "Tap along to the beat",
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
src/constants/journey/types.ts             — RhythmExercise, RhythmEvent types
src/lib/resolve-exercise.ts                — resolveRhythm(), ResolvedRhythm, ResolvedBeat
src/components/Exercise/RhythmExercise.tsx  — main component + RAF loop + scoring
src/components/Exercise/RhythmCanvas.tsx    — dedicated canvas (co-located, single-use)
src/components/Exercise/BaseExercise.tsx    — add case
src/constants/journey/partN.ts             — starter exercise config
```

## Out of scope

- Microphone/ml5 clap detection (future enhancement)
- Repeat-after-me mode
- Multiple lanes or simultaneous beats
- Custom click sounds (audio files)
