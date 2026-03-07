"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export type PitchDetectionStatus =
  | "idle"
  | "requesting-mic"
  | "loading-model"
  | "listening"
  | "error";

interface PitchDetectionState {
  pitchHz: number | null;
  status: PitchDetectionStatus;
  error: string | null;
  startListening: () => Promise<void>;
  stopListening: () => void;
}

// ml5 CREPE model hosted on the ml5 CDN
const CREPE_MODEL_URL =
  "https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/";

export function usePitchDetection(): PitchDetectionState {
  const [pitchHz, setPitchHz] = useState<number | null>(null);
  const [status, setStatus] = useState<PitchDetectionStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const detectorRef = useRef<{ getPitch: (cb: (err: Error | null, freq: number | null) => void) => void } | null>(null);
  const activeRef = useRef(false);

  /** Recursive loop: ask ml5 for a new pitch, update state, repeat */
  const pollPitch = useCallback(() => {
    if (!activeRef.current || !detectorRef.current) return;

    detectorRef.current.getPitch((err: Error | null, freq: number | null) => {
      if (!activeRef.current) return;
      setPitchHz(freq && freq > 50 && freq < 2000 ? freq : null);
      pollPitch();
    });
  }, []);

  const startListening = useCallback(async () => {
    try {
      setError(null);
      setStatus("requesting-mic");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false },
        video: false,
      });
      streamRef.current = stream;

      setStatus("loading-model");

      const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioCtxRef.current = audioCtx;

      // ml5 must be loaded client-side only (no SSR)
      const ml5 = await import("ml5");

      activeRef.current = true;

      // ml5.pitchDetection returns synchronously; model-ready fires the callback
      detectorRef.current = ml5.pitchDetection(
        CREPE_MODEL_URL,
        audioCtx,
        stream,
        () => {
          // Model loaded — start polling
          setStatus("listening");
          pollPitch();
        }
      );
    } catch (err) {
      activeRef.current = false;
      const msg =
        err instanceof Error ? err.message : "Could not start pitch detection";
      setError(msg);
      setStatus("error");
    }
  }, [pollPitch]);

  const stopListening = useCallback(() => {
    activeRef.current = false;
    detectorRef.current = null;
    setPitchHz(null);
    setStatus("idle");

    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    audioCtxRef.current?.close();
    audioCtxRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      activeRef.current = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioCtxRef.current?.close();
    };
  }, []);

  return { pitchHz, status, error, startListening, stopListening };
}
