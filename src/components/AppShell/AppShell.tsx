"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SettingsPanel from "../SettingsPanel";
import OnboardingModal from "../OnboardingModal";
import Footer from "../Footer";
import PostHogPageView from "../PostHogPageView";
import { useSettings } from "@/hooks/useSettings";
import { usePitchDetection } from "@/hooks/usePitchDetection";
import { useTonePlayer } from "@/hooks/useTonePlayer";
import { AppContext } from "@/context/AppContext";
import { analytics } from "@/lib/analytics";
import type { Band } from "@/constants/chakras";
import { Button } from "@/components/ui";
import Logo from "../Logo";
import { SettingsIcon, HamburgerIcon } from "./components/icons";
import { MobileMenu } from "./components/MobileMenu";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [redetect, setRedetect] = useState(false);

  const { settings, update } = useSettings();
  const { pitchHz, pitchHzRef, status, startListening } = usePitchDetection();
  const { playTone, playSlide } = useTonePlayer();

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
  function handlePlayTone(band: Band) {
    playTone(band.frequencyHz, { chakraId: band.chakraId, binaural: true });
    analytics.tonePlayed(band.id, pathname?.startsWith("/train") ? "explore" : "journey");
  }

  function handlePlaySlide(fromBand: Band, toBand: Band) {
    playSlide(fromBand.frequencyHz, toBand.frequencyHz, {
      chakraId: fromBand.chakraId,
      binaural: true,
    });
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
    playSlide: handlePlaySlide,
    pitchStatus: status,
    startListening,
    openSettings: handleOpenSettings,
  };

  function handleOnboardingBegin(result: { lowHz: number; highHz: number; voiceType: string }) {
    update("vocalRangeLowHz", result.lowHz);
    update("vocalRangeHighHz", result.highHz);
    setShowOnboarding(false);
    setRedetect(false);
    localStorage.setItem("attunr.onboarded", "1");
    analytics.onboardingCompleted(result.voiceType, true, result.lowHz, result.highHz);
  }

  const needsMic = pathname === "/" || pathname?.startsWith("/journey") || pathname === "/train";
  const showMicGate =
    !(showOnboarding || redetect) &&
    needsMic &&
    status === "idle";

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
        <h1 className="text-lg sm:text-2xl">
          <Logo layout="horizontal" size="default" />
        </h1>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-2">
          <nav className="flex items-center bg-white/[0.05] rounded-lg p-1 mr-1">
            <Link
              href="/"
              className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-all ${
                pathname === "/" || pathname.startsWith("/journey")
                  ? "bg-violet-600 text-white"
                  : "text-white/65 hover:text-white/90"
              }`}
            >
              Journey
            </Link>
            <Link
              href="/train"
              className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-all ${
                pathname === "/train" ? "bg-violet-600 text-white" : "text-white/65 hover:text-white/90"
              }`}
            >
              Train
            </Link>
          </nav>
          <Link
            href="/articles"
            className="px-3 py-1.5 text-sm font-medium text-white/45 hover:text-white/65 transition-colors"
          >
            Learn
          </Link>
          <Button variant="icon" onClick={handleOpenSettings}>
            <SettingsIcon />
          </Button>
        </div>

        {/* Mobile: hamburger + settings */}
        <div className="flex sm:hidden items-center gap-1">
          <Button variant="icon" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">
            <HamburgerIcon />
          </Button>
          <Button variant="icon" onClick={handleOpenSettings}>
            <SettingsIcon />
          </Button>
        </div>
      </header>

      {menuOpen && <MobileMenu pathname={pathname} onClose={() => setMenuOpen(false)} />}

      <main className="flex-1 min-h-0 relative">
        {children}
        {showMicGate && (
          <div
            className="absolute inset-0 z-40 flex items-center justify-center p-6"
            style={{ backgroundColor: "rgba(5,5,12,0.85)", backdropFilter: "blur(8px)" }}
          >
            <div className="flex flex-col items-center gap-5 text-center max-w-xs">
              <p className="text-base text-white/90">
                Tap to enable your microphone for pitch detection
              </p>
              <Button size="lg" onClick={() => startListening()} className="px-8 active:scale-[0.98]">
                Enable microphone
              </Button>
              <p className="text-xs text-white/55">
                Used only for real-time pitch. Nothing is recorded.
              </p>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <PostHogPageView />
    </div>
    </AppContext.Provider>
  );
}
