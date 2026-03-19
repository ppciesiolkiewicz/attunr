# Rep Progress: Shared Completion Feature + Volume Detection Reps

## Problem

Six exercise components duplicate identical completion logic: `showCongrats` state, confetti trigger, checkmark overlay JSX. HillExercise and PitchExercise additionally duplicate step-check overlays and rep dots. VolumeDetectionExercise lacks multi-rep support and is missing ProgressArc, CircularProgress, rep dots, and restart functionality that other exercises have.

## Solution

Extract a `rep-progress` feature module with a shared hook and overlay components. Add `reps` support to VolumeDetectionExercise. Refactor existing exercises to use the shared feature.

## Design

### Config Change

Add optional `reps` to `VolumeDetectionConfig` in `src/constants/journey/types.ts`:

```ts
export interface VolumeDetectionConfig extends BaseExerciseConfig {
  exerciseTypeId: "volume-detection";
  targetSeconds: number;    // seconds per rep
  reps?: number;            // defaults to 1
  cues: TimedCue[];
  instruction: string;
}
```

Existing exercises don't need updating — `reps` defaults to `1`.

### Feature Module: `src/features/rep-progress/`

```
src/features/rep-progress/
  index.ts                  # public API
  useRepCompletion.ts       # shared hook
  CongratsOverlay.tsx       # checkmark + "Congratulations!"
  StepCheckOverlay.tsx      # checkmark + rep phrase + "Round N"
  RepDots.tsx               # dot indicators + "2/3" count
```

Consumers import from `@/features/rep-progress`.

#### `useRepCompletion` Hook

```ts
interface UseRepCompletionOptions {
  totalReps: number;           // 1 = single-completion exercise
  exerciseId: number;          // resets state when exercise changes
  onRepAdvanced?: () => void;  // called when hook advances to next rep — exercise resets its accumulation here
}

interface UseRepCompletionResult {
  currentRep: number;       // 0-indexed, increments immediately on rep completion
  isComplete: boolean;      // all reps done
  completeRep: () => void;  // exercise calls this when current rep's condition is met
  showStepCheck: boolean;   // briefly true after each intermediate rep
  showCongrats: boolean;    // briefly true after final rep
  repPhrase: string;        // "Nice!", "Good one!", "Keep going!" (fixed list, not configurable)
  overallProgress: number;  // 0-1 (reps completed / total)
  resetProgress: () => void;
}
```

**Behavior:**
- Exercise calls `completeRep()` when the current rep's condition is met (e.g., accumulated seconds reached, pitch held long enough).
- On `completeRep()`: `currentRep` increments immediately, then `onRepAdvanced` fires so the exercise can reset per-rep state (e.g., `accumulatedSeconds = 0`).
- If `totalReps > 1` and not final rep: flash `showStepCheck` for 1500ms (matching existing `usePitchProgress` timing).
- If final rep: set `isComplete`, fire confetti, flash `showCongrats` for 2400ms.
- When `totalReps === 1`: skip step check entirely, go straight to congrats. Behavior is identical to current single-completion exercises.
- Resets all state when `exerciseId` changes.
- `overallProgress` is discrete: `completedReps / totalReps`. For smooth progress in the `ProgressArc`, exercises should compute `(currentRep + perRepProgress) / totalReps` themselves and pass that to `ProgressArc`.

The hook does NOT own per-rep progress (the 0-1 within a single rep). That stays in each exercise since it's domain-specific (pitch matching vs. volume accumulation vs. play count).

#### `CongratsOverlay`

```tsx
function CongratsOverlay({ show }: { show: boolean }): React.ReactNode
```

Renders the large checkmark (w-20 h-20) + "Congratulations!" text with `congrats-appear` animation. Absolute positioned, pointer-events-none. Returns `null` when `show` is false.

#### `StepCheckOverlay`

```tsx
function StepCheckOverlay({
  show,
  phrase,
  round,
  totalReps,
}: {
  show: boolean;
  phrase: string;
  round: number;
  totalReps: number;
}): React.ReactNode
```

Renders the smaller checkmark (w-16 h-16) + rep phrase + "Round N" with `step-check-appear` animation. `round` is 1-indexed and shows the *next* round number (matching HillExercise's current behavior where it displays `seqIndex + 1`). Returns `null` when `show` is false.

Note: PitchExercise currently uses a smaller step check (w-12 h-12, no phrase/round text). The refactored version will use the HillExercise style (w-16 h-16 with phrase + round) as a visual upgrade.

#### `RepDots`

```tsx
function RepDots({
  totalReps,
  currentRep,
  isComplete,
}: {
  totalReps: number;
  currentRep: number;
  isComplete: boolean;
}): React.ReactNode
```

Renders dot indicators + "N/N" count for the bottom panel. Hidden on mobile (matches HillExercise). Returns `null` when `totalReps <= 1`.

### VolumeDetectionExercise Changes

- Add rep tracking: `currentRep` from `useRepCompletion` determines which rep is active. `accumulatedSeconds` resets to 0 when a rep completes and the next begins.
- Wire `repComplete` signal: when `accumulatedSeconds >= targetSeconds`, signal the current rep as complete.
- Add `CircularProgress` center overlay (size=200, opacity-35) showing per-rep progress (accumulatedSeconds / targetSeconds).
- Add `ProgressArc` to bottom panel showing overall progress.
- Add `RepDots` to bottom panel.
- Add Restart button when complete. Restart calls `resetProgress()` from the hook and resets `accumulatedSeconds` and `lastTickRef` in the exercise.
- Replace inline congrats JSX and confetti with `<CongratsOverlay>` and `<StepCheckOverlay>`.

### CSS Animations

The `congrats-appear` and `step-check-appear` CSS keyframe animations already exist in the global stylesheet. The overlay components use these class names — no new CSS is needed.

### Refactor Existing Exercises

Replace inline `showCongrats` useState + useEffect + confetti + overlay JSX with `useRepCompletion` + `<CongratsOverlay>` in:

- **HillExercise** — also replace step check + rep dots with shared components.
- **PitchExercise** — `usePitchProgress` continues to own multi-target sequencing (its `seqIndex` maps to reps) and `showStepCheck`. Use `<CongratsOverlay>` and `<StepCheckOverlay>` as presentational components driven by `usePitchProgress`'s existing state. Do NOT wire `useRepCompletion` into PitchExercise — it would fight with `usePitchProgress`. Refactoring `usePitchProgress` to delegate to `useRepCompletion` is a potential follow-up but out of scope here.
- **ToneFollowExercise** — congrats only (no reps).
- **FarinelliBreathworkExercise** — congrats only (no reps).
- **MelodyExercise** — congrats only (fires inside modal flow, may need special handling).
- **RhythmExercise** — congrats only (fires inside modal flow, may need special handling).

MelodyExercise and RhythmExercise fire confetti inside modal result flows, so they may not fit the hook pattern cleanly. These two can be deferred if the integration is awkward.

### What Stays Exercise-Specific

- **Per-rep progress tracking**: VolumeDetection accumulates seconds, PitchExercise/HillExercise match pitch via `usePitchProgress`, ToneFollow counts plays. Each exercise owns its 0-1 per-rep progress.
- **Visual content**: Canvas, cues, pitch overlays, volume bars — all exercise-specific.
- **Bottom panel buttons**: Play tone, Restart, Prev, Skip/Next — exercise-specific (though the pattern is similar).
