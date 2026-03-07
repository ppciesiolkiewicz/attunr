# Audio Engine

Covers all sound synthesis beyond basic tone preview. Replaces the plain sine wave
with richer, more intentional audio that fits the spiritual practice context.

---

## 1. Waveform ring

A visual element on the pitch canvas, not an audio feature.

An animated ring drawn around the **live cursor dot** that reflects pitch confidence
or vocal intensity in real time.

### Behaviour

- Ring radius oscillates gently when a pitch is detected (alive, breathing feel)
- When in-tune: ring glows brighter and expands slightly
- When out-of-tune: ring is dim and small
- When no pitch: ring is invisible

### Rendering

Drawn in the `PitchCanvas` RAF loop, just outside the live cursor dot:

```
outer ring radius = DOT_RADIUS + 4 + (confidence × 6)  // expands 0–6 px
opacity           = confidence × 0.6
color             = closest chakra RGB
```

`confidence` is derived from how close the detected pitch is to the nearest chakra
band (0 = far away, 1 = exactly on pitch).

The ring pulses at ~2 Hz (a slow sine wave modulation on top) to feel alive even
when the user sustains a steady note.

---

## 2. Binaural beats

Instead of a plain mono sine wave, each chakra tone is rendered as a **binaural
pair**: left ear gets the base frequency, right ear gets base + beat frequency.
The brain perceives the difference as a rhythmic pulse (the "beat") which entrains
brainwaves.

### Beat frequencies per chakra

Each chakra maps to a brainwave state:

| Chakra | Base Hz | Beat Hz | Brainwave | Effect |
|--------|---------|---------|-----------|--------|
| Root | 396 | 3.0 | Delta | Deep grounding, safety |
| Sacral | 417 | 6.0 | Theta | Creativity, emotion |
| Solar Plexus | 528 | 10.0 | Alpha | Confidence, flow |
| Heart | 639 | 8.0 | Alpha | Calm, openness |
| Throat | 741 | 14.0 | Alpha/Beta | Focus, clarity |
| Third Eye | 852 | 6.0 | Theta | Intuition, insight |
| Crown | 963 | 4.0 | Theta | Expanded awareness |

### Implementation (Web Audio API)

```
AudioContext
  ├── OscillatorNode (freq)         → GainNode → ChannelMergerNode.input[0] (L)
  └── OscillatorNode (freq + beat)  → GainNode → ChannelMergerNode.input[1] (R)
                                                        ↓
                                               ctx.destination
```

Both oscillators use `type: "sine"`. Same fade envelope as current (20ms in, 200ms
out).

> ⚠️ Requires stereo headphones for the binaural effect to work. Add a note in
> the UI: "Best experienced with headphones."

### Drone mode (continuous binaural)

When drone is active (see §3), the binaural pair runs continuously rather than
for a fixed duration.

---

## 3. Drone accompaniment

A continuous, soft background tone that plays while the user sings, giving a
stable reference pitch to match against.

### Behaviour

- Default drone: Root chakra (lowest tone, most grounding)
- User can change drone to any chakra via a selector in the audio controls
- Drone runs as a sustained binaural pair (see §2) with lower gain (~0.15)
- Soft pad-like quality: achieved by layering a second oscillator one octave up
  at very low gain (0.05), creating a gentle overtone

### Web Audio signal path

```
Fundamental osc (freq)           → GainNode (0.15)  ──┐
Overtone osc    (freq × 2)       → GainNode (0.05)  ──┤→ MasterGain → destination
Binaural R osc  (freq + beat)    → GainNode (0.12)  ──┘
```

Fade in: 800ms (slow, gentle entry). Fade out: 1200ms.

### UI controls

In the bottom panel of Train and Journey views, a small row of audio controls:

```
[🎵 Drone: Root ▾]   [🎧 Binaural: on]
```

- Drone selector: dropdown/picker for which chakra to use as drone, or "Off"
- Binaural toggle: on/off (default on)

When drone is active, the selected chakra's band on the canvas glows subtly even
if the user is not singing it.

---

## Headphones notice

Shown once (dismissed to localStorage) when the user first enables binaural or drone:

> "For the full experience, use stereo headphones. Binaural beats require
> separate audio in each ear to work."

---

## Tone preview (updated)

The existing "tap chakra button to hear tone" behaviour is updated to use the
binaural engine instead of the plain sine. Duration remains 1.8s.

If binaural is toggled off in settings, preview falls back to mono sine.
