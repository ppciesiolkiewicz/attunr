"use client";

import { Suspense } from "react";
import { ChapterList } from "@/components/ChapterList";
import { useApp } from "@/context/AppContext";

export default function JourneyPage() {
  const { settings } = useApp();

  return (
    <Suspense>
      <ChapterList settings={settings} />
    </Suspense>
  );
}
