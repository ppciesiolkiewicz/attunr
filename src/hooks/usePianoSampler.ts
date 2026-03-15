"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import * as Tone from "tone";
import { hzToNoteName } from "@/lib/pitch";

interface UsePianoSamplerReturn {
  /** Play a note at a given frequency for a duration. */
  playNote: (frequencyHz: number, durationSec: number, delaySec?: number) => void;
  /** Schedule an entire timeline of notes at once for drift-free playback. */
  scheduleMelody: (notes: { frequencyHz: number; startSec: number; durationSec: number }[]) => void;
  /** Stop all scheduled notes and reset transport. */
  stop: () => void;
  isLoaded: boolean;
}

const SAMPLE_MAP: Record<string, string> = {
  G3: "/instruments/PIANO/pianoG3.wav",
  C4: "/instruments/PIANO/pianoC4.wav",
  G4: "/instruments/PIANO/pianoG4.wav",
  C5: "/instruments/PIANO/pianoC5.wav",
  G5: "/instruments/PIANO/pianoG5.wav",
  C6: "/instruments/PIANO/pianoC6.wav",
};

export function usePianoSampler(): UsePianoSamplerReturn {
  const samplerRef = useRef<Tone.Sampler | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const sampler = new Tone.Sampler({
      urls: SAMPLE_MAP,
      onload: () => setIsLoaded(true),
    }).toDestination();

    samplerRef.current = sampler;

    return () => {
      Tone.getTransport().stop();
      Tone.getTransport().cancel();
      sampler.dispose();
      samplerRef.current = null;
      setIsLoaded(false);
    };
  }, []);

  const playNote = useCallback(
    (frequencyHz: number, durationSec: number, delaySec = 0) => {
      const sampler = samplerRef.current;
      if (!sampler || !isLoaded) return;

      const note = hzToNoteName(frequencyHz);
      const transport = Tone.getTransport();
      transport.schedule((time) => {
        sampler.triggerAttackRelease(note, durationSec, time);
      }, `+${delaySec}`);

      if (transport.state !== "started") {
        transport.start();
      }
    },
    [isLoaded],
  );

  const scheduleMelody = useCallback(
    (notes: { frequencyHz: number; startSec: number; durationSec: number }[]) => {
      const sampler = samplerRef.current;
      if (!sampler || !isLoaded) return;

      const transport = Tone.getTransport();
      transport.stop();
      transport.cancel();
      transport.position = 0;

      for (const n of notes) {
        const note = hzToNoteName(n.frequencyHz);
        transport.schedule((time) => {
          sampler.triggerAttackRelease(note, n.durationSec, time);
        }, n.startSec);
      }

      transport.start();
    },
    [isLoaded],
  );

  const stop = useCallback(() => {
    const transport = Tone.getTransport();
    transport.stop();
    transport.cancel();
    transport.position = 0;
    samplerRef.current?.releaseAll();
  }, []);

  return { playNote, scheduleMelody, stop, isLoaded };
}
