"use client";

import { useState, useCallback } from "react";
import { Button } from "@ui";

interface ExerciseStartOverlayProps {
  /** Called after the overlay has fully faded out (~300ms). */
  onStart: () => void;
}

export function ExerciseStartOverlay({ onStart }: ExerciseStartOverlayProps) {
  const [fading, setFading] = useState(false);

  const handleStart = useCallback(() => {
    setFading(true);
    // Wait for CSS fade-out to complete, then notify parent
    setTimeout(() => {
      onStart();
    }, 300);
  }, [onStart]);

  return (
    <div
      className={`absolute inset-0 z-20 flex items-center justify-center bg-black/40 transition-opacity duration-300 ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <Button variant="primary" size="lg" onClick={handleStart}>
        Start
      </Button>
    </div>
  );
}
