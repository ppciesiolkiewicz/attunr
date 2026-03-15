"use client";

import { useState, useMemo, useEffect } from "react";
import PitchCanvas from "./PitchCanvas";
import TabInfoModal, { InfoButton, HeadphonesNotice } from "./TabInfoModal";
import { getScaleNotesForRange } from "@/lib/vocal-scale";
import { findClosestBand, isInTune } from "@/lib/pitch";
import type { Band } from "@/constants/tone-slots";
import type { Settings } from "@/hooks/useSettings";
import { Text } from "@/components/ui";

const STORAGE_KEY = "attunr.exploreInfoSeen";

function PlayIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}

interface TrainViewProps {
  settings: Settings;
  pitchHz: number | null;
  pitchHzRef: React.RefObject<number | null>;
  onPlayTone: (band: Band) => void;
  onSettingsUpdate: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

export default function TrainView({
  settings,
  pitchHz,
  pitchHzRef,
  onPlayTone,
}: TrainViewProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  // Auto-show on first visit
  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setShowInfo(true);
  }, []);

  const allBands = useMemo(
    () =>
      getScaleNotesForRange(
        settings.vocalRangeLowHz,
        settings.vocalRangeHighHz,
        settings.tuning,
      ),
    [settings.vocalRangeLowHz, settings.vocalRangeHighHz, settings.tuning],
  );

  // Only show slot bands as buttons (avoid 13+ buttons for all notes)
  const slotBands = useMemo(
    () => allBands.filter((b) => b.isSlot),
    [allBands],
  );

  const closestBand: Band | null = pitchHz
    ? findClosestBand(pitchHz, allBands)
    : null;
  const locked =
    closestBand && pitchHz
      ? isInTune(pitchHz, closestBand.frequencyHz)
      : false;

  function handlePlay(band: Band) {
    setPlayingId(band.id);
    onPlayTone(band);
    setTimeout(() => setPlayingId(null), 1800);
  }

  function handleCloseInfo(persist: boolean) {
    if (persist) localStorage.setItem(STORAGE_KEY, "1");
    setShowInfo(false);
  }

  return (
    <div className="flex flex-col h-full">

      {/* ── Controls bar ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-end px-5 py-3 border-b border-white/6">
        <InfoButton onClick={() => setShowInfo(true)} />
      </div>

      {/* ── Canvas ───────────────────────────────────────────────────────── */}
      <div className="relative flex-1 min-h-0">
        <PitchCanvas
          bands={allBands}
          currentHzRef={pitchHzRef}
          onBandClick={handlePlay}
        />

        {/* Pitch overlay */}
        {pitchHz !== null && (
          <div className="pointer-events-none absolute top-4 left-5 fade-in">
            <Text
              as="div"
              variant="heading-lg"
              className="font-light tabular-nums tracking-tight text-3xl!"
              style={{ color: closestBand?.color ?? "#fff" }}
            >
              {Math.round(pitchHz)} Hz
            </Text>
            {closestBand && (
              <Text
                as="div"
                variant="body-sm"
                className="font-medium mt-0.5"
                style={{ color: closestBand.color + "aa" }}
              >
                {locked ? "✓ " : "→ "}
                {closestBand.frequencyHz} Hz
              </Text>
            )}
          </div>
        )}

      </div>

      {/* ── Bottom panel ─────────────────────────────────────────────────── */}
      <div className="border-t border-white/[0.06] bg-white/[0.02] px-5 pt-3 pb-4 flex flex-col gap-3">
        <div className="flex flex-wrap gap-2 justify-center">
          {slotBands.map((band) => {
            const isPlaying = playingId === band.id;
            const isActive = locked && closestBand?.id === band.id;
            return (
              <button
                key={band.id}
                onClick={() => handlePlay(band)}
                title={`${band.name} — ${band.frequencyHz} Hz`}
                className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all"
                style={{
                  borderColor: isActive || isPlaying ? band.color : `${band.color}40`,
                  color: isActive || isPlaying ? band.color : `${band.color}99`,
                  backgroundColor: isActive || isPlaying ? `${band.color}18` : "transparent",
                  boxShadow: isActive ? `0 0 12px ${band.color}40` : "none",
                }}
              >
                <PlayIcon />
                <Text as="span" variant="body-sm" className="opacity-65">{band.frequencyHz} Hz</Text>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Train info modal ──────────────────────────────────────────────── */}
      {showInfo && (
        <TabInfoModal title="Train" onClose={handleCloseInfo}>
          <Text variant="body" color="text-2">
            Free-form vocal placement practice. No goals, no instructions — just sing and
            explore your voice against the canvas.
          </Text>

          <div className="flex flex-col gap-3">
            {[
              {
                icon: <MicIcon />,
                text: "Sing into your mic and watch the canvas respond to your pitch in real time",
              },
              {
                icon: "●",
                text: "The dot trail records where your pitch has been — filled dots are in tune, outlines are off",
              },
              {
                icon: "▶",
                text: "Tap a tone button at the bottom or click on a band to hear it played",
              },
              {
                icon: "⚙",
                text: "Change your tuning (A432, A440…) and vocal range in Settings",
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <Text as="span" variant="heading-sm" className="shrink-0 w-6 text-center opacity-75 mt-0.5 font-normal">{item.icon}</Text>
                <Text variant="body-sm" color="text-2">{item.text}</Text>
              </div>
            ))}
          </div>

          <HeadphonesNotice />
        </TabInfoModal>
      )}

    </div>
  );
}
