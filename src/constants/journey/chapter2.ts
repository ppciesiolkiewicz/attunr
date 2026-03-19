import { BandTargetKind, NoteDuration } from "./types";
import type { StageConfigInput } from "./types";
import { ExerciseGenerator, IntroModalGenerator, repeat } from "./exercise-generator";
import { VOWEL_TIPS, HEAD_VOICE_TIPS, BREATH_SOUND_TIPS } from "./exercise-tips";

const gen = new ExerciseGenerator();
const modal = new IntroModalGenerator();

// ── Chapter 2: Building Foundation ──────────────────────────────────────────
// Has a warmup — prompted if >4h since last warmup.

export const CHAPTER_2_WARMUP: StageConfigInput = {
  id: "ch2-warmup",
  title: "Warmup",
  exercises: [
    gen.timeBased({
      slug: "warmup-sss-zzz",
      title: "Sss-zzz",
      headerSubtitle: "Wake up breath · 18 seconds",
      cues: repeat([
        { text: "sss", seconds: 3 },
        { text: "zzz", seconds: 3 },
      ], 3),
      instruction:
        "Alternate sss and zzz — feel the vibration shift.\nIt's okay to take breaths between sounds.",
      tips: BREATH_SOUND_TIPS,
      introModal: modal.volumeDetection({
        targetSeconds: 18,
        instruction:
          "Alternate between sss and zzz sounds. Feel how sss is just air and zzz adds voice. Follow along with the cues.\n\nNotice the vibration shift — from voiceless to voiced and back.\n\nThis wakes up your breath and reconnects you to where sound starts.\n\nKeep your mouth relaxed. There's no rush.",
      }),
    }),
    gen.lipRoll({
      slug: "warmup-lip-rolls",
      startNote: 1,
      endNote: -1,
      requiredPlays: 4,
      title: "Lip rolls — low to high",
      headerSubtitle: "Glide low to high · play 4 times",
      instruction:
        "Lip roll alongside the tone.\nSlide smoothly from low to high — loosen your lips.",
      introModal: modal.lipRoll({
        requiredPlays: 4,
        instruction:
          "Play the tone and lip roll alongside it. Slide smoothly from low to high.\n\nFeel the buzz travel through your lips. Notice how the resonance shifts as the pitch rises.\n\nLip rolls loosen tension and wake up the connection between breath and voice.\n\nDon't worry about matching exactly. Just follow the movement.",
      }),
    }),
    gen.hillSustain({
      slug: "warmup-hum",
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
        instruction:
          "Close your lips and hum mmmm on a low tone. Let it wobble gently.\n\nFeel the buzz in your lips and chest. Notice where the warmth settles.\n\nHumming grounds your voice in your body — the simplest way to reconnect.\n\nBreathe whenever you need to. There's no wrong way to hum.",
      }),
    }),
    gen.hillSustain({
      slug: "warmup-low-uu",
      note: 4,
      seconds: 3,
      repeats: 5,
      direction: "down",
      title: "Low Uu",
      headerSubtitle: "Chest voice · 3 seconds × 5",
      instruction:
        "Sing uuuu (as in 'moon') on a low tone.\nSlightly wobble your voice — let it settle in your chest.\nBreathe whenever you need to.",
      introModal: modal.hill({
        seconds: 3,
        reps: 5,
        tips: VOWEL_TIPS,
        instruction:
          "Sing uuuu (as in 'moon') on a low tone. Keep your mouth rounded like Uu — relaxed, not smiling. Let it wobble gently.\n\nNotice where the resonance lands — chest, throat, or somewhere in between.\n\nThis vowel opens your chest voice and grounds you in your body.\n\nBreathe whenever you need to — there's no rush.",
      }),
    }),
    gen.zoneAbove({
      slug: "warmup-hoo-hoo",
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
        tips: HEAD_VOICE_TIPS,
        instruction:
          "Sing 'hoo hoo' on a high tone, like an owl calling. Keep it light.\n\nNotice how the sound lifts — away from your chest and into your head and face.\n\nHead voice wakes up a lighter resonance and expands your range.\n\nKeep it gentle. You don't need to get this right.",
      }),
    }),
    gen.farinelli({
      slug: "warmup-farinelli",
      maxCount: 5,
      title: "Farinelli breathwork",
      introModal: modal.farinelli({
        title: "Farinelli breathwork",
        maxCount: 5,
        instruction:
          "Inhale, hold, and exhale for the same count — each cycle adds one beat.\n\nNotice how your body settles as the rhythm deepens.",
      }),
    }),
  ],
};

export const CHAPTER_2_STAGES: StageConfigInput[] = [
  // ── Stage 1: Finding Your Range ─────────────────────────────────────────
  {
    id: "ch2-finding-range",
    title: "Finding Your Range",
    exercises: [
      {
        exerciseTypeId: "melody",
        slug: "hum-low-to-mid",
        title: "Hum — low to mid",
        headerSubtitle: "Hum · 3 rising pitches",
        tempo: 40,
        melody: [
          {
            type: "chromatic",
            root: 1,
            events: [
              { type: "note", target: { kind: BandTargetKind.Index, i: 1 }, duration: 8 },
              { type: "note", target: { kind: BandTargetKind.Index, i: 4 }, duration: 8 },
              { type: "note", target: { kind: BandTargetKind.Index, i: 7 }, duration: 8 },
            ],
          },
        ],
        minScore: 0,
        instruction:
          "Hum at three rising pitches — low, mid-low, mid.\nFeel the resonance shift as you rise.\nKeep each hum steady and relaxed.",
        introModal: modal.melody({
          minScore: 0,
          instruction:
            "Hum mmmm at three rising pitches. The piano plays each one — match what you hear.\n\nFeel where the resonance lives at each pitch. Notice how it shifts as you rise — from chest to throat to face.\n\nThis is your first pitched hum sequence. It maps where sound lives across your low-to-mid range.\n\nThere's no rush. Listen first, then follow.",
        }),
      },
      {
        exerciseTypeId: "melody",
        slug: "u-low-to-mid",
        title: "U — low to mid",
        headerSubtitle: "Vowel U · 3 rising pitches",
        tempo: 40,
        melody: [
          {
            type: "chromatic",
            root: 1,
            events: [
              { type: "note", target: { kind: BandTargetKind.Index, i: 1 }, duration: 8 },
              { type: "note", target: { kind: BandTargetKind.Index, i: 4 }, duration: 8 },
              { type: "note", target: { kind: BandTargetKind.Index, i: 7 }, duration: 8 },
            ],
          },
        ],
        minScore: 0,
        instruction:
          "Sing uuu, stepping from low to mid-low to mid.\nFeel the resonance shift as you rise.\nKeep each tone warm and open.",
        introModal: modal.melody({
          minScore: 0,
          tips: VOWEL_TIPS,
          instruction:
            "Sing uuuu (as in 'moon') at three rising pitches. Keep your mouth rounded like Uu — relaxed, not smiling. Match the piano at each step.\n\nNotice how the vowel feels different at each pitch — warmer low, more open mid.\n\nMoving a vowel through your range builds awareness of how resonance shifts with pitch.\n\nLet it be easy. There's no wrong way.",
        }),
      },
      gen.lipRoll({
        slug: "lip-rolls-high-to-low",
        startNote: -1,
        endNote: 1,
        requiredPlays: 3,
        title: "Lip rolls — high to low",
        headerSubtitle: "Glide high to low · play 3 times",
        instruction:
          "Lip roll alongside the tone.\nSlide smoothly from high to low — keep it easy.\nDon't worry about matching exactly.",
        introModal: modal.lipRoll({
          requiredPlays: 3,
          instruction:
            "Play the tone and lip roll alongside it. Slide smoothly from high to low.\n\nFeel the glide in your lips. Notice how the resonance moves — from lighter and higher to deeper and lower.\n\nLip rolls loosen tension and train your voice to move smoothly between pitches.\n\nDon't worry about matching exactly. The goal is to feel the movement.",
        }),
      }),
      {
        exerciseTypeId: "rhythm",
        slug: "feel-the-beat",
        title: "Feel the Beat",
        cardSubtitle: "Tap along to the beat",
        tempo: 80,
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
          // Row 4
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
          { type: "tap", duration: NoteDuration.Quarter },
        ],
        metronome: true,
        minScore: 60,
        instruction: "Tap the spacebar or touch the screen on each beat.",
        introModal: modal.rhythm({
          minScore: 60,
          instruction:
            "Tap along to the beat — spacebar or touch the screen. The metronome clicks to guide you.\n\nFeel the rhythm in your body. Notice how your breath settles into the pattern.\n\nRhythm is the foundation of all music. Feeling the beat grounds everything that follows.\n\nJust tap along. Match 60% to continue.",
        }),
      },
    ],
  },

  // ── Stage 2: First Scale ────────────────────────────────────────────────
  {
    id: "ch2-first-scale",
    title: "First Scale",
    exercises: [
      {
        exerciseTypeId: "melody",
        slug: "5-tone-scale",
        title: "5-tone scale",
        headerSubtitle: "Sing 5 notes up and back down",
        cardSubtitle: "Your first scale — stepping up and back down",
        tempo: 55,
        melody: [
          {
            type: "major",
            root: 3,
            events: [
              { type: "note", target: { kind: BandTargetKind.Index, i: 1 }, duration: 8 },
              { type: "note", target: { kind: BandTargetKind.Index, i: 2 }, duration: 8 },
              { type: "note", target: { kind: BandTargetKind.Index, i: 3 }, duration: 8 },
              { type: "note", target: { kind: BandTargetKind.Index, i: 4 }, duration: 8 },
              { type: "note", target: { kind: BandTargetKind.Index, i: 5 }, duration: 8 },
              { type: "note", target: { kind: BandTargetKind.Index, i: 4 }, duration: 8 },
              { type: "note", target: { kind: BandTargetKind.Index, i: 3 }, duration: 8 },
              { type: "note", target: { kind: BandTargetKind.Index, i: 2 }, duration: 8 },
              { type: "note", target: { kind: BandTargetKind.Index, i: 1 }, duration: 8 },
            ],
          },
        ],
        minScore: 0,
        instruction:
          "Sing each note as it scrolls past.\nUp five notes, then back down.\nListen to the piano and follow along.",
        introModal: modal.melody({
          minScore: 0,
          instruction:
            "Sing each note as it scrolls past — up five notes, then back down. The piano plays each one for you.\n\nNotice how the distance between notes feels. Feel your voice stepping through the scale.\n\nThis is your first scale. Five notes up and five back down — the building block of melody.\n\nThere's no rush. Listen first, then follow.",
        }),
      },
      {
        exerciseTypeId: "melody",
        slug: "hum-sequence",
        title: "Hum sequence",
        headerSubtitle: "3 tones rising",
        tempo: 40,
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
          "Hum three tones rising from low.\nMove smoothly between each tone.\nFeel the resonance shift as you rise.",
        introModal: modal.melody({
          minScore: 0,
          instruction:
            "Hum mmmm on three rising tones. The piano plays each one — follow along.\n\nFeel the resonance shift as you rise. Notice where each tone lives in your body.\n\nHumming through a sequence builds the bridge between single tones and melody.\n\nJust follow the sound. There's no wrong way.",
        }),
      },
      {
        exerciseTypeId: "melody",
        slug: "u-sequence",
        title: "U sequence",
        headerSubtitle: "3 tones rising",
        tempo: 40,
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
          "Sing uuuu (as in 'moon') on three rising tones.\nKeep your mouth rounded like Uu — relaxed, not smiling.\nFeel the vowel resonate differently at each pitch.",
        introModal: modal.melody({
          minScore: 0,
          tips: VOWEL_TIPS,
          instruction:
            "Sing uuuu (as in 'moon') on three rising tones. Keep your mouth rounded like Uu — relaxed, not smiling. Match the piano at each step.\n\nFeel how the vowel changes colour at each pitch — warmer low, more open higher.\n\nSinging a vowel through a sequence trains your voice to carry resonance across pitches.\n\nLet it be easy. Breathe whenever you need to.",
        }),
      },
    ],
  },

  // ── Stage 3: Sustain & Control ──────────────────────────────────────────
  {
    id: "ch2-sustain-control",
    title: "Sustain & Control",
    exercises: [
      gen.hillSustain({
        slug: "hum-mid-long",
        note: [5, 9],
        seconds: 8,
        repeats: 3,
        direction: "between",
        title: "Hum — mid",
        headerSubtitle: "Hum · 8 seconds × 3",
        instruction:
          "Hum mmmm on a mid tone — longer holds this time.\nFeel the buzz settle.\nBreathe whenever you need to.",
        introModal: modal.hill({
          seconds: 8,
          instruction:
            "Hum mmmm on a mid tone. Hold it steady for 8 seconds — longer than before.\n\nFeel the buzz settle in your chest and face. Notice how it deepens as you hold.\n\nLonger holds train your breath control and build stability without you noticing.\n\nBreathe whenever you need to. There's no rush.",
        }),
      }),
      gen.hillSustain({
        slug: "u-mid",
        note: [5, 9],
        seconds: 8,
        repeats: 3,
        direction: "between",
        title: "U — mid",
        headerSubtitle: "Vowel U · 8 seconds × 3",
        instruction:
          "Sing uuuu on the mid tone — longer holds.\nKeep your mouth rounded like Uu, not smiling.\nFeel the resonance in your chest and face.",
        introModal: modal.hill({
          seconds: 8,
          tips: VOWEL_TIPS,
          instruction:
            "Sing uuuu (as in 'moon') on a mid tone. Hold for 8 seconds.\n\nNotice the resonance in your chest and face. Feel how the vowel opens up with a longer hold.\n\nLonger vowel holds carry your resonance further and build the breath support behind your voice.\n\nKeep your mouth rounded like Uu — relaxed, not smiling. Breathe whenever you need to.",
        }),
      }),
      gen.lipRollSustain({
        slug: "lip-roll-sustain-mid",
        note: 7,
        seconds: 6,
        requiredPlays: 3,
        title: "Lip roll sustain",
        headerSubtitle: "Hold the buzz · play 3 times",
        instruction:
          "Lip roll alongside the tone.\nKeep the buzz steady at mid pitch.\nTake a breath between each one.",
        introModal: modal.lipRollSustain({
          requiredPlays: 3,
          instruction:
            "Play the tone and lip roll alongside it. Hold the buzz at a steady mid pitch.\n\nNotice where the resonance sits — lips, face, or deeper. Feel the vibration without forcing it.\n\nSustaining a lip roll at one pitch builds breath control and stability.\n\nTake a breath between each one. Just notice what happens.",
        }),
      }),
      gen.farinelli({
        slug: "farinelli-deep",
        maxCount: 7,
        title: "Farinelli breathwork",
        introModal: modal.farinelli({
          title: "Farinelli breathwork",
          maxCount: 7,
          instruction:
            "Inhale, hold, and exhale for the same count — each cycle adds one beat. Deeper breathing this time.\n\nNotice how your body responds as the rhythm lengthens.",
        }),
        completionModal: {
          title: "Chapter 2 Complete",
          subtitle: "Building Foundation",
          elements: [
            {
              type: "paragraph",
              text: "Notice how much more familiar your voice feels now. You've explored your range, found your first scale, and held tones longer than before. Something is settling.",
            },
            {
              type: "paragraph",
              text: "Chapter 3 builds on this foundation — new vowels, longer phrases, and deeper resonance.",
              variant: "secondary",
            },
          ],
          confetti: true,
        },
      }),
    ],
  },
];
