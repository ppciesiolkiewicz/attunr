"use client";

import type { StageConfig } from "@/constants/journey";
import type { JourneyProgressHook } from "@/hooks/useJourneyProgress";

interface StageDotsProps {
  stages: StageConfig[];
  jp: JourneyProgressHook;
}

export function StageDots({ stages, jp }: StageDotsProps) {
  return (
    <div className="flex gap-[3px] px-4 pb-3">
      {stages.map((stage) => {
        const isComplete = jp.isStageCompleted(stage);
        const hasStarted = jp.isStarted(stage.exercises);
        const isActive = !isComplete && hasStarted;

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
