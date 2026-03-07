# Pitch Canvas

> Web equivalent of the rendering section in `attunr-expo/specs/train-component.md`
> and `attunr-expo/specs/vocal-training.md`. Uses the HTML5 Canvas 2D API
> instead of React Native Skia.

## Purpose

A high-performance, full-size canvas that:
1. Renders the seven chakra frequency bands as reference guides
2. Draws a real-time pitch dot trail as the user sings
3. Highlights the currently-matched chakra band when the pitch locks in

## Rendering pipeline

The component owns its own `requestAnimationFrame` loop. No React re-renders
happen during active use — data flows via refs.

```
ChakraTrainer (state owner)
    │
    ├─ chakras[]      ──→  chakrasRef  ──┐
    └─ currentHz       ──→  currentHzRef ─┤
                                          ↓
                                    RAF loop (60 fps)
                                          │
                                    PitchCanvas draws
```

## Coordinate system

### Y axis — log-scale frequency mapping

```
freqToY(hz) = H - ( log(hz) - log(minHz) ) / ( log(maxHz) - log(minHz) ) × H
```

- `minHz` = lowest chakra frequency × 0.76 (padding below Root)
- `maxHz` = highest chakra frequency × 1.30 (padding above Crown)
- Low frequencies render near the **bottom** of the canvas.
- High frequencies render near the **top**.

Using a log scale ensures that the perceptual distance between any two adjacent
chakras is visually uniform, even though their Hz gaps are unequal.

### X axis — time scroll

- Newest dot is always drawn at `NEWEST_X = canvas.width × 0.68`.
- Each subsequent (older) dot is offset left by `DOT_SPACING_PX = 8 px`.
- Dots that would render at `x < 0` are skipped.

## Config constants

| Constant | Value | Purpose |
|----------|-------|---------|
| `DOT_INTERVAL_MS` | 85 ms | How often a new dot is added to the trail |
| `MAX_DOTS` | 90 | Maximum trail length (~7.6 s of history) |
| `DOT_SPACING_PX` | 8 px | Horizontal gap between trail dots |
| `DOT_RADIUS` | 5 px | Radius of the newest dot; shrinks with age |
| `NEWEST_X` | 0.68 | Fraction of canvas width for newest dot |
| Tolerance | 3 % | `|detected − target| / target ≤ 0.03` |

## Chakra band rendering

For each chakra:

1. **Band fill** — Linear gradient (transparent → chakra colour → transparent),
   vertical, centred on the chakra's Y position. Alpha: 0.08 default, 0.22
   when in-tune.
2. **Centre line** — Dashed (`3 px on, 7 px off`), chakra colour at 22 % alpha
   (60 % when in-tune), 1 px wide (1.5 px when in-tune).
3. **Right labels** — Two lines right-aligned at `canvas.width − 16 px`:
   - Line 1: chakra name in small-caps, 11 px 600-weight
   - Line 2: frequency in Hz, 10 px 400-weight, more muted
4. **Left note badge** — Single note letter (C, D, E…), 10 px 500-weight,
   left-aligned at 14 px.

All label alphas are lower when not in-tune, higher when in-tune.

## Dot trail rendering

Each dot in the trail (newest first):

```
age     = i / trail.length          // 0 = newest, 1 = oldest
opacity = (1 − age) × 0.88
radius  = DOT_RADIUS × (1 − age × 0.45)
color   = closest chakra's RGB
```

### In-tune dot (filled)

```
ctx.arc(x, y, radius, 0, 2π)
ctx.fillStyle = rgba(chakra.rgb, opacity)
```

The newest in-tune dot gets an additional white core circle at 38 % radius,
`rgba(255,255,255,0.65)`, to make it pop.

### Out-of-tune dot (outlined)

```
ctx.strokeStyle = rgba(chakra.rgb, opacity × 0.55)
ctx.lineWidth = 1.2
```

## Canvas setup and DPI scaling

On mount and on every `ResizeObserver` trigger:

```typescript
canvas.width  = container.clientWidth  * devicePixelRatio
canvas.height = container.clientHeight * devicePixelRatio
canvas.style.width  = `${container.clientWidth}px`
canvas.style.height = `${container.clientHeight}px`
ctx.scale(devicePixelRatio, devicePixelRatio)
```

This ensures crisp rendering on all Retina / HiDPI displays.

## Click-to-play

When the user clicks the canvas:

1. The click Y position is converted back to Hz using the inverse log formula.
2. The closest chakra is found.
3. `onChakraClick(chakra)` is called — the parent plays the tone.

## Current pitch dash

A dashed horizontal line runs from just right of the newest dot to just left of
the right-side labels, drawn at the current detected pitch Y position. Colour is
the closest chakra at 35 % alpha. This gives a subtle visual anchor for where
the voice is relative to the nearest band centre.

## Performance notes

- All drawing is done inside `requestAnimationFrame`; no React state is set
  during the RAF loop.
- The dot trail array (`dotsRef`) is a plain JS array mutated in-place.
- The canvas element never re-mounts; only `ctx.clearRect` + redraws happen.
- Labels use `system-ui, sans-serif` (no web font request on every frame).
