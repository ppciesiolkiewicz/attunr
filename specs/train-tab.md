# Train Tab

Free-form vocal practice. No instructions, no completion gates, no progression.
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
│  Controls:                              [ℹ Info] │
├──────────────────────────────────────────────────┤
│                                                  │
│              Pitch Canvas                        │
│                                                  │
├──────────────────────────────────────────────────┤
│  [▶ 396 Hz] [▶ 417 Hz] [▶ 528 Hz] …             │
└──────────────────────────────────────────────────┘
```

**Tuning (A432, A440, A444, A528) and vocal range live in Settings — not shown here.**

---

## Controls bar

Info button only. No mode toggle, no voice type selector.

Frequencies are always scaled to the user's detected vocal range (`getChakraFrequenciesForRange`).

---

## Canvas behaviour (Train-specific)

- All 7 bands always visible and equally emphasised
- Clicking a band plays that tone
- No target highlighting — every band reacts equally to the detected pitch
- Dot trail and live cursor behave as specified in [Pitch Canvas](./pitch-canvas.md)

---

## Pitch overlay

Shown while mic detects a pitch:
- Large Hz readout coloured by closest band
- Smaller line: `✓ 528 Hz` (in tune) or `→ 528 Hz` (approaching)
- No chakra/band name shown

---

## Tone buttons

One pill per tone. Each shows:
- Play icon
- Frequency in Hz (e.g. `528 Hz`)

No chakra name. Playing state and in-tune glow both apply.

---

## What Train does NOT have

- Mode toggle (Absolute / By voice removed)
- Voice type selector
- Chakra / band names on buttons or overlay
- Tuning selector (moved to Settings)
- Completion indicators
- Step-by-step instructions
- Locked controls
