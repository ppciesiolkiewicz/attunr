"use client";

import { useRouter } from "next/navigation";
import { Text, Button } from "@/components/ui";
import { toRoman } from "@/lib/format";
import { journey } from "@/constants/journey";
import type { Chapter } from "@/constants/journey";
import type { JourneyProgressHook } from "@/hooks/useJourneyProgress";
import { StageDots } from "./StageDots";
import { ContinueStrip } from "./ContinueStrip";

interface ChapterCardProps {
  chapter: Chapter;
  jp: JourneyProgressHook;
}

export function ChapterCard({ chapter, jp }: ChapterCardProps) {
  const router = useRouter();
  const allStages = chapter.warmup
    ? [chapter.warmup, ...chapter.stages]
    : chapter.stages;
  const allExercises = allStages.flatMap((s) => s.exercises);
  const totalExercises = allExercises.length;
  if (totalExercises === 0) return null;

  const completed = jp.completedCount(allExercises);
  const isComplete = jp.isChapterCompleted(chapter.slug);
  const started = jp.isStarted(allExercises);
  const isLocked = jp.isChapterLocked(chapter.chapter);
  const isInProgress = started && !isComplete;

  const nextExercise = jp.findNextExercise(allExercises);
  const nextStage = nextExercise
    ? allStages.find((s) => s.exercises.some((e) => e.id === nextExercise.id))
    : null;
  const nextHref = nextExercise ? journey.exerciseHref(nextExercise) : null;
  const firstExercise = allExercises[0];

  function handleCardClick() {
    if (isLocked) return;
    router.push(journey.chapterHref(chapter));
  }

  function handleContinueClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (nextHref) router.push(nextHref);
  }

  function handleBrowse(e: React.MouseEvent) {
    e.stopPropagation();
    router.push(journey.chapterHref(chapter));
  }

  function handleStartRestart(e: React.MouseEvent) {
    e.stopPropagation();
    router.push(journey.exerciseHref(firstExercise));
  }

  return (
    <div
      onClick={handleCardClick}
      className="rounded-2xl border overflow-hidden transition-all"
      style={{
        background: isInProgress ? "rgba(168,133,246,0.04)" : "rgba(255,255,255,0.025)",
        borderColor: isInProgress
          ? "rgba(168,133,246,0.25)"
          : "rgba(255,255,255,0.07)",
        opacity: isLocked ? 0.4 : 1,
        cursor: isLocked ? "default" : "pointer",
        pointerEvents: isLocked ? "none" : "auto",
      }}
    >
      {/* Color accent strip */}
      <div className="h-[3px] w-full" style={{ background: "#a855f7", opacity: isLocked ? 0.4 : 1 }} />

      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex justify-between items-start">
          <div>
            <Text variant="label" as="span" style={{ color: "rgba(168,133,246,0.5)" }}>
              Chapter {toRoman(chapter.chapter)}
            </Text>
            <Text variant="heading-sm" as="h2" className="mt-1">
              {chapter.title}
            </Text>
          </div>
          {!isLocked && (
            <Text variant="caption" as="span" style={{ color: "rgba(255,255,255,0.3)" }} className="pt-0.5">
              {completed}/{totalExercises}
            </Text>
          )}
        </div>
        <Text variant="body-sm" as="p" className="mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
          {chapter.description}
        </Text>
      </div>

      {/* Stage dots */}
      {allStages.length > 0 && (
        <StageDots stages={allStages} jp={jp} />
      )}

      {/* Continue strip — shown when in-progress */}
      {isInProgress && nextExercise && nextStage && (
        <ContinueStrip
          exercise={nextExercise}
          stage={nextStage}
          onClick={handleContinueClick}
        />
      )}

      {/* Action bar */}
      {!isLocked && (
        <div className="flex border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          {isInProgress && (
            <Button
              variant="ghost"
              onClick={handleStartRestart}
              className="flex-1 py-2.5 px-3 text-xs font-semibold rounded-none"
              style={{ color: "rgba(255,255,255,0.4)", borderRight: "1px solid rgba(255,255,255,0.05)" }}
            >
              Start over
            </Button>
          )}
          {!started && nextHref && (
            <Button
              variant="ghost"
              onClick={handleStartRestart}
              className="flex-1 py-2.5 px-3 text-xs font-semibold rounded-none"
              style={{ color: "#a78bfa", borderRight: "1px solid rgba(255,255,255,0.05)" }}
            >
              Start →
            </Button>
          )}
          {(isInProgress || !started) && (
            <Button
              variant="ghost"
              onClick={handleBrowse}
              className="flex-1 py-2.5 px-3 text-xs font-semibold rounded-none"
              style={{ color: "#a78bfa" }}
            >
              Browse ↗
            </Button>
          )}
          {isComplete && (
            <Button
              variant="ghost"
              onClick={handleStartRestart}
              className="flex-1 py-2.5 px-3 text-xs font-semibold rounded-none"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Replay
            </Button>
          )}
        </div>
      )}

      {/* Locked message */}
      {isLocked && (
        <div className="px-4 pb-3">
          <Text variant="caption" as="p" style={{ color: "rgba(255,255,255,0.3)" }}>
            Complete Chapter {toRoman(chapter.chapter - 1)} to unlock
          </Text>
        </div>
      )}
    </div>
  );
}
