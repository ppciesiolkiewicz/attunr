"use client";

import { useState, useEffect, useRef } from "react";
import { VOICE_TYPES } from "@/constants/chakras";
import type { VoiceTypeId } from "@/constants/chakras";
import type { PitchDetectionStatus } from "@/hooks/usePitchDetection";

// ── Music theory helpers ──────────────────────────────────────────────────────
const NOTE_NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

function hzToNoteName(hz: number): string {
  const midi = Math.round(12 * Math.log2(hz / 440) + 69);
  const name = NOTE_NAMES[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${name}${octave}`;
}

// Comfortable mid-range MIDI note for each voice type
// (the note someone naturally hums when asked to "sing something easy")
const VOICE_MIDI_CENTERS: Record<VoiceTypeId, number> = {
  bass:     46,  // Bb2 · ~116 Hz
  baritone: 50,  // D3  · ~147 Hz
  tenor:    55,  // G3  · ~196 Hz
  alto:     62,  // D4  · ~294 Hz
  soprano:  69,  // A4  · ~440 Hz
} as const;

function detectVoiceType(medianHz: number): VoiceTypeId {
  const medianMidi = 12 * Math.log2(medianHz / 440) + 69;
  let best: VoiceTypeId = "tenor";
  let bestDist = Infinity;
  for (const [id, center] of Object.entries(VOICE_MIDI_CENTERS)) {
    const dist = Math.abs(center - medianMidi);
    if (dist < bestDist) { bestDist = dist; best = id as VoiceTypeId; }
  }
  return best;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const DETECTION_MS = 5000;
const DETECTION_STEPS = 10;
const CHAKRA_COLORS = ["#ef4444","#f97316","#eab308","#22c55e","#3b82f6","#6366f1","#a855f7"];

// ── Icons ─────────────────────────────────────────────────────────────────────
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

// ── Props ─────────────────────────────────────────────────────────────────────
interface OnboardingModalProps {
  pitchHz: number | null;
  status: PitchDetectionStatus;
  onBegin: (voiceId: VoiceTypeId) => void;
}

type Phase = "select" | "detecting" | "detected";

export default function OnboardingModal({ pitchHz, status, onBegin }: OnboardingModalProps) {
  const [phase, setPhase] = useState<Phase>("select");
  const [selectedVoiceId, setSelectedVoiceId] = useState<VoiceTypeId>("tenor");
  const [detectedVoiceId, setDetectedVoiceId] = useState<VoiceTypeId | null>(null);
  const [progress, setProgress] = useState(0); // 0–DETECTION_STEPS

  const samplesRef = useRef<number[]>([]);
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  const isLoading = status === "requesting-mic" || status === "loading-model";
  const isError = status === "error";
  const isListening = status === "listening";

  // ── Detection timer via RAF ───────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "detecting") {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    startTimeRef.current = performance.now();
    samplesRef.current = [];

    function tick() {
      const elapsed = performance.now() - startTimeRef.current;
      const step = Math.min(
        Math.floor((elapsed / DETECTION_MS) * DETECTION_STEPS),
        DETECTION_STEPS
      );
      setProgress(step);

      if (elapsed >= DETECTION_MS) {
        // Finalise detection
        const buf = samplesRef.current;
        if (buf.length > 0) {
          const sorted = [...buf].sort((a, b) => a - b);
          const median = sorted[Math.floor(sorted.length / 2)];
          const detected = detectVoiceType(median);
          setDetectedVoiceId(detected);
          setSelectedVoiceId(detected);
        }
        setPhase("detected");
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [phase]);

  // Collect pitch samples during detection
  useEffect(() => {
    if (phase === "detecting" && pitchHz !== null) {
      samplesRef.current.push(pitchHz);
    }
  }, [pitchHz, phase]);

  function startDetection() {
    samplesRef.current = [];
    setProgress(0);
    setPhase("detecting");
  }

  function cancelDetection() {
    setPhase("select");
    setProgress(0);
  }

  // Current note name (shown live during detection)
  const currentNote = pitchHz !== null ? hzToNoteName(pitchHz) : null;
  const liveVoiceType = pitchHz !== null
    ? VOICE_TYPES.find(v => v.id === detectVoiceType(pitchHz))?.label
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(5,5,12,0.9)", backdropFilter: "blur(14px)" }}
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
            <div key={i} className="rounded-full"
              style={{ width: 9, height: 9, backgroundColor: color, boxShadow: `0 0 7px ${color}88` }} />
          ))}
        </div>

        {/* Wordmark */}
        <div>
          <h1 className="text-[2.1rem] font-semibold tracking-tight text-white leading-none">attunr</h1>
          <p className="mt-1.5 text-xs text-white/52 tracking-widest uppercase">chakra frequency trainer</p>
        </div>

        <div className="w-full h-px" style={{ background: "rgba(255,255,255,0.07)" }} />

        {/* ── Phase: SELECT ─────────────────────────────────────────────────── */}
        {phase === "select" && (
          <div className="flex flex-col items-center gap-4 w-full">
            <div>
              <p className="text-base font-medium text-white/88">What&apos;s your voice type?</p>
              <p className="text-sm text-white/55 mt-1">Choose one, or let us detect it for you.</p>
            </div>

            {/* Voice type pills — 3 + 2 layout */}
            <div className="flex flex-col items-center gap-1.5 w-full">
              {[VOICE_TYPES.slice(0, 3), VOICE_TYPES.slice(3)].map((row, ri) => (
                <div key={ri} className="flex justify-center gap-1.5">
                  {row.map((v) => (
                    <button key={v.id} onClick={() => setSelectedVoiceId(v.id)}
                      className="px-4 py-2 rounded-full text-sm font-medium transition-all border"
                      style={{
                        backgroundColor: selectedVoiceId === v.id ? "rgba(124,58,237,0.25)" : "rgba(255,255,255,0.04)",
                        borderColor: selectedVoiceId === v.id ? "rgba(124,58,237,0.8)" : "rgba(255,255,255,0.1)",
                        color: selectedVoiceId === v.id ? "#c4b5fd" : "rgba(255,255,255,0.45)",
                        boxShadow: selectedVoiceId === v.id ? "0 0 10px rgba(124,58,237,0.3)" : "none",
                      }}>
                      {v.label}
                    </button>
                  ))}
                </div>
              ))}
            </div>

            {/* Detect button */}
            <div className="flex items-center gap-3 w-full">
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
              <span className="text-xs text-white/42">or</span>
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
            </div>

            <button
              onClick={startDetection}
              disabled={!isListening}
              className="w-full py-3 rounded-xl text-base font-medium border transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                borderColor: "rgba(124,58,237,0.45)",
                color: "#a78bfa",
                backgroundColor: "rgba(124,58,237,0.08)",
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner />
                  {status === "requesting-mic" ? "Requesting microphone…" : "Loading pitch model…"}
                </span>
              ) : isError ? (
                "Microphone unavailable"
              ) : (
                <span className="inline-flex items-center justify-center gap-2">
                  <MicrophoneIcon />
                  Detect my voice type
                </span>
              )}
            </button>
          </div>
        )}

        {/* ── Phase: DETECTING ──────────────────────────────────────────────── */}
        {phase === "detecting" && (
          <div className="flex flex-col items-center gap-4 w-full">
            <div>
              <p className="text-base font-medium text-white/88">Sing comfortably for a few seconds…</p>
              <p className="text-sm text-white/55 mt-1">Any note that feels easy and natural.</p>
            </div>

            {/* Progress dots */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: DETECTION_STEPS }).map((_, i) => (
                <div key={i} className="rounded-full transition-all"
                  style={{
                    width: i < progress ? 8 : 6,
                    height: i < progress ? 8 : 6,
                    backgroundColor: i < progress ? "#7c3aed" : "rgba(255,255,255,0.12)",
                    boxShadow: i < progress ? "0 0 6px rgba(124,58,237,0.6)" : "none",
                  }} />
              ))}
            </div>

            {/* Live note display */}
            <div className="flex flex-col items-center gap-1 py-2">
              <span className="text-4xl font-light tracking-tight"
                style={{ color: pitchHz !== null ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.1)" }}>
                {currentNote ?? "—"}
              </span>
              <span className="text-sm tabular-nums"
                style={{ color: pitchHz !== null ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.1)" }}>
                {pitchHz !== null ? `${Math.round(pitchHz)} Hz` : "— Hz"}
              </span>
              {liveVoiceType && (
                <span className="text-sm text-violet-400/82 mt-1 fade-in">
                  → {liveVoiceType}
                </span>
              )}
            </div>

            <button onClick={cancelDetection}
              className="text-sm text-white/45 hover:text-white/72 transition-colors">
              Cancel
            </button>
          </div>
        )}

        {/* ── Phase: DETECTED ───────────────────────────────────────────────── */}
        {phase === "detected" && (
          <div className="flex flex-col items-center gap-4 w-full">
            <div>
              <p className="text-base font-medium text-white/88">Sounds like you&apos;re a…</p>
              <p className="text-sm text-white/55 mt-1">You can change this any time.</p>
            </div>

            {/* Detected result */}
            {detectedVoiceId && (
              <div className="fade-in flex flex-col items-center gap-1">
                <div className="px-8 py-3 rounded-xl border"
                  style={{
                    backgroundColor: "rgba(124,58,237,0.2)",
                    borderColor: "rgba(124,58,237,0.7)",
                    boxShadow: "0 0 20px rgba(124,58,237,0.25)",
                  }}>
                  <span className="text-xl font-semibold text-violet-300">
                    {VOICE_TYPES.find(v => v.id === detectedVoiceId)?.label}
                  </span>
                </div>
              </div>
            )}

            {/* Override pills — same 3+2 split, minus the detected one */}
            {(() => {
              const others = VOICE_TYPES.filter(v => v.id !== detectedVoiceId);
              const rows = [others.slice(0, 3), others.slice(3)];
              return (
                <div className="flex flex-col items-center gap-1.5 w-full">
                  {rows.map((row, ri) => (
                    <div key={ri} className="flex justify-center gap-1.5">
                      {row.map((v) => (
                        <button key={v.id}
                          onClick={() => { setSelectedVoiceId(v.id); setDetectedVoiceId(v.id); }}
                          className="px-4 py-2 rounded-full text-sm font-medium border transition-all"
                          style={{
                            borderColor: "rgba(255,255,255,0.1)",
                            color: "rgba(255,255,255,0.35)",
                            backgroundColor: "rgba(255,255,255,0.03)",
                          }}>
                          {v.label}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        <div className="w-full h-px" style={{ background: "rgba(255,255,255,0.07)" }} />

        {/* CTA */}
        <div className="flex flex-col items-center gap-2.5 w-full">
          <button
            onClick={() => onBegin(phase === "detected" ? (detectedVoiceId ?? selectedVoiceId) : selectedVoiceId)}
            disabled={isLoading || phase === "detecting"}
            className="w-full py-4 rounded-xl font-medium text-base text-white transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-wait"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
              boxShadow: (isLoading || phase === "detecting")
                ? "none"
                : "0 0 24px rgba(124,58,237,0.35), 0 2px 8px rgba(0,0,0,0.4)",
            }}>
            Let&apos;s go →
          </button>
          <p className="text-xs text-white/42 leading-relaxed px-2">
            Microphone used only for real-time pitch detection. Nothing is recorded.
          </p>
        </div>
      </div>
    </div>
  );
}
