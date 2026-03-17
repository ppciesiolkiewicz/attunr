import type {
  ExerciseConfigInput,
  ModalConfig,
  NoteTarget,
  SustainNoteConfig,
  BaseScale,
  MelodyScale,
  MelodyEvent,
  DisplayScale,
  DisplayNote,
  ToneShape,
} from "./types";
import { BandTargetKind, NoteDuration } from "./types";

// ── Param interfaces ──────────────────────────────────────────────────────────

export interface CommonParams {
  title: string;
  subtitle?: string;
  cardCue?: string;
  instruction: string;
  introModal?: ModalConfig;
  completionModal?: ModalConfig;
}

export interface IntervalParams extends CommonParams {
  startNote: number;
  endNote: number;
  chromaticDegree: number;
  tempo?: number;
  noteDuration?: NoteDuration;
  minScore?: number;
}

export interface ScaleParams extends CommonParams {
  startNote: number;
  endNote: number;
  scaleType: string;
  tempo?: number;
  noteDuration?: NoteDuration;
  minScore?: number;
}

export interface ScaleDegreeParams extends CommonParams {
  startNote: number;
  endNote: number;
  scaleType?: string;
  tempo?: number;
  noteDuration?: NoteDuration;
  minScore?: number;
}

export interface NamedMelodyParams extends CommonParams {
  startNote?: number;
  endNote?: number;
  tempo?: number;
  minScore?: number;
}

export interface ZoneBelowParams extends CommonParams {
  boundaryNote: number;
  seconds: number;
  repeats?: number;
}

export interface ZoneAboveParams extends CommonParams {
  boundaryNote: number;
  seconds: number;
  repeats?: number;
}

export interface ZoneBetweenParams extends CommonParams {
  lowNote: number;
  highNote: number;
  seconds: number;
  repeats?: number;
}

export interface LipRollParams extends CommonParams {
  startNote: number;
  endNote: number;
  requiredPlays: number;
  scale?: BaseScale;
}

export interface FarinelliParams extends CommonParams {
  maxCount: number;
}

export interface SustainParams extends CommonParams {
  note: number;
  seconds: number;
  repeats?: number;
  toneShape?: ToneShape;
}

export interface LipRollSustainParams extends CommonParams {
  note: number;
  seconds: number;
  requiredPlays: number;
}

export interface HillSustainParams extends CommonParams {
  /** Single note or [low, high] pair for "between" mode. */
  note: number | [number, number];
  seconds: number;
  repeats?: number;
  direction: "up" | "down" | "between";
  toneShape?: ToneShape;
  displayNotes?: DisplayScale[];
}

// ── Helper functions ──────────────────────────────────────────────────────────

/** Returns a NoteTarget for a 1-indexed ChromaticDegree. Passes straight through. */
function toTarget(note: number): NoteTarget {
  return { kind: BandTargetKind.Index, i: note };
}

/**
 * Builds a chromatic display scale from lo to hi (inclusive).
 * Active notes get style "full"; all others get style "muted".
 */
function buildDisplayNotes(
  startNote: number,
  endNote: number,
  activeNotes: number[],
): DisplayScale[] {
  const lo = Math.min(startNote, endNote);
  const hi = Math.max(startNote, endNote);
  const active = new Set(activeNotes);
  const notes: DisplayNote[] = [];
  for (let i = lo; i <= hi; i++) {
    notes.push({
      target: toTarget(i),
      style: active.has(i) ? "full" : "muted",
    });
  }
  return [{ type: "chromatic", root: 1, notes }];
}

// ── ExerciseGenerator ─────────────────────────────────────────────────────────

export class ExerciseGenerator {
  /**
   * Interval exercise with shifting roots.
   * Roots arc from startNote → endNote → startNote. Each step is a separate
   * MelodyScale with its own root; events use relative positions 1 and chromaticDegree.
   */
  interval(params: IntervalParams): ExerciseConfigInput {
    const {
      title,
      subtitle,
      cardCue,
      instruction,
      introModal,
      completionModal,
      startNote,
      endNote,
      chromaticDegree,
      tempo = 80,
      noteDuration = NoteDuration.Half,
      minScore = 0,
    } = params;

    const lo = Math.min(startNote, endNote);
    const hi = Math.max(startNote, endNote);

    // Build root arc: lo → hi → lo
    const roots: number[] = [];
    for (let r = lo; r <= hi; r++) roots.push(r);
    for (let r = hi - 1; r > lo; r--) roots.push(r);
    roots.push(lo);

    const melody: MelodyScale[] = roots.map((root) => {
      const events: MelodyEvent[] = [
        {
          type: "play",
          targets: [toTarget(1), toTarget(chromaticDegree)],
          duration: NoteDuration.Quarter,
        },
        { type: "pause", duration: NoteDuration.Eighth },
        { type: "note", target: toTarget(1), duration: noteDuration },
        { type: "note", target: toTarget(chromaticDegree), duration: noteDuration },
        { type: "note", target: toTarget(chromaticDegree), duration: noteDuration },
      ];
      return { type: "chromatic" as const, root, events };
    });

    // Active notes span the full range: every root and its interval note
    const activeNotes: number[] = [];
    for (let r = lo; r <= hi; r++) {
      if (!activeNotes.includes(r)) activeNotes.push(r);
      const intervalNote = r + chromaticDegree - 1;
      if (!activeNotes.includes(intervalNote)) activeNotes.push(intervalNote);
    }

    return {
      title,
      subtitle,
      cardCue,
      instruction,
      introModal,
      completionModal,
      exerciseTypeId: "melody",
      tempo,
      melody,
      displayNotes: buildDisplayNotes(lo, hi + chromaticDegree - 1, activeNotes),
      minScore,
    };
  }

  /**
   * Scale exercise. Single MelodyScale ascending lo→hi then descending hi-1→lo.
   * Root = lo.
   */
  scale(params: ScaleParams): ExerciseConfigInput {
    const {
      title,
      subtitle,
      cardCue,
      instruction,
      introModal,
      completionModal,
      startNote,
      endNote,
      scaleType,
      tempo = 80,
      noteDuration = NoteDuration.Half,
      minScore = 0,
    } = params;

    const lo = Math.min(startNote, endNote);
    const hi = Math.max(startNote, endNote);

    const events: MelodyEvent[] = [];
    for (let i = lo; i <= hi; i++) {
      events.push({
        type: "note",
        target: toTarget(i),
        duration: noteDuration,
      });
    }
    for (let i = hi - 1; i >= lo; i--) {
      events.push({
        type: "note",
        target: toTarget(i),
        duration: noteDuration,
      });
    }

    const melody: MelodyScale[] = [{ type: scaleType, root: lo, events }];

    return {
      title,
      subtitle,
      cardCue,
      instruction,
      introModal,
      completionModal,
      exerciseTypeId: "melody",
      tempo,
      melody,
      displayNotes: buildDisplayNotes(
        lo,
        hi,
        Array.from({ length: hi - lo + 1 }, (_, k) => lo + k),
      ),
      minScore,
    };
  }

  /**
   * Scale degrees exercise. Single MelodyScale.
   * For each degree above root: root→degree→root pattern, then pause (Quarter).
   * Root = lo.
   */
  scaleDegrees(params: ScaleDegreeParams): ExerciseConfigInput {
    const {
      title,
      subtitle,
      cardCue,
      instruction,
      introModal,
      completionModal,
      startNote,
      endNote,
      scaleType = "major",
      tempo = 80,
      noteDuration = NoteDuration.Half,
      minScore = 0,
    } = params;

    const lo = Math.min(startNote, endNote);
    const hi = Math.max(startNote, endNote);

    const events: MelodyEvent[] = [];
    for (let degree = lo + 1; degree <= hi; degree++) {
      events.push({
        type: "note",
        target: toTarget(lo),
        duration: noteDuration,
      });
      events.push({
        type: "note",
        target: toTarget(degree),
        duration: noteDuration,
      });
      events.push({
        type: "note",
        target: toTarget(lo),
        duration: noteDuration,
      });
      events.push({ type: "pause", duration: NoteDuration.Quarter });
    }

    const melody: MelodyScale[] = [{ type: scaleType, root: lo, events }];

    return {
      title,
      subtitle,
      cardCue,
      instruction,
      introModal,
      completionModal,
      exerciseTypeId: "melody",
      tempo,
      melody,
      displayNotes: buildDisplayNotes(
        lo,
        hi,
        Array.from({ length: hi - lo + 1 }, (_, k) => lo + k),
      ),
      minScore,
    };
  }

  /** Perfect fifth interval exercise (chromaticDegree = 8, defaults startNote=4, endNote=-4). */
  fifth(params: NamedMelodyParams): ExerciseConfigInput {
    return this.interval({
      ...params,
      startNote: params.startNote ?? 4,
      endNote: params.endNote ?? -4,
      chromaticDegree: 8,
    });
  }

  /** Major second interval exercise (chromaticDegree = 3, defaults startNote=1, endNote=6). */
  majorSecond(params: NamedMelodyParams): ExerciseConfigInput {
    return this.interval({
      ...params,
      startNote: params.startNote ?? 1,
      endNote: params.endNote ?? 6,
      chromaticDegree: 3,
    });
  }

  /** Octave interval exercise (chromaticDegree = 13, defaults startNote=4, endNote=-4). */
  octave(params: NamedMelodyParams): ExerciseConfigInput {
    return this.interval({
      ...params,
      startNote: params.startNote ?? 4,
      endNote: params.endNote ?? -4,
      chromaticDegree: 13,
    });
  }

  /** Major scale exercise (scaleType = "major", defaults startNote=4, endNote=-4). */
  majorScale(params: NamedMelodyParams): ExerciseConfigInput {
    return this.scale({
      ...params,
      startNote: params.startNote ?? 4,
      endNote: params.endNote ?? -4,
      scaleType: "major",
    });
  }

  /** Minor scale exercise (scaleType = "minor", defaults startNote=4, endNote=-4). */
  minorScale(params: NamedMelodyParams): ExerciseConfigInput {
    return this.scale({
      ...params,
      startNote: params.startNote ?? 4,
      endNote: params.endNote ?? -4,
      scaleType: "minor",
    });
  }

  /** Pentatonic scale exercise (scaleType = "major pentatonic", defaults startNote=4, endNote=-4). */
  pentatonic(params: NamedMelodyParams): ExerciseConfigInput {
    return this.scale({
      ...params,
      startNote: params.startNote ?? 4,
      endNote: params.endNote ?? -4,
      scaleType: "major pentatonic",
    });
  }

  /**
   * Zone below exercise. Chromatic scale root 1.
   * Single Range target from: 1, to: boundaryNote, accept: "below".
   */
  zoneBelow(params: ZoneBelowParams): ExerciseConfigInput {
    const {
      title,
      subtitle,
      cardCue,
      instruction,
      introModal,
      completionModal,
      boundaryNote,
      seconds,
      repeats = 1,
    } = params;

    const target = {
      kind: BandTargetKind.Range as const,
      from: 1,
      to: boundaryNote,
      accept: "below" as const,
    };
    const notes = Array.from({ length: repeats }, () => ({ target, seconds }));

    return {
      title,
      subtitle,
      cardCue,
      instruction,
      introModal,
      completionModal,
      exerciseTypeId: "pitch-detection",
      scale: { type: "chromatic", root: 1 },
      toneShape: { kind: "wobble" },
      notes,
    };
  }

  /**
   * Zone above exercise. Chromatic scale root 1.
   * Range from: boundaryNote, to: -1, accept: "above".
   */
  zoneAbove(params: ZoneAboveParams): ExerciseConfigInput {
    const {
      title,
      subtitle,
      cardCue,
      instruction,
      introModal,
      completionModal,
      boundaryNote,
      seconds,
      repeats = 1,
    } = params;

    const target = {
      kind: BandTargetKind.Range as const,
      from: boundaryNote,
      to: -1,
      accept: "above" as const,
    };
    const notes = Array.from({ length: repeats }, () => ({ target, seconds }));

    return {
      title,
      subtitle,
      cardCue,
      instruction,
      introModal,
      completionModal,
      exerciseTypeId: "pitch-detection-hill",
      scale: { type: "chromatic", root: 1 },
      toneShape: { kind: "owl-hoot" },
      direction: "up",
      notes,
    };
  }

  /**
   * Zone between exercise. Chromatic scale root 1.
   * Range from: lowNote, to: highNote, accept: "within".
   */
  zoneBetween(params: ZoneBetweenParams): ExerciseConfigInput {
    const {
      title,
      subtitle,
      cardCue,
      instruction,
      introModal,
      completionModal,
      lowNote,
      highNote,
      seconds,
      repeats = 1,
    } = params;

    const target = {
      kind: BandTargetKind.Range as const,
      from: lowNote,
      to: highNote,
      accept: "within" as const,
    };
    const notes = Array.from({ length: repeats }, () => ({ target, seconds }));

    return {
      title,
      subtitle,
      cardCue,
      instruction,
      introModal,
      completionModal,
      exerciseTypeId: "pitch-detection",
      scale: { type: "chromatic", root: 1 },
      notes,
    };
  }

  /**
   * Lip roll tone-follow exercise.
   * Chromatic scale, major display notes (notes: []), slide toneShape from startNote to endNote.
   */
  lipRoll(params: LipRollParams): ExerciseConfigInput {
    const {
      title,
      subtitle,
      cardCue,
      instruction,
      introModal,
      completionModal,
      startNote,
      endNote,
      requiredPlays,
      scale = { type: "chromatic", root: 1 },
    } = params;
    const isMajor = scale.type === "major";
    return {
      title,
      subtitle,
      cardCue,
      instruction,
      introModal,
      completionModal,
      exerciseTypeId: "tone-follow",
      scale,
      displayNotes: isMajor ? undefined : [{ type: "major", root: 1, notes: [] }],
      toneShape: {
        kind: "slide",
        from: toTarget(startNote),
        to: toTarget(endNote),
      },
      requiredPlays,
    };
  }

  /** Farinelli breathwork exercise. */
  farinelli(params: FarinelliParams): ExerciseConfigInput {
    const {
      title,
      subtitle,
      cardCue,
      instruction,
      introModal,
      completionModal,
      maxCount,
    } = params;
    return {
      title,
      subtitle,
      cardCue,
      instruction,
      introModal,
      completionModal,
      exerciseTypeId: "breathwork-farinelli",
      maxCount,
    };
  }

  /**
   * Sustain exercise. Pitch-detection with repeated holds on a single note.
   * Chromatic scale rooted at `note`.
   */
  sustain(params: SustainParams): ExerciseConfigInput {
    const {
      title,
      subtitle,
      cardCue,
      instruction,
      introModal,
      completionModal,
      note,
      seconds,
      repeats = 3,
      toneShape,
    } = params;

    const notes = Array.from({ length: repeats }, () => ({
      target: toTarget(1),
      seconds,
    }));

    return {
      title,
      subtitle,
      cardCue,
      instruction,
      introModal,
      completionModal,
      exerciseTypeId: "pitch-detection",
      scale: { type: "chromatic", root: note },
      ...(toneShape && { toneShape }),
      notes,
    };
  }

  /** Hill sustain exercise. Pitch-detection-hill with sustained note or note pair. */
  hillSustain(params: HillSustainParams): ExerciseConfigInput {
    const {
      title,
      subtitle,
      cardCue,
      instruction,
      introModal,
      completionModal,
      note,
      seconds,
      repeats = 3,
      direction,
      toneShape,
      displayNotes,
    } = params;

    const isRange = Array.isArray(note);
    const root = isRange ? note[0] : note;

    let notes: SustainNoteConfig[];
    if (isRange) {
      // Range target: user must sing between the two notes
      const rangeTarget: NoteTarget = {
        kind: BandTargetKind.Range,
        from: 1,
        to: note[1] - note[0] + 1,
        accept: "within",
      };
      notes = Array.from({ length: repeats }, () => ({ target: rangeTarget, seconds }));
    } else {
      // Directional target: accept below for "down", above for "up"
      const accept = direction === "down" ? "below" as const : direction === "up" ? "above" as const : undefined;
      const target: NoteTarget = accept
        ? { kind: BandTargetKind.Range, from: 1, to: 1, accept }
        : { kind: BandTargetKind.Index, i: 1 };
      notes = Array.from({ length: repeats }, () => ({ target, seconds }));
    }

    return {
      title,
      subtitle,
      cardCue,
      instruction,
      introModal,
      completionModal,
      exerciseTypeId: "pitch-detection-hill",
      scale: { type: "chromatic", root },
      toneShape,
      direction,
      displayNotes,
      notes,
    };
  }

  /**
   * Lip-roll sustain exercise. Tone-follow with a sustained note shape.
   * Chromatic scale rooted at `note`.
   */
  lipRollSustain(params: LipRollSustainParams): ExerciseConfigInput {
    const {
      title,
      subtitle,
      cardCue,
      instruction,
      introModal,
      completionModal,
      note,
      seconds,
      requiredPlays,
    } = params;

    return {
      title,
      subtitle,
      cardCue,
      instruction,
      introModal,
      completionModal,
      exerciseTypeId: "tone-follow",
      scale: { type: "chromatic", root: note },
      toneShape: { kind: "sustain", target: toTarget(1), seconds },
      displayNotes: [],
      requiredPlays,
    };
  }
}

export { buildDisplayNotes };
