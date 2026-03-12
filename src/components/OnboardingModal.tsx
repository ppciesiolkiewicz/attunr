"use client";

import { useState, useEffect, useRef } from "react";
import { hzToNoteName, deriveVoiceType } from "@/constants/chakras";
import type { VoiceTypeId } from "@/constants/chakras";
import type { PitchDetectionStatus } from "@/hooks/usePitchDetection";

const HOLD_SECONDS_LOW = 2;
const HOLD_SECONDS_HIGH = 1.5;
const CHAKRA_COLORS = ["#ef4444","#f97316","#eab308","#22c55e","#3b82f6","#6366f1","#a855f7"];

function Spinner() {
  return (
    <svg className="spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

function MicrophoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}

interface OnboardingModalProps {
  pitchHz: number | null;
  status: PitchDetectionStatus;
  onBegin: (result: { lowHz: number; highHz: number; voiceType: VoiceTypeId }) => void;
  onRetryMic: () => void;
}

type Phase = "welcome" | "detect-low" | "detect-high" | "result";

export default function OnboardingModal({ pitchHz, status, onBegin, onRetryMic }: OnboardingModalProps) {
  const [phase, setPhase] = useState<Phase>("welcome");
  const [holdProgress, setHoldProgress] = useState(0);
  const [detectedLowHz, setDetectedLowHz] = useState<number | null>(null);
  const [detectedHighHz, setDetectedHighHz] = useState<number | null>(null);

  const samplesRef = useRef<number[]>([]);
  const holdTimeRef = useRef(0);
  const lastTickRef = useRef(0);
  const lastPitchTimeRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const isLoading = status === "requesting-mic" || status === "loading-model";
  const isError = status === "error";
  const isListening = status === "listening";

  const currentNote = pitchHz !== null ? hzToNoteName(pitchHz) : null;

  // When mic becomes ready while on welcome, transition to detect-low
  useEffect(() => {
    if (phase === "welcome" && isListening) {
      setPhase("detect-low");
    }
  }, [phase, isListening]);

  // RAF hold-detection loop for both low and high phases
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

      const hasPitch = lastPitchTimeRef.current > 0 && (now - lastPitchTimeRef.current < 200);

      if (hasPitch) {
        holdTimeRef.current += dt;
      } else {
        holdTimeRef.current = Math.max(0, holdTimeRef.current - dt * 2);
      }

      const holdTarget = phase === "detect-low" ? HOLD_SECONDS_LOW : HOLD_SECONDS_HIGH;
      const p = holdTimeRef.current / holdTarget;
      setHoldProgress(Math.min(p, 1));

      if (p >= 1) {
        const buf = samplesRef.current;
        if (buf.length > 0) {
          const sorted = [...buf].sort((a, b) => a - b);
          const median = sorted[Math.floor(sorted.length / 2)];
          
          if (phase === "detect-low") {
            setDetectedLowHz(Math.round(median));
            setPhase("detect-high");
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
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [phase]);

  // Collect pitch samples and track recency
  useEffect(() => {
    if ((phase === "detect-low" || phase === "detect-high") && pitchHz !== null) {
      samplesRef.current.push(pitchHz);
      lastPitchTimeRef.current = performance.now();
    }
  }, [pitchHz, phase]);

  function handleStart() {
    if (isError) {
      onRetryMic();
    } else if (status === "idle") {
      onRetryMic();
    }
    // If already listening, transition happens via the useEffect above
  }

  function handleFinish() {
    if (!detectedLowHz || !detectedHighHz) return;
    const voiceType = deriveVoiceType(detectedLowHz, detectedHighHz);
    onBegin({ lowHz: detectedLowHz, highHz: detectedHighHz, voiceType });
  }

  const isDetecting = phase === "detect-low" || phase === "detect-high";
  const detectingLow = phase === "detect-low";
  const accentColor = detectingLow ? "#ef8b5a" : "#818cf8";
  const accentGlow = detectingLow ? "rgba(239,139,90,0.3)" : "rgba(129,140,248,0.3)";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(5,5,12,0.92)", backdropFilter: "blur(14px)" }}
    >
      <div
        className="fade-in w-full max-w-sm rounded-2xl flex flex-col items-center gap-5 px-7 py-9 text-center"
        style={{
          background: "linear-gradient(160deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.022) 100%)",
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04)",
        }}
      >
        {/* Chakra spectrum */}
        <div className="flex items-center gap-2.5">
          {CHAKRA_COLORS.map((color, i) => (
            <div
              key={i}
              className="rounded-full"
              style={{
                width: 9,
                height: 9,
                backgroundColor: color,
                boxShadow: "0 0 7px " + color + "88",
              }}
            />
          ))}
        </div>

        {/* Wordmark */}
        <div>
          <h1 className="text-[2.1rem] font-semibold tracking-tight text-white leading-none">attunr</h1>
          <p className="mt-1.5 text-xs text-white/52 tracking-widest uppercase">vocal placement trainer</p>
        </div>

        <div className="w-full h-px" style={{ background: "rgba(255,255,255,0.07)" }} />

        {/* ── Phase: WELCOME ──────────────────────────────────────────────── */}
        {phase === "welcome" && (
          <div className="flex flex-col items-center gap-4 w-full">
            <div>
              <p className="text-base font-medium text-white/88">Let&apos;s find your voice</p>
              <p className="text-sm text-white/55 mt-1.5 leading-relaxed px-2">
                We&apos;ll listen to you hum low and high to map your comfortable range. Takes about 10 seconds.
              </p>
            </div>

            <button
              onClick={handleStart}
              disabled={isLoading}
              className="w-full py-4 rounded-xl font-medium text-base text-white transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-wait"
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
                boxShadow: isLoading ? "none" : "0 0 24px rgba(124,58,237,0.35), 0 2px 8px rgba(0,0,0,0.4)",
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner />
                  {status === "requesting-mic" ? "Requesting microphone…" : "Loading pitch model…"}
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
            </button>

            <p className="text-xs text-white/42 leading-relaxed px-2">
              Microphone used only for real-time pitch detection. Nothing is recorded.
            </p>
          </div>
        )}

        {/* ── Phase: DETECT-LOW / DETECT-HIGH ─────────────────────────────── */}
        {isDetecting && (
          <div className="flex flex-col items-center gap-4 w-full">
            {/* Body zone indicator */}
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                background: detectingLow
                  ? "radial-gradient(circle, rgba(239,139,90,0.25) 0%, rgba(239,68,68,0.1) 100%)"
                  : "radial-gradient(circle, rgba(129,140,248,0.25) 0%, rgba(99,102,241,0.1) 100%)",
                border: `2px solid ${accentColor}40`,
                boxShadow: `0 0 20px ${accentGlow}`,
              }}
            >
              <span className="text-2xl">
                {detectingLow ? "🫁" : "🧠"}
              </span>
            </div>

            <div>
              <p className="text-base font-medium text-white/88">
                {detectingLow
                  ? "Hum low and steady"
                  : "Now go high — hoo hoo!"}
              </p>
              <p className="text-sm text-white/55 mt-1 leading-relaxed">
                {detectingLow
                  ? "Feel the vibration in your chest and belly. Hold for 2 seconds."
                  : "Feel it in your head and face. Just a moment."}
              </p>
            </div>

            {/* Hold progress ring */}
            <div className="relative">
              <svg width={80} height={80} viewBox="0 0 80 80">
                <circle
                  cx={40} cy={40} r={34}
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth={4}
                />
                <circle
                  cx={40} cy={40} r={34}
                  fill="none"
                  stroke={accentColor}
                  strokeWidth={4}
                  strokeDasharray={`${2 * Math.PI * 34 * holdProgress} ${2 * Math.PI * 34}`}
                  strokeLinecap="round"
                  transform="rotate(-90 40 40)"
                  style={{ transition: "stroke-dasharray 0.15s" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="text-xl font-light tabular-nums"
                  style={{ color: pitchHz ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.15)" }}
                >
                  {currentNote ?? "—"}
                </span>
                <span
                  className="text-xs tabular-nums"
                  style={{ color: pitchHz ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.1)" }}
                >
                  {pitchHz ? `${Math.round(pitchHz)} Hz` : "— Hz"}
                </span>
              </div>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: detectingLow ? accentColor : "#22c55e",
                  boxShadow: detectingLow ? `0 0 6px ${accentGlow}` : "0 0 6px rgba(34,197,94,0.4)",
                }}
              />
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: phase === "detect-high" ? accentColor : "rgba(255,255,255,0.15)",
                  boxShadow: phase === "detect-high" ? `0 0 6px ${accentGlow}` : "none",
                }}
              />
            </div>

            <p className="text-xs text-white/38">
              Step {detectingLow ? "1" : "2"} of 2
            </p>
          </div>
        )}

        {/* ── Phase: RESULT ───────────────────────────────────────────────── */}
        {phase === "result" && detectedLowHz && detectedHighHz && (
          <div className="flex flex-col items-center gap-5 w-full">
            <div>
              <p className="text-base font-medium text-white/88">Your vocal range</p>
              <p className="text-sm text-white/55 mt-1">Here&apos;s what we heard.</p>
            </div>

            {/* Range display */}
            <div className="w-full flex items-center justify-center gap-4">
              {/* Low */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className="px-5 py-3 rounded-xl border"
                  style={{
                    backgroundColor: "rgba(239,139,90,0.12)",
                    borderColor: "rgba(239,139,90,0.5)",
                  }}
                >
                  <span className="text-lg font-semibold" style={{ color: "#ef8b5a" }}>
                    {hzToNoteName(detectedLowHz)}
                  </span>
                </div>
                <span className="text-xs text-white/48">{detectedLowHz} Hz · Low</span>
              </div>

              {/* Arrow */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-white/25 text-lg">→</span>
              </div>

              {/* High */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className="px-5 py-3 rounded-xl border"
                  style={{
                    backgroundColor: "rgba(129,140,248,0.12)",
                    borderColor: "rgba(129,140,248,0.5)",
                  }}
                >
                  <span className="text-lg font-semibold" style={{ color: "#818cf8" }}>
                    {hzToNoteName(detectedHighHz)}
                  </span>
                </div>
                <span className="text-xs text-white/48">{detectedHighHz} Hz · High</span>
              </div>
            </div>

            <p className="text-sm text-white/48 leading-relaxed px-2">
              Exercises will be tuned to your range. You can always re-detect later in settings.
            </p>

            <div className="w-full h-px" style={{ background: "rgba(255,255,255,0.07)" }} />

            <button
              onClick={handleFinish}
              className="w-full py-4 rounded-xl font-medium text-base text-white transition-all active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
                boxShadow: "0 0 24px rgba(124,58,237,0.35), 0 2px 8px rgba(0,0,0,0.4)",
              }}
            >
              Let&apos;s go →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
