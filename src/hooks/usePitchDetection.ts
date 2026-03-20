"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export type PitchDetectionStatus =
  | "idle"
  | "requesting-mic"
  | "loading-model"
  | "listening"
  | "error";

interface PitchDetectionState {
  /** React state — throttled to ~15 fps, use for UI labels only */
  pitchHz: number | null;
  /** Ref — updated synchronously on every CREPE result, use for canvas */
  pitchHzRef: React.RefObject<number | null>;
  status: PitchDetectionStatus;
  error: string | null;
  startListening: () => Promise<void>;
  stopListening: () => void;
}

const CREPE_MODEL_URL =
  "https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/";

import { MIN_VOICE_HZ, MAX_VOICE_HZ } from "@/constants/settings";

/** How often to push React state updates (for UI labels). Canvas uses the ref. */
const UI_THROTTLE_MS = 66; // ~15 fps

export function usePitchDetection(): PitchDetectionState {
  const [pitchHz, setPitchHz] = useState<number | null>(null);
  const [status, setStatus] = useState<PitchDetectionStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  // Ref written synchronously in the CREPE callback — no React scheduling delay.
  // The canvas RAF loop reads from this directly.
  const pitchHzRef = useRef<number | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<{
    getPitch: (cb: (err: Error | null, freq: number | null) => void) => void;
  } | null>(null);
  const activeRef = useRef(false);
  const lastUiUpdateRef = useRef(0);

  const pollPitch = useCallback(() => {
    if (!activeRef.current || !detectorRef.current) return;

    detectorRef.current.getPitch((_, freq) => {
      if (!activeRef.current) return;

      const valid = freq && freq > MIN_VOICE_HZ && freq < MAX_VOICE_HZ ? freq : null;

      // ① Write ref immediately — canvas sees this on its very next RAF tick
      pitchHzRef.current = valid;

      // ② Throttle React state — only for the overlay / status label in the UI
      const now = performance.now();
      if (now - lastUiUpdateRef.current > UI_THROTTLE_MS) {
        setPitchHz(valid);
        lastUiUpdateRef.current = now;
      }

      pollPitch();
    });
  }, []);

  const startListening = useCallback(async () => {
    try {
      setError(null);
      setStatus("requesting-mic");

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Microphone not supported. Use HTTPS and a modern browser.");
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: false, noiseSuppression: false },
          video: false,
        });
      } catch {
        // Fallback: simpler constraints for mobile (iOS/Safari can reject strict constraints)
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      }
      streamRef.current = stream;

      setStatus("loading-model");

      const AudioCtx =
        window.AudioContext ??
        (
          window as unknown as {
            webkitAudioContext: typeof AudioContext;
          }
        ).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioCtxRef.current = audioCtx;

      // iOS Safari: AudioContext starts suspended; must resume (often needs user gesture)
      if (audioCtx.state === "suspended") {
        await audioCtx.resume();
      }

      const ml5 = await import("ml5");
      activeRef.current = true;

      detectorRef.current = ml5.pitchDetection(
        CREPE_MODEL_URL,
        audioCtx,
        stream,
        () => {
          setStatus("listening");
          pollPitch();
        }
      );
    } catch (err) {
      activeRef.current = false;
      const isDenied =
        err instanceof DOMException &&
        (err.name === "NotAllowedError" || err.name === "PermissionDeniedError");
      setError(
        isDenied
          ? "mic-permission-denied"
          : err instanceof Error
            ? err.message
            : "Could not start pitch detection"
      );
      setStatus("error");
    }
  }, [pollPitch]);

  const stopListening = useCallback(() => {
    activeRef.current = false;
    detectorRef.current = null;
    pitchHzRef.current = null;
    setPitchHz(null);
    setStatus("idle");

    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    audioCtxRef.current?.close();
    audioCtxRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      activeRef.current = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioCtxRef.current?.close();
    };
  }, []);

  return { pitchHz, pitchHzRef, status, error, startListening, stopListening };
}
