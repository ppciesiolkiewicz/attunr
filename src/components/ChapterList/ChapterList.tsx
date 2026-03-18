"use client";

import { journey } from "@/constants/journey";
import { Text } from "@/components/ui";
import { useApp } from "@/context/AppContext";
import { ChapterCard } from "./components/ChapterCard";

export function ChapterList() {
  const { journeyProgress: jp } = useApp();

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex flex-col gap-4 px-5 py-5 max-w-2xl mx-auto w-full">
        <Text variant="heading" as="h1" className="sm:text-2xl">Journey</Text>
        <div className="flex flex-col gap-2">
          <Text variant="body-sm" as="p" style={{ color: "rgba(255,255,255,0.45)" }}>
            This is where your journey begins. You&apos;ll be guided through
            learning and practice — from vocal warmups to sustaining each tone
            and exploring techniques like mantras and vowels.
          </Text>
          <Text variant="body-sm" as="p" style={{ color: "rgba(255,255,255,0.45)" }}>
            When you&apos;ve built confidence, switch to Train for freeform
            practice — any tone, any order.
          </Text>
        </div>

        <div className="flex flex-col gap-3">
          {journey.chapters.map((chapter) => (
            <ChapterCard
              key={chapter.chapter}
              chapter={chapter}
              jp={jp}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
