"use client";

import { useEffect } from "react";
import { journey } from "@/constants/journey";
import { Button, Text } from "@/components/ui";
import { useApp } from "@/context/AppContext";
import { analytics } from "@/lib/analytics";
import { ChapterCard } from "./components/ChapterCard";

export function ChapterList() {
  const { journeyProgress: jp } = useApp();

  useEffect(() => {
    analytics.journeyViewed();
  }, []);

  const allUnlocked = journey.exercises.every((ex) => jp.isCompleted(ex));

  function handleUnlockAll() {
    for (const exercise of journey.exercises) {
      jp.completeExercise(exercise);
    }
  }

  function handleResetProgress() {
    jp.resetAll();
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex flex-col gap-4 px-5 py-5 max-w-2xl mx-auto w-full">
        <div className="flex flex-col gap-1.5 mb-4">
          <div className="flex items-center justify-between gap-3">
            <Text variant="heading" as="h1" className="sm:text-2xl">
              Journey
            </Text>
            {allUnlocked ? (
              <Button variant="outline" size="sm" onClick={handleResetProgress}>
                Reset progress
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={handleUnlockAll}>
                Unlock all
              </Button>
            )}
          </div>
          <Text
            variant="caption"
            as="p"
            className="text-right"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            {allUnlocked
              ? "Wipe the slate clean and begin anew."
              : "For the impatient souls eager to explore — no judgment."}
          </Text>
        </div>
        <div className="flex flex-col gap-2">
          <Text
            variant="body-sm"
            as="p"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            This is where your journey begins. You&apos;ll be guided through
            learning and practice — from vocal warmups to sustaining each tone
            and exploring techniques like mantras and vowels.
          </Text>
        </div>

        <div className="flex flex-col gap-3">
          {journey.chapters.map((chapter) => (
            <ChapterCard key={chapter.chapter} chapter={chapter} jp={jp} />
          ))}
        </div>
      </div>
    </div>
  );
}
