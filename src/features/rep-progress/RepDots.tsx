import { Text } from "@/components/ui";

interface RepDotsProps {
  totalReps: number;
  currentRep: number;
  isComplete: boolean;
}

export function RepDots({ totalReps, currentRep, isComplete }: RepDotsProps) {
  if (totalReps <= 1) return null;
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: totalReps }, (_, i) => (
        <div
          key={i}
          className={`hidden sm:block w-2 h-2 rounded-full transition-colors duration-300 ${
            i < currentRep
              ? "bg-violet-400"
              : i === currentRep && !isComplete
                ? "bg-violet-400/50"
                : "bg-white/15"
          }`}
        />
      ))}
      <Text variant="caption" color="muted-1" className="ml-0.5 tabular-nums">
        {currentRep}/{totalReps}
      </Text>
    </div>
  );
}
