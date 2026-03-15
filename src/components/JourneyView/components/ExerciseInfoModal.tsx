"use client";

import { useState, useEffect, useRef } from "react";
import { InfoIcon } from "@/components/TabInfoModal";
import { Button, CloseButton, Modal } from "@/components/ui";
import { ContentElements } from "@/components/Exercise/components/ContentElements";
import { JOURNEY_EXERCISES } from "@/constants/journey";
import {
  addSkippedInfoExerciseId,
  getExerciseDisplayColors,
  getStepInPart,
  toRoman,
} from "../utils";
import { BookIcon } from "./BookIcon";

interface ExerciseInfoModalProps {
  exerciseId: number;
  onStart: () => void;
  onDismiss: () => void;
  onAdvanceWithoutExercise?: () => void;
  showDontShowAgain?: boolean;
}

export function ExerciseInfoModal({
  exerciseId,
  onStart,
  onDismiss,
  onAdvanceWithoutExercise,
  showDontShowAgain,
}: ExerciseInfoModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const exercise = JOURNEY_EXERCISES.find((e) => e.id === exerciseId)!;
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
      if (showDontShowAgain && dontShowAgain) addSkippedInfoExerciseId(exerciseId);
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

  const hideBackdropOnClose = !showDontShowAgain;

  return (
    <Modal
      onBackdropClick={isClosing ? undefined : onDismiss}
      className={`transition-opacity duration-300 ease-out ${isClosing ? "pointer-events-none" : ""}`}
      style={{ opacity: isClosing && hideBackdropOnClose ? 0 : 1 }}
      panelClassName="transition-all duration-300 ease-out"
      panelStyle={{
        opacity: isClosing ? 0 : 1,
        transform: isClosing ? "scale(0.96)" : "scale(1)",
      }}
    >
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-white/[0.06] shrink-0">
          <div>
            <p className="text-xs text-white/55 mb-1 flex items-center gap-1.5">
              {isLearnExercise && <BookIcon className="opacity-70" />}
              <span className="uppercase tracking-widest">
                Part{" "}
                {toRoman(exercise.part)}
              </span>
              <span className="text-white/45">·</span>
              <span>
                {getStepInPart(exerciseId).stepIndex} of{" "}
                {getStepInPart(exerciseId).stepsInPart}
              </span>
            </p>
            <h2 className="text-xl font-semibold text-white">
              {modal?.title ?? exercise.title}
            </h2>
            {modal?.subtitle && (
              <p className="text-sm mt-1" style={{ color: primaryColor }}>
                {modal.subtitle}
              </p>
            )}
          </div>
          <CloseButton onClick={onDismiss} className="ml-4 mt-0.5 shrink-0" />
        </div>

        <div className="flex flex-col gap-4 px-5 py-5 overflow-y-auto flex-1 min-h-0">
          {modal && <ContentElements elements={modal.elements} />}
        </div>

        {showDontShowAgain && (
          <div className="px-5 py-2 flex flex-col gap-1 shrink-0 border-t border-white/[0.06]">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 rounded border-white/30 bg-white/5 text-violet-500 focus:ring-violet-500/50"
              />
              <span className="text-sm text-white/68">
                Don&apos;t show for this exercise again
              </span>
            </label>
            <p className="text-xs text-white/50 pl-6 flex items-center gap-1.5 flex-wrap">
              You can always bring it back by clicking the{" "}
              <InfoIcon size={12} className="inline-block opacity-70 shrink-0" />{" "}
              icon on the screen
            </p>
          </div>
        )}

        <div className="px-5 pb-5 pt-3 border-t border-white/[0.06] shrink-0">
          <Button size="lg" onClick={handleBegin} disabled={isClosing} className="w-full">
            {modal?.actionLabel ?? (isLearnExercise ? "Continue →" : "Begin exercise →")}
          </Button>
        </div>
    </Modal>
  );
}
