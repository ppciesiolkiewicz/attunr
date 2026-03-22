"use client";

import {
  getExerciseDisplayColors,
} from "../utils";
import { Text } from "@/components/ui";
import { BookIcon } from "./BookIcon";
import type { ExerciseConfig } from "@/constants/journey";
import type { JourneyProgressHook } from "@/hooks/useJourneyProgress";

interface ExerciseCardProps {
  exercise: ExerciseConfig;
  jp: JourneyProgressHook;
  onSelect: (exercise: ExerciseConfig) => void;
}

export function ExerciseCard({
  exercise,
  jp,
  onSelect,
}: ExerciseCardProps) {
  const isComplete = jp.isCompleted(exercise);
  const isCurrent = jp.isUnlocked(exercise) && !isComplete;
  const isUnlocked = jp.isUnlocked(exercise);

  const exerciseColors = getExerciseDisplayColors(exercise);
  const primaryColor = exerciseColors[0] ?? "#7c3aed";

  return (
    <button
      onClick={() => isUnlocked && onSelect(exercise)}
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
          <Text
            variant="body"
            as="span"
            className="font-semibold flex items-center gap-1.5"
            style={{
              color: !isUnlocked
                ? "rgba(255,255,255,0.65)"
                : "rgba(255,255,255,0.95)",
            }}
          >
            {(exercise.exerciseTypeId === "learn" || exercise.exerciseTypeId === "learn-notes-1" || exercise.exerciseTypeId === "learn-voice-driven") && (
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
          </Text>
        </div>

        {(exercise.cardSubtitle ?? exercise.headerSubtitle) && (
          <Text variant="caption" color="text-2">{exercise.cardSubtitle ?? exercise.headerSubtitle}</Text>
        )}
      </div>

      <div className="flex items-center px-3.5">
        {isComplete ? (
          <Text variant="body-sm" as="span" style={{ color: primaryColor }}>
            ✓
          </Text>
        ) : !isUnlocked ? (
          <Text variant="body-sm" as="span" color="text-2">⋯</Text>
        ) : (
          <Text variant="body" as="span" color="muted-1" className="group-hover:text-white/80 transition-colors">
            ›
          </Text>
        )}
      </div>
    </button>
  );
}
