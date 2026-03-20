"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button, Text } from "@/components/ui";
import { useRepCompletion, CongratsOverlay } from "@/features/rep-progress";
import { ProgressArc } from "./components/ProgressArc";
import type { TimeBasedConfig } from "@/constants/journey";

// ── Countdown click sound (same as Farinelli) ──────────────────────────────

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

// ── Progress ring with countdown tick ───────────────────────────────────────

function TickingProgressRing({
  count,
  durationSeconds,
  secondsPerTick,
  onTick,
  textSize = "text-4xl",
}: {
  count: number;
  durationSeconds: number;
  secondsPerTick: number;
  onTick: () => void;
  textSize?: "text-4xl" | "text-6xl";
}) {
  const [displayCount, setDisplayCount] = useState(count);
  const onTickRef = useRef(onTick);
  useEffect(() => { onTickRef.current = onTick; });

  useEffect(() => {
    setDisplayCount(count);
  }, [count]);

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

  return (
    <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
      <div className="relative w-40 h-40">
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
}

// ── Main component ──────────────────────────────────────────────────────────

type TimeBasedStatus = "ready" | "countdown" | "running" | "complete";

interface TimeBasedExerciseProps {
  exercise: TimeBasedConfig;
  exerciseId: number;
  isLast: boolean;
  isAlreadyCompleted: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onPrev?: () => void;
}

export function TimeBasedExerciseContent({
  exercise,
  exerciseId,
  isLast,
  isAlreadyCompleted,
  onComplete,
  onSkip,
  onPrev,
}: TimeBasedExerciseProps) {
  const [status, setStatus] = useState<TimeBasedStatus>("ready");
  const [cueIndex, setCueIndex] = useState(0);
  const [prevExerciseId, setPrevExerciseId] = useState(exerciseId);
  const [tipIndex, setTipIndex] = useState(0);

  const countdownTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [hasStartedOnce, setHasStartedOnce] = useState(false);

  // Reset on exercise change
  if (prevExerciseId !== exerciseId) {
    setPrevExerciseId(exerciseId);
    setStatus("ready");
    setCueIndex(0);
    setTipIndex(0);
  }

  const { cues, tips } = exercise;
  const totalCues = cues.length;
  const currentCue = cues[cueIndex];
  const totalDuration = cues.reduce((sum, c) => sum + c.seconds, 0);
  const elapsedBeforeCue = cues.slice(0, cueIndex).reduce((sum, c) => sum + c.seconds, 0);

  const {
    showCongrats,
    completeRep: completeFinal,
    isComplete: exerciseComplete,
  } = useRepCompletion({
    totalReps: 1,
    exerciseId,
  });

  // Cleanup timers
  useEffect(() => {
    return () => countdownTimers.current.forEach(clearTimeout);
  }, []);

  // Start handler — begin countdown
  const handleStart = useCallback(() => {
    setHasStartedOnce(true);
    setStatus("countdown");
    countdownTimers.current = [
      setTimeout(() => setStatus("running"), 3000),
    ];
  }, []);

  // Advance cues during running phase
  useEffect(() => {
    if (status !== "running" || !currentCue || exerciseComplete) return;

    const id = setTimeout(() => {
      if (cueIndex < totalCues - 1) {
        setCueIndex((i) => i + 1);
      } else {
        // Last cue done
        setStatus("complete");
        completeFinal();
      }
    }, currentCue.seconds * 1000);

    return () => clearTimeout(id);
  }, [status, cueIndex, currentCue, totalCues, exerciseComplete, completeFinal]);

  // Rotate tips every ~8s
  const TIP_ROTATE_SECONDS = 8;
  useEffect(() => {
    if (!tips?.length || (status !== "countdown" && status !== "running")) return;
    const id = setInterval(() => {
      setTipIndex((i) => (i + 1) % tips.length);
    }, TIP_ROTATE_SECONDS * 1000);
    return () => clearInterval(id);
  }, [status, tips]);

  // Smooth overall progress: elapsed cue durations + fraction of current cue
  const [cueElapsed, setCueElapsed] = useState(0);
  useEffect(() => {
    if (status !== "running" || !currentCue || exerciseComplete) return;
    const start = performance.now();
    let raf: number;
    const tick = () => {
      setCueElapsed(Math.min((performance.now() - start) / 1000, currentCue.seconds));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [status, cueIndex, currentCue, exerciseComplete]);

  const overallProgress = exerciseComplete
    ? 1
    : status === "running" && totalDuration > 0
      ? (elapsedBeforeCue + cueElapsed) / totalDuration
      : 0;

  const handleRestart = useCallback(() => {
    setStatus("ready");
    setCueIndex(0);
    setTipIndex(0);
  }, []);

  // ── Layout constants ──────────────────────────────────────────────────────
  const topSlotMinH = "min-h-[4.5rem]";
  const bottomSlotMinH = "min-h-[4.5rem]";

  // ── Ready / Countdown ─────────────────────────────────────────────────────
  if (status === "ready" || status === "countdown") {
    return (
      <>
        <div className="relative flex-1 min-h-0 flex flex-col items-center justify-center gap-8 px-6">
          <div className={`${topSlotMinH} w-full flex flex-col items-center justify-end text-center`}>
            {status === "countdown" && (
              <p className="text-2xl font-medium text-white mb-1">Starting in</p>
            )}
          </div>

          <div className="shrink-0">
            {status === "ready" ? (
              <button
                type="button"
                className="relative w-40 h-40 cursor-pointer select-none border-none bg-transparent rounded-full overflow-visible focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:ring-offset-2 focus:ring-offset-[#0f0f1a] before:content-[''] before:absolute before:inset-0 before:rounded-full before:border-[3px] before:border-[rgba(167,139,250,0.8)] before:bg-transparent before:pointer-events-none"
                onClick={handleStart}
              >
                <span className="flex items-center justify-center w-full h-full">
                  <span className="text-xl font-semibold text-white">{hasStartedOnce ? "▶ Restart" : "▶ Start"}</span>
                </span>
              </button>
            ) : (
              <TickingProgressRing
                key="countdown"
                count={3}
                durationSeconds={3}
                secondsPerTick={1}
                onTick={playCountdownClick}
                textSize="text-6xl"
              />
            )}
          </div>

          <div className={`${bottomSlotMinH} flex flex-col items-center justify-start gap-2 min-w-[12rem] max-w-[300px] px-4 text-center`}>
            {status === "ready" ? (
              <>
                <p className="text-sm text-white/70">{exercise.instruction}</p>
                <p className="text-xs text-white/55">Tap when you&apos;re ready</p>
              </>
            ) : tips?.length ? (
              <p className="text-xs text-white/65">
                Tip: {tips[tipIndex]}
              </p>
            ) : null}
          </div>
        </div>

        {/* Bottom panel */}
        <div className="border-t border-white/[0.06] bg-white/[0.02] px-3 sm:px-5 py-2 sm:pt-2.5 sm:pb-1.5 flex flex-row flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-4 shrink-0">
          <div className="shrink-0 order-first sm:order-0 flex items-center gap-2">
            <ProgressArc progress={0} />
          </div>
          <div className="flex flex-row items-center gap-2 sm:gap-3 flex-1 min-w-0 sm:flex-initial sm:min-w-0 justify-end sm:ml-auto">
            <div className="flex gap-2 flex-1 sm:flex-initial min-w-0">
              {exerciseId > 1 && onPrev && (
                <Button variant="outline" onClick={onPrev} title="Previous exercise" className="flex-1 sm:flex-initial sm:min-w-[6.5rem] px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm min-w-0">
                  ← <span className="hidden sm:inline">Prev</span>
                </Button>
              )}
              <Button onClick={onSkip} title="Skip this step (won't mark as complete)" className="flex-1 sm:flex-initial sm:min-w-[6.5rem] px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm min-w-0">
                Skip →
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Running / Complete ────────────────────────────────────────────────────
  return (
    <>
      <div className="relative flex-1 min-h-0 flex flex-col items-center justify-center gap-8 px-6">
        {/* Instruction overlay (top) */}
        {exercise.instruction && (
          <div className="absolute top-2 left-0 right-0 z-10 pointer-events-none flex justify-center px-12">
            <Text variant="caption" color="muted-1" className="text-center leading-snug max-w-[320px]">
              {exercise.instruction}
            </Text>
          </div>
        )}

        {/* Cue card — 2 lines (matches Farinelli format) */}
        <div className={`${topSlotMinH} w-full flex flex-col items-center justify-end text-center`}>
          {currentCue && (
            <>
              <p className="text-2xl font-medium text-white mb-1">
                {currentCue.text}
              </p>
              <p className="text-white/65 text-sm">
                {cueIndex + 1} of {totalCues}
              </p>
            </>
          )}
        </div>

        {/* Progress ring */}
        {currentCue && status === "running" && (
          <TickingProgressRing
            key={`cue-${cueIndex}`}
            count={currentCue.seconds}
            durationSeconds={currentCue.seconds}
            secondsPerTick={1}
            onTick={playCountdownClick}
          />
        )}

        {/* Tips (bottom) */}
        <div className={`${bottomSlotMinH} flex flex-col items-center justify-start max-w-[280px]`}>
          {tips?.length ? (
            <p className="text-xs text-white/65 text-center">
              Tip: {tips[tipIndex]}
            </p>
          ) : null}
        </div>

        <CongratsOverlay show={showCongrats} />
      </div>

      {/* Bottom panel */}
      <div className="border-t border-white/[0.06] bg-white/[0.02] px-3 sm:px-5 py-2 sm:pt-2.5 sm:pb-1.5 flex flex-row flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-4 shrink-0">
        <div className="shrink-0 order-first sm:order-0 flex items-center gap-2">
          <ProgressArc progress={exerciseComplete ? 1 : overallProgress} complete={exerciseComplete} />
        </div>
        <div className="flex flex-row items-center gap-2 sm:gap-3 flex-1 min-w-0 sm:flex-initial sm:min-w-0 justify-end sm:ml-auto">
          {exerciseComplete && (
            <Button
              variant="outline"
              onClick={handleRestart}
              className="shrink-0 px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm"
              title="Restart exercise"
            >
              ▶ Restart
            </Button>
          )}
          <div className="flex gap-2 flex-1 sm:flex-initial min-w-0">
            {exerciseId > 1 && onPrev && (
              <Button variant="outline" onClick={onPrev} title="Previous exercise" className="flex-1 sm:flex-initial sm:min-w-[6.5rem] px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm min-w-0">
                ← <span className="hidden sm:inline">Prev</span>
              </Button>
            )}
            {(exerciseComplete || isAlreadyCompleted) ? (
              <Button onClick={onComplete} className="flex-1 sm:flex-initial sm:min-w-[6.5rem] px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm min-w-0">
                {isLast ? "Complete ✓" : "Next →"}
              </Button>
            ) : (
              <Button onClick={onSkip} title="Skip this step (won't mark as complete)" className="flex-1 sm:flex-initial sm:min-w-[6.5rem] px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm min-w-0">
                Skip →
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
