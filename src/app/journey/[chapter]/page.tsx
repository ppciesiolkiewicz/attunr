import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { journey } from "@/constants/journey";
import ChapterLoading from "./loading";

const ChapterPageClient = dynamic(() => import("./ChapterPageClient"), {
  loading: () => <ChapterLoading />,
});

export function generateStaticParams() {
  return journey.chapters.map((ch) => ({ chapter: ch.slug }));
}

type Props = { params: Promise<{ chapter: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { chapter: slug } = await params;
  const chapter = journey.getChapterBySlug(slug);
  return { title: chapter?.title ?? "Chapter" };
}

export default function ChapterPage() {
  return <ChapterPageClient />;
}
