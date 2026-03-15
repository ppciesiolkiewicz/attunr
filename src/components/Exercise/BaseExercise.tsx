"use client";

import type { JourneyExercise } from "@/constants/journey";
import type { Band } from "@/constants/tone-slots";
import { LearnExercise } from "./LearnExercise";
import { LearnNotesExercise } from "./LearnNotesExercise";
import { FarinelliBreathworkExerciseContent } from "./FarinelliBreathworkExercise";
import { PitchExercise } from "./PitchExercise";
import { ToneFollowExercise } from "./ToneFollowExercise";

interface BaseExerciseProps {
  exercise: JourneyExercise;
  exerciseId: number;
  partTitle: string;
  partRoman: string;
  stepIndex: number;
  stepsInPart: number;
  isLast: boolean;
  allBands: Band[];
  pitchHz: number | null;
  pitchHzRef: React.RefObject<number | null>;
  isAlreadyCompleted: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onPrev?: () => void;
  onPlayTone: (band: Band) => void;
  onPlaySlide?: (fromBand: Band, toBand: Band) => void;
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
  allBands,
  pitchHz,
  pitchHzRef,
  isAlreadyCompleted,
  onComplete,
  onSkip,
  onPrev,
  onPlayTone,
  onPlaySlide,
}: BaseExerciseProps) {
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
          allBands={allBands}
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
          allBands={allBands}
          isAlreadyCompleted={isAlreadyCompleted}
          onComplete={onComplete}
          onSkip={onSkip}
          onPrev={onPrev}
          onPlayTone={onPlayTone}
          onPlaySlide={onPlaySlide}
        />
      );

    case "pitch-detection":
    case "pitch-detection-slide":
      return (
        <PitchExercise
          exercise={exercise}
          exerciseId={exerciseId}
          isLast={isLast}
          allBands={allBands}
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
