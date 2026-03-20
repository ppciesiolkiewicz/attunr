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
    const scale = new Scale({ type: "chromatic", root: 5 }, mockVocalRange);
    expect(scale.rootIndex).toBe(4);
  });
});

describe("Scale.resolveFromRoot() — root-relative Index", () => {
  it("i: 1 resolves to root note", () => {
    const scale = new Scale({ type: "chromatic", root: 5 }, mockVocalRange);
    const result = scale.resolveFromRoot({ kind: BandTargetKind.Index, i: 1 });
    expect(result).toHaveLength(1);
    expect(result[0].midi).toBe(52);
  });

  it("i: 0 resolves to one below root", () => {
    const scale = new Scale({ type: "chromatic", root: 5 }, mockVocalRange);
    const result = scale.resolveFromRoot({ kind: BandTargetKind.Index, i: 0 });
    expect(result).toHaveLength(1);
    expect(result[0].midi).toBe(51);
  });

  it("i: -1 resolves to two below root", () => {
    const scale = new Scale({ type: "chromatic", root: 5 }, mockVocalRange);
    const result = scale.resolveFromRoot({ kind: BandTargetKind.Index, i: -1 });
    expect(result).toHaveLength(1);
    expect(result[0].midi).toBe(50);
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
    expect(result[0].midi).toBe(54);
  });

  it("Range targets delegate to resolve() (unchanged semantics)", () => {
    const scale = new Scale({ type: "chromatic", root: 5 }, mockVocalRange);
    const result = scale.resolveFromRoot({
      kind: BandTargetKind.Range,
      from: 1,
      to: -1,
    });
    expect(result.length).toBeGreaterThan(0);
    expect(result[result.length - 1].midi).toBe(72);
  });
});

describe("Scale.resolve() — unchanged semantics", () => {
  it("negative Index still means from end of scale", () => {
    const scale = new Scale({ type: "chromatic", root: 1 }, mockVocalRange);
    const result = scale.resolve({ kind: BandTargetKind.Index, i: -1 });
    expect(result).toHaveLength(1);
    expect(result[0].midi).toBe(72);
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
    expect(result[0].midi).toBe(48);
  });

  it("'end' with root=1 roots from highNote", () => {
    const scale = new Scale({ type: "chromatic", root: 1, startPoint: "end" }, mockVocalRange);
    const result = scale.resolveFromRoot({ kind: BandTargetKind.Index, i: 1 });
    expect(result[0].midi).toBe(72);
  });

  it("'center' with root=1 roots from midpoint", () => {
    const scale = new Scale({ type: "chromatic", root: 1, startPoint: "center" }, mockVocalRange);
    const result = scale.resolveFromRoot({ kind: BandTargetKind.Index, i: 1 });
    expect(result[0].midi).toBe(60);
  });
});
