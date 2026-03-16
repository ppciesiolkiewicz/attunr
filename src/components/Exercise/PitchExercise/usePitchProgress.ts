import { useState, useRef, useEffect, useCallback } from "react";
import { isInTune, matchesNoteTarget } from "@/lib/pitch";
import { Scale } from "@/lib/scale";
import type { PitchDetectionExercise, PitchDetectionSlideExercise } from "@/constants/journey";
import type { ResolvedNote } from "@/constants/tone-slots";

interface UsePitchProgressOptions {
  exercise: PitchDetectionExercise | PitchDetectionSlideExercise;
  exerciseId: number;
  scale: Scale;
  exerciseNotes: ResolvedNote[];
  pitchHzRef: React.RefObject<number | null>;
}

export function usePitchProgress({
  exercise,
  exerciseId,
  scale,
  exerciseNotes,
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
        const targetNotes = scale.resolve(target);
        const tolerance = 0.03;
        const inTune =
          hz !== null &&
          (target.kind === "range"
            ? matchesNoteTarget(hz, targetNotes, target.accept ?? "within")
            : targetNotes.some((t) => isInTune(hz, t.frequencyHz, tolerance)));
        if (inTune) holdRef.current += dt;
        const p = holdRef.current / holdSeconds;
        setProgress(p);
        if (p >= 1) setStageComplete(true);
      } else if (exercise.exerciseTypeId === "pitch-detection-slide" && hz !== null) {
        const fromNotes = scale.resolve(exercise.notes[0].from);
        const toNotes = scale.resolve(exercise.notes[0].to);
        const fromHz = fromNotes[0]?.frequencyHz ?? 0;
        const toHz = toNotes[0]?.frequencyHz ?? 0;
        const isHighToLow = fromHz > toHz;
        const freqs = exerciseNotes.map((n) => n.frequencyHz);
        const minFreq = Math.min(...freqs);
        const maxFreq = Math.max(...freqs);
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
      } else if (exercise.exerciseTypeId === "pitch-detection" && exercise.notes.length > 1) {
        const idx = seqIndexRef.current;
        const noteConfig = exercise.notes[idx];
        if (!noteConfig) return;
        const targetNotes = scale.resolve(noteConfig.target);
        const noteSeconds = noteConfig.seconds;
        if (targetNotes.length > 0 && hz !== null && targetNotes.some((t) => isInTune(hz, t.frequencyHz))) {
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
