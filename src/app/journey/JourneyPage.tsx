"use client";

import { Suspense } from "react";
import { ChapterList } from "@/components/ChapterList";

export default function JourneyPage() {
  return (
    <Suspense>
      <ChapterList />
    </Suspense>
  );
}
