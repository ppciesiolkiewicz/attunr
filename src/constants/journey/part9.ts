import type { JourneyStage } from "./types";

/** Part 9: Chakras and Yoga of Sounds */
export const PART_9_STAGES: JourneyStage[] = [
  {
    id: 42,
    part: 9,
    stageTypeId: "intro",
    title: "Chakras and Yoga of Sounds",
    technique: "mantra",
    cardCue: "Discover the ancient system of body, tone, and seed syllable",
    instruction:
      "Nāda yoga — the yoga of sound — is one of the oldest Indian traditions, teaching that sound is the primordial creative force. The seven chakras are energy centres along the spine, each tied to a tone, body region, colour, and element.\n\nEach chakra has a seed syllable (bija mantra). Singing that sound on the matching tone concentrates vibration in that centre and deepens body awareness:\n\nRoot · LAM · chest and base of spine\nSacral · VAM · lower belly\nSolar Plexus · RAM · centre above the navel\nHeart · YAM · chest and heart area\nThroat · HAM · throat and neck\nThird Eye · OM · behind the forehead\nCrown · AH · top of the head\n\nSing each mantra slowly and intentionally. Feel where the sound lands.",
  },
  {
    id: 43,
    part: 9,
    stageTypeId: "pitch-detection",
    title: "Root — LAM",
    subtitle: "Mantra · Root tone · 10 seconds",
    technique: "mantra",
    notes: [{ target: { kind: "slot", n: 1 }, seconds: 10 }],
    instruction:
      "Sing LAM on the Root tone.\nFeel the 'L' and 'M' shape the sound — the 'ah' carries the pitch.\nFeel the tone settle in your chest and base.",
  },
  {
    id: 44,
    part: 9,
    stageTypeId: "pitch-detection",
    title: "Sacral — VAM",
    subtitle: "Mantra · Sacral tone · 10 seconds",
    technique: "mantra",
    notes: [{ target: { kind: "slot", n: 2 }, seconds: 10 }],
    instruction:
      "Sing VAM on the Sacral tone.\nLet the sound flow from your lower belly.",
  },
  {
    id: 45,
    part: 9,
    stageTypeId: "pitch-detection",
    title: "Solar Plexus — RAM",
    subtitle: "Mantra · Solar Plexus tone · 10 seconds",
    technique: "mantra",
    notes: [{ target: { kind: "slot", n: 3 }, seconds: 10 }],
    instruction:
      "Sing RAM on the Solar Plexus tone.\nFeel the power in the 'R' — purpose and centre.",
  },
  {
    id: 46,
    part: 9,
    stageTypeId: "pitch-detection",
    title: "Heart — YAM",
    subtitle: "Mantra · Heart tone · 10 seconds",
    technique: "mantra",
    notes: [{ target: { kind: "slot", n: 4 }, seconds: 10 }],
    instruction:
      "Sing YAM on the Heart tone.\nOpen and soft — the bridge between body and mind.",
  },
  {
    id: 47,
    part: 9,
    stageTypeId: "pitch-detection",
    title: "Throat — HAM",
    subtitle: "Mantra · Throat tone · 10 seconds",
    technique: "mantra",
    notes: [{ target: { kind: "slot", n: 5 }, seconds: 10 }],
    instruction:
      "Sing HAM on the Throat tone.\nClear and true — let your voice be heard.",
  },
  {
    id: 48,
    part: 9,
    stageTypeId: "pitch-detection",
    title: "Third Eye — OM",
    subtitle: "Mantra · Third Eye tone · 10 seconds",
    technique: "mantra",
    notes: [{ target: { kind: "slot", n: 6 }, seconds: 10 }],
    instruction:
      "Sing OM on the Third Eye tone.\nGentle and inward — clarity and insight.",
  },
  {
    id: 49,
    part: 9,
    stageTypeId: "pitch-detection",
    title: "Crown — AH",
    subtitle: "Mantra · Crown tone · 10 seconds",
    technique: "mantra",
    notes: [{ target: { kind: "slot", n: 7 }, seconds: 10 }],
    instruction:
      "Sing AH on the Crown tone.\nSoft and open — presence and unity.",
  },
];
