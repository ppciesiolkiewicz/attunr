import { useState, useRef, useEffect, useCallback } from "react";
import { isInTune, lipRollCredit, matchesBandTarget, resolveBandTarget } from "@/lib/pitch";
import type { PitchDetectionExercise, PitchDetectionSlideExercise } from "@/constants/journey";
import type { Band } from "@/constants/tone-slots";

interface UsePitchProgressOptions {
  exercise: PitchDetectionExercise | PitchDetectionSlideExercise;
  exerciseId: number;
  allBands: Band[];
  exerciseBands: Band[];
  pitchHzRef: React.RefObject<number | null>;
}

export function usePitchProgress({
  exercise,
  exerciseId,
  allBands,
  exerciseBands,
  pitchHzRef,
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
      const now = performance.now();
      const dt = lastTickRef.current ? (now - lastTickRef.current) / 1000 : 0;
      lastTickRef.current = now;

      const hz = pitchHzRef.current;

      if (exercise.exerciseTypeId === "pitch-detection" && exercise.notes.length === 1) {
        const holdSeconds = exercise.notes[0].seconds;
        const target = exercise.notes[0].target;
        const targetBands = resolveBandTarget(target, allBands);
        if (exercise.technique === "lip-rolls" && targetBands.length > 0) {
          const credit = lipRollCredit(hz, targetBands[0].frequencyHz);
          if (credit > 0) holdRef.current += dt * credit;
        } else {
          const lipRollTolerance = exercise.technique === "lip-rolls" ? 0.08 : 0.03;
          const inTune =
            hz !== null &&
            (target.kind === "range"
              ? matchesBandTarget(hz, targetBands, target.accept ?? "within")
              : targetBands.some((t) => isInTune(hz, t.frequencyHz, lipRollTolerance)));
          if (inTune) holdRef.current += dt;
        }
        const p = holdRef.current / holdSeconds;
        setProgress(p);
        if (p >= 1) setStageComplete(true);
      } else if (exercise.exerciseTypeId === "pitch-detection-slide" && hz !== null) {
        const fromBands = resolveBandTarget(exercise.notes[0].from, allBands);
        const toBands = resolveBandTarget(exercise.notes[0].to, allBands);
        const fromHz = fromBands[0]?.frequencyHz ?? 0;
        const toHz = toBands[0]?.frequencyHz ?? 0;
        const isHighToLow = fromHz > toHz;
        const freqs = exerciseBands.map((b) => b.frequencyHz);
        const minFreq = Math.min(...freqs);
        const maxFreq = Math.max(...freqs);
        const isLipRoll = exercise.technique === "lip-rolls";
        const midFreq = (minFreq + maxFreq) / 2;
        const highThreshold = isLipRoll ? midFreq : maxFreq * 0.75;
        const lowThreshold = isLipRoll ? midFreq : minFreq * 1.25;
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
      } else if (exercise.exerciseTypeId === "pitch-detection" && exercise.notes.length > 1) {
        const idx = seqIndexRef.current;
        const noteConfig = exercise.notes[idx];
        if (!noteConfig) return;
        const targetBands = resolveBandTarget(noteConfig.target, allBands);
        const noteSeconds = noteConfig.seconds;
        const tolerance = exercise.technique === "lip-rolls" ? 0.08 : 0.03;
        if (targetBands.length > 0 && hz !== null && targetBands.some((t) => isInTune(hz, t.frequencyHz, tolerance))) {
          noteHoldRef.current += dt;
          if (noteHoldRef.current >= noteSeconds) {
            noteHoldRef.current = 0;
            seqIndexRef.current = idx + 1;
            noteTransitionTimeRef.current = now;
            setSeqIndex(idx + 1);
            if (seqIndexRef.current < exercise.notes.length) {
              setShowStepCheck(true);
              setTimeout(() => setShowStepCheck(false), 700);
            }
            if (seqIndexRef.current >= exercise.notes.length) {
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
            exercise.notes.length,
        );
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageComplete, exerciseId]);

  return { progress, seqIndex, slideCount, stageComplete, showStepCheck, resetProgress };
}
