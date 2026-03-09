"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import PitchCanvas from "./PitchCanvas";
import ChakraDetailCard from "./ChakraDetailCard";
import { HeadphonesNotice } from "./TabInfoModal";
import {
  JOURNEY_STAGES,
  TOTAL_JOURNEY_STAGES,
  LAST_STAGE_ID_PER_PART,
  isLastStageOfPart,
  PART_COMPLETE_CONTENT,
} from "@/constants/journey";
import type { JourneyStage } from "@/constants/journey";
import {
  CHAKRAS,
  getChakraFrequencies,
  findClosestChakra,
  isInTune,
} from "@/constants/chakras";
import type { Chakra } from "@/constants/chakras";
import type { Settings } from "@/hooks/useSettings";

interface JourneyViewProps {
  settings: Settings;
  pitchHz: number | null;
  pitchHzRef: React.RefObject<number | null>;
  onPlayTone: (chakra: Chakra) => void;
  onSettingsUpdate: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  onOpenSettings: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getStepInPart(stageId: number): { stepIndex: number; stepsInPart: number } {
  const stage = JOURNEY_STAGES.find((s) => s.id === stageId);
  if (!stage) return { stepIndex: 1, stepsInPart: 1 };
  const partStages = JOURNEY_STAGES.filter((s) => s.part === stage.part);
  const stepIndex = partStages.findIndex((s) => s.id === stageId) + 1;
  return { stepIndex, stepsInPart: partStages.length };
}

function voiceTypeLabel(id: string) {
  const map: Record<string, string> = {
    bass: "Bass", baritone: "Baritone", tenor: "Tenor", alto: "Alto", soprano: "Soprano",
  };
  return map[id] ?? id;
}

// ── Icons ────────────────────────────────────────────────────────────────────

function BookIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function BadgeIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3 7h7l-5.5 5 2 7-6.5-4.5L5.5 21l2-7-5.5-5h7z" />
    </svg>
  );
}

// ── Progress Arc ──────────────────────────────────────────────────────────────

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
      <text x={25} y={29} textAnchor="middle" fontSize={13} fill="rgba(255,255,255,0.75)" fontFamily="system-ui">
        {Math.round(progress * 100)}%
      </text>
    </svg>
  );
}

// ── Stage Card ────────────────────────────────────────────────────────────────

function StageCard({
  stage,
  highestCompleted,
  onSelect,
}: {
  stage: JourneyStage;
  highestCompleted: number;
  onSelect: (id: number) => void;
}) {
  const isComplete = stage.id <= highestCompleted;
  const isCurrent = stage.id === highestCompleted + 1;
  const isUnlocked = stage.id <= highestCompleted + 1;

  const stageChakras = stage.chakraIds
    .map((id) => CHAKRAS.find((c) => c.id === id))
    .filter((c): c is Chakra => c != null);
  const primaryColor =
    stageChakras[0]?.color ?? (stage.type === "technique_intro" ? "#7c3aed" : "#7c3aed");

  return (
    <button
      onClick={() => isUnlocked && onSelect(stage.id)}
      disabled={!isUnlocked}
      className="w-full flex items-stretch rounded-xl border overflow-hidden text-left transition-all group"
      style={{
        borderColor: !isUnlocked
          ? "rgba(255,255,255,0.12)"
          : isCurrent
          ? `${primaryColor}50`
          : "rgba(255,255,255,0.08)",
        backgroundColor: isCurrent
          ? `${primaryColor}12`
          : "rgba(255,255,255,0.05)",
        opacity: !isUnlocked ? 0.58 : 1,
        cursor: !isUnlocked ? "not-allowed" : "pointer",
      }}
    >
      {/* Left colour strip */}
      <div
        className="w-[3px] shrink-0"
        style={{
          background:
            stageChakras.length === 1
              ? primaryColor
              : stageChakras.length > 1
              ? `linear-gradient(to bottom, ${stageChakras.map((c) => c.color).join(", ")})`
              : "linear-gradient(to bottom, #7c3aed, #6d28d9)",
          opacity: !isUnlocked ? 0.65 : 1,
        }}
      />

      {/* Content */}
      <div className="flex-1 px-3.5 py-3 min-w-0">
        <div className="flex items-baseline justify-between gap-2 mb-1.5">
          <span
            className="text-base font-semibold flex items-center gap-1.5"
            style={{ color: !isUnlocked ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.95)" }}
          >
            {stage.type === "technique_intro" && (
              <BookIcon className="shrink-0 opacity-70" style={{ color: isUnlocked ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.45)" }} />
            )}
            {stage.title}
          </span>
        </div>

        {/* Part I: mantra + element (single chakra) — skip for lip-roll warmups */}
        {stageChakras.length === 1 && stage.type !== "technique_intro" && stage.technique !== "lip-rolls" && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span
              className="text-xs font-mono font-medium tracking-wider"
              style={{ color: isUnlocked ? `${primaryColor}` : "rgba(255,255,255,0.55)" }}
            >
              {stageChakras[0].mantra}
            </span>
            <span className="text-xs text-white/48">·</span>
            <span className="text-xs text-white/62">{stageChakras[0].element}</span>
            <span className="text-xs text-white/48">·</span>
            <span className="text-xs text-white/68">{stageChakras[0].description}</span>
          </div>
        )}
        {/* Lip-roll individual: minimal cue */}
        {stageChakras.length === 1 && stage.type !== "technique_intro" && stage.technique === "lip-rolls" && (
          <p className="text-xs text-white/58">Hold the buzz 5 seconds</p>
        )}

        {/* Technique intro: show cardCue or technique name */}
        {stage.type === "technique_intro" && (
          <p className="text-xs text-white/58">{stage.cardCue ?? stage.technique?.replace(/-/g, " ") ?? "Learn"}</p>
        )}
        {/* Part II: chakra sequence — skip for lip-roll (use title instead) */}
        {stageChakras.length > 1 && stage.technique !== "lip-rolls" && (
          <div className="flex flex-wrap items-center gap-1">
            {stageChakras.map((c, i) => (
              <span key={c.id} className="flex items-center gap-1">
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: isUnlocked ? c.color : "rgba(255,255,255,0.4)" }}
                />
                <span
                  className="text-xs"
                  style={{ color: isUnlocked ? `${c.color}` : "rgba(255,255,255,0.55)" }}
                >
                  {c.name}
                </span>
                {i < stageChakras.length - 1 && (
                  <span className="text-xs text-white/55 mx-0.5">›</span>
                )}
              </span>
            ))}
          </div>
        )}
        {/* Lip-roll sequence: minimal cue */}
        {stageChakras.length > 1 && stage.technique === "lip-rolls" && stage.type === "sequence" && (
          <p className="text-xs text-white/58">Full range · 2 s per tone</p>
        )}
        {/* Lip-roll slide: minimal cue */}
        {stage.type === "slide" && (
          <p className="text-xs text-white/58">Continuous glide · slide 2–3 times</p>
        )}
      </div>

      {/* Status */}
      <div className="flex items-center px-3.5">
        {isComplete ? (
          <span className="text-sm" style={{ color: primaryColor }}>✓</span>
        ) : !isUnlocked ? (
          <span className="text-sm text-white/55">⋯</span>
        ) : (
          <span className="text-base text-white/42 group-hover:text-white/72 transition-colors">›</span>
        )}
      </div>
    </button>
  );
}

// ── Journey List ──────────────────────────────────────────────────────────────

const PART_NAMES: Record<number, string> = {
  1: "Introduction",
  2: "Vocal warmups",
  3: "Sustain",
  4: "Sequences",
  5: "Vowel U",
  6: "Mantra",
  7: "Vowel EE",
  8: "Vowel flow",
  9: "Puffy cheeks",
};

function JourneyList({
  settings,
  onSelect,
}: {
  settings: Settings;
  onSelect: (stageId: number) => void;
}) {
  const { journeyStage: highestCompleted } = settings;
  const parts = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex flex-col gap-4 px-5 py-5 max-w-2xl mx-auto w-full">

        <div className="flex flex-col gap-2 text-sm text-white/65 leading-relaxed">
          <p>
            This is where your journey begins. You&apos;ll be guided through learning and practice — from chakra tones and vocal warmups to sustaining each tone, building sequences, and exploring techniques like mantras and vowels.
          </p>
          <p>
            When you&apos;ve built confidence, switch to Explore for freeform practice — any tone, any order.
          </p>
        </div>

        {parts.map((partNum) => {
          const stages = JOURNEY_STAGES.filter((s) => s.part === partNum);
          if (stages.length === 0) return null;
          const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"][partNum - 1];
          const lastStageId = LAST_STAGE_ID_PER_PART[partNum];
          const partComplete = highestCompleted >= lastStageId;
          return (
            <section key={partNum} className="flex flex-col gap-2">
              <header className="flex items-center gap-3 mb-0.5">
                <span className="text-xs uppercase tracking-widest text-white/58 shrink-0 flex items-center gap-1.5">
                  Part {roman} — {PART_NAMES[partNum]}
                  {partComplete && (
                    <BadgeIcon className="text-violet-400/90" style={{ width: 12, height: 12 }} />
                  )}
                </span>
                <div className="flex-1 h-px bg-white/[0.05]" />
              </header>
              {stages.map((stage) => (
                <StageCard
                  key={stage.id}
                  stage={stage}
                  highestCompleted={highestCompleted}
                  onSelect={onSelect}
                />
              ))}
            </section>
          );
        })}

      </div>
    </div>
  );
}

// ── Exercise Info Modal ───────────────────────────────────────────────────────

function ExerciseInfoModal({
  stageId,
  settings,
  onStart,
  onDismiss,
  onAdvanceWithoutExercise,
}: {
  stageId: number;
  settings: Settings;
  onStart: () => void;
  onDismiss: () => void;
  /** For technique_intro: mark complete and advance to next stage (no canvas) */
  onAdvanceWithoutExercise?: () => void;
}) {
  const stage = JOURNEY_STAGES.find((s) => s.id === stageId)!;
  const isTechniqueIntro = stage.type === "technique_intro";

  const allChakras = useMemo(
    () => getChakraFrequencies("voice", settings.voiceType, settings.tuning),
    [settings.voiceType, settings.tuning]
  );
  const stageChakras = stage.chakraIds
    .map((id) => allChakras.find((c) => c.id === id))
    .filter((c): c is Chakra => c != null);
  const freqOverrides = Object.fromEntries(stageChakras.map((c) => [c.id, c.frequencyHz]));
  const primaryColor = stageChakras[0]?.color ?? "#7c3aed";

  const objective =
    isTechniqueIntro
      ? "Learn the technique"
      : stage.type === "individual"
      ? `Hold the tone in tune for ${stage.holdSeconds} seconds`
      : stage.type === "slide"
      ? "Slide smoothly through the range two or three times — detection is loose"
      : `Sing each tone in sequence, ${stage.noteSeconds} seconds each`;

  function handleBegin() {
    if (isTechniqueIntro && onAdvanceWithoutExercise) {
      onAdvanceWithoutExercise();
    } else {
      onStart();
    }
  }

  return (
    <div
      className="fixed inset-0 z-30 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      onClick={onDismiss}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: "#0f0f1a",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          maxHeight: "90vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-white/[0.06] shrink-0">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/45 mb-1 flex items-center gap-1.5">
              {isTechniqueIntro && <BookIcon className="opacity-70" />}
              Step {getStepInPart(stageId).stepIndex} of {getStepInPart(stageId).stepsInPart} —{" "}
              {isTechniqueIntro ? "Learn" : stage.part === 2 ? "Warmup" : stage.type === "slide" ? "Slide" : stage.type === "sequence" ? "Sequence" : stage.part >= 5 ? "Technique" : "Individual"}
            </p>
            <h2 className="text-xl font-semibold text-white">{stage.title}</h2>
            <p className="text-sm mt-1" style={{ color: primaryColor }}>
              {objective}
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="text-white/45 hover:text-white/75 transition-colors text-xl leading-none ml-4 mt-0.5 shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex flex-col gap-4 px-5 py-5 overflow-y-auto flex-1">

          {/* Chakra detail — skip for lip-roll sequences (warmup focus), else show card */}
          {!isTechniqueIntro && stage.chakraIds.length > 0 && !(stage.technique === "lip-rolls" && (stage.type === "sequence" || stage.type === "slide")) && (
            <ChakraDetailCard
              chakraIds={stage.chakraIds}
              frequencyOverrides={freqOverrides}
              style={stage.chakraDetailStyle ?? "full"}
            />
          )}

          {/* Instructions */}
          <div className="flex flex-col gap-1">
            {stage.instruction.split("\n").map((line, i) => (
              <p
                key={i}
                className="text-base leading-relaxed"
                style={{ color: i === 0 ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.55)" }}
              >
                {line}
              </p>
            ))}
          </div>

          {/* Video coming soon — for technique intros */}
          {isTechniqueIntro && (
            <div
              className="rounded-xl px-5 py-8 flex flex-col items-center justify-center gap-2"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px dashed rgba(255,255,255,0.15)",
              }}
            >
              <span className="text-2xl opacity-50">▶</span>
              <p className="text-sm text-white/45 font-medium">Video coming soon</p>
            </div>
          )}

          {/* Headphones notice — only for exercises with canvas */}
          {!isTechniqueIntro && <HeadphonesNotice />}

          {/* Voice / tuning context */}
          <p className="text-xs text-white/45 text-center">
            Practising as {voiceTypeLabel(settings.voiceType)} · {settings.tuning}
          </p>

        </div>

        {/* Begin button */}
        <div className="px-5 pb-5 pt-3 border-t border-white/[0.06] shrink-0">
          <button
            onClick={handleBegin}
            className="w-full py-4 rounded-xl text-base font-semibold text-white transition-all"
            style={{
              background: `linear-gradient(135deg, #7c3aed, #6d28d9)`,
              boxShadow: "0 0 28px rgba(124,58,237,0.35)",
            }}
          >
            {isTechniqueIntro ? "Continue →" : "Begin exercise →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Part Complete Modal ──────────────────────────────────────────────────────

function PartCompleteModal({
  part,
  partName,
  learned,
  tip,
  onContinue,
}: {
  part: number;
  partName: string;
  learned: string;
  tip: string;
  onContinue: () => void;
}) {
  useEffect(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  return (
    <div
      className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: "#0f0f1a",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        }}
      >
        <div className="px-5 pt-5 pb-4 flex flex-col items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: "rgba(124,58,237,0.2)" }}
          >
            <BadgeIcon className="text-violet-400" style={{ width: 24, height: 24 }} />
          </div>
          <h2 className="text-xl font-semibold text-white text-center">
            Part {["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"][part - 1]} Complete
          </h2>
          <p className="text-sm text-white/72 text-center">{partName}</p>
        </div>
        <div className="px-5 py-4 border-t border-white/[0.06] flex flex-col gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/45 mb-1">What you learnt</p>
            <p className="text-sm text-white/85">{learned}</p>
          </div>
          <p className="text-sm font-medium" style={{ color: "#a78bfa" }}>
            {tip}
          </p>
        </div>
        <div className="px-5 pb-5 pt-3 border-t border-white/[0.06]">
          <button
            onClick={onContinue}
            className="w-full py-4 rounded-xl text-base font-semibold text-white transition-all"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              boxShadow: "0 0 28px rgba(124,58,237,0.35)",
            }}
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Journey Exercise (simplified) ─────────────────────────────────────────────

export function JourneyExercise({
  stageId,
  settings,
  pitchHz,
  pitchHzRef,
  onPlayTone,
  onSettingsUpdate,
  onOpenSettings,
  onBack,
  onNext,
}: {
  stageId: number;
  settings: Settings;
  pitchHz: number | null;
  pitchHzRef: React.RefObject<number | null>;
  onPlayTone: (chakra: Chakra) => void;
  onSettingsUpdate: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  onOpenSettings: () => void;
  onBack: () => void;
  onNext: (nextStageId: number) => void;
}) {
  const highestCompleted = settings.journeyStage;
  const stage = JOURNEY_STAGES.find((s) => s.id === stageId)!;
  const isCompleted = stageId <= highestCompleted;
  const isCurrentStage = stageId === highestCompleted + 1;

  const allChakras = useMemo(
    () => getChakraFrequencies("voice", settings.voiceType, settings.tuning),
    [settings.voiceType, settings.tuning]
  );
  const stageChakras = stage.chakraIds
    .map((id) => allChakras.find((c) => c.id === id))
    .filter((c): c is Chakra => c != null);

  // ── Success tracking ──────────────────────────────────────────────────────
  const holdRef = useRef(0);
  const seqIndexRef = useRef(0);
  const noteHoldRef = useRef(0);
  const lastTickRef = useRef(0);
  const slideCountRef = useRef(0);
  const slideLastZoneRef = useRef<"high" | "low" | null>(null);
  const [progress, setProgress] = useState(0);
  const [seqIndex, setSeqIndex] = useState(0);
  const [slideCount, setSlideCount] = useState(0);
  const [stageComplete, setStageComplete] = useState(false);
  const [partCompleteData, setPartCompleteData] = useState<{
    part: number;
    partName: string;
    learned: string;
    tip: string;
  } | null>(null);
  const rafRef = useRef<number | null>(null);

  const resetProgress = useCallback(() => {
    holdRef.current = 0;
    seqIndexRef.current = 0;
    noteHoldRef.current = 0;
    lastTickRef.current = 0;
    slideCountRef.current = 0;
    slideLastZoneRef.current = null;
    setProgress(0);
    setSeqIndex(0);
    setSlideCount(0);
    setStageComplete(false);
  }, []);

  useEffect(() => {
    resetProgress();
  }, [stageId, resetProgress]);

  useEffect(() => {
    if (!isCurrentStage || stageComplete) return;

    function tick() {
      const now = performance.now();
      const dt = lastTickRef.current ? (now - lastTickRef.current) / 1000 : 0;
      lastTickRef.current = now;

      const hz = pitchHzRef.current;

      if (stage.type === "individual") {
        const target = stageChakras[0];
        if (hz !== null && target && isInTune(hz, target.frequencyHz)) {
          holdRef.current += dt;
        }
        const p = holdRef.current / stage.holdSeconds;
        setProgress(p);
        if (p >= 1) setStageComplete(true);
      } else if (stage.type === "slide" && stage.slideDirection && hz !== null) {
        const freqs = stageChakras.map((c) => c.frequencyHz);
        const minFreq = Math.min(...freqs);
        const maxFreq = Math.max(...freqs);
        const highThreshold = maxFreq * 0.85;
        const lowThreshold = minFreq * 1.15;
        const inHigh = hz >= highThreshold;
        const inLow = hz <= lowThreshold;
        let lastZone = slideLastZoneRef.current;
        let count = slideCountRef.current;
        if (stage.slideDirection === "high-to-low") {
          if (inHigh) lastZone = "high";
          else if (inLow) {
            if (lastZone === "high") {
              count++;
              slideCountRef.current = count;
              setSlideCount(count);
            }
            lastZone = "low";
          }
        } else {
          if (inLow) lastZone = "low";
          else if (inHigh) {
            if (lastZone === "low") {
              count++;
              slideCountRef.current = count;
              setSlideCount(count);
            }
            lastZone = "high";
          }
        }
        slideLastZoneRef.current = lastZone;
        const REQUIRED_SLIDES = 2;
        setProgress(count / REQUIRED_SLIDES);
        if (count >= REQUIRED_SLIDES) setStageComplete(true);
      } else {
        const idx = seqIndexRef.current;
        const target = stageChakras[idx];
        if (target && hz !== null && isInTune(hz, target.frequencyHz)) {
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
        setProgress(
          (seqIndexRef.current + noteHoldRef.current / stage.noteSeconds) /
            stageChakras.length
        );
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCurrentStage, stageComplete, stageId]);

  function doAdvance() {
    if (stageId < TOTAL_JOURNEY_STAGES) {
      onNext(stageId + 1);
    } else {
      onBack();
    }
  }

  function handleComplete() {
    onSettingsUpdate("journeyStage", Math.max(highestCompleted, stageId));
    if (isLastStageOfPart(stageId)) {
      const content = PART_COMPLETE_CONTENT[stage.part];
      const partName = PART_NAMES[stage.part] ?? "";
      setPartCompleteData({
        part: stage.part,
        partName,
        learned: content.learned,
        tip: content.tip,
      });
    } else {
      doAdvance();
    }
  }

  function handlePartCompleteContinue() {
    setPartCompleteData(null);
    doAdvance();
  }

  function handleHearTone() {
    stageChakras.forEach((chakra, i) => {
      setTimeout(() => onPlayTone(chakra), i * 2000);
    });
  }

  const closestChakra = pitchHz ? findClosestChakra(pitchHz, stageChakras) : null;
  const locked = closestChakra && pitchHz ? isInTune(pitchHz, closestChakra.frequencyHz) : false;

  return (
    <div className="flex flex-col h-full">

      {/* ── Sub-nav ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06] shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-white/58 hover:text-white/85 transition-colors"
        >
          ← Journey
        </button>
        <span className="text-white/25">|</span>
        <span className="text-sm text-white/52">
          Part {["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"][stage.part - 1]} — {PART_NAMES[stage.part]}
        </span>
        <span className="text-white/25">·</span>
        <span className="text-sm text-white/52">Step {getStepInPart(stageId).stepIndex} of {getStepInPart(stageId).stepsInPart}</span>
        <span className="text-white/25">—</span>
        <span className="text-sm text-white/72 font-medium">{stage.title}</span>
        <button
          onClick={onOpenSettings}
          className="ml-auto text-xs text-white/45 hover:text-white/72 transition-colors"
        >
          {voiceTypeLabel(settings.voiceType)} · {settings.tuning}
        </button>
      </div>

      {/* ── Canvas (full remaining height) ────────────────────────────────────── */}
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
              className="text-3xl font-light tabular-nums"
              style={{ color: closestChakra?.color ?? "#fff" }}
            >
              {Math.round(pitchHz)} Hz
            </div>
            {closestChakra && (
              <div className="text-sm mt-0.5" style={{ color: `${closestChakra.color}cc` }}>
                {locked ? "✓ " : "→ "}{closestChakra.name}
              </div>
            )}
          </div>
        )}

        {/* Sequence step indicator */}
        {stage.type === "slide" && isCurrentStage && !stageComplete && (
          <div className="pointer-events-none absolute bottom-3 left-4 flex items-center gap-2">
            {[1, 2].map((i) => {
              const done = i <= slideCount;
              return (
                <div
                  key={i}
                  className="rounded-full transition-all"
                  style={{
                    width: 10,
                    height: 10,
                    backgroundColor: done ? "#a78bfa" : "rgba(255,255,255,0.15)",
                  }}
                />
              );
            })}
            <span className="text-xs text-white/55 ml-1">slide {slideCount}/2</span>
          </div>
        )}
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

      {/* ── Bottom panel ──────────────────────────────────────────────────────── */}
      <div className="border-t border-white/[0.06] bg-white/[0.02] px-5 pt-2.5 pb-1.5 flex items-center gap-4 shrink-0">
        {isCurrentStage && !stageComplete && stage.type !== "slide" && <ProgressArc progress={progress} />}
        {isCurrentStage && !stageComplete && stage.type === "slide" && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm text-white/55">Slide {slideCount}/2</span>
          </div>
        )}
        {stageComplete && <span className="text-2xl">✓</span>}
        {isCompleted && !isCurrentStage && (
          <span className="text-base text-white/48">Completed</span>
        )}

        <div className="flex gap-2 ml-auto">
          {process.env.NODE_ENV === "development" && isCurrentStage && !stageComplete && (
            <button
              onClick={handleComplete}
              className="px-3 py-2 rounded-lg text-xs font-medium text-white/50 hover:text-violet-400 border border-white/15 hover:border-violet-500/40 transition-colors"
              title="Dev: Complete without exercising"
            >
              ✓ Skip
            </button>
          )}
          <button
            onClick={handleHearTone}
            className="px-5 py-2.5 rounded-xl text-sm font-medium border border-white/20 text-white/65 hover:text-white/90 hover:border-white/35 transition-all"
          >
            ▶ Hear {stageChakras.length > 1 ? "tones" : "tone"}
          </button>

          {(stageComplete || (isCompleted && !isCurrentStage)) && (
            <button
              onClick={handleComplete}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                boxShadow: "0 0 16px rgba(124,58,237,0.4)",
              }}
            >
              {stageId < TOTAL_JOURNEY_STAGES ? "Next →" : "Complete ✓"}
            </button>
          )}
        </div>
      </div>

      {partCompleteData && (
        <PartCompleteModal
          part={partCompleteData.part}
          partName={partCompleteData.partName}
          learned={partCompleteData.learned}
          tip={partCompleteData.tip}
          onContinue={handlePartCompleteContinue}
        />
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function JourneyView({
  settings,
  pitchHz,
  pitchHzRef,
  onPlayTone,
  onSettingsUpdate,
  onOpenSettings,
}: JourneyViewProps) {
  const router = useRouter();
  /** Stage currently shown in the exercise info modal (null = no modal) */
  const [pendingStageId, setPendingStageId] = useState<number | null>(null);

  return (
    <div className="h-full">
      <JourneyList
        settings={settings}
        onSelect={setPendingStageId}
      />

      {/* Exercise info modal — shown when a stage card is tapped */}
      {pendingStageId !== null && (
        <ExerciseInfoModal
          stageId={pendingStageId}
          settings={settings}
          onStart={() => {
            router.push(`/journey/${pendingStageId}`);
            setPendingStageId(null);
          }}
          onDismiss={() => setPendingStageId(null)}
          onAdvanceWithoutExercise={() => {
            const stage = JOURNEY_STAGES.find((s) => s.id === pendingStageId)!;
            if (stage.type === "technique_intro") {
              onSettingsUpdate("journeyStage", Math.max(settings.journeyStage, pendingStageId));
              const nextId = pendingStageId + 1;
              setPendingStageId(nextId <= TOTAL_JOURNEY_STAGES ? nextId : null);
            }
          }}
        />
      )}
    </div>
  );
}

