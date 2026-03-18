import type { StageConfigInput } from "./types";
import { ExerciseGenerator, IntroModalGenerator } from "./exercise-generator";

const gen = new ExerciseGenerator();
const modal = new IntroModalGenerator();

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
        slug: "vocal-placement",
        title: "Vocal placement",
        cardSubtitle:
          "Discover vocal placement and how it connects voice to body awareness",
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
        slug: "understanding-notes",
        title: "Understanding notes",
        cardSubtitle: "Learn how musical notes work and see your vocal range",
      },
      gen.hillSustain({
        slug: "gentle-hum",
        note: 4,
        seconds: 5,
        direction: "down",
        title: "Gentle hum",
        headerSubtitle: "Hum · 5 seconds × 3",
        cardSubtitle: "Your first pitched sound — a low, steady hum",
        instruction:
          "Close your lips and hum mmmm on a low tone.\nFeel the buzz in your lips and teeth.\nBreathe whenever you need to — there's no rush.",
        introModal: modal.hill({ seconds: 5 }),
      }),
      gen.hillSustain({
        slug: "low-uu",
        note: 4,
        seconds: 6,
        direction: "down",
        title: "Low Uu",
        headerSubtitle: "Chest voice · 6 seconds × 3",
        cardSubtitle: "Warm up your chest voice with a low Uu vowel",
        instruction:
          "Sing uuuu (as in 'moon') on a low tone.\nSlightly wobble your voice to keep it loose.\nBreathe whenever you need to — there's no rush.",
        introModal: modal.hill({ seconds: 6 }),
      }),
      gen.hillSustain({
        slug: "middle-tone",
        note: [5, 10],
        seconds: 6,
        direction: "between",
        title: "Middle tone",
        headerSubtitle: "Chest voice · 6 seconds × 3",
        cardSubtitle: "Warm up your chest voice with a uu vowel",
        instruction:
          "Sing uuuu (as in 'moon') on a comfortable tone.\nKeep it steady and relaxed.\nBreathe whenever you need to — there's no rush.",
        introModal: modal.hill({ seconds: 6 }),
      }),
      gen.zoneAbove({
        slug: "hoo-hoo",
        boundaryNote: -6,
        seconds: 5,
        repeats: 3,
        title: "Hoo hoo",
        headerSubtitle: "Head voice · 5 seconds × 3",
        cardSubtitle: "Find your head voice with a light, owl-like sound",
        instruction:
          "Sing 'hoo hoo' on a high tone, like an owl.\nThis is head voice — a lighter, higher resonance.\nFeel the sound in your head and face. Keep it gentle.",
        introModal: modal.hill({ seconds: 5, reps: 3 }),
      }),
      gen.farinelli({
        slug: "farinelli-1",
        maxCount: 7,
        title: "Farinelli breathwork",
        cardSubtitle: "Calm your nervous system and build steady diaphragm control",
        instruction:
          "Build diaphragm control and calm your nervous system. Inhale, hold, and exhale for the same count — each cycle adds one beat.",
        introModal: modal.farinelli({ title: "Farinelli breathwork", maxCount: 7, instruction: "Build diaphragm control and calm your nervous system. Inhale, hold, and exhale for the same count — each cycle adds one beat." }),
      }),
      gen.volumeDetection({
        slug: "sss-zzz-sss",
        title: "Sss-zzz-sss",
        headerSubtitle: "Make sound · 15 seconds",
        cardSubtitle: "Wake up your breath with a sustained sss",
        targetSeconds: 15,
        cues: [
          { text: "sss", seconds: 5 },
          { text: "zzz", seconds: 5 },
          { text: "sss", seconds: 5 },
        ],
        instruction:
          "Make a steady sss sound — like air escaping. No pitch needed, just breath.\nKeep your mouth relaxed and avoid smiling — don't change the shape of your mouth.\nIt's okay to take breaths between sounds.",
        introModal: modal.volumeDetection({ targetSeconds: 15 }),
      }),
    ],
  },

  // ── Stage 2: First Sounds ───────────────────────────────────────────────
  {
    id: "ch1-first-sounds",
    title: "First Sounds",
    exercises: [
      gen.volumeDetection({
        slug: "voiceless-lip-roll",
        title: "Voiceless lip roll",
        headerSubtitle: "Lip buzz · 15 seconds",
        cardSubtitle: "Get your lips buzzing without pitch pressure",
        targetSeconds: 15,
        cues: [{ text: "lip roll", seconds: 15 }],
        instruction:
          "Let your lips buzz loosely — like a motorboat. No pitch, just the buzz.\nFill the bar by lip rolling — it's okay to do several lip rolls and take breaths between them.",
        introModal: modal.volumeDetection({ targetSeconds: 15 }),
      }),
      gen.lipRoll({
        slug: "lip-roll-slide",
        startNote: -5,
        endNote: 4,
        scale: { type: "major", root: 1 },
        requiredPlays: 3,
        title: "Lip roll slide",
        headerSubtitle: "Glide high to low · play 3 times",
        cardSubtitle: "Slide your voice from high to low with a lip roll",
        instruction:
          "Play the tone and lip roll alongside it.\nSlide smoothly from high to low — feel the glide in your lips.\nTry to follow with a tone — don't worry if you don't get it right, the goal is practice.",
        introModal: modal.lipRoll({ requiredPlays: 3 }),
      }),
    ],
  },

  // ── Stage 3: First Melody ──────────────────────────────────────────────
  {
    id: "ch1-first-melody",
    title: "First Melody",
    exercises: [
      gen.sustain({
        slug: "hum-mid-low",
        note: 4,
        seconds: 5,
        title: "Hum — mid-low",
        headerSubtitle: "Hum · 5 seconds × 3",
        instruction:
          "Hum just above your lowest tone.\nFeel the warmth spread through your chest.\nKeep the buzz steady.",
        introModal: modal.sustain({ seconds: 5 }),
      }),
      gen.majorSecond({
        slug: "major-second",
        title: "Major Second",
        headerSubtitle: "Sing two notes · intervals",
        cardSubtitle: "Your first melody — just two adjacent notes",
        tempo: 50,
        instruction:
          "Sing the two notes as they appear — the piano plays each note for you.\nThis is a major second — the smallest melodic step.\nListen and match.",
        introModal: modal.melody({ noteCount: 33, minScore: 0 }),
      }),
      gen.sustain({
        slug: "u-mid-low",
        note: 4,
        seconds: 6,
        title: "U — mid-low",
        headerSubtitle: "Vowel U · 6 seconds × 3",
        instruction:
          "Sing uuu on the mid-low tone.\nKeep it warm and full.\nFeel the vowel open from the hum.",
        introModal: modal.sustain({ seconds: 6 }),
      }),
    ],
  },

  // ── Stage 4: Breath ────────────────────────────────────────────────────
  {
    id: "ch1-breath",
    title: "Breath",
    exercises: [
      gen.farinelli({
        slug: "farinelli-2",
        maxCount: 5,
        title: "Farinelli breathwork",
        cardSubtitle: "Calm your nervous system and build steady diaphragm control",
        instruction:
          "Build diaphragm control and calm your nervous system. Inhale, hold, and exhale for the same count — each cycle adds one beat.",
        introModal: modal.farinelli({ title: "Farinelli breathwork", maxCount: 5, instruction: "Build diaphragm control and calm your nervous system. Inhale, hold, and exhale for the same count — each cycle adds one beat." }),
      }),
      gen.lipRollSustain({
        slug: "lip-roll-sustain",
        note: 5,
        seconds: 5,
        requiredPlays: 3,
        title: "Lip roll sustain",
        headerSubtitle: "Hold the buzz · play 3 times",
        instruction:
          "Play the tone and lip roll alongside it.\nKeep the buzz steady — lips vibrating without force.",
        introModal: modal.lipRollSustain({ requiredPlays: 3 }),
      }),
      gen.sustain({
        slug: "hum-mid",
        note: 7,
        seconds: 6,
        title: "Hum — mid",
        headerSubtitle: "Hum · 6 seconds × 3",
        instruction:
          "Hum on a mid tone.\nFeel the buzz in your chest and face.\nStay relaxed and present.",
        introModal: modal.sustain({ seconds: 6 }),
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
      }),
    ],
  },
];
