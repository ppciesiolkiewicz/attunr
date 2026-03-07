"use client";

import { useState, useMemo, useEffect } from "react";
import TrainView from "./TrainView";
import JourneyView from "./JourneyView";
import SettingsPanel from "./SettingsPanel";
import OnboardingModal from "./OnboardingModal";
import { useSettings } from "@/hooks/useSettings";
import { usePitchDetection } from "@/hooks/usePitchDetection";
import { useTonePlayer } from "@/hooks/useTonePlayer";
import { useDrone } from "@/hooks/useDrone";
import { getChakraFrequencies, CHAKRAS } from "@/constants/chakras";
import type { Chakra, VoiceTypeId } from "@/constants/chakras";

type Tab = "train" | "journey";

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export default function AppShell() {
  const [tab, setTab] = useState<Tab>("train");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [redetect, setRedetect] = useState(false);

  const { settings, update } = useSettings();
  const { pitchHz, pitchHzRef, status, startListening } = usePitchDetection();
  const { playTone } = useTonePlayer();
  const drone = useDrone();

  // ── Hydrate from localStorage after mount ────────────────────────────────
  useEffect(() => {
    const onboarded = localStorage.getItem("attunr.onboarded");
    if (!onboarded) setShowOnboarding(true);
  }, []);

  // ── Auto-start mic ───────────────────────────────────────────────────────
  useEffect(() => {
    if ((showOnboarding || !localStorage.getItem("attunr.onboarded")) && status === "idle") {
      startListening();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showOnboarding]);

  useEffect(() => {
    if (!showOnboarding && status === "idle") {
      startListening();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Drone management ─────────────────────────────────────────────────────
  const droneChakra = useMemo(() => {
    if (settings.drone === "off") return null;
    const chakras = getChakraFrequencies("voice", settings.voiceType, settings.tuning);
    return chakras.find((c) => c.id === settings.drone) ?? null;
  }, [settings.drone, settings.voiceType, settings.tuning]);

  useEffect(() => {
    if (droneChakra) {
      drone.start(droneChakra.frequencyHz, droneChakra.id, settings.binaural);
    } else {
      drone.stop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.drone, settings.binaural, settings.voiceType, settings.tuning]);

  // ── Tone playback ────────────────────────────────────────────────────────
  function handlePlayTone(chakra: Chakra) {
    playTone(chakra.frequencyHz, {
      chakraId: chakra.id,
      binaural: settings.binaural,
    });
  }

  // ── Onboarding ───────────────────────────────────────────────────────────
  function handleOnboardingBegin(voiceId: VoiceTypeId) {
    update("voiceType", voiceId);
    setShowOnboarding(false);
    setRedetect(false);
    localStorage.setItem("attunr.onboarded", "1");
  }

  const chakraSpectrum = [
    "#ef4444","#f97316","#eab308","#22c55e","#3b82f6","#6366f1","#a855f7",
  ];

  return (
    <div className="flex flex-col h-full">

      {/* ── Onboarding overlay ─────────────────────────────────────────── */}
      {(showOnboarding || redetect) && (
        <OnboardingModal
          pitchHz={pitchHz}
          status={status}
          onBegin={handleOnboardingBegin}
        />
      )}

      {/* ── Settings panel ─────────────────────────────────────────────── */}
      <SettingsPanel
        open={settingsOpen}
        settings={settings}
        onUpdate={update}
        onClose={() => setSettingsOpen(false)}
        onRedetect={() => {
          setSettingsOpen(false);
          setRedetect(true);
          if (status === "idle") startListening();
        }}
      />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] shrink-0">
        {/* Logo + chakra dots */}
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold tracking-tight text-white">attunr</h1>
          <div className="flex items-center gap-1.5">
            {chakraSpectrum.map((color, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full opacity-60"
                style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>

        {/* Nav tabs + settings */}
        <div className="flex items-center gap-1">
          <div className="flex items-center bg-white/[0.05] rounded-lg p-1 mr-2">
            {(["train", "journey"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-all ${
                  tab === t ? "bg-violet-600 text-white" : "text-white/40 hover:text-white/70"
                }`}
              >
                {t === "journey" ? "Journey ✦" : "Train"}
              </button>
            ))}
          </div>

          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.05] transition-all"
          >
            <SettingsIcon />
          </button>
        </div>
      </header>

      {/* ── Main content ───────────────────────────────────────────────── */}
      <main className="flex-1 min-h-0">
        {tab === "train" ? (
          <TrainView
            settings={settings}
            pitchHz={pitchHz}
            pitchHzRef={pitchHzRef}
            onPlayTone={handlePlayTone}
            onSettingsUpdate={update}
          />
        ) : (
          <JourneyView
            settings={settings}
            pitchHz={pitchHz}
            pitchHzRef={pitchHzRef}
            onPlayTone={handlePlayTone}
            onSettingsUpdate={update}
          />
        )}
      </main>
    </div>
  );
}
