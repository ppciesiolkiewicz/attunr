# Audio Engine

## Binaural beats (always on)

Every tone is rendered as a **binaural pair** rather than a plain mono sine.
This is not a user setting — it is always active.

The base frequency is always the **exercise's target pitch** (the note the user is expected to sing).
Left ear receives the target pitch; right ear receives target pitch + a fixed 6 Hz offset.
The brain perceives the 6 Hz difference as a slow rhythmic pulse in the **theta** range (calming, meditative).

> Use stereo headphones for the binaural effect. It has no perceptual benefit
> through a mono speaker, but the sound is still pleasant.

### Web Audio signal path

```
AudioContext
  ├── OscillatorNode (freq)       → GainNode → ChannelMergerNode.input[0]  (L)
  └── OscillatorNode (freq + 6)   → GainNode → ChannelMergerNode.input[1]  (R)
                                                       ↓
                                              masterGain → destination
```

Fade envelope: 20 ms in, 200 ms out. Default tone duration: 1.8 s.

## Out of scope

- User-facing binaural toggle (always on)
- Custom beat frequency per user
