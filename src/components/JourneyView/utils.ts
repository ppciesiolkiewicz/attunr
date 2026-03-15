import {
  JOURNEY_STAGES,
  LAST_STAGE_ID_PER_PART,
} from "@/constants/journey";
import type { JourneyStage, BandTarget } from "@/constants/journey";
import type { SlotId, Band } from "@/constants/tone-slots";
import { SLOTS, SLOT_ORDER } from "@/constants/tone-slots";

/** Resolve a BandTarget to concrete Band(s) from the user's vocal scale. */
export function resolveBandTarget(
  target: BandTarget,
  allBands: Band[],
): Band[] {
  const n = allBands.length;
  if (n === 0) return [];

  if (target.kind === "slot") {
    const slotId = SLOT_ORDER[target.n - 1];
    const band = allBands.find(
      (b) => b.isSlot && b.slotId === slotId,
    );
    return band ? [band] : [];
  }

  if (target.kind === "index") {
    const i = target.i < 0 ? n + target.i : target.i;
    return i >= 0 && i < n ? [allBands[i]] : [];
  }

  if (target.kind === "range") {
    const from = target.from < 0 ? n + target.from : target.from;
    const to = target.to < 0 ? n + target.to : target.to;
    const lo = Math.max(0, Math.min(from, to));
    const hi = Math.min(n - 1, Math.max(from, to));
    return allBands.slice(lo, hi + 1);
  }

  return [];
}

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

/** Get display colors for a stage (for StageCard color strip). */
export function getStageDisplayColors(stage: JourneyStage): string[] {
  if (stage.stageTypeId === "pitch-detection") {
    const colors: string[] = [];
    for (const nc of stage.notes) {
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
  if (stage.stageTypeId === "pitch-detection-slide") return SLOT_COLORS;
  return SLOT_COLORS;
}

/** Get the slot for a single-slot stage. */
export function getStageSlot(stage: JourneyStage) {
  if (stage.stageTypeId !== "pitch-detection") return null;
  if (stage.notes.length !== 1) return null;
  const t = stage.notes[0].target;
  if (t.kind !== "slot") return null;
  return SLOTS.find((s) => s.id === SLOT_ORDER[t.n - 1]) ?? null;
}

/** Extract SlotId[] from slot targets. */
export function getStageSlotIds(stage: JourneyStage): SlotId[] {
  if (stage.stageTypeId === "pitch-detection") {
    const ids: SlotId[] = [];
    for (const n of stage.notes) {
      if (n.target.kind === "slot") {
        ids.push(SLOT_ORDER[n.target.n - 1]);
      }
    }
    return ids;
  }
  return [];
}

const JOURNEY_EXERCISE_INFO_SKIP_KEY = "attunr.journeyExerciseInfoSkipped";

export function getSkippedInfoStageIds(): Set<number> {
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

export function addSkippedInfoStageId(stageId: number) {
  try {
    const ids = getSkippedInfoStageIds();
    ids.add(stageId);
    localStorage.setItem(
      JOURNEY_EXERCISE_INFO_SKIP_KEY,
      JSON.stringify([...ids]),
    );
  } catch {
    /* ignore */
  }
}

export function getStepInPart(stageId: number): {
  stepIndex: number;
  stepsInPart: number;
} {
  const stage = JOURNEY_STAGES.find((s) => s.id === stageId);
  if (!stage) return { stepIndex: 1, stepsInPart: 1 };
  const partStages = JOURNEY_STAGES.filter((s) => s.part === stage.part);
  const stepIndex = partStages.findIndex((s) => s.id === stageId) + 1;
  return { stepIndex, stepsInPart: partStages.length };
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

export { LAST_STAGE_ID_PER_PART };
