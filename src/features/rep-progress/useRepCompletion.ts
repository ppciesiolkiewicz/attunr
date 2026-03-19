"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import confetti from "canvas-confetti";

const REP_PHRASES = ["Nice!", "Good one!", "Keep going!"];
const STEP_CHECK_DURATION_MS = 1500;
const CONGRATS_DURATION_MS = 2400;

interface UseRepCompletionOptions {
  totalReps: number;
  exerciseId: number;
  onRepAdvanced?: () => void;
}

interface UseRepCompletionResult {
  currentRep: number;
  isComplete: boolean;
  completeRep: () => void;
  showStepCheck: boolean;
  showCongrats: boolean;
  repPhrase: string;
  overallProgress: number;
  resetProgress: () => void;
}

export function useRepCompletion({
  totalReps,
  exerciseId,
  onRepAdvanced,
}: UseRepCompletionOptions): UseRepCompletionResult {
  const [currentRep, setCurrentRep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showStepCheck, setShowStepCheck] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const onRepAdvancedRef = useRef(onRepAdvanced);
  onRepAdvancedRef.current = onRepAdvanced;
  // Guard against double-calls (e.g. React Strict Mode, rapid triggers)
  const completingRef = useRef(false);

  // Reset on exercise change
  useEffect(() => {
    setCurrentRep(0);
    setIsComplete(false);
    setShowStepCheck(false);
    setShowCongrats(false);
    completingRef.current = false;
  }, [exerciseId]);

  const completeRep = useCallback(() => {
    if (completingRef.current) return;
    completingRef.current = true;

    setCurrentRep((prev) => prev + 1);

    // Use queueMicrotask to run side effects outside the state updater,
    // avoiding React 19 Strict Mode double-invocation and nested setState issues.
    queueMicrotask(() => {
      setCurrentRep((current) => {
        if (current >= totalReps) {
          // Final rep
          setIsComplete(true);
          setShowCongrats(true);
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.45 } });
          setTimeout(() => setShowCongrats(false), CONGRATS_DURATION_MS);
        } else {
          // Intermediate rep
          setShowStepCheck(true);
          setTimeout(() => setShowStepCheck(false), STEP_CHECK_DURATION_MS);
          onRepAdvancedRef.current?.();
        }
        completingRef.current = false;
        return current; // Don't change — already incremented
      });
    });
  }, [totalReps]);

  const resetProgress = useCallback(() => {
    setCurrentRep(0);
    setIsComplete(false);
    setShowStepCheck(false);
    setShowCongrats(false);
    completingRef.current = false;
  }, []);

  const repPhrase = REP_PHRASES[((currentRep || 1) - 1) % REP_PHRASES.length];
  const overallProgress = totalReps > 0 ? currentRep / totalReps : 0;

  return {
    currentRep,
    isComplete,
    completeRep,
    showStepCheck,
    showCongrats,
    repPhrase,
    overallProgress,
    resetProgress,
  };
}
