import { Scale } from "./scale";
import type { ColoredNote, VocalRange } from "@/lib/VocalRange";
import type {
  ExerciseConfig,
  PitchDetectionConfig,
  PitchDetectionSlideConfig,
  ToneFollowConfig,
  MelodyConfig,
  RhythmConfig,
  DisplayNote,
  ToneShape,
} from "@/constants/journey/types";

// ── Resolved types ────────────────────────────────────────────────────────────

interface ResolvedExerciseBase {
  exerciseTypeId: string;
  displayNotes: ColoredNote[];
  highlightIds: string[];
}

export interface ResolvedPitchTarget {
  note: ColoredNote;
  seconds: number;
  accept?: "within" | "below" | "above";
  rangeNotes?: ColoredNote[];
}

export interface ResolvedPitchDetection extends ResolvedExerciseBase {
  exerciseTypeId: "pitch-detection";
  targets: ResolvedPitchTarget[];
  toneShape: ToneShape;
}

export interface ResolvedPitchDetectionSlide extends ResolvedExerciseBase {
  exerciseTypeId: "pitch-detection-slide";
  from: ColoredNote;
  to: ColoredNote;
}

export interface ResolvedToneFollow extends ResolvedExerciseBase {
  exerciseTypeId: "tone-follow";
  toneShape:
    | { kind: "slide"; from: ColoredNote; to: ColoredNote }
    | { kind: "sustain"; note: ColoredNote; seconds: number };
  requiredPlays: number;
}

export interface ResolvedTimelineEntry {
  note: ColoredNote;
  startMs: number;
  durationMs: number;
  silent?: boolean;
  audioOnly?: boolean;
}

export interface ResolvedMelody extends ResolvedExerciseBase {
  exerciseTypeId: "melody";
  tempo: number;
  minScore: number;
  timeline: ResolvedTimelineEntry[];
  totalDurationMs: number;
}

export interface ResolvedBeat {
  startMs: number;
  durationMs: number;
}

export interface ResolvedRhythm extends ResolvedExerciseBase {
  exerciseTypeId: "rhythm";
  tempo: number;
  metronome: boolean;
  minScore: number;
  beats: ResolvedBeat[];
  totalDurationMs: number;
}

export type ResolvedExercise =
  | ResolvedPitchDetection
  | ResolvedPitchDetectionSlide
  | ResolvedToneFollow
  | ResolvedMelody
  | ResolvedRhythm;

// ── Helpers ───────────────────────────────────────────────────────────────────

function computeDisplayRange(
  exerciseColoredNotes: ColoredNote[],
  allNotes: ColoredNote[],
): ColoredNote[] {
  if (exerciseColoredNotes.length <= 1) return exerciseColoredNotes;
  const indices = exerciseColoredNotes
    .map((n) => allNotes.findIndex((cn) => cn.id === n.id))
    .filter((i) => i >= 0);
  if (indices.length === 0) return exerciseColoredNotes;
  const minIdx = Math.max(0, Math.min(...indices) - 1);
  const maxIdx = Math.min(allNotes.length - 1, Math.max(...indices) + 1);
  return allNotes.slice(minIdx, maxIdx + 1);
}

function durationToMs(duration: number, tempo: number): number {
  return (duration / 4) * (60 / tempo) * 1000;
}

// ── Resolvers ─────────────────────────────────────────────────────────────────

function resolvePitchDetection(
  exercise: PitchDetectionConfig,
  vocalRange: VocalRange,
): ResolvedPitchDetection {
  const scale = new Scale(exercise.scale, vocalRange);
  const allNotes = vocalRange.allNotes;

  const targets: ResolvedPitchTarget[] = [];
  for (const n of exercise.notes) {
    const resolved = scale.resolve(n.target);
    const colored = resolved[0] ? vocalRange.findNote(resolved[0].midi) : null;
    if (!colored) continue;
    const target: ResolvedPitchTarget = { note: colored, seconds: n.seconds };
    if (n.target.kind === "range") {
      target.accept = n.target.accept ?? "within";
      target.rangeNotes = resolved
        .map((r) => vocalRange.findNote(r.midi))
        .filter((c): c is ColoredNote => c !== null);
    }
    targets.push(target);
  }

  const exerciseColoredNotes = targets.map((t) => t.note);
  const displayNotes = computeDisplayRange(exerciseColoredNotes, allNotes);
  const highlightIds = exerciseColoredNotes.map((n) => n.id);

  return { exerciseTypeId: "pitch-detection", targets, displayNotes, highlightIds, toneShape: exercise.toneShape ?? { kind: "sustain" } };
}

function resolvePitchDetectionSlide(
  exercise: PitchDetectionSlideConfig,
  vocalRange: VocalRange,
): ResolvedPitchDetectionSlide {
  const scale = new Scale(exercise.scale, vocalRange);
  const allNotes = vocalRange.allNotes;

  const fromResolved = scale.resolve(exercise.notes[0].from);
  const toResolved = scale.resolve(exercise.notes[0].to);
  const from = fromResolved[0] ? vocalRange.findNote(fromResolved[0].midi) : null;
  const to = toResolved[0] ? vocalRange.findNote(toResolved[0].midi) : null;

  if (!from || !to) {
    return {
      exerciseTypeId: "pitch-detection-slide",
      from: allNotes[0],
      to: allNotes[allNotes.length - 1],
      displayNotes: allNotes.slice(0, 3),
      highlightIds: [],
    };
  }

  // Display: all notes between from and to (±1 neighbor)
  const fromIdx = allNotes.findIndex((n) => n.id === from.id);
  const toIdx = allNotes.findIndex((n) => n.id === to.id);
  const lo = Math.min(fromIdx, toIdx);
  const hi = Math.max(fromIdx, toIdx);
  const displayNotes = computeDisplayRange(
    allNotes.slice(lo, hi + 1),
    allNotes,
  );
  const highlightIds = [from.id, to.id];

  return { exerciseTypeId: "pitch-detection-slide", from, to, displayNotes, highlightIds };
}

function resolveToneFollow(
  exercise: ToneFollowConfig,
  vocalRange: VocalRange,
): ResolvedToneFollow {
  const scale = new Scale(exercise.scale, vocalRange);
  const allNotes = vocalRange.allNotes;

  let toneShape: ResolvedToneFollow["toneShape"];
  let exerciseColoredNotes: ColoredNote[];

  if (exercise.toneShape.kind === "sustain") {
    const resolved = scale.resolve(exercise.toneShape.target);
    const note = (resolved[0] ? vocalRange.findNote(resolved[0].midi) : null) ?? allNotes[0];
    toneShape = { kind: "sustain", note, seconds: exercise.toneShape.seconds };
    exerciseColoredNotes = [note];
  } else {
    const fromResolved = scale.resolve(exercise.toneShape.from);
    const toResolved = scale.resolve(exercise.toneShape.to);
    const from = (fromResolved[0] ? vocalRange.findNote(fromResolved[0].midi) : null) ?? allNotes[0];
    const to = (toResolved[0] ? vocalRange.findNote(toResolved[0].midi) : null) ?? allNotes[allNotes.length - 1];

    toneShape = { kind: "slide", from, to };

    // All notes between from and to
    const fromIdx = allNotes.findIndex((n) => n.id === from.id);
    const toIdx = allNotes.findIndex((n) => n.id === to.id);
    const lo = Math.min(fromIdx, toIdx);
    const hi = Math.max(fromIdx, toIdx);
    exerciseColoredNotes = allNotes.slice(lo, hi + 1);
  }

  const displayNotes = computeDisplayRange(exerciseColoredNotes, allNotes);

  // Highlight logic: if displayNotes config exists, use display scale
  let highlightIds: string[];
  if (exercise.displayNotes && exercise.displayNotes.length > 0) {
    const ds = exercise.displayNotes[0];
    const dsScale = new Scale({ type: ds.type, root: ds.root }, vocalRange);
    let displayScaleNotes;
    if (ds.notes.length === 0) {
      displayScaleNotes = dsScale.notes;
    } else {
      displayScaleNotes = ds.notes.flatMap((dn: DisplayNote) => dsScale.resolve(dn.target));
    }
    const displayIds = new Set(displayScaleNotes.map((n) => n.id));
    highlightIds = displayNotes.filter((n) => displayIds.has(n.id)).map((n) => n.id);
  } else {
    highlightIds = exerciseColoredNotes.map((n) => n.id);
  }

  return {
    exerciseTypeId: "tone-follow",
    toneShape,
    requiredPlays: exercise.requiredPlays,
    displayNotes,
    highlightIds,
  };
}

function resolveMelody(
  exercise: MelodyConfig,
  vocalRange: VocalRange,
): ResolvedMelody {
  const allNotes = vocalRange.allNotes;
  const timeline: ResolvedTimelineEntry[] = [];
  let cursor = 0;

  for (const segment of exercise.melody) {
    const localScale = new Scale({ type: segment.type, root: segment.root }, vocalRange);
    for (const event of segment.events) {
      const ms = durationToMs(event.duration, exercise.tempo);
      if (event.type === "pause") {
        // Advance cursor only
      } else if (event.type === "play") {
        for (const target of event.targets) {
          const resolved = localScale.resolve(target);
          const colored = resolved[0] ? vocalRange.findNote(resolved[0].midi) : null;
          if (colored) {
            timeline.push({ note: colored, startMs: cursor, durationMs: ms, audioOnly: true });
          }
        }
      } else {
        const resolved = localScale.resolve(event.target);
        const colored = resolved[0] ? vocalRange.findNote(resolved[0].midi) : null;
        if (colored) {
          timeline.push({
            note: colored,
            startMs: cursor,
            durationMs: ms,
            silent: event.silent,
          });
        }
      }
      cursor += ms;
    }
  }

  // Display notes: deduplicated sorted set of all notes in timeline
  const seen = new Set<string>();
  const unique: ColoredNote[] = [];
  for (const entry of timeline) {
    if (!entry.audioOnly && !seen.has(entry.note.id)) {
      seen.add(entry.note.id);
      unique.push(entry.note);
    }
  }
  unique.sort((a, b) => a.frequencyHz - b.frequencyHz);

  return {
    exerciseTypeId: "melody",
    tempo: exercise.tempo,
    minScore: exercise.minScore,
    timeline,
    totalDurationMs: cursor,
    displayNotes: unique,
    highlightIds: unique.map((n) => n.id),
  };
}

function resolveRhythm(
  exercise: RhythmConfig,
  _vocalRange: VocalRange,
): ResolvedRhythm {
  const beats: ResolvedBeat[] = [];
  let cursor = 0;

  for (const event of exercise.pattern) {
    const ms = durationToMs(event.duration, exercise.tempo);
    if (event.type === "tap") {
      beats.push({ startMs: cursor, durationMs: ms });
    }
    cursor += ms;
  }

  return {
    exerciseTypeId: "rhythm",
    tempo: exercise.tempo,
    metronome: exercise.metronome ?? false,
    minScore: exercise.minScore,
    beats,
    totalDurationMs: cursor,
    displayNotes: [],
    highlightIds: [],
  };
}

// ── Main entry point ──────────────────────────────────────────────────────────

export function resolveExercise(
  exercise: ExerciseConfig,
  vocalRange: VocalRange,
): ResolvedExercise {
  switch (exercise.exerciseTypeId) {
    case "pitch-detection":
      return resolvePitchDetection(exercise, vocalRange);
    case "pitch-detection-slide":
      return resolvePitchDetectionSlide(exercise, vocalRange);
    case "tone-follow":
      return resolveToneFollow(exercise, vocalRange);
    case "melody":
      return resolveMelody(exercise, vocalRange);
    case "rhythm":
      return resolveRhythm(exercise, vocalRange);
    default:
      throw new Error(`Cannot resolve exercise type: ${(exercise as ExerciseConfig).exerciseTypeId}`);
  }
}
