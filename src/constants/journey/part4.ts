import type { JourneyStage } from "./types";

/** Part 4: Sequences — move through your range */
export const PART_4_STAGES: JourneyStage[] = [
  {
    id: 18,
    part: 4,
    stageTypeId: "pitch-detection",
    title: "Low sequence",
    subtitle: "2 tones · 2 seconds each",
    notes: [
      { target: { kind: "slot", n: 1 }, seconds: 2 },
      { target: { kind: "slot", n: 2 }, seconds: 2 },
    ],
    instruction:
      "Sing two low tones in sequence.\nMove from your lowest into the next tone above.\nFeel the resonance shift as you rise.",
  },
  {
    id: 19,
    part: 4,
    stageTypeId: "pitch-detection",
    title: "Low rise",
    subtitle: "3 tones rising · 2 seconds each",
    notes: [
      { target: { kind: "slot", n: 1 }, seconds: 2 },
      { target: { kind: "slot", n: 2 }, seconds: 2 },
      { target: { kind: "slot", n: 3 }, seconds: 2 },
    ],
    instruction:
      "Three tones rising from low.\nFeel the energy climb as you ascend.\nKeep it smooth and steady.",
  },
  {
    id: 20,
    part: 4,
    stageTypeId: "pitch-detection",
    title: "Low to mid",
    subtitle: "4 tones · low to mid · 2 seconds each",
    notes: [
      { target: { kind: "slot", n: 1 }, seconds: 2 },
      { target: { kind: "slot", n: 2 }, seconds: 2 },
      { target: { kind: "slot", n: 3 }, seconds: 2 },
      { target: { kind: "slot", n: 4 }, seconds: 2 },
    ],
    instruction:
      "Four tones from low up to mid range.\nKeep each tone smooth and connected.\nFeel the voice open as you rise.",
  },
  {
    id: 21,
    part: 4,
    stageTypeId: "pitch-detection",
    title: "Mid to upper",
    subtitle: "3 tones · mid to upper · 2 seconds each",
    notes: [
      { target: { kind: "slot", n: 4 }, seconds: 2 },
      { target: { kind: "slot", n: 5 }, seconds: 2 },
      { target: { kind: "slot", n: 6 }, seconds: 2 },
    ],
    instruction:
      "Three tones rising from mid range upward.\nLet the tones lift naturally.\nKeep it smooth and connected.",
  },
  {
    id: 22,
    part: 4,
    stageTypeId: "pitch-detection",
    title: "Upper range",
    subtitle: "2 high tones · 2 seconds each",
    notes: [
      { target: { kind: "slot", n: 6 }, seconds: 2 },
      { target: { kind: "slot", n: 7 }, seconds: 2 },
    ],
    instruction:
      "Two high tones.\nStay gentle as you move into the upper register.\nKeep it light as you go higher.",
  },
  {
    id: 23,
    part: 4,
    stageTypeId: "pitch-detection",
    title: "Full range",
    subtitle: "All 7 tones · 2 seconds each",
    notes: [
      { target: { kind: "slot", n: 1 }, seconds: 2 },
      { target: { kind: "slot", n: 2 }, seconds: 2 },
      { target: { kind: "slot", n: 3 }, seconds: 2 },
      { target: { kind: "slot", n: 4 }, seconds: 2 },
      { target: { kind: "slot", n: 5 }, seconds: 2 },
      { target: { kind: "slot", n: 6 }, seconds: 2 },
      { target: { kind: "slot", n: 7 }, seconds: 2 },
    ],
    instruction:
      "Sing all seven tones from low to high.\nMove slowly and keep your breath relaxed.\nFeel your full range open up.",
  },
];
