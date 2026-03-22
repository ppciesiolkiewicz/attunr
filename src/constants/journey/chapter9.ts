import { BandTargetKind, NoteDuration } from "./types";
import type { StageConfigInput } from "./types";
import { ExerciseGenerator, IntroModalGenerator, repeat } from "./exercise-generator";
import { exerciseTips } from "./exercise-content";

const gen = new ExerciseGenerator();
const modal = new IntroModalGenerator();

// ── Chapter 9: Chakras (secret) ─────────────────────────────────────────────
// Has a warmup — prompted if >4h since last warmup.

const EVEN_7_SCALE = { type: "even-7-from-major" as const, root: 1 };

export const CHAPTER_9_WARMUP: StageConfigInput = {
  id: "ch9-warmup",
  title: "Warmup",
  exercises: [
    gen.timeBased({
      slug: "ch9-warmup-sss-zzz",
      title: "Sss-zzz",
      headerSubtitle: "Wake up breath · 21 seconds",
      cues: [
        { text: "sss", seconds: 3 },
        ...repeat(
          [
            { text: "zzz", seconds: 3 },
            { text: "sss", seconds: 3 },
          ],
          3,
        ),
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
      slug: "ch9-warmup-lip-rolls",
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
      slug: "ch9-warmup-hum",
      note: 4,
      seconds: 3,
      repeats: 5,
      direction: "down",
      title: "Gentle hum",
      headerSubtitle: "Hum · 3 seconds × 5",
      instruction:
        "Hum mmmm on a low tone.\nSlightly wobble your voice to keep it loose.\nBreathe whenever you need to.",
      introModal: modal.hill({
        seconds: 3,
        reps: 5,
        tips: exerciseTips("hum", "introduction"),
        instruction:
          "Close your lips and hum mmmm on a low tone. Let it wobble gently.\n\nFeel the buzz in your lips and chest. Notice where the warmth settles.\n\nHumming grounds your voice in your body — the simplest way to reconnect.\n\nBreathe whenever you need to. There's no wrong way to hum.",
      }),
    }),
    gen.hillSustain({
      slug: "ch9-warmup-low-uu",
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
          "Sing uuuu (as in 'moon') on a low tone. Keep your mouth rounded like Uu — relaxed, not smiling. Let it wobble gently.\n\nNotice where the resonance lands — chest, throat, or somewhere in between.\n\nThis vowel opens your chest voice and grounds you in your body.\n\nBreathe whenever you need to — there's no rush.",
      }),
    }),
    gen.zoneAbove({
      slug: "ch9-warmup-hoo-hoo",
      boundaryNote: -6,
      seconds: 3,
      repeats: 5,
      title: "Hoo hoo",
      headerSubtitle: "Head voice · 3 seconds × 5",
      instruction:
        "Sing 'hoo hoo' on a high tone, like an owl.\nNotice the lightness — the sound lifts into your head.\nKeep it gentle.",
      introModal: modal.hill({
        seconds: 3,
        reps: 5,
        tips: exerciseTips("headVoice", "introduction"),
        instruction:
          "Sing 'hoo hoo' on a high tone, like an owl calling. Keep it light.\n\nNotice how the sound lifts — away from your chest and into your head and face.\n\nHead voice wakes up a lighter resonance and expands your range.\n\nKeep it gentle. You don't need to get this right.",
      }),
    }),
    gen.farinelli({
      slug: "ch9-warmup-farinelli",
      maxCount: 7,
      title: "Farinelli breathwork",
      introModal: modal.farinelli({
        title: "Farinelli breathwork",
        maxCount: 7,
        tips: exerciseTips("farinelli", "introduction"),
        instruction:
          "Inhale, hold, and exhale for the same count — each cycle adds one beat.\n\nNotice how your body settles as the rhythm deepens.",
      }),
    }),
  ],
};

export const CHAPTER_9_STAGES: StageConfigInput[] = [
  // ── Stage 1: Root & Sacral ──────────────────────────────────────────────
  {
    id: "ch9-root-sacral",
    title: "Root & Sacral",
    exercises: [
      {
        exerciseTypeId: "learn",
        slug: "chakra-intro",
        title: "Chakras and sound",
        elements: [
          {
            type: "paragraph",
            text: "There are seven energy centres in your body — from the base of your spine to the crown of your head. Each one vibrates at a different frequency. In this chapter, you'll feel each one through sound.",
          },
          {
            type: "paragraph",
            text: "Each chakra maps to a tone across your vocal range. A 7-tone scale — one note per centre — rising from root to crown. You'll hum a mantra on each tone and notice where it resonates.",
            variant: "secondary",
          },
          { type: "video" },
        ],
      },
      gen.hillSustain({
        slug: "lam-root",
        note: 1,
        seconds: 6,
        repeats: 3,
        direction: "down",
        scale: EVEN_7_SCALE,
        title: "LAM — Root chakra",
        headerSubtitle: "Mantra · 6 seconds × 3",
        instruction:
          "Hum LAM on this tone. Feel it ground you.\nLet the vibration settle at the base of your spine.\nBreathe whenever you need to.",
        introModal: modal.hill({
          seconds: 6,
          reps: 3,
          tips: exerciseTips("chakra", "advanced"),
          instruction:
            "Hum LAM on a low tone. Let the vibration settle at the base of your spine.\n\nFeel the grounding — heavy, warm, rooted. Notice where the sound lands in your body.\n\nThe root chakra is your foundation. This tone connects you to the earth beneath you.\n\nThere's no rush. Just let it hum through you.",
        }),
      }),
      gen.hillSustain({
        slug: "vam-sacral",
        note: 2,
        seconds: 6,
        repeats: 3,
        direction: "down",
        scale: EVEN_7_SCALE,
        title: "VAM — Sacral chakra",
        headerSubtitle: "Mantra · 6 seconds × 3",
        instruction:
          "Hum VAM on this tone. Feel it in your lower belly.\nLet the vibration warm and soften.\nThere's no rush.",
        introModal: modal.hill({
          seconds: 6,
          reps: 3,
          tips: exerciseTips("chakra", "advanced"),
          instruction:
            "Hum VAM on this tone. Feel the vibration settle in your lower belly.\n\nNotice the warmth — softer than the root, more fluid. Let the sound move gently.\n\nThe sacral chakra holds creativity and feeling. This tone opens that space.\n\nLet it be easy. Just notice what happens.",
        }),
      }),
    ],
  },

  // ── Stage 2: Solar Plexus & Heart ───────────────────────────────────────
  {
    id: "ch9-solar-heart",
    title: "Solar Plexus & Heart",
    exercises: [
      gen.hillSustain({
        slug: "ram-solar",
        note: 3,
        seconds: 6,
        repeats: 3,
        direction: "down",
        scale: EVEN_7_SCALE,
        title: "RAM — Solar plexus",
        headerSubtitle: "Mantra · 6 seconds × 3",
        instruction:
          "Hum RAM on this tone. Feel strength in your core.\nI am strong.\nLet the sound radiate outward.",
        introModal: modal.hill({
          seconds: 6,
          reps: 3,
          tips: exerciseTips("chakra", "advanced"),
          instruction:
            "Hum RAM on this tone. Feel the vibration in your solar plexus — your core.\n\nNotice the strength there. Let the sound radiate outward from your centre.\n\nThe solar plexus is where confidence lives. This tone wakes it up.\n\nBreathe whenever you need to.",
        }),
      }),
      gen.hillSustain({
        slug: "yam-heart",
        note: 4,
        seconds: 6,
        repeats: 3,
        direction: "down",
        scale: EVEN_7_SCALE,
        title: "YAM — Heart chakra",
        headerSubtitle: "Mantra · 6 seconds × 3",
        instruction:
          "Hum YAM on this tone. Feel your chest open.\nI am open.\nLet the sound fill your heart.",
        introModal: modal.hill({
          seconds: 6,
          reps: 3,
          tips: exerciseTips("chakra", "advanced"),
          instruction:
            "Hum YAM on this tone. Feel your chest open as the vibration settles.\n\nNotice the space — wider, softer. Let the sound fill your heart.\n\nThe heart chakra is where openness lives. This tone invites it.\n\nThere's no wrong way to feel this. Just notice what happens.",
        }),
      }),
      gen.hillSustain({
        slug: "heart-ah",
        note: [5, 9],
        seconds: 8,
        repeats: 3,
        direction: "between",
        title: "Heart Ah",
        headerSubtitle: "Open Ah · 8 seconds × 3",
        instruction:
          "Open Ah from your heart — keep the ball between the markers.\nFeel the openness in your chest.\nI am open.",
        introModal: modal.hill({
          seconds: 8,
          reps: 3,
          tips: exerciseTips("vowel", "advanced"),
          instruction:
            "Sing an open Ah from your heart. Let the sound be wide and warm.\n\nFeel the openness in your chest — the vowel naturally opens your body.\n\nAh is the most open sound you can make. It carries the heart's energy outward.\n\nBreathe whenever you need to. Let it be easy.",
        }),
      }),
    ],
  },

  // ── Stage 3: Throat, Third Eye & Crown ──────────────────────────────────
  {
    id: "ch9-upper-chakras",
    title: "Throat, Third Eye & Crown",
    exercises: [
      gen.hillSustain({
        slug: "ham-throat",
        note: 5,
        seconds: 5,
        repeats: 3,
        direction: "down",
        scale: EVEN_7_SCALE,
        title: "HAM — Throat chakra",
        headerSubtitle: "Mantra · 5 seconds × 3",
        instruction:
          "Hum HAM on this tone. Feel it in your throat.\nI speak my truth.\nLet the vibration clear the way.",
        introModal: modal.hill({
          seconds: 5,
          reps: 3,
          tips: exerciseTips("chakra", "advanced"),
          instruction:
            "Hum HAM on this tone. Feel the vibration settle in your throat.\n\nNotice the clarity — this is where your voice lives. Let it speak freely.\n\nThe throat chakra is truth. This tone opens the channel.\n\nThere's no rush. Just let the sound be.",
        }),
      }),
      gen.hillSustain({
        slug: "om-third-eye",
        note: 6,
        seconds: 5,
        repeats: 3,
        direction: "down",
        scale: EVEN_7_SCALE,
        title: "OM — Third eye",
        headerSubtitle: "Mantra · 5 seconds × 3",
        instruction:
          "Hum OM on this tone. Feel it between your brows.\nNotice the stillness behind the sound.\nLet your awareness settle inward.",
        introModal: modal.hill({
          seconds: 5,
          reps: 3,
          tips: exerciseTips("chakra", "advanced"),
          instruction:
            "Hum OM on this tone. Feel the vibration between your brows.\n\nNotice the stillness — awareness without effort. Let inner vision arrive on its own.\n\nThe third eye is perception beyond sight. This tone opens that space.\n\nJust notice what happens. There's no wrong way.",
        }),
      }),
      gen.timeBased({
        slug: "crown-silence",
        title: "Crown silence",
        headerSubtitle: "Awareness · 36 seconds",
        cardSubtitle: "The crown is silence — just breathe and notice",
        cues: [
          ...repeat(
            [
              { text: "Breathe in", seconds: 5 },
              { text: "Hold in silence", seconds: 5 },
              { text: "Exhale slowly", seconds: 8 },
            ],
            2,
          ),
        ],
        instruction:
          "The crown chakra is silence. Just breathe and notice what's there.\nNo sound needed. Just awareness.",
        tips: exerciseTips("chakra", "advanced"),
      }),
      {
        exerciseTypeId: "melody" as const,
        slug: "chakra-ascent",
        title: "7-tone ascent",
        headerSubtitle: "7 tones · ascending",
        tempo: 40,
        melody: [
          {
            type: "even-7-from-major",
            root: 1,
            events: [
              { type: "note" as const, target: { kind: BandTargetKind.Index, i: 1 }, duration: NoteDuration.Half },
              { type: "note" as const, target: { kind: BandTargetKind.Index, i: 2 }, duration: NoteDuration.Half },
              { type: "note" as const, target: { kind: BandTargetKind.Index, i: 3 }, duration: NoteDuration.Half },
              { type: "note" as const, target: { kind: BandTargetKind.Index, i: 4 }, duration: NoteDuration.Half },
              { type: "note" as const, target: { kind: BandTargetKind.Index, i: 5 }, duration: NoteDuration.Half },
              { type: "note" as const, target: { kind: BandTargetKind.Index, i: 6 }, duration: NoteDuration.Half },
              { type: "note" as const, target: { kind: BandTargetKind.Index, i: 7 }, duration: NoteDuration.Half },
            ],
          },
        ],
        minScore: 0,
        instruction:
          "Sing each tone as it rises — feel the energy move upward through all seven centres.\nLet each note lift you a little higher.\nJust follow the sound.",
        introModal: modal.melody({
          minScore: 0,
          tips: exerciseTips("melody", "advanced"),
          instruction:
            "Sing seven ascending tones — one for each chakra, from root to crown.\n\nFeel the energy rise through your body as the pitch climbs. Each note maps to a different centre.\n\nThis ascent traces the full chakra path in a single breath of melody.\n\nJust follow the notes. There's no wrong way.",
        }),
      },
    ],
  },

  // ── Stage 4: Full Chakra Flow ───────────────────────────────────────────
  {
    id: "ch9-full-flow",
    title: "Full Chakra Flow",
    exercises: [
      {
        exerciseTypeId: "melody" as const,
        slug: "chakra-flow",
        title: "7-tone flow",
        headerSubtitle: "7 tones · up and down",
        cardSubtitle: "All seven tones — ascending and returning",
        tempo: 35,
        melody: [
          {
            type: "even-7-from-major",
            root: 1,
            events: [
              { type: "note" as const, target: { kind: BandTargetKind.Index, i: 1 }, duration: NoteDuration.Half },
              { type: "note" as const, target: { kind: BandTargetKind.Index, i: 2 }, duration: NoteDuration.Half },
              { type: "note" as const, target: { kind: BandTargetKind.Index, i: 3 }, duration: NoteDuration.Half },
              { type: "note" as const, target: { kind: BandTargetKind.Index, i: 4 }, duration: NoteDuration.Half },
              { type: "note" as const, target: { kind: BandTargetKind.Index, i: 5 }, duration: NoteDuration.Half },
              { type: "note" as const, target: { kind: BandTargetKind.Index, i: 6 }, duration: NoteDuration.Half },
              { type: "note" as const, target: { kind: BandTargetKind.Index, i: 7 }, duration: NoteDuration.Half },
              { type: "note" as const, target: { kind: BandTargetKind.Index, i: 6 }, duration: NoteDuration.Half },
              { type: "note" as const, target: { kind: BandTargetKind.Index, i: 5 }, duration: NoteDuration.Half },
              { type: "note" as const, target: { kind: BandTargetKind.Index, i: 4 }, duration: NoteDuration.Half },
              { type: "note" as const, target: { kind: BandTargetKind.Index, i: 3 }, duration: NoteDuration.Half },
              { type: "note" as const, target: { kind: BandTargetKind.Index, i: 2 }, duration: NoteDuration.Half },
              { type: "note" as const, target: { kind: BandTargetKind.Index, i: 1 }, duration: NoteDuration.Half },
            ],
          },
        ],
        minScore: 0,
        instruction:
          "Sing seven tones ascending, then return back down.\nFeel the energy rise and settle.\nLet each note find its place.",
        introModal: modal.melody({
          minScore: 0,
          tips: exerciseTips("melody", "advanced"),
          instruction:
            "Sing the full chakra scale — seven tones ascending from root to crown, then descending back to root.\n\nFeel the energy rise through your body and then return. Notice how the descent feels different from the ascent.\n\nThis is the complete chakra flow — a single arc through all seven centres.\n\nJust follow the notes. Let it be easy.",
        }),
      },
      gen.timeBased({
        slug: "mantra-flow",
        title: "Mantra sequence",
        headerSubtitle: "Mantras · 35 seconds",
        cardSubtitle: "Seven mantras — feel where each one lives",
        cues: [
          { text: "LAM", seconds: 5 },
          { text: "VAM", seconds: 5 },
          { text: "RAM", seconds: 5 },
          { text: "YAM", seconds: 5 },
          { text: "HAM", seconds: 5 },
          { text: "OM", seconds: 5 },
          { text: "Silence", seconds: 5 },
        ],
        instruction:
          "Hum each mantra as it appears. Feel it vibrate in its place.\nLet each one settle before the next arrives.\nJust notice what happens.",
        tips: exerciseTips("chakra", "advanced"),
      }),
      gen.farinelli({
        slug: "farinelli-ch9",
        maxCount: 9,
        title: "Farinelli breathwork",
        introModal: modal.farinelli({
          title: "Farinelli breathwork",
          maxCount: 9,
          tips: exerciseTips("farinelli", "advanced"),
          instruction:
            "Inhale, hold, and exhale for the same count — each cycle adds one beat.\n\nNotice how your body settles after the chakra journey. Let the breath carry you home.",
        }),
        completionModal: {
          title: "Chakras Complete",
          subtitle: "",
          elements: [
            {
              type: "paragraph",
              text: "Seven tones. Seven places in your body. You've held each one and felt where it lives. That awareness stays with you.",
            },
          ],
          confetti: true,
        },
      }),
    ],
  },
];
