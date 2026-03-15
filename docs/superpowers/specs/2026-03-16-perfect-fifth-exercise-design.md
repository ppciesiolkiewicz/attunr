# Perfect Fifth Exercise — Multi-Root with Chord Lead-ins

## Context

The Perfect Fifth exercise currently plays a single pair of notes (root and fifth) in the user's lowest major scale. With `MelodyScale[]` support now in place, we can create a richer exercise that walks the perfect fifth interval up through the user's range with arpeggiated chord lead-ins in the backing track.

## Design

### One exercise, 7 `MelodyScale` segments

Each segment is a perfect fifth (index 0 → index 4) in the major scale, with roots 1 through 7. A short rest separates each pair.

**Per-segment melody:**

```
[rest 0.3s] → [sing index 0, 2s] → [sing index 4, 2s]
```

### Backing track — arpeggiated chord lead-ins

Each segment's backing track plays an arpeggiated major triad (index 0 → 2 → 4, 0.3s each = 0.9s) to give harmonic context. The pattern is: previous chord → current chord.

| Segment | Root | Backing track |
|---------|------|---------------|
| 1 | 1 | rest 0.9s → arpeggio major(1) 0.9s |
| 2 | 2 | arpeggio major(1) 0.9s → arpeggio major(2) 0.9s |
| 3 | 3 | arpeggio major(2) 0.9s → arpeggio major(3) 0.9s |
| 4 | 4 | arpeggio major(3) 0.9s → arpeggio major(4) 0.9s |
| 5 | 5 | arpeggio major(4) 0.9s → arpeggio major(5) 0.9s |
| 6 | 6 | arpeggio major(5) 0.9s → arpeggio major(6) 0.9s |
| 7 | 7 | arpeggio major(6) 0.9s → arpeggio major(7) 0.9s |

Each arpeggio plays index 0 (0.3s) → index 2 (0.3s) → index 4 (0.3s) in that root's major scale.

### Timing alignment

The backing track for each segment runs during the rest + first ~1.5s of singing. The user hears the chord change as context before and while they start singing.

- Per segment: 0.3s rest + 2s root + 2s fifth = 4.3s
- Full exercise: 7 × 4.3s = ~30s
- Backing track per segment: 1.8s (two arpeggios), except segment 1 which is 0.9s rest + 0.9s arpeggio

### Config

- `minScore: 0` — introductory, no pressure
- `technique: "sustain"`
- Title: "Perfect Fifth"
- Instruction: "Sing the two notes as they appear — the piano plays each note for you"

## File to modify

| File | Change |
|------|--------|
| `src/constants/journey/part2.ts` | Replace current Perfect Fifth config with 7-segment melody + backing track |

## What does NOT change

- `MelodyScale` type, `buildScaleForRange()`, `resolveScaleTimeline()` — all unchanged
- MelodyExercise component — unchanged, just different config data
- Scoring, PitchCanvas rendering — unchanged
