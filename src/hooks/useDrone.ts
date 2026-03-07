"use client";

import { useRef, useCallback, useEffect } from "react";
import type { ChakraId } from "@/constants/chakras";

const BEAT_HZ: Record<ChakraId, number> = {
  "root":         3,
  "sacral":       6,
  "solar-plexus": 10,
  "heart":        8,
  "throat":       14,
  "third-eye":    6,
  "crown":        4,
};

const FADE_IN_S  = 0.8;
const FADE_OUT_S = 1.2;
const DRONE_GAIN = 0.15;
const OVERTONE_GAIN = 0.05;
const BINAURAL_R_GAIN = 0.12;

interface DroneNodes {
  fundamental: OscillatorNode;
  overtone: OscillatorNode;
  binauralR: OscillatorNode;
  merger: ChannelMergerNode;
  gain: GainNode;
}

export function useDrone() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<DroneNodes | null>(null);
  const activeRef = useRef(false);

  const getCtx = useCallback((): AudioContext => {
    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
      const Ctx =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      audioCtxRef.current = new Ctx();
    }
    if (audioCtxRef.current.state === "suspended") audioCtxRef.current.resume();
    return audioCtxRef.current;
  }, []);

  const stop = useCallback(() => {
    if (!nodesRef.current || !activeRef.current) return;
    activeRef.current = false;
    const { gain, fundamental, overtone, binauralR } = nodesRef.current;
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(0, now + FADE_OUT_S);
    setTimeout(() => {
      try { fundamental.stop(); overtone.stop(); binauralR.stop(); } catch {/* already stopped */}
      nodesRef.current = null;
    }, (FADE_OUT_S + 0.1) * 1000);
  }, []);

  const start = useCallback((frequencyHz: number, chakraId: ChakraId, binaural: boolean) => {
    // Stop any existing drone first
    stop();

    const ctx = getCtx();
    const now = ctx.currentTime;
    const beatHz = BEAT_HZ[chakraId];

    // Master gain with fade-in
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(1, now + FADE_IN_S);
    gain.connect(ctx.destination);

    const merger = ctx.createChannelMerger(2);
    merger.connect(gain);

    // Fundamental oscillator (left channel / mono)
    const fundamental = ctx.createOscillator();
    fundamental.type = "sine";
    fundamental.frequency.value = frequencyHz;
    const gFund = ctx.createGain();
    gFund.gain.value = DRONE_GAIN;
    fundamental.connect(gFund);
    gFund.connect(merger, 0, 0); // left
    gFund.connect(merger, 0, 1); // right (mono base)

    // Soft overtone (octave up) — adds warmth
    const overtone = ctx.createOscillator();
    overtone.type = "sine";
    overtone.frequency.value = frequencyHz * 2;
    const gOver = ctx.createGain();
    gOver.gain.value = OVERTONE_GAIN;
    overtone.connect(gOver);
    gOver.connect(merger, 0, 0);

    // Binaural R oscillator (right channel offset)
    const binauralR = ctx.createOscillator();
    binauralR.type = "sine";
    binauralR.frequency.value = binaural ? frequencyHz + beatHz : frequencyHz;
    const gBin = ctx.createGain();
    gBin.gain.value = binaural ? BINAURAL_R_GAIN : 0;
    binauralR.connect(gBin);
    gBin.connect(merger, 0, 1);

    fundamental.start(now);
    overtone.start(now);
    binauralR.start(now);

    nodesRef.current = { fundamental, overtone, binauralR, merger, gain };
    activeRef.current = true;
  }, [getCtx, stop]);

  const isPlaying = useCallback(() => activeRef.current, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      activeRef.current = false;
      if (nodesRef.current) {
        try {
          nodesRef.current.fundamental.stop();
          nodesRef.current.overtone.stop();
          nodesRef.current.binauralR.stop();
        } catch {/* ok */}
      }
      audioCtxRef.current?.close();
    };
  }, []);

  return { start, stop, isPlaying };
}
