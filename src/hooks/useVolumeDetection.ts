"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export type VolumeDetectionStatus =
  | "idle"
  | "requesting-mic"
  | "listening"
  | "error";

interface VolumeDetectionState {
  /** Current RMS volume level (0–1), updated ~30fps. */
  volume: number;
  /** Whether sound is currently detected above threshold. */
  isActive: boolean;
  status: VolumeDetectionStatus;
  error: string | null;
  startListening: () => Promise<void>;
  stopListening: () => void;
}

import { SILENCE_THRESHOLD, VOLUME_SAMPLE_INTERVAL_MS } from "@/constants/settings";

export function useVolumeDetection(): VolumeDetectionState {
  const [volume, setVolume] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<VolumeDetectionStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sample = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const data = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(data);

    // Compute RMS
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i] * data[i];
    }
    const rms = Math.sqrt(sum / data.length);

    setVolume(rms);
    setIsActive(rms > SILENCE_THRESHOLD);
  }, []);

  const startListening = useCallback(async () => {
    try {
      setError(null);
      setStatus("requesting-mic");

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Microphone not supported.");
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: false, noiseSuppression: false },
          video: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      }
      streamRef.current = stream;

      const AudioCtx =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioCtxRef.current = audioCtx;

      if (audioCtx.state === "suspended") {
        await audioCtx.resume();
      }

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      intervalRef.current = setInterval(sample, VOLUME_SAMPLE_INTERVAL_MS);

      setStatus("listening");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start volume detection");
      setStatus("error");
    }
  }, [sample]);

  const stopListening = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    analyserRef.current = null;
    setVolume(0);
    setIsActive(false);
    setStatus("idle");

    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    audioCtxRef.current?.close();
    audioCtxRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioCtxRef.current?.close();
    };
  }, []);

  return { volume, isActive, status, error, startListening, stopListening };
}
