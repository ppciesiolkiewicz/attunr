import type { JourneyStage } from "./types";

/** Part 20: Vocal Control — peak difficulty, all techniques combined */
export const PART_20_STAGES: JourneyStage[] = [
  {
    id: 110,
    part: 20,
    stageTypeId: "intro",
    title: "Vocal control",
    cardCue: "Combine everything you've learned — full range, all vowels, all techniques",
    instruction:
      "This is the culmination of your journey. Every technique — lip rolls, humming, vowels, puffy cheeks, sequences, and flows — comes together. The exercises here use your full range, all vowel shapes, and demand the most control. Take your time. You've earned this.",
  },
  {
    id: 111,
    part: 20,
    stageTypeId: "pitch-detection",
    title: "Puffy cheeks — rising sequence",
    subtitle: "4 tones skipping · 3 seconds each",
    technique: "puffy-cheeks",
    notes: [
      { target: { kind: "slot", n: 1 }, seconds: 3 },
      { target: { kind: "slot", n: 3 }, seconds: 3 },
      { target: { kind: "slot", n: 5 }, seconds: 3 },
      { target: { kind: "slot", n: 7 }, seconds: 3 },
    ],
    instruction:
      "Puffy cheeks on four tones spanning your full range.\nBiggest challenge: breath control across big jumps.\nKeep the cheeks puffed through every transition.",
  },
  {
    id: 112,
    part: 20,
    stageTypeId: "pitch-detection",
    title: "AH → EE flow — high",
    subtitle: "Vowel transition · 12 seconds",
    notes: [{ target: { kind: "slot", n: 6 }, seconds: 12 }],
    instruction:
      "Hold the upper-mid tone and flow from AH (open) to EE (narrow). On a high pitch, this demands precise control — the jaw must stay relaxed while the tongue lifts. Keep the pitch rock-steady.",
  },
  {
    id: 113,
    part: 20,
    stageTypeId: "pitch-detection",
    title: "Descending sequence — OH",
    subtitle: "All 7 tones descending · 2 seconds each",
    notes: [
      { target: { kind: "slot", n: 7 }, seconds: 2 },
      { target: { kind: "slot", n: 6 }, seconds: 2 },
      { target: { kind: "slot", n: 5 }, seconds: 2 },
      { target: { kind: "slot", n: 4 }, seconds: 2 },
      { target: { kind: "slot", n: 3 }, seconds: 2 },
      { target: { kind: "slot", n: 2 }, seconds: 2 },
      { target: { kind: "slot", n: 1 }, seconds: 2 },
    ],
    instruction:
      "Sing OH on all seven tones descending — high to low.\nYour first descending full-range sequence.\nFeel the resonance drop from head to chest.",
  },
  {
    id: 114,
    part: 20,
    stageTypeId: "breathwork",
    title: "Farinelli breathwork",
    maxCount: 12,
    instruction:
      "Inhale, hold, and exhale for the same count. Each cycle adds one beat. The longest Farinelli yet — your breath control at its peak.",
  },
  {
    id: 115,
    part: 20,
    stageTypeId: "pitch-detection-slide",
    title: "Lip rolls — precision slide",
    subtitle: "Full range glide · smooth and even",
    technique: "lip-rolls",
    notes: [{ from: { kind: "index", i: 0 }, to: { kind: "index", i: -1 } }],
    instruction:
      "Full range lip roll slide — low to high. Focus on even speed throughout. No rushing through the middle — every part of your range gets equal attention.",
  },
  {
    id: 116,
    part: 20,
    stageTypeId: "pitch-detection",
    title: "Vowel cascade — high",
    subtitle: "All vowels on one pitch · 15 seconds",
    notes: [{ target: { kind: "slot", n: 5 }, seconds: 15 }],
    instruction:
      "Hold the mid-high tone and flow through all six vowels: U → OO → OH → AH → EH → EE. Fifteen seconds — the longest sustained exercise. Take your time with each transition. This is mastery: full vowel control on a single pitch.",
  },
];
