# App Overview

> Adapted from `attunr-expo/specs/app-overview.md` for the web platform.

## Vision

Attunr helps people learn to sing with a **spiritual undertone**. It blends vocal
technique with intentional, resonant practice — so singing becomes both a skill
and a mindful practice.

The web edition brings this experience to the browser with no install, no account,
and no friction. Open the page and sing.

## Spiritual positioning

### 1. Solfeggio / Chakra tones

The seven chakra tones form the core of the experience:

| Chakra | Hz | Note | Element | Mantra |
|--------|----|------|---------|--------|
| Root | 396 | C | Earth | LAM |
| Sacral | 417 | D | Water | VAM |
| Solar Plexus | 528 | E | Fire | RAM |
| Heart | 639 | F | Air | YAM |
| Throat | 741 | G | Sound | HAM |
| Third Eye | 852 | A | Light | OM |
| Crown | 963 | B | Thought | AH |

These are the classical Solfeggio frequencies, shared with `attunr-expo`.

### 2. Tuning

Four tuning standards are available (in Settings):

| Standard | Hz | Character |
|----------|----|-----------|
| A432 | 432 | Healing-focused, softer — default |
| A440 | 440 | Standard Western |
| A444 | 444 | Natural tuning, sacred music traditions |
| A528 | 528 | "Miracle tone", sound healing |

See [Language & Messaging](./language-and-messaging.md) for approved copy.

## Scope

The web app has two views — **Train** (free-form) and **Journey** (guided) —
plus a **Settings** panel.

| Feature | Status |
|---------|--------|
| Chakra frequency trainer (canvas + mic) | ✓ Built |
| Onboarding with voice type detection | ✓ Built |
| Tone playback with binaural beats | ✓ Specced |
| Drone accompaniment | ✓ Specced |
| Waveform ring | ✓ Specced |
| Train tab (free-form, no tuning on screen) | ✓ Specced |
| Journey (48 guided stages) | ✓ Built |
| Settings panel with localStorage | ✓ Specced |
| Login / accounts | Out of scope |

## What makes the web version different

- **No install** — works in any modern browser
- **ml5 CREPE pitch detection** — deep-learning model, more accurate for voice
- **Binaural beats** — each chakra tone is rendered binaurally, not a plain sine
- **Full-screen canvas** — immersive, calming visualiser
- **Vercel deployment** — globally distributed, fast via Turbopack builds
