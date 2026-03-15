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
import { PART_10_STAGES } from "./part10";
// import { PART_11_STAGES } from "./part11"; // Chakra exercises — temporarily removed
// import { PART_12_STAGES } from "./part12"; // Chakra exercises — temporarily removed
import { PART_13_STAGES } from "./part13";
import { PART_14_STAGES } from "./part14";
import { PART_15_STAGES } from "./part15";
import { PART_16_STAGES } from "./part16";
import { PART_17_STAGES } from "./part17";
import { PART_18_STAGES } from "./part18";
import { PART_19_STAGES } from "./part19";
import { PART_20_STAGES } from "./part20";

export type {
  JourneyStage,
  StageTypeId,
  TechniqueId,
  BandTarget,
  SustainNoteConfig,
  SlideConfig,
  BaseJourneyStage,
  LearnStage,
  PitchDetectionStage,
  PitchDetectionSlideStage,
  BreathworkStage,
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
  ...PART_10_STAGES,
  // ...PART_11_STAGES, // Chakra exercises — temporarily removed
  // ...PART_12_STAGES, // Chakra exercises — temporarily removed
  ...PART_13_STAGES,
  ...PART_14_STAGES,
  ...PART_15_STAGES,
  ...PART_16_STAGES,
  ...PART_17_STAGES,
  ...PART_18_STAGES,
  ...PART_19_STAGES,
  ...PART_20_STAGES,
];

export const TOTAL_JOURNEY_STAGES = 116;

export const PART_TITLES: Record<number, string> = {
  1: "Introduction",
  2: "First Sounds",
  3: "Lip Rolls & Breath",
  4: "Low Resonance",
  5: "Building Range",
  6: "Rounded Vowels",
  7: "Vowel Warmth",
  8: "The Open AH",
  9: "Breath & Body",
  10: "Sequences & Range",
  // 11: "Chakras — Earth", // Temporarily removed
  // 12: "Chakras — Sky",   // Temporarily removed
  13: "Forward EH",
  14: "EH Mastery",
  15: "Warmup III",
  16: "Vowel EE",
  17: "EE & Brightness",
  18: "Vowel Flow",
  19: "Vowel Mastery",
  20: "Vocal Control",
};

/** Last stage id of each part (1–20) */
export const LAST_STAGE_ID_PER_PART: Record<number, number> = {
  1: 1, 2: 7, 3: 13, 4: 19, 5: 25, 6: 31, 7: 37, 8: 43, 9: 49, 10: 55,
  // 11: 61, 12: 67, // Temporarily removed
  13: 73, 14: 79, 15: 85, 16: 91, 17: 97, 18: 103, 19: 109, 20: 116,
};

export function isLastStageOfPart(stageId: number): boolean {
  const stage = JOURNEY_STAGES.find((s) => s.id === stageId);
  return stage ? LAST_STAGE_ID_PER_PART[stage.part] === stageId : false;
}

/** Find the next available stage after the given ID (handles gaps from removed parts). */
export function getNextStageId(currentId: number): number | null {
  const idx = JOURNEY_STAGES.findIndex((s) => s.id === currentId);
  if (idx < 0 || idx >= JOURNEY_STAGES.length - 1) return null;
  return JOURNEY_STAGES[idx + 1].id;
}

export const PART_COMPLETE_CONTENT: Record<
  number,
  { learned: string; tip: string }
> = {
  1: {
    learned: "Vocal placement and how sound resonates differently across your body.",
    tip: "",
  },
  2: {
    learned: "Chest voice (Low U), head voice (Hoo hoo), Farinelli breathwork, and lip roll slides — the foundations of every warmup.",
    tip: "Always warm up before each practice session!",
  },
  3: {
    learned: "Sustained lip rolls, deeper breathwork, and your first humming — building control and relaxation.",
    tip: "Lip rolls are a great way to start any singing session.",
  },
  4: {
    learned: "Humming and the U vowel in your low register — feeling where resonance lives in your chest.",
    tip: "The low register is your foundation. Return here when you need to ground your voice.",
  },
  5: {
    learned: "Humming and U vowel in mid range, and your first multi-tone sequence.",
    tip: "Sequences build agility. Try singing them a little faster as you improve.",
  },
  6: {
    learned: "The rounded vowels OO (as in 'book') and OH (as in 'go') — warm, stable vowels that build on your U foundation.",
    tip: "OO and OH are great for developing resonance. Use them in your warmup routine.",
  },
  7: {
    learned: "OO and OH vowels at different pitches, lip roll sustains, and your first vowel sequence.",
    tip: "Mixing techniques in each session keeps your voice flexible.",
  },
  8: {
    learned: "The open AH vowel and your first vowel flow — transitioning from U to AH while holding pitch.",
    tip: "Vowel flows are one of the most valuable exercises for vocal efficiency.",
  },
  9: {
    learned: "Puffy cheeks for breath control, AH in higher range, and OO → AH vowel flow.",
    tip: "Puffy cheeks is a playful but powerful technique. Use it when you feel tension in your jaw.",
  },
  10: {
    learned: "Multi-tone sequences with different vowels — U, Hum, AH, and OO across your expanding range.",
    tip: "Sequences prepare you for real singing. Try connecting them to songs you enjoy.",
  },
  // 11: { learned: "...", tip: "..." }, // Temporarily removed
  // 12: { learned: "...", tip: "..." }, // Temporarily removed
  13: {
    learned: "The forward EH vowel (as in 'bed'), OH → EH vowel flow, and forward resonance placement.",
    tip: "Forward resonance helps with projection. Practice EH when you want your voice to carry.",
  },
  14: {
    learned: "EH mastery — longer holds, sequences, puffy cheeks at mid range, and AH → EH vowel flow.",
    tip: "Combining techniques (puffy cheeks + vowels + sequences) builds real vocal fitness.",
  },
  15: {
    learned: "Advanced warmup combining lip rolls, puffy cheeks, and full-range humming sequences.",
    tip: "This advanced warmup is a complete routine. Use it before performances or longer practice sessions.",
  },
  16: {
    learned: "The bright EE vowel — the narrowest, most forward vowel. EE on low, mid, and mid-high tones.",
    tip: "EE is the hardest vowel to control. Patience and relaxation are key.",
  },
  17: {
    learned: "EE on high tones, U → EE full vowel flow, full-range EE sequence, and puffy cheeks on high tones.",
    tip: "The U → EE flow is one of the most valuable exercises in singing. It teaches resonance consistency.",
  },
  18: {
    learned: "Vowel flow mastery — smooth transitions between all vowel pairs: U→OO, OO→AH, AH→EH, EH→EE.",
    tip: "Practice these flows daily. They're the secret to smooth, connected singing.",
  },
  19: {
    learned: "Advanced vowel flows, the full vowel cascade (U→OO→OH→AH→EH→EE), and puffy cheeks on the highest tone.",
    tip: "The vowel cascade is a signature exercise. Try it on different pitches to explore your range.",
  },
  20: {
    learned: "Full vocal control — all techniques combined across your entire range. Puffy cheeks sequences, high vowel flows, descending sequences, and the extended vowel cascade.",
    tip: "You've completed the full journey. Return to any part to deepen your practice, or create your own sequences from the exercises you've learned.",
  },
};
