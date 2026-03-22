"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui";
import type { LearnVoiceDrivenConfig } from "@/constants/journey";

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
  text: string;
}

type Status = "ready" | "loading" | "playing" | "complete";

// ── Audio loading ────────────────────────────────────────────────────────────

const VOICE_BASE_URL = process.env.NEXT_PUBLIC_VOICE_BASE_URL ?? "";

async function loadSegment(
  baseUrl: string,
  name: string,
  text: string,
): Promise<LoadedSegment> {
  const fullBase = `${VOICE_BASE_URL}/${baseUrl}`;
  const audioUrl = `${fullBase}/${name}.mp3`;
  const timestampsUrl = `${fullBase}/${name}.timestamps.json`;

  const [timestamps, audioBlob] = await Promise.all([
    fetch(timestampsUrl).then((r) => r.json()) as Promise<SegmentTimestamps>,
    fetch(audioUrl).then((r) => r.blob()),
  ]);

  const audio = new Audio(URL.createObjectURL(audioBlob));
  await new Promise<void>((resolve, reject) => {
    audio.addEventListener("canplaythrough", () => resolve(), { once: true });
    audio.addEventListener("error", () => reject(new Error(`Failed to load ${audioUrl}`)), { once: true });
    audio.load();
  });

  return { name, audio, timestamps, text };
}

// ── Player component ─────────────────────────────────────────────────────────

function LearnVoiceDrivenPlayer({
  voiceBaseUrl,
  segments: segmentConfigs,
  onComplete,
}: {
  voiceBaseUrl: string;
  segments: { name: string; text: string }[];
  onComplete?: () => void;
}) {
  const [status, setStatus] = useState<Status>("ready");
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  // Lines that have been fully spoken (accumulated)
  const [completedLines, setCompletedLines] = useState<string[]>([]);
  // Words revealed so far in the current segment
  const [revealedWords, setRevealedWords] = useState<string[]>([]);

  const segmentsRef = useRef<LoadedSegment[]>([]);
  const animFrameRef = useRef<number>(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const preloadPromiseRef = useRef<Promise<void> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Preload in background
  useEffect(() => {
    preloadPromiseRef.current = (async () => {
      try {
        const loaded = await Promise.all(
          segmentConfigs.map((s) => loadSegment(voiceBaseUrl, s.name, s.text)),
        );
        segmentsRef.current = loaded;
      } catch (err) {
        console.error("Failed to preload voice segments:", err);
      }
    })();
  }, [voiceBaseUrl, segmentConfigs]);

  // Auto-scroll to bottom as text accumulates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [completedLines, revealedWords]);

  const playSegment = useCallback((index: number) => {
    const segments = segmentsRef.current;
    if (index >= segments.length) {
      setStatus("complete");
      setRevealedWords([]);
      onCompleteRef.current?.();
      return;
    }

    setCurrentSegmentIndex(index);
    const segment = segments[index];
    const audio = segment.audio;
    const words = segment.timestamps.words.filter((w) => w.type === "word");

    // Track words progressively
    function updateDisplay() {
      const currentTime = audio.currentTime;
      let count = 0;

      for (let i = 0; i < words.length; i++) {
        if (currentTime >= words[i].start) {
          count = i + 1;
        } else {
          break;
        }
      }

      if (count > 0) setRevealedWords(words.slice(0, count).map((w) => w.text));
      if (!audio.paused && !audio.ended) {
        animFrameRef.current = requestAnimationFrame(updateDisplay);
      }
    }

    audio.onplay = () => {
      animFrameRef.current = requestAnimationFrame(updateDisplay);
    };

    audio.onended = () => {
      cancelAnimationFrame(animFrameRef.current);
      // Move current line to completed, clear current
      setCompletedLines((prev) => [...prev, segment.text]);
      setRevealedWords([]);
      // Pause between segments, then play next
      setTimeout(() => playSegment(index + 1), 1500);
    };

    audio.play().catch(console.error);
  }, []);

  async function handleStart() {
    setStatus("loading");
    if (preloadPromiseRef.current) await preloadPromiseRef.current;
    setStatus("playing");
    playSegment(0);
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      segmentsRef.current.forEach((s) => {
        s.audio.pause();
        s.audio.src = "";
      });
    };
  }, []);

  // Auto-start after 1s
  useEffect(() => {
    if (status !== "ready") return;
    const timer = setTimeout(() => handleStart(), 1000);
    return () => clearTimeout(timer);
  }, [status]);

  if (status === "loading" || status === "ready") {
    return null;
  }

  // Playing or complete
  return (
    <div className="flex flex-col h-full px-6 py-8">
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto flex flex-col justify-center gap-3"
      >
        {completedLines.map((line, i) => (
          <p
            key={i}
            className="text-base leading-relaxed text-white/60 transition-colors duration-500"
          >
            {line}
          </p>
        ))}
        {revealedWords.length > 0 && (
          <p className="text-base leading-relaxed text-white font-medium">
            {revealedWords.map((word, i) => (
              <span
                key={i}
                className="inline animate-in fade-in slide-in-from-bottom-1 duration-300"
              >
                {i > 0 ? " " : ""}{word}
              </span>
            ))}
          </p>
        )}
      </div>

      {status === "playing" && (
        <div className="mt-6 flex justify-center">
          <div className="flex gap-1">
            {segmentConfigs.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  i < currentSegmentIndex
                    ? "bg-violet-400"
                    : i === currentSegmentIndex
                      ? "bg-violet-400 animate-pulse"
                      : "bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Wrapper ──────────────────────────────────────────────────────────────────

interface LearnVoiceDrivenExerciseProps {
  exercise: LearnVoiceDrivenConfig;
  exerciseId: number;
  isLast: boolean;
  isAlreadyCompleted: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onPrev?: () => void;
}

export function LearnVoiceDrivenExerciseContent({
  exercise,
  exerciseId,
  isLast,
  isAlreadyCompleted,
  onComplete,
  onSkip,
  onPrev,
}: LearnVoiceDrivenExerciseProps) {
  const [exerciseComplete, setExerciseComplete] = useState(false);
  const [prevExerciseId, setPrevExerciseId] = useState(exerciseId);

  if (prevExerciseId !== exerciseId) {
    setPrevExerciseId(exerciseId);
    setExerciseComplete(false);
  }

  return (
    <>
      <div className="relative flex-1 min-h-0 flex items-center justify-center">
        <div className="w-full h-full max-w-lg mx-auto">
          <LearnVoiceDrivenPlayer
            voiceBaseUrl={exercise.voiceBaseUrl}
            segments={exercise.segments}
            onComplete={() => setExerciseComplete(true)}
          />
        </div>
      </div>

      <div className="border-t border-white/6 bg-white/2 px-3 sm:px-5 py-2 sm:pt-2.5 sm:pb-1.5 flex flex-row flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-4 shrink-0">
        <div className="flex flex-row items-center gap-2 sm:gap-3 flex-1 min-w-0 sm:flex-initial sm:min-w-0 justify-end sm:ml-auto">
          <div className="flex gap-2 flex-1 sm:flex-initial min-w-0">
            {exerciseId > 1 && onPrev && (
              <Button
                variant="outline"
                onClick={onPrev}
                title="Previous exercise"
                className="flex-1 sm:flex-initial sm:min-w-26 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm min-w-0"
              >
                ← <span className="hidden sm:inline">Prev</span>
              </Button>
            )}
            {exerciseComplete || isAlreadyCompleted ? (
              <Button
                onClick={onComplete}
                className="flex-1 sm:flex-initial sm:min-w-26 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm min-w-0"
              >
                {isLast ? "Complete ✓" : "Next →"}
              </Button>
            ) : (
              <Button
                onClick={onSkip}
                title="Skip this step (won't mark as complete)"
                className="flex-1 sm:flex-initial sm:min-w-26 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm min-w-0"
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
