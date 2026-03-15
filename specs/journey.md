# Journey

A guided, progressive path through vocal technique. Replaces the free-form trainer with a structured sequence of stages — first mastering individual tones, then combining them into flowing exercises.

---

## URL-driven flow

Journey is **URL-driven**: each step has its own URL. The flow is deterministic and shareable.

1. **User visits** `/journey/[id]` (e.g. `/journey/10`)
2. **Page** parses step id from URL, validates (1–116), finds the stage in `JOURNEY_STAGES`
3. **Render** by stage type:
   - **`pitch-detection`** / **`pitch-detection-slide`**: PitchCanvas + exercise UI (detection, progress, Hear tone, Next/Skip)
   - **`breathwork`**: Breathing cycle UI (no pitch detection)
   - **`learn`**: Plain background + scrollable content (instructions, Previous/Next)
4. **Part complete modal**: When the user finishes the **last step of a part**, a congratulations modal appears (confetti). "Continue" navigates to the next step URL.
5. **Loop**: New URL → flow repeats from step 1.

Direct links work: sharing `/journey/16` opens that step. Navigation uses `router.push` — no client-side state for "current step"; the URL is the source of truth.

---

## Navigation & access

Journey is a separate view from the Train tab, accessible from the bottom navigation. From the Journey list view, tapping a stage navigates to `/journey/[id]`. From a step, "← Journey" returns to the list; Previous/Next move between steps via URL.

---

## Stage types

| stageTypeId | Rendering | Purpose |
|-------------|-----------|---------|
| `learn` | Plain background, scrollable text | Introduce a technique or part before exercises |
| `pitch-detection` | PitchCanvas, hold one or more tones in sequence | Hold one tone or sing tones in sequence |
| `pitch-detection-slide` | PitchCanvas, continuous glide | Slide between two tones (e.g. lip rolls) |
| `breathwork` | Breathing cycle UI | Farinelli breathing cycles — no pitch detection |

**Intro stages** have no canvas. **Exercise stages** (`pitch-detection`, `pitch-detection-slide`, `breathwork`) show the relevant UI and success criteria. See [Exercise Config Flow](./exercise-config-flow.md) for detailed data flow, canvas selection, and progress models.

---

## Part structure (20 parts, 116 stages — Parts 11–12 temporarily disabled)

Each part mixes exercise types (warmup, resonance, articulation, control) and includes Farinelli breathwork. Difficulty progresses from low register → high register, with vowels introduced progressively: U → OO/OH → AH → EH → EE.

| Part | Name | Stages | Focus |
|------|------|--------|-------|
| I | Introduction | 1 | Vocal placement concept |
| II | First Sounds | 2–7 | Chest & head voice, first lip rolls |
| III | Lip Rolls & Breath | 8–13 | Lip roll mastery, breathwork, first humming |
| IV | Low Resonance | 14–19 | Humming + U alternating in low range |
| V | Building Range | 20–25 | Humming + U in mid range, first sequences |
| VI | Rounded Vowels | 26–31 | Introduce OO and OH |
| VII | Vowel Warmth | 32–37 | OO/OH deeper, sequences, lip rolls |
| VIII | The Open AH | 38–43 | AH vowel, first vowel flows |
| IX | Breath & Body | 44–49 | Puffy cheeks intro, AH range |
| X | Sequences & Range | 50–55 | Multi-tone sequences with known vowels |
| ~~XI~~ | ~~Chakras — Earth~~ | ~~56–61~~ | *Temporarily disabled* |
| ~~XII~~ | ~~Chakras — Sky~~ | ~~62–67~~ | *Temporarily disabled* |
| XIII | Forward EH | 68–73 | EH vowel, forward resonance |
| XIV | EH Mastery | 74–79 | EH range, sequences, puffy cheeks |
| XV | Warmup III | 80–85 | Advanced warmup: all techniques |
| XVI | Vowel EE | 86–91 | EE (narrowest, hardest vowel) |
| XVII | EE & Brightness | 92–97 | EE high register, U→EE flow |
| XVIII | Vowel Flow | 98–103 | Vowel transitions: U→OO, OO→AH, AH→EE |
| XIX | Vowel Mastery | 104–109 | Vowel cascade, advanced flows |
| XX | Vocal Control | 110–116 | Peak difficulty: all techniques combined |

Most parts start with an `learn` stage followed by exercises. Some later parts skip the learn stage when no new concept is introduced.

> **Parts 11–12 (Chakras)** are temporarily disabled. Stage IDs 56–67 are reserved but not in the active `JOURNEY_STAGES` array. Navigation uses `getNextStageId()` to skip the gap (Part X stage 55 → Part XIII stage 68).

---

## Part complete modal

When the user completes the **last step of a part** (e.g. stage 7 for Part II):

- A modal appears: "Part [I–XX] Complete", part name, "What you learnt", optional tip
- **Confetti** plays on open
- "Continue →" closes the modal and navigates to the next step URL

The modal is shown within the last step — same page, overlay.

---

## Stage screen layout

### Intro step

```
┌──────────────────────────────────────────────────┐
│  ← Journey   Part II · Vocal Warmups   [Settings] │
├──────────────────────────────────────────────────┤
│  [instruction text]                               │
├──────────────────────────────────────────────────┤
│  [← Previous]                    [Next →]         │
└──────────────────────────────────────────────────┘
```

### Exercise step (pitch-detection, slide, breathwork)

```
┌──────────────────────────────────────────────────┐
│  ← Journey   Part III — Sustain   (i)  [Settings] │
├──────────────────────────────────────────────────┤
│         Pitch Canvas (target bands)               │
│         [pitch overlay: Hz / tone]                │
├──────────────────────────────────────────────────┤
│  [▶ Hear tone]  [← Previous]  [Next →] or [Skip]  │
└──────────────────────────────────────────────────┘
```

The **(i)** button opens the ExerciseInfoModal with instructions and "Begin" to dismiss.

On desktop, the part name is shown alongside the stage title in the header.

---

## Success criteria

| Type | Criteria |
|------|----------|
| `pitch-detection` (single note) | Pitch within ±3% of target for cumulative hold time (configurable per stage via `notes[0].time`). Progress arc fills. |
| `pitch-detection` (multi-note sequence) | Each tone held for its configured time in order. Step indicator shows current tone. |
| `pitch-detection-slide` | Glide between the two tones. Loose detection; focus on warming up. |
| `breathwork` | Complete the configured number of breathing cycles (`maxCount`). |

"Complete" appears when criteria are met. "Skip" advances without marking complete.

---

## Code structure

| Location | Purpose |
|----------|---------|
| `src/constants/journey/` | Stage data (one file per part) |
| `src/constants/journey/types.ts` | `JourneyStage`, `StageTypeId`, `Note`, `TechniqueId`, etc. |
| `src/constants/journey/index.ts` | Re-exports `JOURNEY_STAGES`, `TOTAL_JOURNEY_STAGES`, part titles, etc. |
| `src/app/journey/[id]/page.tsx` | Route: parse id, validate, render JourneyExercise |
| `src/components/JourneyView.tsx` | JourneyExercise, PartCompleteModal, ExerciseInfoModal |

---

## Progress persistence

Journey progress (highest completed stage) is stored in localStorage. Key: `attunr.journeyStage` — integer 1–116. Used to show "Completed" on past steps and to track the current frontier.

---

## Out of scope (this phase)

- Scores or star ratings
- Timed sessions
- Social sharing of progress
- Video or audio instruction clips
