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
}

export interface ZoneAboveParams extends CommonParams {
  boundaryNote: number;
  seconds: number;
}

export interface ZoneBetweenParams extends CommonParams {
  lowNote: number;
  highNote: number;
  seconds: number;
}

export interface LipRollParams extends CommonParams {
  startNote: number;
  endNote: number;
  requiredPlays: number;
}

export interface FarinelliParams extends CommonParams {
  maxCount: number;
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
   * Interval exercise. For each root stepping from lo to hi-chromaticDegree+1:
   * play chord (root+interval, Quarter), pause (Eighth), sing root (noteDuration), sing interval (noteDuration).
   * Each step is a separate MelodyScale with type "chromatic" and root at lo.
   */
  interval(params: IntervalParams): JourneyExerciseInput {
    const {
      title, subtitle, cardCue, instruction, introModal, completionModal,
      startNote, endNote, chromaticDegree,
      tempo = 80,
      noteDuration = NoteDuration.Half,
      minScore = 0,
    } = params;

    const lo = Math.min(startNote, endNote);
    const hi = Math.max(startNote, endNote);

    const melody: MelodyScale[] = [];
    const activeNotes: number[] = [];
    for (let root = lo; root <= hi - chromaticDegree + 1; root++) {
      const intervalNote = root + chromaticDegree - 1;
      if (!activeNotes.includes(root)) activeNotes.push(root);
      if (!activeNotes.includes(intervalNote)) activeNotes.push(intervalNote);
      const events: MelodyEvent[] = [
        {
          type: "play",
          targets: [toTarget(root), toTarget(intervalNote)],
          duration: NoteDuration.Quarter,
        },
        { type: "pause", duration: NoteDuration.Eighth },
        { type: "note", target: toTarget(root), duration: noteDuration },
        { type: "note", target: toTarget(intervalNote), duration: noteDuration },
      ];
      melody.push({ type: "chromatic", root: lo, events });
    }

    return {
      title, subtitle, cardCue, instruction, introModal, completionModal,
      exerciseTypeId: "melody",
      tempo,
      melody,
      displayNotes: buildDisplayNotes(lo, hi, activeNotes),
      minScore,
    };
  }

  /**
   * Scale exercise. Single MelodyScale ascending lo→hi then descending hi-1→lo.
   * Root = lo.
   */
  scale(params: ScaleParams): JourneyExerciseInput {
    const {
      title, subtitle, cardCue, instruction, introModal, completionModal,
      startNote, endNote, scaleType,
      tempo = 80,
      noteDuration = NoteDuration.Half,
      minScore = 0,
    } = params;

    const lo = Math.min(startNote, endNote);
    const hi = Math.max(startNote, endNote);

    const events: MelodyEvent[] = [];
    for (let i = lo; i <= hi; i++) {
      events.push({ type: "note", target: toTarget(i), duration: noteDuration });
    }
    for (let i = hi - 1; i >= lo; i--) {
      events.push({ type: "note", target: toTarget(i), duration: noteDuration });
    }

    const melody: MelodyScale[] = [{ type: scaleType, root: lo, events }];

    return {
      title, subtitle, cardCue, instruction, introModal, completionModal,
      exerciseTypeId: "melody",
      tempo,
      melody,
      displayNotes: buildDisplayNotes(lo, hi, Array.from({ length: hi - lo + 1 }, (_, k) => lo + k)),
      minScore,
    };
  }

  /**
   * Scale degrees exercise. Single MelodyScale.
   * For each degree above root: root→degree→root pattern, then pause (Quarter).
   * Root = lo.
   */
  scaleDegrees(params: ScaleDegreeParams): JourneyExerciseInput {
    const {
      title, subtitle, cardCue, instruction, introModal, completionModal,
      startNote, endNote,
      scaleType = "major",
      tempo = 80,
      noteDuration = NoteDuration.Half,
      minScore = 0,
    } = params;

    const lo = Math.min(startNote, endNote);
    const hi = Math.max(startNote, endNote);

    const events: MelodyEvent[] = [];
    for (let degree = lo + 1; degree <= hi; degree++) {
      events.push({ type: "note", target: toTarget(lo), duration: noteDuration });
      events.push({ type: "note", target: toTarget(degree), duration: noteDuration });
      events.push({ type: "note", target: toTarget(lo), duration: noteDuration });
      events.push({ type: "pause", duration: NoteDuration.Quarter });
    }

    const melody: MelodyScale[] = [{ type: scaleType, root: lo, events }];

    return {
      title, subtitle, cardCue, instruction, introModal, completionModal,
      exerciseTypeId: "melody",
      tempo,
      melody,
      displayNotes: buildDisplayNotes(lo, hi, Array.from({ length: hi - lo + 1 }, (_, k) => lo + k)),
      minScore,
    };
  }

  /** Perfect fifth interval exercise (chromaticDegree = 8, defaults startNote=4, endNote=-4). */
  fifth(params: NamedMelodyParams): JourneyExerciseInput {
    return this.interval({
      ...params,
      startNote: params.startNote ?? 4,
      endNote: params.endNote ?? -4,
      chromaticDegree: 8,
    });
  }

  /** Octave interval exercise (chromaticDegree = 13, defaults startNote=4, endNote=-4). */
  octave(params: NamedMelodyParams): JourneyExerciseInput {
    return this.interval({
      ...params,
      startNote: params.startNote ?? 4,
      endNote: params.endNote ?? -4,
      chromaticDegree: 13,
    });
  }

  /** Major scale exercise (scaleType = "major", defaults startNote=4, endNote=-4). */
  majorScale(params: NamedMelodyParams): JourneyExerciseInput {
    return this.scale({
      ...params,
      startNote: params.startNote ?? 4,
      endNote: params.endNote ?? -4,
      scaleType: "major",
    });
  }

  /** Minor scale exercise (scaleType = "minor", defaults startNote=4, endNote=-4). */
  minorScale(params: NamedMelodyParams): JourneyExerciseInput {
    return this.scale({
      ...params,
      startNote: params.startNote ?? 4,
      endNote: params.endNote ?? -4,
      scaleType: "minor",
    });
  }

  /** Pentatonic scale exercise (scaleType = "major pentatonic", defaults startNote=4, endNote=-4). */
  pentatonic(params: NamedMelodyParams): JourneyExerciseInput {
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
  zoneBelow(params: ZoneBelowParams): JourneyExerciseInput {
    const { title, subtitle, cardCue, instruction, introModal, completionModal, boundaryNote, seconds } = params;
    return {
      title, subtitle, cardCue, instruction, introModal, completionModal,
      exerciseTypeId: "pitch-detection",
      scale: { type: "chromatic", root: 1 },
      notes: [
        {
          target: { kind: BandTargetKind.Range, from: 1, to: boundaryNote, accept: "below" },
          seconds,
        },
      ],
    };
  }

  /**
   * Zone above exercise. Chromatic scale root 1.
   * Range from: boundaryNote, to: -1, accept: "above".
   */
  zoneAbove(params: ZoneAboveParams): JourneyExerciseInput {
    const { title, subtitle, cardCue, instruction, introModal, completionModal, boundaryNote, seconds } = params;
    return {
      title, subtitle, cardCue, instruction, introModal, completionModal,
      exerciseTypeId: "pitch-detection",
      scale: { type: "chromatic", root: 1 },
      notes: [
        {
          target: { kind: BandTargetKind.Range, from: boundaryNote, to: -1, accept: "above" },
          seconds,
        },
      ],
    };
  }

  /**
   * Zone between exercise. Chromatic scale root 1.
   * Range from: lowNote, to: highNote, accept: "within".
   */
  zoneBetween(params: ZoneBetweenParams): JourneyExerciseInput {
    const { title, subtitle, cardCue, instruction, introModal, completionModal, lowNote, highNote, seconds } = params;
    return {
      title, subtitle, cardCue, instruction, introModal, completionModal,
      exerciseTypeId: "pitch-detection",
      scale: { type: "chromatic", root: 1 },
      notes: [
        {
          target: { kind: BandTargetKind.Range, from: lowNote, to: highNote, accept: "within" },
          seconds,
        },
      ],
    };
  }

  /**
   * Lip roll tone-follow exercise.
   * Chromatic scale, major display notes (notes: []), slide toneShape from startNote to endNote.
   */
  lipRoll(params: LipRollParams): JourneyExerciseInput {
    const { title, subtitle, cardCue, instruction, introModal, completionModal, startNote, endNote, requiredPlays } = params;
    return {
      title, subtitle, cardCue, instruction, introModal, completionModal,
      exerciseTypeId: "tone-follow",
      scale: { type: "chromatic", root: 1 },
      displayNotes: [{ type: "major", root: 1, notes: [] }],
      toneShape: {
        kind: "slide",
        from: toTarget(startNote),
        to: toTarget(endNote),
      },
      requiredPlays,
    };
  }

  /** Farinelli breathwork exercise. */
  farinelli(params: FarinelliParams): JourneyExerciseInput {
    const { title, subtitle, cardCue, instruction, introModal, completionModal, maxCount } = params;
    return {
      title, subtitle, cardCue, instruction, introModal, completionModal,
      exerciseTypeId: "breathwork-farinelli",
      maxCount,
    };
  }
}

export { buildDisplayNotes };
