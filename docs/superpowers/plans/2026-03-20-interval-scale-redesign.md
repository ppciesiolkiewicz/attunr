# Interval & Scale Infrastructure Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor interval exercises to use per-root chord context, add root-relative index resolution for melody events, add `startPoint` to BaseScale, and narrow the chapter 1 lip roll slide to 1 octave.

**Architecture:** The Scale class gains `rootIndex` tracking, extends notes below root, and adds `resolveFromRoot()` for root-relative semantics (used by melody events). The existing `resolve()` is unchanged (lip rolls, zones, etc. keep working). The interval generator produces one MelodyScale per root with a I-chord intro. BaseScale gets an optional `startPoint` field.

**Tech Stack:** TypeScript, Vitest, tonal.js

**Spec:** `docs/superpowers/specs/2026-03-20-interval-chord-context-design.md`

---

### Task 1: Add `startPoint` to `BaseScale` type

**Files:**
- Modify: `src/constants/journey/types.ts:194-200`

- [ ] **Step 1: Add `startPoint` to `BaseScale`**

In `src/constants/journey/types.ts`, update the `BaseScale` interface:

```ts
/** Shared scale definition — specifies which note pool to build. */
export interface BaseScale {
  /** Tonal.js scale name or custom identifier (e.g. "even-7-from-major"). */
  type: string;
  /** 1-indexed chromatic degree from user's lowest note. */
  root: ChromaticDegree;
  /** Reference point for root positioning. Default: "start" (from lowest note). */
  startPoint?: "start" | "end" | "center";
}
```

- [ ] **Step 2: Run tests to verify no regressions**

Run: `npx vitest run src/constants/journey/exercise-generator.test.ts`
Expected: All pass (purely additive type change).

- [ ] **Step 3: Commit**

```bash
git add src/constants/journey/types.ts
git commit -m "feat: add startPoint to BaseScale type"
```

---

### Task 2: Extend `Scale` class — `rootIndex`, below-root notes, `resolveFromRoot()`, `startPoint`

**Files:**
- Modify: `src/lib/scale.ts`
- Create: `src/lib/scale.test.ts`

#### Key design decision

Two resolve methods:
- `resolve(target)` — **unchanged**. Positive = 1-indexed from start, negative = from end. Used by lip rolls, zones, pitch detection.
- `resolveFromRoot(target)` — **new**. Index targets are root-relative: `i: 1` = root, `i: 0` = one below root, `i: -1` = two below root. Used by melody event resolution.

Range targets behave identically in both methods (1-indexed from start, negative from end).

- [ ] **Step 1: Write failing tests**

Create `src/lib/scale.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { Scale } from "./scale";
import { BandTargetKind } from "@/constants/journey/types";
import type { VocalRange } from "@/lib/VocalRange";

// Minimal VocalRange stub — chromatic C3 (48) to C5 (72)
const mockVocalRange = {
  lowNote: "C3",
  highNote: "C5",
  allNotes: Array.from({ length: 25 }, (_, i) => {
    const midi = 48 + i;
    const note = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"][midi % 12];
    const octave = Math.floor(midi / 12) - 1;
    return {
      id: `${note}${octave}`,
      midi,
      frequencyHz: Math.round(440 * Math.pow(2, (midi - 69) / 12)),
      note,
      octave,
      name: `${note}${octave}`,
      color: "#fff",
      rgb: "255, 255, 255",
    };
  }),
} as unknown as VocalRange;

describe("Scale.rootIndex", () => {
  it("rootIndex is 0 when root=1 (root at lowest note)", () => {
    const scale = new Scale({ type: "chromatic", root: 1 }, mockVocalRange);
    expect(scale.rootIndex).toBe(0);
  });

  it("rootIndex equals count of notes below root", () => {
    // root=5 → rootMidi = 52, notes below: 48,49,50,51 → rootIndex = 4
    const scale = new Scale({ type: "chromatic", root: 5 }, mockVocalRange);
    expect(scale.rootIndex).toBe(4);
  });
});

describe("Scale.resolveFromRoot() — root-relative Index", () => {
  it("i: 1 resolves to root note", () => {
    const scale = new Scale({ type: "chromatic", root: 5 }, mockVocalRange);
    const result = scale.resolveFromRoot({ kind: BandTargetKind.Index, i: 1 });
    expect(result).toHaveLength(1);
    expect(result[0].midi).toBe(52); // E3
  });

  it("i: 0 resolves to one below root", () => {
    const scale = new Scale({ type: "chromatic", root: 5 }, mockVocalRange);
    const result = scale.resolveFromRoot({ kind: BandTargetKind.Index, i: 0 });
    expect(result).toHaveLength(1);
    expect(result[0].midi).toBe(51); // D#3
  });

  it("i: -1 resolves to two below root", () => {
    const scale = new Scale({ type: "chromatic", root: 5 }, mockVocalRange);
    const result = scale.resolveFromRoot({ kind: BandTargetKind.Index, i: -1 });
    expect(result).toHaveLength(1);
    expect(result[0].midi).toBe(50); // D3
  });

  it("i: 0 returns [] when root is at lowest note", () => {
    const scale = new Scale({ type: "chromatic", root: 1 }, mockVocalRange);
    const result = scale.resolveFromRoot({ kind: BandTargetKind.Index, i: 0 });
    expect(result).toEqual([]);
  });

  it("positive indices above root still work", () => {
    const scale = new Scale({ type: "chromatic", root: 5 }, mockVocalRange);
    const result = scale.resolveFromRoot({ kind: BandTargetKind.Index, i: 3 });
    expect(result).toHaveLength(1);
    expect(result[0].midi).toBe(54); // root(52) + 2
  });

  it("Range targets delegate to resolve() (unchanged semantics)", () => {
    const scale = new Scale({ type: "chromatic", root: 5 }, mockVocalRange);
    const result = scale.resolveFromRoot({
      kind: BandTargetKind.Range,
      from: 1,
      to: -1,
    });
    expect(result.length).toBeGreaterThan(0);
    expect(result[result.length - 1].midi).toBe(72); // C5
  });
});

describe("Scale.resolve() — unchanged semantics", () => {
  it("negative Index still means from end of scale", () => {
    const scale = new Scale({ type: "chromatic", root: 1 }, mockVocalRange);
    const result = scale.resolve({ kind: BandTargetKind.Index, i: -1 });
    expect(result).toHaveLength(1);
    expect(result[0].midi).toBe(72); // last note = C5
  });

  it("negative Range.to still means from end of scale", () => {
    const scale = new Scale({ type: "chromatic", root: 1 }, mockVocalRange);
    const result = scale.resolve({
      kind: BandTargetKind.Range,
      from: 1,
      to: -1,
    });
    expect(result[result.length - 1].midi).toBe(72);
  });
});

describe("Scale startPoint", () => {
  it("default 'start' roots from lowNote", () => {
    const scale = new Scale({ type: "chromatic", root: 1 }, mockVocalRange);
    const result = scale.resolveFromRoot({ kind: BandTargetKind.Index, i: 1 });
    expect(result[0].midi).toBe(48); // C3
  });

  it("'end' with root=1 roots from highNote", () => {
    const scale = new Scale({ type: "chromatic", root: 1, startPoint: "end" }, mockVocalRange);
    const result = scale.resolveFromRoot({ kind: BandTargetKind.Index, i: 1 });
    expect(result[0].midi).toBe(72); // C5
  });

  it("'center' with root=1 roots from midpoint", () => {
    // center = round((48 + 72) / 2) = 60 (C4)
    const scale = new Scale({ type: "chromatic", root: 1, startPoint: "center" }, mockVocalRange);
    const result = scale.resolveFromRoot({ kind: BandTargetKind.Index, i: 1 });
    expect(result[0].midi).toBe(60); // C4
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

Run: `npx vitest run src/lib/scale.test.ts`
Expected: Failures — no `rootIndex`, no `resolveFromRoot`, no `startPoint`.

- [ ] **Step 3: Implement Scale changes**

Update `src/lib/scale.ts`. Changes:

1. Add `rootIndex: number` public readonly property
2. `buildNotes` returns `{ notes, rootIndex }`
3. `buildTonalScale` signature changes: receives `rootMidi` directly, builds notes below root, returns `{ notes, rootIndex }`
4. `startPoint` computed in `buildNotes` before calling `buildTonalScale`
5. Add `resolveFromRoot(target)` method — Index uses `rootIndex + (i - 1)`, Range delegates to `resolve()`
6. `resolve()` unchanged — existing behavior preserved

```ts
import { Note, Scale as TonalScale } from "tonal";
import type { ResolvedNote, ColoredNote, VocalRange } from "@/lib/VocalRange";
import type { NoteTarget, BaseScale } from "@/constants/journey/types";
import { BandTargetKind } from "@/constants/journey/types";
import { midiToHz, NOTE_NAMES } from "@/lib/pitch";

/**
 * Encapsulates a note pool built from a scale definition + vocal range.
 * Provides target resolution and colorization.
 */
export class Scale {
  /** All notes in this scale, sorted low → high. */
  readonly notes: ResolvedNote[];
  /** 0-based array index of the root note within this.notes. */
  readonly rootIndex: number;
  private readonly vocalRange: VocalRange;

  constructor(definition: BaseScale, vocalRange: VocalRange) {
    this.vocalRange = vocalRange;
    const result = Scale.buildNotes(definition, vocalRange);
    this.notes = result.notes;
    this.rootIndex = result.rootIndex;
  }

  /** Pick specific note(s) by index or range. Original semantics: negative Index = from end. */
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

  /**
   * Root-relative resolution for melody events.
   * Index: i=1 is root, i=0 is one below root, i=-1 is two below root.
   * Range: delegates to resolve() (unchanged full-array semantics).
   */
  resolveFromRoot(target: NoteTarget): ResolvedNote[] {
    if (target.kind === BandTargetKind.Index) {
      const n = this.notes.length;
      if (n === 0) return [];
      const idx = this.rootIndex + (target.i - 1);
      return idx >= 0 && idx < n ? [this.notes[idx]] : [];
    }
    return this.resolve(target);
  }

  /** Map colors from VocalRange onto this scale's notes. */
  colorize(): ColoredNote[] {
    const colorMap = new Map<number, { color: string; rgb: string }>();
    for (const cn of this.vocalRange.allNotes) {
      colorMap.set(cn.midi, { color: cn.color, rgb: cn.rgb });
    }

    return this.notes.map((note) => {
      const match = colorMap.get(note.midi);
      if (match) {
        return { ...note, color: match.color, rgb: match.rgb };
      }
      return { ...note, ...Scale.nearestColor(note.midi, this.vocalRange.allNotes) };
    });
  }

  /** Find color of nearest note by midi distance. */
  private static nearestColor(midi: number, allNotes: ColoredNote[]): { color: string; rgb: string } {
    if (allNotes.length === 0) return { color: "#888888", rgb: "136, 136, 136" };
    let closest = allNotes[0];
    let minDist = Math.abs(midi - closest.midi);
    for (let i = 1; i < allNotes.length; i++) {
      const dist = Math.abs(midi - allNotes[i].midi);
      if (dist < minDist) {
        closest = allNotes[i];
        minDist = dist;
      }
    }
    return { color: closest.color, rgb: closest.rgb };
  }

  /** Build the note pool for a scale definition. */
  private static buildNotes(
    definition: BaseScale,
    vocalRange: VocalRange,
  ): { notes: ResolvedNote[]; rootIndex: number } {
    const lowMidi = Note.midi(vocalRange.lowNote);
    const highMidi = Note.midi(vocalRange.highNote);
    if (lowMidi == null || highMidi == null) return { notes: [], rootIndex: 0 };

    if (definition.type === "even-7-from-major") {
      const notes = Scale.buildEven7FromMajor(lowMidi, highMidi, definition.root);
      return { notes, rootIndex: 0 };
    }

    // Compute rootMidi based on startPoint
    const startPoint = definition.startPoint ?? "start";
    let rootMidi: number;
    if (startPoint === "end") {
      rootMidi = highMidi - (definition.root - 1);
    } else if (startPoint === "center") {
      const centerMidi = Math.round((lowMidi + highMidi) / 2);
      rootMidi = centerMidi + (definition.root - 1);
    } else {
      rootMidi = lowMidi + (definition.root - 1);
    }

    return Scale.buildTonalScale(lowMidi, highMidi, definition.type, rootMidi);
  }

  /** Build 7 evenly-spaced notes from the major scale across the range. */
  private static buildEven7FromMajor(lowMidi: number, highMidi: number, root: number): ResolvedNote[] {
    const rootMidi = lowMidi + (root - 1);
    const rootName = NOTE_NAMES[((rootMidi % 12) + 12) % 12];
    const scaleNotes = TonalScale.get(`${rootName} major`).notes;
    const scalePCs = new Set(scaleNotes.map((n) => Note.chroma(n) ?? -1));

    const allMidi: number[] = [];
    for (let midi = lowMidi; midi <= highMidi; midi++) {
      if (scalePCs.has(((midi % 12) + 12) % 12)) allMidi.push(midi);
    }

    // Extend above range if fewer than 7
    let ext = highMidi + 1;
    while (allMidi.length < 7 && ext < highMidi + 25) {
      if (scalePCs.has(((ext % 12) + 12) % 12)) allMidi.push(ext);
      ext++;
    }

    // Fallback: chromatic steps
    if (allMidi.length === 0) {
      return Array.from({ length: 7 }, (_, i) => {
        const midi = lowMidi + Math.round((i * (highMidi - lowMidi)) / 6);
        return Scale.midiToResolvedNote(midi);
      });
    }

    // Pick 7 evenly-spaced
    const n = allMidi.length;
    const indices = Array.from({ length: 7 }, (_, i) =>
      n <= 7 ? i : Math.round((i * (n - 1)) / 6)
    );

    return indices
      .filter((idx) => idx < allMidi.length)
      .map((idx) => Scale.midiToResolvedNote(allMidi[idx]));
  }

  /** Build notes for any tonal.js scale type. Includes notes below root. */
  private static buildTonalScale(
    lowMidi: number,
    highMidi: number,
    scaleType: string,
    rootMidi: number,
  ): { notes: ResolvedNote[]; rootIndex: number } {
    const rootName = NOTE_NAMES[((rootMidi % 12) + 12) % 12];

    // For chromatic, every semitone matches; for named scales, use pitch classes
    const isChromatic = scaleType === "chromatic";
    let scalePCs: Set<number> | null = null;
    if (!isChromatic) {
      const scaleNotes = TonalScale.get(`${rootName} ${scaleType}`).notes;
      scalePCs = new Set(scaleNotes.map((n) => Note.chroma(n) ?? -1));
    }
    const matches = (midi: number) =>
      isChromatic || scalePCs!.has(((midi % 12) + 12) % 12);

    // Notes below root (lowMidi to rootMidi - 1)
    const belowRoot: number[] = [];
    for (let midi = lowMidi; midi < rootMidi; midi++) {
      if (matches(midi)) belowRoot.push(midi);
    }

    // Notes from root upward (rootMidi to highMidi)
    const fromRoot: number[] = [];
    for (let midi = rootMidi; midi <= highMidi; midi++) {
      if (matches(midi)) fromRoot.push(midi);
    }

    const allMidi = [...belowRoot, ...fromRoot];
    const rootIndex = belowRoot.length;

    // Fallback: if fewer than 2 notes from root, fill chromatically
    if (fromRoot.length < 2) {
      for (let midi = rootMidi; midi <= highMidi; midi++) {
        if (!allMidi.includes(midi)) allMidi.push(midi);
      }
      allMidi.sort((a, b) => a - b);
    }

    return {
      notes: allMidi.map((midi) => Scale.midiToResolvedNote(midi)),
      rootIndex,
    };
  }

  /** Convert a MIDI number to a ResolvedNote. */
  private static midiToResolvedNote(midi: number): ResolvedNote {
    const hz = Math.round(midiToHz(midi));
    const noteName = NOTE_NAMES[((midi % 12) + 12) % 12];
    const octave = Math.floor(midi / 12) - 1;
    return {
      id: `${noteName}${octave}`,
      midi,
      frequencyHz: hz,
      note: noteName,
      octave,
      name: `${noteName}${octave}`,
    };
  }
}
```

- [ ] **Step 4: Run scale tests**

Run: `npx vitest run src/lib/scale.test.ts`
Expected: All pass.

- [ ] **Step 5: Run full test suite for regressions**

Run: `npx vitest run`
Expected: All pass. `resolve()` is unchanged. Existing positive Index usages work because `rootIndex=0` when `root=1, startPoint="start"` — same as before. Lip rolls, zones, ranges all unaffected.

- [ ] **Step 6: Commit**

```bash
git add src/lib/scale.ts src/lib/scale.test.ts
git commit -m "feat: add resolveFromRoot, rootIndex, below-root notes, startPoint to Scale"
```

---

### Task 3: Wire melody resolution to use `resolveFromRoot()`

**Files:**
- Modify: `src/constants/journey/exercise-resolver.ts:254-269`

- [ ] **Step 1: Update `resolveMelody()` to call `resolveFromRoot()`**

In `src/constants/journey/exercise-resolver.ts`, change the two `localScale.resolve(target)` calls inside the melody event loop to `localScale.resolveFromRoot(target)`:

```ts
// Line 262 — play event targets:
const resolved = localScale.resolveFromRoot(target);

// Line 269 — note event target:
const resolved = localScale.resolveFromRoot(event.target);
```

This makes melody event Index targets root-relative (i: 0 = below root, i: 1 = root). All other exercise types continue using `resolve()`.

- [ ] **Step 2: Run full test suite**

Run: `npx vitest run`
Expected: All pass. No melody events currently use negative/zero indices, so behavior is identical for existing exercises.

- [ ] **Step 3: Commit**

```bash
git add src/constants/journey/exercise-resolver.ts
git commit -m "feat: use resolveFromRoot for melody events (enables below-root notes)"
```

---

### Task 4: Update NoteTarget JSDoc

**Files:**
- Modify: `src/constants/journey/types.ts:31-47`

- [ ] **Step 1: Update JSDoc**

```ts
/**
 * Describes which note(s) in a scale an exercise targets.
 *
 * - index: Position in the scale's note pool.
 *   When resolved via resolveFromRoot() (melody events): root-relative.
 *     i=1 is root, i=2 is one above root, i=0 is one below root, i=-1 is two below root.
 *   When resolved via resolve() (all other exercises): full-array indexed.
 *     Positive i: 1-indexed from start. Negative i: from end (-1 = last note).
 * - range: Inclusive range using full-array indexing (1-indexed from start, negative from end).
 *   Used for loose detection exercises.
 *   - accept: "below" = any tone at or below the range; "above" = any tone at or above
 */
```

- [ ] **Step 2: Commit**

```bash
git add src/constants/journey/types.ts
git commit -m "docs: update NoteTarget JSDoc for dual resolve semantics"
```

---

### Task 5: Refactor `interval()` with chord context

**Files:**
- Modify: `src/constants/journey/exercise-generator.ts:251-258, 395-458`
- Modify: `src/constants/journey/exercise-generator.test.ts:10-112`

- [ ] **Step 1: Update interval and fifth tests**

Replace the `interval()` and `fifth()` describe blocks in `exercise-generator.test.ts`:

```ts
// ── interval() ───────────────────────────────────────────────────────────────

describe("interval()", () => {
  it("returns exerciseTypeId melody", () => {
    const result = gen.interval({ ...base, startNote: 1, endNote: 4, chromaticDegree: 3 });
    expect(result.exerciseTypeId).toBe("melody");
  });

  it("generates one MelodyScale per root in lo→hi→lo arc", () => {
    const result = gen.interval({ ...base, startNote: 1, endNote: 3, chromaticDegree: 3 });
    if (result.exerciseTypeId !== "melody") throw new Error("wrong type");
    // roots: 1, 2, 3, 2, 1
    expect(result.melody).toHaveLength(5);
    expect(result.melody.map((m) => m.root)).toEqual([1, 2, 3, 2, 1]);
  });

  it("each root has play-note-note-note pattern (4 events)", () => {
    const result = gen.interval({ ...base, startNote: 1, endNote: 3, chromaticDegree: 3 });
    if (result.exerciseTypeId !== "melody") throw new Error("wrong type");
    const second = result.melody[1];
    expect(second.events).toHaveLength(4);
    expect(second.events[0].type).toBe("play");
    expect(second.events[1].type).toBe("note");
    expect(second.events[2].type).toBe("note");
    expect(second.events[3].type).toBe("note");
  });

  it("play event has I chord targets [1, 5, 8]", () => {
    const result = gen.interval({ ...base, startNote: 1, endNote: 3, chromaticDegree: 3 });
    if (result.exerciseTypeId !== "melody") throw new Error("wrong type");
    const play = result.melody[1].events[0];
    if (play.type !== "play") throw new Error("expected play");
    const indices = play.targets.map((t) => {
      if (t.kind !== BandTargetKind.Index) throw new Error("expected Index");
      return t.i;
    });
    expect(indices).toEqual([1, 5, 8]);
  });

  it("non-first roots have chord duration Quarter", () => {
    const result = gen.interval({ ...base, startNote: 1, endNote: 3, chromaticDegree: 3 });
    if (result.exerciseTypeId !== "melody") throw new Error("wrong type");
    expect(result.melody[1].events[0].duration).toBe(NoteDuration.Quarter);
  });

  it("first root has chord duration Half (longer intro)", () => {
    const result = gen.interval({ ...base, startNote: 1, endNote: 3, chromaticDegree: 3 });
    if (result.exerciseTypeId !== "melody") throw new Error("wrong type");
    expect(result.melody[0].events[0].duration).toBe(NoteDuration.Half);
  });

  it("note events are root(Half), degree(Quarter), root(Quarter)", () => {
    const result = gen.interval({ ...base, startNote: 1, endNote: 3, chromaticDegree: 3 });
    if (result.exerciseTypeId !== "melody") throw new Error("wrong type");
    const events = result.melody[1].events;
    if (events[1].type !== "note") throw new Error("expected note");
    if (events[1].target.kind !== BandTargetKind.Index) throw new Error("expected Index");
    expect(events[1].target.i).toBe(1);
    expect(events[1].duration).toBe(NoteDuration.Half);
    if (events[2].type !== "note") throw new Error("expected note");
    if (events[2].target.kind !== BandTargetKind.Index) throw new Error("expected Index");
    expect(events[2].target.i).toBe(3);
    expect(events[2].duration).toBe(NoteDuration.Quarter);
    if (events[3].type !== "note") throw new Error("expected note");
    if (events[3].target.kind !== BandTargetKind.Index) throw new Error("expected Index");
    expect(events[3].target.i).toBe(1);
    expect(events[3].duration).toBe(NoteDuration.Quarter);
  });

  it("uses default tempo 80 and minScore 0", () => {
    const result = gen.interval({ ...base, startNote: 1, endNote: 3, chromaticDegree: 3 });
    if (result.exerciseTypeId !== "melody") throw new Error("wrong type");
    expect(result.tempo).toBe(80);
    expect(result.minScore).toBe(0);
  });

  it("accepts custom tempo and minScore", () => {
    const result = gen.interval({
      ...base, startNote: 1, endNote: 3, chromaticDegree: 3,
      tempo: 100, minScore: 70,
    });
    if (result.exerciseTypeId !== "melody") throw new Error("wrong type");
    expect(result.tempo).toBe(100);
    expect(result.minScore).toBe(70);
  });

  it("displayNotes range includes chord P5", () => {
    const result = gen.interval({ ...base, startNote: 1, endNote: 3, chromaticDegree: 3 });
    if (result.exerciseTypeId !== "melody") throw new Error("wrong type");
    const scale = result.displayNotes![0];
    const maxTarget = Math.max(...scale.notes.map((n) => {
      if (n.target.kind !== BandTargetKind.Index) throw new Error("expected Index");
      return n.target.i;
    }));
    expect(maxTarget).toBeGreaterThanOrEqual(10); // hi(3) + 7
  });

  it("all melody scales use type chromatic", () => {
    const result = gen.interval({ ...base, startNote: 1, endNote: 3, chromaticDegree: 3 });
    if (result.exerciseTypeId !== "melody") throw new Error("wrong type");
    for (const m of result.melody) {
      expect(m.type).toBe("chromatic");
    }
  });
});

// ── fifth() ──────────────────────────────────────────────────────────────────

describe("fifth()", () => {
  it("delegates to interval with chromaticDegree 8", () => {
    const result = gen.fifth({ ...base });
    if (result.exerciseTypeId !== "melody") throw new Error("wrong type");
    const noteEvents = result.melody[0].events.filter((e) => e.type === "note");
    const degreeEvent = noteEvents[1];
    if (degreeEvent.type !== "note") throw new Error("expected note");
    if (degreeEvent.target.kind !== BandTargetKind.Index) throw new Error("expected Index");
    expect(degreeEvent.target.i).toBe(8);
  });

  it("uses default startNote 4 and endNote -4", () => {
    const result = gen.fifth({ ...base });
    if (result.exerciseTypeId !== "melody") throw new Error("wrong type");
    expect(result.melody.length).toBeGreaterThan(0);
  });

  it("accepts custom startNote and endNote overrides", () => {
    const result = gen.fifth({ ...base, startNote: 1, endNote: 8 });
    if (result.exerciseTypeId !== "melody") throw new Error("wrong type");
    expect(result.melody.length).not.toBe(0);
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

Run: `npx vitest run src/constants/journey/exercise-generator.test.ts`
Expected: Failures on interval tests.

- [ ] **Step 3: Refactor `interval()` and remove `noteDuration` from `IntervalParams`**

In `src/constants/journey/exercise-generator.ts`:

Remove `noteDuration` from `IntervalParams`:

```ts
export interface IntervalParams extends CommonParams {
  startNote: number;
  endNote: number;
  chromaticDegree: number;
  tempo?: number;
  minScore?: number;
}
```

Replace `interval()` method body:

```ts
  interval(params: IntervalParams): ExerciseConfigInput {
    const {
      startNote,
      endNote,
      chromaticDegree,
      tempo = 80,
      minScore = 0,
    } = params;

    const lo = Math.min(startNote, endNote);
    const hi = Math.max(startNote, endNote);

    // Build root arc: lo → hi → lo
    const roots: number[] = [];
    for (let r = lo; r <= hi; r++) roots.push(r);
    for (let r = hi - 1; r > lo; r--) roots.push(r);
    roots.push(lo);

    // Events shared by all non-first roots
    const events: MelodyEvent[] = [
      {
        type: "play",
        targets: [toTarget(1), toTarget(5), toTarget(8)],
        duration: NoteDuration.Quarter,
      },
      { type: "note", target: toTarget(1), duration: NoteDuration.Half },
      {
        type: "note",
        target: toTarget(chromaticDegree),
        duration: NoteDuration.Quarter,
      },
      { type: "note", target: toTarget(1), duration: NoteDuration.Quarter },
    ];

    // First root gets longer intro chord
    const firstEvents: MelodyEvent[] = [
      {
        type: "play",
        targets: [toTarget(1), toTarget(5), toTarget(8)],
        duration: NoteDuration.Half,
      },
      { type: "note", target: toTarget(1), duration: NoteDuration.Half },
      {
        type: "note",
        target: toTarget(chromaticDegree),
        duration: NoteDuration.Quarter,
      },
      { type: "note", target: toTarget(1), duration: NoteDuration.Quarter },
    ];

    const melody: MelodyScale[] = roots.map((root, idx) => ({
      type: "chromatic" as const,
      root,
      events: idx === 0 ? firstEvents : events,
    }));

    // Active notes: every root, its interval note, and chord notes
    const activeNotes: number[] = [];
    for (let r = lo; r <= hi; r++) {
      for (const offset of [0, chromaticDegree - 1, 4, 7]) {
        const note = r + offset;
        if (!activeNotes.includes(note)) activeNotes.push(note);
      }
    }

    const displayHi = hi + Math.max(chromaticDegree - 1, 7);

    return {
      ...pickCommon(params),
      exerciseTypeId: "melody",
      tempo,
      melody,
      displayNotes: buildDisplayNotes(lo, displayHi, activeNotes),
      minScore,
    };
  }
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/constants/journey/exercise-generator.test.ts`
Expected: All pass.

- [ ] **Step 5: Verify with console log test**

Run: `npx tsx src/constants/journey/chapter1.test.ts`
Expected: Shows per-root MelodyScales with play [1,5,8] chord + note 1 + note 3 + note 1 pattern.

- [ ] **Step 6: Commit**

```bash
git add src/constants/journey/exercise-generator.ts src/constants/journey/exercise-generator.test.ts
git commit -m "feat: refactor interval() with I-chord context per root"
```

---

### Task 6: Narrow chapter 1 lip roll slide to ~1 octave

**Files:**
- Modify: `src/constants/journey/chapter1.ts:185-201`

- [ ] **Step 1: Update lip roll slide range**

In `src/constants/journey/chapter1.ts`, change the lip roll from full vocal range to ~1 octave. Replace `startNote: -5, endNote: 4` with positive values spanning roughly 12 semitones:

```ts
      gen.lipRoll({
        slug: "lip-roll-slide",
        startNote: 13,
        endNote: 1,
        scale: { type: "major", root: 1 },
        requiredPlays: 3,
```

`startNote: 13, endNote: 1` = high to low, ~1 octave from lowest note. Rest of the config unchanged.

- [ ] **Step 2: Run full test suite**

Run: `npx vitest run`
Expected: All pass.

- [ ] **Step 3: Commit**

```bash
git add src/constants/journey/chapter1.ts
git commit -m "feat: narrow lip roll slide to ~1 octave range"
```

---

### Task 7: Final verification and cleanup

- [ ] **Step 1: Run full test suite**

Run: `npx vitest run`
Expected: All pass.

- [ ] **Step 2: Verify majorSecond output**

Run: `npx tsx src/constants/journey/chapter1.test.ts`
Expected: Per-root chromatic MelodyScales with chord context.

- [ ] **Step 3: Delete chapter1.test.ts**

```bash
git rm src/constants/journey/chapter1.test.ts
git commit -m "chore: remove chapter1 console log test"
```

- [ ] **Step 4: Run build**

Run: `npm run build`
Expected: No TypeScript errors.
