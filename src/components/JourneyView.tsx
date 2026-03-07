"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import PitchCanvas from "./PitchCanvas";
import ChakraDetailCard from "./ChakraDetailCard";
import AudioControls from "./AudioControls";
import { JOURNEY_STAGES } from "@/constants/journey";
import {
  CHAKRAS,
  getChakraFrequencies,
  findClosestChakra,
  isInTune,
} from "@/constants/chakras";
import type { Chakra } from "@/constants/chakras";
import type { Settings } from "@/hooks/useSettings";
import type { DroneTarget } from "@/hooks/useSettings";

interface JourneyViewProps {
  settings: Settings;
  pitchHz: number | null;
  pitchHzRef: React.RefObject<number | null>;
  onPlayTone: (chakra: Chakra) => void;
  onSettingsUpdate: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

function ProgressArc({ progress }: { progress: number }) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const dash = circ * Math.min(progress, 1);
  return (
    <svg width={50} height={50} viewBox="0 0 50 50" className="shrink-0">
      <circle cx={25} cy={25} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={3} />
      <circle
        cx={25} cy={25} r={r} fill="none"
        stroke="#7c3aed" strokeWidth={3}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 25 25)"
        style={{ transition: "stroke-dasharray 0.3s" }}
      />
      <text x={25} y={29} textAnchor="middle" fontSize={11} fill="rgba(255,255,255,0.6)" fontFamily="system-ui">
        {Math.round(progress * 100)}%
      </text>
    </svg>
  );
}

export default function JourneyView({
  settings,
  pitchHz,
  pitchHzRef,
  onPlayTone,
  onSettingsUpdate,
}: JourneyViewProps) {
  const highestCompleted = settings.journeyStage;
  const currentStageId = Math.min(highestCompleted + 1, 13);
  const [viewingStageId, setViewingStageId] = useState(currentStageId);

  const stage = JOURNEY_STAGES.find((s) => s.id === viewingStageId)!;
  const isCurrentStage = viewingStageId === currentStageId;
  const isCompleted = viewingStageId <= highestCompleted;

  // Compute voice-adjusted chakras for the stage
  const allChakras = useMemo(
    () => getChakraFrequencies("voice", settings.voiceType, settings.tuning),
    [settings.voiceType, settings.tuning]
  );
  const stageChakras = allChakras.filter((c) =>
    stage.chakraIds.includes(c.id)
  );
  const freqOverrides = Object.fromEntries(stageChakras.map((c) => [c.id, c.frequencyHz]));

  // ── Success tracking ──────────────────────────────────────────────────────
  const holdRef = useRef(0);          // cumulative seconds held in-tune (individual)
  const seqIndexRef = useRef(0);      // current note index in sequence
  const noteHoldRef = useRef(0);      // seconds held on current sequence note
  const lastTickRef = useRef(0);
  const [progress, setProgress] = useState(0); // 0–1
  const [seqIndex, setSeqIndex] = useState(0);
  const [stageComplete, setStageComplete] = useState(false);
  const rafRef = useRef<number | null>(null);

  const resetProgress = useCallback(() => {
    holdRef.current = 0;
    seqIndexRef.current = 0;
    noteHoldRef.current = 0;
    lastTickRef.current = 0;
    setProgress(0);
    setSeqIndex(0);
    setStageComplete(false);
  }, []);

  useEffect(() => {
    resetProgress();
  }, [viewingStageId, resetProgress]);

  // Tick loop for progress accumulation
  useEffect(() => {
    if (!isCurrentStage || stageComplete) return;

    function tick() {
      const now = performance.now();
      const dt = lastTickRef.current ? (now - lastTickRef.current) / 1000 : 0;
      lastTickRef.current = now;

      const hz = pitchHzRef.current;

      if (stage.type === "individual") {
        const targetChakra = stageChakras[0];
        if (hz !== null && targetChakra && isInTune(hz, targetChakra.frequencyHz)) {
          holdRef.current += dt;
        }
        const p = holdRef.current / stage.holdSeconds;
        setProgress(p);
        if (p >= 1 && !stageComplete) {
          setStageComplete(true);
        }
      } else {
        // Sequence: step through notes
        const idx = seqIndexRef.current;
        const targetChakra = stageChakras[idx];
        if (targetChakra && hz !== null && isInTune(hz, targetChakra.frequencyHz)) {
          noteHoldRef.current += dt;
          if (noteHoldRef.current >= stage.noteSeconds) {
            noteHoldRef.current = 0;
            seqIndexRef.current = idx + 1;
            setSeqIndex(idx + 1);
            if (seqIndexRef.current >= stageChakras.length) {
              setStageComplete(true);
              setProgress(1);
              return;
            }
          }
        } else {
          noteHoldRef.current = Math.max(0, noteHoldRef.current - dt * 0.5);
        }
        setProgress((seqIndexRef.current + noteHoldRef.current / stage.noteSeconds) / stageChakras.length);
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCurrentStage, stageComplete, viewingStageId]);

  function handleComplete() {
    const newStage = viewingStageId;
    onSettingsUpdate("journeyStage", Math.max(highestCompleted, newStage) as unknown as Settings["journeyStage"]);
    if (viewingStageId < 13) {
      setViewingStageId(viewingStageId + 1);
    }
  }

  function handleHearTone() {
    stageChakras.forEach((chakra, i) => {
      setTimeout(() => onPlayTone(chakra), i * 2000);
    });
  }

  // Canvas: highlight only target chakra bands
  const closestChakra = pitchHz ? findClosestChakra(pitchHz, stageChakras) : null;
  const locked = closestChakra && pitchHz ? isInTune(pitchHz, closestChakra.frequencyHz) : false;

  return (
    <div className="flex flex-col h-full">

      {/* ── Stage nav ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06] overflow-x-auto">
        <div className="flex items-center gap-1 shrink-0">
          {JOURNEY_STAGES.map((s) => {
            const done = s.id <= highestCompleted;
            const current = s.id === currentStageId;
            const viewing = s.id === viewingStageId;
            return (
              <button
                key={s.id}
                onClick={() => setViewingStageId(s.id)}
                className="rounded-full transition-all"
                title={`Stage ${s.id}: ${s.title}`}
                style={{
                  width: viewing ? 20 : 8,
                  height: 8,
                  backgroundColor: done
                    ? "#7c3aed"
                    : current
                    ? "rgba(124,58,237,0.5)"
                    : "rgba(255,255,255,0.1)",
                  borderRadius: viewing ? 4 : "50%",
                }}
              />
            );
          })}
        </div>
        <span className="text-xs text-white/30 shrink-0">
          Stage {viewingStageId} / 13 — {stage.title}
          {stage.part === 2 && " ♪"}
        </span>
        <span className="ml-auto text-[10px] text-white/20 shrink-0">
          {VOICE_TYPES_LABEL(settings.voiceType)} · {settings.tuning}
        </span>
      </div>

      {/* ── Chakra detail card ───────────────────────────────────────────── */}
      <div className="px-4 pt-3 pb-1">
        <ChakraDetailCard chakraIds={stage.chakraIds} frequencyOverrides={freqOverrides} />

        {/* Instruction */}
        <div className="mt-2 px-1">
          {stage.instruction.split("\n").map((line, i) => (
            <p
              key={i}
              className="text-xs leading-relaxed"
              style={{ color: i === 0 ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.3)" }}
            >
              {line}
            </p>
          ))}
        </div>
      </div>

      {/* ── Canvas ───────────────────────────────────────────────────────── */}
      <div className="relative flex-1 min-h-0">
        <PitchCanvas
          chakras={allChakras}
          currentHzRef={pitchHzRef}
          highlightIds={stage.chakraIds}
        />

        {/* Pitch overlay */}
        {pitchHz !== null && (
          <div className="pointer-events-none absolute top-3 left-4 fade-in">
            <div
              className="text-2xl font-light tabular-nums"
              style={{ color: closestChakra?.color ?? "#fff" }}
            >
              {Math.round(pitchHz)} Hz
            </div>
            {closestChakra && (
              <div className="text-xs mt-0.5" style={{ color: `${closestChakra.color}aa` }}>
                {locked ? "✓ " : "→ "}{closestChakra.name}
              </div>
            )}
          </div>
        )}

        {/* Sequence step indicator */}
        {stage.type === "sequence" && isCurrentStage && !stageComplete && (
          <div className="pointer-events-none absolute bottom-3 left-4 flex items-center gap-2">
            {stageChakras.map((c, i) => {
              const done = i < seqIndex;
              const active = i === seqIndex;
              return (
                <div
                  key={c.id}
                  className="rounded-full transition-all"
                  style={{
                    width: active ? 10 : 7,
                    height: active ? 10 : 7,
                    backgroundColor: done ? c.color : active ? `${c.color}99` : "rgba(255,255,255,0.15)",
                    boxShadow: active ? `0 0 8px ${c.color}88` : "none",
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* ── Bottom panel ─────────────────────────────────────────────────── */}
      <div className="border-t border-white/[0.06] bg-white/[0.02] px-5 pt-3 pb-4 flex flex-col gap-3">

        {/* Progress + actions */}
        <div className="flex items-center gap-4">
          {isCurrentStage && !stageComplete && (
            <ProgressArc progress={progress} />
          )}
          {stageComplete && (
            <div className="text-2xl">✓</div>
          )}
          {isCompleted && !isCurrentStage && (
            <div className="text-sm text-white/25">Completed</div>
          )}

          <div className="flex gap-2 ml-auto">
            <button
              onClick={handleHearTone}
              className="px-4 py-2 rounded-xl text-xs font-medium border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 transition-all"
            >
              ▶ Hear tone{stageChakras.length > 1 ? "s" : ""}
            </button>

            {(stageComplete || (isCompleted && !isCurrentStage)) && viewingStageId < 13 && (
              <button
                onClick={handleComplete}
                className="px-4 py-2 rounded-xl text-xs font-medium text-white transition-all"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                  boxShadow: "0 0 16px rgba(124,58,237,0.4)",
                }}
              >
                Next →
              </button>
            )}
          </div>
        </div>

        {/* Audio controls */}
        <AudioControls
          drone={settings.drone}
          binaural={settings.binaural}
          onDroneChange={(v) => onSettingsUpdate("drone", v as DroneTarget)}
          onBinauralChange={(v) => onSettingsUpdate("binaural", v)}
        />
      </div>
    </div>
  );
}

function VOICE_TYPES_LABEL(id: string) {
  const map: Record<string, string> = {
    bass: "Bass", baritone: "Baritone", tenor: "Tenor", alto: "Alto", soprano: "Soprano",
  };
  return map[id] ?? id;
}
