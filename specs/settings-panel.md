# Settings Panel

> Web equivalent of `attunr-expo/specs/settings.md`.
> Unlike the mobile app, the web app has no separate Settings screen —
> all controls are inline within the Chakra Trainer.

## Controls

All three controls live in the controls bar directly above the pitch canvas.
They are compact pill-style toggle groups, not full-screen modals.

### 1. Frequency base

| Option | Label | Description |
|--------|-------|-------------|
| `absolute` | **Absolute** | Canonical Solfeggio Hz, same for everyone |
| `voice` | **By voice** | Scaled to the selected voice type's range |

Shown always. Default: `absolute`.

### 2. Voice type (voice mode only)

Visible only when frequency base is set to "By voice".

| Option | Label | sacredFactor |
|--------|-------|-------------|
| `bass` | Bass | 0.35 |
| `baritone` | Baritone | 0.45 |
| `tenor` | Tenor | 0.50 |
| `alto` | Alto | 0.65 |
| `soprano` | Soprano | 0.90 |
| `general` | General | 1.00 |

Default: `tenor`.

Selecting a voice type immediately re-calculates and re-draws the frequency bands.

A disclaimer line appears below the selector strip when voice mode is active:
"Frequencies adjusted for [Voice type]. You can change this above."
(See [Language & Messaging](./language-and-messaging.md) for full copy rules.)

### 3. Tuning

| Option | Label |
|--------|-------|
| `A432` | A432 |
| `A440` | A440 |

Shown always (right-aligned in the controls bar). Default: `A432`.

In absolute mode, tuning has no visual effect on the canvas but the setting is
preserved for when the user switches to voice mode.

## Persistence

In phase 1, settings are **not persisted** across page reloads. They reset to
defaults each time.

Future: save to `localStorage` (no account required, no server calls).

## Design

- All selectors use the same visual pattern: a dark `bg-white/5` pill container
  with individual `rounded-md` buttons inside.
- Selected state: `bg-violet-600 text-white` for mode/voice, `bg-white/15 text-white`
  for tuning (neutral, not violet, since tuning is not spiritual — both are valid).
- Unselected state: muted text, transparent background.
- No dropdowns, no modals, no Settings page.
