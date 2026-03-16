import type { JourneyExerciseInput } from "./types";
import { BandTargetKind } from "./types";

/** Part 3: Lip Rolls & Breath — lip roll mastery, first humming, breathwork */
export const PART_3_EXERCISES: JourneyExerciseInput[] = [
  {
    part: 3,
    exerciseTypeId: "tone-follow",
    title: "Lip rolls — low to high",
    subtitle: "Glide from low to high · play 3 times",
    technique: "lip-rolls",
    scale: { type: "chromatic", root: 1 },
    displayNotes: [{ type: "major", root: 1, notes: [] }],
    toneShape: { kind: "slide", from: { kind: BandTargetKind.Index, i: 0 }, to: { kind: BandTargetKind.Index, i: -1 } },
    requiredPlays: 3,
    instruction:
      "Play the tone and lip roll alongside it. Slide smoothly from low to high — feel the glide in your lips.",
  },
  {
    part: 3,
    exerciseTypeId: "tone-follow",
    title: "Sustain a lip roll",
    subtitle: "Hold the buzz · play 3 times",
    technique: "lip-rolls",
    scale: { type: "even-7-from-major", root: 1 },
    toneShape: { kind: "sustain", target: { kind: BandTargetKind.Index, i: 3 }, seconds: 5 },
    requiredPlays: 3,
    instruction:
      "Play the tone and lip roll alongside it. Keep the buzz steady — lips vibrating without force.",
  },
  {
    part: 3,
    exerciseTypeId: "breathwork-farinelli",
    title: "Farinelli breathwork",
    maxCount: 6,
    instruction:
      "Inhale, hold, and exhale for the same count. Each cycle adds one beat. Let the rhythm settle your body and deepen your breath.",
  },
  {
    part: 3,
    exerciseTypeId: "pitch-detection",
    title: "Low U",
    subtitle: "Chest voice · 5 seconds",
    technique: "sustain",
    scale: { type: "chromatic", root: 1 },
    notes: [{ target: { kind: BandTargetKind.Range, from: 0, to: 2, accept: "below" }, seconds: 5 }],
    instruction:
      "Sing uuuu low and steady. Feel the warmth in your chest. This revisits chest voice — let the sound settle deeper this time.",
  },
  {
    part: 3,
    exerciseTypeId: "pitch-detection",
    title: "Hum — Low",
    subtitle: "Hum · 5 seconds",
    scale: { type: "even-7-from-major", root: 1 },
    notes: [{ target: { kind: BandTargetKind.Index, i: 0 }, seconds: 5 }],
    instruction:
      "Close your lips and hum mmmm on the lowest tone. Feel the buzz in your lips and teeth. This is your first taste of humming — one of the gentlest ways to feel your voice.",
  },
  {
    part: 3,
    exerciseTypeId: "tone-follow",
    title: "Lip rolls — high to low",
    subtitle: "Glide from high to low · play 3 times",
    technique: "lip-rolls",
    scale: { type: "chromatic", root: 1 },
    displayNotes: [{ type: "major", root: 1, notes: [] }],
    toneShape: { kind: "slide", from: { kind: BandTargetKind.Index, i: -1 }, to: { kind: BandTargetKind.Index, i: 0 } },
    requiredPlays: 3,
    instruction:
      "Play the tone and lip roll alongside it. One more glide from high to low — keep it smooth and easy.",
    completionModal: {
      title: "Part III Complete",
      subtitle: "Lip Rolls & Breath",
      elements: [
        { type: "paragraph", text: "Sustained lip rolls, deeper breathwork, and your first humming — building control and relaxation." },
        { type: "paragraph", text: "Lip rolls are a great way to start any singing session." },
      ],
      confetti: true,
    },
  },
];
