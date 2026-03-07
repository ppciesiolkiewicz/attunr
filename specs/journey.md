# Journey

A guided, progressive path through the seven chakra tones. Replaces the free-form
trainer with a structured sequence of stages — first mastering each chakra
individually, then combining them into flowing tunes.

## Navigation

Journey is a separate view from the Train tab, accessible from the app header.
The app has two top-level views: **Train** and **Journey**.

## Locked settings

When Journey mode is active, the following controls are **hidden and locked**:

- Frequency base (Absolute / By voice) — always uses voice-based
- Voice type selector — locked to whatever was set in onboarding / Settings
- Tuning selector — locked to whatever is set in Settings

The user set their voice type in onboarding. Journey uses those settings silently.
No knobs are exposed mid-exercise. The rationale: Journey is intentional practice,
not tinkering.

A small non-intrusive line at the top of the Journey view may read:
"Practising as [Tenor] · [A432]" — tapping it opens Settings.

---

## Structure

Two parts, completed in order. Part 2 unlocks after Part 1 is finished.

### Part 1 — Individual chakras (7 stages)

One stage per chakra, Root → Crown. Each stage: sing and sustain that single tone.

| Stage | Chakra | Target |
|-------|--------|--------|
| 1 | Root | Hold Root in tune |
| 2 | Sacral | Hold Sacral in tune |
| 3 | Solar Plexus | Hold Solar Plexus in tune |
| 4 | Heart | Hold Heart in tune |
| 5 | Throat | Hold Throat in tune |
| 6 | Third Eye | Hold Third Eye in tune |
| 7 | Crown | Hold Crown in tune |

### Part 2 — Sequences / tunes (6 stages)

Progressive combinations, sung in order as a flowing melody.

| Stage | Sequence | Theme |
|-------|----------|-------|
| 8 | Root → Sacral | Stability into flow |
| 9 | Root → Sacral → Solar Plexus | Grounding to power |
| 10 | Root → Sacral → Solar Plexus → Heart | Base to heart |
| 11 | Heart → Throat → Third Eye | Heart to mind |
| 12 | Third Eye → Crown | Into the higher tones |
| 13 | Root → Crown (all 7) | Full alignment |

---

## Stage screen layout

```
┌──────────────────────────────────────────────────┐
│  ← Journey   Stage 3 of 13          [Settings]  │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────────────────────────────────┐    │
│  │         Chakra detail card               │    │
│  │  Solar Plexus · Fire · RAM               │    │
│  │  "Power & transformation"                │    │
│  │  "Sing RAM on this tone…"                │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│         Pitch Canvas (bands + trail)             │
│                                                  │
├──────────────────────────────────────────────────┤
│  [▶ Hear tone]       [✓ Complete]               │
└──────────────────────────────────────────────────┘
```

### Chakra detail card (top of stage)

Shown for every stage. For sequence stages, shows all chakras in that sequence.

Each chakra entry shows:

| Field | Example |
|-------|---------|
| Name | Solar Plexus |
| Element | Fire |
| Mantra | RAM |
| Description | "Power & transformation. The seat of confidence and will." |
| Frequency | 528 Hz (voice-adjusted) |

The card is always visible — not a tap-to-reveal. It provides context before and
during the exercise.

### Pitch canvas

Same rendering as the Train view but the canvas only highlights the target chakra
band(s) for this stage. Non-target bands are shown at reduced opacity.

Canvas is not interactive in Journey (no click-to-play on bands).

### Bottom actions

- **Hear tone** (▶) — plays the target tone(s) in sequence so the user can
  hear what to aim for before singing
- **Complete** (✓) — appears after success criteria are met; advances to next stage

---

## Success criteria

### Individual stage (Part 1)

- Pitch stays within ±3% of target for a cumulative **3 seconds**
- A progress arc fills around a central indicator as time accumulates
- Does not need to be continuous — accumulates across the session

### Sequence stage (Part 2)

- Each tone in the sequence must be held for **2 seconds** in order
- A step indicator shows which tone in the sequence is current
- Missing a tone or going out of order resets that tone's counter (not the whole
  sequence)

---

## Chakra data (mantras)

Add to `constants/chakras.ts`:

| Chakra | Mantra | Full description |
|--------|--------|-----------------|
| Root | LAM | "The foundation of your being. Grounding, stability, and safety." |
| Sacral | VAM | "The seat of creativity and flow. Emotion, pleasure, and connection." |
| Solar Plexus | RAM | "The centre of will and confidence. Power, purpose, and transformation." |
| Heart | YAM | "The bridge between body and mind. Love, compassion, and openness." |
| Throat | HAM | "The voice of your truth. Expression, clarity, and honest communication." |
| Third Eye | OM | "Intuition and inner vision. Clarity, insight, and expanded perception." |
| Crown | AH | "Pure consciousness. Unity, presence, and connection to all that is." |

---

## Progress persistence

Journey progress (highest completed stage) is saved to `localStorage`.
Key: `attunr.journeyStage` — integer 0–13.

---

## Out of scope (this phase)

- Scores or star ratings
- Timed sessions
- Social sharing of progress
- Video or audio instruction clips
