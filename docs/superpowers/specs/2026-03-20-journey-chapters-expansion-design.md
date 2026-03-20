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

**Warmup:** Ch2 warmup + Oo hill sustain (3s×5, note 6, direction: "down"). 7 exercises total.

**Stages (4):**

1. **The Open Ah** — Learn about Ah vowel and open placement. Ah hill sustains (5s×3, note 4, direction: "down"). Ah between-zone hills (5s×3, notes [5,9]).
2. **Reaching Higher** — Octave interval melodies (`gen.octave()`, minScore: 0). Ah hill across wider range (6s×3, notes [3,12]). Zone-above (5s×3, boundaryNote: -5).
3. **Dynamics** — Ah sustains (10s×3, notes [5,9]). Melody (major scale, tempo 55, minScore: 40). Rhythm at tempo 90, minScore: 60.
4. **Power & Rest** — Full range lip rolls (startNote: 1, endNote: -1, 5 plays). Farinelli (maxCount: 9). Completion modal.

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

**Warmup:** Ch4 warmup + Ah hill sustain (3s×5, note 5, direction: "down"). 8 exercises total.

**Stages (4):**

1. **The Ee Vowel** — Learn about Ee and forward bright placement. Ee hill sustains (5s×3, note [7,11], direction: "between"). Ee zone-above (4s×3, boundaryNote: -5).
2. **Vowel Sequences** — a-o-u-o-a melody (chromatic, tempo 45, 5 notes, minScore: 30). ee-uu-ee contrast melody (chromatic, tempo 45, 3 notes, minScore: 30). Sustained vowel transition hill (6s×3).
3. **Pentatonic** — Pentatonic scale melodies (`gen.pentatonic()`, minScore: 50). Ee hill on pentatonic range (6s×3). Lip roll slide on pentatonic (startNote: 3, endNote: -3, 4 plays, scale: major pentatonic).
4. **Weaving** — Full vowel rotation melody (major, tempo 50, 7 notes, minScore: 40). Lip rolls (startNote: 1, endNote: -1, 5 plays). Farinelli (maxCount: 9). Completion modal.

### Chapter 8 — Integration

**Focus:** Combining all techniques. Full scales, longer melodies, higher accuracy thresholds.

**Warmup:** Ch7 warmup + Ee hill sustain (3s×5, note [7,11], direction: "between"). 9 exercises total — covers sss-zzz, lip roll, hum, Uu, Oo, Ah, Ee, hoo hoo, Farinelli.

**Stages (4):**

1. **Full Scale** — Major scale melody (full octave up+down, tempo 55, minScore: 50). Hum scale melody (major, tempo 50, minScore: 40). Oo scale hill (8s×3, notes [3,12]).
2. **Longer Phrases** — Multi-scale melody (2 MelodyScale segments at different roots, tempo 50, minScore: 50). Sustained Ah holds (10s×3). Lip rolls (startNote: 1, endNote: -1, 5 plays).
3. **Precision** — Narrow "between" hills (8s×3, notes [6,8] — tight 2-semitone zone). Melody (major, tempo 60, minScore: 60). Rhythm at 120bpm, minScore: 70.
4. **Coming Together** — Final integrative melody (major, full octave, tempo 55, minScore: 60). Farinelli (maxCount: 11). Grand completion modal with confetti.

### Chapter 9 — Chakras (SECRET)

**Focus:** Mantras, affirmations, 7-even-space scale. Each chakra maps to a tone.

**Warmup:** Ch2-style warmup (sss-zzz, lip roll, hum, Uu, hoo hoo) + grounding Farinelli (maxCount: 7). 7 exercises total.

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

A new scale type `"even-7"` in `Scale.buildNotes()` (in `src/lib/scale.ts`), alongside the existing `"even-7-from-major"`. The difference:

- `"even-7-from-major"` — picks 7 evenly distributed notes from the major scale pitch classes
- `"even-7"` — divides the full chromatic range into 7 equally spaced tones (pure linear interpolation, not constrained to any scale)

The `"even-7"` scale always spans the user's full vocal range. The `root` field is set to `1` by convention but is not used for positioning — the scale always starts from the lowest note. This is an intentional exception to the `BaseScale` contract, documented in the code.

Implementation in `Scale.buildNotes()`:
```typescript
if (definition.type === "even-7") {
  // 7 equally spaced tones across the full vocal range (chakra scale)
  const step = (highMidi - lowMidi) / 6;
  const notes: ResolvedNote[] = Array.from({ length: 7 }, (_, i) => {
    const midi = Math.round(lowMidi + i * step);
    return { midi, color: Scale.colorForMidi(midi), /* ... */ };
  });
  return { notes, rootIndex: 0 };
}
```

Used in chakra exercises:
```typescript
{
  type: "even-7",
  root: 1,  // convention — scale always spans full range
}
```

Melody events use root-relative indexing (`resolveFromRoot`): `i: 1` = tone 1 (Root chakra, lowest), through `i: 7` = tone 7 (Crown chakra, highest). This is consistent with how melody events work in all other exercises.

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
├── exercise-tips.ts       — add CHAKRA_TIPS, BREATHWORK_TIPS
src/lib/
└── scale.ts               — add "even-7" scale type in Scale.buildNotes()
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

### Completion modal titles for secret chapters

Secret chapters use the chapter title instead of "Chapter {N} Complete":
- Regular: "Chapter IV Complete" / "Range & Projection"
- Secret: "Breathe Deep Complete" / (no subtitle — the title IS the identity)

### New exercise tips

**BREATHWORK_TIPS** (for ch5 breathwork exercises):
- "Breathe from your belly — let it expand on the inhale, soften on the exhale."
- "There's no right speed. Follow the cues and let your body adjust."
- "If you feel lightheaded, pause and breathe normally. This is gentle exploration."
- "Close your eyes if it helps you focus inward."
- "Notice the pause between inhale and exhale — that's where stillness lives."

**CHAKRA_TIPS** (for ch9 chakra exercises):
- "Each tone maps to a place in your body. Feel where it resonates."
- "The mantra is a vibration, not a word. Let it hum through you."
- "Start quietly. Let the sound grow from inside rather than pushing it out."
- "If a tone feels stuck, soften your jaw and breathe into it."
- "There's no right way to feel this. Just notice what happens."

### `secret` field propagation

The `secret` field propagates automatically through `Journey.assignIds()` via the spread operator (`...ch`). No changes needed to `assignIds()`.

### Progression

No changes to locking logic — chapters still unlock sequentially by completing the previous chapter's exercises. The `secret` flag only affects display, not progression.

### index.ts registration

```typescript
export const journey = new Journey([
  { chapter: 1, slug: "introduction", title: "Introduction", description: "...", stages: CHAPTER_1_STAGES },
  { chapter: 2, slug: "building-foundation", title: "Building Foundation", description: "...", warmup: CHAPTER_2_WARMUP, stages: CHAPTER_2_STAGES },
  { chapter: 3, slug: "vowel-exploration", title: "Vowel Exploration", description: "...", warmup: CHAPTER_3_WARMUP, stages: CHAPTER_3_STAGES },
  { chapter: 4, slug: "range-and-projection", title: "Range & Projection", description: "...", warmup: CHAPTER_4_WARMUP, stages: CHAPTER_4_STAGES },
  { chapter: 5, slug: "breathe-deep", title: "Breathe Deep", description: "...", secret: true, stages: CHAPTER_5_STAGES },
  { chapter: 6, slug: "rhythm-deep-dive", title: "Rhythm Deep Dive", description: "...", secret: true, stages: CHAPTER_6_STAGES },
  { chapter: 7, slug: "forward-placement", title: "Forward Placement", description: "...", warmup: CHAPTER_7_WARMUP, stages: CHAPTER_7_STAGES },
  { chapter: 8, slug: "integration", title: "Integration", description: "...", warmup: CHAPTER_8_WARMUP, stages: CHAPTER_8_STAGES },
  { chapter: 9, slug: "chakras", title: "Chakras", description: "...", secret: true, warmup: CHAPTER_9_WARMUP, stages: CHAPTER_9_STAGES },
]);
```
