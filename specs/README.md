# attunr (web) – Product Specifications

This is the web edition of attunr, built with Next.js 16 and deployed on Vercel.
It is a spiritual companion to the mobile app (`attunr-expo`) and shares the same
product vision and language principles.

At this stage the web app focuses exclusively on the **Chakra frequency trainer** —
the core pitch practice experience. Journey gamification and account features are
out of scope for the current phase.

## Specs index

| Spec | Description |
| ---- | ----------- |
| [App Overview](./app-overview.md) | Vision, spiritual positioning, scope vs. mobile |
| [Language & Messaging](./language-and-messaging.md) | Tone of voice, terminology, copy patterns |
| [Chakra Trainer](./chakra-trainer.md) | The main feature: frequencies, mic, visualiser, tone play |
| [Pitch Canvas](./pitch-canvas.md) | Canvas rendering — dot trail, log-scale, in-tune detection |
| [Settings Panel](./settings-panel.md) | Voice type, tuning, frequency base — inline within trainer |
| [Tech Stack](./tech-stack.md) | Next.js 16 + Turbopack, Tailwind v4, ml5 CREPE, Web Audio API |

## Relationship to attunr-expo

| Concern | attunr-expo (mobile) | attunr (web) |
|---------|----------------------|--------------|
| Platform | React Native / Expo | Next.js / Vercel |
| Pitch detection | pitchfinder YIN (AMDF) + expo-audio-studio | ml5 CREPE (deep learning) |
| Canvas renderer | React Native Skia | HTML5 Canvas 2D API |
| Tone playback | expo-av (native WAV) / Web Audio (web) | Web Audio API (oscillator) |
| Audio permissions | Expo Go limitations apply | Browser getUserMedia |
| Journey path | ✓ Implemented | Planned (future phase) |
| Onboarding | ✓ Implemented | Not required yet |
| Login / accounts | ✓ Planned | Out of scope |
