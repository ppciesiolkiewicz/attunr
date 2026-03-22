import type { StageConfigInput } from "./types";
import {
  ExerciseGenerator,
  IntroModalGenerator,
  repeat,
} from "./exercise-generator";
import { exerciseTips } from "./exercise-content";

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
      // Old learn exercise — kept for reference
      // {
      //   exerciseTypeId: "learn",
      //   slug: "vocal-placement",
      //   title: "Vocal placement",
      //   cardSubtitle: "Notice where sound lives in your body — chest, throat, head",
      //   elements: [
      //     { type: "paragraph", text: "Vocal placement is the practice of directing your voice to resonate in different parts of your body..." },
      //     { type: "paragraph", text: "As you explore your range, you develop awareness of where sound lives...", variant: "secondary" },
      //     { type: "video" },
      //   ],
      // },
      gen.learnVoiceDriven({
        slug: "vocal-placement",
        title: "Vocal placement",
        cardSubtitle:
          "Notice where sound lives in your body — chest, throat, head",
        voiceBaseUrl: "learn-voice-driven/introduction/vocal-placement",
        segments: [
          {
            name: "intro",
            text: "Put your hand on your chest. Now hum a low note. Feel that vibration? That's your voice, living in your body.",
            spokenText:
              'Put your hand on your chest. <break time="1s"/> Now hum a low note. <break time="3s"/> Feel that vibration? <break time="3s"/> That\'s your voice, living in your body.',
          },
          {
            name: "explore",
            text: "Now hum a little higher. Notice how the buzz moves — up from your chest, into your throat, maybe into your face. Every pitch has a home.",
            spokenText:
              'Now hum a little higher. <break time="0.5s"/> Notice how the buzz moves <break time="0.3s"/> up from your chest, <break time="0.3s"/> into your throat, <break time="0.3s"/> maybe into your face. <break time="0.5s"/> Every pitch has a home.',
          },
          {
            name: "closing",
            text: "That awareness — knowing where sound lives — is vocal placement. You already have it. We're just going to sharpen it.",
            spokenText:
              'That awareness <break time="0.3s"/> knowing where sound lives <break time="0.3s"/> is vocal placement. <break time="0.5s"/> You already have it. <break time="0.5s"/> We\'re just going to sharpen it.',
          },
        ],
      }),
      {
        exerciseTypeId: "learn-notes-1",
        slug: "understanding-notes",
        title: "Understanding notes",
        cardSubtitle: "See where your voice sits — and what the notes mean",
      },
      gen.hillSustain({
        slug: "gentle-hum",
        note: 4,
        seconds: 3,
        repeats: 5,
        direction: "down",
        title: "Gentle hum",
        headerSubtitle: "Hum · 3 seconds × 5",
        cardSubtitle: "Your first pitched sound — a low, steady hum",
        instruction:
          "Hum mmmm — keep the ball at the bottom of the hill.\nSlightly wobble your voice to keep it loose.\nBreathe whenever you need to — there's no rush.",
        introModal: modal.hill({
          seconds: 3,
          reps: 5,
          tips: exerciseTips("hum", "introduction"),
          instruction:
            "Close your lips and hum mmmm on a low tone. Keep the sound steady.\n\nFeel the buzz in your lips and teeth. Notice if it spreads into your chest.\n\nHumming is the simplest way to connect your voice to your body. It warms up your vocal cords and helps you find where sound lives.\n\nBreathe whenever you need to — there's no rush. There's no wrong way to hum.",
        }),
      }),
      gen.hillSustain({
        slug: "low-uu",
        note: 4,
        seconds: 3,
        repeats: 5,
        direction: "down",
        title: "Low Uu",
        headerSubtitle: "Chest voice · 3 seconds × 5",
        cardSubtitle: "A low Uu that settles in your chest",
        instruction:
          "Uuuu (as in 'moon') — keep the ball at the bottom of the hill.\nSlightly wobble your voice — let it settle in your chest.\nBreathe whenever you need to — there's no rush.",
        introModal: modal.hill({
          seconds: 3,
          reps: 5,
          tips: exerciseTips("vowel", "introduction"),
          instruction:
            "Sound uuuu (as in 'moon') on a low tone. Keep your mouth rounded like Uu — relaxed, not smiling. Let the sound settle deep.\n\nNotice where the resonance lands — chest, throat, or somewhere in between.\n\nThis vowel naturally opens your chest voice. It's the warmest, most grounding sound you can make.\n\nBreathe whenever you need to — there's no rush.",
        }),
      }),
      gen.hillSustain({
        slug: "middle-tone",
        note: [5, 10],
        seconds: 3,
        repeats: 5,
        direction: "between",
        title: "Middle tone",
        headerSubtitle: "Chest voice · 3 seconds × 5",
        cardSubtitle: "A steady Uu in the middle of your voice",
        instruction:
          "Uuuu (as in 'moon') — keep the ball between the markers.\nKeep it steady and relaxed.\nBreathe whenever you need to — there's no rush.",
        introModal: modal.hill({
          seconds: 3,
          reps: 5,
          tips: exerciseTips("vowel", "introduction"),
          instruction:
            "Sound uuuu (as in 'moon') on a comfortable tone in the middle of your range. Keep your mouth rounded like Uu — relaxed, not smiling.\n\nFeel where the sound sits — not too high, not too low. Just easy.\n\nSustaining a tone in your comfortable range trains your breath and steadies your voice without you noticing.\n\nKeep it relaxed. There's no wrong way to do this.",
        }),
      }),
      gen.zoneAbove({
        slug: "hoo-hoo",
        boundaryNote: -6,
        seconds: 2,
        repeats: 5,
        title: "Hoo hoo",
        headerSubtitle: "Head voice · 2 seconds × 5",
        cardSubtitle: "Find your head voice — light, owl-like, floating",
        instruction:
          "Sound 'hoo hoo' on a high tone, like an owl.\nNotice the lightness — the sound lifts into your head and face.\nKeep it gentle. There's no wrong way.",
        introModal: modal.hill({
          seconds: 2,
          reps: 5,
          tips: exerciseTips("headVoice", "introduction"),
          instruction:
            "Sound 'hoo hoo' on a high tone, like an owl calling. Keep it light and gentle.\n\nNotice how the sound lifts — away from your chest and into your head and face.\n\nHead voice is a lighter resonance. Finding it expands your range and gives you access to a completely different quality of sound.\n\nKeep it gentle. You don't need to get this right.",
        }),
      }),
      gen.farinelliVoiceDriven({
        slug: "farinelli-1",
        maxCount: 7,
        title: "Farinelli breathwork",
        cardSubtitle: "Slow down. Breathe deep. Feel your body settle",
        voiceBaseUrl: "breathwork-farinelli",
        introModal: modal.farinelli({
          title: "Farinelli breathwork",
          maxCount: 7,
          tips: exerciseTips("farinelli", "introduction"),
          instruction:
            "Inhale, hold, and exhale for the same count — each cycle adds one beat.\n\nNotice how your body settles as the rhythm deepens.",
        }),
      }),
      gen.timeBased({
        slug: "sss-zzz-sss",
        title: "Sss-zzz-sss",
        headerSubtitle: "Breath sound · 14 seconds",
        cardSubtitle: "All breath, no voice — feel what happens",
        cues: [
          { text: "sss", seconds: 2 },
          ...repeat(
            [
              { text: "zzz", seconds: 2 },
              { text: "sss", seconds: 2 },
            ],
            3,
          ),
        ],
        instruction:
          "Make a steady sss sound — no pitch needed, just breath.\nSwitch to zzz and feel the vibration start.\nIt's okay to take breaths between sounds.",
        tips: exerciseTips("breathSound", "introduction"),
        introModal: modal.volumeDetection({
          targetSeconds: 14,
          tips: exerciseTips("breathSound", "introduction"),
          instruction:
            "Make a steady sss sound — like air escaping. No pitch needed, just breath. When you're ready, switch to zzz and feel the vibration start. Then back to sss. You'll do 3 rounds of 6 seconds each.\n\nNotice how your body settles when you focus on the sound. Feel the difference between sss (just air) and zzz (voice arrives).\n\nThis exercise wakes up your breath control and teaches you to feel the moment voice joins the breath. It's the bridge between breathing and sounding.\n\nKeep your mouth relaxed and avoid changing its shape. It's okay to take breaths between sounds.",
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
          tips: exerciseTips("lipRoll", "introduction"),
          instruction:
            "Let your lips buzz loosely — like a motorboat. No pitch, no melody, just the buzz. Keep buzzing until the progress line is full.\n\nNotice the vibration spreading through your lips and face. Feel how your breath drives the sound.\n\nLip rolls loosen tension in your face and jaw. They wake up the connection between breath and voice — the foundation for everything that follows.\n\nIt's okay to take breaths between rolls. Just notice what happens.",
        }),
      }),
      gen.lipRoll({
        slug: "lip-roll-slide",
        startNote: 13,
        endNote: 1,
        scale: { type: "major", root: 1 },
        requiredPlays: 3,
        title: "Lip roll slide",
        headerSubtitle: "Glide high to low · play 3 times",
        cardSubtitle: "Feel the glide — high to low, lips buzzing",
        instruction:
          "Lip roll alongside the tone.\nSlide smoothly from high to low — feel the glide.\nDon't worry about matching exactly. Just notice the movement.",
        introModal: modal.lipRoll({
          requiredPlays: 3,
          tips: exerciseTips("lipRoll", "introduction"),
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
      gen.hillSustain({
        slug: "hum-mid-low",
        note: [2, 6],
        seconds: 5,
        repeats: 3,
        direction: "between",
        title: "Hum — mid-low",
        headerSubtitle: "Hum · 5 seconds × 3",
        instruction:
          "Hum mmmm — keep the ball between the markers.\nNotice the warmth spreading through your chest.\nBreathe whenever you need to.",
        introModal: modal.hill({
          seconds: 5,
          tips: exerciseTips("hum", "introduction"),
          instruction:
            "Hum mmmm just above your lowest comfortable tone. Keep it steady and warm.\n\nNotice the warmth spreading through your chest. Feel where the buzz sits.\n\nHumming at this pitch grounds your voice in your body. It's a return to the simplest sound — a foundation before melody.\n\nBreathe whenever you need to.",
        }),
      }),
      gen.majorSecond({
        slug: "two-note-step",
        title: "Two-note step",
        headerSubtitle: "Two notes · listen and match",
        cardSubtitle: "Your first melody — just two adjacent notes",
        tempo: 100,
        instruction:
          "Match the two notes as they appear.\nListen and match — this is the smallest melodic step.\nThere's no rush. Just notice the distance between them.",
        introModal: modal.melody({
          minScore: 0,
          tips: exerciseTips("melody", "introduction"),
          instruction:
            "Match the two notes as they appear — the piano plays each one for you.\n\nNotice the distance between the notes. Feel how your voice shifts — even a small step changes where the sound lives.\n\nThis is your first melody. Two notes, one small step. Everything larger builds from here.\n\nThere's no rush. Listen first, then follow.",
        }),
      }),
      gen.hillSustain({
        slug: "u-mid-low",
        note: [2, 6],
        seconds: 6,
        repeats: 3,
        direction: "between",
        title: "U — mid-low",
        headerSubtitle: "Vowel U · 6 seconds × 3",
        instruction:
          "Uuuu (as in 'moon') — keep the ball between the markers.\nNotice how the vowel opens from the hum — warmer, fuller.\nLet it be easy.",
        introModal: modal.hill({
          seconds: 6,
          tips: exerciseTips("vowel", "introduction"),
          instruction:
            "Sound uuuu (as in 'moon') on a mid-low tone. Keep your mouth rounded like Uu — relaxed, not smiling. Let it open naturally from the hum.\n\nNotice how the vowel feels different from humming — warmer, more open, more resonant.\n\nMoving from hum to vowel is how you build your voice. The vowel carries the resonance further.\n\nLet it be easy. There's no wrong way.",
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
          tips: exerciseTips("farinelli", "introduction"),
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
          tips: exerciseTips("lipRoll", "introduction"),
          instruction:
            "Play the tone and lip roll alongside it. Hold the buzz at a steady pitch.\n\nNotice where the resonance sits — lips, face, or deeper. Feel the vibration without forcing it.\n\nSustaining a lip roll at one pitch trains your breath control and builds stability. It's practice for holding any tone steady.\n\nTake a breath between each one.",
        }),
      }),
      gen.hillSustain({
        slug: "hum-mid",
        note: [5, 9],
        seconds: 6,
        repeats: 3,
        direction: "between",
        title: "Hum — mid",
        headerSubtitle: "Hum · 6 seconds × 3",
        instruction:
          "Hum mmmm — keep the ball between the markers.\nNotice the buzz in your chest and face.\nStay relaxed. Let the sound arrive.",
        introModal: modal.hill({
          seconds: 6,
          tips: exerciseTips("hum", "introduction"),
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
