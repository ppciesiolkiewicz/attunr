import { Journey } from "./Journey";
import { CHAPTER_1_STAGES } from "./chapter1";
import { CHAPTER_2_WARMUP, CHAPTER_2_STAGES } from "./chapter2";
import { CHAPTER_3_WARMUP, CHAPTER_3_STAGES } from "./chapter3";
import { CHAPTER_4_WARMUP, CHAPTER_4_STAGES } from "./chapter4";
import { CHAPTER_5_STAGES } from "./chapter5";
import { CHAPTER_6_STAGES } from "./chapter6";
import { CHAPTER_7_WARMUP, CHAPTER_7_STAGES } from "./chapter7";
import { CHAPTER_8_WARMUP, CHAPTER_8_STAGES } from "./chapter8";
import { CHAPTER_9_WARMUP, CHAPTER_9_STAGES } from "./chapter9";

export const journey = new Journey([
  {
    chapter: 1,
    slug: "introduction",
    title: "Introduction",
    description: "Discover your voice, feel vibrations, match tones, and find your breath.",
    stages: CHAPTER_1_STAGES,
  },
  {
    chapter: 2,
    slug: "building-foundation",
    title: "Building Foundation",
    description: "Expand your range, build resonance, and develop vowel control.",
    warmup: CHAPTER_2_WARMUP,
    stages: CHAPTER_2_STAGES,
  },
  {
    chapter: 3,
    slug: "vowel-exploration",
    title: "Vowel Exploration",
    description: "Discover the Oo vowel, explore transitions, and widen your intervals.",
    warmup: CHAPTER_3_WARMUP,
    stages: CHAPTER_3_STAGES,
  },
  {
    chapter: 4,
    slug: "range-and-projection",
    title: "Range & Projection",
    description: "Open the Ah vowel, reach octave intervals, and build vocal power.",
    warmup: CHAPTER_4_WARMUP,
    stages: CHAPTER_4_STAGES,
  },
  {
    chapter: 5,
    slug: "breathe-deep",
    title: "Breathe Deep",
    description: "Pure breathwork. No singing. Just breath, body, and stillness.",
    secret: true,
    stages: CHAPTER_5_STAGES,
  },
  {
    chapter: 6,
    slug: "rhythm-deep-dive",
    title: "Rhythm Deep Dive",
    description: "Complex rhythms, syncopation, and groove. Feel the pulse.",
    secret: true,
    stages: CHAPTER_6_STAGES,
  },
  {
    chapter: 7,
    slug: "forward-placement",
    title: "Forward Placement",
    description: "The Ee vowel, vowel sequences, and pentatonic melodies.",
    warmup: CHAPTER_7_WARMUP,
    stages: CHAPTER_7_STAGES,
  },
  {
    chapter: 8,
    slug: "integration",
    title: "Integration",
    description: "All techniques together. Full scales, longer phrases, higher precision.",
    warmup: CHAPTER_8_WARMUP,
    stages: CHAPTER_8_STAGES,
  },
  {
    chapter: 9,
    slug: "chakras",
    title: "Chakras",
    description: "Seven tones. Seven places in your body. Mantras, affirmations, and the chakra scale.",
    secret: true,
    warmup: CHAPTER_9_WARMUP,
    stages: CHAPTER_9_STAGES,
  },
]);

// Re-export types
export type {
  ExerciseConfig,
  ExerciseConfigInput,
  Chapter,
  ChapterInput,
  StageConfig,
  StageConfigInput,
  ExerciseTypeId,
  ModalConfig,
  VoiceConfig,
  ContentElement,
  WarningElement,
  ParagraphElement,
  VideoElement,
  HeadphonesNoticeElement,
  TipListElement,
  SeparatorElement,
  NoteTarget,
  BaseScale,
  ChromaticDegree,
  SustainNoteConfig,
  SlideConfig,
  BaseExerciseConfig,
  LearnConfig,
  LearnVoiceDrivenConfig,
  LearnVoiceSegment,
  LearnNotesConfig,
  PitchDetectionConfig,
  PitchDetectionSlideConfig,
  PitchDetectionHillConfig,
  FarinelliBreathworkConfig,
  FarinelliVoiceDrivenConfig,
  ToneFollowConfig,
  ToneFollowShape,
  MelodyConfig,
  MelodyScale,
  MelodyEvent,
  DisplayNote,
  DisplayScale,
  TimedCue,
  VolumeDetectionConfig,
  TimeBasedConfig,
  RhythmConfig,
  RhythmEvent,
  WalkthroughConfig,
} from "./types";

export { NoteDuration, BandTargetKind } from "./types";

// Re-export resolved exercise types (used by Exercise components)
export type {
  Exercise,
  PitchTarget,
  PitchDetectionExercise,
  PitchDetectionSlideExercise,
  PitchDetectionHillExercise,
  ToneFollowExercise,
  TimelineEntry,
  MelodyExercise,
  Beat,
  RhythmExercise,
} from "./exercise-resolver";
