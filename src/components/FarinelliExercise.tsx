"use client";

import { useState, useEffect, useCallback } from "react";

function playCountdownClick() {
  try {
    const AudioCtx =
      typeof window !== "undefined" && window.AudioContext
        ? window.AudioContext
        : (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  } catch {
    /* ignore */
  }
}

export type FarinelliPhase = "inhale" | "hold" | "exhale";

export interface FarinelliExerciseProps {
  /** Start count for first cycle (e.g. 4) */
  startCount?: number;
  /** Max count — exercise runs cycles from startCount to maxCount (e.g. 10 = cycles 4,5,6,7,8,9,10) */
  maxCount: number;
  /** Seconds per count (e.g. 1.2 ≈ heartbeat tempo) */
  secondsPerCount?: number;
  onComplete?: () => void;
}

type FarinelliStatus = "ready" | "countdown" | "running" | "complete";

export const FARINELLI_ADVICES = [
  "Stay relaxed — that matters more than hitting the highest count. Tension defeats the purpose.",
  "Don't aim for 100% — fill to roughly 80% each cycle. This is about control, not inflating to the top.",
  "Same amount of breath each cycle — but as the count grows, inhale more slowly. That's the control.",
  "The hold isn't about stopping breathing — it's about keeping your lungs inflated. Keep ribs expanded; small top-up breaths are fine.",
  "Let it all out — exhale fully each time so you're ready for the next breath.",
  "You're training your diaphragm. Control builds over time — go at your own pace.",
  "If you feel lightheaded or unwell, stop and breathe normally.",
];

const FARINELLI_INSTRUCTIONS =
  "Inhale, hold, and exhale for the same count. Each cycle adds one. No pause between cycles.";

export function FarinelliExercise({
  startCount = 4,
  maxCount,
  secondsPerCount = 1.2,
  onComplete,
}: FarinelliExerciseProps) {
  const [status, setStatus] = useState<FarinelliStatus>("ready");
  const [countdown, setCountdown] = useState(3);
  const [phase, setPhase] = useState<FarinelliPhase>("inhale");
  const [cycleCount, setCycleCount] = useState(startCount);
  const [currentTick, setCurrentTick] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [adviceIndex, setAdviceIndex] = useState(0);

  function handleStart() {
    setStatus("countdown");
    setCountdown(3);
  }

  useEffect(() => {
    if (status !== "countdown") return;
    playCountdownClick();
    if (countdown <= 0) {
      setStatus("running");
      return;
    }
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [status, countdown]);

  const phaseDuration = cycleCount * secondsPerCount;
  const tickInterval = 100; // update UI every 100ms

  const advancePhase = useCallback(() => {
    if (phase === "inhale") {
      setPhase("hold");
      setCurrentTick(0);
    } else if (phase === "hold") {
      setPhase("exhale");
      setCurrentTick(0);
    } else {
      // exhale done — next cycle or complete
      if (cycleCount >= maxCount) {
        setStatus("complete");
        setIsComplete(true);
        onComplete?.();
        return;
      }
      setAdviceIndex((i) => (i + 1) % FARINELLI_ADVICES.length);
      setCycleCount((c) => c + 1);
      setPhase("inhale");
      setCurrentTick(0);
    }
  }, [phase, cycleCount, maxCount, onComplete]);

  useEffect(() => {
    if (isComplete || status !== "running") return;
    const interval = setInterval(() => {
      setCurrentTick((t) => {
        const next = t + tickInterval / 1000;
        if (next >= phaseDuration) {
          advancePhase();
          return 0;
        }
        return next;
      });
    }, tickInterval);
    return () => clearInterval(interval);
  }, [phase, phaseDuration, advancePhase, isComplete, status]);

  const progress = phaseDuration > 0 ? Math.min(currentTick / phaseDuration, 1) : 0;

  const phaseLabel =
    phase === "inhale"
      ? "Breathe in"
      : phase === "hold"
        ? "Hold"
        : "Breathe out";

  const circleSize = 40;

  const CircleWrapper = ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => {
    const size = circleSize * 4;
    if (onClick) {
      return (
        <button
          type="button"
          className="relative w-40 h-40 cursor-pointer select-none border-none bg-transparent rounded-full overflow-visible focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:ring-offset-2 focus:ring-offset-[#0f0f1a] before:content-[''] before:absolute before:inset-0 before:rounded-full before:border-[3px] before:border-[rgba(167,139,250,0.8)] before:bg-transparent before:scale-100 before:origin-center before:transition-[transform] before:duration-200 before:ease-out before:pointer-events-none hover:before:scale-105 active:before:scale-95"
          onClick={() => onClick()}
        >
          <span className="flex items-center justify-center w-full h-full">
            {children}
          </span>
        </button>
      );
    }
    return (
      <div
        className="relative"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <div
          className="absolute inset-0 rounded-full flex items-center justify-center"
          style={{
            border: "3px solid rgba(167,139,250,0.8)",
            background: "transparent",
          }}
        >
          <div className="flex flex-col items-center justify-center">
            {children}
          </div>
        </div>
      </div>
    );
  };

  if (status === "ready" || status === "countdown") {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="flex flex-col items-center shrink-0">
          <CircleWrapper onClick={status === "ready" ? handleStart : undefined}>
            {status === "ready" ? (
              <span className="text-xl font-semibold text-white">Start</span>
            ) : (
              <span className="text-6xl font-light tabular-nums text-white">
                {countdown > 0 ? countdown : ""}
              </span>
            )}
          </CircleWrapper>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 min-w-[12rem] max-w-[300px] px-4">
            {status === "ready" ? (
              <p className="text-sm text-white/50">Get comfortable, then tap when you&apos;re ready</p>
            ) : (
              <>
                <p className="text-xs text-white/55 text-center">{FARINELLI_INSTRUCTIONS}</p>
                <p className="text-xs text-white/45 text-center">{FARINELLI_ADVICES[0]}</p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isComplete || status === "complete") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-white">
        <span className="text-5xl">✓</span>
        <p className="text-xl font-medium">Well done</p>
        <p className="text-white/60 text-sm">You completed all 7 cycles</p>
        <p className="text-white/45 text-xs text-center max-w-[260px]">
          Your diaphragm got a great workout — control builds gently over time with practice.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-6">
      <div className="text-center">
        <p className="text-2xl font-medium text-white mb-1">{phaseLabel}</p>
        <p className="text-white/55 text-sm">
          Cycle {cycleCount - startCount + 1} of {maxCount - startCount + 1} · {cycleCount} counts
        </p>
      </div>

      {/* Progress ring */}
      <div className="relative w-40 h-40">
        <svg
          className="w-full h-full -rotate-90"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="6"
          />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="rgba(167,139,250,0.9)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 42}`}
            strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress)}`}
            style={{ transition: "stroke-dashoffset 0.1s linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-light tabular-nums text-white">
            {Math.max(1, Math.ceil(cycleCount - currentTick / secondsPerCount))}
          </span>
        </div>
      </div>

      <p className="text-xs text-white/55 text-center max-w-[280px]">
        {FARINELLI_INSTRUCTIONS}
      </p>
      <p className="text-xs text-white/45 text-center max-w-[280px]">
        {FARINELLI_ADVICES[adviceIndex]}
      </p>
    </div>
  );
}
