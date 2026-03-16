# Journey Chapter Redesign

## Overview

Restructure the journey from a flat list of parts into a **Chapter-based model**. Each chapter has an optional warmup and a sequence of stages. Chapter 1 ("Introduction") has no warmup. Chapter 2+ includes a warmup that is prompted when >4 hours since last warmup.

A new **volume-detection** exercise type is added for beginner exercises that don't require pitch analysis.

Existing exercise content (vowel progressions, learn screens, instructions) is preserved in a reference catalog for future chapters.

---

## Data model

```typescript
type Journey = Chapter[]

type Chapter = {
  title: string
  warmup?: StageConfig   // Chapter 1 has none; Chapter 2+ requires it
  stages: StageConfig[]
}

type StageConfig = {
  title: string
  exercises: JourneyExercise[]
}
```

### Warmup staleness

- Store `lastWarmupCompletedAt: number` (timestamp) in localStorage
- When entering a stage in a chapter that has a warmup:
  - If >4 hours since last warmup → prompt user to do warmup first
  - If ≤4 hours → skip straight to stage
- Completing a warmup updates the timestamp

---

## New exercise type: volume-detection

```typescript
type VolumeDetectionExercise = {
  exerciseTypeId: "volume-detection"
  targetSeconds: number       // total seconds of sound to accumulate
  cues: string[]              // visual cues that loop endlessly, e.g. ["sss", "zzz", "sss"]
  instruction: string
}
```

### Behaviour

- Microphone listens for volume above a threshold (no pitch analysis)
- A vertical progress bar fills as the user accumulates sound time
- Pauses filling when the user stops making sound
- Cues cycle on screen as visual guidance — they loop until targetSeconds is reached
- Exercise completes when accumulated sound time reaches targetSeconds

---

## Chapter 1: "Introduction" (no warmup)

### Stage 1: "Wake Up"

| # | Type | Title | Details |
|---|------|-------|---------|
| 1 | learn | Vocal placement | Existing content — vocal placement, resonance, body awareness |
| 2 | learn-notes-1 | Understanding notes | Interactive range canvas — existing content |
| 3 | volume-detection | Sss-zzz-sss | cues: ["sss", "zzz", "sss"], targetSeconds: 15 |
| 4 | volume-detection | Voiceless lip roll | cues: ["lip roll"], targetSeconds: 15 |

### Stage 2: "First Sounds"

| # | Type | Title | Details |
|---|------|-------|---------|
| 1 | pitch-detection | Gentle hum | Low, 5s × 3 reps |
| 2 | pitch-detection | Hoo hoo | High range, accept "above", 5s × 3 reps |
| 3 | pitch-detection | Simple U | Low, 6s × 3 reps |
| 4 | tone-follow | Lip roll slide | Low→high, 2-3 required plays |

### Stage 3: "First Melody"

| # | Type | Title | Details |
|---|------|-------|---------|
| 1 | pitch-detection | Hum — mid-low | 5s × 3 reps |
| 2 | melody | Major Second | Major 2nd interval, slow tempo, short |
| 3 | pitch-detection | U — mid-low | 6s × 3 reps |

### Stage 4: "Breath"

| # | Type | Title | Details |
|---|------|-------|---------|
| 1 | breathwork-farinelli | Farinelli breathwork | maxCount: 5 |
| 2 | tone-follow | Lip roll sustain | Hold at one pitch, 5s |
| 3 | pitch-detection | Hum — mid | 6s × 3 reps |

---

## Chapter 2: "Building Foundation" (has warmup)

### Warmup

Recommended before each session (prompted if >4h since last warmup).

| # | Type | Title | Details |
|---|------|-------|---------|
| 1 | volume-detection | Sss-zzz-sss | cues: ["sss", "zzz", "sss"], targetSeconds: 15 |
| 2 | tone-follow | Lip rolls — low to high | Slide, 2 required plays |
| 3 | pitch-detection | Gentle hum | Low, 5s × 2 reps |
| 4 | breathwork-farinelli | Farinelli breathwork | maxCount: 5 |

### Stage 1: "Finding Your Range"

| # | Type | Title | Details |
|---|------|-------|---------|
| 1 | pitch-detection | Hum — low | 5s × 3 reps |
| 2 | pitch-detection | Hum — mid-low | 5s × 3 reps |
| 3 | pitch-detection | U — low | 6s × 3 reps |
| 4 | pitch-detection | U — mid-low | 6s × 3 reps |
| 5 | tone-follow | Lip roll slide — high to low | 3 required plays |

### Stage 2: "Sustain & Control"

| # | Type | Title | Details |
|---|------|-------|---------|
| 1 | tone-follow | Lip roll sustain | Hold at mid-low, 5s |
| 2 | pitch-detection | Hum — mid | 6s × 3 reps |
| 3 | pitch-detection | U — mid | 6s × 3 reps |
| 4 | breathwork-farinelli | Farinelli breathwork | maxCount: 6 |

### Stage 3: "First Scale"

| # | Type | Title | Details |
|---|------|-------|---------|
| 1 | melody | 5-tone scale | Stepping up and back down, slow tempo |
| 2 | pitch-detection | Hum sequence | 3-note low sequence, 2s each |
| 3 | pitch-detection | U sequence | 3-note low sequence, 2s each |

### Stage 4: "Low Resonance"

| # | Type | Title | Details |
|---|------|-------|---------|
| 1 | pitch-detection | Hum — low | 5s × 3 reps |
| 2 | pitch-detection | U — low | 6s × 3 reps |
| 3 | pitch-detection | Hum — lower-mid | 5s × 3 reps |
| 4 | pitch-detection | U — lower-mid | 6s × 3 reps |
| 5 | breathwork-farinelli | Farinelli breathwork | maxCount: 6 |

---

## Secret stage hooks

Per [ideas-progression.md](../../../specs/ideas-progression.md), secret stages can branch off from chapters. The Chapter model supports this naturally — a secret stage is just a `StageConfig` unlocked by a prerequisite or achievement badge. The unlock mechanism is not designed here but the data model accommodates it.

---

## Exercise reference catalog

Before removing old part files, extract a reference document (`specs/exercise-catalog.md`) containing:

- All learn screen text (vocal placement, chest/head voice, lip rolls, humming, vowels, puffy cheeks, etc.)
- Vowel progression: U → OO → OH → AH → EH → EE
- Vowel transition exercises (U→AH, OO→EE, etc.)
- Mantra/chakra content (parts 11-12)
- All intro/completion modal text and instructions
- Exercise configurations (scales, targets, durations)

This catalog serves as a pool for designing Chapter 2+ stages and secret stages.

---

## What changes

| Area | Change |
|------|--------|
| `src/constants/journey/types.ts` | Add `VolumeDetectionExercise` to union, add `Chapter`, `StageConfig` types |
| `src/constants/journey/` | Replace part files with chapter files (`chapter1.ts`, `chapter2.ts`) |
| `src/constants/journey/index.ts` | Export `JOURNEY: Chapter[]` instead of flat parts |
| `src/components/Exercise/` | Add `VolumeDetectionExercise` component |
| `src/lib/resolve-exercise.ts` | Handle `volume-detection` type (passthrough — no pitch resolution needed) |
| Navigation / progress | Adapt to Chapter → Stage → Exercise hierarchy |
| localStorage | Add `lastWarmupCompletedAt` timestamp |
| Journey UI | Show chapters, stages within chapters, warmup prompt |

## What does NOT change

- Existing exercise types (pitch-detection, tone-follow, melody, breathwork-farinelli, learn, learn-notes-1)
- Scale and resolution system
- Exercise components (PitchExercise, ToneFollowExercise, MelodyExercise, etc.)
- Color spectrum system
