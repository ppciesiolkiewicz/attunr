import { describe, it, expect } from "vitest";
import { ExerciseGenerator } from "./exercise-generator";
import { BandTargetKind, NoteDuration } from "./types";

const gen = new ExerciseGenerator();
const base = { slug: "test", title: "Test", instruction: "Test instruction" };

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

  it("every root has 5 events: approach chord + I-chord + singing", () => {
    const result = gen.interval({ ...base, startNote: 1, endNote: 3, chromaticDegree: 3 });
    if (result.exerciseTypeId !== "melody") throw new Error("wrong type");
    const second = result.melody[1];
    expect(second.events).toHaveLength(5);
    expect(second.events[0].type).toBe("play"); // approach chord
    expect(second.events[1].type).toBe("play"); // I-chord
    expect(second.events[2].type).toBe("note");
    expect(second.events[3].type).toBe("note");
    expect(second.events[4].type).toBe("note");
  });

  it("approach chord targets [0, 4, 7] (one step below root)", () => {
    const result = gen.interval({ ...base, startNote: 1, endNote: 3, chromaticDegree: 3 });
    if (result.exerciseTypeId !== "melody") throw new Error("wrong type");
    const approach = result.melody[1].events[0];
    if (approach.type !== "play") throw new Error("expected play");
    const indices = approach.targets.map((t) => {
      if (t.kind !== BandTargetKind.Index) throw new Error("expected Index");
      return t.i;
    });
    expect(indices).toEqual([0, 4, 7]);
    expect(approach.duration).toBe(NoteDuration.Quarter);
  });

  it("I-chord targets [1, 5, 8]", () => {
    const result = gen.interval({ ...base, startNote: 1, endNote: 3, chromaticDegree: 3 });
    if (result.exerciseTypeId !== "melody") throw new Error("wrong type");
    // Non-first: I-chord is event[1]
    const play = result.melody[1].events[1];
    if (play.type !== "play") throw new Error("expected play");
    const indices = play.targets.map((t) => {
      if (t.kind !== BandTargetKind.Index) throw new Error("expected Index");
      return t.i;
    });
    expect(indices).toEqual([1, 5, 8]);
    expect(play.duration).toBe(NoteDuration.Quarter);
  });

  it("singing events are root(Half), degree(Quarter), root(Quarter)", () => {
    const result = gen.interval({ ...base, startNote: 1, endNote: 3, chromaticDegree: 3 });
    if (result.exerciseTypeId !== "melody") throw new Error("wrong type");
    // Non-first root: singing starts at event[2]
    const events = result.melody[1].events;
    if (events[2].type !== "note") throw new Error("expected note");
    if (events[2].target.kind !== BandTargetKind.Index) throw new Error("expected Index");
    expect(events[2].target.i).toBe(1);
    expect(events[2].duration).toBe(NoteDuration.Half);
    if (events[3].type !== "note") throw new Error("expected note");
    if (events[3].target.kind !== BandTargetKind.Index) throw new Error("expected Index");
    expect(events[3].target.i).toBe(3);
    expect(events[3].duration).toBe(NoteDuration.Quarter);
    if (events[4].type !== "note") throw new Error("expected note");
    if (events[4].target.kind !== BandTargetKind.Index) throw new Error("expected Index");
    expect(events[4].target.i).toBe(1);
    expect(events[4].duration).toBe(NoteDuration.Quarter);
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

// ── scale() ──────────────────────────────────────────────────────────────────

describe("scale()", () => {
  it("returns exerciseTypeId melody", () => {
    const result = gen.scale({ ...base, startNote: 1, endNote: 4, scaleType: "major" });
    expect(result.exerciseTypeId).toBe("melody");
  });

  it("generates ascending then descending events (4 up + 3 down = 7 for range 1-4)", () => {
    const result = gen.scale({ ...base, startNote: 1, endNote: 4, scaleType: "major" });
    if (result.exerciseTypeId !== "melody") throw new Error("wrong type");
    expect(result.melody).toHaveLength(1);
    const events = result.melody[0].events;
    // ascending: 1, 2, 3, 4 (4 notes) + descending: 3, 2, 1 (3 notes) = 7 total
    expect(events).toHaveLength(7);
    // First 4 are ascending
    for (let i = 0; i < 4; i++) {
      expect(events[i].type).toBe("note");
      const evt = events[i];
      if (evt.type !== "note") throw new Error("expected note");
      if (evt.target.kind !== BandTargetKind.Index) throw new Error("expected Index");
      expect(evt.target.i).toBe(i + 1);
    }
    // Last 3 are descending (3, 2, 1)
    const descTargets = [3, 2, 1];
    for (let i = 0; i < 3; i++) {
      const evt = events[4 + i];
      if (evt.type !== "note") throw new Error("expected note");
      if (evt.target.kind !== BandTargetKind.Index) throw new Error("expected Index");
      expect(evt.target.i).toBe(descTargets[i]);
    }
  });

  it("uses the provided scaleType", () => {
    const result = gen.scale({ ...base, startNote: 1, endNote: 4, scaleType: "minor" });
    if (result.exerciseTypeId !== "melody") throw new Error("wrong type");
    expect(result.melody[0].type).toBe("minor");
  });
});

// ── majorScale() ─────────────────────────────────────────────────────────────

describe("majorScale()", () => {
  it("delegates to scale with scaleType major", () => {
    const result = gen.majorScale({ ...base });
    if (result.exerciseTypeId !== "melody") throw new Error("wrong type");
    expect(result.melody[0].type).toBe("major");
  });

  it("uses default startNote 4 and endNote -4", () => {
    const result = gen.majorScale({ ...base });
    if (result.exerciseTypeId !== "melody") throw new Error("wrong type");
    expect(result.melody.length).toBeGreaterThan(0);
  });
});

// ── scaleDegrees() ───────────────────────────────────────────────────────────

describe("scaleDegrees()", () => {
  it("returns exerciseTypeId melody", () => {
    const result = gen.scaleDegrees({ ...base, startNote: 1, endNote: 4 });
    expect(result.exerciseTypeId).toBe("melody");
  });

  it("generates root-degree-root patterns (3 degrees × 4 events = 12 for range 1-4)", () => {
    const result = gen.scaleDegrees({ ...base, startNote: 1, endNote: 4 });
    if (result.exerciseTypeId !== "melody") throw new Error("wrong type");
    const events = result.melody[0].events;
    // degrees 2, 3, 4 → 3 iterations × (note root, note degree, note root, pause) = 12 events
    expect(events).toHaveLength(12);
    // First group: root(1), degree(2), root(1), pause
    const [e0, e1, e2, e3] = events;
    if (e0.type !== "note") throw new Error("expected note");
    if (e1.type !== "note") throw new Error("expected note");
    if (e2.type !== "note") throw new Error("expected note");
    if (e3.type !== "pause") throw new Error("expected pause");
    if (e0.target.kind !== BandTargetKind.Index) throw new Error("expected Index");
    if (e1.target.kind !== BandTargetKind.Index) throw new Error("expected Index");
    if (e2.target.kind !== BandTargetKind.Index) throw new Error("expected Index");
    expect(e0.target.i).toBe(1);
    expect(e1.target.i).toBe(2);
    expect(e2.target.i).toBe(1);
    expect(e3.duration).toBe(NoteDuration.Quarter);
  });

  it("defaults scaleType to major", () => {
    const result = gen.scaleDegrees({ ...base, startNote: 1, endNote: 4 });
    if (result.exerciseTypeId !== "melody") throw new Error("wrong type");
    expect(result.melody[0].type).toBe("major");
  });

  it("accepts custom scaleType", () => {
    const result = gen.scaleDegrees({ ...base, startNote: 1, endNote: 4, scaleType: "minor" });
    if (result.exerciseTypeId !== "melody") throw new Error("wrong type");
    expect(result.melody[0].type).toBe("minor");
  });
});

// ── zoneBelow() ──────────────────────────────────────────────────────────────

describe("zoneBelow()", () => {
  it("returns pitch-detection with Range target, accept below, from 1", () => {
    const result = gen.zoneBelow({ ...base, boundaryNote: 5, seconds: 3, repeats: 1 });
    expect(result.exerciseTypeId).toBe("pitch-detection");
    if (result.exerciseTypeId !== "pitch-detection") throw new Error("wrong type");
    expect(result.notes).toHaveLength(1);
    const target = result.notes[0].target;
    expect(target.kind).toBe(BandTargetKind.Range);
    if (target.kind !== BandTargetKind.Range) throw new Error("expected Range");
    expect(target.from).toBe(1);
    expect(target.to).toBe(5);
    expect(target.accept).toBe("below");
    expect(result.notes[0].seconds).toBe(3);
  });

  it("uses chromatic scale with root 1", () => {
    const result = gen.zoneBelow({ ...base, boundaryNote: 5, seconds: 3, repeats: 1 });
    if (result.exerciseTypeId !== "pitch-detection") throw new Error("wrong type");
    expect(result.scale.type).toBe("chromatic");
    expect(result.scale.root).toBe(1);
  });
});

// ── zoneAbove() ──────────────────────────────────────────────────────────────

describe("zoneAbove()", () => {
  it("returns pitch-detection with Range target, accept above, to -1", () => {
    const result = gen.zoneAbove({ ...base, boundaryNote: 5, seconds: 3, repeats: 1 });
    expect(result.exerciseTypeId).toBe("pitch-detection");
    if (result.exerciseTypeId !== "pitch-detection") throw new Error("wrong type");
    expect(result.notes).toHaveLength(1);
    const target = result.notes[0].target;
    expect(target.kind).toBe(BandTargetKind.Range);
    if (target.kind !== BandTargetKind.Range) throw new Error("expected Range");
    expect(target.from).toBe(5);
    expect(target.to).toBe(-1);
    expect(target.accept).toBe("above");
  });
});

// ── zoneBetween() ─────────────────────────────────────────────────────────────

describe("zoneBetween()", () => {
  it("returns pitch-detection with Range target, accept within", () => {
    const result = gen.zoneBetween({ ...base, lowNote: 3, highNote: 7, seconds: 5, repeats: 1 });
    expect(result.exerciseTypeId).toBe("pitch-detection");
    if (result.exerciseTypeId !== "pitch-detection") throw new Error("wrong type");
    expect(result.notes).toHaveLength(1);
    const target = result.notes[0].target;
    expect(target.kind).toBe(BandTargetKind.Range);
    if (target.kind !== BandTargetKind.Range) throw new Error("expected Range");
    expect(target.from).toBe(3);
    expect(target.to).toBe(7);
    expect(target.accept).toBe("within");
    expect(result.notes[0].seconds).toBe(5);
  });
});

// ── lipRoll() ────────────────────────────────────────────────────────────────

describe("lipRoll()", () => {
  it("returns tone-follow with slide shape", () => {
    const result = gen.lipRoll({ ...base, startNote: 3, endNote: -3, requiredPlays: 2 });
    expect(result.exerciseTypeId).toBe("tone-follow");
    if (result.exerciseTypeId !== "tone-follow") throw new Error("wrong type");
    expect(result.toneShape.kind).toBe("slide");
    if (result.toneShape.kind !== "slide") throw new Error("expected slide");
    expect(result.toneShape.from).toEqual({ kind: BandTargetKind.Index, i: 3 });
    expect(result.toneShape.to).toEqual({ kind: BandTargetKind.Index, i: -3 });
  });

  it("uses chromatic scale", () => {
    const result = gen.lipRoll({ ...base, startNote: 3, endNote: -3, requiredPlays: 2 });
    if (result.exerciseTypeId !== "tone-follow") throw new Error("wrong type");
    expect(result.scale.type).toBe("chromatic");
    expect(result.scale.root).toBe(1);
  });

  it("uses major display notes with empty notes array", () => {
    const result = gen.lipRoll({ ...base, startNote: 3, endNote: -3, requiredPlays: 2 });
    if (result.exerciseTypeId !== "tone-follow") throw new Error("wrong type");
    expect(result.displayNotes).toBeDefined();
    expect(result.displayNotes).toHaveLength(1);
    const displayScale = result.displayNotes![0];
    expect(displayScale.type).toBe("major");
    expect(displayScale.root).toBe(1);
    expect(displayScale.notes).toEqual([]);
  });

  it("passes through requiredPlays", () => {
    const result = gen.lipRoll({ ...base, startNote: 3, endNote: -3, requiredPlays: 5 });
    if (result.exerciseTypeId !== "tone-follow") throw new Error("wrong type");
    expect(result.requiredPlays).toBe(5);
  });
});

// ── farinelli() ──────────────────────────────────────────────────────────────

describe("farinelli()", () => {
  it("returns breathwork-farinelli with maxCount", () => {
    const result = gen.farinelli({ ...base, maxCount: 7 });
    expect(result.exerciseTypeId).toBe("breathwork-farinelli");
    if (result.exerciseTypeId !== "breathwork-farinelli") throw new Error("wrong type");
    expect(result.maxCount).toBe(7);
  });

  it("passes through custom maxCount", () => {
    const result = gen.farinelli({ ...base, maxCount: 12 });
    if (result.exerciseTypeId !== "breathwork-farinelli") throw new Error("wrong type");
    expect(result.maxCount).toBe(12);
  });
});

// ── Common params ─────────────────────────────────────────────────────────────

describe("common params", () => {
  it("passes through title, headerSubtitle, cardSubtitle, instruction", () => {
    const params = {
      slug: "my-test",
      title: "My Title",
      headerSubtitle: "My Subtitle",
      cardSubtitle: "Card cue text",
      instruction: "Do the thing",
    };
    const result = gen.farinelli({ ...params, maxCount: 7 });
    expect(result.title).toBe("My Title");
    expect(result.headerSubtitle).toBe("My Subtitle");
    expect(result.cardSubtitle).toBe("Card cue text");
    if (result.exerciseTypeId !== "breathwork-farinelli") throw new Error("wrong type");
    expect(result.instruction).toBe("Do the thing");
  });

  it("passes through introModal and completionModal", () => {
    const introModal = {
      title: "Intro",
      subtitle: "Sub",
      elements: [],
    };
    const completionModal = {
      title: "Done",
      subtitle: "Great job",
      elements: [],
    };
    const result = gen.farinelli({ ...base, maxCount: 7, introModal, completionModal });
    expect(result.introModal).toEqual(introModal);
    expect(result.completionModal).toEqual(completionModal);
  });

  it("optional fields are absent when not provided", () => {
    const result = gen.farinelli({ ...base, maxCount: 7 });
    expect(result.headerSubtitle).toBeUndefined();
    expect(result.cardSubtitle).toBeUndefined();
    expect(result.introModal).toBeUndefined();
    expect(result.completionModal).toBeUndefined();
  });
});
