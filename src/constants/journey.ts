import type { ChakraId } from "./chakras";

export type JourneyStageType = "individual" | "sequence";

export interface JourneyStage {
  id: number;         // 1–13
  part: 1 | 2;
  title: string;
  instruction: string;
  chakraIds: ChakraId[];
  type: JourneyStageType;
  /** Cumulative seconds in-tune required to complete (individual stages) */
  holdSeconds: number;
  /** Seconds per note required when singing in sequence (sequence stages) */
  noteSeconds: number;
}

export const JOURNEY_STAGES: JourneyStage[] = [
  // ── Part 1: Individual chakras ───────────────────────────────────────────
  {
    id: 1, part: 1, type: "individual",
    title: "Root",
    chakraIds: ["root"],
    holdSeconds: 3, noteSeconds: 0,
    instruction:
      "This is the Root chakra tone — LAM.\nSing it and feel steady and grounded.\nThis can help you feel safe, present, and at home in your body.",
  },
  {
    id: 2, part: 1, type: "individual",
    title: "Sacral",
    chakraIds: ["sacral"],
    holdSeconds: 3, noteSeconds: 0,
    instruction:
      "This is the Sacral chakra tone — VAM.\nMatch it and let the sound flow naturally.\nThis can support creativity, flow, and emotional ease.",
  },
  {
    id: 3, part: 1, type: "individual",
    title: "Solar Plexus",
    chakraIds: ["solar-plexus"],
    holdSeconds: 3, noteSeconds: 0,
    instruction:
      "This is the Solar Plexus chakra tone — RAM.\nSing with purpose and feel your centre.\nThis can support confidence and personal power.",
  },
  {
    id: 4, part: 1, type: "individual",
    title: "Heart",
    chakraIds: ["heart"],
    holdSeconds: 3, noteSeconds: 0,
    instruction:
      "This is the Heart chakra tone — YAM.\nTake a soft breath and sing openly.\nThis can support compassion, connection, and emotional balance.",
  },
  {
    id: 5, part: 1, type: "individual",
    title: "Throat",
    chakraIds: ["throat"],
    holdSeconds: 3, noteSeconds: 0,
    instruction:
      "This is the Throat chakra tone — HAM.\nSing clearly and let your voice be heard.\nThis can support honest expression and clear communication.",
  },
  {
    id: 6, part: 1, type: "individual",
    title: "Third Eye",
    chakraIds: ["third-eye"],
    holdSeconds: 3, noteSeconds: 0,
    instruction:
      "This is the Third Eye chakra tone — OM.\nSing gently and turn your attention inward.\nThis can support intuition, clarity, and expanded perception.",
  },
  {
    id: 7, part: 1, type: "individual",
    title: "Crown",
    chakraIds: ["crown"],
    holdSeconds: 3, noteSeconds: 0,
    instruction:
      "This is the Crown chakra tone — AH.\nStay soft as you move into this higher tone.\nThis can support a sense of peace, presence, and unity.",
  },

  // ── Part 2: Sequences ────────────────────────────────────────────────────
  {
    id: 8, part: 2, type: "sequence",
    title: "Root & Sacral",
    chakraIds: ["root", "sacral"],
    holdSeconds: 0, noteSeconds: 2,
    instruction:
      "Sing Root, then Sacral.\nMove from stability into flow.\nThis can help balance grounded energy with creativity.",
  },
  {
    id: 9, part: 2, type: "sequence",
    title: "Root to Solar Plexus",
    chakraIds: ["root", "sacral", "solar-plexus"],
    holdSeconds: 0, noteSeconds: 2,
    instruction:
      "Sing Root, Sacral, then Solar Plexus.\nFeel the energy rise from grounding into power.\nThis can build inner strength from the base up.",
  },
  {
    id: 10, part: 2, type: "sequence",
    title: "Root to Heart",
    chakraIds: ["root", "sacral", "solar-plexus", "heart"],
    holdSeconds: 0, noteSeconds: 2,
    instruction:
      "Sing Root through Heart in order.\nKeep each tone smooth and connected.\nThis can help build inner balance from base to heart.",
  },
  {
    id: 11, part: 2, type: "sequence",
    title: "Heart to Third Eye",
    chakraIds: ["heart", "throat", "third-eye"],
    holdSeconds: 0, noteSeconds: 2,
    instruction:
      "Sing Heart, Throat, then Third Eye.\nLet the tones rise naturally from feeling to vision.\nThis can support emotional openness, expression, and clarity.",
  },
  {
    id: 12, part: 2, type: "sequence",
    title: "Third Eye & Crown",
    chakraIds: ["third-eye", "crown"],
    holdSeconds: 0, noteSeconds: 2,
    instruction:
      "Sing Third Eye, then Crown.\nStay gentle as you move into the higher tones.\nThis can support clarity, insight, and expanded awareness.",
  },
  {
    id: 13, part: 2, type: "sequence",
    title: "Full Alignment",
    chakraIds: ["root", "sacral", "solar-plexus", "heart", "throat", "third-eye", "crown"],
    holdSeconds: 0, noteSeconds: 2,
    instruction:
      "Sing all seven chakras from Root to Crown.\nMove slowly and keep your breath relaxed.\nThis can support full-spectrum alignment and integration.",
  },
];
