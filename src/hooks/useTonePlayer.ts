"use client";

import { useRef, useCallback } from "react";

/** Fixed binaural beat offset (Hz) — 6 Hz theta for calming/somatic effect */
const BINAURAL_BEAT_HZ = 6;

const TONE_DURATION_MS = 1800;
const FADE_IN_S  = 0.02;
const FADE_OUT_S = 0.2;
const GAIN = 0.42;

export function useTonePlayer() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback((): AudioContext => {
    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
      const Ctx =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      audioCtxRef.current = new Ctx();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  /**
   * Play a tone. When binaural=true, renders a binaural pair:
   *   left ear  → frequencyHz
   *   right ear → frequencyHz + BINAURAL_BEAT_HZ
   * Falls back to mono sine when binaural=false.
   */
  const playTone = useCallback(
    (
      frequencyHz: number,
      options?: { binaural?: boolean; durationMs?: number }
    ) => {
      const ctx = getCtx();
      const {
        binaural = true,
        durationMs = TONE_DURATION_MS,
      } = options ?? {};

      const now = ctx.currentTime;
      const dur = durationMs / 1000;

      // Shared gain envelope (applied after merge)
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, now);
      masterGain.gain.linearRampToValueAtTime(GAIN, now + FADE_IN_S);
      masterGain.gain.setValueAtTime(GAIN, now + dur - FADE_OUT_S);
      masterGain.gain.linearRampToValueAtTime(0, now + dur);
      masterGain.connect(ctx.destination);

      if (binaural) {
        // Stereo: L = base, R = base + beat
        const merger = ctx.createChannelMerger(2);
        merger.connect(masterGain);

        const oscL = ctx.createOscillator();
        oscL.type = "sine";
        oscL.frequency.value = frequencyHz;
        const gL = ctx.createGain();
        gL.gain.value = 1;
        oscL.connect(gL);
        gL.connect(merger, 0, 0);

        const oscR = ctx.createOscillator();
        oscR.type = "sine";
        oscR.frequency.value = frequencyHz + BINAURAL_BEAT_HZ;
        const gR = ctx.createGain();
        gR.gain.value = 1;
        oscR.connect(gR);
        gR.connect(merger, 0, 1);

        oscL.start(now); oscL.stop(now + dur);
        oscR.start(now); oscR.stop(now + dur);
      } else {
        // Mono fallback
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = frequencyHz;
        osc.connect(masterGain);
        osc.start(now);
        osc.stop(now + dur);
      }
    },
    [getCtx]
  );

  /**
   * Play a smooth pitch slide from one frequency to another.
   * Holds the start pitch, glides to the end pitch, then holds.
   */
  const playSlide = useCallback(
    (
      fromHz: number,
      toHz: number,
      options?: {
        holdStartMs?: number;
        slideDurationMs?: number;
        holdEndMs?: number;
        binaural?: boolean;
      }
    ) => {
      const ctx = getCtx();
      const {
        holdStartMs = 1000,
        slideDurationMs = 2500,
        holdEndMs = 1000,
        binaural = true,
      } = options ?? {};

      const now = ctx.currentTime;
      const totalDur = (holdStartMs + slideDurationMs + holdEndMs) / 1000;
      const holdStartS = holdStartMs / 1000;
      const slideS = slideDurationMs / 1000;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, now);
      masterGain.gain.linearRampToValueAtTime(GAIN, now + FADE_IN_S);
      masterGain.gain.setValueAtTime(GAIN, now + totalDur - FADE_OUT_S);
      masterGain.gain.linearRampToValueAtTime(0, now + totalDur);
      masterGain.connect(ctx.destination);

      function scheduleSlide(osc: OscillatorNode, startHz: number, endHz: number) {
        osc.frequency.setValueAtTime(startHz, now);
        osc.frequency.setValueAtTime(startHz, now + holdStartS);
        osc.frequency.exponentialRampToValueAtTime(endHz, now + holdStartS + slideS);
      }

      if (binaural) {
        const merger = ctx.createChannelMerger(2);
        merger.connect(masterGain);

        const oscL = ctx.createOscillator();
        oscL.type = "sine";
        scheduleSlide(oscL, fromHz, toHz);
        const gL = ctx.createGain();
        gL.gain.value = 1;
        oscL.connect(gL);
        gL.connect(merger, 0, 0);

        const oscR = ctx.createOscillator();
        oscR.type = "sine";
        scheduleSlide(oscR, fromHz + BINAURAL_BEAT_HZ, toHz + BINAURAL_BEAT_HZ);
        const gR = ctx.createGain();
        gR.gain.value = 1;
        oscR.connect(gR);
        gR.connect(merger, 0, 1);

        oscL.start(now); oscL.stop(now + totalDur);
        oscR.start(now); oscR.stop(now + totalDur);
      } else {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        scheduleSlide(osc, fromHz, toHz);
        osc.connect(masterGain);
        osc.start(now);
        osc.stop(now + totalDur);
      }
    },
    [getCtx]
  );

  return { playTone, playSlide, getCtx };
}
