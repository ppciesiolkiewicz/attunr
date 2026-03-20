import { BandTargetKind, NoteDuration } from "./types";
import type { StageConfigInput } from "./types";
import { ExerciseGenerator, IntroModalGenerator, repeat } from "./exercise-generator";
import { exerciseTips } from "./exercise-content";

const gen = new ExerciseGenerator();
const modal = new IntroModalGenerator();

// ── Chapter 4: Range & Projection ─────────────────────────────────────────
// Has a warmup — prompted if >4h since last warmup.

export const CHAPTER_4_WARMUP: StageConfigInput = {
  id: "ch4-warmup",
  title: "Warmup",
  exercises: [
    gen.timeBased({
      slug: "ch4-warmup-sss-zzz",
      title: "Sss-zzz",
      headerSubtitle: "Wake up breath · 21 seconds",
      cues: [
        { text: "sss", seconds: 3 },
        ...repeat([
          { text: "zzz", seconds: 3 },
          { text: "sss", seconds: 3 },
        ], 3),
      ],
      instruction:
        "Alternate sss and zzz — feel the vibration shift.\nIt's okay to take breaths between sounds.",
      tips: exerciseTips("breathSound", "introduction"),
      introModal: modal.volumeDetection({
        targetSeconds: 21,
        tips: exerciseTips("breathSound", "introduction"),
        instruction:
          "Alternate between sss and zzz sounds. Feel how sss is just air and zzz adds voice. Follow along with the cues.\n\nNotice the vibration shift — from voiceless to voiced and back.\n\nThis wakes up your breath and reconnects you to where sound starts.\n\nKeep your mouth relaxed. There's no rush.",
      }),
    }),
    gen.lipRoll({
      slug: "ch4-warmup-lip-rolls",
      startNote: 1,
      endNote: -1,
      requiredPlays: 4,
      title: "Lip rolls — low to high",
      headerSubtitle: "Glide low to high · play 4 times",
      instruction:
        "Lip roll alongside the tone.\nSlide smoothly from low to high — loosen your lips.",
      introModal: modal.lipRoll({
        requiredPlays: 4,
        tips: exerciseTips("lipRoll", "introduction"),
        instruction:
          "Play the tone and lip roll alongside it. Slide smoothly from low to high.\n\nFeel the buzz travel through your lips. Notice how the resonance shifts as the pitch rises.\n\nLip rolls loosen tension and wake up the connection between breath and voice.\n\nDon't worry about matching exactly. Just follow the movement.",
      }),
    }),
    gen.hillSustain({
      slug: "ch4-warmup-hum",
      note: 4,
      seconds: 3,
      repeats: 5,
      direction: "down",
      title: "Gentle hum",
      headerSubtitle: "Hum · 3 seconds × 5",
      instruction:
        "Hum mmmm on a low tone.\nSlightly wobble your voice to keep it loose.\nTake as many breaths as you need.",
      introModal: modal.hill({
        seconds: 3,
        reps: 5,
        tips: exerciseTips("hum", "introduction"),
        instruction:
          "Close your lips and hum mmmm on a low tone. Let it wobble gently.\n\nFeel the buzz in your lips and chest. Notice where the warmth settles.\n\nHumming grounds your voice in your body — the simplest way to reconnect.\n\nBreathe whenever you need to. There's no wrong way to hum.",
      }),
    }),
    gen.hillSustain({
      slug: "ch4-warmup-low-uu",
      note: 4,
      seconds: 3,
      repeats: 5,
      direction: "down",
      title: "Low Uu",
      headerSubtitle: "Chest voice · 3 seconds × 5",
      instruction:
        "Sing uuuu (as in 'moon') on a low tone.\nSlightly wobble your voice — let it settle in your chest.\nTake as many breaths as you need.",
      introModal: modal.hill({
        seconds: 3,
        reps: 5,
        tips: exerciseTips("vowel", "introduction"),
        instruction:
          "Sing uuuu (as in 'moon') on a low tone. Keep your mouth rounded like Uu — relaxed, not smiling. Let it wobble gently.\n\nNotice where the resonance lands — chest, throat, or somewhere in between.\n\nThis vowel opens your chest voice and grounds you in your body.\n\nBreathe whenever you need to — there's no rush.",
      }),
    }),
    gen.zoneAbove({
      slug: "ch4-warmup-hoo-hoo",
      boundaryNote: -6,
      seconds: 3,
      repeats: 5,
      title: "Hoo hoo",
      headerSubtitle: "Head voice · 3 seconds × 5",
      instruction:
        "Sing 'hoo hoo' on a high tone, like an owl.\nNotice the lightness — the sound lifts into your head.\nTake as many breaths as you need.",
      introModal: modal.hill({
        seconds: 3,
        reps: 5,
        tips: exerciseTips("headVoice", "introduction"),
        instruction:
          "Sing 'hoo hoo' on a high tone, like an owl calling. Keep it light.\n\nNotice how the sound lifts — away from your chest and into your head and face.\n\nHead voice wakes up a lighter resonance and expands your range.\n\nKeep it gentle. You don't need to get this right.",
      }),
    }),
    gen.farinelli({
      slug: "ch4-warmup-farinelli",
      maxCount: 5,
      title: "Farinelli breathwork",
      introModal: modal.farinelli({
        title: "Farinelli breathwork",
        maxCount: 5,
        tips: exerciseTips("farinelli", "introduction"),
        instruction:
          "Inhale, hold, and exhale for the same count — each cycle adds one beat.\n\nNotice how your body settles as the rhythm deepens.",
      }),
    }),
    gen.hillSustain({
      slug: "ch4-warmup-oo-hill",
      note: 6,
      seconds: 3,
      repeats: 5,
      direction: "down",
      title: "Oo hill sustain",
      headerSubtitle: "Oo vowel · 3 seconds × 5",
      instruction:
        "Sing oooo (as in 'go') on a low tone.\nSlightly wobble your voice to keep it loose.\nTake as many breaths as you need.",
      introModal: modal.hill({
        seconds: 3,
        reps: 5,
        tips: exerciseTips("vowel", "introduction"),
        instruction:
          "Sing oooo (as in 'go') on a low tone. Keep your mouth rounded and open.\n\nFeel the warmth settle in your chest. Notice how the rounded shape changes the resonance.\n\nOo grounds your voice with a rounder, warmer quality — a quick reset before we begin.\n\nLet it be easy. There's no rush.",
      }),
    }),
  ],
};

export const CHAPTER_4_STAGES: StageConfigInput[] = [
  // ── Stage 1: The Open Ah ──────────────────────────────────────────────────
  {
    id: "ch4-open-ah",
    title: "The Open Ah",
    exercises: [
      {
        exerciseTypeId: "learn",
        slug: "ah-vowel",
        title: "The Ah vowel",
        cardSubtitle: "The widest vowel — open, resonant, powerful",
        elements: [
          {
            type: "paragraph",
            text: "Ah (as in 'father') is fully open — the widest vowel. Your jaw drops, your tongue rests low, and your throat opens completely. There's nothing held back.",
          },
          {
            type: "paragraph",
            text: "This openness is what gives Ah its projection. It carries further than any other vowel — across a room, through an orchestra, into the back row. When you need your voice to reach, Ah is how you get there.",
            variant: "secondary",
          },
          { type: "video" },
        ],
      },
      gen.hillSustain({
        slug: "ah-low",
        note: 4,
        seconds: 5,
        repeats: 3,
        direction: "down",
        title: "Ah — low",
        headerSubtitle: "Ah vowel · 5 seconds × 3",
        cardSubtitle: "Open your mouth wide — feel the space inside",
        instruction:
          "Sing ahhh (as in 'father') on a low tone.\nOpen your mouth wide — Ah is the most open vowel.\nSlightly wobble your voice to keep it loose.\nTake as many breaths as you need.",
        introModal: modal.hill({
          seconds: 5,
          reps: 3,
          tips: exerciseTips("vowel", "intermediate"),
          instruction:
            "Sing ahhh (as in 'father') on a low tone. Open your mouth wide — drop your jaw and let your tongue rest low.\n\nFeel the openness in your throat. Notice how the sound fills your chest differently than Uu or Oo.\n\nAh is the most open vowel. It teaches your voice to project without pushing.\n\nBreathe whenever you need to. There's no rush.",
        }),
      }),
      gen.hillSustain({
        slug: "ah-mid",
        note: [5, 9],
        seconds: 5,
        repeats: 3,
        direction: "between",
        title: "Ah — mid",
        headerSubtitle: "Ah vowel · 5 seconds × 3",
        instruction:
          "Sing ahhh in your mid range.\nOpen your mouth wide — Ah is the most open vowel.\nTake as many breaths as you need.",
        introModal: modal.hill({
          seconds: 5,
          reps: 3,
          tips: exerciseTips("vowel", "intermediate"),
          instruction:
            "Sing ahhh (as in 'father') in your mid range. Keep your mouth wide open — jaw dropped, tongue low.\n\nNotice how the vowel feels different here — more face, less chest. The resonance lifts and brightens.\n\nMoving Ah into your mid range builds awareness of how this open vowel changes colour at different pitches.\n\nLet it be easy. Just notice what happens.",
        }),
      }),
    ],
  },

  // ── Stage 2: Reaching Higher ──────────────────────────────────────────────
  {
    id: "ch4-reaching-higher",
    title: "Reaching Higher",
    exercises: [
      gen.octave({
        slug: "octave-melody",
        title: "Octave leap",
        headerSubtitle: "Sing a full octave · listen and match",
        cardSubtitle: "Your widest leap yet — a full octave apart",
        minScore: 0,
        instruction:
          "Sing the two notes as they appear — a full octave apart.\nListen to the piano and match the leap.\nLet your voice move freely between low and high.",
        introModal: modal.melody({
          minScore: 0,
          tips: exerciseTips("melody", "intermediate"),
          instruction:
            "Sing a full octave — two notes with the widest gap you've tried. The piano plays each one for you.\n\nFeel the leap in your body. Notice how the lower note grounds and the higher note lifts — the full span of your voice in two notes.\n\nOctave leaps stretch your range and build confidence in moving between your registers.\n\nThere's no rush. Listen first, then follow.",
        }),
      }),
      gen.hillSustain({
        slug: "ah-wide",
        note: [3, 12],
        seconds: 6,
        repeats: 3,
        direction: "between",
        title: "Ah — wider range",
        headerSubtitle: "Ah vowel · 6 seconds × 3",
        instruction:
          "Sing ahhh across a wider range.\nOpen your mouth wide — Ah is the most open vowel.\nTake as many breaths as you need.",
        introModal: modal.hill({
          seconds: 6,
          reps: 3,
          tips: exerciseTips("vowel", "intermediate"),
          instruction:
            "Sing ahhh (as in 'father') across a wider range than before. Keep your mouth wide open.\n\nNotice how the vowel changes colour as you move through different pitches — warmer low, brighter high. Feel the openness carry through.\n\nSinging Ah across a wider range trains your voice to project with openness everywhere.\n\nBreathe whenever you need to. It's okay to pause.",
        }),
      }),
      gen.zoneAbove({
        slug: "hoo-hoo-higher",
        boundaryNote: -5,
        seconds: 5,
        repeats: 3,
        title: "Hoo hoo — higher",
        headerSubtitle: "Head voice · 5 seconds × 3",
        instruction:
          "Sing 'hoo hoo' higher than before — pushing into your upper range.\nNotice the lightness — the sound floats.\nTake as many breaths as you need.",
        introModal: modal.hill({
          seconds: 5,
          reps: 3,
          tips: exerciseTips("headVoice", "intermediate"),
          instruction:
            "Sing 'hoo hoo' on a higher tone than before — reaching further into your head voice.\n\nNotice how the sound floats — lighter, more agile, further from your chest.\n\nPushing your head voice boundary expands the top of your range and builds flexibility.\n\nKeep it gentle. You don't need to get this right.",
        }),
      }),
    ],
  },

  // ── Stage 3: Dynamics ─────────────────────────────────────────────────────
  {
    id: "ch4-dynamics",
    title: "Dynamics",
    exercises: [
      gen.hillSustain({
        slug: "ah-long",
        note: [5, 9],
        seconds: 10,
        repeats: 3,
        direction: "between",
        title: "Ah — long",
        headerSubtitle: "Ah vowel · 10 seconds × 3",
        instruction:
          "Sing ahhh — the longest Ah hold yet.\nOpen your mouth wide and let the sound carry.\nTake as many breaths as you need.",
        introModal: modal.hill({
          seconds: 10,
          reps: 3,
          tips: exerciseTips("vowel", "intermediate"),
          instruction:
            "Sing ahhh (as in 'father') in your mid range. Hold for 10 seconds — the longest Ah hold yet.\n\nFeel how the resonance deepens the longer you sustain. Notice your breath settling into the open shape.\n\nLonger holds with Ah build projection and breath control — your voice learns to carry without effort.\n\nThere's no rush. Breathe whenever you need to.",
        }),
      }),
      gen.majorScale({
        slug: "major-scale",
        title: "Major scale",
        headerSubtitle: "Sing the scale · match 40%",
        cardSubtitle: "A full major scale — the sound of home",
        tempo: 55,
        minScore: 40,
        instruction:
          "Sing each note as it scrolls past.\nUp the scale and back down — follow the piano.\nListen first, then match.",
        introModal: modal.melody({
          minScore: 40,
          tips: exerciseTips("melody", "intermediate"),
          instruction:
            "Sing a full major scale — up and back down. The piano plays each note for you.\n\nFeel the steps between notes. Notice how the scale has a shape — rising tension, then release coming home.\n\nThe major scale is the foundation of melody. Every song you know lives inside it.\n\nMatch 40% to continue. Just follow the sound.",
        }),
      }),
      {
        exerciseTypeId: "rhythm",
        slug: "rhythm-groove",
        title: "Rhythm groove",
        headerSubtitle: "Tap along · match 60%",
        cardSubtitle: "Lock into the groove — feel the pulse",
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
        ],
        metronome: true,
        minScore: 60,
        instruction: "Tap the spacebar or touch the screen on each beat.\nFeel the groove — faster than before.",
        introModal: modal.rhythm({
          minScore: 60,
          tips: exerciseTips("melody", "intermediate"),
          instruction:
            "Tap along to the beat — spacebar or touch the screen. The metronome clicks to guide you. Faster this time.\n\nFeel the rhythm in your body. Notice how the tempo pulls you forward — let it carry you.\n\nRhythm at a faster tempo trains your body to stay locked in. It builds the pulse behind your voice.\n\nJust tap along. Match 60% to continue.",
        }),
      },
    ],
  },

  // ── Stage 4: Power & Rest ─────────────────────────────────────────────────
  {
    id: "ch4-power-rest",
    title: "Power & Rest",
    exercises: [
      gen.lipRoll({
        slug: "lip-roll-full",
        startNote: 1,
        endNote: -1,
        requiredPlays: 5,
        title: "Lip roll — full range",
        headerSubtitle: "Glide low to high · play 5 times",
        instruction:
          "Lip roll alongside the tone.\nSlide smoothly across your full range — low to high.\nLet the buzz carry you through.",
        introModal: modal.lipRoll({
          requiredPlays: 5,
          tips: exerciseTips("lipRoll", "intermediate"),
          instruction:
            "Play the tone and lip roll alongside it. Slide smoothly from your lowest to your highest — your full range.\n\nFeel the buzz travel through your entire voice. Notice how the resonance shifts from chest to head as you glide.\n\nFull-range lip rolls loosen everything and connect your registers into one continuous sound.\n\nDon't worry about matching exactly. Just follow the movement.",
        }),
      }),
      gen.farinelli({
        slug: "farinelli-ch4",
        maxCount: 9,
        title: "Farinelli breathwork",
        introModal: modal.farinelli({
          title: "Farinelli breathwork",
          maxCount: 9,
          tips: exerciseTips("farinelli", "intermediate"),
          instruction:
            "Inhale, hold, and exhale for the same count — each cycle adds one beat. The deepest breathing yet.\n\nNotice how your body responds as the rhythm lengthens. Feel everything settle.",
        }),
        completionModal: {
          title: "Chapter IV Complete",
          subtitle: "Range & Projection",
          elements: [
            {
              type: "paragraph",
              text: "The Ah vowel opened something up. You've felt your voice carry with openness — low, mid, wide — and reached further than before. Something in your range has shifted.",
            },
            {
              type: "paragraph",
              text: "What comes next is different. Not louder, not higher. Something you haven't heard yet.",
              variant: "secondary",
            },
          ],
          confetti: true,
        },
      }),
    ],
  },
];
