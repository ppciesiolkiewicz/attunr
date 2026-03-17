import {
  JOURNEY_EXERCISES,
} from "@/constants/journey";
import type { ExerciseConfig } from "@/constants/journey";
import { NOTE_PALETTE } from "@/lib/VocalRange";

/** Get display colors for an exercise (for ExerciseCard color strip). */
export function getExerciseDisplayColors(exercise: ExerciseConfig): string[] {
  return NOTE_PALETTE.map((p) => p.color);
}

const JOURNEY_EXERCISE_INFO_SKIP_KEY = "attunr.journeyExerciseInfoSkipped";

export function getSkippedInfoExerciseIds(): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(JOURNEY_EXERCISE_INFO_SKIP_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    return new Set(
      Array.isArray(parsed)
        ? parsed.filter((n): n is number => typeof n === "number")
        : [],
    );
  } catch {
    return new Set();
  }
}

export function addSkippedInfoExerciseId(exerciseId: number) {
  try {
    const ids = getSkippedInfoExerciseIds();
    ids.add(exerciseId);
    localStorage.setItem(
      JOURNEY_EXERCISE_INFO_SKIP_KEY,
      JSON.stringify([...ids]),
    );
  } catch {
    /* ignore */
  }
}

export function getStepInStage(exerciseId: number): {
  stepIndex: number;
  stepsInStage: number;
} {
  const exercise = JOURNEY_EXERCISES.find((e) => e.id === exerciseId);
  if (!exercise) return { stepIndex: 1, stepsInStage: 1 };
  const stageExercises = JOURNEY_EXERCISES.filter((e) => e.stageId === exercise.stageId);
  const stepIndex = stageExercises.findIndex((e) => e.id === exerciseId) + 1;
  return { stepIndex, stepsInStage: stageExercises.length };
}
