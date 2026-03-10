"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SettingsPanel from "./SettingsPanel";
import OnboardingModal from "./OnboardingModal";
import Footer from "./Footer";
import PostHogPageView from "./PostHogPageView";
import { useSettings } from "@/hooks/useSettings";
import { usePitchDetection } from "@/hooks/usePitchDetection";
import { useTonePlayer } from "@/hooks/useTonePlayer";
import { AppContext } from "@/context/AppContext";
import { analytics } from "@/lib/analytics";
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

function HamburgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}

function MenuJourneyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
    </svg>
  );
}

function MenuTrainIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function MenuLearnIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M8 7h8" />
      <path d="M8 11h8" />
    </svg>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [redetect, setRedetect] = useState(false);

  const { settings, update } = useSettings();
  const { pitchHz, pitchHzRef, status, startListening } = usePitchDetection();
  const { playTone } = useTonePlayer();

  // Hydrate onboarding flag after mount
  useEffect(() => {
    if (!localStorage.getItem("attunr.onboarded")) setShowOnboarding(true);
  }, []);

  // Auto-start mic when app loads
  useEffect(() => {
    if (status === "idle") startListening();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Binaural is always on — no user toggle needed
  function handlePlayTone(chakra: Chakra) {
    playTone(chakra.frequencyHz, { chakraId: chakra.id, binaural: true });
    analytics.tonePlayed(chakra.id, pathname?.startsWith("/explore") ? "explore" : "journey");
  }

  function handleOpenSettings() {
    setSettingsOpen(true);
    analytics.settingsOpened();
  }

  const contextValue = {
    settings,
    updateSettings: update,
    pitchHz,
    pitchHzRef,
    playTone: handlePlayTone,
    pitchStatus: status,
    startListening,
    openSettings: handleOpenSettings,
  };

  function handleOnboardingBegin(voiceId: VoiceTypeId, detected?: boolean) {
    update("voiceType", voiceId);
    setShowOnboarding(false);
    setRedetect(false);
    localStorage.setItem("attunr.onboarded", "1");
    analytics.onboardingCompleted(voiceId, detected);
  }

  const chakraSpectrum = [
    "#ef4444","#f97316","#eab308","#22c55e","#3b82f6","#6366f1","#a855f7",
  ];

  const needsMic = pathname === "/" || pathname?.startsWith("/journey") || pathname === "/explore";
  const showMicGate =
    !(showOnboarding || redetect) &&
    needsMic &&
    status === "idle";

  function MicGateOverlay() {
    return (
      <div
        className="absolute inset-0 z-40 flex items-center justify-center p-6"
        style={{
          backgroundColor: "rgba(5,5,12,0.85)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div className="flex flex-col items-center gap-5 text-center max-w-xs">
          <p className="text-base text-white/85">
            Tap to enable your microphone for pitch detection
          </p>
          <button
            type="button"
            onClick={() => startListening()}
            className="px-8 py-4 rounded-xl font-medium text-white transition-all active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
              boxShadow: "0 0 24px rgba(124,58,237,0.35)",
            }}
          >
            Enable microphone
          </button>
          <p className="text-xs text-white/45">
            Used only for real-time pitch. Nothing is recorded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
    <div className="flex flex-col h-full relative">

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
      <header className="flex items-center justify-between px-4 sm:px-5 py-2.5 sm:py-3 border-b border-white/[0.06] shrink-0">
        <h1 className="flex items-center gap-2 sm:gap-3 text-lg sm:text-2xl font-semibold tracking-tight text-white leading-none">
          <span>attunr</span>
          <span
            className="inline-flex items-center gap-1.5 sm:gap-2 shrink-0"
            style={{ transform: "translateY(2px)" }}
          >
            {chakraSpectrum.map((color, i) => (
              <span key={i} className="block w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full opacity-80"
                style={{ backgroundColor: color }} />
            ))}
          </span>
        </h1>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-2">
          <nav className="flex items-center bg-white/[0.05] rounded-lg p-1 mr-1">
            <Link
              href="/"
              className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-all ${
                pathname === "/" || pathname.startsWith("/journey")
                  ? "bg-violet-600 text-white"
                  : "text-white/55 hover:text-white/85"
              }`}
            >
              Journey
            </Link>
            <Link
              href="/explore"
              className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-all ${
                pathname === "/explore" ? "bg-violet-600 text-white" : "text-white/55 hover:text-white/85"
              }`}
            >
              Train
            </Link>
          </nav>
          <Link
            href="/articles"
            className="px-3 py-1.5 text-sm font-medium text-white/35 hover:text-white/55 transition-colors"
          >
            Learn
          </Link>
          <button
            onClick={handleOpenSettings}
            className="p-2.5 rounded-lg text-white/55 hover:text-white/90 hover:bg-white/[0.08] transition-all"
          >
            <SettingsIcon />
          </button>
        </div>

        {/* Mobile: hamburger + menu */}
        <div className="flex sm:hidden items-center gap-1">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="p-2.5 rounded-lg text-white/55 hover:text-white/90 hover:bg-white/[0.08] transition-all"
            aria-label="Menu"
          >
            <HamburgerIcon />
          </button>
          <button
            onClick={handleOpenSettings}
            className="p-2.5 rounded-lg text-white/55 hover:text-white/90 hover:bg-white/[0.08] transition-all"
          >
            <SettingsIcon />
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 sm:hidden"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm backdrop-fade sm:hidden"
            aria-hidden
          />
          <div
            className="absolute top-0 right-0 h-full w-72 max-w-[85vw] flex flex-col slide-in-right sm:hidden"
            style={{
              background: "linear-gradient(180deg, rgba(18,18,30,0.99) 0%, rgba(12,12,22,0.99) 100%)",
              borderLeft: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "-12px 0 48px rgba(0,0,0,0.4)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-white">attunr</span>
                <span
                  className="inline-flex items-center gap-1"
                  style={{ transform: "translateY(2px)" }}
                >
                  {chakraSpectrum.map((color, i) => (
                    <span
                      key={i}
                      className="block w-2 h-2 rounded-full opacity-80"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </span>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 rounded-lg text-white/45 hover:text-white/80 hover:bg-white/[0.08] transition-colors"
                aria-label="Close menu"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex flex-col gap-0.5 px-3 py-4">
              <Link
                href="/"
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                  pathname === "/" || pathname.startsWith("/journey")
                    ? "bg-violet-600/90 text-white shadow-lg shadow-violet-600/20"
                    : "text-white/80 hover:bg-white/[0.06] active:bg-white/[0.08]"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                <span className={pathname === "/" || pathname.startsWith("/journey") ? "text-white" : "text-white/60"}>
                  <MenuJourneyIcon />
                </span>
                Journey
              </Link>
              <Link
                href="/explore"
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                  pathname === "/explore" ? "bg-violet-600/90 text-white shadow-lg shadow-violet-600/20" : "text-white/80 hover:bg-white/[0.06] active:bg-white/[0.08]"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                <span className={pathname === "/explore" ? "text-white" : "text-white/60"}>
                  <MenuTrainIcon />
                </span>
                Train
              </Link>
              <Link
                href="/articles"
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-white/80 hover:bg-white/[0.06] active:bg-white/[0.08] transition-all"
                onClick={() => setMenuOpen(false)}
              >
                <span className="text-white/60">
                  <MenuLearnIcon />
                </span>
                Learn
              </Link>
            </nav>
            <div className="mt-auto px-5 py-5 pt-5 border-t border-white/[0.06]">
              <p className="text-center text-[0.9rem] text-white/55 tracking-wide flex flex-col gap-1 items-center font-light">
                <span>Align your voice</span>
                <span className="text-violet-400/70 text-[0.5em] leading-none">●</span>
                <span>find your frequency</span>
              </p>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 min-h-0 relative">
        {children}
        {showMicGate && <MicGateOverlay />}
      </main>

      <Footer />
      <PostHogPageView />
    </div>
    </AppContext.Provider>
  );
}
