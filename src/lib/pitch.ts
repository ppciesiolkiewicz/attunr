import type { ResolvedNote } from "@/lib/VocalRange";
import { VOICE_TYPES } from "@/constants/voice-types";
import type { VoiceTypeId } from "@/constants/voice-types";

export const NOTE_NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"] as const;

/** Bring a frequency into [low, high] by octave doubling/halving. */
export function fitToRange(hz: number, low: number, high: number): number {
  while (hz < low) hz *= 2;
  while (hz > high) hz /= 2;
  return hz;
}

export function hzToMidi(hz: number): number {
  return 12 * Math.log2(hz / 440) + 69;
}

export function midiToHz(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function hzToNoteName(hz: number): string {
  const midi = Math.round(hzToMidi(hz));
  const name = NOTE_NAMES[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${name}${octave}`;
}

export function deriveVoiceType(lowHz: number, highHz: number): VoiceTypeId {
  const midHz = (lowHz + highHz) / 2;
  let best: VoiceTypeId = "tenor";
  let bestDist = Infinity;
  for (const v of VOICE_TYPES) {
    const mid = (v.rangeHz[0] + v.rangeHz[1]) / 2;
    const dist = Math.abs(mid - midHz);
    if (dist < bestDist) { bestDist = dist; best = v.id; }
  }
  return best;
}

/** ±3% tolerance by default — roughly ±50 cents. Pass tolerance for looser detection (e.g. 0.08 for lip rolls). */
export function isInTune(
  detectedHz: number,
  targetHz: number,
  tolerance: number = 0.03
): boolean {
  return Math.abs(detectedHz - targetHz) / targetHz <= tolerance;
}

/** Check if pitch is anywhere within the frequency range of the given notes. Uses ±10% buffer at edges. */
export function isInNoteRange(detectedHz: number, notes: ResolvedNote[]): boolean {
  return matchesNoteTarget(detectedHz, notes, "within");
}

/**
 * Check if pitch matches resolved notes with optional accept mode.
 * - within: pitch must be in the note range (±10% buffer)
 * - below: accept any pitch at or below the range (chest/low voice)
 * - above: accept any pitch at or above the range (head/high voice)
 */
export function matchesNoteTarget(
  detectedHz: number,
  notes: ResolvedNote[],
  accept: "within" | "below" | "above" = "within",
): boolean {
  if (notes.length === 0) return false;
  const freqs = notes.map((n) => n.frequencyHz);
  const minHz = Math.min(...freqs);
  const maxHz = Math.max(...freqs);
  const buffer = 0.1;
  const low = minHz * (1 - buffer);
  const high = maxHz * (1 + buffer);
  switch (accept) {
    case "below":
      return detectedHz <= high;
    case "above":
      return detectedHz >= low;
    default:
      return detectedHz >= low && detectedHz <= high;
  }
}

export function findClosestNote(hz: number, notes: ResolvedNote[]): ResolvedNote {
  if (notes.length === 0) {
    throw new Error("findClosestNote requires at least one note");
  }
  return notes.reduce((best, n) =>
    Math.abs(n.frequencyHz - hz) < Math.abs(best.frequencyHz - hz) ? n : best
  );
}

/** Pitch confidence: 0 (far) → 1 (exactly on a note) */
export function pitchConfidence(hz: number, notes: ResolvedNote[]): number {
  const closest = findClosestNote(hz, notes);
  const ratio = Math.abs(hz - closest.frequencyHz) / closest.frequencyHz;
  return Math.max(0, 1 - ratio / 0.03);
}
