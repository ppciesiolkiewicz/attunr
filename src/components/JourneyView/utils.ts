import {
  JOURNEY_EXERCISES,
} from "@/constants/journey";
import type { JourneyExercise } from "@/constants/journey";
import type { SlotId } from "@/constants/tone-slots";
import { SLOTS, SLOT_ORDER } from "@/constants/tone-slots";

const SLOT_COLORS = SLOT_ORDER.map(
  (id) => SLOTS.find((s) => s.id === id)!.color,
);

function rangeToColors(from: number, to: number): string[] {
  const N = 14;
  const lo = Math.min(
    from < 0 ? N + from : from,
    to < 0 ? N + to : to,
  );
  const hi = Math.max(
    from < 0 ? N + from : from,
    to < 0 ? N + to : to,
  );
  const fromSlot = Math.max(0, Math.floor((lo / (N - 1)) * 6));
  const toSlot = Math.min(6, Math.ceil((hi / (N - 1)) * 6));
  return SLOT_COLORS.slice(fromSlot, toSlot + 1);
}

/** Get display colors for an exercise (for ExerciseCard color strip). */
export function getExerciseDisplayColors(exercise: JourneyExercise): string[] {
  if (exercise.exerciseTypeId === "pitch-detection") {
    const colors: string[] = [];
    for (const nc of exercise.notes) {
      const t = nc.target;
      if (t.kind === "slot") {
        const slot = SLOTS.find(
          (s) => s.id === SLOT_ORDER[t.n - 1],
        );
        if (slot) colors.push(slot.color);
      } else if (t.kind === "range") {
        colors.push(...rangeToColors(t.from, t.to));
      }
    }
    if (colors.length > 0) return colors;
    return SLOT_COLORS;
  }
  if (exercise.exerciseTypeId === "pitch-detection-slide") return SLOT_COLORS;
  return SLOT_COLORS;
}

/** Get the slot for a single-slot exercise. */
export function getExerciseSlot(exercise: JourneyExercise) {
  if (exercise.exerciseTypeId !== "pitch-detection") return null;
  if (exercise.notes.length !== 1) return null;
  const t = exercise.notes[0].target;
  if (t.kind !== "slot") return null;
  return SLOTS.find((s) => s.id === SLOT_ORDER[t.n - 1]) ?? null;
}

/** Extract SlotId[] from slot targets. */
export function getExerciseSlotIds(exercise: JourneyExercise): SlotId[] {
  if (exercise.exerciseTypeId === "pitch-detection") {
    const ids: SlotId[] = [];
    for (const n of exercise.notes) {
      if (n.target.kind === "slot") {
        ids.push(SLOT_ORDER[n.target.n - 1]);
      }
    }
    return ids;
  }
  return [];
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
