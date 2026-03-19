"use client";

import { useParams, useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import { ChapterDetail } from "@/components/ChapterDetail";
import { journey } from "@/constants/journey";

export default function ChapterPageClient() {
  const params = useParams();
  const router = useRouter();

  const chapterSlug = typeof params?.chapter === "string" ? params.chapter : "";
  const chapter = journey.getChapterBySlug(chapterSlug);

  useEffect(() => {
    if (!chapter) router.replace("/journey");
  }, [chapter, router]);

  if (!chapter) return null;

  return (
    <Suspense>
      <ChapterDetail chapter={chapter} />
    </Suspense>
  );
}
