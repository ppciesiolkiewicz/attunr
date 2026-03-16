// ── Chakra domain data ───────────────────────────────────────────────────────
// Only used by chakra-themed exercises (Parts 11–12, currently commented out).
// Core app plumbing uses ResolvedNote / ColoredNote from tone-slots.ts instead.

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
