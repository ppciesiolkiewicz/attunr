# Marketing Ideas HTML Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create two self-contained HTML files for marketing video generation — a full hero and a minimal variant.

**Architecture:** Two standalone `.html` files in `docs/marketing-ideas/`, each containing all CSS inline (no external stylesheets). Google Fonts loaded via `<link>`. No JS.

**Tech Stack:** HTML, CSS, Google Fonts (Fraunces, Outfit)

**Spec:** `docs/superpowers/specs/2026-03-17-marketing-ideas-design.md`

---

## File Structure

```
docs/marketing-ideas/
├── hero-full.html      — Full version: logo, headline, subheading, button, "free"
└── hero-minimal.html   — Minimal version: logo, subheading only
```

Both files are independent. No shared assets.

---

### Task 1: Create hero-full.html

**Files:**
- Create: `docs/marketing-ideas/hero-full.html`

- [ ] **Step 1: Create the directory and full HTML file**

Create `docs/marketing-ideas/hero-full.html` with the complete self-contained markup. The file must include:

**`<head>`:**
- Charset UTF-8, viewport meta for 1080×1920
- Google Fonts: Fraunces (wght 600;700) and Outfit (wght 400)
- All CSS in a `<style>` block

**CSS — Canvas:**
```css
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
html, body {
  width: 1080px;
  height: 1920px;
  overflow: hidden;
  background: #080810;
  font-family: 'Outfit', sans-serif;
  color: #ebe8f5;
}
```

**CSS — Rings (each positioned absolutely relative to body):**
```css
.ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border-style: solid;
  border-width: 2px;
  pointer-events: none;
}
```

**Seven rings** — each gets its own class with dimensions and border-color at specified opacity:

| Class | Width/Height | border-color |
|-------|-------------|-------------|
| `.ring-0` | 200px | `rgba(239,68,68,0.65)` |
| `.ring-1` | 320px | `rgba(249,115,22,0.55)` |
| `.ring-2` | 440px | `rgba(234,179,8,0.47)` |
| `.ring-3` | 560px | `rgba(34,197,94,0.40)` |
| `.ring-4` | 680px | `rgba(59,130,246,0.33)` |
| `.ring-5` | 800px | `rgba(99,102,241,0.26)` |
| `.ring-6` | 920px | `rgba(168,85,247,0.20)` |

**CSS — Static glow (behind rings):**
```css
.glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 900px;
  height: 900px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%);
  filter: blur(60px);
  pointer-events: none;
}
```

**CSS — Content container (centered over rings):**
```css
.content {
  position: relative;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 1080px;
  height: 1920px;
  text-align: center;
}
```

**CSS — Logo:**
```css
.logo-text {
  font-family: 'Fraunces', serif;
  font-weight: 600;
  font-size: 30px;
  color: #ebe8f5;
  letter-spacing: 0.02em;
}
.logo-dots {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  justify-content: center;
}
.logo-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  opacity: 0.8;
}
```

Seven dots with inline `background` colors: `#ef4444`, `#f97316`, `#eab308`, `#22c55e`, `#3b82f6`, `#6366f1`, `#a855f7`.

**CSS — Headline:**
```css
.headline {
  font-family: 'Fraunces', serif;
  font-weight: 700;
  font-size: 72px;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: #ebe8f5;
  margin-top: 48px;
}
.headline-gradient {
  background: linear-gradient(to right, #a78bfa, #d8b4fe, #818cf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

**CSS — Subheading:**
```css
.subheading {
  font-family: 'Outfit', sans-serif;
  font-size: 20px;
  color: rgba(255,255,255,0.6);
  line-height: 1.6;
  margin-top: 24px;
}
```

**CSS — Button:**
```css
.cta-button {
  margin-top: 48px;
  font-family: 'Fraunces', serif;
  font-size: 15px;
  letter-spacing: 0.08em;
  color: #e0d4ff;
  background: linear-gradient(135deg, rgba(139,92,246,0.25), rgba(99,102,241,0.15));
  border: 1px solid rgba(139,92,246,0.5);
  border-radius: 12px;
  padding: 0 56px;
  height: 56px;
  line-height: 56px;
  cursor: pointer;
  box-shadow: 0 0 30px rgba(139,92,246,0.2), 0 0 60px rgba(139,92,246,0.1), inset 0 1px 0 rgba(255,255,255,0.1);
}
```

**CSS — "free" text:**
```css
.free-text {
  margin-top: 12px;
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  color: rgba(255,255,255,0.4);
}
```

**`<body>` structure:**
```html
<!-- Glow layer -->
<div class="glow"></div>

<!-- Rings layer -->
<div class="ring ring-0"></div>
<div class="ring ring-1"></div>
<div class="ring ring-2"></div>
<div class="ring ring-3"></div>
<div class="ring ring-4"></div>
<div class="ring ring-5"></div>
<div class="ring ring-6"></div>

<!-- Content layer -->
<div class="content">
  <div class="logo">
    <div class="logo-text">attunr</div>
    <div class="logo-dots">
      <div class="logo-dot" style="background:#ef4444"></div>
      <div class="logo-dot" style="background:#f97316"></div>
      <div class="logo-dot" style="background:#eab308"></div>
      <div class="logo-dot" style="background:#22c55e"></div>
      <div class="logo-dot" style="background:#3b82f6"></div>
      <div class="logo-dot" style="background:#6366f1"></div>
      <div class="logo-dot" style="background:#a855f7"></div>
    </div>
  </div>
  <h1 class="headline">Feel your voice<br><span class="headline-gradient">in your body</span></h1>
  <p class="subheading">You already know how this feels.<br>We just gave it a path.</p>
  <button class="cta-button">Try it now</button>
  <p class="free-text">free</p>
</div>
```

- [ ] **Step 2: Open in browser and visually verify**

Open `docs/marketing-ideas/hero-full.html` in a browser. Verify:
- 1080×1920 canvas, dark background
- 7 colored concentric rings centered
- Static glow behind rings
- Logo centered with "attunr" + 7 dots
- Headline with gradient on second line
- Subheading below
- Glass button
- "free" text below button
- Everything vertically centered

- [ ] **Step 3: Commit**

```bash
git add docs/marketing-ideas/hero-full.html
git commit -m "feat: add hero-full marketing HTML for video generation"
```

---

### Task 2: Create hero-minimal.html

**Files:**
- Create: `docs/marketing-ideas/hero-minimal.html`

- [ ] **Step 1: Create the minimal HTML file**

Copy `hero-full.html` as a starting point, then remove:
- The `.headline` heading element and its CSS
- The `.cta-button` button and its CSS
- The `.free-text` paragraph and its CSS

Keep:
- All canvas, ring, glow, and logo CSS/markup (identical to hero-full)
- Subheading with `margin-top: 48px` (gap from logo to subheading)

The `<body>` content section becomes:
```html
<div class="content">
  <div class="logo">
    <div class="logo-text">attunr</div>
    <div class="logo-dots">
      <!-- same 7 dots -->
    </div>
  </div>
  <p class="subheading">You already know how this feels.<br>We just gave it a path.</p>
</div>
```

Subheading CSS changes `margin-top` to `48px` (was 24px in full version, where it followed the headline).

- [ ] **Step 2: Open in browser and visually verify**

Verify:
- Same rings/glow/background as hero-full
- Logo + subheading only, centered
- No headline, button, or "free" text

- [ ] **Step 3: Commit**

```bash
git add docs/marketing-ideas/hero-minimal.html
git commit -m "feat: add hero-minimal marketing HTML for video generation"
```
