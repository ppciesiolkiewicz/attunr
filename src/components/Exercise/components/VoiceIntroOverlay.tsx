"use client";

import { RotateCcw, Pause, Play, FastForward } from "lucide-react";
import { Button } from "@/components/ui";
import type { VoiceIntroState } from "@/hooks/useVoiceIntro";

/**
 * Top banner that shows accumulating voice intro text.
 * Sits above the exercise canvas so the user can see the UI underneath.
 */
export function VoiceIntroOverlay({ voice }: { voice: VoiceIntroState }) {
  const { status, revealedWords } = voice;

  if (status === "idle" || status === "complete") return null;

  return (
    <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/85 via-black/60 to-transparent px-6 pt-4 pb-10 pointer-events-auto">
      {/* Accumulating text */}
      <div className="min-h-[3rem] flex items-start justify-center">
        {status === "loading" ? (
          <div className="animate-supernova w-3 h-3 rounded-full bg-white mt-3" />
        ) : revealedWords.length > 0 ? (
          <p className="text-sm sm:text-base leading-relaxed text-white/90 text-center max-w-md">
            {revealedWords.map((word, i) => (
              <span
                key={i}
                className="inline animate-in fade-in slide-in-from-bottom-1 duration-300"
              >
                {i > 0 ? " " : ""}{word}
              </span>
            ))}
          </p>
        ) : null}
      </div>

      {/* Controls */}
      <div className="mt-2 flex items-center justify-center gap-2">
        <Button variant="icon-outline" color="subtle" onClick={voice.replay} title="Replay" className="scale-75">
          <RotateCcw size={16} />
        </Button>
        {status === "playing" ? (
          <Button variant="icon-outline" color="subtle" onClick={voice.pause} title="Pause" className="scale-75">
            <Pause size={16} />
          </Button>
        ) : status === "paused" ? (
          <Button variant="icon-outline" color="subtle" onClick={voice.resume} title="Continue" className="scale-75">
            <Play size={16} />
          </Button>
        ) : null}
        <Button variant="icon-outline" color="subtle" onClick={voice.fastForward} title="Skip intro" className="scale-75">
          <FastForward size={16} />
        </Button>
      </div>
    </div>
  );
}
