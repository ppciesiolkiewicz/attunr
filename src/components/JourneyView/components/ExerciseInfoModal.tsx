"use client";

import { useState, useEffect, useRef } from "react";
import { Button, CloseButton, Modal, Text } from "@/components/ui";
import { ContentElements } from "@/components/Exercise/components/ContentElements";
import { journey } from "@/constants/journey";
import {
  getExerciseDisplayColors,
  getStepInStage,
} from "../utils";
import { BookIcon } from "./BookIcon";

interface ExerciseInfoModalProps {
  exerciseId: number;
  onStart: () => void;
  onDismiss: () => void;
  onAdvanceWithoutExercise?: () => void;
}

export function ExerciseInfoModal({
  exerciseId,
  onStart,
  onDismiss,
  onAdvanceWithoutExercise,
}: ExerciseInfoModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const exercise = journey.exercises.find((e) => e.id === exerciseId)!;
  const isLearnExercise = exercise.exerciseTypeId === "learn";
  const modal = exercise.introModal;

  const exerciseColors = getExerciseDisplayColors(exercise);
  const primaryColor = exerciseColors[0] ?? "#7c3aed";

  function handleBegin() {
    if (isClosing) return;
    setIsClosing(true);
  }

  const commitBeginRef = useRef<() => void>(() => {});
  useEffect(() => {
    commitBeginRef.current = () => {
      if (isLearnExercise && onAdvanceWithoutExercise)
        onAdvanceWithoutExercise();
      else onStart();
    };
  });

  useEffect(() => {
    if (!isClosing) return;
    const id = setTimeout(() => commitBeginRef.current(), 280);
    return () => clearTimeout(id);
  }, [isClosing]);

  return (
    <Modal
      onBackdropClick={isClosing ? undefined : onDismiss}
      className={`transition-opacity duration-300 ease-out ${isClosing ? "pointer-events-none" : ""}`}
      style={{ opacity: isClosing ? 0 : 1 }}
      panelClassName="transition-all duration-300 ease-out"
      panelStyle={{
        opacity: isClosing ? 0 : 1,
        transform: isClosing ? "scale(0.96)" : "scale(1)",
      }}
    >
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-white/[0.06] shrink-0">
          <div>
            <Text variant="caption" className="mb-1 flex items-center gap-1.5">
              {isLearnExercise && <BookIcon className="opacity-70" />}
              <Text as="span" variant="label" color="muted-1">
                Ch {exercise.chapter}
              </Text>
              <Text as="span" variant="caption" color="muted-1">·</Text>
              <Text as="span" variant="caption">
                {getStepInStage(exerciseId).stepIndex} of{" "}
                {getStepInStage(exerciseId).stepsInStage}
              </Text>
            </Text>
            <Text variant="heading">
              {modal?.title ?? exercise.title}
            </Text>
            {modal?.subtitle && (
              <Text variant="body-sm" className="mt-1" style={{ color: primaryColor }}>
                {modal.subtitle}
              </Text>
            )}
          </div>
          <CloseButton onClick={onDismiss} className="ml-4 mt-0.5 shrink-0" />
        </div>

        <div className="flex flex-col gap-4 px-5 py-5 overflow-y-auto flex-1 min-h-0">
          {modal && <ContentElements elements={modal.elements} />}
        </div>

        <div className="px-5 pb-5 pt-3 border-t border-white/[0.06] shrink-0">
          <Button size="lg" onClick={handleBegin} disabled={isClosing} className="w-full">
            {modal?.actionLabel ?? (isLearnExercise ? "Continue →" : "Begin exercise →")}
          </Button>
        </div>
    </Modal>
  );
}
