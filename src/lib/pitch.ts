import type { Band } from "@/constants/tone-slots";
import { SLOT_ORDER } from "@/constants/tone-slots";
import { VOICE_TYPES } from "@/constants/voice-types";
import type { VoiceTypeId } from "@/constants/voice-types";
import type { BandTarget } from "@/constants/journey";

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

/** Check if pitch is anywhere within the frequency range of the given bands. Uses ±10% buffer at edges for loose detection. */
export function isInBandRange(detectedHz: number, bands: Band[]): boolean {
  return matchesBandTarget(detectedHz, bands, "within");
}

/**
 * Check if pitch matches a band target with optional accept mode.
 * - within: pitch must be in the band range (±10% buffer)
 * - below: accept any pitch at or below the target range (chest/low voice)
 * - above: accept any pitch at or above the target range (head/high voice)
 */
export function matchesBandTarget(
  detectedHz: number,
  bands: Band[],
  accept: "within" | "below" | "above" = "within"
): boolean {
  if (bands.length === 0) return false;
  const freqs = bands.map((b) => b.frequencyHz);
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

export function findClosestBand(hz: number, bands: Band[]): Band {
  if (bands.length === 0) {
    throw new Error("findClosestBand requires at least one band");
  }
  return bands.reduce((best, b) =>
    Math.abs(b.frequencyHz - hz) < Math.abs(best.frequencyHz - hz) ? b : best
  );
}


/** Pitch confidence: 0 (far) → 1 (exactly on a band) */
export function pitchConfidence(hz: number, bands: Band[]): number {
  const closest = findClosestBand(hz, bands);
  const ratio = Math.abs(hz - closest.frequencyHz) / closest.frequencyHz;
  return Math.max(0, 1 - ratio / 0.03);
}

/** Resolve a BandTarget to concrete Band(s) from the user's vocal scale. */
export function resolveBandTarget(
  target: BandTarget,
  allBands: Band[],
): Band[] {
  const n = allBands.length;
  if (n === 0) return [];

  if (target.kind === "slot") {
    const slotId = SLOT_ORDER[target.n - 1];
    const band = allBands.find(
      (b) => b.isSlot && b.slotId === slotId,
    );
    return band ? [band] : [];
  }

  if (target.kind === "index") {
    const i = target.i < 0 ? n + target.i : target.i;
    return i >= 0 && i < n ? [allBands[i]] : [];
  }

  if (target.kind === "range") {
    const from = target.from < 0 ? n + target.from : target.from;
    const to = target.to < 0 ? n + target.to : target.to;
    const lo = Math.max(0, Math.min(from, to));
    const hi = Math.min(n - 1, Math.max(from, to));
    return allBands.slice(lo, hi + 1);
  }

  return [];
}
