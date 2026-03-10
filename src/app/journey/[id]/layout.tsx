import { JOURNEY_STAGES, TOTAL_JOURNEY_STAGES } from "@/constants/journey";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const stageId = parseInt(id, 10);
  if (isNaN(stageId) || stageId < 1 || stageId > TOTAL_JOURNEY_STAGES) {
    return { title: "Journey" };
  }
  const stage = JOURNEY_STAGES.find((s) => s.id === stageId);
  return {
    title: stage ? stage.title : "Journey",
  };
}

export default function JourneyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
