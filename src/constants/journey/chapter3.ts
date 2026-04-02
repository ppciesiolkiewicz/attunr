import { BandTargetKind } from "./types";
import type { StageConfigInput } from "./types";
import { ExerciseGenerator, IntroModalGenerator, repeat } from "./exercise-generator";
import { exerciseTips } from "./exercise-content";

const gen = new ExerciseGenerator();
const modal = new IntroModalGenerator();

// ── Chapter 3: Vowel Exploration ────────────────────────────────────────────
// Has a warmup — prompted if >4h since last warmup.

export const CHAPTER_3_WARMUP: StageConfigInput = {
  id: "ch3-warmup",
  title: "Warmup",
  exercises: [
    gen.timeBased({
      slug: "ch3-warmup-sss-zzz",
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
    gen.lipRolls.slide({
      slug: "ch3-warmup-lip-rolls",
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
    gen.pitch.hillSustain({
      slug: "ch3-warmup-hum",
      note: 4,
      seconds: 3,
      repeats: 5,
      direction: "down",
      title: "Gentle hum",
      headerSubtitle: "Hum · 3 seconds × 5",
      instruction:
        "Hum mmmm — keep the ball at the bottom of the hill.\nSlightly wobble your voice to keep it loose.\nBreathe whenever you need to.",
      introModal: modal.hill({
        seconds: 3,
        reps: 5,
        tips: exerciseTips("hum", "introduction"),
        instruction:
          "Close your lips and hum mmmm on a low tone. Let it wobble gently.\n\nFeel the buzz in your lips and chest. Notice where the warmth settles.\n\nHumming grounds your voice in your body — the simplest way to reconnect.\n\nBreathe whenever you need to. There's no wrong way to hum.",
      }),
    }),
    gen.pitch.hillSustain({
      slug: "ch3-warmup-low-uu",
      note: 4,
      seconds: 3,
      repeats: 5,
      direction: "down",
      title: "Low Uu",
      headerSubtitle: "Chest voice · 3 seconds × 5",
      instruction:
        "Uuuu (as in 'moon') — keep the ball at the bottom of the hill.\nSlightly wobble your voice — let it settle in your chest.\nBreathe whenever you need to.",
      introModal: modal.hill({
        seconds: 3,
        reps: 5,
        tips: exerciseTips("vowel", "introduction"),
        instruction:
          "Sound uuuu (as in 'moon') on a low tone. Keep your mouth rounded like Uu — relaxed, not smiling. Let it wobble gently.\n\nNotice where the resonance lands — chest, throat, or somewhere in between.\n\nThis vowel opens your chest voice and grounds you in your body.\n\nBreathe whenever you need to — there's no rush.",
      }),
    }),
    gen.pitch.zoneAbove({
      slug: "ch3-warmup-hoo-hoo",
      boundaryNote: -6,
      seconds: 3,
      repeats: 5,
      title: "Hoo hoo",
      headerSubtitle: "Head voice · 3 seconds × 5",
      instruction:
        "Sound 'hoo hoo' on a high tone, like an owl.\nNotice the lightness — the sound lifts into your head.\nKeep it gentle.",
      introModal: modal.hill({
        seconds: 3,
        reps: 5,
        tips: exerciseTips("headVoice", "introduction"),
        instruction:
          "Sound 'hoo hoo' on a high tone, like an owl calling. Keep it light.\n\nNotice how the sound lifts — away from your chest and into your head and face.\n\nHead voice wakes up a lighter resonance and expands your range.\n\nKeep it gentle. You don't need to get this right.",
      }),
    }),
    gen.breathwork.farinelliVoiceDriven({
      slug: "ch3-warmup-farinelli",
      minCount: 2,
      maxCount: 5,
      title: "Farinelli breathwork",
      voiceBaseUrl: "breathwork-farinelli",
      introModal: modal.farinelli({
        title: "Farinelli breathwork",
        maxCount: 4,
        tips: exerciseTips("farinelli", "introduction"),
        instruction:
          "Inhale, hold, and exhale for the same count — each cycle adds one beat.\n\nNotice how your body settles as the rhythm deepens.",
      }),
    }),
  ],
};

export const CHAPTER_3_STAGES: StageConfigInput[] = [
  // ── Stage 1: Opening Up ─────────────────────────────────────────────────
  {
    id: "ch3-opening-up",
    title: "Opening Up",
    exercises: [
      {
        exerciseTypeId: "learn",
        slug: "oo-vowel",
        title: "The Oo vowel",
        cardSubtitle: "A rounder, more open shape — feel the warmth",
        elements: [
          {
            type: "paragraph",
            text: "Oo (as in 'go') is a rounder, more open shape than Uu. Your lips stay rounded but your jaw drops slightly — creating more space inside your mouth.",
          },
          {
            type: "paragraph",
            text: "This openness relaxes your throat and lets warmth into the sound. Oo is the bridge between the closed warmth of Uu and the full openness of Ah.",
            variant: "secondary",
          },
          { type: "video" },
        ],
      },
      gen.pitch.hillSustain({
        slug: "oo-low",
        note: 4,
        seconds: 5,
        repeats: 3,
        direction: "down",
        title: "Oo — low",
        headerSubtitle: "Oo vowel · 5 seconds × 3",
        cardSubtitle: "A low Oo — rounded and open, settling in your chest",
        instruction:
          "Oooo (as in 'go') — keep the ball at the bottom of the hill.\nKeep your mouth rounded and open — wider than Uu.\nSlightly wobble your voice to keep it loose.\nBreathe whenever you need to.",
        introModal: modal.hill({
          seconds: 5,
          reps: 3,
          tips: exerciseTips("vowel", "intermediate"),
          instruction:
            "Sound oooo (as in 'go') on a low tone. Keep your mouth rounded and open — wider than Uu. Let it wobble gently.\n\nFeel the warmth settle in your chest. Notice how the extra openness changes the resonance compared to Uu.\n\nOo opens your throat and introduces a rounder, warmer quality to your voice.\n\nBreathe whenever you need to. Just notice what happens.",
        }),
      }),
      gen.pitch.hillSustain({
        slug: "oo-mid",
        note: [5, 9],
        seconds: 5,
        repeats: 3,
        direction: "between",
        title: "Oo — mid",
        headerSubtitle: "Oo vowel · 5 seconds × 3",
        instruction:
          "Oooo (as in 'go') — keep the ball between the markers.\nKeep your mouth rounded and open — wider than Uu.\nFeel the resonance shift as you move higher.",
        introModal: modal.hill({
          seconds: 5,
          reps: 3,
          tips: exerciseTips("vowel", "intermediate"),
          instruction:
            "Sound oooo (as in 'go') in your mid range. Keep your mouth rounded and open — wider than Uu.\n\nNotice how the vowel feels different here — less chest, more face. The resonance lifts.\n\nMoving Oo into your mid range builds awareness of how the same vowel changes colour at different pitches.\n\nLet it be easy. There's no rush.",
        }),
      }),
    ],
  },

  // ── Stage 2: Vowel Transitions ──────────────────────────────────────────
  {
    id: "ch3-vowel-transitions",
    title: "Vowel Transitions",
    exercises: [
      {
        exerciseTypeId: "melody",
        slug: "uu-oo-transition",
        title: "Uu→Oo transition",
        headerSubtitle: "Vowel shift · 3 tones",
        cardSubtitle: "Feel the shape change — from Uu to Oo",
        tempo: 45,
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
        instruction:
          "Start with uuuu, then open into oooo as the pitch rises.\nFeel the shape change — lips stay rounded but jaw drops.\nLet the transition be smooth.",
        introModal: modal.melody({
          minScore: 0,
          tips: exerciseTips("melody", "intermediate"),
          instruction:
            "Sound uuuu on the first tone, then gradually open into oooo as the pitches rise. Follow the piano.\n\nFeel the shape change in your mouth — your lips stay rounded but your jaw drops slightly. Notice how the resonance warms and opens.\n\nVowel transitions train your voice to move between shapes without tension. It's the beginning of expressive singing.\n\nYou don't need to get this right. Just notice the shift.",
        }),
      },
      gen.pitch.hillSustain({
        slug: "oo-longer",
        note: [5, 9],
        seconds: 6,
        repeats: 3,
        direction: "between",
        title: "Oo — longer",
        headerSubtitle: "Oo vowel · 6 seconds × 3",
        instruction:
          "Oooo (as in 'go') — keep the ball between the markers.\nKeep your mouth rounded and open — wider than Uu.\nBreathe whenever you need to.",
        introModal: modal.hill({
          seconds: 6,
          reps: 3,
          tips: exerciseTips("vowel", "intermediate"),
          instruction:
            "Sound oooo (as in 'go') in your mid range. Hold for 6 seconds — longer than before.\n\nFeel the vowel settle as you sustain it. Notice how the resonance deepens the longer you hold.\n\nLonger holds build breath control and let your voice find its natural placement.\n\nBreathe whenever you need to. It's okay to pause.",
        }),
      }),
      gen.lipRolls.slide({
        slug: "lip-roll-low-high",
        startNote: -1,
        endNote: 1,
        requiredPlays: 4,
        title: "Lip roll slide",
        headerSubtitle: "Glide high to low · play 4 times",
        instruction:
          "Lip roll alongside the tone.\nSlide smoothly from high to low — feel the glide.\nDon't worry about matching exactly.",
        introModal: modal.lipRoll({
          requiredPlays: 4,
          tips: exerciseTips("lipRoll", "intermediate"),
          instruction:
            "Play the tone and lip roll alongside it. Slide smoothly from high to low.\n\nFeel the glide in your lips. Notice how the resonance moves — from lighter and higher to deeper and lower.\n\nLip rolls loosen tension and train your voice to move smoothly between pitches.\n\nJust follow the movement. There's no wrong way.",
        }),
      }),
    ],
  },

  // ── Stage 3: Wider Intervals ──────────────────────────────────────────
  {
    id: "ch3-wider-intervals",
    title: "Wider Intervals",
    exercises: [
      gen.scaleIntervals.fourth({
        slug: "fourth-melody",
        title: "Perfect fourth",
        headerSubtitle: "A comfortable leap · listen and match",
        cardSubtitle: "A natural jump — the sound of a fanfare",
        tempo: 55,
        minScore: 0,
        instruction:
          "Match the two notes — a wider jump than the second.\nListen to the piano and follow the leap.\nLet your voice move freely.",
        introModal: modal.melody({
          minScore: 0,
          tips: exerciseTips("melody", "intermediate"),
          instruction:
            "A perfect fourth — wider than anything you've sung so far. The piano plays each note for you.\n\nFeel the jump. Notice how your voice needs to reach a bit further — not as far as a fifth, but further than a second.\n\nThe perfect fourth is one of the most natural intervals in music — the first notes of many folk songs.\n\nThere's no rush. Listen first, then follow.",
        }),
      }),
      gen.scaleIntervals.fifth({
        slug: "fifth-melody",
        title: "Perfect fifth",
        headerSubtitle: "A wider leap · listen and match",
        cardSubtitle: "Your first big interval — a leap of a fifth",
        minScore: 0,
        instruction:
          "Match the two notes as they appear — a wider leap this time.\nListen to the piano and match the jump.\nLet your voice move freely between the notes.",
        introModal: modal.melody({
          minScore: 0,
          tips: exerciseTips("melody", "intermediate"),
          instruction:
            "A perfect fifth — two notes with a wider gap than anything so far. The piano plays each one for you.\n\nFeel the leap in your body. Notice how the higher note lifts and the lower note grounds.\n\nWider intervals stretch your voice and build confidence in jumping between distant pitches.\n\nThere's no rush. Listen first, then follow.",
        }),
      }),
      gen.pitch.hillSustain({
        slug: "oo-wide",
        note: [3, 10],
        seconds: 6,
        repeats: 3,
        direction: "between",
        title: "Oo — wider range",
        headerSubtitle: "Oo vowel · 6 seconds × 3",
        instruction:
          "Oooo (as in 'go') — keep the ball between the markers.\nKeep your mouth rounded and open — wider than Uu.\nNotice how the vowel changes colour at different pitches.",
        introModal: modal.hill({
          seconds: 6,
          reps: 3,
          tips: exerciseTips("vowel", "intermediate"),
          instruction:
            "Sound oooo (as in 'go') across a wider range than before. Keep your mouth rounded and open.\n\nNotice how the vowel changes colour as you move through different pitches — warmer low, brighter high.\n\nSounding a vowel across a wider range trains your voice to carry resonance everywhere.\n\nLet it be easy. Breathe whenever you need to.",
        }),
      }),
      gen.pitch.zoneAbove({
        slug: "hoo-hoo-high",
        boundaryNote: -6,
        seconds: 4,
        repeats: 3,
        title: "Hoo hoo",
        headerSubtitle: "Head voice · 4 seconds × 3",
        instruction:
          "Sound 'hoo hoo' on a high tone, like an owl.\nNotice the lightness — the sound lifts into your head.\nKeep it gentle and easy.",
        introModal: modal.hill({
          seconds: 4,
          reps: 3,
          tips: exerciseTips("headVoice", "intermediate"),
          instruction:
            "Sound 'hoo hoo' on a high tone, like an owl calling. Keep it light and easy.\n\nNotice how the sound floats — away from your chest and into your head and face.\n\nHead voice exercises expand your range and wake up a lighter, more agile part of your voice.\n\nKeep it gentle. Just notice what happens.",
        }),
      }),
    ],
  },

  // ── Stage 4: Settling In ──────────────────────────────────────────────
  {
    id: "ch3-settling-in",
    title: "Settling In",
    exercises: [
      gen.pitch.hillSustain({
        slug: "oo-settle",
        note: [5, 9],
        seconds: 8,
        repeats: 3,
        direction: "between",
        title: "Oo — long",
        headerSubtitle: "Oo vowel · 8 seconds × 3",
        instruction:
          "Oooo (as in 'go') — keep the ball between the markers.\nKeep your mouth rounded and open — wider than Uu.\nFeel the resonance deepen as you sustain.",
        introModal: modal.hill({
          seconds: 8,
          reps: 3,
          tips: exerciseTips("vowel", "intermediate"),
          instruction:
            "Sound oooo (as in 'go') in your mid range. Hold for 8 seconds — the longest holds yet.\n\nFeel how the resonance deepens the longer you sustain. Notice your breath settling into a rhythm.\n\nLonger holds carry your vowel further and build the stability behind your voice.\n\nBreathe whenever you need to. There's no rush.",
        }),
      }),
      gen.breathwork.farinelliVoiceDriven({
        slug: "farinelli-ch3",
        minCount: 2,
        maxCount: 7,
        title: "Farinelli breathwork",
        voiceBaseUrl: "breathwork-farinelli",
        introModal: modal.farinelli({
          title: "Farinelli breathwork",
          maxCount: 6,
          tips: exerciseTips("farinelli", "intermediate"),
          instruction:
            "Inhale, hold, and exhale for the same count — each cycle adds one beat. Deeper breathing this time.\n\nNotice how your body responds as the rhythm lengthens.",
        }),
        completionModal: {
          title: "Chapter 3 Complete",
          subtitle: "Vowel Exploration",
          elements: [
            {
              type: "paragraph",
              text: "A new vowel. A new shape. You've felt Oo open your voice — low, mid, wide — and moved between Uu and Oo without forcing anything. Something is warming up.",
            },
            {
              type: "paragraph",
              text: "Chapter IV goes deeper — longer sustains, wider ranges, and more control over the sounds you've discovered.",
              variant: "secondary",
            },
          ],
          confetti: true,
        },
      }),
    ],
  },
];
