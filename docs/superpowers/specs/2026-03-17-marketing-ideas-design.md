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

- Styled as `border` circles (`border-radius: 50%`), border-width `2px`, absolutely positioned at center
- **Static radial glow** behind the rings: 900×900px circle, radial gradient from `rgba(139,92,246,0.15)` center to transparent edge, `blur(60px)`. No animation.

## Logo

- Vertical layout: "attunr" text on top, 7 spectrum-colored dots below
- **Static** — no bounce, wave, or bend animation
- Size: text 30px (Fraunces), dots 16px diameter
- Fonts: Fraunces for text

## Excluded from v7 hero

Header nav, particles, mesh gradient blobs, scroll hint, grain overlay.

## Content — Version 1 (Full)

Top to bottom, centered. Spacing between elements:

1. **Logo** (static, vertical)
2. *(48px gap)*
3. **Headline:** "Feel your voice" `<br>` "in your body"
   - Fraunces, bold, 72px (text-7xl equivalent)
   - "in your body" has gradient text: `violet-400 → purple-300 → indigo-400`
   - Line height: 1.1, letter-spacing: tight
4. *(24px gap)*
5. **Subheading:** "You already know how this feels.`<br>`We just gave it a path."
   - Outfit, `rgba(255,255,255,0.6)`, 20px, relaxed line-height
6. *(48px gap)*
7. **CTA Button:** "Try it now"
   - Glass-style: gradient bg `rgba(139,92,246,0.25) → rgba(99,102,241,0.15)`
   - Border: `1px solid rgba(139,92,246,0.5)`
   - Text: `#e0d4ff`, Fraunces, letter-spacing 0.08em
   - Box shadow: `0 0 30px rgba(139,92,246,0.2), 0 0 60px rgba(139,92,246,0.1), inset 0 1px 0 rgba(255,255,255,0.1)`
   - Padding: 0 56px, height 56px, border-radius 12px
8. *(12px gap)*
9. **"free"** — below button
   - Outfit, small text (14px), `rgba(255,255,255,0.4)`
   - Understated but visible

## Content — Version 2 (Minimal)

Top to bottom, centered:

1. **Logo** (static, vertical)
2. *(48px gap)*
3. **Subheading** (same as version 1)

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
