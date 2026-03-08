"use client";

import { useState, useMemo, useEffect } from "react";
import PitchCanvas from "./PitchCanvas";
import TabInfoModal, { InfoButton, HeadphonesNotice } from "./TabInfoModal";
import {
  VOICE_TYPES,
  getChakraFrequencies,
  findClosestChakra,
  isInTune,
} from "@/constants/chakras";
import type { Chakra, FrequencyBase, VoiceTypeId } from "@/constants/chakras";
import type { Settings } from "@/hooks/useSettings";

const STORAGE_KEY = "attunr.exploreInfoSeen";

function PlayIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}

interface TrainViewProps {
  settings: Settings;
  pitchHz: number | null;
  pitchHzRef: React.RefObject<number | null>;
  onPlayTone: (chakra: Chakra) => void;
  onSettingsUpdate: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

export default function TrainView({
  settings,
  pitchHz,
  pitchHzRef,
  onPlayTone,
  onSettingsUpdate,
}: TrainViewProps) {
  const [freqBase, setFreqBase] = useState<FrequencyBase>(settings.freqBase);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  // Auto-show on first visit
  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setShowInfo(true);
  }, []);

  const chakras = useMemo(
    () => getChakraFrequencies(freqBase, settings.voiceType, settings.tuning),
    [freqBase, settings.voiceType, settings.tuning]
  );

  const closestChakra: Chakra | null = pitchHz
    ? findClosestChakra(pitchHz, chakras)
    : null;
  const locked =
    closestChakra && pitchHz
      ? isInTune(pitchHz, closestChakra.frequencyHz)
      : false;

  function handlePlay(chakra: Chakra) {
    setPlayingId(chakra.id);
    onPlayTone(chakra);
    setTimeout(() => setPlayingId(null), 1800);
  }

  function handleCloseInfo(persist: boolean) {
    if (persist) localStorage.setItem(STORAGE_KEY, "1");
    setShowInfo(false);
  }

  return (
    <div className="flex flex-col h-full">

      {/* ── Controls bar ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-b border-white/[0.06] pr-4">
        <div className="flex items-center gap-1 bg-white/[0.05] rounded-lg p-1">
          {(["absolute", "voice"] as FrequencyBase[]).map((b) => (
            <button
              key={b}
              onClick={() => setFreqBase(b)}
              className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-all ${
                freqBase === b
                  ? "bg-violet-600 text-white"
                  : "text-white/62 hover:text-white/88"
              }`}
            >
              {b === "absolute" ? "Absolute" : "By voice"}
            </button>
          ))}
        </div>

        {freqBase === "voice" && (
          <div className="flex items-center gap-1 bg-white/[0.05] rounded-lg p-1">
            {VOICE_TYPES.map((v) => (
              <button
                key={v.id}
                onClick={() => onSettingsUpdate("voiceType", v.id as VoiceTypeId)}
                className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-all ${
                  settings.voiceType === v.id
                    ? "bg-violet-600 text-white"
                    : "text-white/62 hover:text-white/88"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        )}

        <div className="ml-auto">
          <InfoButton onClick={() => setShowInfo(true)} />
        </div>
      </div>

      {/* Voice disclaimer */}
      {freqBase === "voice" && (
        <div className="px-5 py-1.5 border-b border-white/[0.04]">
          <p className="text-xs text-white/45">
            Frequencies adjusted for{" "}
            {VOICE_TYPES.find((v) => v.id === settings.voiceType)?.label}.{" "}
            Change voice type in Settings.
          </p>
        </div>
      )}

      {/* ── Canvas ───────────────────────────────────────────────────────── */}
      <div className="relative flex-1 min-h-0">
        <PitchCanvas
          chakras={chakras}
          currentHzRef={pitchHzRef}
          onChakraClick={handlePlay}
        />

        {/* Pitch overlay */}
        {pitchHz !== null && (
          <div className="pointer-events-none absolute top-4 left-5 fade-in">
            <div
              className="text-3xl font-light tabular-nums tracking-tight"
              style={{ color: closestChakra?.color ?? "#fff" }}
            >
              {Math.round(pitchHz)} Hz
            </div>
            {closestChakra && (
              <div
                className="text-sm font-medium mt-0.5"
                style={{ color: closestChakra.color + "aa" }}
              >
                {locked ? "✓ " : "→ "}
                {closestChakra.name} · {closestChakra.frequencyHz} Hz
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── Bottom panel ─────────────────────────────────────────────────── */}
      <div className="border-t border-white/[0.06] bg-white/[0.02] px-5 pt-3 pb-4 flex flex-col gap-3">
        <div className="flex flex-wrap gap-2 justify-center">
          {chakras.map((chakra) => {
            const isPlaying = playingId === chakra.id;
            const isActive = locked && closestChakra?.id === chakra.id;
            return (
              <button
                key={chakra.id}
                onClick={() => handlePlay(chakra)}
                title={`${chakra.name} — ${chakra.frequencyHz} Hz\n${chakra.description}`}
                className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all"
                style={{
                  borderColor: isActive || isPlaying ? chakra.color : `${chakra.color}40`,
                  color: isActive || isPlaying ? chakra.color : `${chakra.color}99`,
                  backgroundColor: isActive || isPlaying ? `${chakra.color}18` : "transparent",
                  boxShadow: isActive ? `0 0 12px ${chakra.color}40` : "none",
                }}
              >
                <PlayIcon />
                {chakra.name}
                <span className="opacity-65">{chakra.frequencyHz}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Explore info modal ────────────────────────────────────────────── */}
      {showInfo && (
        <TabInfoModal title="Explore" onClose={handleCloseInfo}>
          <p className="text-base text-white/65 leading-relaxed">
            Free-form chakra tone practice. No goals, no instructions — just sing and
            explore your voice against the canvas.
          </p>

          <div className="flex flex-col gap-3">
            {[
              {
                icon: "🎤",
                text: "Sing into your mic and watch the canvas respond to your pitch in real time",
              },
              {
                icon: "●",
                text: "The dot trail records where your pitch has been — filled dots are in tune, outlines are off",
              },
              {
                icon: "▶",
                text: "Tap any chakra button at the bottom to hear its target tone",
              },
              {
                icon: "↕",
                text: "Click on a chakra band to play its tone",
              },
              {
                icon: "⚙",
                text: "Switch between Absolute (universal Hz) and By voice (scaled to your range) in the controls above",
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-lg shrink-0 w-6 text-center opacity-75 mt-0.5">{item.icon}</span>
                <p className="text-sm text-white/58 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>

          <HeadphonesNotice />
        </TabInfoModal>
      )}
    </div>
  );
}
