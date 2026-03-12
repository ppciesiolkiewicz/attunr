"use client";

import { useState, useEffect, useRef } from "react";
import {
  hzToNoteName,
  deriveVoiceType,
  VOICE_TYPES,
} from "@/constants/chakras";
import type { VoiceTypeId } from "@/constants/chakras";
import type { PitchDetectionStatus } from "@/hooks/usePitchDetection";

const HOLD_SECONDS_LOW = 2;
const HOLD_SECONDS_HIGH = 1.5;
const MIN_RANGE_SEMITONES = 10; // below this, assume detection likely wrong
const CHAKRA_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#6366f1",
  "#a855f7",
];

function Spinner() {
  return (
    <svg
      className="spin"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

function MicrophoneIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}

interface NoteSlotProps {
  variant: "low" | "high";
  mode: "detecting" | "detected";
  valueHz: number | null;
  progress?: number;
  currentNote?: string | null;
  currentHz?: number | null;
  onClick?: () => void;
}

function NoteSlot({
  variant,
  mode,
  valueHz,
  progress = 0,
  currentNote,
  currentHz,
  onClick,
}: NoteSlotProps) {
  const isLow = variant === "low";
  const color = isLow ? "#ef8b5a" : "#818cf8";
  const bgColor = isLow ? "rgba(239,139,90,0.12)" : "rgba(129,140,248,0.12)";
  const borderColor = isLow ? "rgba(239,139,90,0.5)" : "rgba(129,140,248,0.5)";
  const label = isLow ? "Low" : "High";

  const baseStyle = {
    backgroundColor: bgColor,
    borderColor,
    borderWidth: 2,
    borderStyle: "solid" as const,
  };

  if (mode === "detecting") {
    return (
      <div className="flex flex-col items-center gap-1.5">
        <div className="relative shrink-0">
          <svg
            width={80}
            height={80}
            viewBox="0 0 80 80"
            className="block"
          >
            <circle
              cx={40}
              cy={40}
              r={34}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={4}
            />
            <circle
              cx={40}
              cy={40}
              r={34}
              fill="none"
              stroke={color}
              strokeWidth={4}
              strokeDasharray={`${2 * Math.PI * 34 * progress} ${2 * Math.PI * 34}`}
              strokeLinecap="round"
              transform="rotate(-90 40 40)"
              style={{ transition: "stroke-dasharray 0.15s" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span
              className="text-xl font-light tabular-nums"
              style={{
                color: currentNote
                  ? "rgba(255,255,255,0.92)"
                  : "rgba(255,255,255,0.25)",
              }}
            >
              {currentNote ?? "—"}
            </span>
            <span
              className="text-xs tabular-nums"
              style={{
                color: currentNote
                  ? "rgba(255,255,255,0.4)"
                  : "rgba(255,255,255,0.15)",
              }}
            >
              {currentHz ? `${Math.round(currentHz)} Hz` : "— Hz"}
            </span>
          </div>
        </div>
        <span className="text-xs text-white/48">{label}</span>
      </div>
    );
  }

  // Detected or placeholder: square
  const isPlaceholder = valueHz === null;
  const squareStyle = isPlaceholder
    ? {
        ...baseStyle,
        borderStyle: "dashed" as const,
        backgroundColor: isLow ? "rgba(239,139,90,0.06)" : "rgba(129,140,248,0.06)",
        borderColor: isLow ? "rgba(239,139,90,0.3)" : "rgba(129,140,248,0.3)",
      }
    : baseStyle;

  const content = (
    <div
      className="rounded-xl flex flex-col items-center justify-center px-5 py-3 min-w-[72px]"
      style={squareStyle}
    >
      <span className="text-lg font-semibold" style={{ color: isPlaceholder ? "rgba(255,255,255,0.35)" : color }}>
        {valueHz ? hzToNoteName(valueHz) : "…"}
      </span>
      <span className="text-xs text-white/48 mt-0.5">
        {valueHz ? `${valueHz} Hz` : ""} · {label}
      </span>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-1.5">
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          className="rounded-xl flex flex-col items-center justify-center px-5 py-3 min-w-[72px] cursor-pointer transition-all hover:brightness-110 active:scale-[0.98]"
          style={squareStyle}
        >
          <span className="text-lg font-semibold" style={{ color: isPlaceholder ? "rgba(255,255,255,0.35)" : color }}>
            {valueHz ? hzToNoteName(valueHz) : "…"}
          </span>
          <span className="text-xs text-white/48 mt-0.5">
            {valueHz ? `${valueHz} Hz` : ""} · {label}
          </span>
        </button>
      ) : (
        content
      )}
    </div>
  );
}

interface OnboardingModalProps {
  pitchHz: number | null;
  status: PitchDetectionStatus;
  onBegin: (result: {
    lowHz: number;
    highHz: number;
    voiceType: VoiceTypeId;
  }) => void;
  onRetryMic: () => void;
}

type Phase = "welcome" | "detect-low" | "detect-high" | "result";

export default function OnboardingModal({
  pitchHz,
  status,
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

  const isLoading = status === "requesting-mic" || status === "loading-model";
  const isError = status === "error";
  const isListening = status === "listening";

  const currentNote = pitchHz !== null ? hzToNoteName(pitchHz) : null;

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
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [phase]);

  // Collect pitch samples and track recency
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
  const isDetecting = phase === "detect-low" || phase === "detect-high";

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
          <h1 className="text-[2.1rem] font-semibold tracking-tight text-white leading-none">
            attunr
          </h1>
          <p className="mt-1.5 text-xs text-white/52 tracking-widest uppercase">
            align your voice
          </p>
        </div>

        <div
          className="w-full h-px"
          style={{ background: "rgba(255,255,255,0.07)" }}
        />

        {/* ── Phase: WELCOME ──────────────────────────────────────────────── */}
        {phase === "welcome" && (
          <div className="flex flex-col items-center gap-4 w-full">
            <div>
              <p className="text-base font-medium text-white/88">
                Let&apos;s find your voice
              </p>
              <p className="text-sm text-white/55 mt-1.5 leading-relaxed px-2">
                We&apos;ll listen to you hum low and high to map your
                comfortable range. Takes about 10 seconds.
              </p>
            </div>

            <button
              onClick={handleStart}
              disabled={isLoading}
              className="w-full py-4 rounded-xl font-medium text-base text-white transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-wait"
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
                boxShadow: isLoading
                  ? "none"
                  : "0 0 24px rgba(124,58,237,0.35), 0 2px 8px rgba(0,0,0,0.4)",
              }}
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
            </button>

            <p className="text-xs text-white/42 leading-relaxed px-2">
              Microphone used only for real-time pitch detection. Nothing is
              recorded.
            </p>
          </div>
        )}

        {/* ── Single flow: DETECT-LOW → DETECT-HIGH → RESULT (with adjust) ─── */}
        {isInFlow && (
          <div className="flex flex-col items-center gap-5 w-full">
            {/* Instruction text — evolves with phase */}
            <div>
              {phase === "detect-low" && (
                <>
                  <p className="text-base font-medium text-white/88">
                    Hum low — uu
                  </p>
                  <p className="text-sm text-white/55 mt-1 leading-relaxed">
                    Feel it in your chest. Hold steady for 2 seconds.
                  </p>
                </>
              )}
              {phase === "detect-high" && (
                <>
                  <p className="text-base font-medium text-white/88">
                    Now hoo hoo — high
                  </p>
                  <p className="text-sm text-white/55 mt-1 leading-relaxed">
                    Feel it in your head and face. Just a moment.
                  </p>
                </>
              )}
              {phase === "result" &&
                detectedLowHz &&
                detectedHighHz &&
                (() => {
                  const voiceType = deriveVoiceType(
                    detectedLowHz,
                    detectedHighHz,
                  );
                  const voiceLabel =
                    VOICE_TYPES.find((v) => v.id === voiceType)?.label ??
                    "Custom";
                  return (
                    <>
                      <p className="text-base font-medium text-white/88">
                        Your vocal range
                      </p>
                      <p className="text-sm text-white/55 mt-1">
                        Likely{" "}
                        <span className="text-white/75 font-medium">
                          {voiceLabel}
                        </span>{" "}
                        · tap a note to re-detect.
                      </p>
                    </>
                  );
                })()}
            </div>

            {/* Slots: always both in same place; circle = detecting, square = detected or placeholder */}
            <div className="w-full flex items-center justify-center gap-4">
              {/* Low slot — circle when detecting, square otherwise */}
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
                  onClick={
                    (phase === "result" || phase === "detect-high")
                      ? () => handleAdjustNote("low")
                      : undefined
                  }
                />
              )}

              {/* Arrow — always visible since both slots always shown */}
              <div className="flex flex-col items-center">
                <span className="text-white/25 text-lg">→</span>
              </div>

              {/* High slot — circle when detecting, square otherwise */}
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
                  onClick={
                    (phase === "result" || phase === "detect-low") && detectedHighHz
                      ? () => handleAdjustNote("high")
                      : undefined
                  }
                />
              )}
            </div>

            {/* Range-too-small warning (result only) */}
            {phase === "result" &&
              detectedLowHz &&
              detectedHighHz &&
              (() => {
                const rangeSemitones =
                  12 * Math.log2(detectedHighHz / detectedLowHz);
                const rangeTooSmall = rangeSemitones < MIN_RANGE_SEMITONES;
                return rangeTooSmall ? (
                  <p className="text-sm text-amber-400/95 leading-relaxed px-2">
                    Range seems narrow — detection may be off. Tap a note above
                    to re-detect, or try again in a quieter space.
                  </p>
                ) : null;
              })()}

            {/* Footer: always visible, button disabled until both notes detected */}
            <div className="w-full min-h-[100px] flex flex-col gap-3">
              <p className="text-sm text-white/48 leading-relaxed px-2">
                Exercises will be tuned to your range. Re-detect anytime in
                settings.
              </p>
              <div
                className="w-full h-px shrink-0"
                style={{ background: "rgba(255,255,255,0.07)" }}
              />
              <button
                onClick={handleFinish}
                disabled={!detectedLowHz || !detectedHighHz}
                className="w-full py-4 rounded-xl font-medium text-base text-white transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background:
                    "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
                  boxShadow:
                    (detectedLowHz && detectedHighHz)
                      ? "0 0 24px rgba(124,58,237,0.35), 0 2px 8px rgba(0,0,0,0.4)"
                      : "none",
                }}
              >
                Let&apos;s go →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
