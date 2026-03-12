import { Note, Scale } from "tonal";

export type ChakraId =
  | "root"
  | "sacral"
  | "solar-plexus"
  | "heart"
  | "throat"
  | "third-eye"
  | "crown";

export interface Chakra {
  id: ChakraId;
  name: string;
  note: string;
  frequencyHz: number;
  color: string;
  rgb: string;
  mantra: string;
  description: string;
  longDescription: string;
  element: string;
  /** Short interesting fact for Journey stages (used in later exercises) */
  interestingFact?: string;
}

export const CHAKRAS: Chakra[] = [
  {
    id: "root",
    name: "Root",
    note: "Bb",
    frequencyHz: 228,
    color: "#ef4444",
    rgb: "239, 68, 68",
    mantra: "LAM",
    description: "Grounding & stability",
    longDescription:
      "The foundation of your being. Root grounds you in safety, security, and belonging. When balanced, you feel steady, present, and at home in your body.",
    element: "Earth",
    interestingFact: "Root is linked to the colour red and the sense of smell — grounding through the body.",
  },
  {
    id: "sacral",
    name: "Sacral",
    note: "Eb",
    frequencyHz: 303,
    color: "#f97316",
    rgb: "249, 115, 22",
    mantra: "VAM",
    description: "Creativity & flow",
    longDescription:
      "The seat of creativity, emotion, and pleasure. Sacral governs how you relate to others and to your own feelings. When balanced, life flows naturally and joyfully.",
    element: "Water",
    interestingFact: "Sacral is often called the seat of creativity — many artists and dancers connect strongly with this energy.",
  },
  {
    id: "solar-plexus",
    name: "Solar Plexus",
    note: "F#",
    frequencyHz: 182,
    color: "#eab308",
    rgb: "234, 179, 8",
    mantra: "RAM",
    description: "Power & transformation",
    longDescription:
      "The centre of personal power, will, and confidence. Solar Plexus is where you act on your intentions and transform thought into action. When balanced, you feel purposeful and capable.",
    element: "Fire",
    interestingFact: "Solar Plexus sits above the navel — in many traditions it's where willpower and 'gut feeling' live.",
  },
  {
    id: "heart",
    name: "Heart",
    note: "C",
    frequencyHz: 128,
    color: "#22c55e",
    rgb: "34, 197, 94",
    mantra: "YAM",
    description: "Love & compassion",
    longDescription:
      "The bridge between the lower and upper chakras. Heart governs love, compassion, and connection — both to others and to yourself. When balanced, giving and receiving feel natural and open.",
    element: "Air",
    interestingFact: "Heart bridges the lower three chakras (body) with the upper three (mind) — the centre of integration.",
  },
  {
    id: "throat",
    name: "Throat",
    note: "G",
    frequencyHz: 192,
    color: "#3b82f6",
    rgb: "59, 130, 246",
    mantra: "HAM",
    description: "Expression & truth",
    longDescription:
      "The voice of your inner truth. Throat governs communication, authenticity, and the courage to be heard. When balanced, you express yourself clearly and listen with openness.",
    element: "Sound",
    interestingFact: "Throat is the only chakra with 'sound' as its element — your voice is literally its medium.",
  },
  {
    id: "third-eye",
    name: "Third Eye",
    note: "D",
    frequencyHz: 144,
    color: "#6366f1",
    rgb: "99, 102, 241",
    mantra: "OM",
    description: "Intuition & insight",
    longDescription:
      "The seat of intuition, clarity, and inner vision. Third Eye opens perception beyond the physical. When balanced, you trust your inner knowing and see situations with wisdom.",
    element: "Light",
    interestingFact: "Third Eye is associated with the pineal gland — sometimes called the 'seat of the soul' in ancient texts.",
  },
  {
    id: "crown",
    name: "Crown",
    note: "A",
    frequencyHz: 216,
    color: "#a855f7",
    rgb: "168, 85, 247",
    mantra: "AH",
    description: "Consciousness & unity",
    longDescription:
      "Pure awareness and connection to all that is. Crown transcends the individual self. When balanced, there is a deep sense of peace, presence, and belonging to something larger.",
    element: "Thought",
    interestingFact: "Crown connects you to what's beyond the individual self — a sense of unity with all that is.",
  },
];

// ── Band interface ─────────────────────────────────────────────────────────────

/** A single note in the user's vocal scale. Chakra slots (7 evenly-spaced) carry full chakra metadata. */
export interface Band {
  id: string;           // chakra ID for slots (e.g. "root"), note+octave for others (e.g. "A2")
  midi: number;
  frequencyHz: number;
  note: string;         // pitch class: "A", "C#", etc.
  octave: number;
  color: string;        // hex color
  rgb: string;          // "r, g, b" format for canvas
  name: string;         // chakra name for slots (e.g. "Root"), note+octave for others (e.g. "A2")
  isChakraSlot: boolean;
  // Chakra metadata — only set for chakra slots:
  chakraId?: ChakraId;
  mantra?: string;
  description?: string;
  longDescription?: string;
  element?: string;
  interestingFact?: string;
}

// ── Voice types ───────────────────────────────────────────────────────────────

export type VoiceTypeId = "bass" | "baritone" | "tenor" | "alto" | "soprano";

export interface VoiceType {
  id: VoiceTypeId;
  label: string;
  rangeHz: [number, number];
}

export const VOICE_TYPES: VoiceType[] = [
  { id: "bass",     label: "Bass",     rangeHz: [82, 330] },
  { id: "baritone", label: "Baritone", rangeHz: [98, 392] },
  { id: "tenor",    label: "Tenor",    rangeHz: [131, 523] },
  { id: "alto",     label: "Alto",     rangeHz: [175, 698] },
  { id: "soprano",  label: "Soprano",  rangeHz: [262, 1047] },
];

// ── Tuning ────────────────────────────────────────────────────────────────────

export type TuningStandard = "A432" | "A440" | "A444" | "A528";

export const TUNING_OPTIONS: {
  id: TuningStandard;
  label: string;
  description: string;
}[] = [
  { id: "A432", label: "A432 Hz", description: "Softer, warmer — healing-focused practice" },
  { id: "A440", label: "A440 Hz", description: "Standard Western tuning" },
  { id: "A444", label: "A444 Hz", description: "Natural tuning, sacred music traditions" },
  { id: "A528", label: "A528 Hz", description: '"Miracle tone" — popular in sound healing' },
];

export const TUNING_A_HZ: Record<TuningStandard, number> = {
  A432: 432,
  A440: 440,
  A444: 444,
  A528: 528,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fitToRange(hz: number, low: number, high: number): number {
  while (hz < low) hz *= 2;
  while (hz > high) hz /= 2;
  return hz;
}

const NOTE_NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"] as const;

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

// ── Frequency modes ───────────────────────────────────────────────────────────

export type FrequencyBase = "absolute" | "voice";

export function getScaleNotes(
  base: FrequencyBase,
  voiceId: VoiceTypeId,
  tuning: TuningStandard
): Chakra[] {
  const tuningScale = TUNING_A_HZ[tuning] / 432;

  if (base === "absolute") {
    return CHAKRAS.map((c) => ({
      ...c,
      frequencyHz: Math.round(c.frequencyHz * tuningScale),
    }));
  }

  const voice = VOICE_TYPES.find((v) => v.id === voiceId) ?? VOICE_TYPES[2];
  const [low, high] = voice.rangeHz;

  return CHAKRAS.map((c) => ({
    ...c,
    frequencyHz: Math.round(fitToRange(c.frequencyHz * tuningScale, low, high)),
  }));
}

// ── Vocal scale (music-theory based) ─────────────────────────────────────────

/** Chakra IDs ordered from lowest (slot 1) to highest (slot 7). */
export const BAND_ID_ORDER: ChakraId[] = [
  "root", "sacral", "solar-plexus", "heart", "throat", "third-eye", "crown",
];

// ── Color interpolation helpers ───────────────────────────────────────────────

function parseRgb(rgb: string): [number, number, number] {
  const parts = rgb.split(",").map((s) => parseInt(s.trim(), 10));
  return [parts[0], parts[1], parts[2]];
}

function lerpColor(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] {
  return [
    Math.round(a[0] + t * (b[0] - a[0])),
    Math.round(a[1] + t * (b[1] - a[1])),
    Math.round(a[2] + t * (b[2] - a[2])),
  ];
}

function toHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

/**
 * Build all major-scale MIDI notes spanning the user's detected vocal range.
 * Returns ALL notes — may be 7–20+ depending on range width.
 * If fewer than 7 fall in range, extends above highHz to reach 7.
 */
function buildScaleMidi(lowHz: number, highHz: number): number[] {
  const lowMidi = Math.round(hzToMidi(lowHz));
  const highMidi = Math.round(hzToMidi(highHz));

  const rootName = NOTE_NAMES[((lowMidi % 12) + 12) % 12];
  const scaleNotes = Scale.get(`${rootName} major`).notes;
  const scalePCs = new Set(scaleNotes.map((n) => Note.chroma(n) ?? -1));

  const allMidi: number[] = [];
  for (let midi = lowMidi; midi <= highMidi; midi++) {
    if (scalePCs.has(((midi % 12) + 12) % 12)) allMidi.push(midi);
  }

  // Extend above range if fewer than 7
  let ext = highMidi + 1;
  while (allMidi.length < 7 && ext < highMidi + 25) {
    if (scalePCs.has(((ext % 12) + 12) % 12)) allMidi.push(ext);
    ext++;
  }

  // Extreme fallback: chromatic steps
  if (allMidi.length === 0) {
    return Array.from({ length: 7 }, (_, i) =>
      lowMidi + Math.round((i * (highMidi - lowMidi)) / 6)
    );
  }

  return allMidi;
}

/**
 * Map the user's detected vocal range to all scale notes, with 7 evenly-spaced
 * chakra slots carrying full chakra metadata and interpolated colors for the rest.
 * Returns Band[] sorted low → high.
 */
export function getScaleNotesForRange(
  lowHz: number,
  highHz: number,
  _tuning: TuningStandard,
): Band[] {
  const allMidi = buildScaleMidi(lowHz, highHz);
  const n = allMidi.length;

  // Pick 7 evenly-spaced slot indices
  const slotIndices: number[] = Array.from({ length: 7 }, (_, i) =>
    n <= 7 ? i : Math.round((i * (n - 1)) / 6)
  );
  const slotIndexSet = new Set(slotIndices);

  // Parse chakra RGB values once
  const chakraRgbs = BAND_ID_ORDER.map((id) => {
    const chakra = CHAKRAS.find((c) => c.id === id)!;
    return parseRgb(chakra.rgb);
  });

  // Get interpolated color for any band index
  function colorAt(idx: number): { hex: string; rgb: string } {
    if (idx <= slotIndices[0]) {
      const [r, g, b] = chakraRgbs[0];
      return { hex: toHex(r, g, b), rgb: `${r}, ${g}, ${b}` };
    }
    if (idx >= slotIndices[6]) {
      const [r, g, b] = chakraRgbs[6];
      return { hex: toHex(r, g, b), rgb: `${r}, ${g}, ${b}` };
    }
    for (let s = 0; s < 6; s++) {
      if (idx >= slotIndices[s] && idx <= slotIndices[s + 1]) {
        const span = slotIndices[s + 1] - slotIndices[s];
        const t = span === 0 ? 0 : (idx - slotIndices[s]) / span;
        const [r, g, b] = lerpColor(chakraRgbs[s], chakraRgbs[s + 1], t);
        return { hex: toHex(r, g, b), rgb: `${r}, ${g}, ${b}` };
      }
    }
    const [r, g, b] = chakraRgbs[0];
    return { hex: toHex(r, g, b), rgb: `${r}, ${g}, ${b}` };
  }

  return allMidi.map((midi, idx) => {
    const hz = Math.round(midiToHz(midi));
    const noteName = NOTE_NAMES[((midi % 12) + 12) % 12];
    const octave = Math.floor(midi / 12) - 1;

    if (slotIndexSet.has(idx)) {
      const slotNum = slotIndices.indexOf(idx); // 0-based slot number
      const chakraId = BAND_ID_ORDER[slotNum];
      const chakra = CHAKRAS.find((c) => c.id === chakraId)!;
      return {
        id: chakraId,
        midi,
        frequencyHz: hz,
        note: noteName,
        octave,
        color: chakra.color,
        rgb: chakra.rgb,
        name: chakra.name,
        isChakraSlot: true,
        chakraId: chakraId as ChakraId,
        mantra: chakra.mantra,
        description: chakra.description,
        longDescription: chakra.longDescription,
        element: chakra.element,
        interestingFact: chakra.interestingFact,
      };
    }

    const { hex, rgb } = colorAt(idx);
    return {
      id: `${noteName}${octave}`,
      midi,
      frequencyHz: hz,
      note: noteName,
      octave,
      color: hex,
      rgb,
      name: `${noteName}${octave}`,
      isChakraSlot: false,
    };
  });
}

// ── Pitch utilities ───────────────────────────────────────────────────────────

/** ±3% tolerance — roughly ±50 cents */
export function isInTune(detectedHz: number, targetHz: number): boolean {
  return Math.abs(detectedHz - targetHz) / targetHz <= 0.03;
}

/** Check if pitch is anywhere within the frequency range of the given bands. Uses ±10% buffer at edges for loose detection. */
export function isInBandRange(detectedHz: number, bands: Band[]): boolean {
  if (bands.length === 0) return false;
  const freqs = bands.map((b) => b.frequencyHz);
  const minHz = Math.min(...freqs);
  const maxHz = Math.max(...freqs);
  const buffer = 0.1;
  const low = minHz * (1 - buffer);
  const high = maxHz * (1 + buffer);
  return detectedHz >= low && detectedHz <= high;
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
