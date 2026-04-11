"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRepCompletion, CongratsOverlay } from "@/features/rep-progress";
import { Button } from "@/components/ui";
import type { FarinelliVoiceDrivenConfig } from "@/constants/journey";
import { FARINELLI_TIPS } from "@/constants/farinelli-tips";

// ── Types ────────────────────────────────────────────────────────────────────

interface TimestampWord {
  text: string;
  start: number;
  end: number;
  type: "word" | "spacing" | "audio_event";
}

interface SegmentTimestamps {
  text: string;
  words: TimestampWord[];
}

interface LoadedSegment {
  name: string;
  audio: HTMLAudioElement;
  timestamps: SegmentTimestamps;
}

type Status = "loading" | "ready" | "playing" | "complete";
type BreathPhase = "inhale" | "hold" | "exhale" | null;

function getBreathPhase(segmentName: string): BreathPhase {
  if (segmentName === "countdown") return "exhale";
  if (segmentName.startsWith("inhale-")) return "inhale";
  if (segmentName.startsWith("hold-")) return "hold";
  if (segmentName.startsWith("exhale-")) return "exhale";
  return null;
}

const COUNTDOWN_TEXT =
  "Inhale, hold, and exhale to the same count — each cycle adds one beat and flows straight into the next.";

function getPhaseLabel(phase: BreathPhase, cycleCount: number): string | null {
  if (!phase) return null;
  if (phase === "inhale") return `Breathe in for ${cycleCount}`;
  if (phase === "hold") return `Hold for ${cycleCount}`;
  return `Breathe out for ${cycleCount}`;
}

function isCountdown(segmentName: string): boolean {
  return segmentName === "countdown";
}

// ── Segment helpers ──────────────────────────────────────────────────────────

function buildSegmentNames(minCount: number, maxCount: number): string[] {
  const names: string[] = ["countdown"];

  for (let n = minCount; n <= maxCount; n++) {
    names.push(`inhale-${n}`, `hold-${n}`, `exhale-${n}`);
  }

  return names;
}

import { voiceUrl } from "@/lib/voice-url";

async function loadSegment(
  baseUrl: string,
  name: string,
): Promise<LoadedSegment> {
  const audioUrl = voiceUrl(`${baseUrl}/${name}.mp3`);
  const timestampsUrl = voiceUrl(`${baseUrl}/${name}.timestamps.json`);

  const [timestamps, audioBlob] = await Promise.all([
    fetch(timestampsUrl).then((r) => r.json()) as Promise<SegmentTimestamps>,
    fetch(audioUrl).then((r) => r.blob()),
  ]);

  const audio = new Audio(URL.createObjectURL(audioBlob));
  // Wait until audio is ready to play
  await new Promise<void>((resolve, reject) => {
    audio.addEventListener("canplaythrough", () => resolve(), { once: true });
    audio.addEventListener(
      "error",
      () => reject(new Error(`Failed to load ${audioUrl}`)),
      { once: true },
    );
    audio.load();
  });

  return {
    name,
    audio,
    timestamps,
  };
}

// ── Component ────────────────────────────────────────────────────────────────

function FarinelliVoiceDrivenPlayer({
  minCount,
  maxCount,
  voiceBaseUrl,
  onComplete,
}: {
  minCount: number;
  maxCount: number;
  voiceBaseUrl: string;
  onComplete?: () => void;
}) {
  const [status, setStatus] = useState<Status>("loading");
  const [displayText, setDisplayText] = useState("");
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [breathPhase, setBreathPhase] = useState<BreathPhase>(null);
  const [segmentDuration, setSegmentDuration] = useState(0);
  const [phaseLabel, setPhaseLabel] = useState<string | null>(null);
  const [inCountdown, setInCountdown] = useState(false);
  const [tipText, setTipText] = useState("");

  const segmentsRef = useRef<LoadedSegment[]>([]);
  const segmentNames = useRef(buildSegmentNames(minCount, maxCount));
  const animFrameRef = useRef<number>(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const tipIndexRef = useRef(0);
  const tipTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const loadedMapRef = useRef<Map<string, LoadedSegment>>(new Map());

  // Preload all audio before showing start button
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const uniqueNames = [...new Set(segmentNames.current)];
        const loaded = await Promise.all(
          uniqueNames.map((name) => loadSegment(voiceBaseUrl, name)),
        );

        if (cancelled) return;

        loadedMapRef.current = new Map(loaded.map((s) => [s.name, s]));

        // Build full ordered list
        segmentsRef.current = segmentNames.current.map((name) => {
          const seg = loadedMapRef.current.get(name)!;
          return {
            ...seg,
            audio: new Audio(seg.audio.src),
          };
        });

        if (!cancelled) setStatus("ready");
      } catch (err) {
        console.error("Failed to preload voice segments:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [voiceBaseUrl]);

  // Play current segment and track word timestamps
  const playSegment = useCallback((index: number) => {
    const segments = segmentsRef.current;
    if (index >= segments.length) {
      setStatus("complete");
      setDisplayText("");
      setTipText("");
      setPhaseLabel(null);
      if (tipTimerRef.current) clearTimeout(tipTimerRef.current);
      onCompleteRef.current?.();
      return;
    }

    setCurrentSegmentIndex(index);
    const segment = segments[index];
    const audio = segment.audio;
    const words = segment.timestamps.words.filter((w) => w.type === "word");

    const phase = getBreathPhase(segment.name);
    setBreathPhase(phase);
    const isCountdownSegment = isCountdown(segment.name);
    setInCountdown(isCountdownSegment);
    if (isCountdownSegment) {
      setPhaseLabel("Exhale all the air out");
    } else {
      const cycle = Math.floor((index - 1) / 3);
      setPhaseLabel(getPhaseLabel(phase, minCount + cycle));
    }
    // Use actual audio duration so the ring fills exactly until the audio ends
    setSegmentDuration(phase ? audio.duration : 0);

    // Track current word based on audio time
    function updateDisplay() {
      const currentTime = audio.currentTime;
      let currentWord = "";

      for (let i = words.length - 1; i >= 0; i--) {
        if (currentTime >= words[i].start) {
          currentWord = words[i].text.replace(/[.,!?]/g, "");
          break;
        }
      }

      if (currentWord) setDisplayText(currentWord);
      if (!audio.paused && !audio.ended) {
        animFrameRef.current = requestAnimationFrame(updateDisplay);
      }
    }

    audio.onplay = () => {
      animFrameRef.current = requestAnimationFrame(updateDisplay);
    };

    audio.onended = () => {
      cancelAnimationFrame(animFrameRef.current);
      playSegment(index + 1);
    };

    audio.play().catch(console.error);
  }, []);

  const showNextTip = useCallback(() => {
    setTipText(FARINELLI_TIPS[tipIndexRef.current % FARINELLI_TIPS.length]);
    tipIndexRef.current++;
  }, []);

  function handleStart() {
    setStatus("playing");
    playSegment(0);
    // Show text tips on interval — first after 10s, then every 15s
    tipTimerRef.current = setTimeout(function scheduleTip() {
      showNextTip();
      tipTimerRef.current = setTimeout(scheduleTip, 15_000);
    }, 10_000);
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (tipTimerRef.current) clearTimeout(tipTimerRef.current);
      segmentsRef.current.forEach((s) => {
        s.audio.pause();
        s.audio.src = "";
      });
    };
  }, []);

  const totalCycles = maxCount - minCount + 1;
  const cycleIndex = Math.max(
    0,
    Math.floor((currentSegmentIndex - 1) / 3), // -1 for countdown, /3 for inhale+hold+exhale
  );

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-white">
        <p className="text-lg text-white/70">Loading voice guidance...</p>
      </div>
    );
  }

  if (status === "ready") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-8 px-6">
        <div className="min-h-[4.5rem] w-full flex flex-col items-center justify-end text-center" />
        <button
          type="button"
          className="relative w-40 h-40 cursor-pointer select-none border-none bg-transparent rounded-full overflow-visible focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:ring-offset-2 focus:ring-offset-[#0f0f1a] before:content-[''] before:absolute before:inset-0 before:rounded-full before:border-[3px] before:border-[rgba(167,139,250,0.8)] before:bg-transparent before:pointer-events-none"
          onClick={handleStart}
        >
          <span className="flex items-center justify-center w-full h-full">
            <span className="text-xl font-semibold text-white">Start</span>
          </span>
        </button>
        <div className="min-h-[4.5rem] flex flex-col items-center justify-start max-w-75 px-4 text-center">
          <p className="text-sm text-white/70">{COUNTDOWN_TEXT}</p>
        </div>
      </div>
    );
  }

  if (status === "complete") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-white">
        <span className="text-5xl">✓</span>
        <p className="text-xl font-medium">Well done</p>
        <p className="text-white/70 text-sm">
          You completed all {totalCycles} cycles
        </p>
      </div>
    );
  }

  // Playing
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-6">
      <div className="min-h-[4.5rem] w-full flex flex-col items-center justify-end text-center">
        {phaseLabel && (
          <p className="text-2xl font-medium text-white mb-1">{phaseLabel}</p>
        )}
        {currentSegmentIndex > 0 && !inCountdown && (
          <p className="text-white/65 text-sm">
            Cycle {cycleIndex + 1} of {totalCycles}
          </p>
        )}
      </div>

      <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
        <div
          key={`${breathPhase}-${currentSegmentIndex}`}
          className="relative w-40 h-40"
          style={
            breathPhase && segmentDuration > 0
              ? {
                  animation: `farinelli-${breathPhase === "inhale" ? "inflate" : breathPhase === "hold" ? "hold" : "deflate"} ${segmentDuration}s ease-in-out both`,
                  transformOrigin: "center",
                  willChange: "transform",
                }
              : undefined
          }
        >
          <svg className="w-full h-full -rotate-90 block" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="6"
            />
            {breathPhase && segmentDuration > 0 && (
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="rgba(167,139,250,0.9)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 42}
                strokeDashoffset={2 * Math.PI * 42}
                style={{
                  animation: `farinelli-fill ${segmentDuration}s linear forwards`,
                }}
              />
            )}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-light text-white">
              {displayText}
            </span>
          </div>
        </div>
      </div>

      <div className="min-h-[4.5rem] flex flex-col items-center justify-start max-w-75 px-4 text-center">
        {tipText ? (
          <p className="text-xs text-white/65">Tip: {tipText}</p>
        ) : (
          <p className="text-sm text-white/70">{COUNTDOWN_TEXT}</p>
        )}
      </div>
    </div>
  );
}

// ── Wrapper (same pattern as FarinelliBreathworkExerciseContent) ──────────────

interface FarinelliVoiceDrivenExerciseProps {
  exercise: FarinelliVoiceDrivenConfig;
  exerciseId: number;
  isLast: boolean;
  isAlreadyCompleted: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onPrev?: () => void;
}

export function FarinelliVoiceDrivenExerciseContent({
  exercise,
  exerciseId,
  isLast,
  isAlreadyCompleted,
  onComplete,
  onSkip,
  onPrev,
}: FarinelliVoiceDrivenExerciseProps) {
  const [exerciseComplete, setExerciseComplete] = useState(false);
  const [prevExerciseId, setPrevExerciseId] = useState(exerciseId);

  if (prevExerciseId !== exerciseId) {
    setPrevExerciseId(exerciseId);
    setExerciseComplete(false);
  }

  const { showCongrats, completeRep: completeFinal } = useRepCompletion({
    totalReps: 1,
    exerciseId,
  });

  useEffect(() => {
    if (exerciseComplete) completeFinal();
  }, [exerciseComplete, completeFinal]);

  return (
    <>
      <div className="relative flex-1 min-h-0 flex items-center justify-center">
        <FarinelliVoiceDrivenPlayer
          minCount={exercise.minCount}
          maxCount={exercise.maxCount}
          voiceBaseUrl={exercise.voiceBaseUrl}
          onComplete={() => setExerciseComplete(true)}
        />
        <CongratsOverlay show={showCongrats} />
      </div>

      <div className="border-t border-white/[0.06] bg-white/[0.02] px-3 sm:px-5 py-2 sm:pt-2.5 sm:pb-1.5 flex flex-row flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-4 shrink-0">
        <div className="flex flex-row items-center gap-2 sm:gap-3 flex-1 min-w-0 sm:flex-initial sm:min-w-0 justify-end sm:ml-auto">
          <div className="flex gap-2 flex-1 sm:flex-initial min-w-0">
            {exerciseId > 1 && onPrev && (
              <Button
                variant="outline"
                onClick={onPrev}
                title="Previous exercise"
                className="flex-1 sm:flex-initial sm:min-w-[6.5rem] px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm min-w-0"
              >
                ← <span className="hidden sm:inline">Prev</span>
              </Button>
            )}
            {exerciseComplete || isAlreadyCompleted ? (
              <Button
                onClick={onComplete}
                className="flex-1 sm:flex-initial sm:min-w-[6.5rem] px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm min-w-0"
              >
                {isLast ? "Complete ✓" : "Next →"}
              </Button>
            ) : (
              <Button
                onClick={onSkip}
                title="Skip this step (won't mark as complete)"
                className="flex-1 sm:flex-initial sm:min-w-[6.5rem] px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm min-w-0"
              >
                Skip →
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
