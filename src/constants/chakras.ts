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
  description: string;
  element: string;
}

/** Canonical Solfeggio frequencies */
export const CHAKRAS: Chakra[] = [
  {
    id: "root",
    name: "Root",
    note: "C",
    frequencyHz: 396,
    color: "#ef4444",
    rgb: "239, 68, 68",
    description: "Grounding & stability",
    element: "Earth",
  },
  {
    id: "sacral",
    name: "Sacral",
    note: "D",
    frequencyHz: 417,
    color: "#f97316",
    rgb: "249, 115, 22",
    description: "Creativity & flow",
    element: "Water",
  },
  {
    id: "solar-plexus",
    name: "Solar Plexus",
    note: "E",
    frequencyHz: 528,
    color: "#eab308",
    rgb: "234, 179, 8",
    description: "Power & transformation",
    element: "Fire",
  },
  {
    id: "heart",
    name: "Heart",
    note: "F",
    frequencyHz: 639,
    color: "#22c55e",
    rgb: "34, 197, 94",
    description: "Love & compassion",
    element: "Air",
  },
  {
    id: "throat",
    name: "Throat",
    note: "G",
    frequencyHz: 741,
    color: "#3b82f6",
    rgb: "59, 130, 246",
    description: "Expression & truth",
    element: "Sound",
  },
  {
    id: "third-eye",
    name: "Third Eye",
    note: "A",
    frequencyHz: 852,
    color: "#6366f1",
    rgb: "99, 102, 241",
    description: "Intuition & insight",
    element: "Light",
  },
  {
    id: "crown",
    name: "Crown",
    note: "B",
    frequencyHz: 963,
    color: "#a855f7",
    rgb: "168, 85, 247",
    description: "Consciousness & unity",
    element: "Thought",
  },
];

export type VoiceTypeId =
  | "bass"
  | "baritone"
  | "tenor"
  | "alto"
  | "soprano";

export interface VoiceType {
  id: VoiceTypeId;
  label: string;
  sacredFactor: number;
}

export const VOICE_TYPES: VoiceType[] = [
  { id: "bass",     label: "Bass",     sacredFactor: 0.35 },
  { id: "baritone", label: "Baritone", sacredFactor: 0.45 },
  { id: "tenor",    label: "Tenor",    sacredFactor: 0.50 },
  { id: "alto",     label: "Alto",     sacredFactor: 0.65 },
  { id: "soprano",  label: "Soprano",  sacredFactor: 0.90 },
];

export type TuningStandard = "A432" | "A440";
export type FrequencyBase = "absolute" | "voice";

/**
 * Returns the 7 chakras with frequencies adjusted for voice type and tuning.
 *   - "absolute": canonical Solfeggio (396–963 Hz)
 *   - "voice": scaled by sacredFactor so the range fits the singer's voice
 */
export function getChakraFrequencies(
  base: FrequencyBase,
  voiceId: VoiceTypeId,
  tuning: TuningStandard
): Chakra[] {
  if (base === "absolute") return CHAKRAS;

  const voice = VOICE_TYPES.find((v) => v.id === voiceId) ?? VOICE_TYPES[2]; // default: tenor
  const tuningFactor = tuning === "A432" ? 432 / 440 : 1;

  return CHAKRAS.map((chakra) => ({
    ...chakra,
    frequencyHz: Math.round(
      chakra.frequencyHz * voice.sacredFactor * tuningFactor
    ),
  }));
}

/** ±3% tolerance — roughly ±50 cents (just under a half-step) */
export function isInTune(detectedHz: number, targetHz: number): boolean {
  return Math.abs(detectedHz - targetHz) / targetHz <= 0.03;
}

export function findClosestChakra(hz: number, chakras: Chakra[]): Chakra {
  return chakras.reduce((best, c) =>
    Math.abs(c.frequencyHz - hz) < Math.abs(best.frequencyHz - hz) ? c : best
  );
}
