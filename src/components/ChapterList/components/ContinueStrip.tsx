"use client";

import { Text } from "@/components/ui";
import type { ExerciseConfig, StageConfig } from "@/constants/journey";

interface ContinueStripProps {
  exercise: ExerciseConfig;
  stage: StageConfig;
  onClick: (e: React.MouseEvent) => void;
}

export function ContinueStrip({ exercise, stage, onClick }: ContinueStripProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-4 py-2.5 border-t cursor-pointer transition-all duration-150 hover:brightness-150 active:brightness-90 text-left"
      style={{
        borderColor: "rgba(255,255,255,0.04)",
        background: "rgba(168,133,246,0.04)",
      }}
    >
      <div
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{
          background: "#a855f7",
          animation: "pulse-dot 2s ease-in-out infinite",
        }}
      />
      <div className="flex-1 min-w-0">
        <Text variant="body-sm" as="span" className="font-medium" style={{ color: "rgba(255,255,255,0.75)" }}>
          {exercise.title}
        </Text>
        <Text variant="caption" as="div" style={{ color: "rgba(255,255,255,0.3)" }}>
          {stage.title}
        </Text>
      </div>
      <Text variant="body-sm" as="span" style={{ color: "rgba(168,133,246,0.5)" }}>
        Continue ›
      </Text>
    </button>
  );
}
