import type { JourneyExercise } from "./types";

/** Part 15: Warmup III — advanced warmup revisiting all techniques */
export const PART_15_EXERCISES: JourneyExercise[] = [
  {
    id: 80,
    part: 15,
    exerciseTypeId: "learn",
    title: "Advanced warmup",
    cardCue: "Revisit all techniques with greater range and control",
    instruction:
      "You've built a strong foundation: lip rolls, humming, multiple vowels, puffy cheeks, and breathwork. This advanced warmup combines all techniques across a wider range. Think of it as a complete warm-up routine you can return to before any practice session.",
  },
  {
    id: 81,
    part: 15,
    exerciseTypeId: "pitch-detection-slide",
    title: "Lip rolls — high to low",
    subtitle: "Full range glide · 2–3 times",
    technique: "lip-rolls",
    notes: [{ from: { kind: "index", i: -1 }, to: { kind: "index", i: 0 } }],
    instruction:
      "Full range lip roll slide — high to low. Smooth and controlled, covering your entire range.",
  },
  {
    id: 82,
    part: 15,
    exerciseTypeId: "pitch-detection-slide",
    title: "Lip rolls — low to high",
    subtitle: "Full range glide · 2–3 times",
    technique: "lip-rolls",
    notes: [{ from: { kind: "index", i: 0 }, to: { kind: "index", i: -1 } }],
    instruction:
      "Full range lip roll slide — low to high. Even speed through the passaggio.",
  },
  {
    id: 83,
    part: 15,
    exerciseTypeId: "pitch-detection",
    title: "Puffy cheeks — Mid-high",
    subtitle: "Breath control · 8 seconds",
    technique: "puffy-cheeks",
    notes: [{ target: { kind: "slot", n: 5 }, seconds: 8 }],
    instruction:
      "Sing on the mid-high tone with puffy cheeks.\nHigher than before — more breath control needed.\nKeep it steady and supported.",
  },
  {
    id: 84,
    part: 15,
    exerciseTypeId: "breathwork-farinelli",
    title: "Farinelli breathwork",
    maxCount: 10,
    instruction:
      "Inhale, hold, and exhale for the same count. Each cycle adds one beat. Deepen the breath between the warmup exercises.",
  },
  {
    id: 85,
    part: 15,
    exerciseTypeId: "pitch-detection",
    title: "Full range hum sequence",
    subtitle: "4 tones skipping · 3 seconds each",
    notes: [
      { target: { kind: "slot", n: 1 }, seconds: 3 },
      { target: { kind: "slot", n: 3 }, seconds: 3 },
      { target: { kind: "slot", n: 5 }, seconds: 3 },
      { target: { kind: "slot", n: 7 }, seconds: 3 },
    ],
    instruction:
      "Hum four tones spanning your full range — skipping every other note.\nLow, mid-low, mid-high, high.\nFeel the resonance shift from chest to head as you climb.",
    completionModal: {
      title: "Part XV Complete",
      subtitle: "Warmup III",
      elements: [
        { id: "learned", type: "paragraph", text: "Advanced warmup combining lip rolls, puffy cheeks, and full-range humming sequences." },
        { id: "tip", type: "paragraph", text: "This advanced warmup is a complete routine. Use it before performances or longer practice sessions." },
      ],
      confetti: true,
    },
  },
];
