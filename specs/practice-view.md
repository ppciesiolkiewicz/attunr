# Practice View

The shared pitch canvas + audio engine that powers both the **Train tab** and **Journey** stages. This spec covers the shared elements. View-specific behaviour is in [Train Tab](./train-tab.md) and [Journey](./journey.md).

---

## App-level navigation

The app has two top-level views, selectable from the header:

```
┌────────────────────────────────────────────────────┐
│  attunr  ● ● ● ● ● ● ●   [Train] [Journey]  [⚙]  │
└────────────────────────────────────────────────────┘
```

- **Train** — free-form practice (default after onboarding)
- **Journey** — guided progressive stages
- **⚙** — opens Settings panel

---

## Shared layout

```
┌──────────────────────────────────────────────────┐
│  Header (nav + settings icon)                    │
├──────────────────────────────────────────────────┤
│  Controls bar (view-specific — see each spec)    │
├──────────────────────────────────────────────────┤
│                                                  │
│              Pitch Canvas (flex-1)               │
│                                                  │
├──────────────────────────────────────────────────┤
│  Bottom panel (tone buttons + audio controls)    │
└──────────────────────────────────────────────────┘
```

---

## Pitch canvas (shared)

See [Pitch Canvas](./pitch-canvas.md) for full rendering spec.

Summary:
- Horizontal tone bands, colour-coded by frequency region
- Log-scale Y axis (low frequencies at bottom, high at top)
- Pitch dot trail scrolling left continuously (time-based, not index-based)
- Live cursor dot drawn every frame (60fps)
- In-tune band gets brighter fill + thicker centre line
- Pitch readout overlay top-left: `{Hz}  → {Tone} · {Hz}` (→ becomes ✓ when locked)

---

## Tone buttons (shared)

One pill per tone in the bottom panel.
Playing/in-tune states as before. Tapping plays via the binaural audio engine.

---

## Mic lifecycle

Mic starts automatically during onboarding. There is no mic button on either
Train or Journey. If the mic stops or errors:
- Show a small banner: "Microphone stopped — [Restart]"
- Tapping Restart calls `startListening()` again

---

## Tuning

Tuning (A432 / A440 / A444 / A528) is set in **Settings only**. It is never
shown as a control on the Train or Journey screen.

---

## Out of scope (this phase)

- Completion gates (Train only)
- Social features
- Login / accounts
