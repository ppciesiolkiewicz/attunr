import { BandTargetKind, NoteDuration } from "./types";
import type { StageConfigInput } from "./types";
import { ExerciseGenerator, IntroModalGenerator } from "./exercise-generator";

const gen = new ExerciseGenerator();
const modal = new IntroModalGenerator();

// ── Chapter 2: Building Foundation ──────────────────────────────────────────
// Has a warmup — prompted if >4h since last warmup.

export const CHAPTER_2_WARMUP: StageConfigInput = {
  id: "ch2-warmup",
  title: "Warmup",
  exercises: [
    gen.volumeDetection({
      slug: "warmup-sss",
      title: "Sss",
      headerSubtitle: "Wake up breath · 15 seconds",
      targetSeconds: 15,
      cues: [
        { text: "sss", seconds: 5 },
        { text: "ssss", seconds: 5 },
      ],
      instruction: "Make a steady sss sound to wake up your breath.",
      introModal: modal.volumeDetection({ targetSeconds: 15 }),
    }),
    gen.volumeDetection({
      slug: "warmup-sss-zzz",
      title: "Sss-Zzz",
      headerSubtitle: "Wake up breath · 15 seconds",
      targetSeconds: 15,
      cues: [
        { text: "sss", seconds: 5 },
        { text: "zzz", seconds: 5 },
      ],
      instruction: "Alternate between sss and zzz sounds — feel the vibration shift from voiceless to voiced.",
      introModal: modal.volumeDetection({ targetSeconds: 15 }),
    }),
    gen.lipRoll({
      slug: "warmup-lip-rolls",
      startNote: 1,
      endNote: -1,
      requiredPlays: 2,
      title: "Lip rolls — low to high",
      headerSubtitle: "Glide low to high · play 2 times",
      instruction: "Play the tone and lip roll alongside it.\nSlide smoothly from low to high — loosen your lips.",
      introModal: modal.lipRoll({ requiredPlays: 2 }),
    }),
    gen.sustain({
      slug: "warmup-gentle-hum",
      note: 1,
      seconds: 5,
      repeats: 2,
      title: "Gentle hum",
      headerSubtitle: "Hum · 5 seconds × 2",
      instruction: "Close your lips and hum mmmm on a low tone.\nFirst pitched sound of the session.",
      introModal: modal.sustain({ seconds: 5 }),
    }),
    gen.farinelli({
      slug: "warmup-farinelli",
      maxCount: 5,
      title: "Farinelli breathwork",
      instruction: "Inhale, hold, and exhale for the same count. Each cycle adds one beat. Center your breathing.",
      introModal: modal.farinelli({ title: "Farinelli breathwork", maxCount: 5, instruction: "Inhale, hold, and exhale for the same count. Each cycle adds one beat. Center your breathing." }),
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
        slug: "hum-low-to-mid",
        title: "Hum — low to mid",
        headerSubtitle: "Hum · 3 rising pitches",
        tempo: 40,
        melody: [
          {
            type: "chromatic",
            root: 1,
            events: [
              { type: "note", target: { kind: BandTargetKind.Index, i: 1 }, duration: 8 },
              { type: "note", target: { kind: BandTargetKind.Index, i: 4 }, duration: 8 },
              { type: "note", target: { kind: BandTargetKind.Index, i: 7 }, duration: 8 },
            ],
          },
        ],
        minScore: 0,
        instruction: "Hum at three rising pitches — low, mid-low, mid.\nFeel the resonance shift as you rise.\nKeep each hum steady and relaxed.",
        introModal: modal.melody({ noteCount: 3, minScore: 0 }),
      },
      {
        exerciseTypeId: "melody",
        slug: "u-low-to-mid",
        title: "U — low to mid",
        headerSubtitle: "Vowel U · 3 rising pitches",
        tempo: 40,
        melody: [
          {
            type: "chromatic",
            root: 1,
            events: [
              { type: "note", target: { kind: BandTargetKind.Index, i: 1 }, duration: 8 },
              { type: "note", target: { kind: BandTargetKind.Index, i: 4 }, duration: 8 },
              { type: "note", target: { kind: BandTargetKind.Index, i: 7 }, duration: 8 },
            ],
          },
        ],
        minScore: 0,
        instruction: "Sing uuu, stepping from low to mid-low to mid.\nFeel the resonance shift as you rise.\nKeep each tone warm and open.",
        introModal: modal.melody({ noteCount: 3, minScore: 0 }),
      },
      gen.lipRoll({
        slug: "lip-rolls-high-to-low",
        startNote: -1,
        endNote: 1,
        requiredPlays: 3,
        title: "Lip rolls — high to low",
        headerSubtitle: "Glide high to low · play 3 times",
        instruction: "Play the tone and lip roll alongside it.\nSlide smoothly from high to low — keep it smooth and easy.",
        introModal: modal.lipRoll({ requiredPlays: 3 }),
      }),
      {
        exerciseTypeId: "rhythm",
        slug: "feel-the-beat",
        title: "Feel the Beat",
        cardSubtitle: "Tap along to the beat",
        tempo: 80,
        pattern: [
          // 4-beat intro (metronome plays, not scored)
          { type: "pause", duration: NoteDuration.Quarter },
          { type: "pause", duration: NoteDuration.Quarter },
          { type: "pause", duration: NoteDuration.Quarter },
          { type: "pause", duration: NoteDuration.Quarter },
          // Row 1
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
          // 2-beat pause
          { type: "pause", duration: NoteDuration.Half },
          // Row 2
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
          // 2-beat pause
          { type: "pause", duration: NoteDuration.Half },
          // Row 3
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
          // 2-beat pause
          { type: "pause", duration: NoteDuration.Half },
          // Row 4
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
        ],
        metronome: true,
        minScore: 60,
        instruction: "Tap the spacebar or touch the screen on each beat",
        introModal: modal.rhythm({ minScore: 60 }),
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
        slug: "5-tone-scale",
        title: "5-tone scale",
        headerSubtitle: "Sing 5 notes up and back down",
        cardSubtitle: "Your first scale — stepping up and back down",
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
        introModal: modal.melody({ noteCount: 9, minScore: 0 }),
      },
      {
        exerciseTypeId: "melody",
        slug: "hum-sequence",
        title: "Hum sequence",
        headerSubtitle: "3 tones rising",
        tempo: 40,
        melody: [
          {
            type: "chromatic",
            root: 1,
            events: [
              { type: "note", target: { kind: BandTargetKind.Index, i: 1 }, duration: 8 },
              { type: "note", target: { kind: BandTargetKind.Index, i: 3 }, duration: 8 },
              { type: "note", target: { kind: BandTargetKind.Index, i: 5 }, duration: 8 },
            ],
          },
        ],
        minScore: 0,
        instruction: "Hum three tones rising from low.\nMove smoothly between each tone.\nFeel the resonance shift as you rise.",
        introModal: modal.melody({ noteCount: 3, minScore: 0 }),
      },
      {
        exerciseTypeId: "melody",
        slug: "u-sequence",
        title: "U sequence",
        headerSubtitle: "3 tones rising",
        tempo: 40,
        melody: [
          {
            type: "chromatic",
            root: 1,
            events: [
              { type: "note", target: { kind: BandTargetKind.Index, i: 1 }, duration: 8 },
              { type: "note", target: { kind: BandTargetKind.Index, i: 3 }, duration: 8 },
              { type: "note", target: { kind: BandTargetKind.Index, i: 5 }, duration: 8 },
            ],
          },
        ],
        minScore: 0,
        instruction: "Sing uuu on three rising tones.\nKeep each tone warm and open.\nFeel the vowel resonate differently at each pitch.",
        introModal: modal.melody({ noteCount: 3, minScore: 0 }),
      },
    ],
  },

  // ── Stage 3: Sustain & Control ──────────────────────────────────────────
  {
    id: "ch2-sustain-control",
    title: "Sustain & Control",
    exercises: [
      gen.sustain({
        slug: "hum-mid-long",
        note: 7,
        seconds: 8,
        title: "Hum — mid",
        headerSubtitle: "Hum · 8 seconds × 3",
        instruction: "Hum on a mid tone — longer holds this time.\nFocus on keeping the tone steady.\nFeel the buzz settle.",
        introModal: modal.sustain({ seconds: 8 }),
      }),
      gen.sustain({
        slug: "u-mid",
        note: 7,
        seconds: 8,
        title: "U — mid",
        headerSubtitle: "Vowel U · 8 seconds × 3",
        instruction: "Sing uuu on the mid tone — longer holds.\nOpen and soft — keep it relaxed.\nFeel the resonance in your chest and face.",
        introModal: modal.sustain({ seconds: 8 }),
      }),
      gen.lipRollSustain({
        slug: "lip-roll-sustain-mid",
        note: 7,
        seconds: 6,
        requiredPlays: 3,
        title: "Lip roll sustain",
        headerSubtitle: "Hold the buzz · play 3 times",
        instruction: "Play the tone and lip roll alongside it.\nKeep the buzz steady at mid pitch.",
        introModal: modal.lipRollSustain({ requiredPlays: 3 }),
      }),
      gen.farinelli({
        slug: "farinelli-deep",
        maxCount: 7,
        title: "Farinelli breathwork",
        instruction: "Inhale, hold, and exhale for the same count. Each cycle adds one beat. Deeper breathing this time.",
        introModal: modal.farinelli({ title: "Farinelli breathwork", maxCount: 7, instruction: "Inhale, hold, and exhale for the same count. Each cycle adds one beat. Deeper breathing this time." }),
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
