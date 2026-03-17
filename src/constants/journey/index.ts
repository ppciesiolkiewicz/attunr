import { Journey } from "./Journey";
import { CHAPTER_1_STAGES } from "./chapter1";
import { CHAPTER_2_WARMUP, CHAPTER_2_STAGES } from "./chapter2";

export const journey = new Journey([
  {
    chapter: 1,
    title: "Introduction",
    description: "Discover your voice, feel vibrations, match tones, and find your breath.",
    stages: CHAPTER_1_STAGES,
  },
  {
    chapter: 2,
    title: "Building Foundation",
    description: "Expand your range, build resonance, and develop vowel control.",
    warmup: CHAPTER_2_WARMUP,
    stages: CHAPTER_2_STAGES,
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
  LearnNotesConfig,
  PitchDetectionConfig,
  PitchDetectionSlideConfig,
  PitchDetectionHillConfig,
  FarinelliBreathworkConfig,
  ToneFollowConfig,
  ToneFollowShape,
  MelodyConfig,
  MelodyScale,
  MelodyEvent,
  DisplayNote,
  DisplayScale,
  VolumeDetectionConfig,
  RhythmConfig,
  RhythmEvent,
} from "./types";

export { NoteDuration, BandTargetKind } from "./types";
