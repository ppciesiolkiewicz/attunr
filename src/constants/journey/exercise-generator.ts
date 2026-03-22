import type {
  ExerciseConfigInput,
  ModalConfig,
  ContentElement,
  NoteTarget,
  SustainNoteConfig,
  BaseScale,
  MelodyScale,
  MelodyEvent,
  DisplayScale,
  DisplayNote,
  ToneShape,
  TimedCue,
  VoiceConfig,
  LearnVoiceSegment,
} from "./types";
import { BandTargetKind, NoteDuration } from "./types";

// ── IntroModalGenerator ───────────────────────────────────────────────────────

/** Split instruction text (separated by \n\n) into paragraph elements. First is primary, rest secondary. */
function instructionParagraphs(instruction?: string): ContentElement[] {
  if (!instruction) return [];
  return instruction
    .split("\n\n")
    .filter((s) => s.trim())
    .map((text, i) => ({
      type: "paragraph" as const,
      text,
      variant: i === 0 ? undefined : ("secondary" as const),
    }));
}

interface ModalInstruction {
  /** 4-section intro text (do → feel → reason → reassurance), separated by \n\n. */
  instruction?: string;
  /** Tips shown in the intro modal tip-list. Caller must provide — no hardcoded defaults. */
  tips: string[];
}

/**
 * Generates intro modal configs. Returns ModalConfig with empty title —
 * resolveIntroModal copies the exercise title in automatically.
 *
 * Each method accepts an `instruction` string containing the 4-section
 * intro text (do → feel → reason → reassurance), separated by \n\n.
 */

export class IntroModalGenerator {
  farinelli(p: {
    title: string;
    maxCount: number;
    instruction: string;
    tips: string[];
  }): ModalConfig {
    const firstParagraph = p.instruction.split("\n\n")[0];
    return {
      title: p.title,
      subtitle: `Complete ${p.maxCount} cycles — each a bit longer than the last`,
      elements: [
        {
          type: "warning",
          text: "If you have heart or respiratory conditions, or are pregnant, check with your doctor first. Stop immediately if you feel dizzy, lightheaded, or unwell at any time.",
        },
        { type: "separator" },
        { type: "paragraph", text: firstParagraph },
        { type: "video" },
        { type: "tip-list", title: "Key tips", tips: [...p.tips] },
      ],
    };
  }

  melody(p: ModalInstruction & { minScore: number }): ModalConfig {
    return {
      title: "",
      subtitle:
        p.minScore > 0
          ? `Sing along — match ${p.minScore}% to continue`
          : "Sing along — just follow the notes",
      elements: [
        { type: "video" },
        ...instructionParagraphs(p.instruction),
        {
          type: "tip-list",
          title: "Key tips",
          tips: [...p.tips],
        },
        { type: "headphones-notice" },
      ],
    };
  }

  lipRoll(p: ModalInstruction & { requiredPlays: number }): ModalConfig {
    return {
      title: "",
      subtitle: `Play the tone ${p.requiredPlays} times and lip roll along`,
      elements: [
        { type: "video" },
        ...instructionParagraphs(p.instruction),
        {
          type: "tip-list",
          title: "Key tips",
          tips: [...p.tips],
        },
        { type: "headphones-notice" },
      ],
    };
  }

  volumeDetection(
    p: ModalInstruction & { targetSeconds: number },
  ): ModalConfig {
    return {
      title: "",
      subtitle: `Make sound for ${p.targetSeconds} seconds`,
      elements: [
        { type: "video" },
        ...instructionParagraphs(p.instruction),
        {
          type: "tip-list",
          title: "Key tips",
          tips: [...p.tips],
        },
      ],
    };
  }

  rhythm(p: ModalInstruction & { minScore: number }): ModalConfig {
    return {
      title: "",
      subtitle: `Tap along — match ${p.minScore}% to continue`,
      elements: [
        { type: "video" },
        ...instructionParagraphs(p.instruction),
        {
          type: "tip-list",
          title: "Key tips",
          tips: [...p.tips],
        },
      ],
    };
  }

  hill(p: ModalInstruction & { seconds: number; reps?: number }): ModalConfig {
    const reps = p.reps ?? 3;
    return {
      title: "",
      subtitle: `${p.seconds}s × ${reps} reps`,
      elements: [
        { type: "video" },
        ...instructionParagraphs(p.instruction),
        {
          type: "tip-list",
          title: "Key tips",
          tips: [...p.tips],
        },
      ],
    };
  }

  sustain(p: ModalInstruction & { seconds: number }): ModalConfig {
    return {
      title: "",
      subtitle: `Hold the tone in tune for ${p.seconds} seconds`,
      elements: [
        { type: "video" },
        ...instructionParagraphs(p.instruction),
        {
          type: "tip-list",
          title: "Key tips",
          tips: [...p.tips],
        },
        { type: "headphones-notice" },
      ],
    };
  }

  sustainSequence(p: ModalInstruction & { seconds: number }): ModalConfig {
    return {
      title: "",
      subtitle: `Sing each tone in sequence, ${p.seconds} seconds each`,
      elements: [
        { type: "video" },
        ...instructionParagraphs(p.instruction),
        {
          type: "tip-list",
          title: "Key tips",
          tips: [...p.tips],
        },
        { type: "headphones-notice" },
      ],
    };
  }

  slide(p: ModalInstruction): ModalConfig {
    return {
      title: "",
      subtitle: "Slide smoothly through the range two or three times",
      elements: [
        { type: "video" },
        ...instructionParagraphs(p.instruction),
        {
          type: "tip-list",
          title: "Key tips",
          tips: [...p.tips],
        },
        { type: "headphones-notice" },
      ],
    };
  }

  lipRollSustain(p: ModalInstruction & { requiredPlays: number }): ModalConfig {
    return {
      title: "",
      subtitle: `Play the tone ${p.requiredPlays} times and lip roll along`,
      elements: [
        { type: "video" },
        ...instructionParagraphs(p.instruction),
        {
          type: "tip-list",
          title: "Key tips",
          tips: [...p.tips],
        },
        { type: "headphones-notice" },
      ],
    };
  }
}

// ── Param interfaces ──────────────────────────────────────────────────────────

export interface CommonParams {
  slug: string;
  title: string;
  headerSubtitle?: string;
  cardSubtitle?: string;
  instruction: string;
  introModal?: ModalConfig;
  completionModal?: ModalConfig;
}

export interface IntervalParams extends CommonParams {
  startNote: number;
  endNote: number;
  chromaticDegree: number;
  tempo?: number;
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
  repeats: number;
}

export interface ZoneAboveParams extends CommonParams {
  boundaryNote: number;
  seconds: number;
  repeats: number;
}

export interface ZoneBetweenParams extends CommonParams {
  lowNote: number;
  highNote: number;
  seconds: number;
  repeats: number;
}

export interface LipRollParams extends CommonParams {
  startNote: number;
  endNote: number;
  requiredPlays: number;
  scale?: BaseScale;
}

export interface FarinelliParams extends Omit<CommonParams, "instruction"> {
  maxCount: number;
  voice?: VoiceConfig;
}

export interface FarinelliVoiceDrivenParams extends Omit<CommonParams, "instruction"> {
  maxCount: number;
  voiceBaseUrl: string;
}

export interface LearnVoiceDrivenParams {
  slug: string;
  title: string;
  cardSubtitle?: string;
  voiceBaseUrl: string;
  segments: LearnVoiceSegment[];
  completionModal?: ModalConfig;
}

export interface VolumeDetectionParams extends CommonParams {
  targetSeconds: number;
  reps?: number;
  cues: TimedCue[];
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
  repeats: number;
  direction: "up" | "down" | "between";
  toneShape?: ToneShape;
  displayNotes?: DisplayScale[];
  /** Override the default chromatic scale (e.g. for even-7 chakra exercises). */
  scale?: BaseScale;
}

export interface TimeBasedParams extends CommonParams {
  cues: TimedCue[];
  tips?: string[];
}

// ── Helper functions ──────────────────────────────────────────────────────────

/** Resolve intro modal — copy exercise title when the modal has an empty placeholder. */
function resolveIntroModal(params: CommonParams): ModalConfig | undefined {
  const modal = params.introModal;
  if (!modal) return undefined;
  if (modal.title) return modal;
  return { ...modal, title: params.title };
}

/** Extracts the common fields shared by all exercise types from params. */
function pickCommon(params: CommonParams) {
  return {
    slug: params.slug,
    title: params.title,
    headerSubtitle: params.headerSubtitle,
    cardSubtitle: params.cardSubtitle,
    instruction: params.instruction,
    introModal: resolveIntroModal(params),
    completionModal: params.completionModal,
  };
}

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

    // Approach chord: I-chord one semitone below current root
    const approachChord: MelodyEvent = {
      type: "play",
      targets: [toTarget(0), toTarget(4), toTarget(7)],
      duration: NoteDuration.Quarter,
    };

    // I-chord on current root
    const rootChord: MelodyEvent = {
      type: "play",
      targets: [toTarget(1), toTarget(5), toTarget(8)],
      duration: NoteDuration.Quarter,
    };

    // Singing pattern: root (Half) → degree (Quarter) → root (Quarter)
    const singingEvents: MelodyEvent[] = [
      { type: "note", target: toTarget(1), duration: NoteDuration.Half },
      {
        type: "note",
        target: toTarget(chromaticDegree),
        duration: NoteDuration.Quarter,
      },
      { type: "note", target: toTarget(1), duration: NoteDuration.Quarter },
    ];

    // All roots: approach chord + I-chord + singing
    const events: MelodyEvent[] = [
      approachChord,
      rootChord,
      ...singingEvents,
    ];

    const melody: MelodyScale[] = roots.map((root) => ({
      type: "chromatic" as const,
      root,
      events,
    }));

    // Active notes: every root, its interval note, chord notes, and approach chord notes
    const activeNotes: number[] = [];
    for (let r = lo; r <= hi; r++) {
      // Root chord offsets (0, +4, +7) and interval degree
      for (const offset of [0, chromaticDegree - 1, 4, 7]) {
        const note = r + offset;
        if (!activeNotes.includes(note)) activeNotes.push(note);
      }
      // Approach chord offsets (-1, +3, +6) — chord one step below root
      for (const offset of [-1, 3, 6]) {
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

  /**
   * Scale exercise. Single MelodyScale ascending lo→hi then descending hi-1→lo.
   * Root = lo.
   */
  scale(params: ScaleParams): ExerciseConfigInput {
    const {
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
      ...pickCommon(params),
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
      ...pickCommon(params),
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
    const { boundaryNote, seconds, repeats } = params;

    const target = {
      kind: BandTargetKind.Range as const,
      from: 1,
      to: boundaryNote,
      accept: "below" as const,
    };
    const notes = Array.from({ length: repeats }, () => ({ target, seconds }));

    return {
      ...pickCommon(params),
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
    const { boundaryNote, seconds, repeats } = params;

    const target = {
      kind: BandTargetKind.Range as const,
      from: boundaryNote,
      to: -1,
      accept: "above" as const,
    };
    const notes = Array.from({ length: repeats }, () => ({ target, seconds }));

    return {
      ...pickCommon(params),
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
    const { lowNote, highNote, seconds, repeats } = params;

    const target = {
      kind: BandTargetKind.Range as const,
      from: lowNote,
      to: highNote,
      accept: "within" as const,
    };
    const notes = Array.from({ length: repeats }, () => ({ target, seconds }));

    return {
      ...pickCommon(params),
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
      startNote,
      endNote,
      requiredPlays,
      scale = { type: "chromatic", root: 1 },
    } = params;
    return {
      ...pickCommon(params),
      exerciseTypeId: "tone-follow",
      scale,
      displayNotes: [{ type: "major", root: 1, notes: [] }],
      toneShape: {
        kind: "slide",
        from: toTarget(startNote),
        to: toTarget(endNote),
      },
      requiredPlays,
    };
  }

  /** Volume detection exercise with timed cues. */
  volumeDetection(params: VolumeDetectionParams): ExerciseConfigInput {
    const { targetSeconds, reps, cues } = params;
    return {
      ...pickCommon(params),
      exerciseTypeId: "volume-detection",
      targetSeconds,
      ...(reps != null && { reps }),
      cues,
    };
  }

  /** Farinelli breathwork exercise. Instruction is hardcoded — the component has its own built-in guidance. */
  farinelli(params: FarinelliParams): ExerciseConfigInput {
    const {
      slug,
      title,
      headerSubtitle,
      cardSubtitle,
      introModal,
      completionModal,
      maxCount,
      voice,
    } = params;
    return {
      slug,
      title,
      headerSubtitle,
      cardSubtitle,
      instruction: "",
      introModal: introModal?.title
        ? introModal
        : introModal
          ? { ...introModal, title }
          : undefined,
      completionModal,
      exerciseTypeId: "breathwork-farinelli",
      maxCount,
      voice,
    };
  }

  /** Voice-driven Farinelli — audio segments drive the exercise UI. */
  farinelliVoiceDriven(params: FarinelliVoiceDrivenParams): ExerciseConfigInput {
    const {
      slug,
      title,
      headerSubtitle,
      cardSubtitle,
      introModal,
      completionModal,
      maxCount,
      voiceBaseUrl,
    } = params;
    return {
      slug,
      title,
      headerSubtitle,
      cardSubtitle,
      instruction: "",
      introModal: introModal?.title
        ? introModal
        : introModal
          ? { ...introModal, title }
          : undefined,
      completionModal,
      exerciseTypeId: "farinelli-voice-driven",
      maxCount,
      voiceBaseUrl,
    };
  }

  /** Voice-narrated learn — text accumulates on screen as words are spoken. */
  learnVoiceDriven(params: LearnVoiceDrivenParams): ExerciseConfigInput {
    const { slug, title, cardSubtitle, voiceBaseUrl, segments, completionModal } = params;
    return {
      slug,
      title,
      cardSubtitle,
      completionModal,
      exerciseTypeId: "learn-voice-driven",
      voiceBaseUrl,
      segments,
    };
  }

  /** Hill sustain exercise. Pitch-detection-hill with sustained note or note pair. */
  hillSustain(params: HillSustainParams): ExerciseConfigInput {
    const {
      note,
      seconds,
      repeats,
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
        from: note[0],
        to: note[1],
        accept: "within",
      };
      notes = Array.from({ length: repeats }, () => ({
        target: rangeTarget,
        seconds,
      }));
    } else {
      // Directional target: accept below for "down", above for "up"
      const accept =
        direction === "down"
          ? ("below" as const)
          : direction === "up"
            ? ("above" as const)
            : undefined;
      const target: NoteTarget = accept
        ? { kind: BandTargetKind.Range, from: root, to: root, accept }
        : { kind: BandTargetKind.Index, i: root };
      notes = Array.from({ length: repeats }, () => ({ target, seconds }));
    }

    return {
      ...pickCommon(params),
      exerciseTypeId: "pitch-detection-hill",
      scale: params.scale ?? { type: "chromatic", root },
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
    const { note, seconds, requiredPlays } = params;

    // Show 5 chromatic notes centered on the target: 2 below, target, 2 above.
    // Root the display scale 2 semitones below so the target lands at index 3.
    const displayRoot = note - 2;
    const contextNotes: DisplayNote[] = [];
    for (let i = 1; i <= 5; i++) {
      contextNotes.push({
        target: toTarget(i),
        style: i === 3 ? "full" : "muted",
      });
    }

    return {
      ...pickCommon(params),
      exerciseTypeId: "tone-follow",
      scale: { type: "chromatic", root: note },
      toneShape: { kind: "sustain", target: toTarget(1), seconds },
      displayNotes: [{ type: "chromatic", root: displayRoot, notes: contextNotes }],
      requiredPlays,
    };
  }

  /** Time-based exercise — flat cue sequence, no mic. */
  timeBased(params: TimeBasedParams): ExerciseConfigInput {
    const { cues, tips } = params;
    return {
      ...pickCommon(params),
      exerciseTypeId: "time-based",
      cues,
      ...(tips != null && { tips }),
    };
  }
}

export { buildDisplayNotes };

/** Repeat an array N times into a flat array. */
export function repeat<T>(items: T[], times: number): T[] {
  return Array.from({ length: times }, () => items).flat();
}
