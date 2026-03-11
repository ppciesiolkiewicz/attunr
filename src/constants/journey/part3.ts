import type { JourneyStage } from "./types";

/** Part 3: Sustain (foundation) */
export const PART_3_STAGES: JourneyStage[] = [
  {
    id: 10,
    part: 3,
    type: "technique_intro",
    title: "Sustain",
    chakraIds: [],
    holdSeconds: 0,
    noteSeconds: 0,
    technique: "sustain",
    cardCue: "Hold each tone steadily and feel where it resonates",
    instruction:
      "Sing and hold each tone steadily. Feel where it resonates in your body — lower tones in the chest, higher in the head. There's no rush. Let the sound settle.",
  },
  {
    id: 11,
    part: 3,
    type: "individual",
    title: "Root",
    chakraIds: ["root"],
    holdSeconds: 3,
    noteSeconds: 0,
    technique: "sustain",
    chakraDetailStyle: "full",
    instruction:
      "Root placement — LAM.\nSing low and feel the tone settle in your chest.\nThis can help you feel safe, present, and at home in your body.",
  },
  {
    id: 12,
    part: 3,
    type: "individual",
    title: "Sacral",
    chakraIds: ["sacral"],
    holdSeconds: 3,
    noteSeconds: 0,
    technique: "sustain",
    chakraDetailStyle: "full",
    instruction:
      "Sacral placement — VAM.\nLet the sound flow from your lower belly.\nThis can support creativity, flow, and emotional ease.",
  },
  {
    id: 13,
    part: 3,
    type: "individual",
    title: "Solar Plexus",
    chakraIds: ["solar-plexus"],
    holdSeconds: 3,
    noteSeconds: 0,
    technique: "sustain",
    chakraDetailStyle: "full",
    instruction:
      "Solar Plexus placement — RAM.\nSing with purpose and feel your centre.\nThis can support confidence and personal power.",
  },
  {
    id: 14,
    part: 3,
    type: "individual",
    title: "Heart",
    chakraIds: ["heart"],
    holdSeconds: 3,
    noteSeconds: 0,
    technique: "sustain",
    chakraDetailStyle: "full",
    instruction:
      "Heart placement — YAM.\nTake a soft breath and sing openly from the chest.\nThis can support compassion, connection, and emotional balance.",
  },
  {
    id: 15,
    part: 3,
    type: "individual",
    title: "Throat",
    chakraIds: ["throat"],
    holdSeconds: 3,
    noteSeconds: 0,
    technique: "sustain",
    chakraDetailStyle: "full",
    instruction:
      "Throat placement — HAM.\nSing clearly and feel the resonance in your throat.\nThis can support honest expression and clear communication.",
  },
  {
    id: 16,
    part: 3,
    type: "individual",
    title: "Third Eye",
    chakraIds: ["third-eye"],
    holdSeconds: 3,
    noteSeconds: 0,
    technique: "sustain",
    chakraDetailStyle: "full",
    instruction:
      "Third Eye placement — OM.\nSing gently and feel the tone behind your forehead.\nThis can support intuition, clarity, and expanded perception.",
  },
  {
    id: 17,
    part: 3,
    type: "individual",
    title: "Crown",
    chakraIds: ["crown"],
    holdSeconds: 3,
    noteSeconds: 0,
    technique: "sustain",
    chakraDetailStyle: "full",
    instruction:
      "Crown placement — AH.\nStay soft and feel the tone at the top of your head.\nThis can support a sense of peace, presence, and unity.",
  },
];
