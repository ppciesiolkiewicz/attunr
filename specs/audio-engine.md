# Audio Engine

## Binaural beats (always on)

Every tone is rendered as a **binaural pair** rather than a plain mono sine.
This is not a user setting — it is always active.

Left ear receives the base frequency; right ear receives base + a small offset.
The brain perceives the difference as a slow rhythmic pulse.

### Beat frequencies

| Base Hz | Beat Hz | Brainwave | Effect |
|---------|---------|-----------|--------|
| 396 | 3 | Delta | Grounding, safety |
| 417 | 6 | Theta | Creativity, emotion |
| 528 | 10 | Alpha | Confidence, flow |
| 639 | 8 | Alpha | Calm, openness |
| 741 | 14 | Alpha/Beta | Focus, clarity |
| 852 | 6 | Theta | Intuition, insight |
| 963 | 4 | Theta | Expanded awareness |

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

## Out of scope

- User-facing binaural toggle (always on)
- Custom beat frequency per user
