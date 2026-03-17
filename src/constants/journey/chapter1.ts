import { BandTargetKind } from "./types";
import type { StageConfigInput } from "./types";

// ── Chapter 1: Introduction ─────────────────────────────────────────────────
// No warmup — the user's very first experience.

export const CHAPTER_1_STAGES: StageConfigInput[] = [
  // ── Stage 1: Wake Up ────────────────────────────────────────────────────
  {
    id: "ch1-wake-up",
    title: "Wake Up",
    exercises: [
      {
        exerciseTypeId: "learn",
        title: "Vocal placement",
        cardCue: "Discover vocal placement and how it connects voice to body awareness",
        elements: [
          {
            type: "paragraph",
            text: "Vocal placement is the practice of directing your voice to resonate in different parts of your body. Lower tones naturally settle in the chest, mid-range tones open in the throat and mouth, and higher tones lift into the sinuses and head.",
          },
          {
            type: "paragraph",
            text: "By singing across your range, you develop awareness of where sound lives in your body and build a deeper connection between voice, breath, and presence. The goal is not perfection, but feeling where the sound lands and how it shifts your state.",
            variant: "secondary",
          },
          { type: "video" },
        ],
      },
      {
        exerciseTypeId: "learn-notes-1",
        title: "Understanding notes",
        cardCue: "Learn how musical notes work and see your vocal range",
      },
      {
        exerciseTypeId: "volume-detection",
        title: "Sss-Zzz-Sss",
        subtitle: "Make sound · 15 seconds",
        cardCue: "Wake up your breath with simple sounds",
        targetSeconds: 15,
        cues: ["sss", "zzz", "sss"],
        instruction: "Alternate between sss and zzz sounds. No pitch needed — just feel the vibration shift from voiceless to voiced.",
      },
      {
        exerciseTypeId: "volume-detection",
        title: "Voiceless lip roll",
        subtitle: "Lip buzz · 15 seconds",
        cardCue: "Get your lips buzzing without pitch pressure",
        targetSeconds: 15,
        cues: ["lip roll"],
        instruction: "Let your lips buzz loosely — like a motorboat. No pitch, just the buzz. Keep your jaw relaxed.",
      },
    ],
  },

  // ── Stage 2: First Sounds ───────────────────────────────────────────────
  {
    id: "ch1-first-sounds",
    title: "First Sounds",
    exercises: [
      {
        exerciseTypeId: "pitch-detection",
        title: "Gentle hum",
        subtitle: "Hum · 5 seconds × 3",
        cardCue: "Your first pitched sound — a low, steady hum",
        scale: { type: "chromatic", root: 1 },
        notes: [
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 5 },
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 5 },
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 5 },
        ],
        instruction: "Close your lips and hum mmmm on a low tone.\nFeel the buzz in your lips and teeth.\nKeep it gentle and relaxed.",
      },
      {
        exerciseTypeId: "pitch-detection",
        title: "Hoo hoo",
        subtitle: "Head voice · 5 seconds × 3",
        cardCue: "Find your head voice with a light, owl-like sound",
        scale: { type: "chromatic", root: -1 },
        notes: [
          { target: { kind: BandTargetKind.Range, from: -4, to: -1, accept: "above" }, seconds: 5 },
          { target: { kind: BandTargetKind.Range, from: -4, to: -1, accept: "above" }, seconds: 5 },
          { target: { kind: BandTargetKind.Range, from: -4, to: -1, accept: "above" }, seconds: 5 },
        ],
        instruction: "Sing 'hoo hoo' on a high tone, like an owl.\nThis is head voice — a lighter, higher resonance.\nFeel the sound in your head and face. Keep it gentle.",
      },
      {
        exerciseTypeId: "pitch-detection",
        title: "Simple U",
        subtitle: "Chest voice · 6 seconds × 3",
        cardCue: "Warm up your chest voice with a low U vowel",
        scale: { type: "chromatic", root: 1 },
        notes: [
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 6 },
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 6 },
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 6 },
        ],
        instruction: "Sing uuuu (as in 'moon') on a low tone.\nSlightly wobble your voice to keep it loose.\nThis warms up your lower register.",
      },
      {
        exerciseTypeId: "tone-follow",
        title: "Lip roll slide",
        subtitle: "Glide low to high · play 3 times",
        cardCue: "Slide your voice from low to high with a lip roll",
        scale: { type: "chromatic", root: 1 },
        toneShape: {
          kind: "slide",
          from: { kind: BandTargetKind.Index, i: 1 },
          to: { kind: BandTargetKind.Index, i: -1 },
        },
        displayNotes: [],
        requiredPlays: 3,
        instruction: "Play the tone and lip roll alongside it.\nSlide smoothly from low to high — feel the glide in your lips.",
      },
    ],
  },

  // ── Stage 3: First Melody ──────────────────────────────────────────────
  {
    id: "ch1-first-melody",
    title: "First Melody",
    exercises: [
      {
        exerciseTypeId: "pitch-detection",
        title: "Hum — mid-low",
        subtitle: "Hum · 5 seconds × 3",
        scale: { type: "chromatic", root: 4 },
        notes: [
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 5 },
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 5 },
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 5 },
        ],
        instruction: "Hum just above your lowest tone.\nFeel the warmth spread through your chest.\nKeep the buzz steady.",
      },
      {
        exerciseTypeId: "melody",
        title: "Major Second",
        subtitle: "Sing two notes · intervals",
        cardCue: "Your first melody — just two adjacent notes",
        tempo: 50,
        melody: [
          {
            type: "major",
            root: 3,
            events: [
              { type: "note", target: { kind: BandTargetKind.Index, i: 1 }, duration: 8 },
              { type: "note", target: { kind: BandTargetKind.Index, i: 2 }, duration: 8 },
              { type: "note", target: { kind: BandTargetKind.Index, i: 1 }, duration: 8 },
            ],
          },
        ],
        minScore: 0,
        instruction: "Sing the two notes as they appear — the piano plays each note for you.\nThis is a major second — the smallest melodic step.\nListen and match.",
      },
      {
        exerciseTypeId: "pitch-detection",
        title: "U — mid-low",
        subtitle: "Vowel U · 6 seconds × 3",
        scale: { type: "chromatic", root: 4 },
        notes: [
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 6 },
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 6 },
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 6 },
        ],
        instruction: "Sing uuu on the mid-low tone.\nKeep it warm and full.\nFeel the vowel open from the hum.",
      },
    ],
  },

  // ── Stage 4: Breath ────────────────────────────────────────────────────
  {
    id: "ch1-breath",
    title: "Breath",
    exercises: [
      {
        exerciseTypeId: "breathwork-farinelli",
        title: "Farinelli breathwork",
        cardCue: "Calm your nervous system and build steady diaphragm control",
        maxCount: 5,
        instruction: "Build diaphragm control and calm your nervous system. Inhale, hold, and exhale for the same count — each cycle adds one beat.",
      },
      {
        exerciseTypeId: "tone-follow",
        title: "Lip roll sustain",
        subtitle: "Hold the buzz · play 3 times",
        scale: { type: "chromatic", root: 5 },
        toneShape: {
          kind: "sustain",
          target: { kind: BandTargetKind.Index, i: 1 },
          seconds: 5,
        },
        displayNotes: [],
        requiredPlays: 3,
        instruction: "Play the tone and lip roll alongside it.\nKeep the buzz steady — lips vibrating without force.",
      },
      {
        exerciseTypeId: "pitch-detection",
        title: "Hum — mid",
        subtitle: "Hum · 6 seconds × 3",
        scale: { type: "chromatic", root: 7 },
        notes: [
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 6 },
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 6 },
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 6 },
        ],
        instruction: "Hum on a mid tone.\nFeel the buzz in your chest and face.\nStay relaxed and present.",
        completionModal: {
          title: "Chapter 1 Complete",
          subtitle: "Introduction",
          elements: [
            {
              type: "paragraph",
              text: "You've learned vocal placement, made your first sounds, sung your first melody, and built breath control. A solid foundation.",
            },
            {
              type: "paragraph",
              text: "Chapter 2 introduces a warmup routine and builds on everything you've learned here.",
              variant: "secondary",
            },
          ],
          confetti: true,
        },
      },
    ],
  },
];
