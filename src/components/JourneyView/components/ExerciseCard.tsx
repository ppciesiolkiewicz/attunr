"use client";

import {
  getExerciseDisplayColors,
} from "../utils";
import { BookIcon } from "./BookIcon";
import type { JourneyExercise } from "@/constants/journey";

interface ExerciseCardProps {
  exercise: JourneyExercise;
  highestCompleted: number;
  onSelect: (id: number) => void;
}

export function ExerciseCard({
  exercise,
  highestCompleted,
  onSelect,
}: ExerciseCardProps) {
  const isComplete = exercise.id <= highestCompleted;
  const isCurrent = exercise.id === highestCompleted + 1;
  const isUnlocked = exercise.id <= highestCompleted + 1;

  const exerciseColors = getExerciseDisplayColors(exercise);
  const primaryColor = exerciseColors[0] ?? "#7c3aed";

  return (
    <button
      onClick={() => isUnlocked && onSelect(exercise.id)}
      disabled={!isUnlocked}
      className="cursor-pointer disabled:cursor-not-allowed w-full flex items-stretch rounded-xl border overflow-hidden text-left transition-all group"
      style={{
        borderColor: !isUnlocked
          ? "rgba(255,255,255,0.12)"
          : isCurrent
            ? `${primaryColor}50`
            : "rgba(255,255,255,0.08)",
        backgroundColor: isCurrent
          ? `${primaryColor}12`
          : "rgba(255,255,255,0.05)",
        opacity: !isUnlocked ? 0.58 : 1,
      }}
    >
      <div
        className="w-[3px] shrink-0"
        style={{
          background:
            exerciseColors.length === 1
              ? primaryColor
              : `linear-gradient(to bottom, ${exerciseColors.join(", ")})`,
          opacity: !isUnlocked ? 0.65 : 1,
        }}
      />

      <div className="flex-1 px-3.5 py-3 min-w-0">
        <div className="flex items-baseline justify-between gap-2 mb-1.5">
          <span
            className="text-base font-semibold flex items-center gap-1.5"
            style={{
              color: !isUnlocked
                ? "rgba(255,255,255,0.65)"
                : "rgba(255,255,255,0.95)",
            }}
          >
            {exercise.exerciseTypeId === "learn" && (
              <BookIcon
                className="shrink-0 opacity-70"
                style={{
                  color: isUnlocked
                    ? "rgba(255,255,255,0.6)"
                    : "rgba(255,255,255,0.45)",
                }}
              />
            )}
            {exercise.title}
          </span>
        </div>

        {(exercise.cardCue ?? exercise.subtitle) && (
          <p className="text-xs text-white/68">{exercise.cardCue ?? exercise.subtitle}</p>
        )}
      </div>

      <div className="flex items-center px-3.5">
        {isComplete ? (
          <span className="text-sm" style={{ color: primaryColor }}>
            ✓
          </span>
        ) : !isUnlocked ? (
          <span className="text-sm text-white/65">⋯</span>
        ) : (
          <span className="text-base text-white/52 group-hover:text-white/80 transition-colors">
            ›
          </span>
        )}
      </div>
    </button>
  );
}
