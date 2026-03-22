"use client";

import { useState, useEffect, useRef, useCallback } from "react";

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

export type VoiceIntroStatus = "idle" | "loading" | "playing" | "paused" | "complete";

export interface VoiceIntroState {
  status: VoiceIntroStatus;
  /** Words revealed so far — displayed with accumulation effect. */
  revealedWords: string[];
  /** Full display text (for fast-forward). */
  fullText: string;
  play: () => void;
  pause: () => void;
  resume: () => void;
  replay: () => void;
  fastForward: () => void;
}

const VOICE_BASE_URL = process.env.NEXT_PUBLIC_VOICE_BASE_URL ?? "";

// ── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Loads and plays a single voice instruction audio with word-level timestamps.
 * Returns status, revealed words, and playback controls.
 */
export function useVoiceIntro(
  instructionUrl: string | undefined,
  timestampsUrl: string | undefined,
  displayText: string,
): VoiceIntroState {
  const [status, setStatus] = useState<VoiceIntroStatus>("idle");
  const [revealedWords, setRevealedWords] = useState<string[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timestampsRef = useRef<TimestampWord[]>([]);
  const animFrameRef = useRef<number>(0);
  const preloadPromiseRef = useRef<Promise<void> | null>(null);

  const hasVoice = !!instructionUrl && !!timestampsUrl;

  // Preload audio + timestamps in background
  useEffect(() => {
    if (!hasVoice) return;

    preloadPromiseRef.current = (async () => {
      try {
        const fullBase = VOICE_BASE_URL;
        const audioUrl = `${fullBase}/${instructionUrl}`;
        const tsUrl = `${fullBase}/${timestampsUrl}`;

        const [timestamps, audioBlob] = await Promise.all([
          fetch(tsUrl).then((r) => r.json()) as Promise<SegmentTimestamps>,
          fetch(audioUrl).then((r) => r.blob()),
        ]);

        const audio = new Audio(URL.createObjectURL(audioBlob));
        await new Promise<void>((resolve, reject) => {
          audio.addEventListener("canplaythrough", () => resolve(), { once: true });
          audio.addEventListener("error", () => reject(new Error(`Failed to load ${audioUrl}`)), { once: true });
          audio.load();
        });

        audioRef.current = audio;
        timestampsRef.current = timestamps.words.filter((w) => w.type === "word");
      } catch (err) {
        console.error("Failed to preload voice intro:", err);
      }
    })();
  }, [instructionUrl, timestampsUrl, hasVoice]);

  // Word reveal animation
  const updateDisplay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const words = timestampsRef.current;
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
  }, []);

  const startPlayback = useCallback(async () => {
    if (!hasVoice) {
      setStatus("complete");
      return;
    }

    setStatus("loading");
    if (preloadPromiseRef.current) await preloadPromiseRef.current;

    const audio = audioRef.current;
    if (!audio) {
      setStatus("complete");
      return;
    }

    setStatus("playing");
    setRevealedWords([]);

    audio.onplay = () => {
      animFrameRef.current = requestAnimationFrame(updateDisplay);
    };

    audio.onended = () => {
      cancelAnimationFrame(animFrameRef.current);
      setRevealedWords(timestampsRef.current.map((w) => w.text));
      setStatus("complete");
    };

    audio.play().catch(console.error);
  }, [hasVoice, updateDisplay]);

  // Auto-start
  useEffect(() => {
    if (!hasVoice || status !== "idle") return;
    const timer = setTimeout(() => startPlayback(), 500);
    return () => clearTimeout(timer);
  }, [hasVoice, status, startPlayback]);

  // No voice — immediately complete
  useEffect(() => {
    if (!hasVoice && status === "idle") {
      setStatus("complete");
    }
  }, [hasVoice, status]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    cancelAnimationFrame(animFrameRef.current);
    setStatus("paused");
  }, []);

  const resume = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 0 && !audio.ended) {
      setStatus("playing");
      audio.play().catch(console.error);
    }
  }, []);

  const replay = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    cancelAnimationFrame(animFrameRef.current);
    setRevealedWords([]);
    startPlayback();
  }, [startPlayback]);

  const fastForward = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    cancelAnimationFrame(animFrameRef.current);
    setRevealedWords(timestampsRef.current.map((w) => w.text));
    setStatus("complete");
  }, []);

  return {
    status,
    revealedWords,
    fullText: displayText,
    play: startPlayback,
    pause,
    resume,
    replay,
    fastForward,
  };
}
