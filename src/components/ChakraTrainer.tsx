"use client";

import { useState, useMemo } from "react";
import PitchCanvas from "./PitchCanvas";
import {
  CHAKRAS,
  VOICE_TYPES,
  getChakraFrequencies,
  findClosestChakra,
  isInTune,
} from "@/constants/chakras";
import type { Chakra, FrequencyBase, VoiceTypeId, TuningStandard } from "@/constants/chakras";
import { usePitchDetection } from "@/hooks/usePitchDetection";
import { useTonePlayer } from "@/hooks/useTonePlayer";

// ── Mic icon ──────────────────────────────────────────────────────────────────
function MicIcon({ active }: { active: boolean }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="11" rx="3" fill={active ? "currentColor" : "none"} />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="9"  y1="22" x2="15" y2="22" />
    </svg>
  );
}

// ── Spinner icon ──────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg className="spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

// ── Play icon ─────────────────────────────────────────────────────────────────
function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}

export default function ChakraTrainer() {
  const [freqBase, setFreqBase] = useState<FrequencyBase>("absolute");
  const [voiceId, setVoiceId] = useState<VoiceTypeId>("tenor");
  const [tuning, setTuning] = useState<TuningStandard>("A432");
  const [playingId, setPlayingId] = useState<string | null>(null);

  const { pitchHz, pitchHzRef, status, error, startListening, stopListening } = usePitchDetection();
  const { playTone } = useTonePlayer();

  const chakras = useMemo(
    () => getChakraFrequencies(freqBase, voiceId, tuning),
    [freqBase, voiceId, tuning]
  );

  const isListening = status === "listening";
  const isLoading = status === "requesting-mic" || status === "loading-model";

  const closestChakra: Chakra | null = pitchHz
    ? findClosestChakra(pitchHz, chakras)
    : null;
  const locked = closestChakra && pitchHz
    ? isInTune(pitchHz, closestChakra.frequencyHz)
    : false;

  function handleMicToggle() {
    if (isListening || isLoading) {
      stopListening();
    } else {
      startListening();
    }
  }

  function handleChakraPlay(chakra: Chakra) {
    setPlayingId(chakra.id);
    playTone(chakra.frequencyHz, 1800);
    setTimeout(() => setPlayingId(null), 1800);
  }

  // Status label shown beneath the mic button
  const statusLabel =
    status === "requesting-mic" ? "Requesting microphone…" :
    status === "loading-model"  ? "Loading CREPE model…" :
    status === "listening"      ? pitchHz
      ? `${Math.round(pitchHz)} Hz${locked ? ` · ${closestChakra?.name} ✓` : ""}`
      : "Listening…"
    : status === "error"        ? error ?? "Error"
    : "Tap to start";

  return (
    <div className="flex flex-col h-full gap-0">

      {/* ── Controls bar ───────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-white/[0.06]">

        {/* Frequency base */}
        <div className="flex items-center gap-1 bg-white/[0.05] rounded-lg p-1">
          {(["absolute", "voice"] as FrequencyBase[]).map((b) => (
            <button
              key={b}
              onClick={() => setFreqBase(b)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                freqBase === b
                  ? "bg-violet-600 text-white shadow"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              {b === "absolute" ? "Absolute" : "By voice"}
            </button>
          ))}
        </div>

        {/* Voice type (only when voice mode) */}
        {freqBase === "voice" && (
          <div className="flex items-center gap-1 bg-white/[0.05] rounded-lg p-1">
            {VOICE_TYPES.map((v) => (
              <button
                key={v.id}
                onClick={() => setVoiceId(v.id)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  voiceId === v.id
                    ? "bg-violet-600 text-white shadow"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        )}

        {/* Tuning */}
        <div className="flex items-center gap-1 bg-white/[0.05] rounded-lg p-1 ml-auto">
          {(["A432", "A440"] as TuningStandard[]).map((t) => (
            <button
              key={t}
              onClick={() => setTuning(t)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                tuning === t
                  ? "bg-white/15 text-white"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── Canvas ─────────────────────────────────────────────────────────── */}
      <div className="relative flex-1 min-h-0">
        <PitchCanvas
          chakras={chakras}
          currentHzRef={pitchHzRef}
          onChakraClick={handleChakraPlay}
        />

        {/* Pitch readout overlay */}
        {pitchHz !== null && (
          <div className="pointer-events-none absolute top-4 left-5 fade-in">
            <div
              className="text-3xl font-light tabular-nums tracking-tight transition-colors"
              style={{ color: closestChakra?.color ?? "#fff" }}
            >
              {Math.round(pitchHz)} Hz
            </div>
            {closestChakra && (
              <div
                className="text-xs font-medium mt-0.5 transition-colors"
                style={{ color: closestChakra.color + "aa" }}
              >
                {locked ? "✓ " : "→ "}{closestChakra.name} · {closestChakra.frequencyHz} Hz
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Bottom panel ───────────────────────────────────────────────────── */}
      <div className="border-t border-white/[0.06] bg-white/[0.02] px-5 py-4">

        {/* Chakra tone buttons */}
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          {chakras.map((chakra) => {
            const isPlaying = playingId === chakra.id;
            const isActive = locked && closestChakra?.id === chakra.id;
            return (
              <button
                key={chakra.id}
                onClick={() => handleChakraPlay(chakra)}
                title={`${chakra.name} — ${chakra.frequencyHz} Hz\n${chakra.description}`}
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all"
                style={{
                  borderColor: isActive || isPlaying
                    ? chakra.color
                    : `${chakra.color}40`,
                  color: isActive || isPlaying ? chakra.color : `${chakra.color}99`,
                  backgroundColor: isActive || isPlaying
                    ? `${chakra.color}18`
                    : "transparent",
                  boxShadow: isActive
                    ? `0 0 12px ${chakra.color}40`
                    : "none",
                }}
              >
                <span style={{ color: isPlaying ? chakra.color : "inherit" }}>
                  <PlayIcon />
                </span>
                {chakra.name}
                <span className="opacity-50">{chakra.frequencyHz}</span>
              </button>
            );
          })}
        </div>

        {/* Mic button + status */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handleMicToggle}
            disabled={isLoading}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all border-2 ${
              isListening
                ? "bg-violet-600/20 border-violet-500 text-violet-300 glow-pulse"
                : isLoading
                ? "bg-white/5 border-white/20 text-white/40 cursor-wait"
                : status === "error"
                ? "bg-red-500/15 border-red-500/50 text-red-400 hover:bg-red-500/25"
                : "bg-white/5 border-white/15 text-white/60 hover:bg-white/10 hover:border-white/30 hover:text-white"
            }`}
          >
            {isLoading ? <Spinner /> : <MicIcon active={isListening} />}
          </button>

          <p
            className={`text-xs text-center transition-colors ${
              status === "error"
                ? "text-red-400"
                : locked
                ? "font-medium"
                : "text-white/40"
            }`}
            style={locked ? { color: closestChakra?.color } : undefined}
          >
            {statusLabel}
          </p>

          {status === "loading-model" && (
            <p className="text-[10px] text-white/25 text-center max-w-[220px]">
              Downloading CREPE pitch model (~15 MB, first load only)
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
