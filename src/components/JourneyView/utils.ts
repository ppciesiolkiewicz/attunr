import {
  JOURNEY_EXERCISES,
} from "@/constants/journey";
import type { JourneyExercise } from "@/constants/journey";
import { NOTE_PALETTE } from "@/constants/tone-slots";

/** Get display colors for an exercise (for ExerciseCard color strip). */
export function getExerciseDisplayColors(exercise: JourneyExercise): string[] {
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

export function getStepInPart(exerciseId: number): {
  stepIndex: number;
  stepsInPart: number;
} {
  const exercise = JOURNEY_EXERCISES.find((e) => e.id === exerciseId);
  if (!exercise) return { stepIndex: 1, stepsInPart: 1 };
  const partExercises = JOURNEY_EXERCISES.filter((e) => e.part === exercise.part);
  const stepIndex = partExercises.findIndex((e) => e.id === exerciseId) + 1;
  return { stepIndex, stepsInPart: partExercises.length };
}

/** Convert an integer (1–20+) to a Roman numeral string. */
export function toRoman(n: number): string {
  const vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const syms = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"];
  let result = "";
  for (let i = 0; i < vals.length; i++) {
    while (n >= vals[i]) {
      result += syms[i];
      n -= vals[i];
    }
  }
  return result;
}
