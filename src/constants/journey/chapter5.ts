import type { StageConfigInput } from "./types";
import { ExerciseGenerator, IntroModalGenerator, repeat } from "./exercise-generator";
import { exerciseTips } from "./exercise-content";

const gen = new ExerciseGenerator();
const modal = new IntroModalGenerator();

// ── Chapter 5: Breathe Deep (secret) ────────────────────────────────────────
// Pure breathwork — no singing, just breath and body awareness. No warmup.

export const CHAPTER_5_STAGES: StageConfigInput[] = [
  // ── Stage 1: Stillness ──────────────────────────────────────────────────────
  {
    id: "ch5-stillness",
    title: "Stillness",
    exercises: [
      {
        exerciseTypeId: "learn",
        slug: "breath-awareness",
        title: "Breath awareness",
        elements: [
          {
            type: "paragraph",
            text: "Breath is the foundation of everything — every sound, every phrase, every moment of expression starts here. Before you can shape your voice, you need to feel your breath.",
          },
          {
            type: "paragraph",
            text: "This chapter is pure breathwork — no singing, just breath and body awareness. Slow down, feel what's happening, and let your body lead.",
            variant: "secondary",
          },
          { type: "video" },
        ],
      },
      gen.breathwork.farinelliVoiceDriven({
        slug: "farinelli-extended",
        minCount: 4,
        maxCount: 9,
        title: "Farinelli breathwork",
        voiceBaseUrl: "breathwork-farinelli",
        introModal: modal.farinelli({
          title: "Farinelli breathwork",
          maxCount: 6,
          tips: exerciseTips("farinelli", "intermediate"),
          instruction:
            "Inhale, hold, and exhale for the same count — each cycle adds one beat.\n\nNotice how your body responds as the rhythm lengthens. Feel everything settle.",
        }),
      }),
      gen.timeBased({
        slug: "breath-cycles",
        title: "Breath cycles",
        headerSubtitle: "Guided breath · 56 seconds",
        cardSubtitle:
          "Inhale, hold, exhale — a rhythm your body already knows",
        cues: repeat(
          [
            { text: "Inhale", seconds: 4 },
            { text: "Hold", seconds: 4 },
            { text: "Exhale", seconds: 4 },
            { text: "Rest", seconds: 2 },
          ],
          4,
        ),
        tips: exerciseTips("farinelli", "intermediate"),
        instruction:
          "Follow the cues — inhale, hold, exhale, rest.\nLet each cycle deepen naturally.\nThere's no rush.",
      }),
    ],
  },

  // ── Stage 2: Breath & Body ──────────────────────────────────────────────────
  {
    id: "ch5-breath-body",
    title: "Breath & Body",
    exercises: [
      gen.timeBased({
        slug: "extended-sss-zzz",
        title: "Extended sss-zzz",
        headerSubtitle: "Breath sound · 30 seconds",
        cues: repeat(
          [
            { text: "sss", seconds: 5 },
            { text: "zzz", seconds: 5 },
          ],
          3,
        ),
        tips: exerciseTips("breathSound", "intermediate"),
        instruction:
          "Alternate sss and zzz — longer holds this time.\nFeel the vibration shift between voiceless and voiced.\nIt's okay to pause between sounds.",
      }),
      gen.timeBased({
        slug: "body-scan",
        title: "Body scan breathing",
        headerSubtitle: "Body awareness · 32 seconds",
        cardSubtitle:
          "Move your breath through your body — belly, chest, shoulders",
        cues: [
          { text: "Breathe into your belly", seconds: 8 },
          { text: "Breathe into your chest", seconds: 8 },
          { text: "Breathe into your shoulders", seconds: 8 },
          { text: "Let everything soften", seconds: 8 },
        ],
        tips: exerciseTips("farinelli", "intermediate"),
        instruction:
          "Follow the cues — direct your breath to each area.\nNotice where it moves easily and where it feels stuck.\nJust breathe and notice.",
      }),
    ],
  },

  // ── Stage 3: Deep Breath ────────────────────────────────────────────────────
  {
    id: "ch5-deep-breath",
    title: "Deep Breath",
    exercises: [
      gen.breathwork.farinelliVoiceDriven({
        slug: "farinelli-deep-ch5",
        minCount: 4,
        maxCount: 11,
        cardSubtitle: "The deepest breath cycle yet — 11 counts",
        title: "Farinelli breathwork",
        voiceBaseUrl: "breathwork-farinelli",
        introModal: modal.farinelli({
          title: "Farinelli breathwork",
          maxCount: 8,
          tips: exerciseTips("farinelli", "intermediate"),
          instruction:
            "Inhale, hold, and exhale for the same count — each cycle adds one beat. The deepest breathing yet.\n\nNotice how your body responds as the rhythm lengthens. Feel everything settle.",
        }),
      }),
      gen.timeBased({
        slug: "extended-exhale",
        title: "Extended exhale",
        headerSubtitle: "Extended exhale · 48 seconds",
        cues: repeat(
          [
            { text: "Inhale", seconds: 4 },
            { text: "Exhale slowly", seconds: 8 },
          ],
          4,
        ),
        tips: exerciseTips("farinelli", "intermediate"),
        instruction:
          "Inhale for 4, exhale for 8 — twice as long.\nThe extended exhale calms your nervous system.\nLet it be easy.",
        completionModal: {
          title: "Breathe Deep Complete",
          subtitle: "",
          elements: [
            {
              type: "paragraph",
              text: "Stillness isn't silence — it's awareness. You've spent time with nothing but your breath and felt what happens when you slow down. That stays with you.",
            },
          ],
          confetti: true,
        },
      }),
    ],
  },
];
