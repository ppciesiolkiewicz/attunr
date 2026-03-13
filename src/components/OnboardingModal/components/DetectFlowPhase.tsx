"use client";

import { Button } from "@/components/ui";
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
            <p className="text-base font-medium text-white/92">Hum low — uu</p>
            <p className="text-sm text-white/65 mt-1 leading-relaxed">
              Feel it in your chest. Hold steady for 2 seconds.
            </p>
          </>
        )}
        {phase === "detect-high" && (
          <>
            <p className="text-base font-medium text-white/92">Now hoo hoo — high</p>
            <p className="text-sm text-white/65 mt-1 leading-relaxed">
              Feel it in your head and face. Just a moment.
            </p>
          </>
        )}
        {phase === "result" && voiceLabel && (
          <>
            <p className="text-base font-medium text-white/92">Your vocal range</p>
            <p className="text-sm text-white/65 mt-1">
              Likely{" "}
              <span className="text-white/82 font-medium">{voiceLabel}</span>{" "}
              · tap a note to re-detect.
            </p>
          </>
        )}
      </div>

      <div className="w-full flex items-center justify-center gap-4">
        {phase === "detect-low" ? (
          <NoteSlot
            variant="low"
            mode="detecting"
            valueHz={null}
            progress={holdProgress}
            currentNote={currentNote}
            currentHz={pitchHz}
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
          <span className="text-white/35 text-lg">→</span>
        </div>

        {phase === "detect-high" ? (
          <NoteSlot
            variant="high"
            mode="detecting"
            valueHz={null}
            progress={holdProgress}
            currentNote={currentNote}
            currentHz={pitchHz}
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

      {rangeTooSmall && (
        <p className="text-sm text-amber-400/95 leading-relaxed px-2">
          Range seems narrow — detection may be off. Tap a note above
          to re-detect, or try again in a quieter space.
        </p>
      )}

      <div className="w-full min-h-[100px] flex flex-col gap-3">
        <p className="text-sm text-white/58 leading-relaxed px-2">
          Exercises will be tuned to your range. Re-detect anytime in
          settings.
        </p>
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
