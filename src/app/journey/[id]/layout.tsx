import { JOURNEY_STAGES, TOTAL_JOURNEY_STAGES } from "@/constants/journey";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const stageId = parseInt(id, 10);
  if (isNaN(stageId) || stageId < 1 || stageId > TOTAL_JOURNEY_STAGES) {
    return { title: "Journey" };
  }
  const stage = JOURNEY_STAGES.find((s) => s.id === stageId);
  if (!stage) return { title: "Journey" };
  const prefix = stage.stageTypeId === "intro" ? "Learn" : "Exercise";
  return {
    title: `${prefix} · ${stage.title}`,
  };
}

export default function JourneyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
