"use client";

import { useRef, useCallback } from "react";
import {
  BINAURAL_BEAT_HZ,
  TONE_DURATION_MS,
  TONE_FADE_IN_S,
  TONE_FADE_OUT_S,
  TONE_GAIN,
} from "@/constants/settings";

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
      masterGain.gain.linearRampToValueAtTime(TONE_GAIN, now + TONE_FADE_IN_S);
      masterGain.gain.setValueAtTime(TONE_GAIN, now + dur - TONE_FADE_OUT_S);
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
      masterGain.gain.linearRampToValueAtTime(TONE_GAIN, now + TONE_FADE_IN_S);
      masterGain.gain.setValueAtTime(TONE_GAIN, now + totalDur - TONE_FADE_OUT_S);
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

  /**
   * Play a wobbling tone — sine oscillator with LFO modulating pitch ±20%
   * at ~1.25 Hz (800ms period). Default duration 2500ms.
   */
  const playWobble = useCallback(
    (
      frequencyHz: number,
      options?: { binaural?: boolean; durationMs?: number }
    ) => {
      const ctx = getCtx();
      const {
        binaural = true,
        durationMs = 2500,
      } = options ?? {};

      const now = ctx.currentTime;
      const dur = durationMs / 1000;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, now);
      masterGain.gain.linearRampToValueAtTime(TONE_GAIN, now + TONE_FADE_IN_S);
      masterGain.gain.setValueAtTime(TONE_GAIN, now + dur - TONE_FADE_OUT_S);
      masterGain.gain.linearRampToValueAtTime(0, now + dur);
      masterGain.connect(ctx.destination);

      function attachLfo(osc: OscillatorNode, baseHz: number) {
        const lfo = ctx.createOscillator();
        lfo.type = "sine";
        lfo.frequency.value = 1.25;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = baseHz * 0.2;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start(now);
        lfo.stop(now + dur);
      }

      if (binaural) {
        const merger = ctx.createChannelMerger(2);
        merger.connect(masterGain);

        const oscL = ctx.createOscillator();
        oscL.type = "sine";
        oscL.frequency.value = frequencyHz;
        attachLfo(oscL, frequencyHz);
        const gL = ctx.createGain();
        gL.gain.value = 1;
        oscL.connect(gL);
        gL.connect(merger, 0, 0);

        const oscR = ctx.createOscillator();
        oscR.type = "sine";
        oscR.frequency.value = frequencyHz + BINAURAL_BEAT_HZ;
        attachLfo(oscR, frequencyHz + BINAURAL_BEAT_HZ);
        const gR = ctx.createGain();
        gR.gain.value = 1;
        oscR.connect(gR);
        gR.connect(merger, 0, 1);

        oscL.start(now); oscL.stop(now + dur);
        oscR.start(now); oscR.stop(now + dur);
      } else {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = frequencyHz;
        attachLfo(osc, frequencyHz);
        osc.connect(masterGain);
        osc.start(now);
        osc.stop(now + dur);
      }
    },
    [getCtx]
  );

  /**
   * Play an owl-hoot sound — two sequential hoots.
   * Each hoot starts ~30% above target, swoops down, holds briefly, then fades.
   * ~400ms per hoot, 200ms gap. Total ~1000ms.
   */
  const playOwlHoot = useCallback(
    (
      frequencyHz: number,
      options?: { binaural?: boolean }
    ) => {
      const ctx = getCtx();
      const { binaural = true } = options ?? {};

      const now = ctx.currentTime;
      const hootDur = 0.4;
      const gap = 0.2;
      const startHz = frequencyHz * 1.3;
      const swoopEnd = hootDur * 0.6;

      function scheduleHoot(hootStart: number) {
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0, hootStart);
        masterGain.gain.linearRampToValueAtTime(TONE_GAIN, hootStart + TONE_FADE_IN_S);
        masterGain.gain.setValueAtTime(TONE_GAIN, hootStart + hootDur - TONE_FADE_OUT_S);
        masterGain.gain.linearRampToValueAtTime(0, hootStart + hootDur);
        masterGain.connect(ctx.destination);

        function scheduleSwoop(osc: OscillatorNode, baseStartHz: number, baseEndHz: number) {
          osc.frequency.setValueAtTime(baseStartHz, hootStart);
          osc.frequency.exponentialRampToValueAtTime(baseEndHz, hootStart + swoopEnd);
        }

        if (binaural) {
          const merger = ctx.createChannelMerger(2);
          merger.connect(masterGain);

          const oscL = ctx.createOscillator();
          oscL.type = "sine";
          scheduleSwoop(oscL, startHz, frequencyHz);
          const gL = ctx.createGain();
          gL.gain.value = 1;
          oscL.connect(gL);
          gL.connect(merger, 0, 0);

          const oscR = ctx.createOscillator();
          oscR.type = "sine";
          scheduleSwoop(oscR, startHz + BINAURAL_BEAT_HZ, frequencyHz + BINAURAL_BEAT_HZ);
          const gR = ctx.createGain();
          gR.gain.value = 1;
          oscR.connect(gR);
          gR.connect(merger, 0, 1);

          oscL.start(hootStart); oscL.stop(hootStart + hootDur);
          oscR.start(hootStart); oscR.stop(hootStart + hootDur);
        } else {
          const osc = ctx.createOscillator();
          osc.type = "sine";
          scheduleSwoop(osc, startHz, frequencyHz);
          osc.connect(masterGain);
          osc.start(hootStart);
          osc.stop(hootStart + hootDur);
        }
      }

      scheduleHoot(now);
      scheduleHoot(now + hootDur + gap);
    },
    [getCtx]
  );

  return { playTone, playSlide, playWobble, playOwlHoot, getCtx };
}
