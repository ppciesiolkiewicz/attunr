"use client";

import { RotateCcw, Pause, Play, FastForward } from "lucide-react";
import { Button } from "@/components/ui";
import type { VoiceIntroState } from "@/hooks/useVoiceIntro";

/**
 * Compact top banner that shows accumulating voice intro text.
 * Non-blocking — exercise remains fully functional underneath.
 */
export function VoiceIntroOverlay({ voice }: { voice: VoiceIntroState }) {
  const { status, revealedWords } = voice;

  if (status === "idle") return null;

  // After completion, show just a replay button
  if (status === "complete") {
    return (
      <div className="absolute bottom-3 left-3 z-20 pointer-events-none">
        <Button variant="icon-outline" color="subtle" onClick={voice.replay} title="Replay guidance" className="pointer-events-auto scale-90 opacity-60 hover:opacity-100 transition-opacity">
          <RotateCcw size={16} />
        </Button>
      </div>
    );
  }

  return (
    <div className="absolute bottom-3 left-3 right-3 z-20 pointer-events-none flex justify-center">
      <div className="pointer-events-auto bg-black/70 backdrop-blur-sm rounded-xl px-4 py-2.5 max-w-md flex flex-col items-center gap-1.5">
        {/* Accumulating text */}
        {status === "loading" ? (
          <div className="animate-supernova w-2.5 h-2.5 rounded-full bg-white" />
        ) : revealedWords.length > 0 ? (
          <p className="text-xs sm:text-sm leading-relaxed text-white/90 text-center">
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

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button variant="icon-outline" color="subtle" onClick={voice.replay} title="Replay" className="scale-90">
            <RotateCcw size={16} />
          </Button>
          {status === "playing" ? (
            <Button variant="icon-outline" color="subtle" onClick={voice.pause} title="Pause" className="scale-90">
              <Pause size={16} />
            </Button>
          ) : status === "paused" ? (
            <Button variant="icon-outline" color="subtle" onClick={voice.resume} title="Continue" className="scale-90">
              <Play size={16} />
            </Button>
          ) : null}
          <Button variant="icon-outline" color="subtle" onClick={voice.fastForward} title="Skip intro" className="scale-90">
            <FastForward size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
