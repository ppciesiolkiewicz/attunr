import { BandTargetKind, NoteDuration } from "./types";
import type { StageConfigInput } from "./types";
import { ExerciseGenerator } from "./exercise-generator";

const gen = new ExerciseGenerator();

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
    gen.lipRoll({
      startNote: 1,
      endNote: -1,
      requiredPlays: 2,
      title: "Lip rolls — low to high",
      subtitle: "Glide low to high · play 2 times",
      instruction: "Play the tone and lip roll alongside it.\nSlide smoothly from low to high — loosen your lips.",
    }),
    gen.sustain({
      note: 1,
      seconds: 5,
      repeats: 2,
      title: "Gentle hum",
      subtitle: "Hum · 5 seconds × 2",
      instruction: "Close your lips and hum mmmm on a low tone.\nFirst pitched sound of the session.",
    }),
    gen.farinelli({
      maxCount: 5,
      title: "Farinelli breathwork",
      instruction: "Inhale, hold, and exhale for the same count. Each cycle adds one beat. Center your breathing.",
    }),
  ],
};

export const CHAPTER_2_STAGES: StageConfigInput[] = [
  // ── Stage 1: Finding Your Range ─────────────────────────────────────────
  {
    id: "ch2-finding-range",
    title: "Finding Your Range",
    exercises: [
      {
        exerciseTypeId: "melody",
        title: "Hum — low to mid",
        subtitle: "Hum · 5 seconds × 3 pitches",
        tempo: 24,
        melody: [
          {
            type: "chromatic",
            root: 1,
            events: [
              { type: "note", target: { kind: BandTargetKind.Index, i: 1 }, duration: NoteDuration.Half },
              { type: "note", target: { kind: BandTargetKind.Index, i: 4 }, duration: NoteDuration.Half },
              { type: "note", target: { kind: BandTargetKind.Index, i: 7 }, duration: NoteDuration.Half },
            ],
          },
        ],
        minScore: 0,
        instruction: "Hum at three rising pitches — low, mid-low, mid.\nFeel the resonance shift as you rise.\nKeep each hum steady and relaxed.",
      },
      {
        exerciseTypeId: "melody",
        title: "U — low to mid",
        subtitle: "Vowel U · 6 seconds × 3 pitches",
        tempo: 20,
        melody: [
          {
            type: "chromatic",
            root: 1,
            events: [
              { type: "note", target: { kind: BandTargetKind.Index, i: 1 }, duration: NoteDuration.Half },
              { type: "note", target: { kind: BandTargetKind.Index, i: 4 }, duration: NoteDuration.Half },
              { type: "note", target: { kind: BandTargetKind.Index, i: 7 }, duration: NoteDuration.Half },
            ],
          },
        ],
        minScore: 0,
        instruction: "Sing uuu, stepping from low to mid-low to mid.\nFeel the resonance shift as you rise.\nKeep each tone warm and open.",
      },
      gen.lipRoll({
        startNote: -1,
        endNote: 1,
        requiredPlays: 3,
        title: "Lip rolls — high to low",
        subtitle: "Glide high to low · play 3 times",
        instruction: "Play the tone and lip roll alongside it.\nSlide smoothly from high to low — keep it smooth and easy.",
      }),
      {
        exerciseTypeId: "rhythm",
        title: "Feel the Beat",
        cardCue: "Tap along to the beat",
        tempo: 80,
        pattern: [
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "pause", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
        ],
        metronome: true,
        minScore: 60,
        instruction: "Tap the spacebar or touch the screen on each beat",
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
        exerciseTypeId: "melody",
        title: "Hum sequence",
        subtitle: "3 tones rising · 5 seconds each",
        tempo: 24,
        melody: [
          {
            type: "chromatic",
            root: 1,
            events: [
              { type: "note", target: { kind: BandTargetKind.Index, i: 1 }, duration: NoteDuration.Half },
              { type: "note", target: { kind: BandTargetKind.Index, i: 3 }, duration: NoteDuration.Half },
              { type: "note", target: { kind: BandTargetKind.Index, i: 5 }, duration: NoteDuration.Half },
            ],
          },
        ],
        minScore: 0,
        instruction: "Hum three tones rising from low.\nMove smoothly between each tone.\nFeel the resonance shift as you rise.",
      },
      {
        exerciseTypeId: "melody",
        title: "U sequence",
        subtitle: "3 tones rising · 6 seconds each",
        tempo: 20,
        melody: [
          {
            type: "chromatic",
            root: 1,
            events: [
              { type: "note", target: { kind: BandTargetKind.Index, i: 1 }, duration: NoteDuration.Half },
              { type: "note", target: { kind: BandTargetKind.Index, i: 3 }, duration: NoteDuration.Half },
              { type: "note", target: { kind: BandTargetKind.Index, i: 5 }, duration: NoteDuration.Half },
            ],
          },
        ],
        minScore: 0,
        instruction: "Sing uuu on three rising tones.\nKeep each tone warm and open.\nFeel the vowel resonate differently at each pitch.",
      },
    ],
  },

  // ── Stage 3: Sustain & Control ──────────────────────────────────────────
  {
    id: "ch2-sustain-control",
    title: "Sustain & Control",
    exercises: [
      gen.sustain({
        note: 7,
        seconds: 8,
        title: "Hum — mid",
        subtitle: "Hum · 8 seconds × 3",
        instruction: "Hum on a mid tone — longer holds this time.\nFocus on keeping the tone steady.\nFeel the buzz settle.",
      }),
      gen.sustain({
        note: 7,
        seconds: 8,
        title: "U — mid",
        subtitle: "Vowel U · 8 seconds × 3",
        instruction: "Sing uuu on the mid tone — longer holds.\nOpen and soft — keep it relaxed.\nFeel the resonance in your chest and face.",
      }),
      gen.lipRollSustain({
        note: 7,
        seconds: 6,
        requiredPlays: 3,
        title: "Lip roll sustain",
        subtitle: "Hold the buzz · play 3 times",
        instruction: "Play the tone and lip roll alongside it.\nKeep the buzz steady at mid pitch.",
      }),
      gen.farinelli({
        maxCount: 7,
        title: "Farinelli breathwork",
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
      }),
    ],
  },
];
