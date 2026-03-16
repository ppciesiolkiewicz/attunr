# Exercise Generator Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create an `ExerciseGenerator` class that produces journey exercise configs, unify `NoteTarget.i` on 1-indexed `ChromaticDegree`, and remove the `technique` field.

**Architecture:** Three independent changes: (1) unify indexing convention, (2) remove `technique`, (3) build the generator class. Tasks 1-2 are foundation work. Task 3 builds the generator. Task 4 adds unit tests. No new dependencies.

**Tech Stack:** TypeScript, Vitest, tonal.js (already in use)

**Spec:** `docs/superpowers/specs/2026-03-16-exercise-generator-design.md`

---

## Chunk 1: Foundation changes

### Task 1: Unify NoteTarget.i on 1-indexed ChromaticDegree

**Files:**
- Modify: `src/constants/journey/types.ts` (ChromaticDegree comment, NoteTarget doc)
- Modify: `src/lib/scale.ts` (Scale.resolve — adjust for 1-indexed i)
- Modify: `src/constants/journey/part2.ts` (shift i values +1)
- Modify: `src/constants/journey/part3.ts` (shift i values +1)
- Modify: `src/constants/journey/part4.ts` (shift i values +1)
- Modify: `src/constants/journey/part5.ts` (shift i values +1)

- [ ] **Step 1: Update ChromaticDegree doc comment in types.ts**

In `src/constants/journey/types.ts`, update the doc comment:

```ts
/** 1-indexed chromatic degree from user's lowest note (1 = lowest). Negative values count from top (-1 = highest). */
export type ChromaticDegree = number;
```

- [ ] **Step 2: Update NoteTarget doc comment in types.ts**

Update the NoteTarget comment block to reflect 1-indexed `i`:

```ts
/**
 * Describes which note(s) in a scale an exercise targets.
 *
 * - index: 1-indexed ChromaticDegree position in the scale's note pool; negative counts from end (-1 = last note)
 * - range: inclusive ChromaticDegree range (negative supported); used for loose detection exercises
 *   - accept: "below" = any tone at or below the range; "above" = any tone at or above
 */
```

- [ ] **Step 3: Update Scale.resolve() to handle 1-indexed i**

In `src/lib/scale.ts`, the `resolve` method currently treats `i` as 0-indexed. Change to 1-indexed:

```ts
resolve(target: NoteTarget): ResolvedNote[] {
  const n = this.notes.length;
  if (n === 0) return [];

  if (target.kind === BandTargetKind.Index) {
    // 1-indexed: positive i maps to array index i-1, negative i maps from end
    const idx = target.i < 0 ? n + target.i : target.i - 1;
    return idx >= 0 && idx < n ? [this.notes[idx]] : [];
  }

  if (target.kind === BandTargetKind.Range) {
    // Convert 1-indexed from/to to 0-indexed array positions
    const fromIdx = target.from < 0 ? n + target.from : target.from - 1;
    const toIdx = target.to < 0 ? n + target.to : target.to - 1;
    const lo = Math.max(0, Math.min(fromIdx, toIdx));
    const hi = Math.min(n - 1, Math.max(fromIdx, toIdx));
    return this.notes.slice(lo, hi + 1);
  }

  return [];
}
```

- [ ] **Step 4: Update part2.ts — shift all i values by +1**

In `src/constants/journey/part2.ts`, find all `BandTargetKind.Index` targets and change `i: X` to `i: X + 1`. For example `i: 0` → `i: 1`, `i: 2` → `i: 3`. Negative values stay unchanged (they count from the end relative to array length).

Also shift `BandTargetKind.Range` `from`/`to` values by +1 for positive values. For example `from: 0, to: 2` → `from: 1, to: 3`. Negative values stay unchanged.

Note: part1.ts has no note targets (only `learn` and `learn-notes-1` exercises) — skip it. Parts 6-20 are commented out — update them when uncommenting.

Note: `BandTargetKind.Range` targets also use `from`/`to` values that need +1. For example `from: 0, to: 2` → `from: 1, to: 3` and `from: -3, to: -1` stays as-is (negative already correct).

- [ ] **Step 5: Update part3.ts — shift all i values by +1**

Same for `src/constants/journey/part3.ts`.

- [ ] **Step 6: Update part4.ts — shift all i values by +1**

Same for `src/constants/journey/part4.ts`.

- [ ] **Step 7: Update part5.ts — shift all i values by +1**

Same for `src/constants/journey/part5.ts`.

- [ ] **Step 8: Verify build passes**

Run: `npx next build 2>&1 | tail -20`
Expected: Build succeeds with no type errors.

- [ ] **Step 9: Commit**

```bash
git add src/constants/journey/types.ts src/lib/scale.ts src/constants/journey/part{2,3,4,5}.ts
git commit -m "refactor: unify NoteTarget.i on 1-indexed ChromaticDegree"
```

---

### Task 2: Remove technique

**Files:**
- Modify: `src/constants/journey/types.ts` (delete TechniqueId, remove technique from BaseExerciseConfig)
- Modify: `src/constants/journey/index.ts` (remove TechniqueId export)
- Modify: `src/constants/journey/part1.ts` through `part5.ts` (remove technique assignments)
- Modify: `src/constants/journey/part6.ts` through `part20.ts` (remove technique from commented-out code)
- Modify: `src/components/Exercise/MelodyExercise.tsx:261` (hardcode tolerance)
- Modify: `src/components/Exercise/PitchExercise/usePitchProgress.ts:69` (hardcode tolerance)

- [ ] **Step 1: Delete TechniqueId and technique from types.ts**

In `src/constants/journey/types.ts`:
- Delete the `TechniqueId` type definition (line 55): `export type TechniqueId = "sustain" | "mantra" | "lip-rolls" | "puffy-cheeks";`
- Delete the `technique` field and its comment from `BaseExerciseConfig` (lines 124-125): `technique?: TechniqueId;`
- Delete the doc comment for technique (line 52-54)

- [ ] **Step 2: Remove TechniqueId from index.ts exports**

In `src/constants/journey/index.ts`, remove `TechniqueId` from the type exports (line 39).

- [ ] **Step 3: Remove technique from part1.ts through part5.ts**

Search for and remove all `technique: "..."` lines from the active part files. These are in:
- `part1.ts:9` — `technique: "sustain"`
- `part2.ts:10,22,34,54,97,109` — various technique values
- `part3.ts:11,24,44,65` — various technique values
- `part4.ts:10` — `technique: "sustain"`

Part 5 has no technique assignments.

- [ ] **Step 4: Remove technique from part6.ts through part20.ts (commented-out code)**

Search for and remove all `technique: "..."` lines from the commented-out part files. These files are already commented out in index.ts, but clean them up so they're ready when uncommenting.

- [ ] **Step 5: Hardcode tolerance in MelodyExercise.tsx**

In `src/components/Exercise/MelodyExercise.tsx:261`, replace:
```ts
const tolerance = exercise.technique === "puffy-cheeks" ? 0.08 : 0.03;
```
with:
```ts
const tolerance = 0.03;
```

- [ ] **Step 6: Hardcode tolerance in usePitchProgress.ts**

In `src/components/Exercise/PitchExercise/usePitchProgress.ts:69`, replace:
```ts
const tolerance = exercise.technique === "puffy-cheeks" ? 0.08 : 0.03;
```
with:
```ts
const tolerance = 0.03;
```

- [ ] **Step 7: Check for any remaining technique references**

Run: `grep -r "technique" src/ --include="*.ts" --include="*.tsx" | grep -v node_modules | grep -v ".stories."`

Only data/articles.ts mentions should remain (content text, not code). Fix any others found.

- [ ] **Step 8: Verify build passes**

Run: `npx next build 2>&1 | tail -20`
Expected: Build succeeds.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "refactor: remove technique field, hardcode tolerance"
```

---

## Chunk 2: Generator class

### Task 3: Build ExerciseGenerator

**Files:**
- Create: `src/constants/journey/generator.ts`

- [ ] **Step 1: Create generator.ts with types and helper**

Create `src/constants/journey/generator.ts` with the param types and the private `toTarget` helper:

```ts
import type {
  JourneyExerciseInput,
  ModalConfig,
  NoteTarget,
  MelodyScale,
  MelodyEvent,
  DisplayScale,
  DisplayNote,
} from "./types";
import { BandTargetKind, NoteDuration } from "./types";

interface CommonParams {
  part: number;
  title: string;
  subtitle?: string;
  cardCue?: string;
  instruction: string;
  introModal?: ModalConfig;
  completionModal?: ModalConfig;
}

interface IntervalParams extends CommonParams {
  startNote: number;
  endNote: number;
  chromaticDegree: number;
  tempo?: number;
  noteDuration?: NoteDuration;
  minScore?: number;
}

interface ScaleParams extends CommonParams {
  startNote: number;
  endNote: number;
  scaleType: string;
  tempo?: number;
  noteDuration?: NoteDuration;
  minScore?: number;
}

interface ScaleDegreeParams extends CommonParams {
  startNote: number;
  endNote: number;
  scaleType?: string;
  tempo?: number;
  noteDuration?: NoteDuration;
  minScore?: number;
}

interface NamedMelodyParams extends CommonParams {
  startNote?: number;
  endNote?: number;
  tempo?: number;
  minScore?: number;
}

interface ZoneBelowParams extends CommonParams {
  boundaryNote: number;
  seconds: number;
}

interface ZoneAboveParams extends CommonParams {
  boundaryNote: number;
  seconds: number;
}

interface ZoneBetweenParams extends CommonParams {
  lowNote: number;
  highNote: number;
  seconds: number;
}

interface LipRollParams extends CommonParams {
  startNote: number;
  endNote: number;
  requiredPlays: number;
}

interface FarinelliParams extends CommonParams {
  maxCount: number;
}

function toTarget(note: number): NoteTarget {
  return { kind: BandTargetKind.Index, i: note };
}

function buildDisplayNotes(startNote: number, endNote: number, activeNotes: number[]): DisplayScale[] {
  const activeSet = new Set(activeNotes);
  const notes: DisplayNote[] = [];
  const lo = Math.min(startNote, endNote);
  const hi = Math.max(startNote, endNote);
  for (let n = lo; n <= hi; n++) {
    notes.push({
      target: toTarget(n),
      style: activeSet.has(n) ? "full" : "muted",
    });
  }
  return [{ type: "chromatic", root: 1, notes }];
}
```

- [ ] **Step 2: Add melody generator methods**

Add to the `ExerciseGenerator` class:

```ts
export class ExerciseGenerator {
  interval(params: IntervalParams): JourneyExerciseInput {
    const {
      startNote, endNote, chromaticDegree,
      tempo = 80, noteDuration = NoteDuration.Half, minScore = 0,
      part, title, subtitle, cardCue, instruction,
      introModal, completionModal,
    } = params;

    const melody: MelodyScale[] = [];
    const lo = Math.min(startNote, endNote);
    const hi = Math.max(startNote, endNote);
    const activeNotes: number[] = [];

    for (let root = lo; root <= hi - chromaticDegree + 1; root++) {
      const intervalNote = root + chromaticDegree - 1;
      activeNotes.push(root, intervalNote);

      melody.push({
        type: "chromatic",
        root: lo,
        events: [
          { type: "play", targets: [toTarget(root), toTarget(intervalNote)], duration: NoteDuration.Quarter },
          { type: "pause", duration: NoteDuration.Eighth },
          { type: "note", target: toTarget(root), duration: noteDuration },
          { type: "note", target: toTarget(intervalNote), duration: noteDuration },
        ],
      });
    }

    return {
      exerciseTypeId: "melody",
      part, title, subtitle, cardCue, instruction,
      introModal, completionModal,
      tempo,
      melody,
      displayNotes: buildDisplayNotes(lo, hi, activeNotes),
      minScore,
    };
  }

  scale(params: ScaleParams): JourneyExerciseInput {
    const {
      startNote, endNote, scaleType,
      tempo = 80, noteDuration = NoteDuration.Half, minScore = 0,
      part, title, subtitle, cardCue, instruction,
      introModal, completionModal,
    } = params;

    const lo = Math.min(startNote, endNote);
    const hi = Math.max(startNote, endNote);

    // Build ascending events — scale resolution happens at runtime,
    // so we reference all indices in the scale's note pool.
    // We use chromatic root at lo, and the scale type filters which notes appear.
    const events: MelodyEvent[] = [];

    // We don't know how many notes the scale will have at config time
    // (depends on user's range). Use a chromatic walk and let the scale type filter.
    // Generate note targets from lo to hi ascending, then hi-1 to lo descending.
    for (let n = lo; n <= hi; n++) {
      events.push({ type: "note", target: toTarget(n), duration: noteDuration });
    }
    for (let n = hi - 1; n >= lo; n--) {
      events.push({ type: "note", target: toTarget(n), duration: noteDuration });
    }

    const melody: MelodyScale[] = [{
      type: scaleType,
      root: lo,
      events,
    }];

    return {
      exerciseTypeId: "melody",
      part, title, subtitle, cardCue, instruction,
      introModal, completionModal,
      tempo,
      melody,
      displayNotes: buildDisplayNotes(lo, hi, Array.from({ length: hi - lo + 1 }, (_, i) => lo + i)),
      minScore,
    };
  }

  scaleDegrees(params: ScaleDegreeParams): JourneyExerciseInput {
    const {
      startNote, endNote, scaleType = "major",
      tempo = 80, noteDuration = NoteDuration.Half, minScore = 0,
      part, title, subtitle, cardCue, instruction,
      introModal, completionModal,
    } = params;

    const lo = Math.min(startNote, endNote);
    const hi = Math.max(startNote, endNote);

    // Root-degree-root pattern for each degree above root
    const events: MelodyEvent[] = [];
    for (let n = lo + 1; n <= hi; n++) {
      events.push(
        { type: "note", target: toTarget(lo), duration: noteDuration },
        { type: "note", target: toTarget(n), duration: noteDuration },
        { type: "note", target: toTarget(lo), duration: noteDuration },
        { type: "pause", duration: NoteDuration.Quarter },
      );
    }

    const melody: MelodyScale[] = [{
      type: scaleType,
      root: lo,
      events,
    }];

    return {
      exerciseTypeId: "melody",
      part, title, subtitle, cardCue, instruction,
      introModal, completionModal,
      tempo,
      melody,
      displayNotes: buildDisplayNotes(lo, hi, Array.from({ length: hi - lo + 1 }, (_, i) => lo + i)),
      minScore,
    };
  }
```

- [ ] **Step 3: Add named convenience methods**

```ts
  fifth(params: NamedMelodyParams): JourneyExerciseInput {
    return this.interval({
      ...params,
      startNote: params.startNote ?? 4,
      endNote: params.endNote ?? -4,
      chromaticDegree: 8,
      tempo: params.tempo,
      minScore: params.minScore,
    });
  }

  octave(params: NamedMelodyParams): JourneyExerciseInput {
    return this.interval({
      ...params,
      startNote: params.startNote ?? 4,
      endNote: params.endNote ?? -4,
      chromaticDegree: 13,
      tempo: params.tempo,
      minScore: params.minScore,
    });
  }

  majorScale(params: NamedMelodyParams): JourneyExerciseInput {
    return this.scale({
      ...params,
      startNote: params.startNote ?? 4,
      endNote: params.endNote ?? -4,
      scaleType: "major",
      tempo: params.tempo,
      minScore: params.minScore,
    });
  }

  minorScale(params: NamedMelodyParams): JourneyExerciseInput {
    return this.scale({
      ...params,
      startNote: params.startNote ?? 4,
      endNote: params.endNote ?? -4,
      scaleType: "minor",
      tempo: params.tempo,
      minScore: params.minScore,
    });
  }

  pentatonic(params: NamedMelodyParams): JourneyExerciseInput {
    return this.scale({
      ...params,
      startNote: params.startNote ?? 4,
      endNote: params.endNote ?? -4,
      scaleType: "major pentatonic",
      tempo: params.tempo,
      minScore: params.minScore,
    });
  }
```

- [ ] **Step 4: Add zone generator methods**

```ts
  zoneBelow(params: ZoneBelowParams): JourneyExerciseInput {
    const { boundaryNote, seconds, part, title, subtitle, cardCue, instruction, introModal, completionModal } = params;
    return {
      exerciseTypeId: "pitch-detection",
      part, title, subtitle, cardCue, instruction,
      introModal, completionModal,
      scale: { type: "chromatic", root: 1 },
      notes: [{
        target: { kind: BandTargetKind.Range, from: 1, to: boundaryNote, accept: "below" },
        seconds,
      }],
    };
  }

  zoneAbove(params: ZoneAboveParams): JourneyExerciseInput {
    const { boundaryNote, seconds, part, title, subtitle, cardCue, instruction, introModal, completionModal } = params;
    return {
      exerciseTypeId: "pitch-detection",
      part, title, subtitle, cardCue, instruction,
      introModal, completionModal,
      scale: { type: "chromatic", root: 1 },
      notes: [{
        target: { kind: BandTargetKind.Range, from: boundaryNote, to: -1, accept: "above" },
        seconds,
      }],
    };
  }

  zoneBetween(params: ZoneBetweenParams): JourneyExerciseInput {
    const { lowNote, highNote, seconds, part, title, subtitle, cardCue, instruction, introModal, completionModal } = params;
    return {
      exerciseTypeId: "pitch-detection",
      part, title, subtitle, cardCue, instruction,
      introModal, completionModal,
      scale: { type: "chromatic", root: 1 },
      notes: [{
        target: { kind: BandTargetKind.Range, from: lowNote, to: highNote, accept: "within" },
        seconds,
      }],
    };
  }
```

- [ ] **Step 5: Add lipRoll and farinelli methods**

```ts
  lipRoll(params: LipRollParams): JourneyExerciseInput {
    const { startNote, endNote, requiredPlays, part, title, subtitle, cardCue, instruction, introModal, completionModal } = params;
    return {
      exerciseTypeId: "tone-follow",
      part, title, subtitle, cardCue, instruction,
      introModal, completionModal,
      scale: { type: "chromatic", root: 1 },
      displayNotes: [{ type: "major", root: 1, notes: [] }],
      toneShape: { kind: "slide", from: toTarget(startNote), to: toTarget(endNote) },
      requiredPlays,
    };
  }

  farinelli(params: FarinelliParams): JourneyExerciseInput {
    const { maxCount, part, title, subtitle, cardCue, instruction, introModal, completionModal } = params;
    return {
      exerciseTypeId: "breathwork-farinelli",
      part, title, subtitle, cardCue, instruction,
      introModal, completionModal,
      maxCount,
    };
  }
}
```

- [ ] **Step 6: Verify build passes**

Run: `npx next build 2>&1 | tail -20`
Expected: Build succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/constants/journey/generator.ts
git commit -m "feat: add ExerciseGenerator class"
```

---

### Task 4: Add unit tests

**Files:**
- Create: `src/constants/journey/generator.test.ts`

- [ ] **Step 1: Add vitest unit test project to vitest.config.ts**

The current vitest config only has a Storybook browser project. Add a unit test project so we can run non-browser tests:

In `vitest.config.ts`, add a second project to the `projects` array:

```ts
{
  extends: true,
  test: {
    name: 'unit',
    include: ['src/**/*.test.ts'],
  },
},
```

- [ ] **Step 2: Write tests for generator**

Create `src/constants/journey/generator.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { ExerciseGenerator } from "./generator";
import { BandTargetKind, NoteDuration } from "./types";

const gen = new ExerciseGenerator();

const base = {
  part: 1,
  title: "Test",
  instruction: "Test instruction",
};

describe("ExerciseGenerator", () => {
  describe("interval", () => {
    it("returns a melody exercise with correct type", () => {
      const result = gen.interval({ ...base, startNote: 4, endNote: -4, chromaticDegree: 8 });
      expect(result.exerciseTypeId).toBe("melody");
    });

    it("generates melody scales with play-pause-note-note pattern", () => {
      const result = gen.interval({ ...base, startNote: 1, endNote: 5, chromaticDegree: 3 });
      if (result.exerciseTypeId !== "melody") throw new Error("wrong type");
      expect(result.melody.length).toBeGreaterThan(0);
      const events = result.melody[0].events;
      expect(events[0].type).toBe("play");
      expect(events[1].type).toBe("pause");
      expect(events[2].type).toBe("note");
      expect(events[3].type).toBe("note");
    });

    it("uses default tempo 80 and minScore 0", () => {
      const result = gen.interval({ ...base, startNote: 1, endNote: 5, chromaticDegree: 3 });
      if (result.exerciseTypeId !== "melody") throw new Error("wrong type");
      expect(result.tempo).toBe(80);
      expect(result.minScore).toBe(0);
    });

    it("accepts custom tempo and minScore", () => {
      const result = gen.interval({ ...base, startNote: 1, endNote: 5, chromaticDegree: 3, tempo: 120, minScore: 50 });
      if (result.exerciseTypeId !== "melody") throw new Error("wrong type");
      expect(result.tempo).toBe(120);
      expect(result.minScore).toBe(50);
    });

    it("generates displayNotes covering full range", () => {
      const result = gen.interval({ ...base, startNote: 1, endNote: 5, chromaticDegree: 3 });
      if (result.exerciseTypeId !== "melody") throw new Error("wrong type");
      expect(result.displayNotes).toBeDefined();
      expect(result.displayNotes!.length).toBe(1);
      expect(result.displayNotes![0].notes.length).toBe(5); // notes 1-5
    });
  });

  describe("fifth", () => {
    it("delegates to interval with chromaticDegree 8", () => {
      const result = gen.fifth({ ...base });
      if (result.exerciseTypeId !== "melody") throw new Error("wrong type");
      // Default range 4 to -4
      expect(result.melody.length).toBeGreaterThan(0);
    });

    it("uses default startNote 4 and endNote -4", () => {
      const full = gen.fifth({ ...base });
      const custom = gen.fifth({ ...base, startNote: 4, endNote: -4 });
      if (full.exerciseTypeId !== "melody" || custom.exerciseTypeId !== "melody") throw new Error("wrong type");
      expect(full.melody.length).toBe(custom.melody.length);
    });
  });

  describe("scale", () => {
    it("returns a melody exercise", () => {
      const result = gen.scale({ ...base, startNote: 1, endNote: 8, scaleType: "major" });
      expect(result.exerciseTypeId).toBe("melody");
    });

    it("generates ascending then descending events", () => {
      const result = gen.scale({ ...base, startNote: 1, endNote: 4, scaleType: "major" });
      if (result.exerciseTypeId !== "melody") throw new Error("wrong type");
      const events = result.melody[0].events;
      // 4 ascending (1,2,3,4) + 3 descending (3,2,1) = 7 note events
      expect(events.length).toBe(7);
      expect(events.every(e => e.type === "note")).toBe(true);
    });
  });

  describe("majorScale", () => {
    it("delegates to scale with major type", () => {
      const result = gen.majorScale({ ...base });
      if (result.exerciseTypeId !== "melody") throw new Error("wrong type");
      expect(result.melody[0].type).toBe("major");
    });
  });

  describe("scaleDegrees", () => {
    it("generates root-degree-root patterns", () => {
      const result = gen.scaleDegrees({ ...base, startNote: 1, endNote: 4 });
      if (result.exerciseTypeId !== "melody") throw new Error("wrong type");
      const events = result.melody[0].events.filter(e => e.type === "note");
      // 3 degrees above root (2,3,4), each gets root-degree-root = 9 notes
      expect(events.length).toBe(9);
    });
  });

  describe("zoneBelow", () => {
    it("returns pitch-detection with Range target and accept below", () => {
      const result = gen.zoneBelow({ ...base, boundaryNote: 4, seconds: 6 });
      expect(result.exerciseTypeId).toBe("pitch-detection");
      if (result.exerciseTypeId !== "pitch-detection") throw new Error("wrong type");
      expect(result.notes[0].target).toEqual({
        kind: BandTargetKind.Range,
        from: 1,
        to: 4,
        accept: "below",
      });
      expect(result.notes[0].seconds).toBe(6);
    });
  });

  describe("zoneAbove", () => {
    it("returns pitch-detection with Range target and accept above", () => {
      const result = gen.zoneAbove({ ...base, boundaryNote: -3, seconds: 5 });
      expect(result.exerciseTypeId).toBe("pitch-detection");
      if (result.exerciseTypeId !== "pitch-detection") throw new Error("wrong type");
      expect(result.notes[0].target).toEqual({
        kind: BandTargetKind.Range,
        from: -3,
        to: -1,
        accept: "above",
      });
    });
  });

  describe("zoneBetween", () => {
    it("returns pitch-detection with Range target and accept within", () => {
      const result = gen.zoneBetween({ ...base, lowNote: 3, highNote: 6, seconds: 8 });
      expect(result.exerciseTypeId).toBe("pitch-detection");
      if (result.exerciseTypeId !== "pitch-detection") throw new Error("wrong type");
      expect(result.notes[0].target).toEqual({
        kind: BandTargetKind.Range,
        from: 3,
        to: 6,
        accept: "within",
      });
    });
  });

  describe("lipRoll", () => {
    it("returns tone-follow with slide shape", () => {
      const result = gen.lipRoll({ ...base, startNote: -1, endNote: 1, requiredPlays: 3 });
      expect(result.exerciseTypeId).toBe("tone-follow");
      if (result.exerciseTypeId !== "tone-follow") throw new Error("wrong type");
      expect(result.toneShape.kind).toBe("slide");
      expect(result.requiredPlays).toBe(3);
    });

    it("sets chromatic scale and major display notes", () => {
      const result = gen.lipRoll({ ...base, startNote: -1, endNote: 1, requiredPlays: 3 });
      if (result.exerciseTypeId !== "tone-follow") throw new Error("wrong type");
      expect(result.scale).toEqual({ type: "chromatic", root: 1 });
      expect(result.displayNotes).toEqual([{ type: "major", root: 1, notes: [] }]);
    });
  });

  describe("farinelli", () => {
    it("returns breathwork-farinelli with maxCount", () => {
      const result = gen.farinelli({ ...base, maxCount: 7 });
      expect(result.exerciseTypeId).toBe("breathwork-farinelli");
      if (result.exerciseTypeId !== "breathwork-farinelli") throw new Error("wrong type");
      expect(result.maxCount).toBe(7);
    });
  });

  describe("common params", () => {
    it("passes through all common fields", () => {
      const result = gen.farinelli({
        part: 3,
        title: "My Title",
        subtitle: "My Subtitle",
        cardCue: "My Cue",
        instruction: "My Instruction",
        maxCount: 5,
        completionModal: {
          title: "Done",
          subtitle: "Well done",
          elements: [],
          confetti: true,
        },
      });
      expect(result.part).toBe(3);
      expect(result.title).toBe("My Title");
      expect(result.subtitle).toBe("My Subtitle");
      expect(result.cardCue).toBe("My Cue");
      if (result.exerciseTypeId !== "breathwork-farinelli") throw new Error("wrong type");
      expect(result.completionModal?.confetti).toBe(true);
    });
  });
});
```

- [ ] **Step 3: Run tests**

Run: `npx vitest run --project unit`
Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add vitest.config.ts src/constants/journey/generator.test.ts
git commit -m "test: add ExerciseGenerator unit tests"
```
