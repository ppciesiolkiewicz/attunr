import { Text } from "@/components/ui";

interface StepCheckOverlayProps {
  show: boolean;
  phrase: string;
  round: number;
  totalReps: number;
}

export function StepCheckOverlay({ show, phrase, round, totalReps }: StepCheckOverlayProps) {
  if (!show) return null;
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
      <div className="step-check-appear flex flex-col items-center gap-2">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-violet-600/25 drop-shadow-lg">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <Text variant="body" className="text-violet-300 font-medium">{phrase}</Text>
        <Text variant="caption" color="muted-1">Round {round}/{totalReps}</Text>
      </div>
    </div>
  );
}
