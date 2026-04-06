import { useState, useEffect, useCallback } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Text, Button, CloseButton } from "@/components/ui";
import { ContentElements } from "@/components/Exercise/components/ContentElements";
import { journey } from "@/constants/journey";
import type { ExerciseConfig } from "@/constants/journey";
import { getStepInStage } from "../utils";
import { BookIcon } from "./BookIcon";

const exercisesWithModal = journey.exercises.filter((e) => e.introModal);

function ModalBrowser() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const exercise = exercisesWithModal[currentIndex];

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }, []);
  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(exercisesWithModal.length - 1, i + 1));
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        goNext();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-72 shrink-0 border-r border-white/10 overflow-y-auto bg-black/30">
        <div className="px-3 py-3 border-b border-white/10 sticky top-0 bg-[#080810] z-10">
          <Text variant="label" color="muted-1">
            {exercisesWithModal.length} modals
          </Text>
          <Text variant="caption" color="muted-2" className="mt-1">
            Arrow keys to navigate
          </Text>
        </div>
        {exercisesWithModal.map((ex, i) => (
          <SidebarItem
            key={ex.id}
            exercise={ex}
            isActive={i === currentIndex}
            onClick={() => setCurrentIndex(i)}
          />
        ))}
      </div>

      {/* Modal preview */}
      <div className="flex-1 flex items-start justify-center overflow-y-auto py-8 px-6">
        <div className="w-full max-w-md flex flex-col">
          {/* Navigation bar */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={goPrev}
              disabled={currentIndex === 0}
            >
              ← Prev
            </Button>
            <Text variant="caption" color="muted-1">
              {currentIndex + 1} / {exercisesWithModal.length}
            </Text>
            <Button
              variant="ghost"
              size="sm"
              onClick={goNext}
              disabled={currentIndex === exercisesWithModal.length - 1}
            >
              Next →
            </Button>
          </div>

          {/* Metadata badges */}
          <ExerciseMeta exercise={exercise} />

          {/* Modal content rendered inline */}
          <ModalPreview key={exercise.id} exercise={exercise} />
        </div>
      </div>
    </div>
  );
}

function SidebarItem({
  exercise,
  isActive,
  onClick,
}: {
  exercise: ExerciseConfig;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 border-b border-white/5 cursor-pointer transition-colors ${
        isActive
          ? "bg-violet-500/15 border-l-2 border-l-violet-400"
          : "hover:bg-white/5 border-l-2 border-l-transparent"
      }`}
    >
      <Text variant="caption" color="muted-2" className="mb-0.5">
        Ch {exercise.chapter} · {exercise.exerciseTypeId}
      </Text>
      <Text
        variant="body-sm"
        color={isActive ? "text-1" : "text-2"}
        className="leading-snug"
      >
        {exercise.introModal?.title ?? exercise.title}
      </Text>
    </button>
  );
}

function ExerciseMeta({ exercise }: { exercise: ExerciseConfig }) {
  const stepInfo = getStepInStage(exercise.id);
  return (
    <div className="flex flex-wrap gap-2 mb-3">
      <Badge>Ch {exercise.chapter}</Badge>
      <Badge>{exercise.exerciseTypeId}</Badge>
      <Badge>
        Step {stepInfo.stepIndex}/{stepInfo.stepsInStage}
      </Badge>
      <Badge>ID {exercise.id}</Badge>
      {exercise.introModal?.actionLabel && (
        <Badge>CTA: {exercise.introModal.actionLabel}</Badge>
      )}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-white/8 text-white/50 border border-white/8">
      {children}
    </span>
  );
}

function ModalPreview({ exercise }: { exercise: ExerciseConfig }) {
  const modal = exercise.introModal!;
  const isLearnExercise = exercise.exerciseTypeId === "learn";
  const stepInfo = getStepInStage(exercise.id);

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: "#0f0f1a",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-white/6 shrink-0">
        <div>
          <Text variant="caption" className="mb-1 flex items-center gap-1.5">
            {isLearnExercise && <BookIcon className="opacity-70" />}
            <Text as="span" variant="label" color="muted-1">
              Ch {exercise.chapter}
            </Text>
            <Text as="span" variant="caption" color="muted-1">
              ·
            </Text>
            <Text as="span" variant="caption">
              {stepInfo.stepIndex} of {stepInfo.stepsInStage}
            </Text>
          </Text>
          <Text variant="heading">{modal.title ?? exercise.title}</Text>
          {modal.subtitle && (
            <Text
              variant="body-sm"
              className="mt-1"
              style={{ color: "#7c3aed" }}
            >
              {modal.subtitle}
            </Text>
          )}
        </div>
        <CloseButton onClick={() => {}} className="ml-4 mt-0.5 shrink-0" />
      </div>

      {/* Body */}
      <div className="flex flex-col gap-4 px-5 py-5 overflow-y-auto flex-1 min-h-0">
        <ContentElements elements={modal.elements} />
      </div>

      {/* Footer */}
      <div className="px-5 pb-5 pt-3 border-t border-white/6 shrink-0">
        <Button size="lg" className="w-full">
          {modal.actionLabel ??
            (isLearnExercise ? "Continue →" : "Begin exercise →")}
        </Button>
      </div>
    </div>
  );
}

const meta: Meta = {
  title: "Journey/Exercise Info Modals",
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj;

export const Browser: Story = {
  render: () => <ModalBrowser />,
};
