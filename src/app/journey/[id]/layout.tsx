import { JOURNEY_STAGES, TOTAL_JOURNEY_STAGES } from "@/constants/journey";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const stageId = parseInt(id, 10);
  const journeyDesc =
    "A guided vocal journey — 49 stages of breathwork, toning, and mantras that calm your nervous system and bring you back to your body.";
  if (isNaN(stageId) || stageId < 1 || stageId > TOTAL_JOURNEY_STAGES) {
    return { title: "Journey", description: journeyDesc };
  }
  const stage = JOURNEY_STAGES.find((s) => s.id === stageId);
  if (!stage) return { title: "Journey", description: journeyDesc };
  const prefix = stage.stageTypeId === "learn" ? "Learn" : "Exercise";
  return {
    title: `${prefix} · ${stage.title}`,
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
