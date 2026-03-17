"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { InfoButton } from "../../TabInfoModal";
import { Button, Text } from "@/components/ui";
import { getSkippedInfoExerciseIds, getStepInStage } from "../utils";
import { ExerciseInfoModal } from "./ExerciseInfoModal";
import { BaseExercise } from "@/components/Exercise";
import { PartCompleteModal } from "./PartCompleteModal";
import { JOURNEY_EXERCISES, JOURNEY_CONFIG, getNextExerciseId } from "@/constants/journey";
import { analytics } from "@/lib/analytics";
import { getScaleNotesForRange } from "@/lib/vocal-scale";
import { useApp } from "@/context/AppContext";
import type { ColoredNote, VocalRange } from "@/constants/tone-slots";
import { hzToNoteName } from "@/lib/pitch";
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
  onPlayTone: (band: ColoredNote) => void;
  onPlaySlide?: (fromBand: ColoredNote, toBand: ColoredNote) => void;
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
  const chapter = JOURNEY_CONFIG.find((ch) => ch.chapter === exercise.chapter);
  const allStages = chapter ? (chapter.warmup ? [chapter.warmup, ...chapter.stages] : chapter.stages) : [];
  const stageTitle = allStages.find((s) => s.id === exercise.stageId)?.title ?? "";

  const vocalRange: VocalRange = useMemo(() => {
    const lowHz = settings.vocalRangeLowHz > 0 ? settings.vocalRangeLowHz : 131;
    const highHz = settings.vocalRangeHighHz > 0 ? settings.vocalRangeHighHz : 523;
    return {
      lowNote: hzToNoteName(lowHz),
      highNote: hzToNoteName(highHz),
      allNotes: getScaleNotesForRange(lowHz, highHz, settings.tuning),
    };
  }, [settings.vocalRangeLowHz, settings.vocalRangeHighHz, settings.tuning]);

  const isLearnType = exercise.exerciseTypeId === "learn" || exercise.exerciseTypeId === "learn-notes-1";
  const shouldAutoShowInfo = () => {
    if (isLearnType) return false;
    if (exercise.exerciseTypeId === "breathwork-farinelli") return true;
    return !getSkippedInfoExerciseIds().has(exerciseId);
  };
  const [showInfoModal, setShowInfoModal] = useState(shouldAutoShowInfo);

  // Trigger notification prompt when info modal is shown for flagged exercises
  useEffect(() => {
    if (showInfoModal && exercise.showEnableNotificationsPrompt) triggerNotificationPrompt();
  }, [showInfoModal, exercise.showEnableNotificationsPrompt, triggerNotificationPrompt]);

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
    analytics.journeyExerciseStarted(exerciseId, exercise.chapter, stageTitle);
  }, [exerciseId, exercise.chapter, stageTitle]);

  // ── Navigation ─────────────────────────────────────────────────────────

  function navigateTo(targetId: number) {
    if (targetId < 1) return;
    onNext(targetId);
  }

  function goToNextExercise(markComplete: boolean) {
    if (markComplete) {
      onSettingsUpdate("journeyStage", Math.max(highestCompleted, exerciseId));
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
          Ch {exercise.chapter}
        </Text>
        <Text variant="caption" as="span" color="text-2" className="hidden md:inline font-medium shrink-0">
          — {stageTitle}
        </Text>
        <Text variant="caption" as="span" color="muted-2">·</Text>
        <Text variant="caption" as="span" color="muted-1" className="sm:text-sm shrink-0">
          {getStepInStage(exerciseId).stepIndex} of{" "}
          {getStepInStage(exerciseId).stepsInStage}
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
        partTitle={stageTitle}
        partRoman={String(exercise.chapter)}
        stepIndex={getStepInStage(exerciseId).stepIndex}
        stepsInPart={getStepInStage(exerciseId).stepsInStage}
        isLast={exerciseId === JOURNEY_EXERCISES[JOURNEY_EXERCISES.length - 1]?.id}
        vocalRange={vocalRange}
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
