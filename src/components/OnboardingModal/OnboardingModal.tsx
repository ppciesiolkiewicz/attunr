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
const PEAK_HOLD_SECONDS = 1;
const PEAK_TOLERANCE_SEMITONES = 2;

type Phase = "welcome" | "detect-low" | "detect-high" | "result";

export interface OnboardingModalProps {
  pitchHz: number | null;
  pitchHzRef: React.RefObject<number | null>;
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
  pitchHzRef,
  status,
  micError,
  onBegin,
  onRetryMic,
}: OnboardingModalProps) {
  const [phase, setPhase] = useState<Phase>("welcome");
  const [holdProgress, setHoldProgress] = useState(0);
  const [detectedLowHz, setDetectedLowHz] = useState<number | null>(null);
  const [detectedHighHz, setDetectedHighHz] = useState<number | null>(null);
  const [activeDetection, setActiveDetection] = useState(false);
  const samplesRef = useRef<number[]>([]);
  const holdTimeRef = useRef(0);
  const lastTickRef = useRef(0);
  const lastPitchTimeRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const detectedHighHzRef = useRef(detectedHighHz);
  const peakHzRef = useRef(0);
  const currentPitchRef = useRef<number | null>(null);

  const isError = status === "error";
  const currentNote = pitchHz !== null ? hzToNoteName(pitchHz) : null;

  const phaseRef = useRef(phase);
  const detectedLowHzRef = useRef(detectedLowHz);
  const completedRef = useRef(false);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    detectedLowHzRef.current = detectedLowHz;
  }, [detectedLowHz]);

  useEffect(() => {
    const completed = completedRef;
    const phase = phaseRef;
    const lowHz = detectedLowHzRef;
    return () => {
      if (!completed.current && phase.current !== "welcome") {
        analytics.onboardingAbandoned(
          phase.current,
          lowHz.current ?? undefined,
          undefined,
        );
      }
    };
  }, []);

  const prevStatusRef = useRef(status);
  useEffect(() => {
    if (prevStatusRef.current !== "listening" && status === "listening") {
      analytics.onboardingMicGranted();
    }
    prevStatusRef.current = status;
  }, [status]);

  useEffect(() => {
    if (phase === "detect-low") {
      analytics.onboardingStarted();
    }
  }, [phase]);

  // Reset activeDetection when phase changes
  useEffect(() => {
    setActiveDetection(false);
  }, [phase]);

  useEffect(() => {
    if (
      !activeDetection ||
      (phase !== "detect-low" && phase !== "detect-high")
    ) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    holdTimeRef.current = 0;
    lastTickRef.current = 0;
    lastPitchTimeRef.current = 0;
    samplesRef.current = [];
    peakHzRef.current = 0;
    setHoldProgress(0);

    function tick() {
      const now = performance.now();
      const dt = lastTickRef.current ? (now - lastTickRef.current) / 1000 : 0;
      lastTickRef.current = now;

      // Use the synchronous ref for immediate pitch presence (no React throttle delay)
      const hasPitch = pitchHzRef.current !== null;

      // Collect samples directly from the ref (bypasses React throttle)
      if (hasPitch && pitchHzRef.current !== null) {
        samplesRef.current.push(pitchHzRef.current);
      }

      if (phase === "detect-low") {
        // Low note: hold steady for HOLD_SECONDS_LOW
        if (hasPitch) {
          holdTimeRef.current += dt;
        } else {
          holdTimeRef.current = Math.max(0, holdTimeRef.current - dt * 2);
        }

        const p = holdTimeRef.current / HOLD_SECONDS_LOW;
        setHoldProgress(Math.min(p, 1));

        if (p >= 1) {
          const buf = samplesRef.current;
          if (buf.length > 0) {
            const sorted = [...buf].sort((a, b) => a - b);
            const median = sorted[Math.floor(sorted.length / 2)];
            const lowHz = Math.round(median);
            setDetectedLowHz(lowHz);
            analytics.onboardingLowDetected(lowHz, hzToNoteName(lowHz));
            setPhase(
              detectedHighHzRef.current !== null ? "result" : "detect-high",
            );
          }
          return;
        }
      } else {
        // High note: track the highest pitch held for PEAK_HOLD_SECONDS
        const pitch = pitchHzRef.current;

        if (hasPitch && pitch !== null) {
          // Update peak — always drift upward
          peakHzRef.current = Math.max(peakHzRef.current, pitch);

          // Check if current pitch is within tolerance of peak
          const semisFromPeak =
            peakHzRef.current > 0
              ? 12 * Math.abs(Math.log2(pitch / peakHzRef.current))
              : Infinity;

          if (semisFromPeak <= PEAK_TOLERANCE_SEMITONES) {
            holdTimeRef.current += dt;
          } else {
            holdTimeRef.current = Math.max(0, holdTimeRef.current - dt * 2);
          }
        } else {
          holdTimeRef.current = Math.max(0, holdTimeRef.current - dt * 2);
        }

        // Slowly lower peak when not sustaining (forgives brief dips)
        if (holdTimeRef.current <= 0 && peakHzRef.current > 0) {
          peakHzRef.current *= 1 - dt * 0.3;
        }

        const p = holdTimeRef.current / PEAK_HOLD_SECONDS;
        setHoldProgress(Math.min(p, 1));

        if (p >= 1 && peakHzRef.current > 0) {
          const highHz = Math.round(peakHzRef.current);
          setDetectedHighHz(highHz);
          analytics.onboardingHighDetected(highHz, hzToNoteName(highHz));
          setPhase("result");
          return;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [phase, activeDetection]);

  useEffect(() => {
    currentPitchRef.current = pitchHz;
    if (
      activeDetection &&
      (phase === "detect-low" || phase === "detect-high") &&
      pitchHz !== null
    ) {
      samplesRef.current.push(pitchHz);
      lastPitchTimeRef.current = performance.now();
    }
  }, [pitchHz, phase, activeDetection]);

  const [waitingForMic, setWaitingForMic] = useState(false);

  function handleStart() {
    if (isError || status === "idle") {
      onRetryMic();
      setWaitingForMic(true);
      // Stay on welcome screen — WelcomePhase shows "Loading pitch model..."
      return;
    }
    setPhase("detect-low");
  }

  // Advance to detect-low once mic + model are ready (user already tapped Begin)
  useEffect(() => {
    if (waitingForMic && status === "listening") {
      setWaitingForMic(false);
      setPhase("detect-low");
    }
  }, [waitingForMic, status]);

  function handleStartDetection() {
    setActiveDetection(true);
  }

  function handleFinish() {
    if (!detectedLowHz || !detectedHighHz) return;
    completedRef.current = true;
    const voiceType = deriveVoiceType(detectedLowHz, detectedHighHz);
    onBegin({ lowHz: detectedLowHz, highHz: detectedHighHz, voiceType });
  }

  function handleAdjustNote(which: "low" | "high") {
    if (which === "low") {
      if (detectedLowHz) {
        analytics.onboardingNoteReadjusted(
          "low",
          detectedLowHz,
          hzToNoteName(detectedLowHz),
        );
      }
      setDetectedLowHz(null);
      setPhase("detect-low");
    } else {
      if (detectedHighHz) {
        analytics.onboardingNoteReadjusted(
          "high",
          detectedHighHz,
          hzToNoteName(detectedHighHz),
        );
      }
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
          <Text
            variant="heading-lg"
            className="text-[2.1rem] tracking-tight leading-none"
          >
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
          <WelcomePhase
            status={status}
            micError={micError}
            onStart={handleStart}
          />
        )}

        {isInFlow && (
          <DetectFlowPhase
            phase={phase}
            detectedLowHz={detectedLowHz}
            detectedHighHz={detectedHighHz}
            holdProgress={holdProgress}
            currentNote={currentNote}
            pitchHz={pitchHz}
            activeDetection={activeDetection}
            onStartDetection={handleStartDetection}
            onAdjustNote={handleAdjustNote}
            onFinish={handleFinish}
          />
        )}
      </div>
    </div>
  );
}
