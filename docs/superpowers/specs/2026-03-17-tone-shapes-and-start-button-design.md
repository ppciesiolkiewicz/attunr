# Tone Shapes & Exercise Start Button

## Summary

- Add config-driven tone shapes (`wobble`, `owl-hoot`) to pitch-detection exercises so the reference tone demonstrates the vocal quality being practiced
- Introduce a shared `ExerciseStartOverlay` with a prominent central "Start" button for pitch-detection and melody exercises
- Replace "Play tone" with a "Restart" button that resets progress and replays the reference tone
- Adjust Low U / Hoo Hoo target ranges inward to give users room to push below/above

## Motivation

Low U and Hoo Hoo exercises ask the user to wobble low or hoot like an owl, but the reference tone is a flat sine — it doesn't demonstrate the intended vocal quality. The exercises also target the very edge of the user's range (chromatic degrees 1–3 and -3 to -1), leaving no headroom for the "push below/above" mechanic.

Separately, exercises currently start immediately with no clear initiation point. A central Start button provides intentional entry, and a Restart button lets users reset and re-hear the reference tone.

## Design

### 1. New tone shapes in `useTonePlayer`

Two new methods:

**`playWobble(frequencyHz, options?)`** — Low U sound
- Sine oscillator at `frequencyHz`
- LFO modulates pitch ±20% with ~800ms period (1.25 Hz)
- Duration: ~2500ms (about 3 wobble cycles)
- Same binaural treatment and gain envelope as existing `playTone`

**`playOwlHoot(frequencyHz, options?)`** — Hoo Hoo sound
- Two short hoots played sequentially
- Each hoot: sine starting ~30% above target, quick swoop down to target, short hold, fade out (~400ms per hoot)
- Gap between hoots: ~200ms
- Total duration: ~1000ms
- Binaural applied per-hoot (each hoot gets its own stereo pair)

All new methods are fire-and-forget (no cancellation handle). Overlapping audio is acceptable — if "Restart" is tapped while a tone is still fading out, the old tone trails off naturally while the new one starts.

### 2. Exercise config — `toneShape` for pitch-detection

Add optional `toneShape` to `PitchDetectionExercise`:

```ts
toneShape?:
  | { kind: "sustain" }    // default — flat sine tone
  | { kind: "wobble" }     // Low U — slow pitch oscillation
  | { kind: "owl-hoot" }   // Hoo Hoo — two descending hoots
```

Omitted defaults to `"sustain"` (backwards compatible).

### 3. Config changes

**Part 2 (and any later parts with these exercises):**
- Low U: add `toneShape: { kind: "wobble" }`, change target range from `1–3` to `3–5`
- Hoo Hoo: add `toneShape: { kind: "owl-hoot" }`, change target range from `-3 to -1` to `-5 to -3`

### 4. Start / Restart button UX

**New shared component: `ExerciseStartOverlay`**

Centered overlay on top of the canvas before the exercise begins. Applies to pitch-detection and melody exercises.

**Flow:**
1. Exercise loads → canvas visible but dimmed (semi-transparent overlay), `ExerciseStartOverlay` centered on top with a prominent "Start" button
2. User taps "Start" → overlay fades out (~300ms), reference tone plays after ~500ms delay, then pitch-detection timer / melody timeline begins
3. During exercise, bottom panel shows "Restart" button (replaces "Play tone")
4. "Restart" resets progress and replays reference tone

**Timing:** The ~500ms delay is purely UX pacing. The mic is already running (AppShell starts it on mount). Pitch-detection hold timer starts simultaneously with the tone — the user hears the reference while beginning to sing.

**Bottom panel:**
- "Play tone" → "Restart" (same position)
- Skip / Next / Prev / ProgressArc unchanged

**Pitch-detection restart:** Resets hold timer to 0, replays reference tone (using exercise's `toneShape`).

**Melody restart:** Equivalent to existing `handleRetry` — stops sampler audio, resets timeline cursor, clears note scores, dismisses score modal if open. Then replays the first chord as a reference before restarting the timeline. MelodyExercise's existing bottom-panel "Start" button is replaced by the shared overlay.

### 5. Resolution and data flow

**`resolve-exercise.ts`:**
- `ResolvedPitchDetection` gains `toneShape: { kind: "sustain" } | { kind: "wobble" } | { kind: "owl-hoot" }` (defaults to `{ kind: "sustain" }`)
- Object form matches the config type for consistency and future extensibility (e.g. adding parameters per shape)
- Passed through from config, no transformation

**Component data flow:**
1. `BaseExercise` resolves exercise → `ResolvedPitchDetection` with `toneShape`
2. `PitchExercise` reads `toneShape`, passes to `ExerciseStartOverlay`
3. Overlay calls appropriate `useTonePlayer` method on start
4. "Restart" button does the same
5. `useTonePlayer` methods called directly by the exercise component (no AppShell callback bloat)

**Melody:** Gets `ExerciseStartOverlay` with default behavior (plays first note/chord as reference). No `toneShape` field needed — just the start/restart flow.

### 6. Future: real audio files

The `toneShape` config is designed to be swappable — a future `{ kind: "audio", src: "/sounds/low-u.mp3" }` variant can replace synthesized tones without changing the exercise config structure or component interfaces.

## Files to change

| File | Change |
|------|--------|
| `src/hooks/useTonePlayer.ts` | Add `playWobble()` and `playOwlHoot()` methods |
| `src/constants/journey/types.ts` | Add `toneShape` to `PitchDetectionExercise` |
| `src/constants/journey/part2.ts` | Add tone shapes, adjust target ranges (Low U + Hoo Hoo) |
| `src/constants/journey/part3.ts` | Same (Low U only) |
| `src/lib/resolve-exercise.ts` | Pass `toneShape` through to `ResolvedPitchDetection` |
| `src/components/Exercise/ExerciseStartOverlay.tsx` | New shared component |
| `src/components/Exercise/PitchExercise/PitchExercise.tsx` | Use overlay, replace "Play tone" with "Restart", wire tone shapes |
| `src/components/Exercise/MelodyExercise/MelodyExercise.tsx` | Use overlay, add "Restart" |
| `src/components/AppShell/AppShell.tsx` | Remove or simplify `onPlayTone` prop threading |
