# Journey Chapters Expansion — Design Spec

Adds chapters 3–9 to the journey, including three secret chapters with hidden UI treatment. Introduces the Oo, Ah, and Ee vowels, rhythm deep-dives, extended breathwork, and a chakra chapter built on a 7-even-space scale.

## Chapter map

| Internal # | Slug | Title | Display | Secret |
|---|---|---|---|---|
| 1 | `introduction` | Introduction | Chapter I | no |
| 2 | `building-foundation` | Building Foundation | Chapter II | no |
| 3 | `vowel-exploration` | Vowel Exploration | Chapter III | no |
| 4 | `range-and-projection` | Range & Projection | Chapter IV | no |
| 5 | `breathe-deep` | Breathe Deep | — | **yes** |
| 6 | `rhythm-deep-dive` | Rhythm Deep Dive | — | **yes** |
| 7 | `forward-placement` | Forward Placement | Chapter V | no |
| 8 | `integration` | Integration | Chapter VI | no |
| 9 | `chakras` | Chakras | — | **yes** |

Non-secret chapters display roman numerals I–VI. Secret chapters display no number.

## Type changes

### `ChapterInput` and `Chapter`

Add `secret?: boolean` to both interfaces in `types.ts`:

```typescript
export interface ChapterInput {
  chapter: number;
  slug: string;
  title: string;
  description: string;
  /** Secret chapters show "???" when locked, no chapter number. */
  secret?: boolean;
  warmup?: StageConfigInput;
  stages: StageConfigInput[];
}

export interface Chapter {
  chapter: number;
  slug: string;
  title: string;
  description: string;
  secret?: boolean;
  warmup?: StageConfig;
  stages: StageConfig[];
}
```

### Display numbering

Non-secret chapters compute their display number by counting only non-secret chapters up to and including themselves. A helper in `Journey.ts`:

```typescript
/** Display number for non-secret chapters (I, II, III…). Secret chapters return undefined. */
getDisplayNumber(chapter: Chapter): number | undefined {
  if (chapter.secret) return undefined;
  return this.chapters
    .filter((ch) => !ch.secret)
    .findIndex((ch) => ch.chapter === chapter.chapter) + 1;
}
```

## Secret chapter UI

### ChapterCard behaviour

| State | Title | Description | Number label | Styling |
|---|---|---|---|---|
| Locked | "???" | Hidden | None | opacity 0.4, no action bar |
| Unlocked, not started | Real title | Brief teaser description | None | Slightly different accent (e.g. amber or teal instead of violet) |
| Started / complete | Real title | Real description | None | Normal styling, no number |

### Locked message logic

The locked message depends on the **predecessor** chapter, not the current one:

- If the previous chapter is non-secret: "Complete Chapter {displayRoman} to unlock" (using the predecessor's display number)
- If the previous chapter is secret: "Complete the previous chapter to unlock" (no number to reference)

This means a non-secret chapter following a secret chapter (e.g. chapter 7 follows secret chapter 6) also uses the generic message.

### ChapterCard changes

In `ChapterCard.tsx`:
- Use `journey.getDisplayNumber(chapter)` instead of `chapter.chapter` for the "Chapter {roman}" label.
- If `chapter.secret`:
  - When locked: render title as "???" and hide description.
  - Never show a chapter number label.
- Locked message: look up the previous chapter. If previous chapter has a display number, use it. Otherwise use "Complete the previous chapter to unlock".

## Chapter content outlines

### Chapter 3 — Vowel Exploration

**Focus:** Oo vowel, vowel transitions (Uu→Oo), longer sustains, wider intervals (perfect 5ths).

**Warmup:** Same structure as ch2 warmup — sss-zzz time-based (21s), lip roll slide (low→high, 4 plays), gentle hum (3s×5), low Uu (3s×5), hoo hoo (3s×5), Farinelli (maxCount: 5). Durations stay the same — the warmup is familiar ground.

**Stages (4):**

1. **Opening Up** — Learn about the Oo vowel and mouth shape. Oo hill sustains on low notes (5s×3, direction: "down"). Oo hill on mid notes (5s×3, direction: "between", notes [5,9]).
2. **Vowel Transitions** — Uu→Oo transition melodies (chromatic, tempo 45, 3 tones, minScore: 0). Longer Oo sustains (6s×3). Lip roll slide (startNote: -1, endNote: 1, 4 plays).
3. **Wider Intervals** — Perfect 5th melody exercises (`gen.fifth()`, minScore: 0). Oo hill on wider range (6s×3, notes [3,10], direction: "between"). Hoo hoo zone-above (4s×3, boundaryNote: -6).
4. **Settling In** — Oo sustain at 8s×3 (notes [5,9], direction: "between"). Farinelli (maxCount: 7). Completion modal teases chapter 4.

### Chapter 4 — Range & Projection

**Focus:** Ah vowel, octave intervals, stronger dynamics, pitch accuracy.

**Warmup:** Standard + Oo in warmup (building on ch3).

**Stages (4):**

1. **The Open Ah** — Learn about Ah vowel and open placement. Ah hill sustains. Ah between-zone hills.
2. **Reaching Higher** — Octave interval melodies (`gen.octave()`). Ah across full range. Zone-above with longer holds (5s×3).
3. **Dynamics** — Stronger sustains (10s×3). Melody with minScore: 40. Rhythm at tempo 90, minScore: 60.
4. **Power & Rest** — Full range lip rolls. Farinelli (maxCount: 9). Completion modal.

### Chapter 5 — Breathe Deep (SECRET)

**Focus:** Pure breathwork. No singing exercises. Breath control, body awareness, extended breath cycles.

**No warmup** — the chapter itself is a breathing practice.

**Stages (3):**

1. **Stillness** — Extended Farinelli (maxCount: 9). Breath awareness time-based exercise (inhale/exhale cues at increasing durations).
2. **Breath & Body** — Sss-zzz patterns at longer durations (30s+). Body-scan guided breathing (time-based with descriptive cues: "breathe into your belly", "breathe into your chest", "breathe into your shoulders").
3. **Deep Breath** — Farinelli at maxCount: 11. Extended exhale time-based exercise (longer exhale than inhale). Completion modal.

### Chapter 6 — Rhythm Deep Dive (SECRET)

**Focus:** Complex rhythms, syncopation, groove. No pitched exercises.

**No warmup.**

**Stages (3):**

1. **Finding Groove** — Learn about rhythm in music and voice. Basic rhythm at 90bpm (quarter notes). Syncopated pattern (dotted quarter + eighth).
2. **Offbeat** — Dotted rhythm patterns. Half-note + quarter combinations. Tempo 100. minScore: 60.
3. **Complex Patterns** — Mixed durations (eighths + quarters + halves). Tempo 110. minScore: 70. Completion modal.

### Chapter 7 — Forward Placement

**Focus:** Ee vowel, vowel modification sequences, forward placement, pentatonic scale.

**Warmup:** Standard + Oo and Ah warmup exercises.

**Stages (4):**

1. **The Ee Vowel** — Learn about Ee and forward bright placement. Ee sustains. Ee hill exercises.
2. **Vowel Sequences** — a-o-u-o-a melody exercises (vowel modification). ee-uu-ee contrast melodies. Sustained vowel transitions.
3. **Pentatonic** — Pentatonic scale melodies (`gen.pentatonic()`). Ee on pentatonic. minScore: 50.
4. **Weaving** — Full vowel rotation melodies. Lip rolls on pentatonic scale. Farinelli (maxCount: 9). Completion modal.

### Chapter 8 — Integration

**Focus:** Combining all techniques. Full scales, longer melodies, higher accuracy thresholds.

**Warmup:** Full warmup with all four vowels.

**Stages (4):**

1. **Full Scale** — Major scale melodies (full octave up and down). All vowels on scale. minScore: 50.
2. **Longer Phrases** — Multi-scale melodies (key changes within exercise). Sustained holds at 10s+. Wider lip roll spans.
3. **Precision** — Narrow "between" hills (tight pitch zone). minScore: 60 melodies. Rhythm at 120bpm, minScore: 70.
4. **Coming Together** — Final integrative melody. Farinelli (maxCount: 11). Grand completion modal with confetti.

### Chapter 9 — Chakras (SECRET)

**Focus:** Mantras, affirmations, 7-even-space scale. Each chakra maps to a tone.

**Warmup:** Standard warmup + grounding breathwork.

**Stages (4):**

1. **Root & Sacral** — Learn about chakras and the 7-even-space scale. LAM mantra sustain on tone 1 (with "LAM" cue text). VAM mantra sustain on tone 2. Hill exercises on tones 1–2.
2. **Solar Plexus & Heart** — RAM mantra on tone 3. YAM mantra on tone 4. Heart-opening Ah sustains. Affirmation cues during exercises (e.g. "I am strong", "I am open").
3. **Throat, Third Eye & Crown** — HAM mantra on tone 5. OM on tone 6. Silence/awareness on tone 7. Ee placement. Ascending melody through all 7 tones.
4. **Full Chakra Flow** — Complete 7-tone ascending + descending melody. Mantra cue sequence through all 7. Final Farinelli with chakra awareness cues. Grand completion modal with confetti.

#### Mantra cue implementation

Mantra exercises use existing exercise types with cue text:
- **Hill sustain** with mantra text as `instruction` (e.g. "Hum LAM on this tone. Feel it ground you.")
- **Time-based** exercises for guided mantra sequences (cues cycle through mantras)
- **Melody** exercises for the ascending 7-tone sequences

Affirmations appear as on-screen instruction text and in intro modal instruction sections. The 4-section pattern (do → feel → reason → reassurance) adapts: "do" becomes the mantra/tone, "feel" becomes the chakra location, "reason" becomes the energetic purpose, "reassurance" stays.

#### 7-even-space scale

A new scale type `"even-7"` in the exercise resolver. It divides the user's calibrated vocal range into 7 equally spaced tones:
- Tone 1 (Root) = lowest comfortable note
- Tone 7 (Crown) = highest comfortable note
- Tones 2–6 = equally spaced between

```typescript
// In exercise-resolver.ts, scale resolution:
if (scale.type === "even-7") {
  // Divide user's range into 7 equal steps
  const step = (range.highestNote - range.lowestNote) / 6;
  return Array.from({ length: 7 }, (_, i) => range.lowestNote + i * step);
}
```

Used in chakra exercises:
```typescript
{
  type: "even-7",
  root: 1,  // always starts from lowest
}
```

Melody events reference `i: 1` through `i: 7` for chakras root through crown.

## File structure

```
src/constants/journey/
├── types.ts         — add secret?: boolean to ChapterInput and Chapter
├── Journey.ts       — add getDisplayNumber() helper
├── index.ts         — register all 9 chapters
├── chapter1.ts      — (unchanged)
├── chapter2.ts      — update completionModal text to tease chapter 3
├── chapter3.ts      — NEW: Vowel Exploration
├── chapter4.ts      — NEW: Range & Projection
├── chapter5.ts      — NEW: Breathe Deep (secret)
├── chapter6.ts      — NEW: Rhythm Deep Dive (secret)
├── chapter7.ts      — NEW: Forward Placement
├── chapter8.ts      — NEW: Integration
├── chapter9.ts      — NEW: Chakras (secret)
├── exercise-generator.ts  — (may need minor additions)
├── exercise-resolver.ts   — add "even-7" scale type
└── exercise-tips.ts       — add CHAKRA_TIPS, BREATHWORK_TIPS
```

## UI changes

### ChapterCard.tsx

- Import `journey` to call `getDisplayNumber()`.
- Replace `toRoman(chapter.chapter)` with display number logic:
  ```tsx
  const displayNum = journey.getDisplayNumber(chapter);
  // Label: displayNum ? `Chapter ${toRoman(displayNum)}` : undefined
  ```
- If `chapter.secret && isLocked`: render "???" as title, hide description.
- If `chapter.secret`: never show chapter number label.
- Locked message for secret chapters: "Complete the previous chapter to unlock" (no roman numeral reference).

### Progression

No changes to locking logic — chapters still unlock sequentially by completing the previous chapter's exercises. The `secret` flag only affects display, not progression.
