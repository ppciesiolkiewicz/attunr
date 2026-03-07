# Settings

A dedicated Settings panel (modal or slide-over), accessible from the app header
via a ⚙ icon. Not a separate page — it overlays the current view.

Replaces and supersedes `settings-panel.md` (which described the old inline
controls bar approach).

---

## What moved to Settings

| Control | Previously | Now |
|---------|-----------|-----|
| Tuning (A432 / A440 / A444 / A528) | Controls bar on main screen | Settings only |
| Voice type | Controls bar (voice mode) + onboarding | Settings + onboarding |

The main controls bar now only shows: **Frequency base** and (in voice mode)
**Voice type**. Tuning is never shown on the main screen.

---

## Sections

### 1. Voice

**Voice type**
Pills: Bass · Baritone · Tenor · Alto · Soprano

Selecting a new voice type immediately updates the canvas if voice mode is active.

Sub-text: "You can also re-detect your voice type from the onboarding screen."
(Link/button that re-opens the onboarding modal's detection flow.)

---

### 2. Tuning

Four options as a single-select group:

| Option | Label | Sub-label |
|--------|-------|-----------|
| A432 | **A432 Hz** | Softer, warmer — healing-focused practice |
| A440 | **A440 Hz** | Standard Western tuning |
| A444 | **A444 Hz** | Natural tuning, used in some sacred music traditions |
| A528 | **A528 Hz** | "Miracle tone" — popular in sound healing |

Helper text below the group:
"Try each and keep the one that feels right for your practice."

Tuning applies to voice-based mode only. In Absolute mode, tuning has no effect
(this is shown as a small note when Absolute is active in Train).

---

### 3. Audio

**Binaural beats**
Toggle on/off. Default: on.
Sub-text: "Plays slightly different frequencies in each ear. Use headphones."

**Drone tone**
Selector: Off · Root · Sacral · Solar Plexus · Heart · Throat · Third Eye · Crown
Default: Off.
Sub-text: "A continuous background tone to sing against."

---

### 4. About

- App version
- Link: "What are Solfeggio frequencies?" (external, opens in new tab)
- Link: "Privacy — your mic is never recorded"

---

## Persistence (localStorage)

All settings are saved to `localStorage` immediately on change. No save button.

| Key | Value |
|-----|-------|
| `attunr.voiceType` | `"tenor"` etc. |
| `attunr.tuning` | `"A432"` etc. |
| `attunr.freqBase` | `"absolute"` \| `"voice"` |
| `attunr.binaural` | `"true"` \| `"false"` |
| `attunr.drone` | `"off"` \| chakra id |
| `attunr.journeyStage` | integer string |
| `attunr.headphonesNotice` | `"dismissed"` |

On app load, read all keys and hydrate state before first render to avoid flicker.

---

## Design

- Settings opens as a slide-over panel from the right (or a centred modal on
  narrow screens)
- Dark background matching the app (`#0f0f1a`)
- Sections separated by subtle dividers
- Same pill/toggle patterns as existing controls bar
- Close via ✕ button or clicking outside

---

## What Settings does NOT include

- Custom frequency values per chakra (out of scope)
- Account / login
- Notification preferences
- Language selection
