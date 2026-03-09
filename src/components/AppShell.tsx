"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SettingsPanel from "./SettingsPanel";
import OnboardingModal from "./OnboardingModal";
import { useSettings } from "@/hooks/useSettings";
import { usePitchDetection } from "@/hooks/usePitchDetection";
import { useTonePlayer } from "@/hooks/useTonePlayer";
import { AppContext } from "@/context/AppContext";
import type { Chakra, VoiceTypeId } from "@/constants/chakras";

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [redetect, setRedetect] = useState(false);

  const { settings, update } = useSettings();
  const { pitchHz, pitchHzRef, status, startListening } = usePitchDetection();
  const { playTone } = useTonePlayer();

  // Hydrate onboarding flag after mount
  useEffect(() => {
    if (!localStorage.getItem("attunr.onboarded")) setShowOnboarding(true);
  }, []);

  // Auto-start mic when onboarding is shown
  useEffect(() => {
    if (showOnboarding && status === "idle") startListening();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showOnboarding]);

  // Auto-start mic for returning users (no onboarding)
  useEffect(() => {
    if (!showOnboarding && status === "idle") startListening();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Binaural is always on — no user toggle needed
  function handlePlayTone(chakra: Chakra) {
    playTone(chakra.frequencyHz, { chakraId: chakra.id, binaural: true });
  }

  const contextValue = {
    settings,
    updateSettings: update,
    pitchHz,
    pitchHzRef,
    playTone: handlePlayTone,
    pitchStatus: status,
    startListening,
    openSettings: () => setSettingsOpen(true),
  };

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
    <AppContext.Provider value={contextValue}>
    <div className="flex flex-col h-full">

      {(showOnboarding || redetect) && (
        <OnboardingModal
          pitchHz={pitchHz}
          status={status}
          onBegin={handleOnboardingBegin}
          onRetryMic={startListening}
        />
      )}

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

      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] shrink-0">
        <h1 className="flex items-center gap-4 text-2xl font-semibold tracking-tight text-white leading-none">
          <span>attunr</span>
          <span
            className="inline-flex items-center gap-2 shrink-0"
            style={{ transform: "translateY(2px)" }}
          >
            {chakraSpectrum.map((color, i) => (
              <span key={i} className="block w-3 h-3 rounded-full opacity-80"
                style={{ backgroundColor: color }} />
            ))}
          </span>
        </h1>

        <div className="flex items-center gap-1">
          <nav className="flex items-center bg-white/[0.05] rounded-lg p-1 mr-2">
            <Link
              href="/"
              className={`px-3.5 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
                pathname === "/" || pathname.startsWith("/journey")
                  ? "bg-violet-600 text-white"
                  : "text-white/55 hover:text-white/85"
              }`}
            >
              Journey
            </Link>
            <Link
              href="/explore"
              className={`px-3.5 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
                pathname === "/explore" ? "bg-violet-600 text-white" : "text-white/55 hover:text-white/85"
              }`}
            >
              Explore
            </Link>
          </nav>

          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2.5 rounded-lg text-white/55 hover:text-white/90 hover:bg-white/[0.08] transition-all"
          >
            <SettingsIcon />
          </button>
        </div>
      </header>

      <main className="flex-1 min-h-0">
        {children}
      </main>

      <footer className="shrink-0 px-5 py-2 border-t border-white/[0.04]">
        <Link
          href="/articles"
          className="text-xs text-white/40 hover:text-white/60 transition-colors"
        >
          Articles
        </Link>
      </footer>
    </div>
    </AppContext.Provider>
  );
}
