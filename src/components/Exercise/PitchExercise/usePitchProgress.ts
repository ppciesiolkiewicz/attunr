import { useState, useRef, useEffect, useCallback } from "react";
import { isInTune, matchesNoteTarget } from "@/lib/pitch";
import type { PitchDetectionConfig, PitchDetectionSlideConfig } from "@/constants/journey";
import type { PitchDetectionExercise, PitchDetectionSlideExercise } from "@/lib/resolve-exercise";

interface UsePitchProgressOptions {
  exercise: PitchDetectionConfig | PitchDetectionSlideConfig;
  exerciseId: number;
  resolved: PitchDetectionExercise | PitchDetectionSlideExercise;
  pitchHzRef: React.RefObject<number | null>;
  enabled?: boolean;
}

export function usePitchProgress({
  exercise,
  exerciseId,
  resolved,
  pitchHzRef,
  enabled = true,
}: UsePitchProgressOptions) {
  const holdRef = useRef(0);
  const seqIndexRef = useRef(0);
  const noteHoldRef = useRef(0);
  const lastTickRef = useRef(0);
  const slideCountRef = useRef(0);
  const slideLastZoneRef = useRef<"high" | "low" | null>(null);
  const noteTransitionTimeRef = useRef(0);

  const [progress, setProgress] = useState(0);
  const [seqIndex, setSeqIndex] = useState(0);
  const [slideCount, setSlideCount] = useState(0);
  const [stageComplete, setStageComplete] = useState(false);
  const [showStepCheck, setShowStepCheck] = useState(false);
  const rafRef = useRef<number | null>(null);

  const resetProgress = useCallback(() => {
    holdRef.current = 0;
    seqIndexRef.current = 0;
    noteHoldRef.current = 0;
    lastTickRef.current = 0;
    slideCountRef.current = 0;
    slideLastZoneRef.current = null;
    noteTransitionTimeRef.current = 0;
    setShowStepCheck(false);
    setProgress(0);
    setSeqIndex(0);
    setSlideCount(0);
    setStageComplete(false);
  }, []);

  useEffect(() => { resetProgress(); }, [exerciseId, resetProgress]);

  // RAF progress loop
  useEffect(() => {
    if (stageComplete) return;

    function tick() {
      if (!enabled) {
        lastTickRef.current = 0; // reset so dt doesn't accumulate
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const now = performance.now();
      const dt = lastTickRef.current ? (now - lastTickRef.current) / 1000 : 0;
      lastTickRef.current = now;

      const hz = pitchHzRef.current;

      if (resolved.exerciseTypeId === "pitch-detection" && resolved.targets.length === 1) {
        const target = resolved.targets[0];
        const holdSeconds = target.seconds;
        const tolerance = 0.03;
        const hasAccept = target.accept !== undefined;
        const inTune =
          hz !== null &&
          (hasAccept
            ? matchesNoteTarget(hz, target.rangeNotes ?? [target.note], target.accept ?? "within")
            : isInTune(hz, target.note.frequencyHz, tolerance));
        if (inTune) holdRef.current += dt;
        const p = holdRef.current / holdSeconds;
        setProgress(p);
        if (p >= 1) setStageComplete(true);
      } else if (resolved.exerciseTypeId === "pitch-detection-slide" && hz !== null) {
        const fromHz = resolved.from.frequencyHz;
        const toHz = resolved.to.frequencyHz;
        const isHighToLow = fromHz > toHz;
        const minFreq = Math.min(fromHz, toHz);
        const maxFreq = Math.max(fromHz, toHz);
        const highThreshold = maxFreq * 0.75;
        const lowThreshold = minFreq * 1.25;
        const inHigh = hz >= highThreshold;
        const inLow = hz <= lowThreshold;
        let lastZone = slideLastZoneRef.current;
        let count = slideCountRef.current;
        if (isHighToLow) {
          if (inHigh) lastZone = "high";
          else if (inLow) {
            if (lastZone === "high") { count++; slideCountRef.current = count; setSlideCount(count); }
            lastZone = "low";
          }
        } else {
          if (inLow) lastZone = "low";
          else if (inHigh) {
            if (lastZone === "low") { count++; slideCountRef.current = count; setSlideCount(count); }
            lastZone = "high";
          }
        }
        slideLastZoneRef.current = lastZone;
        const REQUIRED_SLIDES = 2;
        setProgress(count / REQUIRED_SLIDES);
        if (count >= REQUIRED_SLIDES) setStageComplete(true);
      } else if (resolved.exerciseTypeId === "pitch-detection" && resolved.targets.length > 1) {
        const idx = seqIndexRef.current;
        const target = resolved.targets[idx];
        if (!target) return;
        const noteSeconds = target.seconds;
        const hasAccept = target.accept !== undefined;
        const noteInTune =
          hz !== null &&
          (hasAccept
            ? matchesNoteTarget(hz, target.rangeNotes ?? [target.note], target.accept ?? "within")
            : isInTune(hz, target.note.frequencyHz));
        if (noteInTune) {
          noteHoldRef.current += dt;
          if (noteHoldRef.current >= noteSeconds) {
            noteHoldRef.current = 0;
            seqIndexRef.current = idx + 1;
            noteTransitionTimeRef.current = now;
            setSeqIndex(idx + 1);
            if (seqIndexRef.current < resolved.targets.length) {
              setShowStepCheck(true);
              setTimeout(() => setShowStepCheck(false), 700);
            }
            if (seqIndexRef.current >= resolved.targets.length) {
              setStageComplete(true);
              setProgress(1);
              return;
            }
          }
        } else if (hz !== null) {
          const inGracePeriod = now - noteTransitionTimeRef.current < 400;
          if (!inGracePeriod) {
            noteHoldRef.current = Math.max(0, noteHoldRef.current - dt * 0.3);
          }
        }
        setProgress(
          (seqIndexRef.current + noteHoldRef.current / noteSeconds) /
            resolved.targets.length,
        );
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageComplete, exerciseId, enabled]);

  return { progress, seqIndex, slideCount, stageComplete, showStepCheck, resetProgress };
}
