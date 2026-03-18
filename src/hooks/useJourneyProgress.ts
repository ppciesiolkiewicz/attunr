"use client";

import { useState, useCallback, useMemo } from "react";
import { JourneyProgress } from "@/lib/journey-progress";
import { journey } from "@/constants/journey";
import type { ExerciseConfig, StageConfig } from "@/constants/journey";

/**
 * Hook that wraps JourneyProgress for React components.
 * Provides slug-based completion checks and mutations with re-rendering.
 */
export function useJourneyProgress() {
  const [progress] = useState(() => new JourneyProgress());
  const [, setTick] = useState(0);
  const rerender = useCallback(() => setTick((t) => t + 1), []);

  const completeExercise = useCallback(
    (exercise: ExerciseConfig) => {
      progress.completeExercise(exercise.chapterSlug, exercise.stageId, exercise.slug);
      rerender();
    },
    [progress, rerender],
  );

  const isCompleted = useCallback(
    (exercise: ExerciseConfig) =>
      progress.isCompleted(exercise.chapterSlug, exercise.stageId, exercise.slug),
    [progress],
  );

  /** An exercise is unlocked if it's the very first, or the previous exercise is completed. */
  const isUnlocked = useCallback(
    (exercise: ExerciseConfig) => {
      const idx = journey.exercises.findIndex((e) => e.id === exercise.id);
      if (idx <= 0) return true; // first exercise is always unlocked
      const prev = journey.exercises[idx - 1];
      return progress.isCompleted(prev.chapterSlug, prev.stageId, prev.slug);
    },
    [progress],
  );

  /** Check if all exercises in a stage are completed. */
  const isStageCompleted = useCallback(
    (stage: StageConfig) =>
      stage.exercises.length > 0 &&
      stage.exercises.every((ex) =>
        progress.isCompleted(ex.chapterSlug, ex.stageId, ex.slug),
      ),
    [progress],
  );

  /** Check if all exercises in a chapter are completed. */
  const isChapterCompleted = useCallback(
    (chapterSlug: string) => {
      const chapter = journey.getChapterBySlug(chapterSlug);
      if (!chapter) return false;
      const allExercises = journey.getChapterExercises(chapter.chapter);
      return allExercises.length > 0 &&
        allExercises.every((ex) =>
          progress.isCompleted(ex.chapterSlug, ex.stageId, ex.slug),
        );
    },
    [progress],
  );

  /** Count completed exercises in a list. */
  const completedCount = useCallback(
    (exercises: ExerciseConfig[]) =>
      exercises.filter((ex) =>
        progress.isCompleted(ex.chapterSlug, ex.stageId, ex.slug),
      ).length,
    [progress],
  );

  /** Find the next uncompleted exercise in a list. */
  const findNextExercise = useCallback(
    (exercises: ExerciseConfig[]) =>
      exercises.find(
        (ex) => !progress.isCompleted(ex.chapterSlug, ex.stageId, ex.slug),
      ) ?? null,
    [progress],
  );

  /** Whether any exercise in the list is completed. */
  const isStarted = useCallback(
    (exercises: ExerciseConfig[]) =>
      exercises.some((ex) =>
        progress.isCompleted(ex.chapterSlug, ex.stageId, ex.slug),
      ),
    [progress],
  );

  /** Whether a chapter is locked (first exercise not unlocked). */
  const isChapterLocked = useCallback(
    (chapterNum: number) => {
      const exercises = journey.getChapterExercises(chapterNum);
      if (exercises.length === 0) return true;
      return !isUnlocked(exercises[0]);
    },
    [isUnlocked],
  );

  return useMemo(
    () => ({
      progress,
      completeExercise,
      isCompleted,
      isUnlocked,
      isStageCompleted,
      isChapterCompleted,
      isChapterLocked,
      completedCount,
      findNextExercise,
      isStarted,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [progress, completeExercise, isCompleted, isUnlocked, isStageCompleted, isChapterCompleted, isChapterLocked, completedCount, findNextExercise, isStarted],
  );
}

export type JourneyProgressHook = ReturnType<typeof useJourneyProgress>;
