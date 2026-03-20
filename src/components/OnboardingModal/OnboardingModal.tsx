"use client";

import { useState, useEffect, useRef } from "react";
import { deriveVoiceType, hzToNoteName } from "@/lib/pitch";
import type { VoiceTypeId } from "@/constants/voice-types";
import type { PitchDetectionStatus } from "@/hooks/usePitchDetection";
import { Text } from "@/components/ui";
import { analytics } from "@/lib/analytics";
import { ToneSpectrum } from "./components/ToneSpectrum";
import { WelcomePhase } from "./components/WelcomePhase";
import { DetectFlowPhase } from "./components/DetectFlowPhase";

const HOLD_SECONDS_LOW = 2;
const HOLD_SECONDS_HIGH = 1.5;

type Phase = "welcome" | "detect-low" | "detect-high" | "result";

export interface OnboardingModalProps {
  pitchHz: number | null;
  status: PitchDetectionStatus;
  micError: string | null;
  onBegin: (result: {
    lowHz: number;
    highHz: number;
    voiceType: VoiceTypeId;
  }) => void;
  onRetryMic: () => void;
}

export default function OnboardingModal({
  pitchHz,
  status,
  micError,
  onBegin,
  onRetryMic,
}: OnboardingModalProps) {
  const [phase, setPhase] = useState<Phase>("welcome");
  const [holdProgress, setHoldProgress] = useState(0);
  const [detectedLowHz, setDetectedLowHz] = useState<number | null>(null);
  const [detectedHighHz, setDetectedHighHz] = useState<number | null>(null);

  const samplesRef = useRef<number[]>([]);
  const holdTimeRef = useRef(0);
  const lastTickRef = useRef(0);
  const lastPitchTimeRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const detectedHighHzRef = useRef(detectedHighHz);
  detectedHighHzRef.current = detectedHighHz;

  const isError = status === "error";
  const isListening = status === "listening";
  const currentNote = pitchHz !== null ? hzToNoteName(pitchHz) : null;

  useEffect(() => {
    if (phase === "detect-low") {
      analytics.onboardingStarted();
    }
    if (phase !== "welcome") {
      analytics.onboardingPhaseChanged(phase);
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== "detect-low" && phase !== "detect-high") {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    holdTimeRef.current = 0;
    lastTickRef.current = 0;
    lastPitchTimeRef.current = 0;
    samplesRef.current = [];
    setHoldProgress(0);

    function tick() {
      const now = performance.now();
      const dt = lastTickRef.current ? (now - lastTickRef.current) / 1000 : 0;
      lastTickRef.current = now;

      const hasPitch =
        lastPitchTimeRef.current > 0 && now - lastPitchTimeRef.current < 200;

      if (hasPitch) {
        holdTimeRef.current += dt;
      } else {
        holdTimeRef.current = Math.max(0, holdTimeRef.current - dt * 2);
      }

      const holdTarget =
        phase === "detect-low" ? HOLD_SECONDS_LOW : HOLD_SECONDS_HIGH;
      const p = holdTimeRef.current / holdTarget;
      setHoldProgress(Math.min(p, 1));

      if (p >= 1) {
        const buf = samplesRef.current;
        if (buf.length > 0) {
          const sorted = [...buf].sort((a, b) => a - b);
          const median = sorted[Math.floor(sorted.length / 2)];

          if (phase === "detect-low") {
            setDetectedLowHz(Math.round(median));
            setPhase(detectedHighHzRef.current !== null ? "result" : "detect-high");
          } else {
            setDetectedHighHz(Math.round(median));
            setPhase("result");
          }
        }
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [phase]);

  useEffect(() => {
    if (
      (phase === "detect-low" || phase === "detect-high") &&
      pitchHz !== null
    ) {
      samplesRef.current.push(pitchHz);
      lastPitchTimeRef.current = performance.now();
    }
  }, [pitchHz, phase]);

  function handleStart() {
    if (isError || status === "idle") {
      onRetryMic();
    } else if (isListening) {
      setPhase("detect-low");
    }
  }

  function handleFinish() {
    if (!detectedLowHz || !detectedHighHz) return;
    const voiceType = deriveVoiceType(detectedLowHz, detectedHighHz);
    onBegin({ lowHz: detectedLowHz, highHz: detectedHighHz, voiceType });
  }

  function handleAdjustNote(which: "low" | "high") {
    if (which === "low") {
      setDetectedLowHz(null);
      setPhase("detect-low");
    } else {
      setDetectedHighHz(null);
      setPhase("detect-high");
    }
  }

  const isInFlow = phase !== "welcome";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(5,5,12,0.92)",
        backdropFilter: "blur(14px)",
      }}
    >
      <div
        className="fade-in w-full max-w-sm rounded-2xl flex flex-col items-center gap-5 px-7 py-9 text-center"
        style={{
          background:
            "linear-gradient(160deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.022) 100%)",
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow:
            "0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04)",
        }}
      >
        <ToneSpectrum />

        <div>
          <Text variant="heading-lg" className="text-[2.1rem] tracking-tight leading-none">
            attunr
          </Text>
          <Text variant="label" className="mt-1.5" color="muted-1">
            align your voice
          </Text>
        </div>

        <div
          className="w-full h-px"
          style={{ background: "rgba(255,255,255,0.07)" }}
        />

        {phase === "welcome" && (
          <WelcomePhase status={status} micError={micError} onStart={handleStart} />
        )}

        {isInFlow && (
          <DetectFlowPhase
            phase={phase}
            detectedLowHz={detectedLowHz}
            detectedHighHz={detectedHighHz}
            holdProgress={holdProgress}
            currentNote={currentNote}
            pitchHz={pitchHz}
            onAdjustNote={handleAdjustNote}
            onFinish={handleFinish}
          />
        )}
      </div>
    </div>
  );
}
