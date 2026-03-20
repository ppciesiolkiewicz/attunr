# Journey Chapters Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add chapters 3–9 to the journey (including 3 secret chapters), the `secret` flag on `ChapterInput`/`Chapter`, display numbering logic, secret chapter UI treatment in `ChapterCard`, breathwork/chakra tip sets, and the `"even-7"` scale type.

**Architecture:** Each chapter is a standalone config file (`chapter{n}.ts`) exporting warmup + stages. The `secret?: boolean` field on chapter types drives all UI differences. `Journey.getDisplayNumber()` computes roman numeral labels for non-secret chapters. The `"even-7"` scale type in `Scale.buildNotes()` enables the chakra chapter's 7-tone mapping.

**Tech Stack:** TypeScript, Next.js, React, tonal.js, Vitest

**Spec:** `docs/superpowers/specs/2026-03-20-journey-chapters-expansion-design.md`

**Rules:** Follow `claude/rules/journey-exercise-building.mdc` for all exercise copy, structure, and progression. Follow `claude/rules/language-and-messaging.mdc` for brand voice.

---

## File Structure

### New files
- `src/constants/journey/chapter3.ts` — Vowel Exploration (Oo vowel, 5ths)
- `src/constants/journey/chapter4.ts` — Range & Projection (Ah vowel, octaves)
- `src/constants/journey/chapter5.ts` — Breathe Deep (secret, breathwork only)
- `src/constants/journey/chapter6.ts` — Rhythm Deep Dive (secret, rhythm only)
- `src/constants/journey/chapter7.ts` — Forward Placement (Ee vowel, pentatonic)
- `src/constants/journey/chapter8.ts` — Integration (all techniques combined)
- `src/constants/journey/chapter9.ts` — Chakras (secret, mantras, even-7 scale)

### Modified files
- `src/constants/journey/types.ts` — add `secret?: boolean` to `ChapterInput` and `Chapter`
- `src/constants/journey/Journey.ts` — add `getDisplayNumber()` method
- `src/constants/journey/index.ts` — register chapters 3–9
- `src/constants/journey/chapter2.ts` — update completion modal text to tease chapter 3
- `src/constants/journey/exercise-tips.ts` — add `BREATHWORK_TIPS` and `CHAKRA_TIPS`
- `src/constants/journey/exercise-generator.ts` — add optional `scale` param to `HillSustainParams` and `hillSustain()`
- `src/lib/scale.ts` — add `"even-7"` scale type
- `src/components/ChapterList/components/ChapterCard.tsx` — secret chapter UI treatment

### Test files
- `src/lib/scale.test.ts` — add tests for `"even-7"` scale
- `src/constants/journey/exercise-generator.test.ts` — add tests for new chapter exercise counts

---

## Task 1: Add `secret` field to types

**Files:**
- Modify: `src/constants/journey/types.ts:351-376`

- [ ] **Step 1: Add `secret?: boolean` to `Chapter` interface**

In `src/constants/journey/types.ts`, add to the `Chapter` interface (after `description`):

```typescript
/** Secret chapters show "???" when locked, no chapter number. */
secret?: boolean;
```

- [ ] **Step 2: Add `secret?: boolean` to `ChapterInput` interface**

Same field, same position in `ChapterInput`:

```typescript
/** Secret chapters show "???" when locked, no chapter number. */
secret?: boolean;
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors (existing code doesn't use `secret` yet, and it's optional)

- [ ] **Step 4: Commit**

```bash
git add src/constants/journey/types.ts
git commit -m "feat: add secret field to Chapter and ChapterInput types"
```

---

## Task 2: Add `getDisplayNumber()` to Journey

**Files:**
- Modify: `src/constants/journey/Journey.ts:6-100`

- [ ] **Step 1: Add the `getDisplayNumber` method**

In `Journey.ts`, add this method to the `Journey` class (after `getChapterExercises`):

```typescript
/** Display number for non-secret chapters (I, II, III…). Secret chapters return undefined. */
getDisplayNumber(chapter: Chapter): number | undefined {
  if (chapter.secret) return undefined;
  return this.chapters
    .filter((ch) => !ch.secret)
    .findIndex((ch) => ch.chapter === chapter.chapter) + 1;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/constants/journey/Journey.ts
git commit -m "feat: add getDisplayNumber() to Journey class"
```

---

## Task 3: Add `BREATHWORK_TIPS` and `CHAKRA_TIPS`

**Files:**
- Modify: `src/constants/journey/exercise-tips.ts`

- [ ] **Step 1: Add tip arrays**

Append to `src/constants/journey/exercise-tips.ts`:

```typescript
export const BREATHWORK_TIPS = [
  "Breathe from your belly — let it expand on the inhale, soften on the exhale.",
  "There's no right speed. Follow the cues and let your body adjust.",
  "If you feel lightheaded, pause and breathe normally. This is gentle exploration.",
  "Close your eyes if it helps you focus inward.",
  "Notice the pause between inhale and exhale — that's where stillness lives.",
];

export const CHAKRA_TIPS = [
  "Each tone maps to a place in your body. Feel where it resonates.",
  "The mantra is a vibration, not a word. Let it hum through you.",
  "Start quietly. Let the sound grow from inside rather than pushing it out.",
  "If a tone feels stuck, soften your jaw and breathe into it.",
  "There's no right way to feel this. Just notice what happens.",
];
```

- [ ] **Step 2: Commit**

```bash
git add src/constants/journey/exercise-tips.ts
git commit -m "feat: add BREATHWORK_TIPS and CHAKRA_TIPS"
```

---

## Task 4: Add `"even-7"` scale type (TDD)

**Files:**
- Modify: `src/lib/scale.ts:95-121`
- Modify: `src/lib/scale.test.ts`

- [ ] **Step 1: Write failing test for even-7 scale**

Add to `src/lib/scale.test.ts`:

```typescript
describe("Scale — even-7 type", () => {
  it("produces exactly 7 notes", () => {
    const scale = new Scale({ type: "even-7", root: 1 }, mockVocalRange);
    expect(scale.notes).toHaveLength(7);
  });

  it("first note equals lowMidi, last note equals highMidi", () => {
    const scale = new Scale({ type: "even-7", root: 1 }, mockVocalRange);
    expect(scale.notes[0].midi).toBe(48); // C3
    expect(scale.notes[6].midi).toBe(72); // C5
  });

  it("notes are evenly spaced (within rounding)", () => {
    const scale = new Scale({ type: "even-7", root: 1 }, mockVocalRange);
    const midis = scale.notes.map((n) => n.midi);
    // Expected: 48, 52, 56, 60, 64, 68, 72 (step = 4)
    for (let i = 1; i < midis.length; i++) {
      expect(midis[i] - midis[i - 1]).toBeGreaterThanOrEqual(3);
      expect(midis[i] - midis[i - 1]).toBeLessThanOrEqual(5);
    }
  });

  it("rootIndex is 0", () => {
    const scale = new Scale({ type: "even-7", root: 1 }, mockVocalRange);
    expect(scale.rootIndex).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/scale.test.ts`
Expected: FAIL — "even-7" type not handled

- [ ] **Step 3: Implement even-7 in `Scale.buildNotes()`**

In `src/lib/scale.ts`, inside `buildNotes()`, add before the `"even-7-from-major"` check:

```typescript
if (definition.type === "even-7") {
  // 7 equally spaced tones across the full vocal range (chakra scale)
  const step = (highMidi - lowMidi) / 6;
  const notes: ResolvedNote[] = Array.from({ length: 7 }, (_, i) => {
    const midi = Math.round(lowMidi + i * step);
    return Scale.midiToResolvedNote(midi);
  });
  return { notes, rootIndex: 0 };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/scale.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/scale.ts src/lib/scale.test.ts
git commit -m "feat: add even-7 scale type for chakra exercises"
```

---

## Task 5: Update chapter 2 completion modal

**Files:**
- Modify: `src/constants/journey/chapter2.ts:399-415`

- [ ] **Step 1: Update the completion modal text**

Change the second paragraph of the completion modal in chapter 2 (the teaser) from:

```typescript
text: "Chapter 3 builds on this foundation — new vowels, longer phrases, and deeper resonance.",
```

to:

```typescript
text: "Chapter III opens a new vowel — Oo. A rounder shape. A different resonance.",
```

- [ ] **Step 2: Commit**

```bash
git add src/constants/journey/chapter2.ts
git commit -m "feat: update ch2 completion modal to tease chapter 3"
```

---

## Task 6: Chapter 3 — Vowel Exploration

**Files:**
- Create: `src/constants/journey/chapter3.ts`

- [ ] **Step 1: Create chapter3.ts**

Create `src/constants/journey/chapter3.ts` following the exact patterns from `chapter2.ts`. Export `CHAPTER_3_WARMUP` and `CHAPTER_3_STAGES`.

**Warmup** (same as ch2 warmup — sss-zzz 21s, lip roll low→high 4 plays, gentle hum 3s×5, low Uu 3s×5, hoo hoo 3s×5, Farinelli maxCount 5). Copy ch2 warmup structure but use `ch3-warmup` as stage id and prefix all slugs with `ch3-warmup-`.

**Stages (4):**

1. **Opening Up** (`ch3-opening-up`)
   - Learn: "The Oo vowel" — about Oo vowel and mouth shape. `slug: "oo-vowel"`. Elements: paragraph about Oo being a rounder, more open shape than Uu, paragraph (secondary) about how it opens the throat and creates warmth, video.
   - Hill sustain: Oo on low notes. `slug: "oo-low"`, note: 4, 5s×3, direction: "down". Tips: VOWEL_TIPS. Instruction: "Sing oooo (as in 'go') on a low tone.\nKeep your mouth rounded and open — wider than Uu.\nBreathe whenever you need to."
   - Hill sustain: Oo mid range. `slug: "oo-mid"`, note: [5,9], 5s×3, direction: "between". Tips: VOWEL_TIPS.

2. **Vowel Transitions** (`ch3-vowel-transitions`)
   - Melody: Uu→Oo transition. `slug: "uu-oo-transition"`. Chromatic, tempo 45, 3 tones (i:1, i:3, i:5), minScore: 0. Instruction about moving from Uu to Oo, feeling the shape change.
   - Hill sustain: Longer Oo. `slug: "oo-longer"`, note: [5,9], 6s×3, direction: "between". Tips: VOWEL_TIPS.
   - Lip roll slide: `slug: "lip-roll-low-high"`, startNote: -1, endNote: 1, 4 plays.

3. **Wider Intervals** (`ch3-wider-intervals`)
   - Perfect 5th melody: `slug: "fifth-melody"`. Use `gen.fifth()` with minScore: 0.
   - Hill sustain: Oo wider range. `slug: "oo-wide"`, note: [3,10], 6s×3, direction: "between". Tips: VOWEL_TIPS.
   - Zone above: Hoo hoo. `slug: "hoo-hoo-high"`, boundaryNote: -6, 4s×3. Tips: HEAD_VOICE_TIPS.

4. **Settling In** (`ch3-settling-in`)
   - Hill sustain: Oo long. `slug: "oo-settle"`, note: [5,9], 8s×3, direction: "between". Tips: VOWEL_TIPS.
   - Farinelli: `slug: "farinelli-ch3"`, maxCount: 7. With completionModal teasing ch4.

Follow `journey-exercise-building.mdc` for all instruction text (4-section pattern for intro modals, sensory on-screen instructions, card subtitles for early exercises in each stage).

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add src/constants/journey/chapter3.ts
git commit -m "feat: add chapter 3 — Vowel Exploration"
```

---

## Task 7: Chapter 4 — Range & Projection

**Files:**
- Create: `src/constants/journey/chapter4.ts`

- [ ] **Step 1: Create chapter4.ts**

Export `CHAPTER_4_WARMUP` and `CHAPTER_4_STAGES`.

**Warmup:** Ch2 warmup exercises + Oo hill sustain (3s×5, note 6, direction: "down"). Stage id: `ch4-warmup`. 7 exercises total.

**Stages (4):**

1. **The Open Ah** (`ch4-open-ah`)
   - Learn: "The Ah vowel" — about Ah and open placement. `slug: "ah-vowel"`.
   - Hill sustain: Ah low. `slug: "ah-low"`, note: 4, 5s×3, direction: "down". Tips: VOWEL_TIPS.
   - Hill sustain: Ah between. `slug: "ah-mid"`, note: [5,9], 5s×3, direction: "between". Tips: VOWEL_TIPS.

2. **Reaching Higher** (`ch4-reaching-higher`)
   - Octave melody: `slug: "octave-melody"`. Use `gen.octave()` with minScore: 0.
   - Hill sustain: Ah wider. `slug: "ah-wide"`, note: [3,12], 6s×3, direction: "between". Tips: VOWEL_TIPS.
   - Zone above: `slug: "hoo-hoo-higher"`, boundaryNote: -5, 5s×3.

3. **Dynamics** (`ch4-dynamics`)
   - Hill sustain: Ah long. `slug: "ah-long"`, note: [5,9], 10s×3, direction: "between". Tips: VOWEL_TIPS.
   - Major scale melody: `slug: "major-scale"`. Use `gen.majorScale()` with tempo: 55, minScore: 40.
   - Rhythm: `slug: "rhythm-groove"`, tempo: 90, minScore: 60. Pattern: 4 pause quarters (intro), then 3 rows of 4 quarter taps + half pause.

4. **Power & Rest** (`ch4-power-rest`)
   - Lip roll full range: `slug: "lip-roll-full"`, startNote: 1, endNote: -1, 5 plays.
   - Farinelli: `slug: "farinelli-ch4"`, maxCount: 9. With completionModal teasing what's next (hint at something hidden).

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add src/constants/journey/chapter4.ts
git commit -m "feat: add chapter 4 — Range & Projection"
```

---

## Task 8: Chapter 5 — Breathe Deep (secret)

**Files:**
- Create: `src/constants/journey/chapter5.ts`

- [ ] **Step 1: Create chapter5.ts**

Export `CHAPTER_5_STAGES` only (no warmup — the chapter itself is a breathing practice).

**Stages (3):**

1. **Stillness** (`ch5-stillness`)
   - Learn: "Breath awareness" — about breathing as a practice, not just a warmup. `slug: "breath-awareness"`.
   - Farinelli: `slug: "farinelli-extended"`, maxCount: 9.
   - Time-based: "Breath cycles" `slug: "breath-cycles"`. Cues: inhale 4s, hold 4s, exhale 4s, rest 2s — repeated 4 times (use `repeat()`). Tips: BREATHWORK_TIPS.

2. **Breath & Body** (`ch5-breath-body`)
   - Time-based: "Extended sss-zzz" `slug: "extended-sss-zzz"`. Cues: sss 5s, zzz 5s — repeated 3 times (30s total). Tips: BREATHWORK_TIPS.
   - Time-based: "Body scan breathing" `slug: "body-scan"`. Cues: "Breathe into your belly" 8s, "Breathe into your chest" 8s, "Breathe into your shoulders" 8s, "Let everything soften" 8s. Tips: BREATHWORK_TIPS.

3. **Deep Breath** (`ch5-deep-breath`)
   - Farinelli: `slug: "farinelli-deep-ch5"`, maxCount: 11.
   - Time-based: "Extended exhale" `slug: "extended-exhale"`. Cues: "Inhale" 4s, "Exhale slowly" 8s — repeated 4 times. Tips: BREATHWORK_TIPS. With completionModal (title: "Breathe Deep Complete", no subtitle, first paragraph about stillness and awareness, confetti: true).

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add src/constants/journey/chapter5.ts
git commit -m "feat: add chapter 5 — Breathe Deep (secret)"
```

---

## Task 9: Chapter 6 — Rhythm Deep Dive (secret)

**Files:**
- Create: `src/constants/journey/chapter6.ts`

- [ ] **Step 1: Create chapter6.ts**

Export `CHAPTER_6_STAGES` only (no warmup).

**Stages (3):**

1. **Finding Groove** (`ch6-finding-groove`)
   - Learn: "Rhythm in voice" — about rhythm as the skeleton of music and speech. `slug: "rhythm-intro"`.
   - Rhythm: "Quarter notes" `slug: "quarter-beat"`, tempo: 90, minScore: 60, metronome: true. Pattern: 4 pause quarters (intro), then 4 rows of 4 quarter taps separated by half pauses.
   - Rhythm: "Dotted quarter" `slug: "dotted-quarter"`, tempo: 90, minScore: 60, metronome: true. Pattern: 4 pause quarters, then rows mixing DottedQuarter taps + Eighth taps.

2. **Offbeat** (`ch6-offbeat`)
   - Rhythm: "Half and quarter" `slug: "half-quarter-mix"`, tempo: 100, minScore: 60, metronome: true. Pattern mixing Half taps and Quarter taps.
   - Rhythm: "Dotted patterns" `slug: "dotted-patterns"`, tempo: 100, minScore: 60, metronome: true. Rows of DottedQuarter + Eighth patterns.

3. **Complex Patterns** (`ch6-complex-patterns`)
   - Rhythm: "Mixed durations" `slug: "mixed-durations"`, tempo: 110, minScore: 70, metronome: true. Mix of Eighth, Quarter, Half taps.
   - Rhythm: "The full groove" `slug: "full-groove"`, tempo: 110, minScore: 70, metronome: true. Longer complex pattern. With completionModal (title: "Rhythm Deep Dive Complete", no subtitle, confetti: true).

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add src/constants/journey/chapter6.ts
git commit -m "feat: add chapter 6 — Rhythm Deep Dive (secret)"
```

---

## Task 10: Chapter 7 — Forward Placement

**Files:**
- Create: `src/constants/journey/chapter7.ts`

- [ ] **Step 1: Create chapter7.ts**

Export `CHAPTER_7_WARMUP` and `CHAPTER_7_STAGES`.

**Warmup:** Ch4 warmup exercises + Ah hill sustain (3s×5, note 5, direction: "down"). Stage id: `ch7-warmup`. 8 exercises total.

**Stages (4):**

1. **The Ee Vowel** (`ch7-ee-vowel`)
   - Learn: "The Ee vowel" — about Ee and forward bright placement. `slug: "ee-vowel"`.
   - Hill sustain: Ee mid-high. `slug: "ee-mid"`, note: [7,11], 5s×3, direction: "between". Tips: VOWEL_TIPS.
   - Zone above: Ee high. `slug: "ee-high"`, boundaryNote: -5, 4s×3.

2. **Vowel Sequences** (`ch7-vowel-sequences`)
   - Melody: a-o-u-o-a. `slug: "vowel-rotation"`. Chromatic, tempo 45, 5 notes (i:1,i:3,i:5,i:3,i:1), minScore: 30.
   - Melody: ee-uu-ee. `slug: "ee-uu-ee"`. Chromatic, tempo 45, 3 notes (i:1,i:5,i:1), minScore: 30.
   - Hill sustain: Vowel transition. `slug: "vowel-transition-hill"`, note: [5,9], 6s×3, direction: "between". Tips: VOWEL_TIPS.

3. **Pentatonic** (`ch7-pentatonic`)
   - Pentatonic melody: `slug: "pentatonic-melody"`. Use `gen.pentatonic()` with minScore: 50.
   - Hill sustain: Ee pentatonic range. `slug: "ee-pentatonic"`, note: [4,10], 6s×3, direction: "between". Tips: VOWEL_TIPS.
   - Lip roll: `slug: "lip-roll-pentatonic"`, startNote: 3, endNote: -3, 4 plays, scale: { type: "major pentatonic", root: 3 }.

4. **Weaving** (`ch7-weaving`)
   - Major scale melody: `slug: "vowel-weave"`. Use `gen.majorScale()` with tempo: 50, minScore: 40.
   - Lip roll full: `slug: "lip-roll-full-ch7"`, startNote: 1, endNote: -1, 5 plays.
   - Farinelli: `slug: "farinelli-ch7"`, maxCount: 9. With completionModal teasing ch8.

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add src/constants/journey/chapter7.ts
git commit -m "feat: add chapter 7 — Forward Placement"
```

---

## Task 11: Chapter 8 — Integration

**Files:**
- Create: `src/constants/journey/chapter8.ts`

- [ ] **Step 1: Create chapter8.ts**

Export `CHAPTER_8_WARMUP` and `CHAPTER_8_STAGES`.

**Warmup:** Ch7 warmup exercises + Ee hill sustain (3s×5, note: [7,11], direction: "between"). Stage id: `ch8-warmup`. 9 exercises total — sss-zzz, lip roll, hum, Uu, Oo, Ah, Ee, hoo hoo, Farinelli.

**Stages (4):**

1. **Full Scale** (`ch8-full-scale`)
   - Major scale melody: `slug: "full-major-scale"`. Use `gen.majorScale()` with tempo: 55, minScore: 50.
   - Melody: Hum scale. `slug: "hum-scale"`. Major, tempo 50, 5 notes up+down (i:1 through i:5 then back), minScore: 40.
   - Hill sustain: Oo scale. `slug: "oo-scale-hill"`, note: [3,12], 8s×3, direction: "between". Tips: VOWEL_TIPS.

2. **Longer Phrases** (`ch8-longer-phrases`)
   - Melody: Multi-root. `slug: "multi-root-melody"`. 2 MelodyScale segments at different roots (root: 3 and root: 6), major, tempo 50, minScore: 50. Each segment has 5 events (i:1 through i:5).
   - Hill sustain: Ah sustained. `slug: "ah-sustained"`, note: [5,9], 10s×3, direction: "between". Tips: VOWEL_TIPS.
   - Lip roll: `slug: "lip-roll-full-ch8"`, startNote: 1, endNote: -1, 5 plays.

3. **Precision** (`ch8-precision`)
   - Hill sustain: Narrow zone. `slug: "narrow-zone"`, note: [6,8], 8s×3, direction: "between". Tips: SUSTAIN_TIPS.
   - Major scale melody: `slug: "precise-melody"`. Use `gen.majorScale()` with tempo: 60, minScore: 60.
   - Rhythm: `slug: "fast-rhythm"`, tempo: 120, minScore: 70, metronome: true. Pattern: 4 pause quarters, then 4 rows of mixed Quarter+Eighth taps.

4. **Coming Together** (`ch8-coming-together`)
   - Major scale melody: `slug: "final-melody"`. Use `gen.majorScale()` with tempo: 55, minScore: 60.
   - Farinelli: `slug: "farinelli-ch8"`, maxCount: 11. With completionModal (title: "Chapter VI Complete", subtitle: "Integration", grand confetti: true).

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add src/constants/journey/chapter8.ts
git commit -m "feat: add chapter 8 — Integration"
```

---

## Task 12: Add `scale` override to `hillSustain()`

**Files:**
- Modify: `src/constants/journey/exercise-generator.ts:326-334` (HillSustainParams)
- Modify: `src/constants/journey/exercise-generator.ts:783-832` (hillSustain method)

The chakra chapter (Task 13) needs hill sustain exercises on the `"even-7"` scale. Currently `hillSustain()` hardcodes `scale: { type: "chromatic", root }`. Add an optional `scale` override.

- [ ] **Step 1: Add `scale` to `HillSustainParams`**

In `src/constants/journey/exercise-generator.ts`, add to `HillSustainParams`:

```typescript
export interface HillSustainParams extends CommonParams {
  /** Single note or [low, high] pair for "between" mode. */
  note: number | [number, number];
  seconds: number;
  repeats: number;
  direction: "up" | "down" | "between";
  toneShape?: ToneShape;
  displayNotes?: DisplayScale[];
  /** Override the default chromatic scale (e.g. for even-7 chakra exercises). */
  scale?: BaseScale;
}
```

- [ ] **Step 2: Use the override in `hillSustain()`**

In the `hillSustain()` method, change the hardcoded scale from:

```typescript
scale: { type: "chromatic", root },
```

to:

```typescript
scale: params.scale ?? { type: "chromatic", root },
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add src/constants/journey/exercise-generator.ts
git commit -m "feat: add scale override to hillSustain params"
```

---

## Task 13: Chapter 9 — Chakras (secret)

**Files:**
- Create: `src/constants/journey/chapter9.ts`

This chapter uses the `"even-7"` scale type from Task 4 and the `scale` override from Task 12. Mantra exercises use existing exercise types with instruction text carrying the mantra cues.

- [ ] **Step 1: Create chapter9.ts**

Export `CHAPTER_9_WARMUP` and `CHAPTER_9_STAGES`.

**Warmup:** Ch2-style warmup (sss-zzz, lip roll, hum, Uu, hoo hoo) + grounding Farinelli (maxCount: 7). Stage id: `ch9-warmup`. 7 exercises total. All slug prefixes: `ch9-warmup-`.

**Stages (4):**

1. **Root & Sacral** (`ch9-root-sacral`)
   - Learn: "Chakras and sound" — about chakras, the 7-even-space scale, and how each tone maps to a place in the body. `slug: "chakra-intro"`. Elements: paragraph about 7 energy centers, paragraph (secondary) about how each maps to a tone, video.
   - Hill sustain: LAM mantra (Root chakra). `slug: "lam-root"`. Scale: `{ type: "even-7", root: 1 }`. note: 1, 6s×3, direction: "down". Instruction: "Hum LAM on this tone. Feel it ground you.\nLet the vibration settle at the base of your spine.\nBreathe whenever you need to." Tips: CHAKRA_TIPS.
   - Hill sustain: VAM mantra (Sacral). `slug: "vam-sacral"`. Scale: `{ type: "even-7", root: 1 }`. note: 2, 6s×3, direction: "down". Instruction about VAM, feeling it in lower belly. Tips: CHAKRA_TIPS.

2. **Solar Plexus & Heart** (`ch9-solar-heart`)
   - Hill sustain: RAM mantra (Solar plexus). `slug: "ram-solar"`. Scale: `{ type: "even-7", root: 1 }`. note: 3, 6s×3, direction: "between" with note: [3,3]. Instruction: "Hum RAM on this tone. Feel strength in your core.\nI am strong.\nLet the sound radiate outward." Tips: CHAKRA_TIPS.
   - Hill sustain: YAM mantra (Heart). `slug: "yam-heart"`. Scale: `{ type: "even-7", root: 1 }`. note: 4, 6s×3, direction: "between" with note: [4,4]. Instruction about YAM, heart opening, "I am open". Tips: CHAKRA_TIPS.
   - Hill sustain: Heart Ah. `slug: "heart-ah"`. note: [5,9], 8s×3, direction: "between". Tips: VOWEL_TIPS. Instruction: "Sing an open Ah from your heart.\nFeel the openness in your chest.\nI am open."

3. **Throat, Third Eye & Crown** (`ch9-upper-chakras`)
   - Hill sustain: HAM mantra (Throat). `slug: "ham-throat"`. Scale: `{ type: "even-7", root: 1 }`. note: 5, 5s×3, direction: "up" with appropriate targets. Instruction about HAM, throat, truth. Tips: CHAKRA_TIPS.
   - Hill sustain: OM (Third eye). `slug: "om-third-eye"`. Scale: `{ type: "even-7", root: 1 }`. note: 6, 5s×3. Instruction about OM, awareness, inner vision. Tips: CHAKRA_TIPS.
   - Time-based: Crown silence. `slug: "crown-silence"`. Cues: "Breathe in" 5s, "Hold in silence" 5s, "Exhale slowly" 8s — repeated twice. Instruction: "The crown chakra is silence. Just breathe and notice what's there.\nNo sound needed. Just awareness." Tips: CHAKRA_TIPS.
   - Melody: 7-tone ascent. `slug: "chakra-ascent"`. Scale: `{ type: "even-7", root: 1 }`. Tempo 40, 7 notes ascending (i:1 through i:7), minScore: 0. Instruction about feeling the energy rise through all 7 centers.

4. **Full Chakra Flow** (`ch9-full-flow`)
   - Melody: 7-tone ascend + descend. `slug: "chakra-flow"`. Scale: `{ type: "even-7", root: 1 }`. Tempo 35, ascending i:1→i:7 then descending i:6→i:1, each Half duration, minScore: 0.
   - Time-based: Mantra sequence. `slug: "mantra-flow"`. Cues: "LAM" 5s, "VAM" 5s, "RAM" 5s, "YAM" 5s, "HAM" 5s, "OM" 5s, "Silence" 5s. Tips: CHAKRA_TIPS. Instruction about feeling each mantra vibrate in its place.
   - Farinelli: `slug: "farinelli-ch9"`, maxCount: 9. Instruction cue about chakra awareness. With completionModal (title: "Chakras Complete", no subtitle, grand confetti: true, paragraph about the 7 tones living in the body now).

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add src/constants/journey/chapter9.ts
git commit -m "feat: add chapter 9 — Chakras (secret)"
```

---

## Task 14: Register all chapters in index.ts

**Files:**
- Modify: `src/constants/journey/index.ts:1-21`

- [ ] **Step 1: Add imports for chapters 3–9**

Add imports at the top of `index.ts`:

```typescript
import { CHAPTER_3_WARMUP, CHAPTER_3_STAGES } from "./chapter3";
import { CHAPTER_4_WARMUP, CHAPTER_4_STAGES } from "./chapter4";
import { CHAPTER_5_STAGES } from "./chapter5";
import { CHAPTER_6_STAGES } from "./chapter6";
import { CHAPTER_7_WARMUP, CHAPTER_7_STAGES } from "./chapter7";
import { CHAPTER_8_WARMUP, CHAPTER_8_STAGES } from "./chapter8";
import { CHAPTER_9_WARMUP, CHAPTER_9_STAGES } from "./chapter9";
```

- [ ] **Step 2: Add chapter entries to the Journey constructor**

```typescript
export const journey = new Journey([
  {
    chapter: 1,
    slug: "introduction",
    title: "Introduction",
    description: "Discover your voice, feel vibrations, match tones, and find your breath.",
    stages: CHAPTER_1_STAGES,
  },
  {
    chapter: 2,
    slug: "building-foundation",
    title: "Building Foundation",
    description: "Expand your range, build resonance, and develop vowel control.",
    warmup: CHAPTER_2_WARMUP,
    stages: CHAPTER_2_STAGES,
  },
  {
    chapter: 3,
    slug: "vowel-exploration",
    title: "Vowel Exploration",
    description: "Discover the Oo vowel, explore transitions, and widen your intervals.",
    warmup: CHAPTER_3_WARMUP,
    stages: CHAPTER_3_STAGES,
  },
  {
    chapter: 4,
    slug: "range-and-projection",
    title: "Range & Projection",
    description: "Open the Ah vowel, reach octave intervals, and build vocal power.",
    warmup: CHAPTER_4_WARMUP,
    stages: CHAPTER_4_STAGES,
  },
  {
    chapter: 5,
    slug: "breathe-deep",
    title: "Breathe Deep",
    description: "Pure breathwork. No singing. Just breath, body, and stillness.",
    secret: true,
    stages: CHAPTER_5_STAGES,
  },
  {
    chapter: 6,
    slug: "rhythm-deep-dive",
    title: "Rhythm Deep Dive",
    description: "Complex rhythms, syncopation, and groove. Feel the pulse.",
    secret: true,
    stages: CHAPTER_6_STAGES,
  },
  {
    chapter: 7,
    slug: "forward-placement",
    title: "Forward Placement",
    description: "The Ee vowel, vowel sequences, and pentatonic melodies.",
    warmup: CHAPTER_7_WARMUP,
    stages: CHAPTER_7_STAGES,
  },
  {
    chapter: 8,
    slug: "integration",
    title: "Integration",
    description: "All techniques together. Full scales, longer phrases, higher precision.",
    warmup: CHAPTER_8_WARMUP,
    stages: CHAPTER_8_STAGES,
  },
  {
    chapter: 9,
    slug: "chakras",
    title: "Chakras",
    description: "Seven tones. Seven places in your body. Mantras, affirmations, and the chakra scale.",
    secret: true,
    warmup: CHAPTER_9_WARMUP,
    stages: CHAPTER_9_STAGES,
  },
]);
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add src/constants/journey/index.ts
git commit -m "feat: register chapters 3-9 in journey index"
```

---

## Task 15: Secret chapter UI in ChapterCard

**Files:**
- Modify: `src/components/ChapterList/components/ChapterCard.tsx:1-175`

- [ ] **Step 1: Compute display number and locked message variables**

At the top of the `ChapterCard` component body (after the existing `const` declarations around line 28-36), add:

```tsx
const displayNum = journey.getDisplayNumber(chapter);
const prevChapter = journey.chapters.find((ch) => ch.chapter === chapter.chapter - 1);
const prevDisplay = prevChapter ? journey.getDisplayNumber(prevChapter) : undefined;
const lockedMessage = prevDisplay
  ? `Complete Chapter ${toRoman(prevDisplay)} to unlock`
  : "Complete the previous chapter to unlock";
```

- [ ] **Step 2: Update the chapter number label**

Replace the current chapter label with conditional rendering:

Change:

```tsx
<Text variant="label" as="span" style={{ color: "rgba(168,133,246,0.5)" }}>
  Chapter {toRoman(chapter.chapter)}
</Text>
```

to:

```tsx
{displayNum && (
  <Text variant="label" as="span" style={{ color: "rgba(168,133,246,0.5)" }}>
    Chapter {toRoman(displayNum)}
  </Text>
)}
```

- [ ] **Step 3: Handle secret locked state (title and description)**

Change the title from:

```tsx
<Text variant="heading-sm" as="h2" className="mt-1">
  {chapter.title}
</Text>
```

to:

```tsx
<Text variant="heading-sm" as="h2" className="mt-1">
  {chapter.secret && isLocked ? "???" : chapter.title}
</Text>
```

Change the description to conditionally hide for secret locked chapters:

```tsx
{!(chapter.secret && isLocked) && (
  <Text variant="body-sm" as="p" className="mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
    {chapter.description}
  </Text>
)}
```

- [ ] **Step 4: Update the accent strip color for secret chapters**

Change the color accent strip from:

```tsx
<div className="h-[3px] w-full" style={{ background: "#a855f7", opacity: isLocked ? 0.4 : 1 }} />
```

to:

```tsx
<div className="h-[3px] w-full" style={{
  background: chapter.secret ? "#f59e0b" : "#a855f7",
  opacity: isLocked ? 0.4 : 1,
}} />
```

This gives secret chapters an amber accent instead of violet.

- [ ] **Step 5: Update locked message**

Change the locked message from:

```tsx
<Text variant="caption" as="p" style={{ color: "rgba(255,255,255,0.3)" }}>
  Complete Chapter {toRoman(chapter.chapter - 1)} to unlock
</Text>
```

to:

```tsx
<Text variant="caption" as="p" style={{ color: "rgba(255,255,255,0.3)" }}>
  {lockedMessage}
</Text>
```

- [ ] **Step 6: Verify TypeScript compiles and app renders**

Run: `npx tsc --noEmit`

- [ ] **Step 7: Commit**

```bash
git add src/components/ChapterList/components/ChapterCard.tsx
git commit -m "feat: secret chapter UI treatment in ChapterCard"
```

---

## Task 16: Verify everything works end-to-end

- [ ] **Step 1: Run all tests**

Run: `npx vitest run`
Expected: All tests pass

- [ ] **Step 2: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Run the dev server and verify visually**

Run: `npm run dev`
Check: Journey page shows 9 chapters. Chapters 5, 6, 9 show "???" when locked. Non-secret chapters show roman numerals I–VI. Locked messages are correct.

- [ ] **Step 4: Final commit if any fixes needed**

Only if corrections were made during verification.
