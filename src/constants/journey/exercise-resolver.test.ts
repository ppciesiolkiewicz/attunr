import { describe, it, expect } from "vitest";
import { resolveExercise } from "./exercise-resolver";
import type {
  PitchDetectionExercise,
  PitchDetectionSlideExercise,
  ToneFollowExercise,
  MelodyExercise,
  RhythmExercise,
} from "./exercise-resolver";
import { VocalRange } from "@/lib/VocalRange";
import { BandTargetKind, NoteDuration } from "./types";
import type {
  PitchDetectionConfig,
  PitchDetectionSlideConfig,
  ToneFollowConfig,
  MelodyConfig,
  RhythmConfig,
} from "./types";

// ── Test vocal range (C3–C5) ────────────────────────────────────────────────

const testVocalRange = new VocalRange(131, 523, "A440");
const allNotes = testVocalRange.allNotes;

const base = {
  id: 1,
  slug: "test",
  chapter: 1,
  chapterSlug: "test-chapter",
  stageId: "test",
  title: "Test",
  headerSubtitle: "test",
  instruction: "Test instruction",
};

// ── pitch-detection ─────────────────────────────────────────────────────────

describe("resolveExercise — pitch-detection", () => {
  const exercise: PitchDetectionConfig = {
    ...base,
    exerciseTypeId: "pitch-detection",
    scale: { type: "chromatic", root: 1 },
    notes: [{ target: { kind: BandTargetKind.Index, i: 3 }, seconds: 4 }],
  };

  it("returns PitchDetectionExercise with correct type", () => {
    const result = resolveExercise(exercise, testVocalRange);
    expect(result.exerciseTypeId).toBe("pitch-detection");
  });

  it("resolves targets with note, seconds", () => {
    const result = resolveExercise(exercise, testVocalRange) as PitchDetectionExercise;
    expect(result.targets).toHaveLength(1);
    expect(result.targets[0].seconds).toBe(4);
    expect(result.targets[0].note.midi).toBeTypeOf("number");
  });

  it("returns ColoredNote references from vocalRange.allNotes", () => {
    const result = resolveExercise(exercise, testVocalRange) as PitchDetectionExercise;
    for (const t of result.targets) {
      expect(allNotes).toContain(t.note);
    }
  });

  it("displayNotes are sorted low→high", () => {
    const result = resolveExercise(exercise, testVocalRange) as PitchDetectionExercise;
    for (let i = 1; i < result.displayNotes.length; i++) {
      expect(result.displayNotes[i].frequencyHz).toBeGreaterThanOrEqual(
        result.displayNotes[i - 1].frequencyHz,
      );
    }
  });

  it("highlightIds are target note IDs", () => {
    const result = resolveExercise(exercise, testVocalRange) as PitchDetectionExercise;
    expect(result.highlightIds).toEqual(result.targets.map((t) => t.note.id));
  });

  it("resolves range target with accept and rangeNotes", () => {
    const rangeExercise: PitchDetectionConfig = {
      ...base,
      exerciseTypeId: "pitch-detection",
      scale: { type: "chromatic", root: 1 },
      notes: [{
        target: { kind: BandTargetKind.Range, from: 1, to: 5, accept: "below" },
        seconds: 3,
      }],
    };
    const result = resolveExercise(rangeExercise, testVocalRange) as PitchDetectionExercise;
    expect(result.targets[0].accept).toBe("below");
    expect(result.targets[0].rangeNotes).toBeDefined();
    expect(result.targets[0].rangeNotes!.length).toBeGreaterThan(0);
    for (const rn of result.targets[0].rangeNotes!) {
      expect(allNotes).toContain(rn);
    }
  });

  it("resolves multi-note sequence", () => {
    const seqExercise: PitchDetectionConfig = {
      ...base,
      exerciseTypeId: "pitch-detection",
      scale: { type: "chromatic", root: 1 },
      notes: [
        { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 3 },
        { target: { kind: BandTargetKind.Index, i: 5 }, seconds: 3 },
        { target: { kind: BandTargetKind.Index, i: 10 }, seconds: 3 },
      ],
    };
    const result = resolveExercise(seqExercise, testVocalRange) as PitchDetectionExercise;
    expect(result.targets).toHaveLength(3);
    expect(result.targets[0].note.id).not.toBe(result.targets[1].note.id);
  });
});

// ── pitch-detection-slide ───────────────────────────────────────────────────

describe("resolveExercise — pitch-detection-slide", () => {
  const exercise: PitchDetectionSlideConfig = {
    ...base,
    exerciseTypeId: "pitch-detection-slide",
    scale: { type: "chromatic", root: 1 },
    notes: [{
      from: { kind: BandTargetKind.Index, i: 1 },
      to: { kind: BandTargetKind.Index, i: 10 },
    }],
  };

  it("returns from/to ColoredNotes", () => {
    const result = resolveExercise(exercise, testVocalRange) as PitchDetectionSlideExercise;
    expect(result.exerciseTypeId).toBe("pitch-detection-slide");
    expect(result.from.midi).toBeLessThan(result.to.midi);
  });

  it("from/to are references from allNotes", () => {
    const result = resolveExercise(exercise, testVocalRange) as PitchDetectionSlideExercise;
    expect(allNotes).toContain(result.from);
    expect(allNotes).toContain(result.to);
  });

  it("displayNotes include from and to", () => {
    const result = resolveExercise(exercise, testVocalRange) as PitchDetectionSlideExercise;
    const displayIds = result.displayNotes.map((n) => n.id);
    expect(displayIds).toContain(result.from.id);
    expect(displayIds).toContain(result.to.id);
  });
});

// ── tone-follow ─────────────────────────────────────────────────────────────

describe("resolveExercise — tone-follow", () => {
  it("resolves slide toneShape", () => {
    const exercise: ToneFollowConfig = {
      ...base,
      exerciseTypeId: "tone-follow",
      scale: { type: "chromatic", root: 1 },
      toneShape: {
        kind: "slide",
        from: { kind: BandTargetKind.Index, i: 1 },
        to: { kind: BandTargetKind.Index, i: 10 },
      },
      requiredPlays: 3,
    };
    const result = resolveExercise(exercise, testVocalRange) as ToneFollowExercise;
    expect(result.exerciseTypeId).toBe("tone-follow");
    expect(result.toneShape.kind).toBe("slide");
    if (result.toneShape.kind === "slide") {
      expect(allNotes).toContain(result.toneShape.from);
      expect(allNotes).toContain(result.toneShape.to);
    }
    expect(result.requiredPlays).toBe(3);
  });

  it("resolves sustain toneShape", () => {
    const exercise: ToneFollowConfig = {
      ...base,
      exerciseTypeId: "tone-follow",
      scale: { type: "chromatic", root: 1 },
      toneShape: {
        kind: "sustain",
        target: { kind: BandTargetKind.Index, i: 5 },
        seconds: 4,
      },
      requiredPlays: 2,
    };
    const result = resolveExercise(exercise, testVocalRange) as ToneFollowExercise;
    expect(result.toneShape.kind).toBe("sustain");
    if (result.toneShape.kind === "sustain") {
      expect(result.toneShape.seconds).toBe(4);
      expect(allNotes).toContain(result.toneShape.note);
    }
  });

  it("uses displayNotes config for highlights when present", () => {
    const exercise: ToneFollowConfig = {
      ...base,
      exerciseTypeId: "tone-follow",
      scale: { type: "chromatic", root: 1 },
      toneShape: {
        kind: "slide",
        from: { kind: BandTargetKind.Index, i: 1 },
        to: { kind: BandTargetKind.Index, i: 10 },
      },
      displayNotes: [{ type: "major", root: 1, notes: [] }],
      requiredPlays: 1,
    };
    const result = resolveExercise(exercise, testVocalRange) as ToneFollowExercise;
    // With displayNotes, highlights come from the display scale
    expect(result.highlightIds.length).toBeGreaterThan(0);
  });
});

// ── melody ──────────────────────────────────────────────────────────────────

describe("resolveExercise — melody", () => {
  const exercise: MelodyConfig = {
    ...base,
    exerciseTypeId: "melody",
    tempo: 120,
    minScore: 70,
    melody: [{
      type: "chromatic",
      root: 1,
      events: [
        { type: "note", target: { kind: BandTargetKind.Index, i: 1 }, duration: NoteDuration.Quarter },
        { type: "pause", duration: NoteDuration.Quarter },
        { type: "note", target: { kind: BandTargetKind.Index, i: 3 }, duration: NoteDuration.Half },
        { type: "play", targets: [
          { kind: BandTargetKind.Index, i: 1 },
          { kind: BandTargetKind.Index, i: 3 },
        ], duration: NoteDuration.Quarter },
      ],
    }],
  };

  it("returns correct type and metadata", () => {
    const result = resolveExercise(exercise, testVocalRange) as MelodyExercise;
    expect(result.exerciseTypeId).toBe("melody");
    expect(result.tempo).toBe(120);
    expect(result.minScore).toBe(70);
  });

  it("builds timeline with correct entries", () => {
    const result = resolveExercise(exercise, testVocalRange) as MelodyExercise;
    // 2 note entries + 2 play entries (one per target) = 4, pause emits nothing
    expect(result.timeline).toHaveLength(4);
  });

  it("pause advances cursor but emits no entry", () => {
    const result = resolveExercise(exercise, testVocalRange) as MelodyExercise;
    // First note at 0ms, second note after quarter + quarter pause
    const quarterMs = durationToMs(NoteDuration.Quarter, 120);
    expect(result.timeline[0].startMs).toBe(0);
    expect(result.timeline[1].startMs).toBe(quarterMs * 2); // note + pause
  });

  it("play events have audioOnly: true", () => {
    const result = resolveExercise(exercise, testVocalRange) as MelodyExercise;
    const playEntries = result.timeline.filter((e) => e.audioOnly);
    expect(playEntries).toHaveLength(2);
    for (const p of playEntries) {
      expect(p.audioOnly).toBe(true);
    }
  });

  it("note entries do not have audioOnly", () => {
    const result = resolveExercise(exercise, testVocalRange) as MelodyExercise;
    const noteEntries = result.timeline.filter((e) => !e.audioOnly);
    expect(noteEntries).toHaveLength(2);
    for (const n of noteEntries) {
      expect(n.audioOnly).toBeUndefined();
    }
  });

  it("computes correct totalDurationMs", () => {
    const result = resolveExercise(exercise, testVocalRange) as MelodyExercise;
    // Q + Q(pause) + H + Q = 4+4+8+4 = 20 sixteenths = 5 quarter notes
    const totalQuarters = 5;
    const expectedMs = totalQuarters * (60 / 120) * 1000;
    expect(result.totalDurationMs).toBe(expectedMs);
  });

  it("displayNotes are sorted low→high and deduplicated", () => {
    const result = resolveExercise(exercise, testVocalRange) as MelodyExercise;
    const ids = result.displayNotes.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (let i = 1; i < result.displayNotes.length; i++) {
      expect(result.displayNotes[i].frequencyHz).toBeGreaterThanOrEqual(
        result.displayNotes[i - 1].frequencyHz,
      );
    }
  });

  it("all ColoredNote references are from vocalRange.allNotes", () => {
    const result = resolveExercise(exercise, testVocalRange) as MelodyExercise;
    for (const entry of result.timeline) {
      expect(allNotes).toContain(entry.note);
    }
    for (const dn of result.displayNotes) {
      expect(allNotes).toContain(dn);
    }
  });

  it("handles silent notes", () => {
    const silentExercise: MelodyConfig = {
      ...base,
      exerciseTypeId: "melody",
      tempo: 120,
      minScore: 0,
      melody: [{
        type: "chromatic",
        root: 1,
        events: [
          { type: "note", target: { kind: BandTargetKind.Index, i: 1 }, duration: NoteDuration.Quarter, silent: true },
        ],
      }],
    };
    const result = resolveExercise(silentExercise, testVocalRange) as MelodyExercise;
    expect(result.timeline[0].silent).toBe(true);
  });
});

// ── rhythm ─────────────────────────────────────────────────────────────────

describe("resolveExercise — rhythm", () => {
  const exercise: RhythmConfig = {
    ...base,
    exerciseTypeId: "rhythm",
    tempo: 120,
    minScore: 60,
    pattern: [
      { type: "tap", duration: NoteDuration.Quarter },
      { type: "pause", duration: NoteDuration.Quarter },
      { type: "tap", duration: NoteDuration.Half },
    ],
    metronome: true,
  };

  it("returns correct type and metadata", () => {
    const result = resolveExercise(exercise, testVocalRange) as RhythmExercise;
    expect(result.exerciseTypeId).toBe("rhythm");
    expect(result.tempo).toBe(120);
    expect(result.minScore).toBe(60);
    expect(result.metronome).toBe(true);
  });

  it("produces beats only for tap events", () => {
    const result = resolveExercise(exercise, testVocalRange) as RhythmExercise;
    expect(result.beats).toHaveLength(2);
  });

  it("computes correct startMs with pause gap", () => {
    const result = resolveExercise(exercise, testVocalRange) as RhythmExercise;
    const quarterMs = durationToMs(NoteDuration.Quarter, 120);
    expect(result.beats[0].startMs).toBe(0);
    expect(result.beats[1].startMs).toBe(quarterMs * 2);
  });

  it("computes correct durationMs per beat", () => {
    const result = resolveExercise(exercise, testVocalRange) as RhythmExercise;
    const quarterMs = durationToMs(NoteDuration.Quarter, 120);
    const halfMs = durationToMs(NoteDuration.Half, 120);
    expect(result.beats[0].durationMs).toBe(quarterMs);
    expect(result.beats[1].durationMs).toBe(halfMs);
  });

  it("computes correct totalDurationMs", () => {
    const result = resolveExercise(exercise, testVocalRange) as RhythmExercise;
    const expectedMs = 4 * (60 / 120) * 1000;
    expect(result.totalDurationMs).toBe(expectedMs);
  });

  it("sets displayNotes and highlightIds to empty arrays", () => {
    const result = resolveExercise(exercise, testVocalRange) as RhythmExercise;
    expect(result.displayNotes).toEqual([]);
    expect(result.highlightIds).toEqual([]);
  });

  it("defaults metronome to false when omitted", () => {
    const noMetronome: RhythmConfig = {
      ...base,
      exerciseTypeId: "rhythm",
      tempo: 80,
      minScore: 50,
      pattern: [{ type: "tap", duration: NoteDuration.Quarter }],
    };
    const result = resolveExercise(noMetronome, testVocalRange) as RhythmExercise;
    expect(result.metronome).toBe(false);
  });

  it("handles all-pause pattern with no beats", () => {
    const allPause: RhythmConfig = {
      ...base,
      exerciseTypeId: "rhythm",
      tempo: 120,
      minScore: 0,
      pattern: [
        { type: "pause", duration: NoteDuration.Quarter },
        { type: "pause", duration: NoteDuration.Quarter },
      ],
    };
    const result = resolveExercise(allPause, testVocalRange) as RhythmExercise;
    expect(result.beats).toHaveLength(0);
    const expectedMs = 2 * durationToMs(NoteDuration.Quarter, 120);
    expect(result.totalDurationMs).toBe(expectedMs);
  });
});

// ── unsupported types ───────────────────────────────────────────────────────

describe("resolveExercise — unsupported types", () => {
  it("throws for learn exercises", () => {
    expect(() =>
      resolveExercise(
        { ...base, exerciseTypeId: "learn", elements: [] } as never,
        testVocalRange,
      ),
    ).toThrow();
  });
});

// ── helper ──────────────────────────────────────────────────────────────────

function durationToMs(duration: number, tempo: number): number {
  return (duration / 4) * (60 / tempo) * 1000;
}
