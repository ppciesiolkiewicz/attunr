import { BandTargetKind } from "./types";
import type { StageConfigInput } from "./types";

// ── Chapter 2: Building Foundation ──────────────────────────────────────────
// Has a warmup — prompted if >4h since last warmup.

export const CHAPTER_2_WARMUP: StageConfigInput = {
  id: "ch2-warmup",
  title: "Warmup",
  exercises: [
    {
      exerciseTypeId: "volume-detection",
      title: "Sss-Zzz-Sss",
      subtitle: "Wake up breath · 15 seconds",
      targetSeconds: 15,
      cues: ["sss", "zzz", "sss"],
      instruction: "Alternate between sss and zzz sounds to wake up your breath.",
    },
    {
      exerciseTypeId: "tone-follow",
      title: "Lip rolls — low to high",
      subtitle: "Glide low to high · play 2 times",
      scale: { type: "chromatic", root: 1 },
      toneShape: {
        kind: "slide",
        from: { kind: BandTargetKind.Index, i: 1 },
        to: { kind: BandTargetKind.Index, i: -1 },
      },
      displayNotes: [],
      requiredPlays: 2,
      instruction: "Play the tone and lip roll alongside it.\nSlide smoothly from low to high — loosen your lips.",
    },
    {
      exerciseTypeId: "pitch-detection",
      title: "Gentle hum",
      subtitle: "Hum · 5 seconds × 2",
      scale: { type: "chromatic", root: 1 },
      notes: [
        { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 5 },
        { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 5 },
      ],
      instruction: "Close your lips and hum mmmm on a low tone.\nFirst pitched sound of the session.",
    },
    {
      exerciseTypeId: "breathwork-farinelli",
      title: "Farinelli breathwork",
      maxCount: 5,
      instruction: "Inhale, hold, and exhale for the same count. Each cycle adds one beat. Center your breathing.",
    },
  ],
};

export const CHAPTER_2_STAGES: StageConfigInput[] = [
  // ── Stage 1: Finding Your Range ─────────────────────────────────────────
  {
    id: "ch2-finding-range",
    title: "Finding Your Range",
    exercises: [
      {
        exerciseTypeId: "pitch-detection",
        title: "Hum — low to mid",
        subtitle: "Hum · 5 seconds × 3 pitches",
        scale: { type: "chromatic", root: 1 },
        notes: [
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 5 },
          { target: { kind: BandTargetKind.Index, i: 4 }, seconds: 5 },
          { target: { kind: BandTargetKind.Index, i: 7 }, seconds: 5 },
        ],
        instruction: "Hum at three rising pitches — low, mid-low, mid.\nFeel the resonance shift as you rise.\nKeep each hum steady and relaxed.",
      },
      {
        exerciseTypeId: "pitch-detection",
        title: "U — low to mid",
        subtitle: "Vowel U · 6 seconds × 3 pitches",
        scale: { type: "chromatic", root: 1 },
        notes: [
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 6 },
          { target: { kind: BandTargetKind.Index, i: 4 }, seconds: 6 },
          { target: { kind: BandTargetKind.Index, i: 7 }, seconds: 6 },
        ],
        instruction: "Sing uuu, stepping from low to mid-low to mid.\nFeel the resonance shift as you rise.\nKeep each tone warm and open.",
      },
      {
        exerciseTypeId: "tone-follow",
        title: "Lip rolls — high to low",
        subtitle: "Glide high to low · play 3 times",
        scale: { type: "chromatic", root: 1 },
        toneShape: {
          kind: "slide",
          from: { kind: BandTargetKind.Index, i: -1 },
          to: { kind: BandTargetKind.Index, i: 1 },
        },
        displayNotes: [],
        requiredPlays: 3,
        instruction: "Play the tone and lip roll alongside it.\nSlide smoothly from high to low — keep it smooth and easy.",
      },
    ],
  },

  // ── Stage 2: First Scale ────────────────────────────────────────────────
  {
    id: "ch2-first-scale",
    title: "First Scale",
    exercises: [
      {
        exerciseTypeId: "melody",
        title: "5-tone scale",
        subtitle: "Sing 5 notes up and back down",
        cardCue: "Your first scale — stepping up and back down",
        tempo: 55,
        melody: [
          {
            type: "major",
            root: 3,
            events: [
              { type: "note", target: { kind: BandTargetKind.Index, i: 1 }, duration: 8 },
              { type: "note", target: { kind: BandTargetKind.Index, i: 2 }, duration: 8 },
              { type: "note", target: { kind: BandTargetKind.Index, i: 3 }, duration: 8 },
              { type: "note", target: { kind: BandTargetKind.Index, i: 4 }, duration: 8 },
              { type: "note", target: { kind: BandTargetKind.Index, i: 5 }, duration: 8 },
              { type: "note", target: { kind: BandTargetKind.Index, i: 4 }, duration: 8 },
              { type: "note", target: { kind: BandTargetKind.Index, i: 3 }, duration: 8 },
              { type: "note", target: { kind: BandTargetKind.Index, i: 2 }, duration: 8 },
              { type: "note", target: { kind: BandTargetKind.Index, i: 1 }, duration: 8 },
            ],
          },
        ],
        minScore: 0,
        instruction: "Sing each note as it scrolls past.\nThis is a 5-tone major scale — up five notes, then back down.\nListen to the piano and follow along.",
      },
      {
        exerciseTypeId: "pitch-detection",
        title: "Hum sequence",
        subtitle: "3 tones rising · 5 seconds each",
        scale: { type: "chromatic", root: 1 },
        notes: [
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 5 },
          { target: { kind: BandTargetKind.Index, i: 3 }, seconds: 5 },
          { target: { kind: BandTargetKind.Index, i: 5 }, seconds: 5 },
        ],
        instruction: "Hum three tones rising from low.\nMove smoothly between each tone.\nFeel the resonance shift as you rise.",
      },
      {
        exerciseTypeId: "pitch-detection",
        title: "U sequence",
        subtitle: "3 tones rising · 6 seconds each",
        scale: { type: "chromatic", root: 1 },
        notes: [
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 6 },
          { target: { kind: BandTargetKind.Index, i: 3 }, seconds: 6 },
          { target: { kind: BandTargetKind.Index, i: 5 }, seconds: 6 },
        ],
        instruction: "Sing uuu on three rising tones.\nKeep each tone warm and open.\nFeel the vowel resonate differently at each pitch.",
      },
    ],
  },

  // ── Stage 3: Sustain & Control ──────────────────────────────────────────
  {
    id: "ch2-sustain-control",
    title: "Sustain & Control",
    exercises: [
      {
        exerciseTypeId: "pitch-detection",
        title: "Hum — mid",
        subtitle: "Hum · 8 seconds × 3",
        scale: { type: "chromatic", root: 7 },
        notes: [
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 8 },
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 8 },
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 8 },
        ],
        instruction: "Hum on a mid tone — longer holds this time.\nFocus on keeping the tone steady.\nFeel the buzz settle.",
      },
      {
        exerciseTypeId: "pitch-detection",
        title: "U — mid",
        subtitle: "Vowel U · 8 seconds × 3",
        scale: { type: "chromatic", root: 7 },
        notes: [
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 8 },
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 8 },
          { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 8 },
        ],
        instruction: "Sing uuu on the mid tone — longer holds.\nOpen and soft — keep it relaxed.\nFeel the resonance in your chest and face.",
      },
      {
        exerciseTypeId: "tone-follow",
        title: "Lip roll sustain",
        subtitle: "Hold the buzz · play 3 times",
        scale: { type: "chromatic", root: 7 },
        toneShape: {
          kind: "sustain",
          target: { kind: BandTargetKind.Index, i: 1 },
          seconds: 6,
        },
        displayNotes: [],
        requiredPlays: 3,
        instruction: "Play the tone and lip roll alongside it.\nKeep the buzz steady at mid pitch.",
      },
      {
        exerciseTypeId: "breathwork-farinelli",
        title: "Farinelli breathwork",
        maxCount: 7,
        instruction: "Inhale, hold, and exhale for the same count. Each cycle adds one beat. Deeper breathing this time.",
        completionModal: {
          title: "Chapter 2 Complete",
          subtitle: "Building Foundation",
          elements: [
            {
              type: "paragraph",
              text: "Range exploration, your first scale, and longer sustained tones — your foundation is growing.",
            },
            {
              type: "paragraph",
              text: "Keep practicing — the warmup will help you stay ready for each session.",
              variant: "secondary",
            },
          ],
          confetti: true,
        },
      },
    ],
  },
];
