"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { InfoButton } from "../../TabInfoModal";
import { Button, Text } from "@/components/ui";
import { getSkippedInfoExerciseIds, getStepInPart, toRoman } from "../utils";
import { ExerciseInfoModal } from "./ExerciseInfoModal";
import { BaseExercise } from "@/components/Exercise";
import { PartCompleteModal } from "./PartCompleteModal";
import { JOURNEY_EXERCISES, JOURNEY_CONFIG, getNextExerciseId } from "@/constants/journey";
import { analytics } from "@/lib/analytics";
import { getScaleNotesForRange } from "@/lib/vocal-scale";
import { useApp } from "@/context/AppContext";
import type { Band } from "@/constants/tone-slots";
import type { ModalConfig } from "@/constants/journey/types";
import type { Settings } from "@/hooks/useSettings";

export function JourneyExercise({
  exerciseId,
  settings,
  pitchHz,
  pitchHzRef,
  onPlayTone,
  onPlaySlide,
  onSettingsUpdate,
  onBack,
  onNext,
  onPrev,
}: {
  exerciseId: number;
  settings: Settings;
  pitchHz: number | null;
  pitchHzRef: React.RefObject<number | null>;
  onPlayTone: (band: Band) => void;
  onPlaySlide?: (fromBand: Band, toBand: Band) => void;
  onSettingsUpdate: <K extends keyof Settings>(
    key: K,
    value: Settings[K],
  ) => void;
  onBack: () => void;
  onNext: (nextExerciseId: number) => void;
  onPrev?: (prevExerciseId: number) => void;
}) {
  const router = useRouter();
  const { triggerNotificationPrompt } = useApp();
  const highestCompleted = settings.journeyStage;
  const exercise = JOURNEY_EXERCISES.find((e) => e.id === exerciseId)!;
  const isCompleted = exerciseId <= highestCompleted;
  const partTitle = JOURNEY_CONFIG.find((p) => p.part === exercise.part)?.title ?? "";

  const allBands = useMemo(
    () => getScaleNotesForRange(
      settings.vocalRangeLowHz > 0 ? settings.vocalRangeLowHz : 131,
      settings.vocalRangeHighHz > 0 ? settings.vocalRangeHighHz : 523,
      settings.tuning,
    ),
    [settings.vocalRangeLowHz, settings.vocalRangeHighHz, settings.tuning],
  );

  const isLearnType = exercise.exerciseTypeId === "learn" || exercise.exerciseTypeId === "learn-notes-1";
  const shouldAutoShowInfo = () => {
    if (isLearnType) return false;
    if (exercise.exerciseTypeId === "breathwork-farinelli") return true;
    return !getSkippedInfoExerciseIds().has(exerciseId);
  };
  const [showInfoModal, setShowInfoModal] = useState(shouldAutoShowInfo);

  // Trigger notification prompt when info modal is shown for flagged exercises
  useEffect(() => {
    if (showInfoModal && exercise.showNotificationPrompt) triggerNotificationPrompt();
  }, [showInfoModal, exercise.showNotificationPrompt, triggerNotificationPrompt]);

  const [partCompleteData, setPartCompleteData] = useState<{
    part: number;
    partName: string;
    modalConfig: ModalConfig;
  } | null>(null);

  // Prefetch next page when part-complete modal is showing
  useEffect(() => {
    if (partCompleteData !== null) {
      const nextId = getNextExerciseId(exerciseId);
      if (nextId !== null) router.prefetch(`/journey/${nextId}`);
      else router.prefetch("/");
    }
  }, [partCompleteData, exerciseId, router]);

  useEffect(() => {
    analytics.journeyExerciseStarted(exerciseId, exercise.part, partTitle);
  }, [exerciseId, exercise.part, partTitle]);

  // ── Navigation ─────────────────────────────────────────────────────────

  function navigateTo(targetId: number) {
    if (targetId < 1) return;
    onNext(targetId);
  }

  function goToNextExercise(markComplete: boolean) {
    if (markComplete) {
      onSettingsUpdate("journeyStage", Math.max(highestCompleted, exerciseId));
      analytics.journeyExerciseCompleted(exerciseId, exercise.part);
    }
    if (exercise.completionModal) {
      analytics.journeyPartCompleted(exercise.part, partTitle);
      setPartCompleteData({
        part: exercise.part,
        partName: partTitle,
        modalConfig: exercise.completionModal,
      });
    } else {
      const nextId = getNextExerciseId(exerciseId);
      if (nextId !== null) navigateTo(nextId);
      else onBack();
    }
  }

  function goToPrevExercise() {
    const prevId = exerciseId - 1;
    if (prevId < 1 || !onPrev) return;
    onPrev(prevId);
  }

  function handlePartCompleteContinue() {
    setPartCompleteData(null);
    const nextId = getNextExerciseId(exerciseId);
    if (nextId !== null) navigateTo(nextId);
    else onBack();
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Sub-nav ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 sm:gap-2 pl-3 pr-4 sm:pl-4 sm:pr-5 py-2 sm:py-2.5 border-b border-white/6 shrink-0 overflow-x-auto">
        <Button variant="ghost" onClick={onBack} className="shrink-0 text-xs sm:text-sm text-white/68 hover:text-white/90 pr-1!">
          ← Journey
        </Button>
        <Text variant="caption" as="span" color="muted-2">|</Text>
        <Text variant="caption" as="span" color="muted-1" className="sm:text-sm shrink-0">
          Part {toRoman(exercise.part)}
        </Text>
        <Text variant="caption" as="span" color="text-2" className="hidden md:inline font-medium shrink-0">
          — {partTitle}
        </Text>
        <Text variant="caption" as="span" color="muted-2">·</Text>
        <Text variant="caption" as="span" color="muted-1" className="sm:text-sm shrink-0">
          {getStepInPart(exerciseId).stepIndex} of{" "}
          {getStepInPart(exerciseId).stepsInPart}
        </Text>
        <Text variant="caption" as="span" color="muted-2">—</Text>
        <Text variant="caption" as="span" color="text-2" className="sm:text-sm font-medium truncate min-w-0">
          {exercise.title}
        </Text>
        {!isLearnType && (
          <Text as="span" className="ml-auto">
            <InfoButton onClick={() => setShowInfoModal(true)} />
          </Text>
        )}
      </div>

      {/* Info modal */}
      {exercise.exerciseTypeId !== "learn" && showInfoModal && (
        <ExerciseInfoModal
          exerciseId={exerciseId}
          onStart={() => setShowInfoModal(false)}
          onDismiss={() => setShowInfoModal(false)}
          showDontShowAgain={exercise.exerciseTypeId !== "breathwork-farinelli"}
        />
      )}

      {/* ── Exercise content (dispatched by exerciseTypeId) ─────────────────── */}
      <BaseExercise
        exercise={exercise}
        exerciseId={exerciseId}
        partTitle={partTitle}
        partRoman={toRoman(exercise.part)}
        stepIndex={getStepInPart(exerciseId).stepIndex}
        stepsInPart={getStepInPart(exerciseId).stepsInPart}
        isLast={exerciseId === JOURNEY_EXERCISES[JOURNEY_EXERCISES.length - 1]?.id}
        allBands={allBands}
        pitchHz={pitchHz}
        pitchHzRef={pitchHzRef}
        isAlreadyCompleted={isCompleted}
        onComplete={() => goToNextExercise(true)}
        onSkip={() => goToNextExercise(false)}
        onPrev={onPrev ? goToPrevExercise : undefined}
        onPlayTone={onPlayTone}
        onPlaySlide={onPlaySlide}
      />

      {/* Part complete modal */}
      {partCompleteData && (
        <PartCompleteModal
          modalConfig={partCompleteData.modalConfig}
          onContinue={handlePartCompleteContinue}
        />
      )}
    </div>
  );
}
