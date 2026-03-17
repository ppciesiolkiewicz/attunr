"use client";

import { useMemo } from "react";
import type { ExerciseConfig } from "@/constants/journey";
import type { ColoredNote, VocalRange } from "@/lib/VocalRange";
import { resolveExercise } from "@/lib/resolve-exercise";
import type { PitchDetectionExercise, PitchDetectionSlideExercise, ToneFollowExercise as ToneFollowExerciseType, MelodyExercise as MelodyExerciseType, RhythmExercise as RhythmExerciseType } from "@/lib/resolve-exercise";
import { LearnExercise } from "./LearnExercise";
import { LearnNotesExercise } from "./LearnNotesExercise";
import { FarinelliBreathworkExerciseContent } from "./FarinelliBreathworkExercise";
import { VolumeDetectionExerciseContent } from "./VolumeDetectionExercise";
import { PitchExercise } from "./PitchExercise";
import { ToneFollowExercise } from "./ToneFollowExercise";
import { MelodyExercise } from "./MelodyExercise";
import { RhythmExercise } from "./RhythmExercise";

interface BaseExerciseProps {
  exercise: ExerciseConfig;
  exerciseId: number;
  partTitle: string;
  partRoman: string;
  stepIndex: number;
  stepsInPart: number;
  isLast: boolean;
  vocalRange: VocalRange;
  pitchHz: number | null;
  pitchHzRef: React.RefObject<number | null>;
  isAlreadyCompleted: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onPrev?: () => void;
  onPlayTone: (band: ColoredNote) => void;
  onPlaySlide?: (fromBand: ColoredNote, toBand: ColoredNote) => void;
}

/**
 * Dispatcher: renders the right content component based on exerciseTypeId.
 *
 * Each content component is self-contained — owns its own progress tracking,
 * canvas/overlays, and bottom panel controls. The parent shell (JourneyExercise)
 * handles navigation callbacks and modals.
 */
export function BaseExercise({
  exercise,
  exerciseId,
  partTitle,
  partRoman,
  stepIndex,
  stepsInPart,
  isLast,
  vocalRange,
  pitchHz,
  pitchHzRef,
  isAlreadyCompleted,
  onComplete,
  onSkip,
  onPrev,
  onPlayTone,
  onPlaySlide,
}: BaseExerciseProps) {
  const resolved = useMemo(() => {
    if (
      exercise.exerciseTypeId === "learn" ||
      exercise.exerciseTypeId === "learn-notes-1" ||
      exercise.exerciseTypeId === "breathwork-farinelli" ||
      exercise.exerciseTypeId === "volume-detection"
    ) {
      return null;
    }
    return resolveExercise(exercise, vocalRange);
  }, [exercise, vocalRange]);

  switch (exercise.exerciseTypeId) {
    case "learn":
      return (
        <LearnExercise
          exercise={exercise}
          exerciseId={exerciseId}
          partTitle={partTitle}
          partRoman={partRoman}
          stepIndex={stepIndex}
          stepsInPart={stepsInPart}
          isLast={isLast}
          onComplete={onComplete}
          onPrev={onPrev}
        />
      );

    case "learn-notes-1":
      return (
        <LearnNotesExercise
          exerciseId={exerciseId}
          isLast={isLast}
          vocalRange={vocalRange}
          onComplete={onComplete}
          onPrev={onPrev}
        />
      );

    case "breathwork-farinelli":
      return (
        <FarinelliBreathworkExerciseContent
          exercise={exercise}
          exerciseId={exerciseId}
          isLast={isLast}
          isAlreadyCompleted={isAlreadyCompleted}
          onComplete={onComplete}
          onSkip={onSkip}
          onPrev={onPrev}
        />
      );

    case "tone-follow":
      return (
        <ToneFollowExercise
          exercise={exercise}
          exerciseId={exerciseId}
          isLast={isLast}
          resolved={resolved as ToneFollowExerciseType}
          isAlreadyCompleted={isAlreadyCompleted}
          onComplete={onComplete}
          onSkip={onSkip}
          onPrev={onPrev}
          onPlayTone={onPlayTone}
          onPlaySlide={onPlaySlide}
        />
      );

    case "melody":
      return (
        <MelodyExercise
          exercise={exercise}
          exerciseId={exerciseId}
          isLast={isLast}
          resolved={resolved as MelodyExerciseType}
          pitchHzRef={pitchHzRef}
          isAlreadyCompleted={isAlreadyCompleted}
          onComplete={onComplete}
          onSkip={onSkip}
          onPrev={onPrev}
        />
      );

    case "volume-detection":
      return (
        <VolumeDetectionExerciseContent
          exercise={exercise}
          exerciseId={exerciseId}
          isLast={isLast}
          isAlreadyCompleted={isAlreadyCompleted}
          onComplete={onComplete}
          onSkip={onSkip}
          onPrev={onPrev}
        />
      );

    case "rhythm":
      return (
        <RhythmExercise
          exercise={exercise}
          exerciseId={exerciseId}
          isLast={isLast}
          resolved={resolved as RhythmExerciseType}
          isAlreadyCompleted={isAlreadyCompleted}
          onComplete={onComplete}
          onSkip={onSkip}
          onPrev={onPrev}
        />
      );

    case "pitch-detection":
    case "pitch-detection-slide":
      return (
        <PitchExercise
          exercise={exercise}
          exerciseId={exerciseId}
          isLast={isLast}
          resolved={resolved as PitchDetectionExercise | PitchDetectionSlideExercise}
          pitchHz={pitchHz}
          pitchHzRef={pitchHzRef}
          isAlreadyCompleted={isAlreadyCompleted}
          onComplete={onComplete}
          onSkip={onSkip}
          onPrev={onPrev}
          onPlayTone={onPlayTone}
          onPlaySlide={onPlaySlide}
        />
      );
  }
}
