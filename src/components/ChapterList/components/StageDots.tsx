"use client";

import type { StageConfig } from "@/constants/journey";

interface StageDotsProps {
  stages: StageConfig[];
  highestCompleted: number;
}

export function StageDots({ stages, highestCompleted }: StageDotsProps) {
  return (
    <div className="flex gap-[3px] px-4 pb-3">
      {stages.map((stage) => {
        const exercises = stage.exercises;
        const lastId = exercises[exercises.length - 1]?.id ?? 0;
        const firstId = exercises[0]?.id ?? 0;
        const isComplete = highestCompleted >= lastId;
        const isActive = !isComplete && highestCompleted >= firstId - 1;

        return (
          <div
            key={stage.id}
            className="h-[3px] rounded-sm flex-1"
            style={{
              background: isComplete
                ? "#a855f7"
                : isActive
                  ? "rgba(168,133,246,0.4)"
                  : "rgba(255,255,255,0.08)",
            }}
          />
        );
      })}
    </div>
  );
}
