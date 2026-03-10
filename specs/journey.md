# Journey

A guided, progressive path through the seven chakra tones. Replaces the free-form trainer with a structured sequence of stages — first mastering each chakra individually, then combining them into flowing tunes.

---

## URL-driven flow

Journey is **URL-driven**: each step has its own URL. The flow is deterministic and shareable.

1. **User visits** `/journey/[id]` (e.g. `/journey/10`)
2. **Page** parses step id from URL, validates (1–48), finds the stage in `JOURNEY_STAGES`
3. **Render** by step type:
   - **Exercises** (`individual`, `sequence`, `slide`): PitchCanvas + exercise UI (detection, progress, Hear tone, Next/Skip)
   - **Learn steps** (`technique_intro`): Plain background + scrollable content (instructions, "Video coming soon", Previous/Next)
4. **Part complete modal**: When the user finishes the **last step of a part**, a congratulations modal appears (confetti, no fadeout). "Continue" navigates to the next step URL.
5. **Loop**: New URL → flow repeats from step 1.

Direct links work: sharing `/journey/16` opens that step. Navigation uses `router.push` — no client-side state for "current step"; the URL is the source of truth.

---

## Navigation & access

Journey is a separate view from the Train tab, accessible from the app header. The app has two top-level views: **Train** and **Journey**.

From the Journey list view, tapping a stage navigates to `/journey/[id]`. From a step, "← Journey" returns to the list; Previous/Next move between steps via URL.

---

## Step types

| Type | Rendering | Purpose |
|------|-----------|---------|
| **technique_intro** | Learn — plain background, scrollable text, "Video coming soon" placeholder | Introduce a technique before exercises |
| **individual** | Exercise — PitchCanvas, single-chakra hold | Hold one tone in tune |
| **sequence** | Exercise — PitchCanvas, multiple chakras in order | Sing tones in sequence (2s per tone) |
| **slide** | Exercise — PitchCanvas, continuous glide | Slide high→low or low→high (e.g. lip rolls) |

**Learn steps** have no canvas. "Next" or "Complete" advances to the next stage; "Previous" goes back. **Exercises** show the pitch canvas, detection, and success criteria.

---

## Part structure (9 parts, 48 stages)

| Part | Name | Stages | Last stage |
|------|------|--------|------------|
| 1 | Chakra tones | 1 | 1 |
| 2 | Vocal warmups | 2–8 | 8 |
| 3 | Sustain | 9–16 | 16 |
| 4 | Sequences | 17–22 | 22 |
| 5 | Vowel U | 23–30 | 30 |
| 6 | Mantra | 31–38 | 38 |
| 7 | Vowel EE | 39–42 | 42 |
| 8 | Vowel flow U → EE | 43–44 | 44 |
| 9 | Puffy cheeks | 45–48 | 48 |

Each part starts with a `technique_intro` (learn) followed by exercises. Stage ids are sequential.

---

## Part complete modal

When the user completes the **last step of a part** (e.g. stage 16 for Part 3):

- A modal appears: "Part [I–IX] Complete", part name, "What you learnt", optional tip
- **Confetti** plays on open (no fadeout animation)
- "Continue →" closes the modal and navigates to the next step URL

The modal is shown *within* the last step — same page, overlay. Continue triggers `router.push` to the next URL.

---

## Stage screen layout

### Learn step (technique_intro)

```
┌──────────────────────────────────────────────────┐
│  ← Journey   Part II · Step 2 of 7   [Settings]  │
├──────────────────────────────────────────────────┤
│  Part II — Vocal warmups                         │
│  Chest and head voice · Step 2 of 7              │
│  ─────────────────────────────────────────────  │
│  [instruction text]                               │
│  [Video coming soon]                              │
├──────────────────────────────────────────────────┤
│  [← Previous]                    [Next →]         │
└──────────────────────────────────────────────────┘
```

### Exercise step (individual, sequence, slide)

```
┌──────────────────────────────────────────────────┐
│  ← Journey   Part III — Sustain · Step 2 of 8 (i)│
├──────────────────────────────────────────────────┤
│         Pitch Canvas (target bands)               │
│         [pitch overlay: Hz / chakra]              │
│         [sequence/slide indicators if applicable] │
├──────────────────────────────────────────────────┤
│  [▶ Hear tone]  [← Previous]  [Next →] or [Skip →]│
└──────────────────────────────────────────────────┘
```

The **(i)** button opens the ExerciseInfoModal with chakra details, instructions, and "Begin" to dismiss.

---

## Success criteria

| Type | Criteria |
|------|----------|
| **individual** | Pitch within ±3% of target for cumulative hold time (e.g. 3–5s). Progress arc fills. |
| **sequence** | Each tone held 2s in order. Step indicator shows current tone. |
| **slide** | Glide high→low (or low→high) twice. Loose detection; focus on warming up. |

"Complete" appears when criteria are met. "Skip" advances without marking complete.

---

## Locked settings

When Journey is active:

- Frequency base and voice type are locked to onboarding/Settings
- A small label shows "Practising as [Tenor] · [A432]" — tap to open Settings

---

## Code structure

| Location | Purpose |
|----------|---------|
| `src/constants/journey/` | Stage data (one file per part) |
| `src/constants/journey/types.ts` | JourneyStage, TechniqueId, etc. |
| `src/constants/journey/index.ts` | Re-exports `JOURNEY_STAGES`, `TOTAL_JOURNEY_STAGES`, etc. |
| `src/app/journey/[id]/page.tsx` | Route: parse id, validate, render JourneyExercise |
| `src/components/JourneyView.tsx` | JourneyExercise, PartCompleteModal, ExerciseInfoModal |

See [Code Organization](./code-organization.md) for the splitting strategy.

---

## Progress persistence

Journey progress (highest completed stage) is stored in Settings. Key: `attunr.journeyStage` — integer 1–48. Used to show "Completed" on past steps and to track the current frontier.

---

## Out of scope (this phase)

- Scores or star ratings
- Timed sessions
- Social sharing of progress
- Video or audio instruction clips
