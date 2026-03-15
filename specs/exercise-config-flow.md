# Exercise Config → Flow

How a stage definition in `src/constants/journey/` drives what the user sees and how the exercise behaves. This spec traces the path from config to rendered output.

---

## Stage config shape

Every stage extends `BaseJourneyStage` and is discriminated by `stageTypeId`:

```typescript
interface BaseJourneyStage {
  id: number;              // Unique stage ID (1–116)
  stageTypeId: StageTypeId;
  part: number;
  title: string;
  subtitle?: string;       // Shown in exercise header
  cardCue?: string;        // Shown on journey list card (falls back to subtitle)
  technique?: TechniqueId; // Controls detection tolerance & playback style
}

// Discriminated variants:
LearnStage        → { stageTypeId: "learn",                instruction }
PitchDetectionStage → { stageTypeId: "pitch-detection",    notes: SustainNoteConfig[], instruction }
PitchDetectionSlideStage → { stageTypeId: "pitch-detection-slide", notes: SlideConfig[], instruction }
BreathworkStage   → { stageTypeId: "breathwork",           maxCount, instruction }
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

Two config fields together determine the canvas, progress model, and detection behaviour:

### `stageTypeId` — picks the canvas and progress model

```
"learn"
    → text content + VideoPlaceholder
    → no canvas, no mic, no progress tracking

"breathwork"
    → FarinelliExercise (self-contained timer, no pitch detection)
    → progress: cycle count (maxCount cycles, inhale 4→10)

"pitch-detection", notes.length === 1, target.kind === "range"
    → HillBallCanvas (slope — user pushes ball toward low or high pitches)
    → progress: cumulative hold time with range-based detection

"pitch-detection", notes.length === 1, exact pitch
    → BalanceBallCanvas (ball on hill — rolls by pitch deviation)
    → progress: cumulative hold time with exact-pitch detection

"pitch-detection", notes.length > 1
    → PitchCanvas (scrolling dot trail with step indicators)
    → progress: sequential note advancement

"pitch-detection-slide"
    → PitchCanvas (scrolling dot trail)
    → progress: zone-crossing count (complete after 2 crosses)
```

### `technique` — adjusts detection tolerance and playback

| TechniqueId      | In-tune tolerance | Detection                                               | Playback                                           |
| ---------------- | ----------------- | ------------------------------------------------------- | -------------------------------------------------- |
| `"sustain"`      | ±3%               | Binary in-tune                                          | Standard tone(s)                                   |
| `"mantra"`       | ±3%               | Binary in-tune                                          | Standard tone(s)                                   |
| `"puffy-cheeks"` | ±3%               | Binary in-tune                                          | Standard tone(s)                                   |
| `"lip-rolls"`    | ±8%               | Graduated credit via `lipRollCredit()` (0–1 multiplier) | Slides play smooth glide instead of discrete tones |

Lip-roll slides also use relaxed zone thresholds (midpoint boundary instead of 25% margins).

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
- **Lip-rolls**: `lipRollCredit(hz, targetHz)` returns 0–1 based on proximity, so approximate pitches earn slow progress
- **Other techniques**: binary — full credit or nothing

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

- Standard: zones are upper/lower thirds of the frequency range
- Lip-rolls: midpoint as single boundary (much more forgiving)

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
| `pitch-detection-slide` + `technique: "lip-rolls"` | Smooth glide high→low (400ms hold + 2500ms ramp + 600ms hold) |
| `pitch-detection-slide` + other technique          | Start + end tones sequentially                                |
| `breathwork` / `learn`                             | No play button                                                |

All tones: binaural rendering (left = hz, right = hz + 6 Hz theta beat).

---

## Config → info modal

`ExerciseInfoModal` derives content from the stage:

- **Objective** — from `stageTypeId` + `notes` shape:
  - Single note: "Hold the tone in tune for X seconds"
  - Sequence: "Sing each tone in sequence, X seconds each"
  - Slide: "Slide smoothly through the range"
  - Breathwork: "Complete N cycles"
- **Instruction body** — `stage.instruction` verbatim
- **Lip-roll notice** — shown when `technique === "lip-rolls"` (mic detection is tricky)
- **Headphones notice** — shown for all pitch exercises (binaural beats)
- **"Don't show again"** — per stage ID in localStorage

Breathwork always shows the modal. Others show unless previously dismissed.

---

## Config → journey list card

`StageCard` renders from config fields directly — no `stageTypeId` branching:

```
stage.title          → primary text
stage.cardCue ?? stage.subtitle → secondary text
getStageDisplayColors(stage)    → left accent bar (gradient for multi-slot stages)
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
            └─→ setStageComplete(true)
```

Two channels by design:

- **Fast path** (`pitchHzRef`) — canvas reads synchronously in RAF. No React scheduling latency.
- **Slow path** (`pitchHz`) — React state at ~15 fps. Drives labels and progress.

---

## Completion → navigation

```
setStageComplete(true)
    → confetti + checkmark (2400ms)
    → user taps "Next"
    → isLastStageOfPart(stageId)?
        yes → PartCompleteModal (content from PART_COMPLETE_CONTENT[part])
              → "Continue" → getNextStageId(stageId)
        no  → getNextStageId(stageId) directly
    → router.push(/journey/{nextId})
    → info modal auto-shows on new stage
```

Progress: `localStorage attunr.journeyStage = max(current, stageId)`.

"Skip" advances without saving progress and forces the info modal on the next stage.

---

## Key files

| File                                                          | Role                                                          |
| ------------------------------------------------------------- | ------------------------------------------------------------- |
| `src/constants/journey/types.ts`                              | Stage types, BandTarget, TechniqueId                          |
| `src/constants/journey/*.ts`                                  | Per-part stage configs                                        |
| `src/components/JourneyView/components/JourneyExercise.tsx`   | Config → canvas, progress, completion                         |
| `src/components/JourneyView/components/ExerciseInfoModal.tsx` | Config → modal content                                        |
| `src/components/JourneyView/components/StageCard.tsx`         | Config → journey list card                                    |
| `src/components/JourneyView/utils.ts`                         | `resolveBandTarget()`, `getStageDisplayColors()`              |
| `src/lib/pitch.ts`                                            | `isInTune()`, `lipRollCredit()`, `matchesBandTarget()`        |
| `src/lib/vocal-scale.ts`                                      | `getScaleNotesForRange()` — builds bands from user's Hz range |
