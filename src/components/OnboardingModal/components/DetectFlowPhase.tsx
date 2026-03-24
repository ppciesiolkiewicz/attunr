"use client";

import { Button, Text } from "@/components/ui";
import { deriveVoiceType } from "@/lib/pitch";
import { VOICE_TYPES } from "@/constants/voice-types";
import { NoteSlot } from "./NoteSlot";

const MIN_RANGE_SEMITONES = 10;

type Phase = "detect-low" | "detect-high" | "result";

interface DetectFlowPhaseProps {
  phase: Phase;
  detectedLowHz: number | null;
  detectedHighHz: number | null;
  holdProgress: number;
  currentNote: string | null;
  pitchHz: number | null;
  activeDetection: boolean;
  onStartDetection: () => void;
  onAdjustNote: (which: "low" | "high") => void;
  onFinish: () => void;
}

export function DetectFlowPhase({
  phase,
  detectedLowHz,
  detectedHighHz,
  holdProgress,
  currentNote,
  pitchHz,
  activeDetection,
  onStartDetection,
  onAdjustNote,
  onFinish,
}: DetectFlowPhaseProps) {
  const rangeTooSmall =
    phase === "result" &&
    detectedLowHz &&
    detectedHighHz &&
    12 * Math.log2(detectedHighHz / detectedLowHz) < MIN_RANGE_SEMITONES;

  const voiceLabel =
    phase === "result" && detectedLowHz && detectedHighHz
      ? VOICE_TYPES.find((v) => v.id === deriveVoiceType(detectedLowHz, detectedHighHz))?.label ?? "Custom"
      : null;

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <div>
        {phase === "detect-low" && (
          <>
            <Text variant="heading-sm" color="text-1">Hum low — uu</Text>
            <Text variant="body" className="mt-1.5" color="text-1">
              Let the sound come from deep in your belly.
              Feel the vibration in your chest, not your throat.
              {activeDetection ? " Hold steady." : ""}
            </Text>
          </>
        )}
        {phase === "detect-high" && (
          <>
            <Text variant="heading-sm" color="text-1">Now hoo hoo — high</Text>
            <Text variant="body" className="mt-1.5" color="text-1">
              Make a short rising <Text as="span" variant="body" className="italic" color="text-1">hoo hoo</Text> sound — like an owl.
              {activeDetection ? " Hold your highest note." : ""}
            </Text>
          </>
        )}
        {phase === "result" && voiceLabel && (
          <>
            <Text variant="body" className="font-medium" color="text-1">Your vocal range</Text>
            <Text variant="body-sm" className="mt-1" color="text-2">
              Likely{" "}
              <Text as="span" variant="body-sm" className="font-medium" color="text-1">{voiceLabel}</Text>{" "}
              · tap a note to re-detect.
            </Text>
          </>
        )}
      </div>

      <div className="w-full flex items-center justify-center gap-4">
        {phase === "detect-low" ? (
          <NoteSlot
            variant="low"
            mode={activeDetection ? "detecting" : "ready"}
            valueHz={null}
            progress={holdProgress}
            currentNote={currentNote}
            currentHz={pitchHz}
            onClick={!activeDetection ? onStartDetection : undefined}
          />
        ) : (
          <NoteSlot
            variant="low"
            mode="detected"
            valueHz={detectedLowHz}
            onClick={(phase === "result" || phase === "detect-high") ? () => onAdjustNote("low") : undefined}
          />
        )}

        <div className="flex flex-col items-center">
          <Text as="span" variant="body" className="text-lg" color="muted-2">→</Text>
        </div>

        {phase === "detect-high" ? (
          <NoteSlot
            variant="high"
            mode={activeDetection ? "detecting" : "ready"}
            valueHz={null}
            progress={holdProgress}
            currentNote={currentNote}
            currentHz={pitchHz}
            onClick={!activeDetection ? onStartDetection : undefined}
          />
        ) : (
          <NoteSlot
            variant="high"
            mode="detected"
            valueHz={detectedHighHz}
            onClick={(phase === "result" || phase === "detect-low") && detectedHighHz ? () => onAdjustNote("high") : undefined}
          />
        )}
      </div>

      {(phase === "detect-low" || phase === "detect-high") && !activeDetection && (
        <Text variant="body-sm" color="muted-2">
          Tap start when you&apos;re ready
        </Text>
      )}

      {rangeTooSmall && (
        <Text variant="body-sm" className="px-2" color="warning">
          Range seems narrow — detection may be off. Tap a note above
          to re-detect, or try again in a quieter space.
        </Text>
      )}

      <div className="w-full min-h-25 flex flex-col gap-3">
        <Text variant="body-sm" className="px-2" color="muted-1">
          Exercises will be tuned to your range. Re-detect anytime in
          settings.
        </Text>
        <div
          className="w-full h-px shrink-0"
          style={{ background: "rgba(255,255,255,0.07)" }}
        />
        <Button
          size="lg"
          onClick={onFinish}
          disabled={!detectedLowHz || !detectedHighHz}
          className="w-full active:scale-[0.98] disabled:opacity-40"
          style={detectedLowHz && detectedHighHz ? undefined : { boxShadow: "none" }}
        >
          Let&apos;s go →
        </Button>
      </div>
    </div>
  );
}
