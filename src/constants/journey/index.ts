import { Journey } from "./Journey";
import { CHAPTER_1_STAGES } from "./chapter1";
import { CHAPTER_2_WARMUP, CHAPTER_2_STAGES } from "./chapter2";

export const journey = new Journey([
  { chapter: 1, title: "Introduction", stages: CHAPTER_1_STAGES },
  { chapter: 2, title: "Building Foundation", warmup: CHAPTER_2_WARMUP, stages: CHAPTER_2_STAGES },
]);

// Backwards-compatible exports — consumers will migrate to journey.* in Task 8
export const JOURNEY_CONFIG = journey.chapters;
export const JOURNEY_EXERCISES = journey.exercises;
export function getNextExerciseId(currentId: number) {
  return journey.getNextExerciseId(currentId);
}

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
