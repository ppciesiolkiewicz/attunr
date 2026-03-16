// ── Note types ──────────────────────────────────────────────────────────────

/** 7-color palette for note visualization across the vocal range. */
export const NOTE_PALETTE = [
  { color: "#ef4444", rgb: "239, 68, 68" },
  { color: "#f97316", rgb: "249, 115, 22" },
  { color: "#eab308", rgb: "234, 179, 8" },
  { color: "#22c55e", rgb: "34, 197, 94" },
  { color: "#3b82f6", rgb: "59, 130, 246" },
  { color: "#6366f1", rgb: "99, 102, 241" },
  { color: "#a855f7", rgb: "168, 85, 247" },
];

/** A resolved note from a scale — physical properties without visual styling. */
export interface ResolvedNote {
  id: string;
  midi: number;
  frequencyHz: number;
  note: string;
  octave: number;
  name: string;
}

/** A resolved note with color from the user's vocal range. */
export interface ColoredNote extends ResolvedNote {
  color: string;
  /** Comma-separated RGB for rgba() usage. */
  rgb: string;
}

/** Vocal range data passed to exercises. */
export interface VocalRange {
  /** Lowest detected note, e.g. "C3". */
  lowNote: string;
  /** Highest detected note, e.g. "C5". */
  highNote: string;
  /** All notes in the vocal range with colors. */
  allNotes: ColoredNote[];
}

// ── Re-exports ───────────────────────────────────────────────────────────────

export { VOICE_TYPES } from "@/constants/voice-types";
export type { VoiceTypeId, VoiceType } from "@/constants/voice-types";

export { TUNING_OPTIONS, TUNING_A_HZ } from "@/constants/tuning";
export type { TuningStandard, FrequencyBase } from "@/constants/tuning";

export {
  hzToMidi,
  midiToHz,
  hzToNoteName,
  deriveVoiceType,
  isInTune,
  isInNoteRange,
  matchesNoteTarget,
  findClosestNote,
  pitchConfidence,
} from "@/lib/pitch";

export { getScaleNotesForRange } from "@/lib/vocal-scale";
