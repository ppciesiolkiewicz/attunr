# Interval & Scale Infrastructure Redesign

## Two coordinate systems

1. **Outer (vocal range):** Root values, Range `from`/`to`. Positioned relative to the user's vocal range. Negative = from top. `root: -6` = 6th from highest. `to: -1` = highest note. **No change.**

2. **Inner (scale events):** `Index` targets inside melody events. Positioned relative to the scale's root. `i: 1` = root, `i: 2` = one above root. **Change:** negative/zero = below root. `i: 0` = one below root, `i: -1` = two below root.

These are already separate code paths (`Scale.resolve(Index)` vs `Scale.resolve(Range)` and `buildTonalScale` root computation).

---

## 1. Interval Chord Context

### Problem

The current `interval()` method produces a flat melody pattern per root (play both notes, pause, sing root, sing interval, sing root). This lacks harmonic context.

### Design

Refactor `interval()` to generate **one `MelodyScale` per root** with a I-chord intro.

**Events per root:**

```
play [1, 5, 8]    Quarter (4)    ← I chord (chromatic: root, +4 semitones, +7 semitones)
note 1             Half (8)       ← root (user sings)
note <degree>      Quarter (4)    ← interval note (e.g. 3 for major second, 13 for octave)
note 1             Quarter (4)    ← root (user sings)
```

No pause between chord and singing — the chord flows directly into the vocal entry.

**First root only:** the chord gets `Half (8)` instead of `Quarter` — longer intro since there's no preceding chord to transition from.

**First root example:**

```
play [1, 5, 8]    Half (8)       ← I chord (longer intro)
note 1             Half (8)       ← root
note 3             Quarter (4)    ← major second
note 1             Quarter (4)    ← root
```

**Scale type:** Each `MelodyScale` uses `type: "chromatic"`. Roots move chromatically in the same lo → hi → lo arc as the current implementation.

**Root arc:** Unchanged — `lo → hi → lo` (inclusive on both ends, return leg deduplicates endpoints).

**Callers:** `majorSecond`, `octave`, and `fifth` continue to call `interval()` with `chromaticDegree` — no API change. The `noteDuration` parameter is removed since durations are now fixed in the pattern.

**displayNotes:** Updated range: highest note is `hi + max(chromaticDegree - 1, 7)` to include the P5 of the highest root's chord.

---

## 2. Scale Index Semantics for Melody Events

### Problem

In `Scale.resolve()`, negative `Index` values currently mean "from end of scale" (e.g. `i: -1` = last note). For melody events this is unintuitive — negative should mean "below root." Currently **no melody events use negative indices**, so this change is purely forward-looking (enables approach chords, below-root notes).

### Design

**Change `Scale.resolve()` for `BandTargetKind.Index` only:**

- `i: 1` = root (unchanged)
- `i: 0` = one below root
- `i: -1` = two below root
- `i: -n` = (n+1) below root

**`BandTargetKind.Range` is unchanged** — negative `from`/`to` still means "from end of scale." This is the outer coordinate system (vocal range relative).

**Extend `buildTonalScale()`:** Currently builds notes starting at `rootMidi`. Extend downward to `lowMidi` so notes below root are available. Track the root's position in the array (e.g. `rootIndex` property on `Scale`) so positive indices resolve above root and negative/zero resolve below.

**Edge case:** If `root = 1` (root = lowest note), `i: 0` resolves to nothing below — return `[]`.

---

## 3. Root `startPoint`

### Problem

Root is always relative to the low note of the vocal range (`rootMidi = lowMidi + (root - 1)`). This makes it awkward to target notes relative to the top or center of range.

### Design

Add `startPoint` to `BaseScale`:

```ts
interface BaseScale {
  type: string;
  root: number;
  startPoint?: "start" | "end" | "center";  // default: "start"
}
```

Resolution in `buildTonalScale()`:

- `"start"` (default): `rootMidi = lowMidi + (root - 1)` — current behavior
- `"end"`: `rootMidi = highMidi - (root - 1)` — root=1 = highest note, root=2 = one below highest (mirrors "start")
- `"center"`: `rootMidi = centerMidi + (root - 1)` — where `centerMidi = Math.round((lowMidi + highMidi) / 2)`

All existing callers use the default `"start"`. This is purely additive — no migration needed.

---

## 4. Lip Roll Slide: 1 Octave

### Change

Chapter 1 lip roll slide currently spans the full vocal range (`startNote: -5, endNote: 4`). Change to span roughly 1 octave instead. The `startNote`/`endNote` values are in the outer coordinate system (vocal range relative) — no semantic change, just narrower range.

---

## Files changed

- `src/lib/scale.ts` — Index resolve semantics (below root for negative/zero), extend scale below root, startPoint resolution, add `rootIndex` tracking
- `src/constants/journey/types.ts` — add `startPoint` to `BaseScale`
- `src/constants/journey/exercise-generator.ts` — refactor `interval()` method, update lip roll slide range
- `src/constants/journey/exercise-generator.test.ts` — update interval tests
- `src/constants/journey/chapter1.ts` — lip roll slide range
