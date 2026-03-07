"use client";

import { useState, useMemo, useEffect } from "react";
import PitchCanvas from "./PitchCanvas";
import OnboardingModal from "./OnboardingModal";
import {
  VOICE_TYPES,
  getChakraFrequencies,
  findClosestChakra,
  isInTune,
} from "@/constants/chakras";
import type { Chakra, FrequencyBase, VoiceTypeId, TuningStandard } from "@/constants/chakras";
import { usePitchDetection } from "@/hooks/usePitchDetection";
import { useTonePlayer } from "@/hooks/useTonePlayer";

// ── Play icon ─────────────────────────────────────────────────────────────────
function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}

export default function ChakraTrainer() {
  const [showOnboarding, setShowOnboarding] = useState(
    () => typeof window === "undefined" || !localStorage.getItem("attunr.onboarded")
  );
  const [freqBase, setFreqBase] = useState<FrequencyBase>("voice");
  const [voiceId, setVoiceId] = useState<VoiceTypeId>(
    () => (typeof window !== "undefined"
      ? (localStorage.getItem("attunr.voiceType") as VoiceTypeId | null) ?? "tenor"
      : "tenor")
  );
  const [tuning, setTuning] = useState<TuningStandard>("A432");
  const [playingId, setPlayingId] = useState<string | null>(null);

  const { pitchHz, pitchHzRef, status, startListening } = usePitchDetection();
  const { playTone } = useTonePlayer();

  const chakras = useMemo(
    () => getChakraFrequencies(freqBase, voiceId, tuning),
    [freqBase, voiceId, tuning]
  );

  const closestChakra: Chakra | null = pitchHz
    ? findClosestChakra(pitchHz, chakras)
    : null;
  const locked = closestChakra && pitchHz
    ? isInTune(pitchHz, closestChakra.frequencyHz)
    : false;

  function handleChakraPlay(chakra: Chakra) {
    setPlayingId(chakra.id);
    playTone(chakra.frequencyHz, 1800);
    setTimeout(() => setPlayingId(null), 1800);
  }

  // Status label shown beneath the mic button
  const statusLabel =
    status === "requesting-mic" ? "Requesting microphone…" :
    status === "loading-model"  ? "Loading CREPE model…" :
    status === "error"          ? "Microphone error — reload to retry"
    : null;

  // Auto-start mic as soon as the onboarding screen is visible
  useEffect(() => {
    if (showOnboarding && status === "idle") {
      startListening();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showOnboarding]);

  function handleOnboardingBegin(voiceId: VoiceTypeId) {
    setVoiceId(voiceId);
    setFreqBase("voice");
    setShowOnboarding(false);
    localStorage.setItem("attunr.onboarded", "1");
    localStorage.setItem("attunr.voiceType", voiceId);
  }

  return (
    <div className="flex flex-col h-full gap-0">

      {showOnboarding && (
        <OnboardingModal
          pitchHz={pitchHz}
          status={status}
          onBegin={handleOnboardingBegin}
        />
      )}

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

        {/* Status indicator */}
        {status !== "listening" && (
          <div className="flex justify-center">
            <p className={`text-xs text-center ${status === "error" ? "text-red-400" : "text-white/30"}`}>
              {statusLabel}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
