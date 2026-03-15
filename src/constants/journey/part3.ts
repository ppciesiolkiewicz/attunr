import type { JourneyExercise } from "./types";

/** Part 3: Lip Rolls & Breath — lip roll mastery, first humming, breathwork */
export const PART_3_EXERCISES: JourneyExercise[] = [
  {
    id: 8,
    part: 3,
    exerciseTypeId: "pitch-detection-slide",
    title: "Lip rolls — low to high",
    subtitle: "Glide from low to high · 2–3 times",
    technique: "lip-rolls",
    notes: [{ from: { kind: "index", i: 0 }, to: { kind: "index", i: -1 } }],
    instruction:
      "Slide smoothly from low to high — a continuous glide, not separate notes. Do it two or three times. Detection is loose; focus on the glide and warming up your voice.",
  },
  {
    id: 9,
    part: 3,
    exerciseTypeId: "pitch-detection",
    title: "Sustain a lip roll",
    subtitle: "Hold the buzz · 5 seconds",
    technique: "lip-rolls",
    notes: [{ target: { kind: "slot", n: 4 }, seconds: 5 }],
    instruction:
      "Hold one tone and sustain the lip roll for five seconds. Keep the buzz steady — lips vibrating without force. Feel the sound in your chest.",
  },
  {
    id: 10,
    part: 3,
    exerciseTypeId: "breathwork-farinelli",
    title: "Farinelli breathwork",
    maxCount: 6,
    instruction:
      "Inhale, hold, and exhale for the same count. Each cycle adds one beat. Let the rhythm settle your body and deepen your breath.",
  },
  {
    id: 11,
    part: 3,
    exerciseTypeId: "pitch-detection",
    title: "Low U",
    subtitle: "Chest voice · 5 seconds",
    technique: "sustain",
    notes: [{ target: { kind: "range", from: 0, to: 2, accept: "below" }, seconds: 5 }],
    instruction:
      "Sing uuuu low and steady. Feel the warmth in your chest. This revisits chest voice — let the sound settle deeper this time.",
  },
  {
    id: 12,
    part: 3,
    exerciseTypeId: "pitch-detection",
    title: "Hum — Low",
    subtitle: "Hum · 5 seconds",
    notes: [{ target: { kind: "slot", n: 1 }, seconds: 5 }],
    instruction:
      "Close your lips and hum mmmm on the lowest tone. Feel the buzz in your lips and teeth. This is your first taste of humming — one of the gentlest ways to feel your voice.",
  },
  {
    id: 13,
    part: 3,
    exerciseTypeId: "pitch-detection-slide",
    title: "Lip rolls — high to low",
    subtitle: "Glide from high to low · 2–3 times",
    technique: "lip-rolls",
    notes: [{ from: { kind: "index", i: -1 }, to: { kind: "index", i: 0 } }],
    instruction:
      "One more glide from high to low to close the section. Keep it smooth and easy.",
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
