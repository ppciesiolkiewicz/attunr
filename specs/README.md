# attunr (web) – Product Specifications

Web edition of attunr, built with Next.js + Turbopack, deployed on Vercel.

**Conventions:** Keep files small (under ~300 lines). Split large files by logical unit (e.g. exercise config per part). See [Code Organization](./code-organization.md).

## Specs index

| Spec | Description |
| ---- | ----------- |
| [App Overview](./app-overview.md) | Vision, scope, tone system, feature status |
| [Language & Messaging](./language-and-messaging.md) | Tone of voice, terminology, approved copy |
| [Practice View](./practice-view.md) | Shared pitch canvas + audio; navigation overview |
| [Train Tab](./train-tab.md) | Free-form practice view |
| [Journey](./journey.md) | Guided path — 49 stages, 9 parts |
| [Pitch Canvas](./pitch-canvas.md) | Canvas rendering — dot trail, log-scale |
| [Audio Engine](./audio-engine.md) | Binaural beats |
| [Settings](./settings.md) | Tuning, voice type, localStorage persistence |
| [Tech Stack](./tech-stack.md) | Next.js, Tailwind v4, ml5 CREPE, Web Audio API |
| [Code Organization](./code-organization.md) | File size limits, splitting strategy |

## Current build status

| Feature | Built |
|---------|-------|
| Pitch canvas (7 bands, dot trail, log-scale) | ✓ |
| Real-time pitch detection (ml5 CREPE) | ✓ |
| Tone buttons | ✓ |
| Binaural beats | ✓ |
| Onboarding with vocal range detection | ✓ |
| App navigation (Train / Journey tabs) | ✓ |
| Journey — 49 stages | ✓ |
| Settings panel (slide-over) | ✓ |
| localStorage persistence | ✓ |
| A432 / A440 / A444 / A528 tuning | ✓ |
| Farinelli breathwork exercise | ✓ |
| Mantra/sound cards (Part 9) | ✓ |
| Drone accompaniment | Not built |
| Waveform ring | Not built |

## Relationship to attunr-expo

| Concern | attunr-expo (mobile) | attunr (web) |
|---------|----------------------|--------------|
| Platform | React Native / Expo | Next.js / Vercel |
| Pitch detection | pitchfinder YIN + expo-audio-studio | ml5 CREPE |
| Canvas renderer | React Native Skia | HTML5 Canvas 2D |
| Tone playback | expo-av / Web Audio | Web Audio API (binaural) |
| Journey path | ✓ | ✓ Built |
| Onboarding | ✓ | ✓ Built |
| Login / accounts | Planned | Out of scope |
