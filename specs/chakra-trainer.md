# Chakra Trainer

> This is the primary feature of the web app, combining the roles of
> `train-tab.md` and `train-component.md` from `attunr-expo` into a single
> full-screen web experience.

## Purpose

The Chakra Trainer lets users practise singing the seven sacred Solfeggio tones
in a free-form, gate-free session. There are no instructions, no completion
criteria, and no scores — just real-time feedback and the sound of the tones.

## Layout (top → bottom)

```
┌─────────────────────────────────────────────────────┐
│  Header: "attunr"  +  chakra spectrum dots          │
├─────────────────────────────────────────────────────┤
│  Controls bar: frequency mode ╷ voice type ╷ tuning │
├─────────────────────────────────────────────────────┤
│                                                     │
│              Pitch Canvas (flex-1)                  │
│   ← pitch dot trail      band labels →              │
│                                                     │
├─────────────────────────────────────────────────────┤
│  Bottom panel:                                      │
│    [Chakra tone buttons — tap to hear]              │
│    [Mic button]  status label                       │
└─────────────────────────────────────────────────────┘
```

The canvas fills all available vertical space between the controls bar and the
bottom panel.

## Frequency mode

Three knobs determine what frequencies are shown on the canvas:

| Knob | Options | Default |
|------|---------|---------|
| Frequency base | Absolute · By voice | Absolute |
| Voice type (voice mode only) | Bass · Baritone · Tenor · Alto · Soprano · General | Tenor |
| Tuning | A432 · A440 | A432 |

### Absolute mode

All seven chakras are shown at their canonical Solfeggio frequencies
(396, 417, 528, 639, 741, 852, 963 Hz). Tuning and voice type have no effect.
No disclaimer is shown.

### Voice-based mode

Frequencies are scaled by the voice type's `sacredFactor` (see
[Tech Stack](./tech-stack.md)), then multiplied by the tuning factor
(`432/440 ≈ 0.9818` for A432, `1.0` for A440).

A small disclaimer appears below the voice selector:
"Frequencies adjusted for [Voice type]. You can change this above."

## Pitch canvas

See [Pitch Canvas](./pitch-canvas.md) for full rendering spec.

Summary:
- 7 horizontal bands, one per chakra, coloured with chakra colour
- Log-scale Y axis (low frequencies at bottom, high at top)
- Pitch dot trail: newest dot at ~68 % from left, older dots scroll left
- In-tune band gets a brighter fill + thicker centre line
- Clicking anywhere on the canvas plays the closest chakra's tone

## Tone buttons (bottom panel)

One pill-shaped button per chakra, shown in order Root → Crown.

| State | Appearance |
|-------|------------|
| Default | Outlined, chakra colour at 25 % opacity |
| Playing | Filled at 10 % opacity, full-colour border |
| In-tune (locked) | Full-colour border + soft glow |

Tapping a button:
1. Plays a 1.8 s sine-wave tone at the chakra's frequency (Web Audio)
2. Highlights the button for the duration

## Mic button

A 64 × 64 px circular button centred at the bottom.

| State | Appearance |
|-------|------------|
| Idle | Subtle border, muted icon |
| Requesting mic | Spinner |
| Loading model | Spinner + helper text about download |
| Listening | Violet glow-pulse, filled mic icon |
| Error | Red tint, error message below |

Tapping when listening → stops the mic.
Tapping when idle/error → requests mic access, then loads ml5 CREPE model.

### Status label

A single line of text beneath the mic button reflecting current state:

| State | Text |
|-------|------|
| Idle | "Tap to start" |
| Requesting mic | "Requesting microphone…" |
| Loading model | "Loading CREPE model…" |
| Listening, no pitch | "Listening…" |
| Listening, pitch detected | "{Hz} Hz" or "{Hz} Hz · {Chakra} ✓" |
| Error | Human-readable error message |

When in-tune, the status text and Hz readout adopt the chakra's colour.

## Pitch readout overlay

When a pitch is detected, a floating overlay appears top-left of the canvas:

```
438 Hz          ← large, light-weight, chakra-coloured
→ Heart · 639 Hz   ← small, muted sub-label
```

When locked (in tune), `→` becomes `✓`.

## Interaction summary

| Action | Result |
|--------|--------|
| Tap mic button | Start / stop listening |
| Tap chakra button | Play that tone (1.8 s) |
| Click canvas | Play closest chakra tone |
| Change frequency mode | Canvas re-draws with new frequency set |
| Change voice type | Canvas re-draws (voice mode only) |
| Change tuning | Canvas re-draws |

## Out of scope (this phase)

- Completion gates or success criteria
- Session duration tracking
- Guided instructions
- Journey progression / unlocking stages
- Login or persistence beyond page session
