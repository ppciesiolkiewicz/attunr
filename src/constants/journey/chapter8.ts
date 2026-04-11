import { BandTargetKind, NoteDuration } from "./types";
import type { StageConfigInput } from "./types";
import { ExerciseGenerator, IntroModalGenerator, repeat } from "./exercise-generator";
import { exerciseTips } from "./exercise-content";

const gen = new ExerciseGenerator();
const modal = new IntroModalGenerator();

// ── Chapter 8: Integration ───────────────────────────────────────────────
// Has a warmup — prompted if >4h since last warmup.

export const CHAPTER_8_WARMUP: StageConfigInput = {
  id: "ch8-warmup",
  title: "Warmup",
  exercises: [
    gen.timeBased({
      slug: "ch8-warmup-sss-zzz",
      title: "Sss-zzz",
      headerSubtitle: "Wake up breath",
      cues: repeat(
        [
          { text: "sss", seconds: 3 },
          { text: "zzz", seconds: 3 },
          { text: "sss", seconds: 3 },
          { text: "Inhale", seconds: 1 },
        ],
        3,
      ),
      instruction:
        "Alternate sss and zzz — feel the vibration shift.\nQuick inhale between rounds.",
      tips: exerciseTips("breathSound", "introduction"),
      introModal: modal.volumeDetection({
        targetSeconds: 30,
        tips: exerciseTips("breathSound", "introduction"),
        instruction:
          "Alternate between sss and zzz sounds. Feel how sss is just air and zzz adds voice. Take a quick inhale between rounds. Follow along with the cues.\n\nNotice the vibration shift — from voiceless to voiced and back.\n\nThis wakes up your breath and reconnects you to where sound starts.\n\nKeep your mouth relaxed. There's no rush.",
      }),
    }),
    gen.lipRolls.slide({
      slug: "ch8-warmup-lip-rolls",
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
      slug: "ch8-warmup-hum",
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
      slug: "ch8-warmup-low-uu",
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
      slug: "ch8-warmup-hoo",
      boundaryNote: -6,
      seconds: 3,
      repeats: 5,
      title: "Hoo",
      headerSubtitle: "Head voice · 3 seconds × 5",
      instruction:
        "Sound a long 'hooo' on a high tone — light and floating.\nNotice the lightness — the sound lifts into your head.\nKeep it gentle.",
      introModal: modal.hill({
        seconds: 3,
        reps: 5,
        tips: exerciseTips("headVoice", "introduction"),
        instruction:
          "Sound a long 'hooo' on a high tone — light and floating. Keep it gentle.\n\nNotice how the sound lifts — away from your chest and into your head and face.\n\nHead voice wakes up a lighter resonance and expands your range.\n\nKeep it gentle. You don't need to get this right.",
      }),
    }),
    gen.breathwork.farinelliVoiceDriven({
      slug: "ch8-warmup-farinelli",
      minCount: 4,
      maxCount: 5,
      title: "Farinelli breathwork",
      voiceBaseUrl: "breathwork-farinelli",
      introModal: modal.farinelli({
        title: "Farinelli breathwork",
        maxCount: 2,
        tips: exerciseTips("farinelli", "introduction"),
        instruction:
          "Inhale, hold, and exhale for the same count — each cycle adds one beat.\n\nNotice how your body settles as the rhythm deepens.",
      }),
    }),
    gen.pitch.hillSustain({
      slug: "ch8-warmup-oo-hill",
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
          "Sound oooo (as in 'go') on a low tone. Keep your mouth rounded and open.\n\nFeel the warmth settle in your chest. Notice how the rounded shape changes the resonance.\n\nOo grounds your voice with a rounder, warmer quality — a quick reset before we begin.\n\nLet it be easy. There's no rush.",
      }),
    }),
    gen.pitch.hillSustain({
      slug: "ch8-warmup-ah-hill",
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
          "Sound ahhh (as in 'father') on a low tone. Open your mouth wide — jaw dropped, tongue low.\n\nFeel the openness in your throat. Notice how the resonance fills your chest.\n\nAh grounds your voice with full openness — a warm reset before we begin.\n\nIt's okay to pause. There's no rush.",
      }),
    }),
    gen.pitch.hillSustain({
      slug: "ch8-warmup-ee-hill",
      note: [7, 11],
      seconds: 3,
      repeats: 5,
      direction: "between",
      title: "Ee hill sustain",
      headerSubtitle: "Ee vowel · 3 seconds × 5",
      instruction:
        "Eeee (as in 'see') — keep the ball between the markers.\nKeep the sound forward and bright — feel it in your face.\nBreathe whenever you need to.",
      introModal: modal.hill({
        seconds: 3,
        reps: 5,
        tips: exerciseTips("vowel", "introduction"),
        instruction:
          "Sound eeee (as in 'see') in your mid-high range. Let the sound project forward — bright, focused, resonating in your face.\n\nNotice where the buzz lands. Feel it in your sinuses, your cheekbones, the front of your mouth.\n\nEe keeps your voice forward and bright — completing the vowel warmup.\n\nThere's no wrong way to do this. Breathe whenever you need to.",
      }),
    }),
  ],
};

export const CHAPTER_8_STAGES: StageConfigInput[] = [
  // ── Stage 1: Full Scale ─────────────────────────────────────────────────
  {
    id: "ch8-full-scale",
    title: "Full Scale",
    exercises: [
      gen.scales.major({
        slug: "full-major-scale",
        title: "Full major scale",
        headerSubtitle: "Major scale",
        cardSubtitle: "The full major scale — up and back down",
        tempo: 55,
        minScore: 50,
        instruction:
          "The complete major scale — up and back down.\nFeel each step as a distinct pitch.\nListen first, then match.",
        introModal: modal.melody({
          minScore: 50,
          tips: exerciseTips("melody", "advanced"),
          instruction:
            "Match the full major scale — all the way up and back down. The piano plays each note for you.\n\nFeel each step as a distinct pitch. Notice how the scale builds and resolves — rising tension, then release.\n\nThe full major scale ties together everything you've sung so far — intervals, breath, and placement in one continuous line.\n\nMatch 50% to continue. Let it be easy.",
        }),
      }),
      {
        exerciseTypeId: "melody" as const,
        slug: "hum-scale",
        title: "Hum scale",
        headerSubtitle: "Hum",
        cardSubtitle: "Hum through the full scale — feel the steps in your body",
        tempo: 50,
        melody: [
          {
            type: "major" as const,
            root: 3,
            events: [
              { type: "note" as const, target: { kind: BandTargetKind.Index, i: 1 }, duration: NoteDuration.Half },
              { type: "note" as const, target: { kind: BandTargetKind.Index, i: 2 }, duration: NoteDuration.Half },
              { type: "note" as const, target: { kind: BandTargetKind.Index, i: 3 }, duration: NoteDuration.Half },
              { type: "note" as const, target: { kind: BandTargetKind.Index, i: 4 }, duration: NoteDuration.Half },
              { type: "note" as const, target: { kind: BandTargetKind.Index, i: 5 }, duration: NoteDuration.Half },
              { type: "note" as const, target: { kind: BandTargetKind.Index, i: 4 }, duration: NoteDuration.Half },
              { type: "note" as const, target: { kind: BandTargetKind.Index, i: 3 }, duration: NoteDuration.Half },
              { type: "note" as const, target: { kind: BandTargetKind.Index, i: 2 }, duration: NoteDuration.Half },
              { type: "note" as const, target: { kind: BandTargetKind.Index, i: 1 }, duration: NoteDuration.Half },
            ],
          },
        ],
        minScore: 40,
        instruction:
          "Hum mmmm through the scale — up five notes, then back down.\nFeel each step land in your body.\nBreathe whenever you need to.",
        introModal: modal.melody({
          minScore: 40,
          tips: exerciseTips("hum", "advanced"),
          instruction:
            "Hum mmmm through a nine-note scale — up five notes, then back down the same way. The piano plays each note for you.\n\nFeel the buzz shift as the pitch rises and falls. Notice where each note lives in your body.\n\nHumming through a scale combines placement and pitch awareness — your voice learns the distances between notes.\n\nMatch 40% to continue. There's no rush.",
        }),
      },
      gen.scaleIntervals.fiveTone({
        slug: "five-tone-scale",
        title: "5-tone scale",
        headerSubtitle: "5 notes",
        cardSubtitle: "The five-tone pattern moving through your range",
        tempo: 50,
        minScore: 40,
        instruction:
          "A five-note scale that shifts up through your range.\nEach repetition starts a half-step higher.\nListen and follow.",
        introModal: modal.melody({
          minScore: 40,
          tips: exerciseTips("melody", "advanced"),
          instruction:
            "Sing a five-note scale — up five notes and back down. Then the same pattern shifts up a half-step to a new root.\n\nFeel how the same shape carries through different starting points. The intervals stay the same — your voice learns to transpose on the fly.\n\nThe shifting five-tone scale builds melodic fluency across your entire range.\n\nMatch 40% to continue. Just follow the sound.",
        }),
      }),
      gen.pitch.hillSustain({
        slug: "oo-scale-hill",
        note: [3, 12],
        seconds: 8,
        repeats: 3,
        direction: "between",
        title: "Oo scale hill",
        headerSubtitle: "Oo vowel · 8 seconds × 3",
        instruction:
          "Oooo (as in 'go') — keep the ball between the markers.\nKeep your mouth rounded — feel the warmth spread.\nBreathe whenever you need to.",
        introModal: modal.hill({
          seconds: 8,
          reps: 3,
          tips: exerciseTips("vowel", "advanced"),
          instruction:
            "Sound oooo (as in 'go') across a wide range. Hold each tone for 8 seconds.\n\nFeel the warmth settle and shift as the pitch moves. Notice how the rounded shape carries the resonance differently at each pitch.\n\nOo across a wide range builds consistent placement — the same warm quality from low to high.\n\nIt's okay to pause. Breathe whenever you need to.",
        }),
      }),
    ],
  },

  // ── Stage 2: Longer Phrases ─────────────────────────────────────────────
  {
    id: "ch8-longer-phrases",
    title: "Longer Phrases",
    exercises: [
      {
        exerciseTypeId: "melody" as const,
        slug: "multi-root-melody",
        title: "Multi-root melody",
        headerSubtitle: "Two phrases",
        cardSubtitle: "Carry the melody across two starting points — feel the shift",
        tempo: 50,
        melody: [
          {
            type: "major" as const,
            root: 3,
            events: [
              { type: "note" as const, target: { kind: BandTargetKind.Index, i: 1 }, duration: NoteDuration.Half },
              { type: "note" as const, target: { kind: BandTargetKind.Index, i: 2 }, duration: NoteDuration.Half },
              { type: "note" as const, target: { kind: BandTargetKind.Index, i: 3 }, duration: NoteDuration.Half },
              { type: "note" as const, target: { kind: BandTargetKind.Index, i: 4 }, duration: NoteDuration.Half },
              { type: "note" as const, target: { kind: BandTargetKind.Index, i: 5 }, duration: NoteDuration.Half },
            ],
          },
          {
            type: "major" as const,
            root: 6,
            events: [
              { type: "note" as const, target: { kind: BandTargetKind.Index, i: 1 }, duration: NoteDuration.Half },
              { type: "note" as const, target: { kind: BandTargetKind.Index, i: 2 }, duration: NoteDuration.Half },
              { type: "note" as const, target: { kind: BandTargetKind.Index, i: 3 }, duration: NoteDuration.Half },
              { type: "note" as const, target: { kind: BandTargetKind.Index, i: 4 }, duration: NoteDuration.Half },
              { type: "note" as const, target: { kind: BandTargetKind.Index, i: 5 }, duration: NoteDuration.Half },
            ],
          },
        ],
        minScore: 50,
        instruction:
          "Two rising phrases — the second starts higher than the first.\nCarry the melody across both starting points.\nListen first, then match.",
        introModal: modal.melody({
          minScore: 50,
          tips: exerciseTips("melody", "advanced"),
          instruction:
            "Match two rising phrases, each starting on a different root. The piano plays each note for you.\n\nFeel how the second phrase lifts from where the first left off. Notice the shift — same pattern, new starting point.\n\nCarrying a melody across two roots builds fluency. Your voice learns to move between tonal centres with confidence.\n\nMatch 50% to continue. Just follow the sound.",
        }),
      },
      gen.scales.scaleDegrees({
        slug: "scale-degrees-down",
        title: "Scale degrees — descending",
        headerSubtitle: "Top→degree→Top",
        cardSubtitle: "Feel each interval from the top — stepping down through the scale",
        startNote: 1,
        endNote: 8,
        direction: "descending",
        tempo: 45,
        minScore: 40,
        instruction:
          "Start at the top, then drop to each degree, then back up.\nFeel how each interval reaches deeper.\nListen first, then match.",
        introModal: modal.melody({
          minScore: 40,
          tips: exerciseTips("melody", "advanced"),
          instruction:
            "Sing from the octave down to each scale degree and back up. Start with the seventh, then sixth — all the way down to the root.\n\nFeel how each downward interval reaches deeper. Notice the character of each drop — familiar but different from ascending.\n\nDescending intervals are often harder — your ear is less practised going down. This exercise fills that gap.\n\nMatch 40% to continue. Let it be easy.",
        }),
      }),
      gen.pitch.hillSustain({
        slug: "ah-sustained",
        note: [5, 9],
        seconds: 10,
        repeats: 3,
        direction: "between",
        title: "Ah sustained",
        headerSubtitle: "Ah vowel · 10 seconds × 3",
        instruction:
          "Ahhh (as in 'father') — keep the ball between the markers.\nOpen your mouth wide — let the sound fill you.\nBreathe whenever you need to.",
        introModal: modal.hill({
          seconds: 10,
          reps: 3,
          tips: exerciseTips("vowel", "advanced"),
          instruction:
            "Sound ahhh (as in 'father') in your mid range. Hold each tone for 10 seconds — the longest sustain yet.\n\nFeel the openness in your throat and chest. Notice how the resonance deepens as you hold longer.\n\nLonger sustains build breath control and teach your voice to stay steady under pressure.\n\nThere's no rush. Breathe whenever you need to.",
        }),
      }),
      gen.lipRolls.slide({
        slug: "lip-roll-full-ch8",
        startNote: 1,
        endNote: -1,
        requiredPlays: 5,
        title: "Lip roll — full range",
        headerSubtitle: "Glide full range · play 5 times",
        instruction:
          "Lip roll alongside the tone.\nSlide smoothly across your full range — low to high.\nLet the buzz carry you through.",
        introModal: modal.lipRoll({
          requiredPlays: 5,
          tips: exerciseTips("lipRoll", "advanced"),
          instruction:
            "Play the tone and lip roll alongside it. Slide smoothly from your lowest to your highest — your full range.\n\nFeel the buzz travel through your entire voice. Notice how the resonance shifts from chest to head as you glide.\n\nFull-range lip rolls loosen everything and connect your registers into one continuous sound.\n\nDon't worry about matching exactly. Just follow the movement.",
        }),
      }),
    ],
  },

  // ── Stage 3: Precision ──────────────────────────────────────────────────
  {
    id: "ch8-precision",
    title: "Precision",
    exercises: [
      gen.pitch.hillSustain({
        slug: "narrow-zone",
        note: [6, 8],
        seconds: 8,
        repeats: 3,
        direction: "between",
        title: "Narrow zone",
        headerSubtitle: "Sustain · 8 seconds × 3",
        cardSubtitle: "A tight 2-semitone zone — precision work",
        instruction:
          "Keep the ball between the markers — tight 2-semitone zone.\nFeel the precision — small movements, steady control.\nBreathe whenever you need to.",
        introModal: modal.hill({
          seconds: 8,
          reps: 3,
          tips: exerciseTips("sustain", "advanced"),
          instruction:
            "A sustained tone within a narrow 2-semitone zone. Hold each tone for 8 seconds.\n\nFeel the precision. Notice how small adjustments keep you in the zone — tiny movements of breath and placement.\n\nNarrow-zone sustains build fine pitch control. Your voice learns to hold steady in a tight space.\n\nIt's okay to drift. Just notice and adjust. There's no wrong way to explore.",
        }),
      }),
      gen.scales.scaleDegrees({
        slug: "scale-degrees-both",
        title: "Scale degrees — full",
        headerSubtitle: "Ascending then descending",
        cardSubtitle: "Every interval from the root — up and back down",
        startNote: 1,
        endNote: 8,
        direction: "both",
        tempo: 45,
        minScore: 50,
        instruction:
          "All intervals ascending, then all intervals descending.\nThe full picture — every degree from both directions.\nListen and follow.",
        introModal: modal.melody({
          minScore: 50,
          tips: exerciseTips("melody", "advanced"),
          instruction:
            "The complete scale degree exercise — ascending intervals from root to octave, then descending intervals from octave to root.\n\nFeel the symmetry. Going up, each leap grows wider. Coming down, each drop reaches deeper. Together they cover every interval.\n\nThis is comprehensive interval training — the most complete exercise for melodic hearing.\n\nMatch 50% to continue. Take your time.",
        }),
      }),
      gen.scales.major({
        slug: "precise-melody",
        title: "Precise melody",
        headerSubtitle: "Major scale",
        cardSubtitle: "The major scale with sharper accuracy",
        tempo: 48,
        minScore: 60,
        instruction:
          "The major scale at a faster tempo.\nPrecision matters — aim for each note cleanly.\nListen first, then match.",
        introModal: modal.melody({
          minScore: 60,
          tips: exerciseTips("melody", "advanced"),
          instruction:
            "Match the major scale again — this time at a faster tempo with a higher accuracy target. The piano plays each note for you.\n\nFeel the difference. Faster means less time to find each note — your ear and voice need to work together more quickly.\n\nPrecision melody builds the speed and accuracy your voice needs for real musical phrases.\n\nMatch 60% to continue. You don't need to get this right.",
        }),
      }),
      {
        exerciseTypeId: "rhythm" as const,
        slug: "fast-rhythm",
        title: "Fast rhythm",
        headerSubtitle: "Tap along",
        cardSubtitle: "Eighth notes at speed — feel the pulse quicken",
        tempo: 120,
        pattern: [
          { type: "pause" as const, duration: NoteDuration.Quarter },
          { type: "pause" as const, duration: NoteDuration.Quarter },
          { type: "pause" as const, duration: NoteDuration.Quarter },
          { type: "pause" as const, duration: NoteDuration.Quarter },
          // Row 1
          { type: "tap" as const, duration: NoteDuration.Eighth },
          { type: "tap" as const, duration: NoteDuration.Eighth },
          { type: "tap" as const, duration: NoteDuration.Quarter },
          { type: "tap" as const, duration: NoteDuration.Quarter },
          { type: "pause" as const, duration: NoteDuration.Half },
          // Row 2
          { type: "tap" as const, duration: NoteDuration.Eighth },
          { type: "tap" as const, duration: NoteDuration.Eighth },
          { type: "tap" as const, duration: NoteDuration.Quarter },
          { type: "tap" as const, duration: NoteDuration.Quarter },
          { type: "pause" as const, duration: NoteDuration.Half },
          // Row 3
          { type: "tap" as const, duration: NoteDuration.Eighth },
          { type: "tap" as const, duration: NoteDuration.Eighth },
          { type: "tap" as const, duration: NoteDuration.Quarter },
          { type: "tap" as const, duration: NoteDuration.Quarter },
          { type: "pause" as const, duration: NoteDuration.Half },
          // Row 4
          { type: "tap" as const, duration: NoteDuration.Eighth },
          { type: "tap" as const, duration: NoteDuration.Eighth },
          { type: "tap" as const, duration: NoteDuration.Quarter },
          { type: "tap" as const, duration: NoteDuration.Quarter },
          { type: "pause" as const, duration: NoteDuration.Half },
        ],
        metronome: true,
        minScore: 70,
        instruction:
          "Tap along to the rhythm — eighth notes followed by quarters.\nFeel the pulse quicken with the shorter notes.\nStay with the metronome.",
        introModal: modal.rhythm({
          minScore: 70,
          tips: exerciseTips("melody", "advanced"),
          instruction:
            "Tap along to a fast rhythm pattern — pairs of eighth notes followed by quarter notes. The metronome keeps time.\n\nFeel the pulse quicken when the eighth notes arrive. Notice how your body locks into the faster subdivision.\n\nFast rhythm builds timing precision and teaches your body to feel subdivisions — essential for singing in time.\n\nMatch 70% to continue. It's okay to pause.",
        }),
      },
    ],
  },

  // ── Stage 4: Coming Together ────────────────────────────────────────────
  {
    id: "ch8-coming-together",
    title: "Coming Together",
    exercises: [
      gen.scales.major({
        slug: "final-melody",
        title: "Final melody",
        headerSubtitle: "Major scale",
        cardSubtitle: "Everything you've learned — one final melody",
        tempo: 55,
        minScore: 60,
        instruction:
          "The major scale one more time — everything comes together here.\nScales, vowels, breath, placement — it's all in this melody.\nListen first, then match.",
        introModal: modal.melody({
          minScore: 60,
          tips: exerciseTips("melody", "advanced"),
          instruction:
            "Match the full major scale one final time. The piano plays each note for you.\n\nFeel how far you've come. Scales, vowels, rhythm, breath — everything you've practised lives in this melody.\n\nThis is integration. Your voice knows more than you think — trust what your body has learned.\n\nMatch 60% to continue. Let it be easy.",
        }),
      }),
      gen.breathwork.farinelliVoiceDriven({
        slug: "farinelli-ch8",
        minCount: 4,
        maxCount: 11,
        title: "Farinelli breathwork",
        voiceBaseUrl: "breathwork-farinelli",
        introModal: modal.farinelli({
          title: "Farinelli breathwork",
          maxCount: 8,
          tips: exerciseTips("farinelli", "advanced"),
          instruction:
            "Inhale, hold, and exhale for the same count — each cycle adds one beat. The deepest breathing yet.\n\nNotice how your body responds as the rhythm lengthens. Feel everything settle.",
        }),
        completionModal: {
          title: "Chapter VI Complete",
          subtitle: "Integration",
          elements: [
            {
              type: "paragraph",
              text: "Everything came together. Scales, vowels, rhythm, breath — you've woven them into something whole. Your voice moves with more fluency and control than when you started.",
            },
            {
              type: "paragraph",
              text: "The journey continues. New challenges, new sounds, new ways to discover what your voice can do.",
              variant: "secondary",
            },
          ],
          confetti: true,
        },
      }),
    ],
  },
];
