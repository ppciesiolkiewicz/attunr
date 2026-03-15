// ── Slot system ──────────────────────────────────────────────────────────────
// 7 evenly-spaced reference tones across the user's vocal range.
// Slots are generic anchors — they have no domain meaning (chakra, etc.).

export type SlotId =
  | "slot-1"
  | "slot-2"
  | "slot-3"
  | "slot-4"
  | "slot-5"
  | "slot-6"
  | "slot-7";

/** A reference tone anchor — one of 7 evenly-spaced tones in the user's vocal range. */
export interface Slot {
  id: SlotId;
  name: string;
  /** Hex color, e.g. "#ef4444". Each slot has a unique color used in canvases and UI. */
  color: string;
  /** Comma-separated RGB for rgba() usage. */
  rgb: string;
}

export const SLOTS: Slot[] = [
  { id: "slot-1", name: "Slot 1", color: "#ef4444", rgb: "239, 68, 68" },
  { id: "slot-2", name: "Slot 2", color: "#f97316", rgb: "249, 115, 22" },
  { id: "slot-3", name: "Slot 3", color: "#eab308", rgb: "234, 179, 8" },
  { id: "slot-4", name: "Slot 4", color: "#22c55e", rgb: "34, 197, 94" },
  { id: "slot-5", name: "Slot 5", color: "#3b82f6", rgb: "59, 130, 246" },
  { id: "slot-6", name: "Slot 6", color: "#6366f1", rgb: "99, 102, 241" },
  { id: "slot-7", name: "Slot 7", color: "#a855f7", rgb: "168, 85, 247" },
];

/** Slot IDs ordered from lowest (1) to highest (7). */
export const SLOT_ORDER: SlotId[] = [
  "slot-1", "slot-2", "slot-3", "slot-4", "slot-5", "slot-6", "slot-7",
];

// ── Band ─────────────────────────────────────────────────────────────────────
// A single note in the user's vocal scale.
// Slot bands (7 evenly-spaced) carry slot metadata; others are interpolated.

export interface Band {
  id: string;
  midi: number;
  frequencyHz: number;
  note: string;
  octave: number;
  color: string;
  /** Comma-separated RGB, e.g. "239, 68, 68" — for use in rgba(). */
  rgb: string;
  /** Display name, e.g. "C4". */
  name: string;
  /** True for the 7 evenly-spaced reference tones; false for interpolated notes between them. */
  isSlot: boolean;
  /** Present only when isSlot is true. Links this band to its slot definition. */
  slotId?: SlotId;
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
  isInBandRange,
  matchesBandTarget,
  findClosestBand,
  pitchConfidence,
} from "@/lib/pitch";

export { getScaleNotesForRange } from "@/lib/vocal-scale";
