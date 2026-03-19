# Time-Based Exercise Type

## Summary

New `time-based` exercise type for timed, cue-driven exercises with no mic input. A flat array of `{ text, seconds }` cues plays through sequentially. Visual layout matches pitch-detection's design language (canvas area + bottom nav panel). Replaces `volume-detection` for sss/zzz exercises that don't need sound detection.

## Config

```ts
interface TimeBasedConfig extends BaseExerciseConfig {
  exerciseTypeId: "time-based";
  cues: TimedCue[];        // required — flat sequence, played once start to finish
  instruction: string;     // shown at top during exercise
  tips?: string[];         // optional — rotating tips at bottom; omit = no tips shown
}
```

`TimedCue` is the existing `{ text: string; seconds: number }` type.

`cues` and `instruction` are required; `tips` is optional. No reps concept — the cues array is the complete sequence. Use the `repeat()` helper to expand repeating patterns.

## Generator

Add `gen.timeBased()` to `ExerciseGenerator`. `TimeBasedParams` extends `CommonParams` (so you get `slug`, `title`, `instruction`, `headerSubtitle`, `cardSubtitle`, `introModal`, `completionModal`, etc.) plus `cues` and optional `tips`:

```ts
type TimeBasedParams = CommonParams & {
  cues: TimedCue[];
  tips?: string[];
};
```

```ts
timeBased(params: TimeBasedParams): ExerciseConfigInput
```

Add a `repeat()` utility exported from `exercise-generator.ts`:

```ts
export function repeat<T>(items: T[], times: number): T[]
```

Usage in chapter configs:

```ts
gen.timeBased({
  slug: "sss-zzz-sss",
  title: "Sss-zzz-sss",
  cues: repeat([
    { text: "sss", seconds: 2 },
    { text: "zzz", seconds: 2 },
    { text: "sss", seconds: 2 },
  ], 3),
})
```

## Component: `TimeBasedExercise`

New file: `src/components/Exercise/TimeBasedExercise.tsx`

### Lifecycle

`ready` -> `countdown` (3-2-1) -> `running` -> `complete`

The component owns the 3-2-1 countdown internally (same approach as `FarinelliExercise`). `ExerciseStartButton` covers the canvas initially; on tap it fades out and the component begins its internal countdown.

### Layout — matches pitch-detection design

Two zones, same structure as PitchExercise:

```
+----------------------------------+
|  instruction text (caption)      |  top overlay (if provided)
|                                  |
|       (CircularProgress)         |  center — ui atom, animates per cue
|        "sss for 2s"             |  line 1: current cue + duration
|         "3 of 9"                |  line 2: cue index / total
|                                  |
|  rotating tip                    |  bottom overlay (if tips provided)
|                                  |
+------ flex-1 canvas area --------+
|  [ProgressArc]  [Restart] [Skip] |  bottom panel — same as pitch-detection
+----------------------------------+
```

### Canvas area (flex-1)

- **Instruction overlay** (top, optional): `exercise.instruction` as `Text variant="caption"`, same positioning as pitch-detection
- **`CircularProgress`** (center): the existing `@/components/ui/CircularProgress` atom. Fills over the current cue's `seconds` duration, resets for each new cue.
- **Cue card** (center, 2 lines, matching Farinelli cue card format):
  - Line 1: `"{cue.text} for {cue.seconds}s"` — current action
  - Line 2: `"{currentIndex} of {totalCues}"` — progress context
- **Rotating tip** (bottom, optional): cycles through `tips` array in order on a fixed interval (~8s). Hidden if no tips provided.
- **ExerciseStartButton** overlay: covers canvas until user taps Start, same as pitch-detection
- **CongratsOverlay**: shown on completion, uses `useRepCompletion` with `totalReps: 1`

### Bottom panel

Same structure as PitchExercise:
- `ProgressArc` showing overall progress: `(sumOfCompletedCueDurations + currentCueElapsed) / totalDurationAcrossAllCues`
- Restart button (after exercise starts)
- Skip/Next button

## Dispatcher

Add `"time-based"` case to `BaseExercise.tsx`:
1. Add to the switch statement, rendering `TimeBasedExercise`
2. Add `"time-based"` to the resolver guard (the early-return block that skips `journey.getExercise()` for exercise types that don't need scale resolution)

## Migration

### Exercises migrated from `volume-detection` to `time-based`:

1. **chapter1 `sss-zzz-sss`** — currently 3 reps x 6s with cues `[sss, zzz, sss]`. Becomes flat 9-cue sequence via `repeat(..., 3)`. Total: 18s. Update `headerSubtitle` to match new total.
2. **chapter2 `warmup-sss-zzz`** — currently 15s with cues `[sss(3s), zzz(3s)]`. Use `repeat([sss(3s), zzz(3s)], 5)` for 30s total, or adjust cue durations to hit desired total. Update `headerSubtitle` accordingly.

### Not migrated:

- **chapter1 `voiceless-lip-roll`** — stays as `volume-detection` (benefits from mic detection)

## Type system changes

- Add `"time-based"` to `ExerciseTypeId` union (with comment: `// timed cue sequence — no mic`)
- Add `TimeBasedConfig` interface
- Add `TimeBasedConfig` to `ExerciseConfig` discriminated union

## Intro modal

Migrated exercises pass `introModal` directly as a `ModalConfig` object in the chapter config — no new `modal.timeBased()` generator method needed. Existing intro modal content is preserved.

## Files touched

| File | Change |
|------|--------|
| `src/constants/journey/types.ts` | Add `TimeBasedConfig`, update unions |
| `src/constants/journey/exercise-generator.ts` | Add `gen.timeBased()`, export `repeat()` helper |
| `src/components/Exercise/TimeBasedExercise.tsx` | New component |
| `src/components/Exercise/BaseExercise.tsx` | Add `"time-based"` case + resolver guard |
| `src/constants/journey/chapter1.ts` | Migrate `sss-zzz-sss` |
| `src/constants/journey/chapter2.ts` | Migrate `warmup-sss-zzz` |

## Out of scope

- Farinelli migration to time-based (future)
- Adding rotating tips to other exercise types (future)
