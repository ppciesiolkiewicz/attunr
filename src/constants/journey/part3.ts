import type { JourneyStage } from "./types";

/** Part 3: Sustain — seven tones across your range */
export const PART_3_STAGES: JourneyStage[] = [
  {
    id: 10,
    part: 3,
    stageTypeId: "intro",
    title: "Sustain",
    technique: "sustain",
    cardCue: "Hold each tone steadily across your range",
    instruction:
      "Sing and hold each tone steadily. Lower tones feel deep and grounded, higher tones feel light and lifted. There's no rush. Let the sound settle before moving on.",
  },
  {
    id: 11,
    part: 3,
    stageTypeId: "pitch-detection",
    title: "Sustain — Low",
    subtitle: "3 seconds",
    notes: [{ target: { kind: "slot", n: 1 }, seconds: 3 }],
    instruction:
      "Sing low and steady.\nKeep it grounded and relaxed.\nHold and let the tone settle.",
  },
  {
    id: 12,
    part: 3,
    stageTypeId: "pitch-detection",
    title: "Sustain — Lower-mid",
    subtitle: "3 seconds",
    notes: [{ target: { kind: "slot", n: 2 }, seconds: 3 }],
    instruction:
      "Sing just above your lowest tone.\nKeep the sound warm and full.\nHold steady.",
  },
  {
    id: 13,
    part: 3,
    stageTypeId: "pitch-detection",
    title: "Sustain — Mid-low",
    subtitle: "3 seconds",
    notes: [{ target: { kind: "slot", n: 3 }, seconds: 3 }],
    instruction:
      "Sing with purpose.\nFeel the tone grow stronger.\nHold and keep your breath even.",
  },
  {
    id: 14,
    part: 3,
    stageTypeId: "pitch-detection",
    title: "Sustain — Mid",
    subtitle: "3 seconds",
    notes: [{ target: { kind: "slot", n: 4 }, seconds: 3 }],
    instruction:
      "Take a soft breath and sing openly.\nKeep it relaxed and open.\nHold and stay present.",
  },
  {
    id: 15,
    part: 3,
    stageTypeId: "pitch-detection",
    title: "Sustain — Mid-high",
    subtitle: "3 seconds",
    notes: [{ target: { kind: "slot", n: 5 }, seconds: 3 }],
    instruction:
      "Sing clearly and steadily.\nLet the tone ring forward.\nHold steady and clear.",
  },
  {
    id: 16,
    part: 3,
    stageTypeId: "pitch-detection",
    title: "Sustain — Upper-mid",
    subtitle: "3 seconds",
    notes: [{ target: { kind: "slot", n: 6 }, seconds: 3 }],
    instruction:
      "Sing gently.\nKeep the tone soft and focused.\nHold and let it float.",
  },
  {
    id: 17,
    part: 3,
    stageTypeId: "pitch-detection",
    title: "Sustain — High",
    subtitle: "3 seconds",
    notes: [{ target: { kind: "slot", n: 7 }, seconds: 3 }],
    instruction:
      "Stay soft at the top of your range.\nKeep it light — don't push.\nHold and be present.",
  },
];
