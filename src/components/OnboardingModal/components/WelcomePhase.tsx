"use client";

import { Button, Spinner, VideoPlaceholder } from "@/components/ui";
import { MicrophoneIcon } from "./MicrophoneIcon";
import type { PitchDetectionStatus } from "@/hooks/usePitchDetection";

interface WelcomePhaseProps {
  status: PitchDetectionStatus;
  onStart: () => void;
}

export function WelcomePhase({ status, onStart }: WelcomePhaseProps) {
  const isLoading = status === "requesting-mic" || status === "loading-model";
  const isError = status === "error";

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div>
        <p className="text-base font-medium text-white/92">
          Let&apos;s find your voice
        </p>
        <p className="text-sm text-white/65 mt-1.5 leading-relaxed px-2">
          We&apos;ll listen to you hum low and high to map your
          comfortable range. Takes about 10 seconds.
        </p>
        <p className="text-sm text-white/55 mt-2.5 leading-relaxed px-2">
          Relax your body — drop your shoulders, soften your jaw.
          You should never feel strain in your throat.
        </p>
        <div className="mt-2">
          <VideoPlaceholder variant="inline" />
        </div>
      </div>

      <Button
        size="lg"
        onClick={onStart}
        disabled={isLoading}
        className="w-full active:scale-[0.98] disabled:opacity-40 disabled:cursor-wait"
        style={isLoading ? { boxShadow: "none" } : undefined}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner />
            {status === "requesting-mic"
              ? "Requesting microphone…"
              : "Loading pitch model…"}
          </span>
        ) : isError ? (
          <span className="inline-flex items-center justify-center gap-2">
            <MicrophoneIcon />
            Retry microphone
          </span>
        ) : (
          <span className="inline-flex items-center justify-center gap-2">
            <MicrophoneIcon />
            Begin
          </span>
        )}
      </Button>

      <p className="text-xs text-white/52 leading-relaxed px-2">
        Microphone used only for real-time pitch detection. Nothing is
        recorded.
      </p>
    </div>
  );
}
