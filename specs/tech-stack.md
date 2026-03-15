# Tech Stack

Technical decisions for the web edition. This spec documents the *why* behind
each choice so future contributors can understand trade-offs.

## Framework — Next.js 16 with Turbopack

- **Why Next.js**: First-class Vercel integration, App Router, React Server
  Components for static layout, and a production-grade build pipeline.
- **Why Turbopack**: Rust-based bundler baked into Next.js dev mode. Delivers
  significantly faster HMR and cold-start times vs. webpack — important during
  active development of the canvas and audio hooks.
- **Dev command**: `next dev --turbopack` (set in `package.json`).
- **Vercel deployment**: Zero-config. Push to `main` → Vercel builds and
  deploys automatically.

## Styling — Tailwind CSS v4

- **Why v4**: No `tailwind.config.js` required. Design tokens live in
  `globals.css` via `@theme {}`. PostCSS-only pipeline via
  `@tailwindcss/postcss`.
- Custom tone slot colours are defined as CSS custom properties in `@theme` and
  used as utility classes throughout.
- Animations (glow-pulse, fade-in, spin) are defined as `@keyframes` in
  `globals.css` and applied with plain class names — no arbitrary Tailwind
  values needed.

## Pitch detection — ml5 CREPE

- **Why ml5 over YIN/AMDF**: CREPE (Convolutional Representation for Pitch
  Estimation) is a deep-learning model trained specifically on human voice data.
  It outperforms autocorrelation methods (YIN, AMDF) for monophonic voice pitch
  in typical browser audio conditions (variable mic quality, background noise).
- **Model loading**: CREPE model files are served from the ml5 CDN on first use
  (~15 MB). Browser caches them after that. A loading state is shown during
  download.
- **API**: `ml5.pitchDetection(modelURL, audioContext, micStream, onReady)`
  returns a detector. `detector.getPitch(cb)` is called recursively at ~11 Hz
  (limited by CREPE inference time).
- **SSR safety**: ml5 is loaded via dynamic `import('ml5')` inside a `useEffect`
  — it never runs on the server.
- **Frequency filter**: Only pitches in 50–2000 Hz are accepted (human voice
  range). Values outside this are treated as `null`.

## Tone playback — Web Audio API

- A single `AudioContext` is created lazily on first interaction (satisfies
  browser autoplay policy).
- Each tone is an `OscillatorNode` (type: `sine`) connected through a
  `GainNode` for a 20 ms fade-in / 200 ms fade-out envelope, preventing clicks.
- Duration: 1800 ms. Gain peak: 0.42.
- No files, no streaming — fully synthesised in memory.

## Canvas rendering — HTML5 Canvas 2D API

- **Why raw canvas over a library**: No abstraction overhead; full control over
  every pixel; the simplest approach for a static frequency-band layout with a
  time-scrolling dot trail. Libraries like Konva or Fabric add bundle weight
  without benefit here.
- **Why not WebGL / PixiJS**: Overkill for 2D frequency bands and dots.
- The canvas runs in its own `requestAnimationFrame` loop decoupled from React's
  render cycle. Data is passed via `useRef` to avoid triggering re-renders.
- HiDPI / Retina scaling: canvas is sized at `container × devicePixelRatio` with
  a `ctx.scale(dpr, dpr)` transform.

## Frequency math

```typescript
// 7 tone slots are evenly spaced across the user's detected vocal range.
// getScaleNotesForRange(lowHz, highHz) builds the full chromatic scale
// and marks every slot with isSlot: true.

// In-tune tolerance: ±3 % (~50 cents), ±8 % for lip rolls
inTune = |detected − target| / target ≤ 0.03
```

## File structure

Keep files small; split large configs by logical unit (e.g. journey exercises per part). See [Code Organization](./code-organization.md).

```
src/
├── app/
│   ├── layout.tsx            — root layout, metadata, global CSS import
│   ├── page.tsx              — root route (landing or app)
│   ├── globals.css           — Tailwind v4 import + @theme + @keyframes
│   └── journey/[id]/page.tsx — individual Journey exercise route
├── components/
│   ├── AppShell/             — app-level shell: nav, settings, onboarding, mic gate
│   ├── TrainView.tsx         — free-form practice (pitch canvas + tone buttons)
│   ├── JourneyView/          — guided exercises (StageCard, JourneyExercise, etc.)
│   ├── PitchCanvas.tsx       — scrolling dot-trail canvas (sequences, slides)
│   ├── BalanceBallCanvas.tsx  — ball-on-hill canvas (single-note exercises)
│   └── HillBallCanvas.tsx    — slope canvas (range exercises: Low U, Hoo Hoo)
├── constants/
│   ├── tone-slots.ts         — SlotId, Slot, Band, SLOTS, SLOT_ORDER, re-exports
│   ├── chakras.ts            — ChakraId, Chakra, CHAKRAS (chakra domain data only)
│   └── journey/              — 116-exercise config split by part; types.ts for JourneyExercise
├── hooks/
│   ├── usePitchDetection.ts  — ml5 CREPE lifecycle (idle → mic → model → poll)
│   └── useTonePlayer.ts      — Web Audio binaural oscillator with fade envelope
└── lib/
    ├── pitch.ts              — isInTune, findClosestBand, matchesBandTarget
    └── vocal-scale.ts        — getScaleNotesForRange (builds bands from Hz range)
```

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 16.x | Framework + Turbopack |
| `react` / `react-dom` | 19.x | UI runtime |
| `ml5` | 0.12.x | CREPE pitch detection |
| `tailwindcss` | 4.x | Utility CSS |
| `@tailwindcss/postcss` | 4.x | PostCSS plugin for Tailwind v4 |
| `typescript` | 5.x | Type safety |

No UI component library. No state management library. No routing beyond Next.js
App Router. Keep it lean.
