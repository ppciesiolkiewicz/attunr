import type { JourneyStage } from "./types";
import { PART_1_STAGES } from "./part1";
import { PART_2_STAGES } from "./part2";
import { PART_3_STAGES } from "./part3";
import { PART_4_STAGES } from "./part4";
import { PART_5_STAGES } from "./part5";
import { PART_6_STAGES } from "./part6";
import { PART_7_STAGES } from "./part7";
import { PART_8_STAGES } from "./part8";
import { PART_9_STAGES } from "./part9";

export type {
  JourneyStage,
  JourneyStageType,
  SlideDirection,
  TechniqueId,
  ChakraDetailStyle,
} from "./types";

export const JOURNEY_STAGES: JourneyStage[] = [
  ...PART_1_STAGES,
  ...PART_2_STAGES,
  ...PART_3_STAGES,
  ...PART_4_STAGES,
  ...PART_5_STAGES,
  ...PART_6_STAGES,
  ...PART_7_STAGES,
  ...PART_8_STAGES,
  ...PART_9_STAGES,
];

export const TOTAL_JOURNEY_STAGES = 48;

/** Last stage id of each part (1–9) */
export const LAST_STAGE_ID_PER_PART: Record<number, number> = {
  1: 1, 2: 8, 3: 16, 4: 22, 5: 30, 6: 38, 7: 42, 8: 44, 9: 48,
};

export function isLastStageOfPart(stageId: number): boolean {
  const stage = JOURNEY_STAGES.find((s) => s.id === stageId);
  return stage ? LAST_STAGE_ID_PER_PART[stage.part] === stageId : false;
}

export const PART_COMPLETE_CONTENT: Record<
  number,
  { learned: string; tip: string }
> = {
  1: {
    learned: "Chakra tones and their connection to grounding, creativity, and presence.",
    tip: "",
  },
  2: {
    learned: "Lip rolls, low U, and hoo hoo — gentle warmups for jaw, lower register, and head voice.",
    tip: "Always warm up before each practice session!",
  },
  3: {
    learned: "Holding each chakra tone steadily and feeling where it resonates.",
    tip: "Repeat and combine exercises into longer sessions.",
  },
  4: {
    learned: "Singing chakra sequences for full alignment.",
    tip: "Repeat and combine exercises into longer sessions.",
  },
  5: {
    learned: "The U vowel (uuu) across all seven chakras.",
    tip: "Repeat and combine exercises into longer sessions.",
  },
  6: {
    learned: "Chakra seed syllables — LAM, VAM, RAM, YAM, HAM, OM, AH.",
    tip: "Repeat and combine exercises into longer sessions.",
  },
  7: {
    learned: "The bright EE vowel for shifting resonance higher.",
    tip: "Repeat and combine exercises into longer sessions.",
  },
  8: {
    learned: "Gliding from U to EE for vocal flexibility.",
    tip: "Repeat and combine exercises into longer sessions.",
  },
  9: {
    learned: "Breath control with puffy cheeks.",
    tip: "Repeat and combine exercises into longer sessions.",
  },
};
