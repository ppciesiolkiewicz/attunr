# App Overview

> Adapted from `attunr-expo/specs/app-overview.md` for the web platform.

## Vision

Attunr helps people learn to sing with a **spiritual undertone**. It blends vocal
technique with intentional, resonant practice — so singing becomes both a skill
and a mindful practice.

The web edition brings this experience to the browser with no install, no account,
and no friction. Open the page, tap the mic, and sing.

## Spiritual positioning

### 1. Solfeggio / Chakra tones

The seven chakra tones form the core of the current web experience:

| Chakra | Hz | Note | Element |
|--------|----|------|---------|
| Root | 396 | C | Earth |
| Sacral | 417 | D | Water |
| Solar Plexus | 528 | E | Fire |
| Heart | 639 | F | Air |
| Throat | 741 | G | Sound |
| Third Eye | 852 | A | Light |
| Crown | 963 | B | Thought |

These are based on the classical Solfeggio scale. They are the same frequencies
used in `attunr-expo`, ensuring consistency across platforms.

### 2. A432 Hz healing tuning

- **A432 Hz** — Softer, warmer tuning many people associate with meditative and
  healing-focused practice. Default in attunr.
- **A440 Hz** — Standard concert pitch; practical for alignment with instruments.

See [Language & Messaging](./language-and-messaging.md) for approved copy for
each option.

## Current scope (web phase 1)

The web app ships one main experience: **the Chakra Trainer**.

| Feature | Status |
|---------|--------|
| Chakra frequency trainer (visualiser + mic) | ✓ In scope |
| Tone playback (tap to hear each chakra) | ✓ In scope |
| Voice type and tuning settings | ✓ In scope |
| Absolute vs. voice-scaled frequencies | ✓ In scope |
| Real-time pitch detection (ml5 CREPE) | ✓ In scope |
| Journey / gamification | Planned – future phase |
| Onboarding / voice range detection | Planned – future phase |
| Login / accounts / persistence | Out of scope |

## What makes the web version different

- **No install** — works in any modern browser
- **ml5 CREPE pitch detection** — deep-learning model, more accurate on browser
  audio than YIN/AMDF for most voices
- **Full-screen canvas** — the pitch visualiser fills most of the viewport for
  an immersive, calming experience
- **Vercel deployment** — globally distributed, fast cold starts via Turbopack
  builds
