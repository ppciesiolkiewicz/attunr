"use client";

import { useState, useCallback } from "react";
import { Button } from "@ui";

interface ExerciseStartButtonProps {
  onStart: () => void;
}

export function ExerciseStartButton({ onStart }: ExerciseStartButtonProps) {
  const [fading, setFading] = useState(false);

  const handleStart = useCallback(() => {
    setFading(true);
    setTimeout(() => {
      onStart();
    }, 300);
  }, [onStart]);

  return (
    <div
      className={`absolute inset-0 z-20 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <Button
        variant="primary"
        size="lg"
        className="pointer-events-auto"
        onClick={handleStart}
      >
        Start
      </Button>
    </div>
  );
}
