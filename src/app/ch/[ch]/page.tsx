"use client";

import { useParams, useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import { ChapterDetail } from "@/components/ChapterDetail";
import { useApp } from "@/context/AppContext";
import { journey } from "@/constants/journey";

export default function ChapterPage() {
  const params = useParams();
  const router = useRouter();
  const { settings } = useApp();

  const ch = typeof params?.ch === "string" ? parseInt(params.ch, 10) : NaN;
  const chapter = !isNaN(ch) ? journey.chapters.find((c) => c.chapter === ch) : undefined;

  useEffect(() => {
    if (!chapter) router.replace("/journey");
  }, [chapter, router]);

  if (!chapter) return null;

  return (
    <Suspense>
      <ChapterDetail chapter={chapter} settings={settings} />
    </Suspense>
  );
}
