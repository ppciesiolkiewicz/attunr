# Audio Engine

## Binaural beats (always on)

Every chakra tone is rendered as a **binaural pair** rather than a plain mono sine.
This is not a user setting — it is always active.

Left ear receives the base frequency; right ear receives base + a small offset.
The brain perceives the difference as a slow rhythmic pulse that entrains brainwaves
toward a target state for each chakra.

### Beat frequencies

| Chakra | Base Hz | Beat Hz | Brainwave | Effect |
|--------|---------|---------|-----------|--------|
| Root | 396 | 3 | Delta | Grounding, safety |
| Sacral | 417 | 6 | Theta | Creativity, emotion |
| Solar Plexus | 528 | 10 | Alpha | Confidence, flow |
| Heart | 639 | 8 | Alpha | Calm, openness |
| Throat | 741 | 14 | Alpha/Beta | Focus, clarity |
| Third Eye | 852 | 6 | Theta | Intuition, insight |
| Crown | 963 | 4 | Theta | Expanded awareness |

> Use stereo headphones for the binaural effect. It has no perceptual benefit
> through a mono speaker, but the sound is still pleasant.

### Web Audio signal path

```
AudioContext
  ├── OscillatorNode (freq)         → GainNode → ChannelMergerNode.input[0]  (L)
  └── OscillatorNode (freq + beat)  → GainNode → ChannelMergerNode.input[1]  (R)
                                                       ↓
                                              masterGain → destination
```

Fade envelope: 20 ms in, 200 ms out. Default tone duration: 1.8 s.

## Waveform ring

A visual element in the pitch canvas, drawn around the live cursor dot at 60 fps.

- Radius = `DOT_RADIUS + 4 + confidence × 6 + pulse × 3`
- `confidence` = `pitchConfidence(hz, chakras)` — 0 far from any chakra, 1 exactly on
- `pulse` = `(sin(now / 500) + 1) / 2` — slow ~2 Hz oscillation for a breathing feel
- Opacity proportional to confidence
- Ring glows brighter and expands when in-tune

## Out of scope

- Drone accompaniment (removed)
- User-facing binaural toggle (always on)
- Custom beat frequency per user
