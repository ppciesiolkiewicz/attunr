"use client";

import { useState, useEffect, useRef } from "react";
import { VOICE_TYPES } from "@/constants/chakras";
import type { VoiceTypeId } from "@/constants/chakras";
import type { PitchDetectionStatus } from "@/hooks/usePitchDetection";

// ── Voice type auto-detection ─────────────────────────────────────────────────
// Each voice type has a comfortable mid-range hum frequency.
// We sample the detected pitch and pick the nearest voice type.
const VOICE_CENTERS: Record<VoiceTypeId, number> = {
  bass:     115,  // A#2
  baritone: 155,  // D#3
  tenor:    207,  // G#3
  alto:     277,  // C#4
  soprano:  415,  // G#4
  general:  233,  // A#3
};

function detectVoiceType(medianHz: number): VoiceTypeId {
  let best: VoiceTypeId = "tenor";
  let bestDist = Infinity;
  for (const [id, center] of Object.entries(VOICE_CENTERS)) {
    // Log-scale distance is more perceptually accurate for pitch
    const dist = Math.abs(Math.log(medianHz) - Math.log(center));
    if (dist < bestDist) { bestDist = dist; best = id as VoiceTypeId; }
  }
  return best;
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function MicWaveIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="11" rx="3" fill="currentColor" fillOpacity="0.25" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="9" y1="22" x2="15" y2="22" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface OnboardingModalProps {
  pitchHz: number | null;
  status: PitchDetectionStatus;
  onBegin: (voiceId: VoiceTypeId) => void;
}

const CHAKRA_COLORS = ["#ef4444","#f97316","#eab308","#22c55e","#3b82f6","#6366f1","#a855f7"];
/** Minimum samples before showing a suggestion */
const MIN_SAMPLES = 4;

export default function OnboardingModal({ pitchHz, status, onBegin }: OnboardingModalProps) {
  const [selectedVoiceId, setSelectedVoiceId] = useState<VoiceTypeId>("tenor");
  const [suggestedVoiceId, setSuggestedVoiceId] = useState<VoiceTypeId | null>(null);
  const [sampleCount, setSampleCount] = useState(0);

  const sampleBufferRef = useRef<number[]>([]);
  const userPickedRef = useRef(false);

  // ── Collect pitch samples, update suggestion ──────────────────────────────
  useEffect(() => {
    if (pitchHz === null) return;

    const buf = sampleBufferRef.current;
    buf.push(pitchHz);
    if (buf.length > 30) buf.shift();
    setSampleCount(buf.length);

    if (buf.length >= MIN_SAMPLES) {
      const sorted = [...buf].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      const detected = detectVoiceType(median);
      setSuggestedVoiceId(detected);
      // Auto-follow detection until user manually picks
      if (!userPickedRef.current) setSelectedVoiceId(detected);
    }
  }, [pitchHz]);

  function handlePick(id: VoiceTypeId) {
    userPickedRef.current = true;
    setSelectedVoiceId(id);
  }

  const isListening = status === "listening";
  const isLoading = status === "requesting-mic" || status === "loading-model";
  const isError = status === "error";

  const hasSuggestion = suggestedVoiceId !== null && sampleCount >= MIN_SAMPLES;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(5,5,12,0.88)", backdropFilter: "blur(14px)" }}
    >
      <div
        className="fade-in w-full max-w-sm rounded-2xl flex flex-col items-center gap-5 px-7 py-9 text-center"
        style={{
          background: "linear-gradient(160deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.022) 100%)",
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04)",
        }}
      >
        {/* Chakra spectrum dots */}
        <div className="flex items-center gap-2.5">
          {CHAKRA_COLORS.map((color, i) => (
            <div
              key={i}
              className="rounded-full"
              style={{ width: 9, height: 9, backgroundColor: color, boxShadow: `0 0 7px ${color}88` }}
            />
          ))}
        </div>

        {/* Wordmark */}
        <div>
          <h1 className="text-[2.2rem] font-semibold tracking-tight text-white leading-none">attunr</h1>
          <p className="mt-1.5 text-xs text-white/35 tracking-wide uppercase">chakra frequency trainer</p>
        </div>

        {/* Divider */}
        <div className="w-full h-px" style={{ background: "rgba(255,255,255,0.07)" }} />

        {/* Voice detection section */}
        <div className="flex flex-col items-center gap-4 w-full">
          <div>
            <p className="text-sm font-medium text-white/80">
              Hum any comfortable note
            </p>
            <p className="text-xs text-white/35 mt-1">
              We&apos;ll suggest a voice type that fits your range.
            </p>
          </div>

          {/* Live pitch display */}
          <div
            className="flex items-center justify-center gap-2 rounded-xl px-5 py-3 w-full"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            {isLoading ? (
              <div className="flex items-center gap-2 text-white/35">
                <Spinner />
                <span className="text-xs">
                  {status === "requesting-mic" ? "Requesting microphone…" : "Loading pitch model…"}
                </span>
              </div>
            ) : isError ? (
              <span className="text-xs text-red-400">Couldn&apos;t access microphone. Check your browser settings.</span>
            ) : pitchHz !== null ? (
              <div className="flex items-center gap-3">
                <span
                  className="text-2xl font-light tabular-nums tracking-tight text-white"
                >
                  {Math.round(pitchHz)} Hz
                </span>
                <div className="flex items-center gap-1 text-violet-400">
                  <MicWaveIcon />
                </div>
              </div>
            ) : isListening ? (
              <div className="flex items-center gap-2 text-white/30">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                <span className="text-xs">Listening — hum a note</span>
              </div>
            ) : (
              <span className="text-xs text-white/25">Starting microphone…</span>
            )}
          </div>

          {/* Voice type pills */}
          <div className="flex flex-col items-center gap-2 w-full">
            <div className="flex flex-wrap justify-center gap-1.5">
              {VOICE_TYPES.map((v) => {
                const isSelected = selectedVoiceId === v.id;
                const isSuggested = suggestedVoiceId === v.id && !userPickedRef.current && hasSuggestion;
                return (
                  <button
                    key={v.id}
                    onClick={() => handlePick(v.id)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-medium transition-all border"
                    style={{
                      backgroundColor: isSelected ? "rgba(124,58,237,0.25)" : "rgba(255,255,255,0.04)",
                      borderColor: isSelected ? "rgba(124,58,237,0.8)" : "rgba(255,255,255,0.1)",
                      color: isSelected ? "#c4b5fd" : "rgba(255,255,255,0.45)",
                      boxShadow: isSelected ? "0 0 10px rgba(124,58,237,0.3)" : "none",
                    }}
                  >
                    {v.label}
                    {isSuggested && (
                      <span className="ml-1 text-[9px] text-violet-400 opacity-75">✦</span>
                    )}
                  </button>
                );
              })}
            </div>
            {hasSuggestion && !userPickedRef.current && (
              <p className="text-[10px] text-violet-400/60 fade-in">
                Detected — tap to change
              </p>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px" style={{ background: "rgba(255,255,255,0.07)" }} />

        {/* CTA */}
        <div className="flex flex-col items-center gap-2.5 w-full">
          <button
            onClick={() => onBegin(selectedVoiceId)}
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl font-medium text-sm text-white transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-wait"
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
                {status === "loading-model" ? "Loading pitch model…" : "Starting…"}
              </span>
            ) : (
              "Let's go →"
            )}
          </button>

          <p className="text-[10px] text-white/20 leading-relaxed px-2">
            Your microphone is used only for real-time pitch detection.
            Nothing is recorded or stored.
          </p>
        </div>
      </div>
    </div>
  );
}
