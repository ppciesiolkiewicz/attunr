import type { JourneyExerciseInput } from "./types";
import { BandTargetKind } from "./types";

/** Part 15: Warmup III — advanced warmup revisiting all techniques */
export const PART_15_EXERCISES: JourneyExerciseInput[] = [
  {
    part: 15,
    exerciseTypeId: "learn",
    title: "Advanced warmup",
    cardCue: "Revisit all techniques with greater range and control",
    elements: [
      { type: "paragraph", text: "You've built a strong foundation: lip rolls, humming, multiple vowels, puffy cheeks, and breathwork. This advanced warmup combines all techniques across a wider range. Think of it as a complete warm-up routine you can return to before any practice session." },
      { type: "video" },
    ],
  },
  {
    part: 15,
    exerciseTypeId: "tone-follow",
    title: "Lip rolls — high to low",
    subtitle: "Full range glide · play 3 times",
    technique: "lip-rolls",
    scale: { type: "chromatic", root: 1 },
    toneShape: { kind: "slide", from: { kind: BandTargetKind.Index, i: -1 }, to: { kind: BandTargetKind.Index, i: 0 } },
    requiredPlays: 3,
    instruction:
      "Play the tone and lip roll alongside it. Full range slide from high to low — smooth and controlled.",
  },
  {
    part: 15,
    exerciseTypeId: "tone-follow",
    title: "Lip rolls — low to high",
    subtitle: "Full range glide · play 3 times",
    technique: "lip-rolls",
    scale: { type: "chromatic", root: 1 },
    toneShape: { kind: "slide", from: { kind: BandTargetKind.Index, i: 0 }, to: { kind: BandTargetKind.Index, i: -1 } },
    requiredPlays: 3,
    instruction:
      "Play the tone and lip roll alongside it. Full range slide from low to high — even speed through the passaggio.",
  },
  {
    part: 15,
    exerciseTypeId: "pitch-detection",
    title: "Puffy cheeks — Mid-high",
    subtitle: "Breath control · 8 seconds",
    technique: "puffy-cheeks",
    scale: { type: "even-7-from-major", root: 1 },
    notes: [{ target: { kind: BandTargetKind.Index, i: 4 }, seconds: 8 }],
    instruction:
      "Sing on the mid-high tone with puffy cheeks.\nHigher than before — more breath control needed.\nKeep it steady and supported.",
  },
  {
    part: 15,
    exerciseTypeId: "breathwork-farinelli",
    title: "Farinelli breathwork",
    maxCount: 10,
    instruction:
      "Inhale, hold, and exhale for the same count. Each cycle adds one beat. Deepen the breath between the warmup exercises.",
  },
  {
    part: 15,
    exerciseTypeId: "pitch-detection",
    title: "Full range hum sequence",
    subtitle: "4 tones skipping · 3 seconds each",
    scale: { type: "even-7-from-major", root: 1 },
    notes: [
      { target: { kind: BandTargetKind.Index, i: 0 }, seconds: 3 },
      { target: { kind: BandTargetKind.Index, i: 2 }, seconds: 3 },
      { target: { kind: BandTargetKind.Index, i: 4 }, seconds: 3 },
      { target: { kind: BandTargetKind.Index, i: 6 }, seconds: 3 },
    ],
    instruction:
      "Hum four tones spanning your full range — skipping every other note.\nLow, mid-low, mid-high, high.\nFeel the resonance shift from chest to head as you climb.",
    completionModal: {
      title: "Part XV Complete",
      subtitle: "Warmup III",
      elements: [
        { type: "paragraph", text: "Advanced warmup combining lip rolls, puffy cheeks, and full-range humming sequences." },
        { type: "paragraph", text: "This advanced warmup is a complete routine. Use it before performances or longer practice sessions." },
      ],
      confetti: true,
    },
  },
];
