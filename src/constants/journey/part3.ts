import type { JourneyStage } from "./types";

/** Part 3: Sustain — seven tones across your range */
export const PART_3_STAGES: JourneyStage[] = [
  {
    id: 10,
    part: 3,
    stageTypeId: "intro",
    title: "Sustain",
    technique: "sustain",
    cardCue: "Hold each tone steadily and feel where it resonates",
    instruction:
      "Sing and hold each tone steadily. Feel where it resonates in your body — lower tones settle in the chest and belly, higher tones lift into the head and face. There's no rush. Let the sound settle before moving on.",
  },
  {
    id: 11,
    part: 3,
    stageTypeId: "pitch-detection",
    title: "Sustain — Low",
    subtitle: "3 seconds · chest and base",
    notes: [{ target: { kind: "slot", n: 1 }, seconds: 3 }],
    instruction:
      "Sing low and steady.\nFeel the vibration in your chest and belly.\nHold and let the tone settle.",
  },
  {
    id: 12,
    part: 3,
    stageTypeId: "pitch-detection",
    title: "Sustain — Lower-mid",
    subtitle: "3 seconds · lower belly",
    notes: [{ target: { kind: "slot", n: 2 }, seconds: 3 }],
    instruction:
      "Sing just above your lowest tone.\nFeel the sound flow from your lower belly.\nHold steady.",
  },
  {
    id: 13,
    part: 3,
    stageTypeId: "pitch-detection",
    title: "Sustain — Mid-low",
    subtitle: "3 seconds · centre",
    notes: [{ target: { kind: "slot", n: 3 }, seconds: 3 }],
    instruction:
      "Sing with purpose.\nFeel the tone in your centre — above the navel.\nHold and feel your core engage.",
  },
  {
    id: 14,
    part: 3,
    stageTypeId: "pitch-detection",
    title: "Sustain — Mid",
    subtitle: "3 seconds · heart",
    notes: [{ target: { kind: "slot", n: 4 }, seconds: 3 }],
    instruction:
      "Take a soft breath and sing openly.\nFeel the tone across your chest.\nHold and stay relaxed.",
  },
  {
    id: 15,
    part: 3,
    stageTypeId: "pitch-detection",
    title: "Sustain — Mid-high",
    subtitle: "3 seconds · throat",
    notes: [{ target: { kind: "slot", n: 5 }, seconds: 3 }],
    instruction:
      "Sing clearly from your throat.\nFeel the resonance in your neck and mouth.\nHold steady and clear.",
  },
  {
    id: 16,
    part: 3,
    stageTypeId: "pitch-detection",
    title: "Sustain — Upper-mid",
    subtitle: "3 seconds · forehead",
    notes: [{ target: { kind: "slot", n: 6 }, seconds: 3 }],
    instruction:
      "Sing gently.\nFeel the tone behind your forehead.\nHold and let it be soft and focused.",
  },
  {
    id: 17,
    part: 3,
    stageTypeId: "pitch-detection",
    title: "Sustain — High",
    subtitle: "3 seconds · crown",
    notes: [{ target: { kind: "slot", n: 7 }, seconds: 3 }],
    instruction:
      "Stay soft and feel the tone at the top of your head.\nKeep it light — don't push.\nHold and be present.",
  },
];
