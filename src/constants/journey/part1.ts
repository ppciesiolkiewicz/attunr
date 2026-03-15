import type { LearnExercise } from "./types";

/** Part 1: Vocal placement (foundation) */
export const PART_1_EXERCISES: LearnExercise[] = [
  {
    id: 1,
    part: 1,
    exerciseTypeId: "learn",
    title: "Vocal placement",
    technique: "sustain",
    cardCue: "Discover vocal placement and how it connects voice to body awareness",
    elements: [
      { type: "paragraph", text: "Vocal placement is the practice of directing your voice to resonate in different parts of your body. Lower tones naturally settle in the chest, mid-range tones open in the throat and mouth, and higher tones lift into the sinuses and head." },
      { type: "paragraph", text: "By singing across your range, you develop awareness of where sound lives in your body and build a deeper connection between voice, breath, and presence. The goal is not perfection, but feeling where the sound lands and how it shifts your state.", variant: "secondary" },
      { type: "video" },
    ],
    completionModal: {
      title: "Part I Complete",
      subtitle: "Introduction",
      elements: [
        { type: "paragraph", text: "Vocal placement and how sound resonates differently across your body." },
      ],
      confetti: true,
    },
  },
];
