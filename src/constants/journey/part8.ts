import type { JourneyStage } from "./types";

/** Part 8: Puffy cheeks */
export const PART_8_STAGES: JourneyStage[] = [
  {
    id: 38,
    part: 8,
    stageTypeId: "intro",
    title: "Puffy cheeks",
    technique: "puffy-cheeks",
    cardCue: "Build breath control by singing with cheeks full of air",
    instruction:
      "Fill your cheeks with air, then sing the tone without releasing. Your cheeks stay rounded. Hold for a few seconds, then release gently. This develops breath control and teaches you to sing without jaw tension.",
  },
  {
    id: 39,
    part: 8,
    stageTypeId: "pitch-detection",
    title: "Low — Puffy cheeks",
    subtitle: "Puffy cheeks · 10 seconds",
    notes: [{ target: { kind: "slot", n: 1 }, seconds: 10 }],
    instruction:
      "Sing your lowest tone with puffy cheeks.\nFeel the grounding while you hold the breath in your cheeks.",
  },
  {
    id: 40,
    part: 8,
    stageTypeId: "pitch-detection",
    title: "Mid — Puffy cheeks",
    subtitle: "Puffy cheeks · 10 seconds",
    notes: [{ target: { kind: "slot", n: 4 }, seconds: 10 }],
    instruction:
      "Sing the mid tone with puffy cheeks.\nStay open in the chest.",
  },
  {
    id: 41,
    part: 8,
    stageTypeId: "pitch-detection",
    title: "High — Puffy cheeks",
    subtitle: "Puffy cheeks · 10 seconds",
    notes: [{ target: { kind: "slot", n: 7 }, seconds: 10 }],
    instruction:
      "Sing your highest tone with puffy cheeks.\nKeep it soft at the top.",
  },
];
