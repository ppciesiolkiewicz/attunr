# Journey Chapters Redesign

## Summary

Restructure the journey from a flat list of parts into **Chapters** — each chapter containing an optional warmup stage and a sequence of learning stages. Add a new **volume-detection** exercise type for beginner exercises that need no pitch analysis. Redesign Chapter 1 (Introduction) from scratch and sketch Chapter 2 (Building Foundation) with its warmup.

## Goals

- Start with easy, short exercises — no long 5th-interval melodies early on
- Introduce a volume-detection exercise for voiceless/beginner drills (sss-zzz, voiceless lip rolls)
- Structure the journey so each session = warmup + continue current stage
- Make it trivial to add new chapters later (`Journey = Chapter[]`)
- Preserve existing exercise content (learn text, vowel progressions, instructions) as a reference catalog for future chapters

## Non-goals

- Designing chapters beyond Chapter 2
- Badge/achievement system (see `specs/ideas-progression.md`)
- Secret stages (hooks noted but not designed here)
- New breathwork exercise types (volume-detection covers these for now)

---

## Data Model

### Chapter structure

```typescript
type Journey = Chapter[]

type Chapter = {
  chapter: number             // 1-indexed, consistent with existing numeric IDs
  title: string
  warmup?: StageConfig        // optional — Chapter 1 has none
  stages: StageConfig[]
}

type StageConfig = {
  id: string                  // stable slug, e.g. "ch1-wake-up", "ch2-warmup"
  title: string
  exercises: JourneyExercise[]
}
```

- `Journey` is `Chapter[]` — adding Chapter 3, 4, etc. is just appending to the array
- Chapter 1 has no warmup (it *is* the introduction)
- Chapter 2+ each have a warmup that is prompted when last warmup was >4 hours ago
- `Chapter.chapter` is numeric (consistent with existing `JourneyPart.part` and `BaseExerciseConfig.id`)
- `StageConfig.id` is a stable slug for progress tracking, analytics, and secret-stage unlock references

### BaseExerciseConfig.part migration

The existing `BaseExerciseConfig.part` field is used in headers, modals, analytics, and grouping. With chapters replacing parts:

- **Replace `part: number` with `chapter: number` and `stageId: string`** on `BaseExerciseConfig`
- These are assigned automatically by `assignIds` (same as `id` today) — exercise configs in part files don't specify them
- UI components that display "Part {roman}" switch to "Chapter {number}" or derive display text from the chapter/stage config
- `getStepInPart` in `JourneyView/utils.ts` becomes `getStepInStage`, filtering by `stageId` instead of `part`

### Warmup staleness

Track `lastWarmupCompletedAt: Date | null` in user progress. This is a single global timestamp — completing any chapter's warmup resets it. Rationale: warmups at different chapter levels all serve the same purpose (voice readiness), so completing one is sufficient.

When starting a stage in a chapter that has a warmup:
- If `lastWarmupCompletedAt` is null or >4 hours ago → prompt warmup first
- Otherwise → skip straight to the stage

### New exercise type: volume-detection

```typescript
type VolumeDetectionExercise = BaseExerciseConfig & {
  exerciseTypeId: "volume-detection"
  targetSeconds: number        // e.g. 15 — seconds of sound to accumulate
  cues: string[]               // e.g. ["sss", "zzz", "sss"] — loop endlessly on screen
  instruction: string
}
```

Added to the `ExerciseTypeId` union and `JourneyExercise` discriminated union.

**Behavior:**
- Mic listens for volume above a threshold (no pitch analysis)
- A vertical progress bar fills as accumulated sound-seconds increase
- Cues cycle on screen as visual guidance for what sound to make
- Exercise completes when `targetSeconds` of detected sound is reached
- Pauses when user stops making sound (progress holds, doesn't decrease)

### Relationship to existing types

- `JourneyPart` is replaced by `Chapter` + `StageConfig`
- `JOURNEY_CONFIG` becomes `Chapter[]` instead of `JourneyPart[]`
- `JOURNEY_EXERCISES` (flat list) is still derived by flattening all chapters → warmup + stages → exercises
- `assignIds` changes signature to accept `Chapter[]`, assigns `id`, `chapter`, and `stageId` to each exercise. IDs are globally sequential across all chapters, including warmup exercises.
- `buildIntroModal` needs a new `volume-detection` branch — renders instruction paragraphs and a subtitle like "Make sound for {targetSeconds} seconds"
- `getNextExerciseId` and `getStepInPart` (→ `getStepInStage`) update to work with the new flat list
- Existing exercise types (`pitch-detection`, `tone-follow`, `melody`, `breathwork-farinelli`, `learn`, `learn-notes-1`) are unchanged

### Exercise detail conventions

In the exercise tables below, "× 3 reps" means the `notes` array contains 3 `SustainNoteConfig` entries with the same target (the existing repetition mechanism). Pitch targets use chromatic degree notation — e.g., "low" = degree 1-3, "mid-low" = degree 4-6, "mid" = degree 7-9. Exact degrees are determined at implementation time based on the user's detected range.

---

## Chapter 1: "Introduction" (no warmup)

No warmup — the user's first experience. Just dive in.

### Stage 1: "Wake Up"

| # | Type | Title | Details |
|---|------|-------|---------|
| 1 | learn | Vocal placement | Existing learn content — directing voice to resonate in different body parts |
| 2 | learn-notes-1 | Understanding notes | Interactive range canvas — existing learn content |
| 3 | volume-detection | Sss-Zzz-Sss | cues: ["sss", "zzz", "sss"], targetSeconds: 15. First sound — no pitch needed |
| 4 | volume-detection | Voiceless lip roll | cues: ["lip roll"], targetSeconds: 15. Get lips buzzing without pitch pressure |

### Stage 2: "First Sounds"

| # | Type | Title | Details |
|---|------|-------|---------|
| 1 | pitch-detection | Gentle hum | Low, 5s × 3 reps. First pitched sound |
| 2 | pitch-detection | Hoo hoo | High range, accept "above", 5s × 3 reps. Head voice introduction |
| 3 | pitch-detection | Simple U | Low, 6s × 3 reps. Chest voice |
| 4 | tone-follow | Lip roll slide | Low→high slide, 2-3 required plays. Loosens range |

### Stage 3: "First Melody"

| # | Type | Title | Details |
|---|------|-------|---------|
| 1 | pitch-detection | Hum — mid-low | Mid-low, 5s × 3 reps |
| 2 | melody | Major Second | Major 2nd interval, slow tempo, short. First melody — just two adjacent notes |
| 3 | pitch-detection | U — mid-low | Mid-low, 6s × 3 reps |

### Stage 4: "Breath"

| # | Type | Title | Details |
|---|------|-------|---------|
| 1 | breathwork-farinelli | Farinelli breathwork | maxCount: 5. Centers breathing |
| 2 | tone-follow | Lip roll sustain | Hold at one pitch, 5s, 3 plays |
| 3 | pitch-detection | Hum — mid | Mid, 6s × 3 reps |

---

## Chapter 2: "Building Foundation" (has warmup)

### Warmup (prompted if >4h since last warmup)

| # | Type | Title | Details |
|---|------|-------|---------|
| 1 | volume-detection | Sss-Zzz-Sss | cues: ["sss", "zzz", "sss"], targetSeconds: 15. Wake up breath |
| 2 | tone-follow | Lip rolls — low to high | Slide low→high, 2 plays. Loosen lips |
| 3 | pitch-detection | Gentle hum | Low, 5s × 2 reps. First pitched sound |
| 4 | breathwork-farinelli | Farinelli breathwork | maxCount: 5. Center breathing |

Quick warmup — roughly 2-3 minutes.

### Stage 1: "Finding Your Range"

| # | Type | Title | Details |
|---|------|-------|---------|
| 1 | pitch-detection | Hum — low to mid | Various pitches (low, mid-low, mid), 5s × 3 reps each |
| 2 | pitch-detection | U — low to mid | Various pitches, 6s × 3 reps each |
| 3 | tone-follow | Lip rolls — high to low | Slide high→low, 3 plays |

### Stage 2: "First Scale"

| # | Type | Title | Details |
|---|------|-------|---------|
| 1 | melody | 5-tone scale | Slow tempo, stepping up 5 notes and back down |
| 2 | pitch-detection | Hum sequence | 3-note low sequence, 5s each |
| 3 | pitch-detection | U sequence | 3-note low sequence, 6s each |

### Stage 3: "Sustain & Control"

| # | Type | Title | Details |
|---|------|-------|---------|
| 1 | pitch-detection | Hum — mid | Mid, 8s × 3 reps. Longer holds |
| 2 | pitch-detection | U — mid | Mid, 8s × 3 reps |
| 3 | tone-follow | Lip roll sustain | Mid pitch, 6s, 3 plays |
| 4 | breathwork-farinelli | Farinelli breathwork | maxCount: 7. Deeper breathing |

---

## Reference Catalog

Before removing old part files, extract a reference doc (`specs/exercise-catalog.md`) containing:

- All learn screen text (vocal placement, chest/head voice, lip rolls, humming/resonance)
- Vowel progression ideas (U → OO → OH → AH → EH → EE) from parts 6-19
- Vowel transition flows and instructions
- Mantra/chakra content (parts 11-12)
- All intro/completion modal text and cues
- Farinelli tips and instructions

This catalog serves as a source for future chapters without losing the work already done.

---

## Secret Stage Hooks

Per `specs/ideas-progression.md`, secret stages can branch off at certain points. The chapter structure supports this — secret stages can attach to specific stages within a chapter via unlock conditions. Not designed in detail here but the data model accommodates it:

```typescript
type SecretStage = StageConfig & {
  unlockCondition: PrerequisiteUnlock | AchievementUnlock
}

type Chapter = {
  chapter: number
  title: string
  warmup?: StageConfig
  stages: StageConfig[]
  secretStages?: SecretStage[]  // optional side-paths
}
```

---

## Migration Path

1. Add `volume-detection` to `ExerciseTypeId` union and `JourneyExercise` discriminated union
2. Build volume-detection exercise component and canvas
3. Update `BaseExerciseConfig`: replace `part: number` with `chapter: number` + `stageId: string`
4. Replace `JourneyPart` / `JourneyPartInput` with `Chapter` + `StageConfig` types
5. Update `assignIds` to accept `Chapter[]` and assign `chapter` + `stageId` on each exercise
6. Add `volume-detection` branch to `buildIntroModal`
7. Create Chapter 1 and Chapter 2 exercise configs
8. Extract reference catalog from old part files
9. Update `JOURNEY_EXERCISES` flat list derivation to flatten chapters → warmup + stages → exercises
10. Update `getNextExerciseId` and rename `getStepInPart` → `getStepInStage`
11. Update UI components: headers ("Part" → "Chapter"), `JourneyList` grouping, `ExerciseInfoModal`
12. Update journey UI to handle chapters (chapter selector, warmup flow)
13. Add `lastWarmupCompletedAt` tracking to user progress
