import { NoteDuration } from "./types";
import type { StageConfigInput } from "./types";
import { ExerciseGenerator, IntroModalGenerator } from "./exercise-generator";
import { exerciseTips } from "./exercise-content";

const gen = new ExerciseGenerator();
const modal = new IntroModalGenerator();

// ── Chapter 6: Rhythm Deep Dive (secret) ────────────────────────────────────
// Pure rhythm — no pitch, just timing. No warmup.

export const CHAPTER_6_STAGES: StageConfigInput[] = [
  // ── Stage 1: Finding Groove ─────────────────────────────────────────────────
  {
    id: "ch6-finding-groove",
    title: "Finding Groove",
    exercises: [
      {
        exerciseTypeId: "learn",
        slug: "rhythm-intro",
        title: "Rhythm in voice",
        elements: [
          {
            type: "paragraph",
            text: "Rhythm is the pulse underneath melody and speech — the skeleton that holds everything together. Before you can phrase a line or shape a song, your body needs to feel the beat.",
          },
          {
            type: "paragraph",
            text: "This chapter is pure rhythm — no pitch, just timing. You'll tap, listen, and lock into patterns that train your internal clock.",
            variant: "secondary",
          },
          { type: "video" },
        ],
      },
      {
        exerciseTypeId: "rhythm",
        slug: "quarter-beat",
        title: "Quarter notes",
        headerSubtitle: "Rhythm · 90 bpm",
        cardSubtitle: "Straight quarter notes — feel the pulse",
        tempo: 90,
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
          { type: "pause", duration: NoteDuration.Half },
          // Row 2
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "pause", duration: NoteDuration.Half },
          // Row 3
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "pause", duration: NoteDuration.Half },
          // Row 4
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "pause", duration: NoteDuration.Half },
        ],
        metronome: true,
        minScore: 60,
        instruction:
          "Tap the spacebar or touch the screen on each beat.\nFeel the pulse — steady quarter notes.",
        introModal: modal.rhythm({
          minScore: 60,
          tips: exerciseTips("melody", "intermediate"),
          instruction:
            "Tap along to the beat — spacebar or touch the screen. The metronome clicks to guide you.\n\nFeel the rhythm in your body. Notice how each beat lands — even and steady, like a heartbeat.\n\nQuarter notes are the foundation of all rhythm. Every pattern you'll learn builds on this pulse.\n\nJust tap along. Match 60% to continue.",
        }),
      },
      {
        exerciseTypeId: "rhythm",
        slug: "dotted-quarter",
        title: "Dotted quarter",
        headerSubtitle: "Rhythm · 90 bpm",
        cardSubtitle:
          "A longer beat followed by a short one — feel the swing",
        tempo: 90,
        pattern: [
          // 4-beat intro
          { type: "pause", duration: NoteDuration.Quarter },
          { type: "pause", duration: NoteDuration.Quarter },
          { type: "pause", duration: NoteDuration.Quarter },
          { type: "pause", duration: NoteDuration.Quarter },
          // Row 1
          { type: "tap", duration: NoteDuration.DottedQuarter },
          { type: "tap", duration: NoteDuration.Eighth },
          { type: "tap", duration: NoteDuration.DottedQuarter },
          { type: "tap", duration: NoteDuration.Eighth },
          { type: "pause", duration: NoteDuration.Half },
          // Row 2
          { type: "tap", duration: NoteDuration.DottedQuarter },
          { type: "tap", duration: NoteDuration.Eighth },
          { type: "tap", duration: NoteDuration.DottedQuarter },
          { type: "tap", duration: NoteDuration.Eighth },
          { type: "pause", duration: NoteDuration.Half },
          // Row 3
          { type: "tap", duration: NoteDuration.DottedQuarter },
          { type: "tap", duration: NoteDuration.Eighth },
          { type: "tap", duration: NoteDuration.DottedQuarter },
          { type: "tap", duration: NoteDuration.Eighth },
          { type: "pause", duration: NoteDuration.Half },
        ],
        metronome: true,
        minScore: 60,
        instruction:
          "Tap the longer beat, then the short one — long-short, long-short.\nFeel the swing in the pattern.",
        introModal: modal.rhythm({
          minScore: 60,
          tips: exerciseTips("melody", "intermediate"),
          instruction:
            "Tap along to a dotted rhythm — a longer beat followed by a shorter one. The metronome clicks to guide you.\n\nFeel the swing. Notice how the uneven spacing creates a lilt — long-short, long-short.\n\nDotted rhythms add groove and movement to straight time. They're the first step beyond the basic pulse.\n\nJust tap along. Match 60% to continue.",
        }),
      },
    ],
  },

  // ── Stage 2: Offbeat ────────────────────────────────────────────────────────
  {
    id: "ch6-offbeat",
    title: "Offbeat",
    exercises: [
      {
        exerciseTypeId: "rhythm",
        slug: "half-quarter-mix",
        title: "Half and quarter",
        headerSubtitle: "Rhythm · 100 bpm",
        tempo: 100,
        pattern: [
          // 4-beat intro
          { type: "pause", duration: NoteDuration.Quarter },
          { type: "pause", duration: NoteDuration.Quarter },
          { type: "pause", duration: NoteDuration.Quarter },
          { type: "pause", duration: NoteDuration.Quarter },
          // Row 1
          { type: "tap", duration: NoteDuration.Half },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "pause", duration: NoteDuration.Half },
          // Row 2
          { type: "tap", duration: NoteDuration.Half },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "pause", duration: NoteDuration.Half },
          // Row 3
          { type: "tap", duration: NoteDuration.Half },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "pause", duration: NoteDuration.Half },
        ],
        metronome: true,
        minScore: 60,
        instruction:
          "Tap along — a long beat followed by two short ones.\nFeel how the half note stretches before the quarters arrive.",
        introModal: modal.rhythm({
          minScore: 60,
          tips: exerciseTips("melody", "intermediate"),
          instruction:
            "Tap along to a mixed pattern — half notes and quarter notes together. The metronome clicks to guide you.\n\nFeel the difference between holding and tapping. Notice how the long beat creates space before the short ones fill it.\n\nMixing durations trains your body to feel different beat lengths — the foundation of musical phrasing.\n\nJust tap along. Match 60% to continue.",
        }),
      },
      {
        exerciseTypeId: "rhythm",
        slug: "dotted-patterns",
        title: "Dotted patterns",
        headerSubtitle: "Rhythm · 100 bpm",
        tempo: 100,
        pattern: [
          // 4-beat intro
          { type: "pause", duration: NoteDuration.Quarter },
          { type: "pause", duration: NoteDuration.Quarter },
          { type: "pause", duration: NoteDuration.Quarter },
          { type: "pause", duration: NoteDuration.Quarter },
          // Row 1
          { type: "tap", duration: NoteDuration.DottedQuarter },
          { type: "tap", duration: NoteDuration.Eighth },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "pause", duration: NoteDuration.Half },
          // Row 2
          { type: "tap", duration: NoteDuration.DottedQuarter },
          { type: "tap", duration: NoteDuration.Eighth },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "pause", duration: NoteDuration.Half },
          // Row 3
          { type: "tap", duration: NoteDuration.DottedQuarter },
          { type: "tap", duration: NoteDuration.Eighth },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "pause", duration: NoteDuration.Half },
        ],
        metronome: true,
        minScore: 60,
        instruction:
          "Tap the dotted pattern — long-short, then two even beats.\nFeel how the swing resolves into straight time.",
        introModal: modal.rhythm({
          minScore: 60,
          tips: exerciseTips("melody", "intermediate"),
          instruction:
            "Tap along to a dotted pattern mixed with straight beats. The metronome clicks to guide you.\n\nFeel the swing of the dotted quarter resolve into even quarter notes. Notice the push and pull.\n\nCombining dotted and straight rhythms builds flexibility — your body learns to shift between groove and pulse.\n\nJust tap along. Match 60% to continue.",
        }),
      },
    ],
  },

  // ── Stage 3: Complex Patterns ───────────────────────────────────────────────
  {
    id: "ch6-complex-patterns",
    title: "Complex Patterns",
    exercises: [
      {
        exerciseTypeId: "rhythm",
        slug: "mixed-durations",
        title: "Mixed durations",
        headerSubtitle: "Rhythm · 110 bpm",
        tempo: 110,
        pattern: [
          // 4-beat intro
          { type: "pause", duration: NoteDuration.Quarter },
          { type: "pause", duration: NoteDuration.Quarter },
          { type: "pause", duration: NoteDuration.Quarter },
          { type: "pause", duration: NoteDuration.Quarter },
          // Row 1
          { type: "tap", duration: NoteDuration.Eighth },
          { type: "tap", duration: NoteDuration.Eighth },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Half },
          { type: "pause", duration: NoteDuration.Half },
          // Row 2
          { type: "tap", duration: NoteDuration.Eighth },
          { type: "tap", duration: NoteDuration.Eighth },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Half },
          { type: "pause", duration: NoteDuration.Half },
          // Row 3
          { type: "tap", duration: NoteDuration.Eighth },
          { type: "tap", duration: NoteDuration.Eighth },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Half },
          { type: "pause", duration: NoteDuration.Half },
        ],
        metronome: true,
        minScore: 70,
        instruction:
          "Tap along — two quick beats, one medium, one long.\nFeel the acceleration and release in each phrase.",
        introModal: modal.rhythm({
          minScore: 70,
          tips: exerciseTips("melody", "intermediate"),
          instruction:
            "Tap along to a pattern mixing eighth notes, quarter notes, and half notes. The metronome clicks to guide you.\n\nFeel the acceleration — two quick taps, then a medium beat, then a long hold. Notice how the pattern breathes.\n\nMixed durations train your body to shift between fast and slow within the same phrase. It's how real music moves.\n\nMatch 70% to continue. Let your body find it.",
        }),
      },
      {
        exerciseTypeId: "rhythm",
        slug: "full-groove",
        title: "The full groove",
        headerSubtitle: "Rhythm · 110 bpm",
        tempo: 110,
        pattern: [
          // 4-beat intro
          { type: "pause", duration: NoteDuration.Quarter },
          { type: "pause", duration: NoteDuration.Quarter },
          { type: "pause", duration: NoteDuration.Quarter },
          { type: "pause", duration: NoteDuration.Quarter },
          // Row 1
          { type: "tap", duration: NoteDuration.DottedQuarter },
          { type: "tap", duration: NoteDuration.Eighth },
          { type: "tap", duration: NoteDuration.Eighth },
          { type: "tap", duration: NoteDuration.Eighth },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "pause", duration: NoteDuration.Half },
          // Row 2
          { type: "tap", duration: NoteDuration.DottedQuarter },
          { type: "tap", duration: NoteDuration.Eighth },
          { type: "tap", duration: NoteDuration.Eighth },
          { type: "tap", duration: NoteDuration.Eighth },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "pause", duration: NoteDuration.Half },
          // Row 3
          { type: "tap", duration: NoteDuration.DottedQuarter },
          { type: "tap", duration: NoteDuration.Eighth },
          { type: "tap", duration: NoteDuration.Eighth },
          { type: "tap", duration: NoteDuration.Eighth },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "pause", duration: NoteDuration.Half },
          // Row 4
          { type: "tap", duration: NoteDuration.DottedQuarter },
          { type: "tap", duration: NoteDuration.Eighth },
          { type: "tap", duration: NoteDuration.Eighth },
          { type: "tap", duration: NoteDuration.Eighth },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "pause", duration: NoteDuration.Half },
        ],
        metronome: true,
        minScore: 70,
        instruction:
          "Tap the full groove — swing into quick beats, then land on a steady quarter.\nFeel the whole pattern as one phrase.",
        introModal: modal.rhythm({
          minScore: 70,
          tips: exerciseTips("melody", "intermediate"),
          instruction:
            "Tap along to the full groove — dotted quarters, eighths, and quarter notes woven together. The metronome clicks to guide you.\n\nFeel the swing of the dotted quarter open into quick eighth notes, then resolve on a steady quarter. Notice how the whole pattern breathes.\n\nThis is rhythm as expression — not just keeping time, but shaping it. Your body knows more than you think.\n\nMatch 70% to continue. Let it carry you.",
        }),
        completionModal: {
          title: "Rhythm Deep Dive Complete",
          subtitle: "",
          elements: [
            {
              type: "paragraph",
              text: "Rhythm lives in your body, not your head. You've felt the pulse, pushed against it, and found the groove. That timing stays with you.",
            },
          ],
          confetti: true,
        },
      },
    ],
  },
];
