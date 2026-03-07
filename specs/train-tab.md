# Train Tab

Free-form chakra practice. No instructions, no completion gates, no progression.
The user sings whatever they like and gets real-time pitch feedback.

This is the default landing view after onboarding (before Journey is introduced).

## Relationship to Journey

| Dimension | Train | Journey |
|-----------|-------|---------|
| Structure | Free-form | Guided stages |
| Completion | None | Per-stage criteria |
| Settings | Full controls visible | Locked to user profile |
| Canvas | All 7 bands, all active | Target band(s) highlighted |
| Purpose | Warm-up, exploration | Learning, progression |

---

## Layout

```
┌──────────────────────────────────────────────────┐
│  Header: attunr · [Train] [Journey]  [⚙ Settings]│
├──────────────────────────────────────────────────┤
│  Controls: [Absolute · By voice]  [Voice type?]  │
├──────────────────────────────────────────────────┤
│                                                  │
│              Pitch Canvas                        │
│                                                  │
├──────────────────────────────────────────────────┤
│  [Root] [Sacral] [Solar] [Heart] [Throat]…      │
└──────────────────────────────────────────────────┘
```

**Tuning (A432, A440, A444, A528) lives in Settings — not shown here.**

---

## Controls bar

Two controls only:

### 1. Frequency base
- **Absolute** — canonical Solfeggio Hz (396–963), same for everyone
- **By voice** — scaled to the user's voice type

### 2. Voice type (voice mode only)
Shown only when "By voice" is selected. Pills: Bass · Baritone · Tenor · Alto · Soprano.

When voice mode is active, show disclaimer:
"Frequencies adjusted for [Voice type]. You can change your voice type in Settings."

---

## Canvas behaviour (Train-specific)

- All 7 bands always visible and equally emphasised
- Clicking a band plays that chakra's tone
- No target highlighting — every band reacts equally to the detected pitch
- Dot trail and live cursor behave as specified in [Pitch Canvas](./pitch-canvas.md)

---

## Tone buttons

Same as current implementation: one pill per chakra, Root → Crown.
Playing state and in-tune glow both apply.

Tapping a button plays the tone at the current voice-adjusted frequency.

---

## What Train does NOT have

- Tuning selector (moved to Settings)
- Completion indicators
- Step-by-step instructions
- Locked controls
