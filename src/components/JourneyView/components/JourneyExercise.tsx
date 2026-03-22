"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { InfoButton } from "../../TabInfoModal";
import { Button, Text } from "@/components/ui";
import { getSkippedInfoExerciseIds, getStepInStage } from "../utils";
import { ExerciseInfoModal } from "./ExerciseInfoModal";
import { BaseExercise } from "@/components/Exercise";
import { PartCompleteModal } from "./PartCompleteModal";
import { journey } from "@/constants/journey";
import type { ExerciseConfig } from "@/constants/journey";
import { analytics } from "@/lib/analytics";
import { toRoman } from "@/lib/format";
import { useApp } from "@/context/AppContext";
import { useStreak } from "@/features/streak";
import type { ColoredNote } from "@/lib/VocalRange";
import { VocalRange } from "@/lib/VocalRange";
import type { ModalConfig } from "@/constants/journey/types";
import type { Settings } from "@/hooks/useSettings";

export function JourneyExercise({
  exercise,
  settings,
  pitchHz,
  pitchHzRef,
  onPlayTone,
  onPlaySlide,
  onBack,
  onNext,
  onPrev,
  backLabel,
}: {
  exercise: ExerciseConfig;
  settings: Settings;
  pitchHz: number | null;
  pitchHzRef: React.RefObject<number | null>;
  onPlayTone: (band: ColoredNote) => void;
  onPlaySlide?: (fromBand: ColoredNote, toBand: ColoredNote) => void;
  onBack: () => void;
  onNext: (next: ExerciseConfig) => void;
  onPrev?: (prev: ExerciseConfig) => void;
  /** Label for the back button. Default: "← Journey" */
  backLabel?: string;
}) {
  const router = useRouter();
  const { triggerNotificationPrompt, journeyProgress: jp } = useApp();
  const streak = useStreak();
  const exerciseId = exercise.id;
  const isCompleted = jp.isCompleted(exercise);
  const chapter = journey.chapters.find(
    (ch) => ch.chapter === exercise.chapter,
  );
  const allStages = chapter
    ? chapter.warmup
      ? [chapter.warmup, ...chapter.stages]
      : chapter.stages
    : [];
  const stageTitle =
    allStages.find((s) => s.id === exercise.stageId)?.title ?? "";

  const vocalRange = useMemo(() => {
    const lowHz = settings.vocalRangeLowHz > 0 ? settings.vocalRangeLowHz : 131;
    const highHz =
      settings.vocalRangeHighHz > 0 ? settings.vocalRangeHighHz : 523;
    return new VocalRange(lowHz, highHz, settings.tuning);
  }, [settings.vocalRangeLowHz, settings.vocalRangeHighHz, settings.tuning]);

  const isLearnType =
    exercise.exerciseTypeId === "learn" ||
    exercise.exerciseTypeId === "learn-notes-1" ||
    exercise.exerciseTypeId === "learn-voice-driven" ||
    exercise.exerciseTypeId === "walkthrough";
  // TODO: this should be set on modal config on exercise
  const shouldAutoShowInfo = () => {
    if (isLearnType) return false;
    if (exercise.introModalInfoOnly) return false;
    if (exercise.exerciseTypeId === "breathwork-farinelli") return true;
    return !getSkippedInfoExerciseIds().has(exerciseId);
  };
  const [showInfoModal, setShowInfoModal] = useState(shouldAutoShowInfo);

  // Trigger notification prompt when info modal is shown for flagged exercises
  useEffect(() => {
    if (showInfoModal && exercise.showEnableNotificationsPrompt)
      triggerNotificationPrompt();
  }, [
    showInfoModal,
    exercise.showEnableNotificationsPrompt,
    triggerNotificationPrompt,
  ]);

  const [partCompleteData, setPartCompleteData] = useState<{
    part: number;
    partName: string;
    modalConfig: ModalConfig;
  } | null>(null);

  // Prefetch next page when part-complete modal is showing
  useEffect(() => {
    if (partCompleteData !== null) {
      const next = journey.getNextExercise(exercise);
      if (next) router.prefetch(journey.exerciseHref(next));
      else router.prefetch("/");
    }
  }, [partCompleteData, exercise, router]);

  useEffect(() => {
    analytics.journeyExerciseStarted(exerciseId, exercise.chapter, stageTitle);
  }, [exerciseId, exercise.chapter, stageTitle]);

  // ── Navigation ─────────────────────────────────────────────────────────

  const stepInfo = getStepInStage(exerciseId);
  const isLastInStage = stepInfo.stepIndex === stepInfo.stepsInStage;

  function goToNextExercise(markComplete: boolean) {
    if (markComplete) {
      jp.completeExercise(exercise);
      analytics.journeyExerciseCompleted(exerciseId, exercise.chapter);
    }
    if (exercise.completionModal) {
      analytics.journeyPartCompleted(exercise.chapter, stageTitle);
      setPartCompleteData({
        part: exercise.chapter,
        partName: stageTitle,
        modalConfig: exercise.completionModal,
      });
    } else {
      // No modal — record streak immediately if last in stage
      if (isLastInStage) streak.recordCompletion();
      const next = journey.getNextExercise(exercise);
      if (next) onNext(next);
      else onBack();
    }
  }

  function goToPrevExercise() {
    const prev = journey.getPrevExercise(exercise);
    if (!prev || !onPrev) return;
    onPrev(prev);
  }

  function handlePartCompleteContinue() {
    if (isLastInStage) {
      streak.recordCompletion();
    }
    setPartCompleteData(null);
    const next = journey.getNextExercise(exercise);
    if (next) onNext(next);
    else onBack();
  }

  const parentRef = useRef<HTMLDivElement | null>(null);

  return (
    <div ref={parentRef} className="flex flex-col h-full">
      {/* ── Sub-nav ───────────────────────────────────────────────────────── */}
      <div data-spotlight="breadcrumb" className="flex items-center gap-1.5 sm:gap-2 pl-3 pr-4 sm:pl-4 sm:pr-5 py-2 sm:py-2.5 border-b border-white/6 shrink-0 overflow-x-auto">
        <Button
          variant="ghost"
          onClick={onBack}
          className="shrink-0 text-xs sm:text-sm text-white/68 hover:text-white/90 pr-1!"
        >
          {backLabel ?? "← Journey"}
        </Button>
        <Text variant="caption" as="span" color="muted-2">
          |
        </Text>
        <Text
          variant="caption"
          as="span"
          color="muted-1"
          className="sm:text-sm shrink-0"
        >
          Ch {toRoman(exercise.chapter)}
        </Text>
        <Text
          variant="caption"
          as="span"
          color="text-2"
          className="hidden md:inline font-medium shrink-0"
        >
          — {stageTitle}
        </Text>
        <Text variant="caption" as="span" color="muted-2">
          ·
        </Text>
        <Text
          variant="caption"
          as="span"
          color="muted-1"
          className="sm:text-sm shrink-0"
        >
          {stepInfo.stepIndex} of {stepInfo.stepsInStage}
        </Text>
        <Text variant="caption" as="span" color="muted-2">
          —
        </Text>
        <Text
          variant="caption"
          as="span"
          color="text-2"
          className="sm:text-sm font-medium truncate min-w-0"
        >
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
        partTitle={stageTitle}
        partRoman={toRoman(exercise.chapter)}
        stepIndex={stepInfo.stepIndex}
        stepsInPart={stepInfo.stepsInStage}
        isLast={
          exerciseId === journey.exercises[journey.exercises.length - 1]?.id
        }
        vocalRange={vocalRange}
        pitchHz={pitchHz}
        pitchHzRef={pitchHzRef}
        isAlreadyCompleted={isCompleted}
        onComplete={() => goToNextExercise(true)}
        onSkip={() => goToNextExercise(false)}
        onPrev={onPrev ? goToPrevExercise : undefined}
        onPlayTone={onPlayTone}
        onPlaySlide={onPlaySlide}
        parentRef={parentRef}
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
