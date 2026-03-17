# Marketing Ideas — Static HTML for Video Generation

## Overview

Two self-contained HTML files in `docs/marketing-ideas/` for use as visual bases for video generation (stories/reels, 1080×1920 portrait). They replicate the LandingPage7 hero aesthetic but with logo-spectrum concentric rings, no animations on logo or glow.

## Files

- `docs/marketing-ideas/hero-full.html` — full version with headline, button, "free"
- `docs/marketing-ideas/hero-minimal.html` — minimal version, logo + subheading only

## Canvas

- Fixed viewport: **1080×1920** (9:16 portrait)
- Background: `#080810`
- All content vertically and horizontally centered
- No scrolling, no interactive behavior needed beyond button hover (version 1)

## Concentric Rings

Seven static rings using the logo's chromatic spectrum colors, radiating outward from center:

| Ring | Diameter | Color | Opacity |
|------|----------|-------|---------|
| 0 (inner) | 200px | `#ef4444` (red) | 0.65 |
| 1 | 320px | `#f97316` (orange) | 0.55 |
| 2 | 440px | `#eab308` (yellow) | 0.47 |
| 3 | 560px | `#22c55e` (green) | 0.40 |
| 4 | 680px | `#3b82f6` (blue) | 0.33 |
| 5 | 800px | `#6366f1` (indigo) | 0.26 |
| 6 (outer) | 920px | `#a855f7` (violet) | 0.20 |

- Styled as `border` circles (`border-radius: 50%`), absolutely positioned at center
- A subtle **static** radial glow behind the rings (no breathing animation)

## Logo

- Vertical layout: "attunr" text on top, 7 spectrum-colored dots below
- **Static** — no bounce, wave, or bend animation
- Size: large (matching hero `lg` variant — ~48px text, 16px dots)
- Fonts: Fraunces for text

## Content — Version 1 (Full)

Top to bottom, centered:

1. **Logo** (static, vertical)
2. **Headline:** "Feel your voice" / "in your body"
   - Fraunces, bold, ~4rem
   - "in your body" has gradient text: `violet-400 → purple-300 → indigo-400`
   - Line height: 1.1, letter-spacing: tight
3. **Subheading:** "You already know how this feels. We just gave it a path."
   - Outfit, `rgba(255,255,255,0.6)`, ~1.25rem, relaxed line-height
4. **CTA Button:** "Try it now"
   - Glass-style: gradient bg `rgba(139,92,246,0.25) → rgba(99,102,241,0.15)`
   - Border: `1px solid rgba(139,92,246,0.5)`
   - Text: `#e0d4ff`, Fraunces, letter-spacing 0.08em
   - Box shadow glow, rounded-xl, px-14, height 56px
5. **"free"** — below button
   - Outfit, small text (~0.85rem), `rgba(255,255,255,0.4)`
   - Understated but visible

## Content — Version 2 (Minimal)

Top to bottom, centered:

1. **Logo** (static, vertical)
2. **Subheading** (same as version 1)

No headline, no button, no "free" text.

## Fonts

- **Fraunces** (serif) — headline, logo text, button
- **Outfit** (sans-serif) — subheading, "free" text
- Loaded via Google Fonts `<link>` tags

## Design Tokens

- Page background: `#080810`
- Text primary: `#ebe8f5`
- Text muted: `rgba(255,255,255,0.6)`
- Text subtle: `rgba(255,255,255,0.4)`
- Headline gradient: `from violet-400 via purple-300 to indigo-400`
- Button accent: `rgba(139,92,246,*)` family

## Implementation

Each file is fully self-contained HTML+CSS. No JS required (no animations, no interactivity beyond CSS hover on button). Google Fonts loaded via `<link>` in `<head>`.
