import type { JourneyStage } from "./types";

/** Part 10: Sequences & Range — multi-tone sequences with known vowels */
export const PART_10_STAGES: JourneyStage[] = [
  {
    id: 50,
    part: 10,
    stageTypeId: "pitch-detection",
    title: "Low sequence — U",
    subtitle: "3 tones rising · 2 seconds each",
    notes: [
      { target: { kind: "slot", n: 1 }, seconds: 2 },
      { target: { kind: "slot", n: 2 }, seconds: 2 },
      { target: { kind: "slot", n: 3 }, seconds: 2 },
    ],
    instruction:
      "Sing U on three rising tones — low range.\nKeep the lips rounded and the transitions smooth.\nFeel each tone connect to the next.",
  },
  {
    id: 51,
    part: 10,
    stageTypeId: "pitch-detection",
    title: "Skip sequence — Hum",
    subtitle: "3 tones skipping · 3 seconds each",
    notes: [
      { target: { kind: "slot", n: 1 }, seconds: 3 },
      { target: { kind: "slot", n: 3 }, seconds: 3 },
      { target: { kind: "slot", n: 5 }, seconds: 3 },
    ],
    instruction:
      "Hum three tones, skipping every other note — low, mid-low, mid-high.\nBigger jumps require more control.\nKeep the transitions smooth.",
  },
  {
    id: 52,
    part: 10,
    stageTypeId: "breathwork",
    title: "Farinelli breathwork",
    maxCount: 8,
    instruction:
      "Inhale, hold, and exhale for the same count. Each cycle adds one beat. Centre yourself between the sequences.",
  },
  {
    id: 53,
    part: 10,
    stageTypeId: "pitch-detection",
    title: "Rising sequence — AH",
    subtitle: "5 tones rising · 2 seconds each",
    notes: [
      { target: { kind: "slot", n: 2 }, seconds: 2 },
      { target: { kind: "slot", n: 3 }, seconds: 2 },
      { target: { kind: "slot", n: 4 }, seconds: 2 },
      { target: { kind: "slot", n: 5 }, seconds: 2 },
    ],
    instruction:
      "Sing AH on four rising tones — low to mid-high.\nKeep the jaw relaxed and open on each tone.\nThis is your longest rising sequence yet.",
  },
  {
    id: 54,
    part: 10,
    stageTypeId: "pitch-detection-slide",
    title: "Lip rolls — low to high",
    subtitle: "Glide · 2–3 times",
    technique: "lip-rolls",
    notes: [{ from: { kind: "index", i: 0 }, to: { kind: "index", i: -1 } }],
    instruction:
      "Lip roll slide from low to high. A quick reset after the sequence work.",
  },
  {
    id: 55,
    part: 10,
    stageTypeId: "pitch-detection",
    title: "Rising sequence — OO",
    subtitle: "5 tones rising · 2 seconds each",
    notes: [
      { target: { kind: "slot", n: 1 }, seconds: 2 },
      { target: { kind: "slot", n: 2 }, seconds: 2 },
      { target: { kind: "slot", n: 3 }, seconds: 2 },
      { target: { kind: "slot", n: 4 }, seconds: 2 },
      { target: { kind: "slot", n: 5 }, seconds: 2 },
    ],
    instruction:
      "Sing OO on five rising tones — low to mid-high.\nKeep the lips rounded through every tone.\nFeel the range opening up.",
  },
];
