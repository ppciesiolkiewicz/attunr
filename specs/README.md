# attunr (web) – Product Specifications

Web edition of attunr, built with Next.js 16 + Turbopack, deployed on Vercel.
Shares the same product vision and language principles as `attunr-expo`.

## Specs index

| Spec | Description |
| ---- | ----------- |
| [App Overview](./app-overview.md) | Vision, spiritual positioning, scope |
| [Language & Messaging](./language-and-messaging.md) | Tone of voice, terminology, approved copy |
| [Chakra Trainer](./chakra-trainer.md) | Shared canvas + audio; navigation overview |
| [Train Tab](./train-tab.md) | Free-form practice view |
| [Journey](./journey.md) | Guided progressive stages (individual + sequence exercises) |
| [Pitch Canvas](./pitch-canvas.md) | Canvas rendering — dot trail, log-scale, waveform ring |
| [Audio Engine](./audio-engine.md) | Binaural beats (always on), waveform ring |
| [Settings](./settings.md) | Tuning, voice type, localStorage persistence |
| [Tech Stack](./tech-stack.md) | Next.js 16, Tailwind v4, ml5 CREPE, Web Audio API |

## Current build status

| Feature | Built |
|---------|-------|
| Pitch canvas (7 bands, dot trail, log-scale) | ✓ |
| Real-time pitch detection (ml5 CREPE) | ✓ |
| Chakra tone buttons | ✓ |
| Frequency base toggle (Absolute / By voice) | ✓ |
| Voice type selector + disclaimer | ✓ |
| Pitch readout overlay | ✓ |
| Onboarding with voice type detection | ✓ |
| Binaural beats (always on) | ✓ |
| Waveform ring | ✓ |
| App navigation (Train / Journey tabs) | ✓ |
| Journey — 13 stages | ✓ |
| Chakra detail card | ✓ |
| Settings panel (slide-over) | ✓ |
| localStorage persistence | ✓ |
| A444 / A528 tuning options | ✓ |

## Relationship to attunr-expo

| Concern | attunr-expo (mobile) | attunr (web) |
|---------|----------------------|--------------|
| Platform | React Native / Expo | Next.js / Vercel |
| Pitch detection | pitchfinder YIN + expo-audio-studio | ml5 CREPE |
| Canvas renderer | React Native Skia | HTML5 Canvas 2D |
| Tone playback | expo-av / Web Audio | Web Audio API (binaural, always on) |
| Journey path | ✓ | ✓ Built |
| Onboarding | ✓ | ✓ Built |
| Login / accounts | Planned | Out of scope |
