import type { JourneyExerciseInput } from "./types";
import { BandTargetKind } from "./types";

/** Part 11: Chakras — Earth — Root to Heart mantras */
export const PART_11_EXERCISES: JourneyExerciseInput[] = [
  {
    part: 11,
    exerciseTypeId: "learn",
    title: "Chakras and Yoga of Sounds",
    technique: "mantra",
    cardCue: "Discover the ancient system of body, tone, and seed syllable",
    elements: [
      { type: "paragraph", text: "Nāda yoga — the yoga of sound — is one of the oldest Indian traditions, teaching that sound is the primordial creative force. The seven chakras are energy centres along the spine, each tied to a tone, body region, colour, and element." },
      { type: "paragraph", text: "Each chakra has a seed syllable (bija mantra). Singing that sound on the matching tone concentrates vibration in that centre and deepens body awareness:", variant: "secondary" },
      { type: "paragraph", text: "Root · LAM · chest and base of spine\nSacral · VAM · lower belly\nSolar Plexus · RAM · centre above the navel\nHeart · YAM · chest and heart area\nThroat · HAM · throat and neck\nThird Eye · OM · behind the forehead\nCrown · AH · top of the head", variant: "secondary" },
      { type: "paragraph", text: "We begin with the four lower chakras — Earth energy. Sing each mantra slowly and intentionally.", variant: "secondary" },
      { type: "video" },
    ],
  },
  {
    part: 11,
    exerciseTypeId: "pitch-detection",
    title: "Root — LAM",
    subtitle: "Mantra · Root tone · 8 seconds",
    technique: "mantra",
    scale: { type: "even-7-from-major", root: 1 },
    notes: [{ target: { kind: BandTargetKind.Index, i: 0 }, seconds: 8 }],
    instruction:
      "Sing LAM on the Root tone.\nFeel the 'L' and 'M' shape the sound — the 'ah' carries the pitch.\nFeel the tone settle in your chest and base.",
  },
  {
    part: 11,
    exerciseTypeId: "pitch-detection",
    title: "Sacral — VAM",
    subtitle: "Mantra · Sacral tone · 8 seconds",
    technique: "mantra",
    scale: { type: "even-7-from-major", root: 1 },
    notes: [{ target: { kind: BandTargetKind.Index, i: 1 }, seconds: 8 }],
    instruction:
      "Sing VAM on the Sacral tone.\nLet the sound flow from your lower belly.",
  },
  {
    part: 11,
    exerciseTypeId: "pitch-detection",
    title: "Solar Plexus — RAM",
    subtitle: "Mantra · Solar Plexus tone · 8 seconds",
    technique: "mantra",
    scale: { type: "even-7-from-major", root: 1 },
    notes: [{ target: { kind: BandTargetKind.Index, i: 2 }, seconds: 8 }],
    instruction:
      "Sing RAM on the Solar Plexus tone.\nFeel the power in the 'R' — purpose and centre.",
  },
  {
    part: 11,
    exerciseTypeId: "pitch-detection",
    title: "Heart — YAM",
    subtitle: "Mantra · Heart tone · 8 seconds",
    technique: "mantra",
    scale: { type: "even-7-from-major", root: 1 },
    notes: [{ target: { kind: BandTargetKind.Index, i: 3 }, seconds: 8 }],
    instruction:
      "Sing YAM on the Heart tone.\nOpen and soft — the bridge between body and mind.",
  },
  {
    part: 11,
    exerciseTypeId: "breathwork-farinelli",
    title: "Farinelli breathwork",
    maxCount: 9,
    instruction:
      "Inhale, hold, and exhale for the same count. Each cycle adds one beat. Let the breath settle the energy from the four earth chakras.",
  },
];
