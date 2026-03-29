import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { journey } from "@/constants/journey";
import ExerciseLoading from "./loading";

const ExercisePageClient = dynamic(() => import("./ExercisePageClient"), {
  loading: () => <ExerciseLoading />,
});

export function generateStaticParams() {
  return journey.exercises.map((ex) => ({
    chapter: ex.chapterSlug,
    exercise: ex.slug,
  }));
}

type Props = { params: Promise<{ chapter: string; exercise: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { chapter, exercise } = await params;
  const ex = journey.getExerciseByRoute(chapter, exercise);
  return { title: ex?.title ?? "Exercise" };
}

export default function ExercisePage() {
  return <ExercisePageClient />;
}
