# Melody Exercise Design

## Context

Attunr currently has 6 exercise types focused on voice (pitch detection, tone follow, breathwork) and learning (text/video). The app's vision is "somatic regulation through voice" with game-like progression.

This design adds a **melody exercise type** — a classic singing-app experience where users sing along to scrolling note rectangles played on piano. Progressive difficulty allows omitting played notes so users develop interval recognition and pitch memory. Supports intervals (e.g. perfect 5th), simple melodies, and 5-tone scales.

**Libraries:**

- `tonal` (v6.4.3, installed) — music theory: note frequencies, intervals, scales
- `tone` (Tone.js, to install) — Web Audio framework: `Tone.Sampler` for piano sample playback with automatic pitch interpolation, `Tone.Transport` for precise scheduling
- Piano samples in `public/instruments/PIANO/` (pianoG3.wav, pianoC4.wav, pianoG4.wav, pianoC5.wav, pianoG5.wav, pianoC6.wav)

## Exercise Type Config

New `exerciseTypeId: "melody"` in the discriminated union.

```typescript
// A singable note or a rest (gap)
export type MelodyNoteConfig =
  | { target: BandTarget; seconds: number; silent?: boolean }
  | { rest: true; seconds: number };

export interface MelodyExercise extends BaseExerciseConfig {
  exerciseTypeId: "melody";
  melody: MelodyNoteConfig[]; // what user sings (scored, shown as rectangles)
  backingTrack?: MelodyNoteConfig[]; // accompaniment (played as piano, not scored, not shown)
  minScore: number; // required. percentage (0-100) to complete. 0 = always pass.
  instruction: string;
}
```

- **`target: BandTarget`** — only `kind: "slot"` or `kind: "index"` (not `"range"`, since a melody note is a single pitch). Resolved against user's vocal scale.
- **`seconds`** — duration of the note or rest
- **`silent?: boolean`** — note rectangle is shown (dashed/dimmed style) but piano audio is not played. User must sing from memory.
- **`rest`** — empty space, no rectangle, no audio, no pitch expected
- **`melody`** — the notes the user sings. Rendered as scrolling rectangles, scored for accuracy.
- **`backingTrack`** — optional accompaniment. Played as piano samples alongside the melody. Audio only (no visual rectangles, not scored). Uses same `MelodyNoteConfig` format.
- **`minScore`** — required (not optional). Score modal always shows at end of exercise. Score ≥ minScore = pass. `0` means any score passes.

### Config examples

**Perfect 5th interval:**

```typescript
{
  exerciseTypeId: "melody",
  title: "Perfect Fifth",
  technique: "sustain",
  melody: [
    { target: { kind: "slot", n: 1 }, seconds: 2 },
    { target: { kind: "slot", n: 5 }, seconds: 2 },
  ],
  minScore: 0,
  instruction: "Sing the two notes as they appear",
}
```

**5th interval with silent target and backing (advanced):**

```typescript
{
  exerciseTypeId: "melody",
  title: "Perfect Fifth — From Memory",
  technique: "sustain",
  melody: [
    { target: { kind: "slot", n: 1 }, seconds: 2 },
    { rest: true, seconds: 0.5 },
    { target: { kind: "slot", n: 5 }, seconds: 2, silent: true },
  ],
  backingTrack: [
    { target: { kind: "slot", n: 1 }, seconds: 4.5 },  // sustained root underneath
  ],
  minScore: 60,
  instruction: "The root is played — sing the fifth from memory",
}
```

**5-tone scale ascending:**

```typescript
{
  exerciseTypeId: "melody",
  title: "5-Tone Scale",
  technique: "sustain",
  melody: [
    { target: { kind: "slot", n: 1 }, seconds: 1.5 },
    { target: { kind: "slot", n: 2 }, seconds: 1.5 },
    { target: { kind: "slot", n: 3 }, seconds: 1.5 },
    { target: { kind: "slot", n: 4 }, seconds: 1.5 },
    { target: { kind: "slot", n: 5 }, seconds: 1.5 },
  ],
  minScore: 0,
  instruction: "Sing each note of the ascending scale",
}
```

## Piano Sample Playback with Tone.js

### New hook: `usePianoSampler`

Uses `Tone.Sampler` to load piano WAV files and play any note with automatic pitch interpolation.

**Available samples:**
| File | Note |
|------|------|
| pianoG3.wav | G3 |
| pianoC4.wav | C4 |
| pianoG4.wav | G4 |
| pianoC5.wav | C5 |
| pianoG5.wav | G5 |
| pianoC6.wav | C6 |

**API:**

```typescript
interface UsePianoSamplerReturn {
  /** Play a note at a given frequency for a duration. Uses Tone.Transport for precise scheduling. */
  playNote: (
    frequencyHz: number,
    durationSec: number,
    delaySec?: number,
  ) => void;
  /** Schedule an entire melody + backing track timeline at once for drift-free playback. */
  scheduleMelody: (
    notes: { frequencyHz: number; startSec: number; durationSec: number }[],
  ) => void;
  /** Stop all scheduled notes and reset transport. */
  stop: () => void;
  isLoaded: boolean;
}
```

**Implementation:**

1. Create `Tone.Sampler` with the 6 piano samples mapped to their note names. Tone.js automatically handles pitch interpolation to any target note.
2. `playNote(hz, duration, delay)`: convert Hz to note name using `tonal`'s `Note.fromFreq()`, trigger on `Tone.Sampler` via `Tone.Transport` scheduling.
3. `scheduleMelody(notes)`: schedule all notes at once using `Tone.Transport.schedule()` — precise timing, no drift. Both melody and backing track notes are scheduled together.
4. `stop()`: cancel all scheduled events, stop transport. Used for retry.
5. No binaural beats — straight piano samples.

**Why Tone.js:** Eliminates need for manual AudioBuffer management, pitch-shifting math, and setTimeout-based scheduling. `Tone.Sampler` handles sample interpolation; `Tone.Transport` handles precise timing on the audio thread.

## PitchCanvas Extension

PitchCanvas gets optional props for rendering melody rectangles. When these props are absent, PitchCanvas behaves exactly as before.

```typescript
// Added to PitchCanvasProps
export interface MelodyRectNote {
  index: number; // position in melody array (excluding rests)
  band: Band; // resolved from BandTarget
  startMs: number; // offset from melody start time
  durationMs: number; // rectangle width in time
  silent?: boolean; // dashed/dimmed visual style
  status: "upcoming" | "active" | "hit" | "close" | "missed";
}

interface PitchCanvasProps {
  // ... existing props ...
  melodyNotes?: MelodyRectNote[];
  melodyStartTime?: number; // performance.now() when melody playback began
}
```

### Rectangle rendering (in RAF loop)

For each `melodyNote`:

1. Compute X position: `newestX + (note.startMs - elapsedMs) * PX_PER_MS` for left edge, same for right edge using `startMs + durationMs`
2. Compute Y position: `hzToY(note.band.frequencyHz, ...)` — same as dots
3. Rectangle height: ~`bh * 1.5` (slightly taller than band gradient)
4. Draw based on status:
   - **upcoming**: band color at 20% opacity, solid border
   - **active**: band color at 40% opacity, pulsing brighter border
   - **hit**: green fill (`rgba(80, 220, 100, 0.4)`)
   - **close**: yellow fill (`rgba(220, 200, 60, 0.35)`)
   - **missed**: red/dimmed (`rgba(200, 60, 60, 0.25)`)
   - **silent notes**: dashed border instead of solid, 50% dimmer than normal

Rectangles scroll left naturally — future notes appear on the right, past notes scroll off the left edge.

**Note:** Backing track notes are NOT rendered on canvas — audio only.

### Pre-roll

A 2-second visual lead-in before the first note reaches the playhead. Melody timeline starts with a 2s offset so users see upcoming notes scrolling in before they need to sing.

## MelodyExercise Component

New file: `src/components/Exercise/MelodyExercise.tsx`

### Props from BaseExercise

Receives: `exercise`, `exerciseId`, `isLast`, `allBands`, `pitchHz`, `pitchHzRef`, `isAlreadyCompleted`, `onComplete`, `onSkip`, `onPrev`. Does NOT use `onPlayTone`/`onPlaySlide` — uses its own `usePianoSampler` instead.

### Lifecycle

1. **Resolve bands**: Convert each `MelodyNoteConfig.target` → `Band` using existing `resolveBandTarget()` logic. Only `slot` and `index` targets are valid — skip any note whose target resolves to empty.
2. **Compute timeline**: Calculate `startMs` and `durationMs` for each note (cumulative from melody array), adding 2s pre-roll offset. Do the same for backing track notes.
3. **Start playback**: On user tap, call `scheduleMelody()` to queue all non-silent melody notes + all backing track notes on Tone.Transport. Record `melodyStartTime = performance.now()`.
4. **Track accuracy**: On each RAF tick via `pitchHzRef`:
   - Determine active melody note from elapsed time
   - If rest → skip
   - If active note → check `isInTune(pitchHz, activeBand.frequencyHz)` with technique tolerance
   - Accumulate in-tune time per note
5. **Score per note**: `noteScore = inTuneTime / noteDuration` → classify as hit (≥70%), close (≥40%), or missed (<40%)
6. **Melody ends**: After total duration elapses, compute overall score as mean of per-note scores (excluding rests). Show score modal.

### Score modal

**Always shown** after melody completes. Contains:

- Overall percentage (large, centered)
- Per-note color indicators (small dots/bars: green/yellow/red)
- "Try again" button (always present — labeled "Repeat exercise" if score ≥ minScore)
- If score ≥ `minScore`: "Continue →" button → proceeds to `completionModal` if one exists, otherwise calls `onComplete()`
- If score < `minScore`: "Skip" button (calls `onSkip()`)

**Modal ordering:** If the exercise also has a `completionModal`, the score modal shows **first**. User taps "Continue →" → score modal closes → completion modal opens → user dismisses → `onComplete()`.

### Retry

"Try again" / "Repeat exercise": stops Tone.Transport, clears per-note scores, resets `melodyStartTime`, re-schedules all notes. MelodyRectNote statuses reset to "upcoming".

### Bands displayed on canvas

Pass all bands that appear in the melody, plus one band above and one below for visual context (same pattern as PitchExercise's `displayBands`).

### State fed to PitchCanvas

MelodyExercise maintains a `melodyNotes: MelodyRectNote[]` array (with resolved bands, index, and live `status` values) and passes it + `melodyStartTime` to Pitc`hCanvas. Statuses update in real-time as the melody progresses.

## Files to Create/Modify

| File                                         | Action     | Details                                                                                                            |
| -------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------ |
| `package.json`                               | Modify     | Add `tone` dependency                                                                                              |
| `src/constants/journey/types.ts`             | Modify     | Add `"melody"` to `ExerciseTypeId`, `MelodyNoteConfig`, `MelodyExercise` interface, add to `JourneyExercise` union |
| `src/hooks/usePianoSampler.ts`               | **Create** | Tone.js Sampler hook for piano sample playback                                                                     |
| `src/components/PitchCanvas.tsx`             | Modify     | Add optional `melodyNotes` + `melodyStartTime` props, rectangle rendering in RAF loop                              |
| `src/components/Exercise/MelodyExercise.tsx` | **Create** | Melody exercise component with timeline, scoring, PitchCanvas integration                                          |
| `src/components/Exercise/BaseExercise.tsx`   | Modify     | Add `"melody"` case to switch dispatcher                                                                           |

## Verification

1. Add a test melody exercise to a journey part config (e.g. part1 or a new test part)
2. Run `npm run dev`, navigate to the melody exercise
3. Verify: piano samples load, notes play on schedule, rectangles scroll on canvas
4. Sing along — verify pitch dots appear relative to rectangles, color-coding updates in real-time
5. Let melody finish — verify score modal shows with percentage and per-note indicators
6. Test silent notes — verify dashed rectangles, no audio, scoring still works
7. Test rests — verify empty gaps between rectangles
8. Test `minScore` threshold — verify "Continue" vs "Skip" buttons
9. Test "Try again" / "Repeat exercise" — verify full reset and replay
10. Test backing track — verify accompaniment plays alongside melody, no visual rectangles
11. Test score modal → completion modal ordering (if both configured)
