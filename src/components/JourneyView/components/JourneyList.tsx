"use client";

import {
  JOURNEY_STAGES,
  LAST_STAGE_ID_PER_PART,
  PART_TITLES,
} from "@/constants/journey";
import type { Settings } from "@/hooks/useSettings";
import { StageCard } from "./StageCard";
import { BadgeIcon } from "./BadgeIcon";

interface JourneyListProps {
  settings: Settings;
  onSelect: (stageId: number) => void;
}

export function JourneyList({ settings, onSelect }: JourneyListProps) {
  const { journeyStage: highestCompleted } = settings;
  const parts = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex flex-col gap-4 px-5 py-5 max-w-2xl mx-auto w-full">
        <h1 className="text-xl sm:text-2xl font-semibold text-white">Journey</h1>
        <div className="flex flex-col gap-2 text-sm text-white/65 leading-relaxed">
          <p>
            This is where your journey begins. You&apos;ll be guided through
            learning and practice — from vocal warmups to sustaining each tone
            and exploring techniques like mantras and vowels.
          </p>
          <p>
            When you&apos;ve built confidence, switch to Train for freeform
            practice — any tone, any order.
          </p>
        </div>

        {parts.map((partNum) => {
          const stages = JOURNEY_STAGES.filter((s) => s.part === partNum);
          if (stages.length === 0) return null;
          const roman =
            ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"][partNum - 1];
          const lastStageId = LAST_STAGE_ID_PER_PART[partNum];
          const partComplete = highestCompleted >= lastStageId;
          return (
            <section key={partNum} className="flex flex-col gap-2">
              <header className="flex items-center gap-3 mb-0.5">
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs uppercase tracking-widest text-white/45">
                    Part {roman}
                  </span>
                  <span className="text-xs text-white/72 font-medium">
                    {PART_TITLES[partNum]}
                  </span>
                  {partComplete && (
                    <BadgeIcon
                      className="text-violet-400/90"
                      style={{ width: 12, height: 12 }}
                    />
                  )}
                </div>
                <div className="flex-1 h-px bg-white/[0.05]" />
              </header>
              {stages.map((stage) => (
                <StageCard
                  key={stage.id}
                  stage={stage}
                  highestCompleted={highestCompleted}
                  onSelect={onSelect}
                />
              ))}
            </section>
          );
        })}
      </div>
    </div>
  );
}
