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
          "Notice where sound lives in your body — chest, throat, head",
        elements: [
          {
            type: "paragraph",
            text: "Vocal placement is the practice of directing your voice to resonate in different parts of your body. Lower tones naturally settle in the chest, mid-range tones open in the throat and mouth, and higher tones lift into the sinuses and head.",
          },
          {
            type: "paragraph",
            text: "As you explore your range, you develop awareness of where sound lives in your body and build a deeper connection between voice, breath, and presence. The goal is not perfection, but feeling where the sound lands and how it shifts your state.",
            variant: "secondary",
          },
          { type: "video" },
        ],
      },
      {
        exerciseTypeId: "learn-notes-1",
        slug: "understanding-notes",
        title: "Understanding notes",
        cardSubtitle: "See where your voice sits — and what the notes mean",
      },
      gen.hillSustain({
        slug: "gentle-hum",
        note: 4,
        seconds: 5,
        direction: "down",
        title: "Gentle hum",
        headerSubtitle: "Hum · 5 seconds",
        cardSubtitle: "Your first pitched sound — a low, steady hum",
        instruction:
          "Hum mmmm on a low tone.\nSlightly wobble your voice to keep it loose.\nBreathe whenever you need to — there's no rush.",
        introModal: modal.hill({
          seconds: 5,
          instruction:
            "Close your lips and hum mmmm on a low tone. Keep the sound steady.\n\nFeel the buzz in your lips and teeth. Notice if it spreads into your chest.\n\nHumming is the simplest way to connect your voice to your body. It warms up your vocal cords and helps you find where sound lives.\n\nBreathe whenever you need to — there's no rush. There's no wrong way to hum.",
        }),
      }),
      gen.hillSustain({
        slug: "low-uu",
        note: 4,
        seconds: 6,
        direction: "down",
        title: "Low Uu",
        headerSubtitle: "Chest voice · 6 seconds",
        cardSubtitle: "A low Uu that settles in your chest",
        instruction:
          "Sing uuuu (as in 'moon') on a low tone.\nSlightly wobble your voice — let it settle in your chest.\nBreathe whenever you need to — there's no rush.",
        introModal: modal.hill({
          seconds: 6,
          instruction:
            "Sing uuuu (as in 'moon') on a low tone. Keep your mouth rounded like Uu — relaxed, not smiling. Let the sound settle deep.\n\nNotice where the resonance lands — chest, throat, or somewhere in between.\n\nThis vowel naturally opens your chest voice. It's the warmest, most grounding sound you can make.\n\nBreathe whenever you need to — there's no rush.",
        }),
      }),
      gen.hillSustain({
        slug: "middle-tone",
        note: [5, 10],
        seconds: 6,
        direction: "between",
        title: "Middle tone",
        headerSubtitle: "Chest voice · 6 seconds",
        cardSubtitle: "A steady Uu in the middle of your voice",
        instruction:
          "Sing uuuu (as in 'moon') on a comfortable tone.\nKeep it steady and relaxed.\nBreathe whenever you need to — there's no rush.",
        introModal: modal.hill({
          seconds: 6,
          instruction:
            "Sing uuuu (as in 'moon') on a comfortable tone in the middle of your range. Keep your mouth rounded like Uu — relaxed, not smiling.\n\nFeel where the sound sits — not too high, not too low. Just easy.\n\nSustaining a tone in your comfortable range trains your breath and steadies your voice without you noticing.\n\nKeep it relaxed. There's no wrong way to do this.",
        }),
      }),
      gen.zoneAbove({
        slug: "hoo-hoo",
        boundaryNote: -6,
        seconds: 5,
        repeats: 3,
        title: "Hoo hoo",
        headerSubtitle: "Head voice · 5 seconds",
        cardSubtitle: "Find your head voice — light, owl-like, floating",
        instruction:
          "Sing 'hoo hoo' on a high tone, like an owl.\nNotice the lightness — the sound lifts into your head and face.\nKeep it gentle. There's no wrong way.",
        introModal: modal.hill({
          seconds: 5,
          reps: 3,
          instruction:
            "Sing 'hoo hoo' on a high tone, like an owl calling. Keep it light and gentle.\n\nNotice how the sound lifts — away from your chest and into your head and face.\n\nHead voice is a lighter resonance. Finding it expands your range and gives you access to a completely different quality of sound.\n\nKeep it gentle. You don't need to get this right.",
        }),
      }),
      gen.farinelli({
        slug: "farinelli-1",
        maxCount: 7,
        title: "Farinelli breathwork",
        cardSubtitle: "Slow down. Breathe deep. Feel your body settle",
        introModal: modal.farinelli({
          title: "Farinelli breathwork",
          maxCount: 7,
          instruction:
            "Inhale, hold, and exhale for the same count — each cycle adds one beat.\n\nNotice how your body settles as the rhythm deepens.",
        }),
      }),
      gen.volumeDetection({
        slug: "sss-zzz-sss",
        title: "Sss-zzz-sss",
        headerSubtitle: "Make sound · 18 seconds",
        cardSubtitle: "All breath, no voice — feel what happens",
        targetSeconds: 18,
        cues: [
          { text: "sss", seconds: 2 },
          { text: "zzz", seconds: 2 },
          { text: "sss", seconds: 2 },
        ],
        instruction:
          "Make a steady sss sound — no pitch needed, just breath.\nSwitch to zzz and feel the vibration start.\nIt's okay to take breaths between sounds.",
        introModal: modal.volumeDetection({
          targetSeconds: 18,
          instruction:
            "Make a steady sss sound — like air escaping. No pitch needed, just breath. When you're ready, switch to zzz and feel the vibration start. Then back to sss. Keep making sound until the progress line is full.\n\nNotice how your body settles when you focus on the sound. Feel the difference between sss (just air) and zzz (voice arrives).\n\nThis exercise wakes up your breath control and teaches you to feel the moment voice joins the breath. It's the bridge between breathing and sounding.\n\nKeep your mouth relaxed and avoid changing its shape. It's okay to take breaths between sounds.",
        }),
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
        cardSubtitle: "Just buzz. No pitch. No pressure.",
        targetSeconds: 15,
        cues: [{ text: "lip roll", seconds: 15 }],
        instruction:
          "Let your lips buzz loosely — like a motorboat. No pitch, just the buzz.\nNotice the vibration in your lips and face.\nIt's okay to take breaths between rolls.",
        introModal: modal.volumeDetection({
          targetSeconds: 15,
          instruction:
            "Let your lips buzz loosely — like a motorboat. No pitch, no melody, just the buzz. Keep buzzing until the progress line is full.\n\nNotice the vibration spreading through your lips and face. Feel how your breath drives the sound.\n\nLip rolls loosen tension in your face and jaw. They wake up the connection between breath and voice — the foundation for everything that follows.\n\nIt's okay to take breaths between rolls. Just notice what happens.",
        }),
      }),
      gen.lipRoll({
        slug: "lip-roll-slide",
        startNote: -5,
        endNote: 4,
        scale: { type: "major", root: 1 },
        requiredPlays: 3,
        title: "Lip roll slide",
        headerSubtitle: "Glide high to low · play 3 times",
        cardSubtitle: "Feel the glide — high to low, lips buzzing",
        instruction:
          "Lip roll alongside the tone.\nSlide smoothly from high to low — feel the glide.\nDon't worry about matching exactly. Just notice the movement.",
        introModal: modal.lipRoll({
          requiredPlays: 3,
          instruction:
            "Play the tone and lip roll alongside it. Slide smoothly from high to low, following the pitch as it descends.\n\nFeel the glide in your lips. Notice how the resonance moves — from lighter and higher to deeper and lower.\n\nLip rolls loosen tension in your face and throat while training your voice to move smoothly between pitches. It's preparation for everything that comes next.\n\nDon't worry about matching the pitch exactly. The goal is to feel the movement, not to be precise.",
        }),
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
          "Hum mmmm just above your lowest tone.\nNotice the warmth spreading through your chest.\nBreathe whenever you need to.",
        introModal: modal.sustain({
          seconds: 5,
          instruction:
            "Hum mmmm just above your lowest comfortable tone. Keep it steady and warm.\n\nNotice the warmth spreading through your chest. Feel where the buzz sits.\n\nHumming at this pitch grounds your voice in your body. It's a return to the simplest sound — a foundation before melody.\n\nBreathe whenever you need to.",
        }),
      }),
      gen.majorSecond({
        slug: "two-note-step",
        title: "Two-note step",
        headerSubtitle: "Sing two notes · listen and match",
        cardSubtitle: "Your first melody — just two adjacent notes",
        tempo: 50,
        instruction:
          "Sing the two notes as they appear.\nListen and match — this is the smallest melodic step.\nThere's no rush. Just notice the distance between them.",
        introModal: modal.melody({
          minScore: 0,
          instruction:
            "Sing the two notes as they appear — the piano plays each one for you. Match what you hear.\n\nNotice the distance between the notes. Feel how your voice shifts — even a small step changes where the sound lives.\n\nThis is your first melody. Two notes, one small step. Everything larger builds from here.\n\nThere's no rush. Listen first, then follow.",
        }),
      }),
      gen.sustain({
        slug: "u-mid-low",
        note: 4,
        seconds: 6,
        title: "U — mid-low",
        headerSubtitle: "Vowel U · 6 seconds × 3",
        instruction:
          "Sing uuuu (as in 'moon') on a mid-low tone.\nNotice how the vowel opens from the hum — warmer, fuller.\nLet it be easy.",
        introModal: modal.sustain({
          seconds: 6,
          instruction:
            "Sing uuuu (as in 'moon') on a mid-low tone. Keep your mouth rounded like Uu — relaxed, not smiling. Let it open naturally from the hum.\n\nNotice how the vowel feels different from humming — warmer, more open, more resonant.\n\nMoving from hum to vowel is how you build your voice. The vowel carries the resonance further.\n\nLet it be easy. There's no wrong way.",
        }),
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
        cardSubtitle: "Return to breath. Let everything slow down",
        introModal: modal.farinelli({
          title: "Farinelli breathwork",
          maxCount: 5,
          instruction:
            "Inhale, hold, and exhale for the same count — each cycle adds one beat.\n\nNotice how your body responds as the rhythm lengthens.",
        }),
      }),
      gen.lipRollSustain({
        slug: "lip-roll-sustain",
        note: 5,
        seconds: 5,
        requiredPlays: 3,
        title: "Lip roll sustain",
        headerSubtitle: "Hold the buzz · play 3 times",
        instruction:
          "Lip roll alongside the tone.\nKeep the buzz steady — lips vibrating without force.\nNotice where the resonance sits.",
        introModal: modal.lipRollSustain({
          requiredPlays: 3,
          instruction:
            "Play the tone and lip roll alongside it. Hold the buzz at a steady pitch.\n\nNotice where the resonance sits — lips, face, or deeper. Feel the vibration without forcing it.\n\nSustaining a lip roll at one pitch trains your breath control and builds stability. It's practice for holding any tone steady.\n\nTake a breath between each one.",
        }),
      }),
      gen.sustain({
        slug: "hum-mid",
        note: 7,
        seconds: 6,
        title: "Hum — mid",
        headerSubtitle: "Hum · 6 seconds × 3",
        instruction:
          "Hum mmmm on a mid tone.\nNotice the buzz in your chest and face.\nStay relaxed. Let the sound arrive.",
        introModal: modal.sustain({
          seconds: 6,
          instruction:
            "Hum mmmm on a mid tone — a step higher than before. Keep it relaxed.\n\nNotice the buzz in your chest and face. Feel how the resonance shifts as the pitch rises.\n\nYou've hummed low, now mid. Each pitch lives in a different place in your body. This awareness stays with you.\n\nStay relaxed. Let the sound arrive.",
        }),
        completionModal: {
          title: "Chapter 1 Complete",
          subtitle: "Introduction",
          elements: [
            {
              type: "paragraph",
              text: "Notice how you feel right now. That's the practice working. You've found your voice in your body — placed it, held it, moved it. A real foundation.",
            },
            {
              type: "paragraph",
              text: "Chapter 2 introduces a warmup routine and builds on everything you've started here.",
              variant: "secondary",
            },
          ],
          confetti: true,
        },
      }),
    ],
  },
];
