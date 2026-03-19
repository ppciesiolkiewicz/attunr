import type { Metadata } from "next";
import { journey } from "@/constants/journey";
import ChapterPageClient from "./ChapterPageClient";

type Props = { params: Promise<{ chapter: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { chapter: slug } = await params;
  const chapter = journey.getChapterBySlug(slug);
  return { title: chapter?.title ?? "Chapter" };
}

export default function ChapterPage() {
  return <ChapterPageClient />;
}
