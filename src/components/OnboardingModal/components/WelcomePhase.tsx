"use client";

import { Button, Spinner, Text, Video } from "@/components/ui";
import { MicrophoneIcon } from "./MicrophoneIcon";
import type { PitchDetectionStatus } from "@/hooks/usePitchDetection";

function getMicDeniedMessage(): string {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS|Chrome/.test(ua);
  const isAndroid = /Android/.test(ua);

  if (isIOS && isSafari) {
    return "Microphone blocked. Tap the aA button in the address bar → Website Settings → allow Microphone, then tap Retry.";
  }
  if (isIOS) {
    // Chrome/Firefox/etc. on iOS
    return "Microphone blocked. Go to Settings → find your browser → enable Microphone, then come back and tap Retry.";
  }
  if (isAndroid) {
    return "Microphone blocked. Tap the lock/tune icon in the address bar → Permissions → allow Microphone, then tap Retry.";
  }
  return "Microphone access was denied. Please enable it in your browser settings and try again.";
}

interface WelcomePhaseProps {
  status: PitchDetectionStatus;
  micError: string | null;
  onStart: () => void;
}

export function WelcomePhase({ status, micError, onStart }: WelcomePhaseProps) {
  const isLoading = status === "requesting-mic" || status === "loading-model";
  const isError = status === "error";
  const isPermissionDenied = micError === "mic-permission-denied";

  const errorMessage = isPermissionDenied ? getMicDeniedMessage() : micError;

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div>
        <Text variant="body" className="font-medium" color="text-1">
          Let&apos;s find your voice
        </Text>
        <Text variant="body-sm" className="mt-1.5 px-2" color="text-2">
          We&apos;ll listen to you hum low and high to map your
          comfortable range. Takes about 10 seconds.
        </Text>
        <Text variant="body-sm" className="mt-2.5 px-2" color="muted-1">
          Relax your body — drop your shoulders, soften your jaw.
          You should never feel strain in your throat.
        </Text>
        <div className="mt-2">
          <Video variant="inline" />
        </div>
      </div>

      {isError && errorMessage && (
        <Text variant="caption" className="px-2" color="error">
          {errorMessage}
        </Text>
      )}

      <Button
        size="lg"
        onClick={onStart}
        disabled={isLoading}
        className="w-full active:scale-[0.98] disabled:opacity-40 disabled:cursor-wait"
        style={isLoading ? { boxShadow: "none" } : undefined}
      >
        {isLoading ? (
          <Text as="span" variant="body" className="flex items-center justify-center gap-2">
            <Spinner />
            {status === "requesting-mic"
              ? "Requesting microphone…"
              : "Loading pitch model…"}
          </Text>
        ) : isError ? (
          <Text as="span" variant="body" className="inline-flex items-center justify-center gap-2">
            <MicrophoneIcon />
            Retry microphone
          </Text>
        ) : (
          <Text as="span" variant="body" className="inline-flex items-center justify-center gap-2">
            <MicrophoneIcon />
            Begin
          </Text>
        )}
      </Button>

      <Text variant="caption" className="leading-relaxed px-2" color="muted-1">
        Microphone used only for real-time pitch detection. Nothing is
        recorded.
      </Text>
    </div>
  );
}
