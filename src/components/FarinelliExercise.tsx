"use client";

import { useState, useEffect, useCallback, useRef } from "react";

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

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
  "Inhale, hold, and exhale to the same count — each cycle adds one beat and flows straight into the next.";

/** Unified progress ring + ticking count + tick sound. Reused for countdown (3,2,1) and breathe in/hold/out phases. */
function TickingProgressCircle({
  count,
  durationSeconds,
  secondsPerTick,
  onTick,
  textSize = "text-4xl",
  phase,
}: {
  count: number;
  durationSeconds: number;
  secondsPerTick: number;
  onTick: () => void;
  textSize?: "text-4xl" | "text-6xl";
  /** When provided (inhale/hold/exhale), circle inflates, holds, or deflates. Countdown has no phase. */
  phase?: FarinelliPhase;
}) {
  const [displayCount, setDisplayCount] = useState(count);
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  // Reset when count changes (new phase)
  useEffect(() => {
    setDisplayCount(count);
  }, [count]);

  // Tick sound on mount (initial count) and at each interval tick
  useEffect(() => {
    onTickRef.current();
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setDisplayCount((c) => {
        const next = Math.max(1, c - 1);
        if (next !== c) onTickRef.current();
        return next;
      });
    }, secondsPerTick * 1000);
    return () => clearInterval(id);
  }, [secondsPerTick]);

  const scaleAnim =
    phase === "inhale" ? "farinelli-inflate" : phase === "hold" ? "farinelli-hold" : phase === "exhale" ? "farinelli-deflate" : null;

  const content = (
    <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
      <div
        className="relative w-40 h-40"
        style={
          scaleAnim
            ? {
                animation: `${scaleAnim} ${durationSeconds}s ease-in-out both`,
                transformOrigin: "center",
                willChange: "transform",
              }
            : undefined
        }
      >
        <svg className="w-full h-full -rotate-90 block" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r="42"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="6"
          />
          <circle
            key={durationSeconds}
            cx="50" cy="50" r="42"
            fill="none"
            stroke="rgba(167,139,250,0.9)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 42}
            strokeDashoffset={2 * Math.PI * 42}
            style={{
              animation: `farinelli-fill ${durationSeconds}s linear forwards`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`${textSize} font-light tabular-nums text-white`}>
            {displayCount}
          </span>
        </div>
      </div>
    </div>
  );

  return content;
}

export function FarinelliExercise({
  startCount = 4,
  maxCount,
  secondsPerCount = 1.2,
  onComplete,
}: FarinelliExerciseProps) {
  const [status, setStatus] = useState<FarinelliStatus>("ready");
  const [phase, setPhase] = useState<FarinelliPhase>("inhale");
  const [cycleCount, setCycleCount] = useState(startCount);
  const [isComplete, setIsComplete] = useState(false);
  const [adviceIndex, setAdviceIndex] = useState(0);
  const [shuffledAdvice, setShuffledAdvice] = useState<string[]>([]);

  const countdownTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    return () => countdownTimers.current.forEach(clearTimeout);
  }, []);

  function handleStart() {
    setShuffledAdvice(shuffle(FARINELLI_ADVICES));
    setStatus("countdown");
    countdownTimers.current = [
      setTimeout(() => {
        setStatus("running");
      }, 3000),
    ];
  }

  const phaseDuration = cycleCount * secondsPerCount;

  const advancePhase = useCallback(() => {
    if (phase === "inhale") {
      setPhase("hold");
    } else if (phase === "hold") {
      setPhase("exhale");
    } else {
      // exhale done — next cycle or complete
      if (cycleCount >= maxCount) {
        setStatus("complete");
        setIsComplete(true);
        onCompleteRef.current?.();
        return;
      }
      setCycleCount(cycleCount + 1);
      setPhase("inhale");
    }
  }, [phase, cycleCount, maxCount]);

  // Phase timing: setTimeout to advance when duration elapses (independent from animation)
  useEffect(() => {
    if (isComplete || status !== "running") return;
    const id = setTimeout(advancePhase, phaseDuration * 1000);
    return () => clearTimeout(id);
  }, [phase, phaseDuration, advancePhase, isComplete, status]);

  // Rotate tips with time during countdown and running
  const TIP_ROTATE_SECONDS = 12;
  useEffect(() => {
    if (status !== "countdown" && status !== "running") return;
    const id = setInterval(() => {
      setAdviceIndex((i) => {
        const list = shuffledAdvice.length > 0 ? shuffledAdvice : FARINELLI_ADVICES;
        return (i + 1) % list.length;
      });
    }, TIP_ROTATE_SECONDS * 1000);
    return () => clearInterval(id);
  }, [status, shuffledAdvice]);

  const phaseDurationSeconds = Math.floor(phaseDuration);
  const phaseLabel =
    phase === "inhale"
      ? `Breathe in for ${phaseDurationSeconds}s`
      : phase === "hold"
        ? `Hold for ${phaseDurationSeconds}s`
        : `Breathe out for ${phaseDurationSeconds}s`;

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
          className="relative w-40 h-40 cursor-pointer select-none border-none bg-transparent rounded-full overflow-visible focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:ring-offset-2 focus:ring-offset-[#0f0f1a] before:content-[''] before:absolute before:inset-0 before:rounded-full before:border-[3px] before:border-[rgba(167,139,250,0.8)] before:bg-transparent before:pointer-events-none"
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

  const topSlotMinH = "min-h-[4.5rem]";
  const bottomSlotMinH = "min-h-[4.5rem]";

  if (status === "ready" || status === "countdown") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-8 px-6">
        <div className={`${topSlotMinH} w-full flex flex-col items-center justify-end text-center`}>
          {status === "countdown" && (
            <>
              <p className="text-2xl font-medium text-white mb-1">Starting in</p>
              <p className="text-white/55 text-sm">Exhale all the air and get ready for inhale</p>
            </>
          )}
        </div>
        <div className="shrink-0">
          {status === "ready" ? (
            <CircleWrapper onClick={handleStart}>
              <span className="text-xl font-semibold text-white">Start</span>
            </CircleWrapper>
          ) : (
            <TickingProgressCircle
              key="countdown"
              count={3}
              durationSeconds={3}
              secondsPerTick={1}
              onTick={playCountdownClick}
              textSize="text-6xl"
              phase="exhale"
            />
          )}
        </div>
        <div className={`${bottomSlotMinH} flex flex-col items-center justify-start gap-2 min-w-[12rem] max-w-[300px] px-4 text-center`}>
          {status === "ready" ? (
            <>
              <p className="text-sm text-white/60">{FARINELLI_INSTRUCTIONS}</p>
              <p className="text-xs text-white/45">Get comfortable, then tap when you&apos;re ready</p>
            </>
          ) : (
            <p className="text-xs text-white/55">
              Tip: {(shuffledAdvice.length > 0 ? shuffledAdvice : FARINELLI_ADVICES)[adviceIndex]}
            </p>
          )}
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
      <div className={`${topSlotMinH} w-full flex flex-col items-center justify-end text-center`}>
        <p className="text-2xl font-medium text-white mb-1">{phaseLabel}</p>
        <p className="text-white/55 text-sm">
          Cycle {cycleCount - startCount + 1} of {maxCount - startCount + 1} · {cycleCount} counts
        </p>
      </div>

      <TickingProgressCircle
        key={`${phase}-${cycleCount}`}
        count={cycleCount}
        durationSeconds={phaseDuration}
        secondsPerTick={secondsPerCount}
        onTick={playCountdownClick}
        phase={phase}
      />

      <div className={`${bottomSlotMinH} flex flex-col items-center justify-start max-w-[280px]`}>
        <p className="text-xs text-white/55 text-center">
          Tip: {(shuffledAdvice.length > 0 ? shuffledAdvice : FARINELLI_ADVICES)[adviceIndex]}
        </p>
      </div>
    </div>
  );
}
