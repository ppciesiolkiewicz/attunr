import { Text } from "@/components/ui";

interface CongratsOverlayProps {
  show: boolean;
}

export function CongratsOverlay({ show }: CongratsOverlayProps) {
  if (!show) return null;
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
      <div className="congrats-appear flex flex-col items-center gap-2">
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-violet-600/25 drop-shadow-lg">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <Text variant="heading-sm" className="text-violet-300">Congratulations!</Text>
      </div>
    </div>
  );
}
