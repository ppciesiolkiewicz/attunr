import { journey } from "@/constants/journey";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const exerciseId = parseInt(id, 10);
  const journeyDesc =
    "A guided vocal journey — 49 stages of breathwork, toning, and mantras that calm your nervous system and bring you back to your body.";
  if (isNaN(exerciseId) || exerciseId < 1 || exerciseId > journey.exercises.length) {
    return { title: "Journey", description: journeyDesc };
  }
  const exercise = journey.exercises.find((e) => e.id === exerciseId);
  if (!exercise) return { title: "Journey", description: journeyDesc };
  const prefix = exercise.exerciseTypeId === "learn" ? "Learn" : "Exercise";
  return {
    title: `${prefix} · ${exercise.title}`,
    description: journeyDesc,
  };
}

export default function JourneyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
