import { journey } from "@/constants/journey";
import type { ExerciseConfig } from "@/constants/journey";
import { NOTE_PALETTE } from "@/lib/VocalRange";

/** Get display colors for an exercise (for ExerciseCard color strip). */
export function getExerciseDisplayColors(exercise: ExerciseConfig): string[] {
  return NOTE_PALETTE.map((p) => p.color);
}


export function getStepInStage(exerciseId: number): {
  stepIndex: number;
  stepsInStage: number;
} {
  const exercise = journey.exercises.find((e) => e.id === exerciseId);
  if (!exercise) return { stepIndex: 1, stepsInStage: 1 };
  const stageExercises = journey.exercises.filter((e) => e.stageId === exercise.stageId);
  const stepIndex = stageExercises.findIndex((e) => e.id === exerciseId) + 1;
  return { stepIndex, stepsInStage: stageExercises.length };
}
