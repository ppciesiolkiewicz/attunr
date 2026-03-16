import type { JourneyExerciseInput } from "./types";
import { BandTargetKind } from "./types";

/** Part 20: Vocal Control — peak difficulty, all techniques combined */
export const PART_20_EXERCISES: JourneyExerciseInput[] = [
  {
    part: 20,
    exerciseTypeId: "learn",
    title: "Vocal control",
    cardCue: "Combine everything you've learned — full range, all vowels, all techniques",
    elements: [
      { type: "paragraph", text: "This is the culmination of your journey. Every technique — lip rolls, humming, vowels, puffy cheeks, sequences, and flows — comes together. The exercises here use your full range, all vowel shapes, and demand the most control. Take your time. You've earned this." },
      { type: "video" },
    ],
  },
  {
    part: 20,
    exerciseTypeId: "pitch-detection",
    title: "Puffy cheeks — rising sequence",
    subtitle: "4 tones skipping · 3 seconds each",
    technique: "puffy-cheeks",
    scale: { type: "even-7-from-major", root: 1 },
    notes: [
      { target: { kind: BandTargetKind.Index, i: 0 }, seconds: 3 },
      { target: { kind: BandTargetKind.Index, i: 2 }, seconds: 3 },
      { target: { kind: BandTargetKind.Index, i: 4 }, seconds: 3 },
      { target: { kind: BandTargetKind.Index, i: 6 }, seconds: 3 },
    ],
    instruction:
      "Puffy cheeks on four tones spanning your full range.\nBiggest challenge: breath control across big jumps.\nKeep the cheeks puffed through every transition.",
  },
  {
    part: 20,
    exerciseTypeId: "pitch-detection",
    title: "AH → EE flow — high",
    subtitle: "Vowel transition · 12 seconds",
    scale: { type: "even-7-from-major", root: 1 },
    notes: [{ target: { kind: BandTargetKind.Index, i: 5 }, seconds: 12 }],
    instruction:
      "Hold the upper-mid tone and flow from AH (open) to EE (narrow). On a high pitch, this demands precise control — the jaw must stay relaxed while the tongue lifts. Keep the pitch rock-steady.",
  },
  {
    part: 20,
    exerciseTypeId: "pitch-detection",
    title: "Descending sequence — OH",
    subtitle: "All 7 tones descending · 2 seconds each",
    scale: { type: "even-7-from-major", root: 1 },
    notes: [
      { target: { kind: BandTargetKind.Index, i: 6 }, seconds: 2 },
      { target: { kind: BandTargetKind.Index, i: 5 }, seconds: 2 },
      { target: { kind: BandTargetKind.Index, i: 4 }, seconds: 2 },
      { target: { kind: BandTargetKind.Index, i: 3 }, seconds: 2 },
      { target: { kind: BandTargetKind.Index, i: 2 }, seconds: 2 },
      { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 2 },
      { target: { kind: BandTargetKind.Index, i: 0 }, seconds: 2 },
    ],
    instruction:
      "Sing OH on all seven tones descending — high to low.\nYour first descending full-range sequence.\nFeel the resonance drop from head to chest.",
  },
  {
    part: 20,
    exerciseTypeId: "breathwork-farinelli",
    title: "Farinelli breathwork",
    maxCount: 12,
    instruction:
      "Inhale, hold, and exhale for the same count. Each cycle adds one beat. The longest Farinelli yet — your breath control at its peak.",
  },
  {
    part: 20,
    exerciseTypeId: "tone-follow",
    title: "Lip rolls — precision slide",
    subtitle: "Full range glide · play 3 times",
    technique: "lip-rolls",
    scale: { type: "chromatic", root: 1 },
    toneShape: { kind: "slide", from: { kind: BandTargetKind.Index, i: 0 }, to: { kind: BandTargetKind.Index, i: -1 } },
    requiredPlays: 3,
    instruction:
      "Play the tone and lip roll alongside it. Full range slide — focus on even speed throughout your range.",
  },
  {
    part: 20,
    exerciseTypeId: "pitch-detection",
    title: "Vowel cascade — high",
    subtitle: "All vowels on one pitch · 15 seconds",
    scale: { type: "even-7-from-major", root: 1 },
    notes: [{ target: { kind: BandTargetKind.Index, i: 4 }, seconds: 15 }],
    instruction:
      "Hold the mid-high tone and flow through all six vowels: U → OO → OH → AH → EH → EE. Fifteen seconds — the longest sustained exercise. Take your time with each transition. This is mastery: full vowel control on a single pitch.",
    completionModal: {
      title: "Part XX Complete",
      subtitle: "Vocal Control",
      elements: [
        { type: "paragraph", text: "Full vocal control — all techniques combined across your entire range. Puffy cheeks sequences, high vowel flows, descending sequences, and the extended vowel cascade." },
        { type: "paragraph", text: "You've completed the full journey. Return to any part to deepen your practice, or create your own sequences from the exercises you've learned." },
      ],
      confetti: true,
    },
  },
];
