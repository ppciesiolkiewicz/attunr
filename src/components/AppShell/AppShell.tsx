"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import SettingsPanel from "../SettingsPanel";
import CookieConsent from "../CookieConsent";
import OnboardingModal from "../OnboardingModal";
import FrequencyModal from "../FrequencyModal";
import Footer from "../Footer";
import PostHogPageView from "../PostHogPageView";
import { useSettings } from "@/hooks/useSettings";
import { useJourneyProgress } from "@/hooks/useJourneyProgress";
import { usePitchDetection } from "@/hooks/usePitchDetection";
import { useTonePlayer } from "@/hooks/useTonePlayer";
import { useServiceWorker } from "@/hooks/useServiceWorker";
import { useNotificationScheduler } from "@/hooks/useNotificationScheduler";
import { useNotificationPrompt } from "@/hooks/useNotificationPrompt";
import { journey } from "@/constants/journey";
import { AppContext } from "@/context/AppContext";
import { ToastProvider } from "@/context/ToastContext";
import { StreakProvider, StreakBadge } from "@/features/streak";
import { analytics } from "@/lib/analytics";
import { hzToNoteName } from "@/lib/pitch";
import type { ColoredNote } from "@/lib/VocalRange";
import { Button, Text } from "@/components/ui";
import { SplashScreen } from "@capacitor/splash-screen";
import { isNative } from "@/lib/platform";
import Logo from "../Logo";
import { SettingsIcon, HamburgerIcon } from "./components/icons";
import { MobileMenu } from "./components/MobileMenu";

/** Outer shell — provides ToastProvider so inner hooks can use useToast. */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLanding = pathname === "/";
  const native = isNative();

  // Dismiss native splash screen once any page mounts
  useEffect(() => {
    if (native) SplashScreen.hide();
  }, [native]);

  // Native app: never show landing page — redirect to journey
  useEffect(() => {
    if (native && isLanding) {
      router.replace("/journey");
    }
  }, [native, isLanding, router]);

  if (isLanding) {
    if (native) return null;
    return <>{children}</>;
  }

  return (
    <ToastProvider>
      <StreakProvider>
        <Suspense>
          <AppShellInner pathname={pathname}>{children}</AppShellInner>
        </Suspense>
      </StreakProvider>
    </ToastProvider>
  );
}

/** Inner shell — all hooks run inside ToastProvider. */
function AppShellInner({
  pathname,
  children,
}: {
  pathname: string;
  children: React.ReactNode;
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [redetect, setRedetect] = useState(false);
  const { settings, update } = useSettings();
  const journeyProgress = useJourneyProgress();
  const {
    pitchHz,
    pitchHzRef,
    status,
    error: micError,
    startListening,
    stopListening,
  } = usePitchDetection();
  const { playTone, playSlide } = useTonePlayer();

  // Notifications: service worker, scheduler, and prompt flow
  useServiceWorker();
  useNotificationScheduler(settings);
  const {
    frequencyModalOpen,
    openFrequencyModal,
    closeFrequencyModal,
    handleFrequencySave,
    triggerPrompt,
  } = useNotificationPrompt(settings, update);

  // Hydrate onboarding flag after mount — also trigger onboarding when voice
  // range is missing (e.g. user from a previous app version).
  useEffect(() => {
    const onboarded = localStorage.getItem("attunr.onboarded");
    const hasVoice =
      Number(localStorage.getItem("attunr.vocalRangeLowHz")) > 0 &&
      Number(localStorage.getItem("attunr.vocalRangeHighHz")) > 0;
    if (!onboarded || !hasVoice) setShowOnboarding(true);
  }, []);

  // Start mic only on exercise pages that need it; stop when navigating away
  const exerciseMatch = pathname.match(/^\/journey\/([^/]+)\/([^/]+)/);
  const currentExercise = exerciseMatch
    ? journey.getExerciseByRoute(exerciseMatch[1], exerciseMatch[2])
    : null;
  const NO_MIC_TYPES = new Set(["learn", "learn-notes-1", "learn-voice-driven", "walkthrough", "time-based"]);
  const needsMic =
    pathname === "/practice" ||
    (currentExercise != null && !NO_MIC_TYPES.has(currentExercise.exerciseTypeId));

  useEffect(() => {
    // Don't auto-start mic during onboarding on native — iOS WKWebView requires
    // getUserMedia to be called from a user gesture. The "Begin" button handles it.
    const shouldStart = needsMic || (showOnboarding && !isNative());
    if (shouldStart && status === "idle") {
      startListening();
    } else if (!needsMic && !showOnboarding && status === "listening") {
      stopListening();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsMic, showOnboarding]);

  // Binaural is always on — no user toggle needed
  function handlePlayTone(band: ColoredNote) {
    playTone(band.frequencyHz, { binaural: true });
    analytics.tonePlayed(
      band.id,
      pathname?.startsWith("/practice") ? "explore" : "journey",
    );
  }

  function handlePlaySlide(fromBand: ColoredNote, toBand: ColoredNote) {
    playSlide(fromBand.frequencyHz, toBand.frequencyHz, { binaural: true });
  }

  function handleOpenSettings() {
    setSettingsOpen(true);
    analytics.settingsOpened();
  }

  const contextValue = {
    settings,
    updateSettings: update,
    journeyProgress,
    pitchHz,
    pitchHzRef,
    playTone: handlePlayTone,
    playSlide: handlePlaySlide,
    pitchStatus: status,
    startListening,
    openSettings: handleOpenSettings,
    triggerNotificationPrompt: triggerPrompt,
  };

  function handleOnboardingBegin(result: {
    lowHz: number;
    highHz: number;
    voiceType: string;
  }) {
    update("vocalRangeLowHz", result.lowHz);
    update("vocalRangeHighHz", result.highHz);
    setShowOnboarding(false);
    setRedetect(false);
    localStorage.setItem("attunr.onboarded", "1");
    analytics.onboardingCompleted(
      result.voiceType,
      result.lowHz,
      result.highHz,
      hzToNoteName(result.lowHz),
      hzToNoteName(result.highHz),
    );
  }

  const showMicGate =
    !(showOnboarding || redetect) && needsMic && status === "idle";

  return (
    <AppContext.Provider value={contextValue}>
      <div className="flex flex-col h-full relative">
        {(showOnboarding || redetect) && (
          <OnboardingModal
            pitchHz={pitchHz}
            pitchHzRef={pitchHzRef}
            status={status}
            micError={micError}
            onBegin={handleOnboardingBegin}
            onRetryMic={startListening}
          />
        )}

        <FrequencyModal
          open={frequencyModalOpen}
          onClose={closeFrequencyModal}
          onSave={handleFrequencySave}
        />

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
          onOpenFrequencyModal={openFrequencyModal}
        />

        {/* Header */}
        <header
          className="flex items-center justify-between px-4 sm:px-5 py-2.5 sm:py-3 border-b border-white/[0.06] shrink-0"
          style={{ paddingTop: `calc(var(--sat, 0px) + 0.625rem)` }}
        >
          <Link href={isNative() ? "/journey" : "/"} className="text-lg sm:text-2xl">
            <Logo layout="horizontal" size="sm" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-2">
            <nav className="flex items-center bg-white/[0.05] rounded-lg p-1 mr-1">
              <Link
                href="/journey"
                className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ${
                  pathname.startsWith("/journey")
                    ? "bg-violet-600 text-white hover:brightness-125 active:brightness-90"
                    : "text-white/65 hover:text-white/90 hover:brightness-125 active:brightness-90"
                }`}
              >
                Journey
              </Link>
              <span className="relative group cursor-not-allowed">
                <span className="px-3.5 py-1.5 rounded-md text-sm font-medium text-white/35">
                  Practice
                </span>
                <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 px-3.5 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm text-white/70 text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Coming soon
                </span>
              </span>
            </nav>
            <Link
              href="/articles"
              className="px-3 py-1.5 text-sm font-medium text-white/45 hover:text-white/65 transition-colors"
            >
              Learn
            </Link>
            <StreakBadge />
            <Button variant="icon" color="subtle" onClick={handleOpenSettings}>
              <SettingsIcon />
            </Button>
          </div>

          {/* Mobile: hamburger + settings */}
          <div className="flex sm:hidden items-center gap-1">
            <StreakBadge />
            <Button
              variant="icon"
              color="subtle"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Menu"
            >
              <HamburgerIcon />
            </Button>
            <Button variant="icon" color="subtle" onClick={handleOpenSettings}>
              <SettingsIcon />
            </Button>
          </div>
        </header>

        {menuOpen && (
          <MobileMenu pathname={pathname} onClose={() => setMenuOpen(false)} />
        )}

        <main className="flex-1 min-h-0 relative overflow-auto">
          {children}
          {showMicGate && (
            <div
              className="absolute inset-0 z-40 flex items-center justify-center p-6"
              style={{
                backgroundColor: "rgba(5,5,12,0.85)",
                backdropFilter: "blur(8px)",
              }}
            >
              <div className="flex flex-col items-center gap-5 text-center max-w-xs">
                <Text variant="body">
                  Tap to enable your microphone for pitch detection
                </Text>
                <Button
                  size="lg"
                  onClick={() => startListening()}
                  className="px-8 active:scale-[0.98]"
                >
                  Enable microphone
                </Button>
                <Text variant="caption">
                  Used only for real-time pitch. Nothing is recorded.
                </Text>
              </div>
            </div>
          )}
        </main>

        <Footer />
        <CookieConsent />
        <PostHogPageView />
      </div>
    </AppContext.Provider>
  );
}
