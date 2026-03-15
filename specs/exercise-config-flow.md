# Exercise Config → Flow

How an exercise definition in `src/constants/journey/` drives what the user sees and how the exercise behaves. This spec traces the path from config to rendered output.

---

## Exercise config shape

Every exercise extends `BaseExerciseConfig` and is discriminated by `exerciseTypeId`:

```typescript
interface BaseExerciseConfig {
  id: number;              // Unique exercise ID (1–116)
  exerciseTypeId: ExerciseTypeId;
  part: number;
  title: string;
  subtitle?: string;       // Shown in exercise header
  cardCue?: string;        // Shown on journey list card (falls back to subtitle)
  technique?: TechniqueId; // Controls detection tolerance & playback style
}

// Discriminated variants:
LearnExercise        → { exerciseTypeId: "learn",                elements }
PitchDetectionExercise → { exerciseTypeId: "pitch-detection",    notes: SustainNoteConfig[], instruction }
PitchDetectionSlideExercise → { exerciseTypeId: "pitch-detection-slide", notes: SlideConfig[], instruction }
FarinelliBreathworkExercise   → { exerciseTypeId: "breathwork-farinelli",           maxCount, instruction }
ToneFollowExercise   → { exerciseTypeId: "tone-follow",         toneShape, requiredPlays, instruction }
```

### BandTarget — how config points at notes

Exercises don't hardcode frequencies. They reference positions in the user's vocal scale via `BandTarget`:

```typescript
{ kind: "slot",  n: 3 }           // 3rd of 7 evenly-spaced slots
{ kind: "index", i: 0 }           // first note in allBands (i: -1 = last)
{ kind: "range", from: 0, to: 3, accept: "below" }  // chest voice range
```

At runtime, `resolveBandTarget(target, allBands)` maps these to actual `Band` objects with real frequencies based on the user's detected vocal range and tuning.

---

## Config → canvas + progress

Two config fields — `exerciseTypeId` and `technique` — together determine the canvas, progress model, and detection behaviour. Currently this decision is spread across ~50 branch points in `JourneyExercise.tsx`. The decision tree below documents what each combination produces.

### Decision tree

The full decision is made from three inputs: `exerciseTypeId`, `notes` shape (length + target kind), and `technique`:

```
exercise
 ├─ exerciseTypeId
 │   ├─ "learn"           → canvas: none (text + Video)
 │   │                      progress: none
 │   │                      buttons: [Prev, Next]
 │   │                      info modal: never
 │   │                      pitch overlay: hidden
 │   │
 │   ├─ "breathwork-farinelli" → canvas: FarinelliExercise
 │   │                      progress: cycle count (maxCount)
 │   │                      buttons: [] (automatic)
 │   │                      info modal: always shown
 │   │                      pitch overlay: hidden
 │   │
 │   ├─ "pitch-detection"
 │   │   ├─ notes.length === 1
 │   │   │   ├─ target.kind === "range"
 │   │   │   │               → canvas: HillBallCanvas
 │   │   │   │                 progress: hold (range-based detection)
 │   │   │   │                 pitch overlay: "Low tone" / "High tone"
 │   │   │   │
 │   │   │   └─ exact pitch → canvas: BalanceBallCanvas
 │   │   │                    progress: hold (exact-pitch detection)
 │   │   │                    pitch overlay: Hz readout + direction hint
 │   │   │
 │   │   └─ notes.length > 1
 │   │                     → canvas: PitchCanvas
 │   │                       progress: sequence (note-by-note advancement)
 │   │                       pitch overlay: Hz readout + direction hint
 │   │                       indicators: step dots (bottom-left)
 │   │
 │   ├─ "pitch-detection-slide"
 │   │                     → canvas: PitchCanvas
 │   │                       progress: zone-crossing (complete after 2)
 │   │                       pitch overlay: Hz readout
 │   │                       indicators: slide dots (bottom-left)
 │   │
 │   └─ "tone-follow"     → canvas: PitchCanvas (simulated cursor, no mic)
 │                           progress: play count (requiredPlays, typically 3)
 │                           pitch overlay: instruction text only
 │                           indicators: play-count dots (bottom-left)
 │                           toneShape.kind = "slide" → smooth glide playback
 │                           toneShape.kind = "sustain" → sustained tone playback
 │
 └─ technique (cross-cuts pitch-detection exercises)
     └─ all techniques     → tolerance: ±3%
        ("sustain",          detection: binary in-tune
         "mantra",           slide playback: discrete start + end tones
         "puffy-cheeks")     slide zones: upper/lower thirds
```

### Where decisions are currently made (`JourneyExercise.tsx`)

| Concern | Lines | Branching on |
|---------|-------|-------------|
| Resolve exercise bands | ~65–78 | `exerciseTypeId`, `notes` shape |
| Detect range target | ~80–83 | `exerciseTypeId`, `notes.length`, `target.kind` |
| Resolve tone playback bands | ~100–111 | `exerciseTypeId` |
| Sequence step bands | ~114–117 | `exerciseTypeId`, `notes.length` |
| Info modal auto-show | ~155–162 | `exerciseTypeId` |
| Progress tick (RAF loop) | ~214–305 | `exerciseTypeId`, `notes.length`, `technique`, `target.kind` |
| Play tone handler | ~384–416 | `exerciseTypeId`, `technique` |
| In-tune / lock detection | ~418–431 | `isRangeTarget`, `technique` |
| Target band for direction hint | ~434–439 | `exerciseTypeId`, `isRangeTarget`, `notes.length` |
| Canvas rendering | ~482–559 | `exerciseTypeId`, `notes.length`, `isRangeTarget` |
| Pitch overlay content | ~601–660 | `isRangeTarget`, `target.kind` |
| Step indicator dots | ~663–709 | `exerciseTypeId`, `notes.length` |
| Button panel | ~715–789 | `exerciseTypeId` |

> **Future direction:** Extract a `resolveExerciseConfig(exercise)` function that resolves the decision tree once into a flat config object (`canvas`, `progressModel`, `tolerance`, `playbackStyle`, etc.). `JourneyExercise` would read the resolved config instead of re-branching at each concern. See the plan for details.

---

## Progress models in detail

### Single-note hold (`pitch-detection`, 1 note)

Driven by: `notes[0].seconds` (hold duration) + `notes[0].target` (what pitch) + `technique` (tolerance)

```
holdRef += deltaTime × credit    when in-tune
progress = holdRef / notes[0].seconds
complete when progress >= 1
```

- **Range targets** (`target.kind === "range"`): `matchesBandTarget(hz, bands, accept)` — "below" accepts any pitch ≤ range, "above" accepts ≥ range
- All techniques: binary — full credit or nothing

### Sequence (`pitch-detection`, multiple notes)

Driven by: `notes[]` array — each entry has `target` + `seconds`

```
for each note in order:
  noteHold += deltaTime    when in-tune with notes[seqIndex]
  if noteHold >= notes[seqIndex].seconds → advance
complete when all notes done
```

- 400ms grace period after advancing (avoids penalizing pitch decay between notes)
- 30%/s decay when singing wrong pitch (outside grace period)
- Step indicator dots (bottom-left) show completed / active / pending

### Slide (`pitch-detection-slide`)

Driven by: `notes[0].from` + `notes[0].to` (endpoints) + `technique`

```
slideCount++ when pitch crosses from one zone to the other
complete when slideCount >= 2
```

- Zones are upper/lower thirds of the frequency range

### Breathwork

Driven by: `maxCount` (typically 7)

`FarinelliExercise` manages its own timer. Inhale counts increase 4→10. Calls `onComplete` when done.

---

## Config → tone playback

When the user taps "Play tone":

| Config                                             | Playback                                                      |
| -------------------------------------------------- | ------------------------------------------------------------- |
| `pitch-detection`, 1 note                          | Single binaural tone (1.8s)                                   |
| `pitch-detection`, N notes                         | N tones sequentially, 2s apart                                |
| `pitch-detection-slide`                            | Start + end tones sequentially                                |
| `tone-follow`, slide shape                         | Smooth glide (400ms hold + 2500ms ramp + 600ms hold)          |
| `tone-follow`, sustain shape                       | Sustained binaural tone (duration from config)                 |
| `breathwork-farinelli` / `learn`                   | No play button                                                |

All tones: binaural rendering (left = hz, right = hz + 6 Hz theta beat).

---

## Config → info modal

`ExerciseInfoModal` derives content from the exercise:

- **Objective** — from `exerciseTypeId` + `notes` shape:
  - Single note: "Hold the tone in tune for X seconds"
  - Sequence: "Sing each tone in sequence, X seconds each"
  - Slide: "Slide smoothly through the range"
  - Breathwork: "Complete N cycles"
- **Instruction body** — `exercise.instruction` verbatim
- **Headphones notice** — shown for all pitch and tone-follow exercises (binaural beats)
- **"Don't show again"** — per exercise ID in localStorage

Breathwork always shows the modal. Others show unless previously dismissed.

---

## Config → journey list card

`StageCard` renders from config fields directly — no `exerciseTypeId` branching:

```
exercise.title          → primary text
exercise.cardCue ?? exercise.subtitle → secondary text
getStageDisplayColors(exercise)    → left accent bar (gradient for multi-slot exercises)
```

---

## Data flow: pitch detection → UI

```
Microphone
    ↓
usePitchDetection (ml5 CREPE, ~30 fps)
    ↓
    ├─→ pitchHzRef.current  (synchronous — canvas RAF reads directly, 60 fps)
    │
    └─→ pitchHz state (throttled ~15 fps)
        ├─→ pitch overlay (Hz, lock status, direction hint)
        └─→ progress tick (RAF loop in JourneyExercise)
            └─→ setExerciseComplete(true)
```

Two channels by design:

- **Fast path** (`pitchHzRef`) — canvas reads synchronously in RAF. No React scheduling latency.
- **Slow path** (`pitchHz`) — React state at ~15 fps. Drives labels and progress.

---

## Completion → navigation

```
setExerciseComplete(true)
    → confetti + checkmark (2400ms)
    → user taps "Next"
    → isLastExerciseOfPart(exerciseId)?
        yes → PartCompleteModal (content from PART_COMPLETE_CONTENT[part])
              → "Continue" → getNextExerciseId(exerciseId)
        no  → getNextExerciseId(exerciseId) directly
    → router.push(/journey/{nextId})
    → info modal auto-shows on new exercise
```

Progress: `localStorage attunr.journeyStage = max(current, exerciseId)`.

"Skip" advances without saving progress and forces the info modal on the next exercise.

---

## Key files

| File                                                          | Role                                                          |
| ------------------------------------------------------------- | ------------------------------------------------------------- |
| `src/constants/journey/types.ts`                              | Exercise types, BandTarget, TechniqueId                       |
| `src/constants/journey/*.ts`                                  | Per-part exercise configs                                     |
| `src/components/JourneyView/components/JourneyExercise.tsx`   | Config → canvas, progress, completion                         |
| `src/components/JourneyView/components/ExerciseInfoModal.tsx` | Config → modal content                                        |
| `src/components/JourneyView/components/StageCard.tsx`         | Config → journey list card                                    |
| `src/components/JourneyView/utils.ts`                         | `resolveBandTarget()`, `getStageDisplayColors()`              |
| `src/lib/pitch.ts`                                            | `isInTune()`, `matchesBandTarget()`                           |
| `src/lib/vocal-scale.ts`                                      | `getScaleNotesForRange()` — builds bands from user's Hz range |
