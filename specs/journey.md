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

Eight parts, completed in order. Each part unlocks when the previous is complete.
Part 1 is vocal warmups (lip rolls) — start with Crown→Root, then Root→Crown→Root.

### Stage types

- **Technique intro** — First exercise of each technique block. Modal-only: learn the technique, "Video coming soon" placeholder, "Continue" advances. No canvas.
- **Individual** — Single chakra, hold in tune. Full or brief chakra card.
- **Sequence** — Multiple chakras in order. Same as before.

### Chakra detail styles

- **Full** — Name, mantra, element, frequency, longDescription. Used for first encounter with each chakra.
- **Brief** — Mantra + interestingFact. Used in Part 4+ technique exercises; avoids repetition.

### Part 1 — Foundation + Vocal warmups (5 stages)

| Stage | Type | Title |
|-------|------|-------|
| 1 | Technique intro | Chakra tones — what they are, why they're good |
| 2 | Technique intro | Lip rolls |
| 3 | Sequence | Lip rolls — high to low |
| 4 | Sequence | Lip rolls — low to high |
| 5 | Individual | Sustain a lip roll (5 s on one tone) |

### Part 2 — Sustain (8 stages)

| Stage | Type | Title |
|-------|------|-------|
| 6 | Technique intro | Sustain |
| 7–13 | Individual | Root, Sacral, Solar Plexus, Heart, Throat, Third Eye, Crown |

### Part 3 — Sequences (6 stages)

| Stage | Sequence |
|-------|----------|
| 14 | Root → Sacral |
| 15 | Root → Solar Plexus |
| 16 | Root to Heart |
| 17 | Heart to Third Eye |
| 18 | Third Eye & Crown |
| 19 | Full Alignment |

### Part 4 — Vowel U (8 stages)

Uuu is the easiest vowel to start with (easier than eee or aaa).

| Stage | Type | Title |
|-------|------|-------|
| 20 | Technique intro | Vowel U |
| 21–27 | Individual | Root, Sacral, Solar Plexus, Heart, Throat, Third Eye, Crown — U |

### Part 5 — Mantra (8 stages)

| Stage | Type | Title |
|-------|------|-------|
| 28 | Technique intro | Mantra |
| 29–35 | Individual | Root—LAM, Sacral—VAM, Solar Plexus—RAM, Heart—YAM, Throat—HAM, Third Eye—OM, Crown—AH |

### Part 6 — Vowel EE (4 stages)

| Stage | Type | Title |
|-------|------|-------|
| 36 | Technique intro | Vowel EE |
| 37–39 | Individual | Root, Heart, Crown — EE |

### Part 7 — Vowel flow (2 stages)

| Stage | Type | Title |
|-------|------|-------|
| 40 | Technique intro | Vowel flow U → EE |
| 41 | Individual | Heart — U to EE |

### Part 8 — Puffy cheeks (4 stages)

| Stage | Type | Title |
|-------|------|-------|
| 42 | Technique intro | Puffy cheeks |
| 43–45 | Individual | Root, Heart, Crown — Puffy cheeks |

**Mantra stage:** Requires singing the actual seed syllable (LAM, VAM, RAM, etc.) on each chakra's tone — not just sustaining or using generic vowels.

**Implementation notes:**

- Technique intros: modal with instruction + Video coming soon. "Continue" marks complete and opens next stage modal.
- Brief chakra cards show mantra + interestingFact (from chakras.ts).
- Progress key: `attunr.journeyStage` 0–45.

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
Key: `attunr.journeyStage` — integer 0–45.

---

## Part 3 — Technique stage details

### Stage 14 — Vowel foundations

**Instruction:** "Sing each chakra tone using four vowels: U (as in 'moon'), O (as in 'go'), I (as in 'see'), and A (as in 'father'). Hold each vowel for a few seconds. Notice where the sound resonates — lower vowels tend toward the chest, higher toward the head."

**Chakras:** Root → Crown (all 7).

**Success:** Hold each chakra in tune for cumulative time (e.g. 3s total per chakra, or 12s total across the run). Optionally: one pass through all seven with vowels is enough to complete.

### Stage 15 — Vowel flow

**Instruction:** "Pick a tone (e.g. Heart). Sing U and smoothly transition to EE without changing pitch. Then try O → A, or I → U. Feel the shape of your mouth shift while the tone stays steady. This builds vocal flexibility."

**Chakras:** Heart (or user picks; Heart is a good middle-ground).

**Success:** Hold the tone in tune while performing at least one vowel transition (e.g. 5s total in tune).

### Stage 16 — Lip rolls

**Instruction:** "Let your lips loosely buzz (like a motorboat) while you sing. Start on Root and move up to Crown. Keep the breath steady — the lips should vibrate without force. This loosens the jaw and warms the voice."

**Chakras:** Root → Crown (sequence).

**Success:** Same as sequence stages — each chakra held for 2s in order.

### Stage 17 — Puffy cheeks

**Instruction:** "Fill your cheeks with air, then sing the tone without releasing. Your cheeks stay rounded. Hold for a few seconds, then release gently. This develops breath control and teaches you to sing without jaw tension."

**Chakras:** Root → Crown (can do one chakra or full sequence; full sequence is more advanced).

**Success:** Hold each target tone in tune for cumulative time while maintaining puffy cheeks.

---

## Out of scope (this phase)

- Scores or star ratings
- Timed sessions
- Social sharing of progress
- Video or audio instruction clips
