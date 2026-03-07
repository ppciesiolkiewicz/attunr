"use client";

import { useRef, useCallback } from "react";

const TONE_DURATION_MS = 1800;
const FADE_IN_S = 0.02;
const FADE_OUT_S = 0.2;

export function useTonePlayer() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback((): AudioContext => {
    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
        const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new Ctx();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playTone = useCallback(
    (frequencyHz: number, durationMs = TONE_DURATION_MS) => {
      const ctx = getCtx();
      const now = ctx.currentTime;
      const dur = durationMs / 1000;

      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(frequencyHz, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.42, now + FADE_IN_S);
      gain.gain.setValueAtTime(0.42, now + dur - FADE_OUT_S);
      gain.gain.linearRampToValueAtTime(0, now + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + dur);
    },
    [getCtx]
  );

  return { playTone };
}
