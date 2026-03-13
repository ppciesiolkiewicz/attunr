import type { JourneyStage } from "./types";

/** Part 9: Breath & Body — puffy cheeks intro, AH range expansion */
export const PART_9_STAGES: JourneyStage[] = [
  {
    id: 44,
    part: 9,
    stageTypeId: "intro",
    title: "Puffy cheeks",
    technique: "puffy-cheeks",
    cardCue: "Build breath control with a playful technique",
    instruction:
      "Puffy cheeks is a breath control technique: puff your cheeks out while singing, as if holding air in your mouth. This creates back-pressure that trains your diaphragm and helps you sustain notes with less effort. It feels playful but builds serious control. We'll combine it with AH vowel work to keep expanding your range.",
  },
  {
    id: 45,
    part: 9,
    stageTypeId: "pitch-detection",
    title: "Puffy cheeks — Low",
    subtitle: "Breath control · 7 seconds",
    technique: "puffy-cheeks",
    notes: [{ target: { kind: "slot", n: 1 }, seconds: 7 }],
    instruction:
      "Sing on your lowest tone with puffy cheeks.\nPuff your cheeks out while sustaining the note.\nFeel the back-pressure — let it support your voice.",
  },
  {
    id: 46,
    part: 9,
    stageTypeId: "pitch-detection",
    title: "AH — Mid-high",
    subtitle: "Vowel AH · 8 seconds",
    notes: [{ target: { kind: "slot", n: 5 }, seconds: 8 }],
    instruction:
      "Sing AH on the mid-high tone.\nThis is a step higher than before — keep the openness.\nDon't push. Let the note come naturally.",
  },
  {
    id: 47,
    part: 9,
    stageTypeId: "breathwork",
    title: "Farinelli breathwork",
    maxCount: 8,
    instruction:
      "Inhale, hold, and exhale for the same count. Each cycle adds one beat. Let the breath recover after the puffy cheeks challenge.",
  },
  {
    id: 48,
    part: 9,
    stageTypeId: "pitch-detection",
    title: "Puffy cheeks — Mid",
    subtitle: "Breath control · 7 seconds",
    technique: "puffy-cheeks",
    notes: [{ target: { kind: "slot", n: 3 }, seconds: 7 }],
    instruction:
      "Sing on the mid-low tone with puffy cheeks.\nFeel the back-pressure support your voice.\nKeep it steady and relaxed.",
  },
  {
    id: 49,
    part: 9,
    stageTypeId: "pitch-detection",
    title: "OO → AH flow",
    subtitle: "Vowel transition · 8 seconds",
    notes: [{ target: { kind: "slot", n: 4 }, seconds: 8 }],
    instruction:
      "Hold the mid tone steady. Start with OO (rounded lips) and slowly open into AH (jaw drops). The pitch stays the same — the vowel opens from rounded to neutral. Feel the space increase.",
  },
];
