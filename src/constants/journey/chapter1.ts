import type { StageConfigInput } from "./types";
import { ExerciseGenerator } from "./exercise-generator";

const gen = new ExerciseGenerator();

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
        cardCue:
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
        title: "Understanding notes",
        cardCue: "Learn how musical notes work and see your vocal range",
      },
      // {
      //   exerciseTypeId: "volume-detection",
      //   title: "Sss",
      //   subtitle: "Make sound · 15 seconds",
      //   cardCue: "Wake up your breath with a sustained sss",
      //   targetSeconds: 15,
      //   cues: ["sss", "ssss"],
      //   instruction:
      //     "Make a steady sss sound — like air escaping. No pitch needed, just breath.\nIt's okay to take breaths between sounds.",
      // },
      gen.hillSustain({
        note: 4,
        seconds: 5,
        direction: "down",
        title: "Gentle hum",
        subtitle: "Hum · 5 seconds × 3",
        cardCue: "Your first pitched sound — a low, steady hum",
        instruction:
          "Close your lips and hum mmmm on a low tone.\nFeel the buzz in your lips and teeth.\nBreathe whenever you need to — there's no rush.",
      }),
      gen.hillSustain({
        note: 4,
        seconds: 6,
        direction: "down",
        title: "Low Uu",
        subtitle: "Chest voice · 6 seconds × 3",
        cardCue: "Warm up your chest voice with a low Uu vowel",
        instruction:
          "Sing uuuu (as in 'moon') on a low tone.\nSlightly wobble your voice to keep it loose.\nBreathe whenever you need to — there's no rush.",
      }),
      gen.hillSustain({
        note: [5, 10],
        seconds: 6,
        direction: "between",
        title: "Middle tone",
        subtitle: "Chest voice · 6 seconds × 3",
        cardCue: "Warm up your chest voice with a uu vowel",
        instruction:
          "Sing uuuu (as in 'moon') on a comfortable tone.\nKeep it steady and relaxed.\nBreathe whenever you need to — there's no rush.",
      }),
      gen.zoneAbove({
        boundaryNote: -6,
        seconds: 5,
        repeats: 3,
        title: "Hoo hoo",
        subtitle: "Head voice · 5 seconds × 3",
        cardCue: "Find your head voice with a light, owl-like sound",
        instruction:
          "Sing 'hoo hoo' on a high tone, like an owl.\nThis is head voice — a lighter, higher resonance.\nFeel the sound in your head and face. Keep it gentle.",
      }),
      gen.farinelli({
        maxCount: 7,
        title: "Farinelli breathwork",
        cardCue: "Calm your nervous system and build steady diaphragm control",
        instruction:
          "Build diaphragm control and calm your nervous system. Inhale, hold, and exhale for the same count — each cycle adds one beat.",
      }),
    ],
  },

  // ── Stage 2: First Sounds ───────────────────────────────────────────────
  {
    id: "ch1-first-sounds",
    title: "First Sounds",
    exercises: [
      {
        exerciseTypeId: "volume-detection",
        title: "Voiceless lip roll",
        subtitle: "Lip buzz · 15 seconds",
        cardCue: "Get your lips buzzing without pitch pressure",
        targetSeconds: 15,
        cues: ["lip roll"],
        instruction:
          "Let your lips buzz loosely — like a motorboat. No pitch, just the buzz.\nFill the bar by lip rolling — it's okay to do several lip rolls and take breaths between them.",
      },
      gen.lipRoll({
        startNote: -4,
        endNote: 4,
        requiredPlays: 3,
        title: "Lip roll slide",
        subtitle: "Glide high to low · play 3 times",
        cardCue: "Slide your voice from high to low with a lip roll",
        instruction:
          "Play the tone and lip roll alongside it.\nSlide smoothly from high to low — feel the glide in your lips.",
      }),
    ],
  },

  // ── Stage 3: First Melody ──────────────────────────────────────────────
  {
    id: "ch1-first-melody",
    title: "First Melody",
    exercises: [
      gen.sustain({
        note: 4,
        seconds: 5,
        title: "Hum — mid-low",
        subtitle: "Hum · 5 seconds × 3",
        instruction:
          "Hum just above your lowest tone.\nFeel the warmth spread through your chest.\nKeep the buzz steady.",
      }),
      gen.majorSecond({
        title: "Major Second",
        subtitle: "Sing two notes · intervals",
        cardCue: "Your first melody — just two adjacent notes",
        tempo: 50,
        instruction:
          "Sing the two notes as they appear — the piano plays each note for you.\nThis is a major second — the smallest melodic step.\nListen and match.",
      }),
      gen.sustain({
        note: 4,
        seconds: 6,
        title: "U — mid-low",
        subtitle: "Vowel U · 6 seconds × 3",
        instruction:
          "Sing uuu on the mid-low tone.\nKeep it warm and full.\nFeel the vowel open from the hum.",
      }),
    ],
  },

  // ── Stage 4: Breath ────────────────────────────────────────────────────
  {
    id: "ch1-breath",
    title: "Breath",
    exercises: [
      gen.farinelli({
        maxCount: 5,
        title: "Farinelli breathwork",
        cardCue: "Calm your nervous system and build steady diaphragm control",
        instruction:
          "Build diaphragm control and calm your nervous system. Inhale, hold, and exhale for the same count — each cycle adds one beat.",
      }),
      gen.lipRollSustain({
        note: 5,
        seconds: 5,
        requiredPlays: 3,
        title: "Lip roll sustain",
        subtitle: "Hold the buzz · play 3 times",
        instruction:
          "Play the tone and lip roll alongside it.\nKeep the buzz steady — lips vibrating without force.",
      }),
      gen.sustain({
        note: 7,
        seconds: 6,
        title: "Hum — mid",
        subtitle: "Hum · 6 seconds × 3",
        instruction:
          "Hum on a mid tone.\nFeel the buzz in your chest and face.\nStay relaxed and present.",
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
