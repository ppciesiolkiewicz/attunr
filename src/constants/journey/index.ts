import type { JourneyExercise, JourneyPart, ModalConfig, ContentElement } from "./types";
import { FARINELLI_TIPS } from "@/constants/farinelli-tips";
import { PART_1_EXERCISES } from "./part1";
import { PART_2_EXERCISES } from "./part2";
import { PART_3_EXERCISES } from "./part3";
import { PART_4_EXERCISES } from "./part4";
import { PART_5_EXERCISES } from "./part5";
import { PART_6_EXERCISES } from "./part6";
import { PART_7_EXERCISES } from "./part7";
import { PART_8_EXERCISES } from "./part8";
import { PART_9_EXERCISES } from "./part9";
import { PART_10_EXERCISES } from "./part10";
// import { PART_11_EXERCISES } from "./part11"; // Chakra exercises — temporarily removed
// import { PART_12_EXERCISES } from "./part12"; // Chakra exercises — temporarily removed
import { PART_13_EXERCISES } from "./part13";
import { PART_14_EXERCISES } from "./part14";
import { PART_15_EXERCISES } from "./part15";
import { PART_16_EXERCISES } from "./part16";
import { PART_17_EXERCISES } from "./part17";
import { PART_18_EXERCISES } from "./part18";
import { PART_19_EXERCISES } from "./part19";
import { PART_20_EXERCISES } from "./part20";

export type {
  JourneyExercise,
  JourneyPart,
  ExerciseTypeId,
  ModalConfig,
  ContentElement,
  WarningElement,
  ParagraphElement,
  VideoElement,
  HeadphonesNoticeElement,
  TipListElement,
  SeparatorElement,
  TechniqueId,
  BandTarget,
  SustainNoteConfig,
  SlideConfig,
  BaseExerciseConfig,
  LearnExercise,
  PitchDetectionExercise,
  PitchDetectionSlideExercise,
  FarinelliBreathworkExercise,
} from "./types";

/** Build introModal for a non-learn exercise from its existing properties. */
function buildIntroModal(exercise: JourneyExercise): ModalConfig | undefined {
  if (exercise.exerciseTypeId === "learn") return undefined;
  if (exercise.introModal) return exercise.introModal;

  const elements: ContentElement[] = [];

  if (exercise.exerciseTypeId === "breathwork-farinelli") {
    elements.push({
      type: "warning",
      text: "If you have heart or respiratory conditions, or are pregnant, check with your doctor first. Stop immediately if you feel dizzy, lightheaded, or unwell at any time.",
    });
    elements.push({ type: "separator" });
    const firstParagraph = exercise.instruction.split("\n\n")[0];
    elements.push({ type: "paragraph", text: firstParagraph });
    elements.push({ type: "video" });
    elements.push({
      type: "tip-list",
      title: "Key tips",
      tips: [...FARINELLI_TIPS],
    });
    return {
      title: exercise.title,
      subtitle: `Complete ${exercise.maxCount} cycles — each a bit longer than the last`,
      elements,
    };
  }

  // Pitch exercises — instruction paragraphs
  for (const line of exercise.instruction.split("\n")) {
    if (line.trim()) {
      elements.push({
        type: "paragraph",
        text: line,
        variant: elements.length === 0 ? undefined : "secondary",
      });
    }
  }

  // Lip-roll notice
  if (exercise.technique === "lip-rolls") {
    elements.push({
      type: "paragraph",
      text: "Lip rolls are tricky for microphone detection — don\u2019t worry if progress is slow. Feel free to skip when you feel you\u2019ve got it.",
      variant: "secondary",
    });
  }

  elements.push({ type: "headphones-notice" });

  // Compute subtitle from exercise shape
  let subtitle: string;
  if (exercise.exerciseTypeId === "pitch-detection-slide") {
    subtitle = "Slide smoothly through the range two or three times";
  } else if (exercise.notes.length > 1) {
    subtitle = `Sing each tone in sequence, ${exercise.notes[0]?.seconds ?? 0} seconds each`;
  } else {
    subtitle = `Hold the tone in tune for ${exercise.notes[0]?.seconds ?? 0} seconds`;
  }

  return { title: exercise.title, subtitle, elements };
}

/** Walk all exercises and generate introModal for non-learn exercises. */
function withIntroModals(config: JourneyPart[]): JourneyPart[] {
  return config.map((part) => ({
    ...part,
    exercises: part.exercises.map((ex) => {
      const introModal = buildIntroModal(ex);
      return introModal ? { ...ex, introModal } : ex;
    }),
  }));
}

export const JOURNEY_CONFIG: JourneyPart[] = withIntroModals([
  { part: 1, title: "Introduction", exercises: PART_1_EXERCISES },
  { part: 2, title: "First Sounds", exercises: PART_2_EXERCISES },
  { part: 3, title: "Lip Rolls & Breath", exercises: PART_3_EXERCISES },
  { part: 4, title: "Low Resonance", exercises: PART_4_EXERCISES },
  { part: 5, title: "Building Range", exercises: PART_5_EXERCISES },
  { part: 6, title: "Rounded Vowels", exercises: PART_6_EXERCISES },
  { part: 7, title: "Vowel Warmth", exercises: PART_7_EXERCISES },
  { part: 8, title: "The Open AH", exercises: PART_8_EXERCISES },
  { part: 9, title: "Breath & Body", exercises: PART_9_EXERCISES },
  { part: 10, title: "Sequences & Range", exercises: PART_10_EXERCISES },
  // { part: 11, title: "Chakras — Earth", exercises: PART_11_EXERCISES }, // Temporarily removed
  // { part: 12, title: "Chakras — Sky", exercises: PART_12_EXERCISES },   // Temporarily removed
  { part: 13, title: "Forward EH", exercises: PART_13_EXERCISES },
  { part: 14, title: "EH Mastery", exercises: PART_14_EXERCISES },
  { part: 15, title: "Warmup III", exercises: PART_15_EXERCISES },
  { part: 16, title: "Vowel EE", exercises: PART_16_EXERCISES },
  { part: 17, title: "EE & Brightness", exercises: PART_17_EXERCISES },
  { part: 18, title: "Vowel Flow", exercises: PART_18_EXERCISES },
  { part: 19, title: "Vowel Mastery", exercises: PART_19_EXERCISES },
  { part: 20, title: "Vocal Control", exercises: PART_20_EXERCISES },
]);

/** Flat list of all exercises across all parts. */
export const JOURNEY_EXERCISES: JourneyExercise[] =
  JOURNEY_CONFIG.flatMap((p) => p.exercises);

/** Find the next available exercise after the given ID (handles gaps from removed parts). */
export function getNextExerciseId(currentId: number): number | null {
  const idx = JOURNEY_EXERCISES.findIndex((e) => e.id === currentId);
  if (idx < 0 || idx >= JOURNEY_EXERCISES.length - 1) return null;
  return JOURNEY_EXERCISES[idx + 1].id;
}
