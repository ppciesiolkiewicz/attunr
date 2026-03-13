import type { JourneyStage } from "./types";

/** Part 3: Sustain — seven tones across your range */
export const PART_3_STAGES: JourneyStage[] = [
  {
    id: 10,
    part: 3,
    stageTypeId: "intro",
    title: "Sustain",
    technique: "sustain",
    cardCue: "Hum each tone and feel where it resonates",
    instruction:
      "Humming is one of the gentlest and most powerful ways to feel your voice. Close your lips and sing mmmm — feel the buzz in your lips, teeth, and face. In these exercises, hum each tone for ten seconds. Lower tones resonate deep in the chest, higher tones lift into the head. There's no rush. Let the vibration settle before moving on.",
  },
  {
    id: 11,
    part: 3,
    stageTypeId: "pitch-detection",
    title: "Sustain — Low",
    subtitle: "Hum · 10 seconds",
    notes: [{ target: { kind: "slot", n: 1 }, seconds: 10 }],
    instruction:
      "Hum low and steady — mmmm.\nFeel the buzz settle deep in your chest.\nKeep it grounded and relaxed.",
  },
  {
    id: 12,
    part: 3,
    stageTypeId: "pitch-detection",
    title: "Sustain — Lower-mid",
    subtitle: "Hum · 10 seconds",
    notes: [{ target: { kind: "slot", n: 2 }, seconds: 10 }],
    instruction:
      "Hum just above your lowest tone.\nFeel the warmth spread through your chest.\nKeep the buzz steady.",
  },
  {
    id: 13,
    part: 3,
    stageTypeId: "pitch-detection",
    title: "Sustain — Mid-low",
    subtitle: "Hum · 10 seconds",
    notes: [{ target: { kind: "slot", n: 3 }, seconds: 10 }],
    instruction:
      "Hum with purpose.\nFeel the tone grow stronger in your body.\nKeep your breath even.",
  },
  {
    id: 14,
    part: 3,
    stageTypeId: "pitch-detection",
    title: "Sustain — Mid",
    subtitle: "Hum · 10 seconds",
    notes: [{ target: { kind: "slot", n: 4 }, seconds: 10 }],
    instruction:
      "Take a soft breath and hum openly.\nFeel the buzz in your chest and face.\nStay relaxed and present.",
  },
  {
    id: 15,
    part: 3,
    stageTypeId: "pitch-detection",
    title: "Sustain — Mid-high",
    subtitle: "Hum · 10 seconds",
    notes: [{ target: { kind: "slot", n: 5 }, seconds: 10 }],
    instruction:
      "Hum clearly and steadily.\nFeel the resonance shift forward.\nKeep the buzz steady and clear.",
  },
  {
    id: 16,
    part: 3,
    stageTypeId: "pitch-detection",
    title: "Sustain — Upper-mid",
    subtitle: "Hum · 10 seconds",
    notes: [{ target: { kind: "slot", n: 6 }, seconds: 10 }],
    instruction:
      "Hum gently.\nFeel the buzz lift into your face and head.\nKeep it soft and focused.",
  },
  {
    id: 17,
    part: 3,
    stageTypeId: "pitch-detection",
    title: "Sustain — High",
    subtitle: "Hum · 10 seconds",
    notes: [{ target: { kind: "slot", n: 7 }, seconds: 10 }],
    instruction:
      "Hum softly at the top of your range.\nFeel the buzz in your head.\nKeep it light — don't push.",
  },
];
