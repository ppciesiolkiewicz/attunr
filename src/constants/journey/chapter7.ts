import { BandTargetKind, NoteDuration } from "./types";
import type { StageConfigInput } from "./types";
import { ExerciseGenerator, IntroModalGenerator, repeat } from "./exercise-generator";
import { exerciseTips } from "./exercise-content";

const gen = new ExerciseGenerator();
const modal = new IntroModalGenerator();

// ── Chapter 7: Forward Placement ─────────────────────────────────────────
// Has a warmup — prompted if >4h since last warmup.

export const CHAPTER_7_WARMUP: StageConfigInput = {
  id: "ch7-warmup",
  title: "Warmup",
  exercises: [
    gen.timeBased({
      slug: "ch7-warmup-sss-zzz",
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
      slug: "ch7-warmup-lip-rolls",
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
      slug: "ch7-warmup-hum",
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
      slug: "ch7-warmup-low-uu",
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
      slug: "ch7-warmup-hoo-hoo",
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
      slug: "ch7-warmup-farinelli",
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
      slug: "ch7-warmup-oo-hill",
      note: 6,
      seconds: 3,
      repeats: 5,
      direction: "down",
      title: "Oo hill sustain",
      headerSubtitle: "Oo vowel · 3 seconds × 5",
      instruction:
        "Oooo (as in 'go') — keep the ball at the bottom of the hill.\nSlightly wobble your voice to keep it loose.\nBreathe whenever you need to.",
      introModal: modal.hill({
        seconds: 3,
        reps: 5,
        tips: exerciseTips("vowel", "introduction"),
        instruction:
          "Sing oooo (as in 'go') on a low tone. Keep your mouth rounded and open.\n\nFeel the warmth settle in your chest. Notice how the rounded shape changes the resonance.\n\nOo grounds your voice with a rounder, warmer quality — a quick reset before we begin.\n\nLet it be easy. There's no rush.",
      }),
    }),
    gen.hillSustain({
      slug: "ch7-warmup-ah-hill",
      note: 5,
      seconds: 3,
      repeats: 5,
      direction: "down",
      title: "Ah hill sustain",
      headerSubtitle: "Ah vowel · 3 seconds × 5",
      instruction:
        "Ahhh (as in 'father') — keep the ball at the bottom of the hill.\nOpen your mouth wide — let the sound carry.\nBreathe whenever you need to.",
      introModal: modal.hill({
        seconds: 3,
        reps: 5,
        tips: exerciseTips("vowel", "introduction"),
        instruction:
          "Sing ahhh (as in 'father') on a low tone. Open your mouth wide — jaw dropped, tongue low.\n\nFeel the openness in your throat. Notice how the resonance fills your chest.\n\nAh grounds your voice with full openness — a warm reset before we begin.\n\nIt's okay to pause. There's no rush.",
      }),
    }),
  ],
};

export const CHAPTER_7_STAGES: StageConfigInput[] = [
  // ── Stage 1: The Ee Vowel ─────────────────────────────────────────────────
  {
    id: "ch7-ee-vowel",
    title: "The Ee Vowel",
    exercises: [
      {
        exerciseTypeId: "learn",
        slug: "ee-vowel",
        title: "The Ee vowel",
        cardSubtitle:
          "The brightest vowel — forward, focused, resonating in your face",
        elements: [
          {
            type: "paragraph",
            text: "Ee (as in 'see') is the brightest vowel — forward, focused, resonating in your face and sinuses. Your tongue lifts high, your lips spread slightly, and the sound projects straight ahead like a beam.",
          },
          {
            type: "paragraph",
            text: "This brightness is what makes Ee so useful for placement. It teaches your voice to find the front of your face — the mask — where sound carries furthest with the least effort. Once you feel Ee there, every vowel can follow.",
            variant: "secondary",
          },
          { type: "video" },
        ],
      },
      gen.hillSustain({
        slug: "ee-mid",
        note: [7, 11],
        seconds: 5,
        repeats: 3,
        direction: "between",
        title: "Ee — mid-high",
        headerSubtitle: "Ee vowel · 5 seconds × 3",
        cardSubtitle:
          "Feel the brightness land in your face — forward and focused",
        instruction:
          "Eeee (as in 'see') — keep the ball between the markers.\nKeep the sound forward and bright — feel it in your face.\nBreathe whenever you need to.",
        introModal: modal.hill({
          seconds: 5,
          reps: 3,
          tips: exerciseTips("vowel", "intermediate"),
          instruction:
            "Sing eeee (as in 'see') in your mid-high range. Let the sound project forward — bright, focused, resonating in your face.\n\nNotice where the buzz lands. Feel it in your sinuses, your cheekbones, the front of your mouth. That's forward placement.\n\nEe teaches your voice to find the mask — the place where sound carries furthest with the least effort.\n\nBreathe whenever you need to. There's no rush.",
        }),
      }),
      gen.zoneAbove({
        slug: "ee-high",
        boundaryNote: -5,
        seconds: 4,
        repeats: 3,
        title: "Ee — high",
        headerSubtitle: "Ee vowel · 4 seconds × 3",
        instruction:
          "Sing eeee in your head voice.\nNotice how the brightness stays — even up high, Ee keeps its forward focus.\nKeep it gentle.",
        introModal: modal.hill({
          seconds: 4,
          reps: 3,
          tips: exerciseTips("headVoice", "intermediate"),
          instruction:
            "Sing eeee (as in 'see') in your head voice — higher than before. Keep it light.\n\nNotice how the brightness stays even up high. Ee doesn't lose its forward focus — it lifts and sharpens.\n\nSinging Ee in head voice builds awareness of forward placement across your full range.\n\nYou don't need to get this right. Just notice what happens.",
        }),
      }),
    ],
  },

  // ── Stage 2: Vowel Sequences ──────────────────────────────────────────────
  {
    id: "ch7-vowel-sequences",
    title: "Vowel Sequences",
    exercises: [
      {
        exerciseTypeId: "melody",
        slug: "vowel-rotation",
        title: "Vowel rotation",
        headerSubtitle: "A-O-U-O-A · listen and match",
        cardSubtitle:
          "Move through five vowels — feel each shape change in your mouth",
        tempo: 45,
        melody: [
          {
            type: "chromatic",
            root: 1,
            events: [
              { type: "note", target: { kind: BandTargetKind.Index, i: 1 }, duration: NoteDuration.Half },
              { type: "note", target: { kind: BandTargetKind.Index, i: 3 }, duration: NoteDuration.Half },
              { type: "note", target: { kind: BandTargetKind.Index, i: 5 }, duration: NoteDuration.Half },
              { type: "note", target: { kind: BandTargetKind.Index, i: 3 }, duration: NoteDuration.Half },
              { type: "note", target: { kind: BandTargetKind.Index, i: 1 }, duration: NoteDuration.Half },
            ],
          },
        ],
        minScore: 30,
        instruction:
          "Sing through the vowels — A, O, U, O, A.\nFeel each shape change in your mouth as you move between them.\nLet it be easy.",
        introModal: modal.melody({
          minScore: 30,
          tips: exerciseTips("melody", "intermediate"),
          instruction:
            "Sing through five vowels — A, O, U, O, A — each on a different pitch. The piano plays each note for you.\n\nFeel how your mouth changes shape with each vowel. Notice the journey — from open Ah, through rounded Oo, to warm Uu, and back.\n\nVowel rotation trains your voice to move smoothly between shapes while maintaining placement.\n\nMatch 30% to continue. Just follow the sound.",
        }),
      },
      {
        exerciseTypeId: "melody",
        slug: "ee-uu-ee",
        title: "Ee-Uu-Ee",
        headerSubtitle: "Ee-Uu-Ee · listen and match",
        cardSubtitle:
          "Bright to warm and back — feel the contrast in your face",
        tempo: 45,
        melody: [
          {
            type: "chromatic",
            root: 1,
            events: [
              { type: "note", target: { kind: BandTargetKind.Index, i: 1 }, duration: NoteDuration.Half },
              { type: "note", target: { kind: BandTargetKind.Index, i: 5 }, duration: NoteDuration.Half },
              { type: "note", target: { kind: BandTargetKind.Index, i: 1 }, duration: NoteDuration.Half },
            ],
          },
        ],
        minScore: 30,
        instruction:
          "Sing Ee, then Uu, then back to Ee.\nFeel the contrast — bright Ee forward in your face, warm Uu settling deeper.\nNotice how your placement shifts.",
        introModal: modal.melody({
          minScore: 30,
          tips: exerciseTips("melody", "intermediate"),
          instruction:
            "Sing three vowels — Ee, Uu, Ee — each on a different pitch. The piano plays each note for you.\n\nFeel the contrast. Ee is bright and forward — buzzing in your face. Uu is warm and round — settling in your chest. Then Ee pulls you forward again.\n\nContrasting bright and warm vowels builds awareness of how placement changes with shape.\n\nMatch 30% to continue. It's okay to pause.",
        }),
      },
      gen.hillSustain({
        slug: "vowel-transition-hill",
        note: [5, 9],
        seconds: 6,
        repeats: 3,
        direction: "between",
        title: "Vowel transition",
        headerSubtitle: "Vowel transition · 6 seconds × 3",
        instruction:
          "Different vowels on each rep — Ee, Oo, Ah. Keep the ball between the markers.\nFeel how each shape changes the resonance at the same pitch.\nBreathe whenever you need to.",
        introModal: modal.hill({
          seconds: 6,
          reps: 3,
          tips: exerciseTips("vowel", "intermediate"),
          instruction:
            "Sing a sustained tone in your mid range, moving through different vowels — Ee, Oo, Ah. Hold each for 6 seconds.\n\nNotice how the resonance shifts with each shape. Same pitch, different colour — that's placement at work.\n\nVowel transitions at the same pitch train your voice to feel how shape drives sound.\n\nLet it be easy. There's no wrong way to explore.",
        }),
      }),
    ],
  },

  // ── Stage 3: Pentatonic ───────────────────────────────────────────────────
  {
    id: "ch7-pentatonic",
    title: "Pentatonic",
    exercises: [
      gen.pentatonic({
        slug: "pentatonic-melody",
        title: "Pentatonic melody",
        headerSubtitle: "Pentatonic scale · match 50%",
        cardSubtitle:
          "The most natural melodic pattern — five notes that feel like home",
        minScore: 50,
        instruction:
          "Sing each note as it scrolls past.\nThe pentatonic scale — five notes that feel natural and familiar.\nListen first, then match.",
        introModal: modal.melody({
          minScore: 50,
          tips: exerciseTips("melody", "intermediate"),
          instruction:
            "Sing a pentatonic scale — five notes up and back down. The piano plays each note for you.\n\nFeel how the notes fit together naturally. The pentatonic scale is the most universal melodic pattern — it appears in every musical tradition on earth.\n\nSinging pentatonic melodies builds your ear for natural intervals and trains your voice to move with ease.\n\nMatch 50% to continue. Just follow the sound.",
        }),
      }),
      gen.hillSustain({
        slug: "ee-pentatonic",
        note: [4, 10],
        seconds: 6,
        repeats: 3,
        direction: "between",
        title: "Ee — pentatonic range",
        headerSubtitle: "Ee vowel · 6 seconds × 3",
        instruction:
          "Eeee (as in 'see') — keep the ball between the markers.\nKeep the sound forward and bright — feel the placement hold as you move.\nBreathe whenever you need to.",
        introModal: modal.hill({
          seconds: 6,
          reps: 3,
          tips: exerciseTips("vowel", "intermediate"),
          instruction:
            "Sing eeee (as in 'see') across a wider range than before. Hold each tone for 6 seconds.\n\nNotice how the forward placement holds — even as the pitch moves, Ee keeps its brightness and focus in your face.\n\nSinging Ee across a wider range strengthens forward placement and builds consistency.\n\nThere's no rush. Breathe whenever you need to.",
        }),
      }),
      gen.lipRoll({
        slug: "lip-roll-pentatonic",
        startNote: 3,
        endNote: -3,
        requiredPlays: 4,
        scale: { type: "major pentatonic", root: 3 },
        title: "Lip roll — pentatonic",
        headerSubtitle: "Glide pentatonic · play 4 times",
        instruction:
          "Lip roll alongside the tone.\nSlide through pentatonic steps — feel how the intervals land.\nDon't worry about matching exactly.",
        introModal: modal.lipRoll({
          requiredPlays: 4,
          tips: exerciseTips("lipRoll", "intermediate"),
          instruction:
            "Play the tone and lip roll alongside it. Slide through pentatonic steps — the same five-note pattern you just sang.\n\nFeel the buzz travel through each interval. Notice how the pentatonic steps feel different from a smooth chromatic glide.\n\nLip rolling through a scale reinforces the intervals in your body — your lips learn the distances.\n\nJust follow the movement. It's okay to pause.",
        }),
      }),
    ],
  },

  // ── Stage 4: Weaving ──────────────────────────────────────────────────────
  {
    id: "ch7-weaving",
    title: "Weaving",
    exercises: [
      gen.majorScale({
        slug: "vowel-weave",
        title: "Major scale weave",
        headerSubtitle: "Major scale · match 40%",
        cardSubtitle:
          "Weave through the major scale — up and back down",
        tempo: 50,
        minScore: 40,
        instruction:
          "Sing each note as it scrolls past.\nUp the scale and back down — follow the piano.\nListen first, then match.",
        introModal: modal.melody({
          minScore: 40,
          tips: exerciseTips("melody", "intermediate"),
          instruction:
            "Sing a full major scale — up and back down. The piano plays each note for you.\n\nFeel the steps between notes. Notice how the scale weaves through your range — each note a different colour.\n\nThe major scale is the foundation of melody. Weaving through it builds fluency and confidence.\n\nMatch 40% to continue. Let it be easy.",
        }),
      }),
      gen.lipRoll({
        slug: "lip-roll-full-ch7",
        startNote: 1,
        endNote: -1,
        requiredPlays: 5,
        title: "Lip roll — full range",
        headerSubtitle: "Glide full range · play 5 times",
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
        slug: "farinelli-ch7",
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
          title: "Chapter V Complete",
          subtitle: "Forward Placement",
          elements: [
            {
              type: "paragraph",
              text: "The Ee vowel opened something new. You've felt your voice find the front of your face — bright, focused, projecting forward. That forward placement changes how every sound carries.",
            },
            {
              type: "paragraph",
              text: "What comes next builds on this brightness. New shapes, new colours, new ways to move your voice through space.",
              variant: "secondary",
            },
          ],
          confetti: true,
        },
      }),
    ],
  },
];
