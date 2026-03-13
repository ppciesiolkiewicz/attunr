import type { JourneyStage } from "./types";

/** Part 2: Vocal warmups */
export const PART_2_STAGES: JourneyStage[] = [
  {
    id: 2,
    part: 2,
    stageTypeId: "intro",
    title: "Chest and head voice",
    technique: "sustain",
    cardCue: "Find your chest and head voice",
    instruction:
      "Your voice has different resonances: chest voice (lower, fuller, felt in the chest) and head voice (lighter, higher, felt in the head and face). The next two exercises help you find them. Low U warms up your chest voice on a low tone. Hoo hoo introduces head voice — a light, owl-like sound on a high tone. Feel where each lands in your body.",
  },
  {
    id: 3,
    part: 2,
    stageTypeId: "pitch-detection",
    title: "Low U",
    subtitle: "Chest voice · 10 seconds",
    technique: "sustain",
    notes: [{ target: { kind: "range", from: 0, to: 2, accept: "below" }, seconds: 10 }],
    instruction:
      "Sing uuuu (as in 'moon') on a low tone. Slightly wobble your voice between lower and a touch higher to keep it loose and relaxed. This warms up your lower register and grounds the voice.",
  },
  {
    id: 4,
    part: 2,
    stageTypeId: "pitch-detection",
    title: "Hoo hoo",
    subtitle: "Head voice · 10 seconds",
    technique: "sustain",
    notes: [{ target: { kind: "range", from: -3, to: -1, accept: "above" }, seconds: 10 }],
    instruction:
      "Sing 'hoo hoo' on a high tone, like an owl. This is head voice — a lighter, higher resonance. Feel the sound in your head and face. Keep it gentle.",
  },
  {
    id: 5,
    part: 2,
    stageTypeId: "breathwork",
    title: "Farinelli breathwork",
    maxCount: 10,
    cardCue: "Calm your nervous system and build steady diaphragm control",
    instruction:
      "Build diaphragm control and calm your nervous system — a favourite of singers and performers for centuries. Inhale, hold, and exhale for the same count — each cycle adds one beat, flowing straight into the next with no pause.",
  },
  {
    id: 6,
    part: 2,
    stageTypeId: "intro",
    title: "Lip rolls",
    technique: "lip-rolls",
    cardCue: "Gentle warmup to relax your jaw and warm your voice",
    instruction:
      "Lip rolls are a vocal warmup where you let your lips buzz loosely — like a motorboat — while you sing. They're one of the gentlest ways to start: the buzz relaxes your jaw, warms your voice, and encourages steady breath without strain. In the next exercises, you'll slide your voice from high to low and low to high — a smooth, continuous glide through your range, not separate notes. Many singers and voice teachers use them first, before scales or songs. Do them for a few minutes before each session — your voice will thank you.",
  },
  {
    id: 7,
    part: 2,
    stageTypeId: "pitch-detection-slide",
    title: "Lip rolls — high to low",
    subtitle: "Glide from high to low · 2–3 times",
    technique: "lip-rolls",
    notes: [{ from: { kind: "index", i: -1 }, to: { kind: "index", i: 0 } }],
    instruction:
      "Slide smoothly from high to low — a continuous glide, not separate notes. Do it two or three times. Detection is loose; focus on the glide and warming up your voice.",
  },
  {
    id: 8,
    part: 2,
    stageTypeId: "pitch-detection-slide",
    title: "Lip rolls — low to high",
    subtitle: "Glide from low to high · 2–3 times",
    technique: "lip-rolls",
    notes: [{ from: { kind: "index", i: 0 }, to: { kind: "index", i: -1 } }],
    instruction:
      "Slide smoothly from low to high — a continuous glide, not separate notes. Do it two or three times. Detection is loose; focus on the glide and warming up your voice.",
  },
  {
    id: 9,
    part: 2,
    stageTypeId: "pitch-detection",
    title: "Sustain a lip roll",
    subtitle: "Hold the buzz · 10 seconds",
    technique: "lip-rolls",
    notes: [{ target: { kind: "slot", n: 4 }, seconds: 10 }],
    instruction:
      "Hold one tone and sustain the lip roll for ten seconds. Keep the buzz steady — lips vibrating without force. Feel the sound in your chest.",
  },
];
