"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import PitchCanvas from "./PitchCanvas";
import ChakraDetailCard from "./ChakraDetailCard";
import { FarinelliExercise, FARINELLI_ADVICES } from "./FarinelliExercise";
import { HeadphonesNotice, InfoButton, InfoIcon } from "./TabInfoModal";
import {
  JOURNEY_STAGES,
  TOTAL_JOURNEY_STAGES,
  LAST_STAGE_ID_PER_PART,
  isLastStageOfPart,
  PART_COMPLETE_CONTENT,
  PART_TITLES,
} from "@/constants/journey";
import { analytics } from "@/lib/analytics";
import type { JourneyStage, BandTarget } from "@/constants/journey";
import type { ChakraId, Band } from "@/constants/chakras";
import {
  CHAKRAS,
  BAND_ID_ORDER,
  getScaleNotesForRange,
  findClosestBand,
  isInBandRange,
  isInTune,
} from "@/constants/chakras";
import type { Settings } from "@/hooks/useSettings";

interface JourneyViewProps {
  settings: Settings;
  pitchHz: number | null;
  pitchHzRef: React.RefObject<number | null>;
  onPlayTone: (band: Band) => void;
  onSettingsUpdate: <K extends keyof Settings>(
    key: K,
    value: Settings[K],
  ) => void;
  onOpenSettings: () => void;
}

// ── Band target resolution ────────────────────────────────────────────────────

/** Resolve a BandTarget to concrete Band(s) from the user's vocal scale. */
function resolveBandTarget(target: BandTarget, allBands: Band[]): Band[] {
  const n = allBands.length;
  if (n === 0) return [];

  if (target.kind === "slot") {
    const chakraId = BAND_ID_ORDER[target.n - 1];
    const band = allBands.find((b) => b.isChakraSlot && b.chakraId === chakraId);
    return band ? [band] : [];
  }

  if (target.kind === "index") {
    const i = target.i < 0 ? n + target.i : target.i;
    return i >= 0 && i < n ? [allBands[i]] : [];
  }

  if (target.kind === "range") {
    const from = target.from < 0 ? n + target.from : target.from;
    const to = target.to < 0 ? n + target.to : target.to;
    const lo = Math.max(0, Math.min(from, to));
    const hi = Math.min(n - 1, Math.max(from, to));
    return allBands.slice(lo, hi + 1);
  }

  return [];
}

/** Get display colors for a stage (for StageCard color strip). Uses static CHAKRAS. */
function getStageDisplayColors(stage: JourneyStage): string[] {
  if (stage.stageTypeId === "pitch-detection") {
    const colors: string[] = [];
    for (const nc of stage.notes) {
      const t = nc.target;
      if (t.kind === "slot") {
        const chakra = CHAKRAS.find((c) => c.id === BAND_ID_ORDER[t.n - 1]);
        if (chakra) colors.push(chakra.color);
      }
    }
    if (colors.length > 0) return colors;
    return ["#7c3aed", "#6d28d9"];
  }
  if (stage.stageTypeId === "pitch-detection-slide") {
    return ["#7c3aed", "#6d28d9"];
  }
  return ["#7c3aed"];
}

/** Get the chakra for a single-slot stage (Part 9 mantra display). */
function getStageSlotChakra(stage: JourneyStage) {
  if (stage.stageTypeId !== "pitch-detection") return null;
  if (stage.notes.length !== 1) return null;
  const t = stage.notes[0].target;
  if (t.kind !== "slot") return null;
  return CHAKRAS.find((c) => c.id === BAND_ID_ORDER[t.n - 1]) ?? null;
}

/** Extract ChakraId[] from slot targets (for ChakraDetailCard). */
function getStageChakraIds(stage: JourneyStage): ChakraId[] {
  if (stage.stageTypeId === "pitch-detection") {
    const ids: ChakraId[] = [];
    for (const n of stage.notes) {
      if (n.target.kind === "slot") {
        ids.push(BAND_ID_ORDER[n.target.n - 1]);
      }
    }
    return ids;
  }
  return [];
}

const JOURNEY_EXERCISE_INFO_SKIP_KEY = "attunr.journeyExerciseInfoSkipped";

function getSkippedInfoStageIds(): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(JOURNEY_EXERCISE_INFO_SKIP_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    return new Set(Array.isArray(parsed) ? parsed.filter((n): n is number => typeof n === "number") : []);
  } catch {
    return new Set();
  }
}

function addSkippedInfoStageId(stageId: number) {
  try {
    const ids = getSkippedInfoStageIds();
    ids.add(stageId);
    localStorage.setItem(JOURNEY_EXERCISE_INFO_SKIP_KEY, JSON.stringify([...ids]));
  } catch {
    /* ignore */
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getStepInPart(stageId: number): {
  stepIndex: number;
  stepsInPart: number;
} {
  const stage = JOURNEY_STAGES.find((s) => s.id === stageId);
  if (!stage) return { stepIndex: 1, stepsInPart: 1 };
  const partStages = JOURNEY_STAGES.filter((s) => s.part === stage.part);
  const stepIndex = partStages.findIndex((s) => s.id === stageId) + 1;
  return { stepIndex, stepsInPart: partStages.length };
}

// ── Icons ────────────────────────────────────────────────────────────────────

function BookIcon({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      className={className}
      style={style}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function BadgeIcon({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      className={className}
      style={style}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
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
      <circle
        cx={25}
        cy={25}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={3}
      />
      <circle
        cx={25}
        cy={25}
        r={r}
        fill="none"
        stroke="#7c3aed"
        strokeWidth={3}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 25 25)"
        style={{ transition: "stroke-dasharray 0.3s" }}
      />
      <text
        x={25}
        y={29}
        textAnchor="middle"
        fontSize={13}
        fill="rgba(255,255,255,0.75)"
        fontFamily="system-ui"
      >
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

  const stageColors = getStageDisplayColors(stage);
  const primaryColor = stageColors[0] ?? "#7c3aed";
  const slotChakra = getStageSlotChakra(stage);

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
            stageColors.length === 1
              ? primaryColor
              : `linear-gradient(to bottom, ${stageColors.join(", ")})`,
          opacity: !isUnlocked ? 0.65 : 1,
        }}
      />

      {/* Content */}
      <div className="flex-1 px-3.5 py-3 min-w-0">
        <div className="flex items-baseline justify-between gap-2 mb-1.5">
          <span
            className="text-base font-semibold flex items-center gap-1.5"
            style={{
              color: !isUnlocked
                ? "rgba(255,255,255,0.65)"
                : "rgba(255,255,255,0.95)",
            }}
          >
            {stage.stageTypeId === "intro" && (
              <BookIcon
                className="shrink-0 opacity-70"
                style={{
                  color: isUnlocked
                    ? "rgba(255,255,255,0.6)"
                    : "rgba(255,255,255,0.45)",
                }}
              />
            )}
            {stage.title}
          </span>
        </div>

        {/* Part 9: mantra + element (single-slot chakra) */}
        {slotChakra &&
          stage.part === 9 &&
          stage.stageTypeId === "pitch-detection" &&
          stage.technique !== "lip-rolls" && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span
                className="text-xs font-mono font-medium tracking-wider"
                style={{
                  color: isUnlocked
                    ? `${primaryColor}`
                    : "rgba(255,255,255,0.55)",
                }}
              >
                {slotChakra.mantra}
              </span>
              <span className="text-xs text-white/48">·</span>
              <span className="text-xs text-white/62">
                {slotChakra.element}
              </span>
              <span className="text-xs text-white/48">·</span>
              <span className="text-xs text-white/68">
                {slotChakra.description}
              </span>
            </div>
          )}
        {/* Intro: cardCue */}
        {stage.stageTypeId === "intro" && stage.cardCue && (
          <p className="text-xs text-white/58">
            {stage.cardCue}
          </p>
        )}
        {/* Breathwork: cardCue */}
        {stage.stageTypeId === "breathwork" && stage.cardCue && (
          <p className="text-xs text-white/58">{stage.cardCue}</p>
        )}
        {/* Exercise subtitle */}
        {(stage.stageTypeId === "pitch-detection" || stage.stageTypeId === "pitch-detection-slide") && stage.subtitle && (
          <p className="text-xs text-white/58">{stage.subtitle}</p>
        )}
      </div>

      {/* Status */}
      <div className="flex items-center px-3.5">
        {isComplete ? (
          <span className="text-sm" style={{ color: primaryColor }}>
            ✓
          </span>
        ) : !isUnlocked ? (
          <span className="text-sm text-white/55">⋯</span>
        ) : (
          <span className="text-base text-white/42 group-hover:text-white/72 transition-colors">
            ›
          </span>
        )}
      </div>
    </button>
  );
}

// ── Journey List ──────────────────────────────────────────────────────────────

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
            This is where your journey begins. You&apos;ll be guided through
            learning and practice — from vocal warmups to sustaining each tone
            and exploring techniques like mantras and vowels.
          </p>
          <p>
            When you&apos;ve built confidence, switch to Train for freeform
            practice — any tone, any order.
          </p>
        </div>

        {parts.map((partNum) => {
          const stages = JOURNEY_STAGES.filter((s) => s.part === partNum);
          if (stages.length === 0) return null;
          const roman = [
            "I",
            "II",
            "III",
            "IV",
            "V",
            "VI",
            "VII",
            "VIII",
            "IX",
          ][partNum - 1];
          const lastStageId = LAST_STAGE_ID_PER_PART[partNum];
          const partComplete = highestCompleted >= lastStageId;
          return (
            <section key={partNum} className="flex flex-col gap-2">
              <header className="flex items-center gap-3 mb-0.5">
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs uppercase tracking-widest text-white/45">
                    Part {roman}
                  </span>
                  <span className="text-xs text-white/72 font-medium">
                    {PART_TITLES[partNum]}
                  </span>
                  {partComplete && (
                    <BadgeIcon
                      className="text-violet-400/90"
                      style={{ width: 12, height: 12 }}
                    />
                  )}
                </div>
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
  showDontShowAgain,
}: {
  stageId: number;
  settings: Settings;
  onStart: () => void;
  onDismiss: () => void;
  /** For technique_intro: mark complete and advance to next stage (no canvas) */
  onAdvanceWithoutExercise?: () => void;
  /** Show checkbox to skip this screen when navigating between exercises */
  showDontShowAgain?: boolean;
}) {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const stage = JOURNEY_STAGES.find((s) => s.id === stageId)!;
  const isTechniqueIntro = stage.stageTypeId === "intro";

  const allBands = useMemo(
    () => getScaleNotesForRange(
      settings.vocalRangeLowHz > 0 ? settings.vocalRangeLowHz : 131,
      settings.vocalRangeHighHz > 0 ? settings.vocalRangeHighHz : 523,
      settings.tuning,
    ),
    [settings.vocalRangeLowHz, settings.vocalRangeHighHz, settings.tuning],
  );
  const chakraIds = getStageChakraIds(stage);
  const freqOverrides: Record<string, number> = {};
  for (const cid of chakraIds) {
    const band = allBands.find((b) => b.chakraId === cid);
    if (band) freqOverrides[cid] = band.frequencyHz;
  }
  const stageColors = getStageDisplayColors(stage);
  const primaryColor = stageColors[0] ?? "#7c3aed";

  const noteTime = stage.stageTypeId === "pitch-detection" ? stage.notes[0]?.seconds ?? 0 : 0;
  const isMultiNote = stage.stageTypeId === "pitch-detection" && stage.notes.length > 1;
  const objective = isTechniqueIntro
    ? "Learn the technique"
    : stage.stageTypeId === "breathwork"
      ? `Complete 7 cycles — each a bit longer than the last`
      : stage.stageTypeId === "pitch-detection" && !isMultiNote
        ? `Hold the tone in tune for ${noteTime} seconds`
        : stage.stageTypeId === "pitch-detection-slide"
          ? "Slide smoothly through the range two or three times — detection is loose"
          : `Sing each tone in sequence, ${noteTime} seconds each`;

  function handleBegin() {
    if (isClosing) return;
    setIsClosing(true);
  }

  const commitBeginRef = useRef<() => void>(() => {});
  useEffect(() => {
    commitBeginRef.current = () => {
      if (showDontShowAgain && dontShowAgain) addSkippedInfoStageId(stageId);
      if (isTechniqueIntro && onAdvanceWithoutExercise) onAdvanceWithoutExercise();
      else onStart();
    };
  });

  useEffect(() => {
    if (!isClosing) return;
    const id = setTimeout(() => commitBeginRef.current(), 280);
    return () => clearTimeout(id);
  }, [isClosing]);

  // When navigating (showDontShowAgain), keep backdrop opaque so we don't reveal old content
  const hideBackdropOnClose = !showDontShowAgain;

  return (
    <div
      className={`fixed inset-0 z-30 flex items-end sm:items-center justify-center p-4 transition-opacity duration-300 ease-out ${isClosing ? "pointer-events-none" : ""}`}
      style={{
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(8px)",
        opacity: isClosing && hideBackdropOnClose ? 0 : 1,
      }}
      onClick={isClosing ? undefined : onDismiss}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden flex flex-col transition-all duration-300 ease-out"
        style={{
          opacity: isClosing ? 0 : 1,
          transform: isClosing ? "scale(0.96)" : "scale(1)",
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
            <p className="text-xs text-white/45 mb-1 flex items-center gap-1.5">
              {isTechniqueIntro && <BookIcon className="opacity-70" />}
              <span className="uppercase tracking-widest">
                Part {["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"][stage.part - 1]}
              </span>
              <span className="text-white/35">·</span>
              <span>
                {getStepInPart(stageId).stepIndex} of {getStepInPart(stageId).stepsInPart}
              </span>
              <span className="text-white/35">·</span>
              <span>
                {isTechniqueIntro ? "Learn" : stage.stageTypeId === "breathwork" ? "Breathwork" : stage.part === 2 ? "Warmup" : stage.stageTypeId === "pitch-detection-slide" ? "Slide" : isMultiNote ? "Sequence" : stage.part >= 5 ? "Technique" : "Individual"}
              </span>
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
        <div className="flex flex-col gap-4 px-5 py-5 overflow-y-auto flex-1 min-h-0">
          {/* Chakra detail — only for slot targets, skip for lip-roll sequences */}
          {!isTechniqueIntro &&
            chakraIds.length > 0 &&
            stage.stageTypeId !== "breathwork" &&
            !(
              stage.technique === "lip-rolls" &&
              (stage.stageTypeId === "pitch-detection-slide" || isMultiNote)
            ) && (
              <ChakraDetailCard
                chakraIds={chakraIds}
                frequencyOverrides={freqOverrides}
                style="full"
              />
            )}

          {/* Instructions — farinelli: before you begin first, then intro, video, key tips */}
          {stage.stageTypeId === "breathwork" ? (
            <>
              <div
                className="rounded-xl px-4 py-3"
                style={{
                  border: "2px solid rgba(251,191,36,0.6)",
                  background: "rgba(251,191,36,0.08)",
                }}
              >
                <p className="text-sm font-semibold text-amber-400/95 mb-1.5">
                  Before you begin
                </p>
                <p className="text-sm text-white/75 leading-relaxed">
                  If you have heart or respiratory conditions, or are pregnant, check with your doctor first. Stop immediately if you feel dizzy, lightheaded, or unwell at any time.
                </p>
              </div>
              <div className="flex items-center justify-center py-3">
                <span className="text-white/45 text-[0.5em] leading-none">●</span>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.88)" }}>
                  {stage.instruction.split("\n\n")[0]}
                </p>
              </div>
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
              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium text-white/70 tracking-wide uppercase">
                  Key tips
                </p>
                <ul className="flex flex-col gap-2.5">
                  {FARINELLI_ADVICES.map((tip, i) => (
                    <li
                      key={i}
                      className="flex gap-2.5 text-[15px] leading-relaxed"
                      style={{ color: "rgba(255,255,255,0.72)" }}
                    >
                      <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-violet-400/70" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-1">
                {stage.instruction.split("\n").map((line, i) => (
                  <p
                    key={i}
                    className="text-base leading-relaxed"
                    style={{
                      color:
                        i === 0
                          ? "rgba(255,255,255,0.88)"
                          : "rgba(255,255,255,0.55)",
                    }}
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
                  <p className="text-sm text-white/45 font-medium">
                    Video coming soon
                  </p>
                </div>
              )}
            </>
          )}

          {/* Headphones notice — only for exercises with pitch canvas (not breathwork) */}
          {!isTechniqueIntro && stage.stageTypeId !== "breathwork" && <HeadphonesNotice />}

          {/* Tuning context */}
          <p className="text-xs text-white/45 text-center">
            Tuning: {settings.tuning}
          </p>
        </div>

        {/* Don't show again checkbox — when navigating between exercises */}
        {showDontShowAgain && (
          <div className="px-5 py-2 flex flex-col gap-1 shrink-0 border-t border-white/[0.06]">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 rounded border-white/30 bg-white/5 text-violet-500 focus:ring-violet-500/50"
              />
              <span className="text-sm text-white/58">
                Don&apos;t show for this exercise again
              </span>
            </label>
            <p className="text-xs text-white/40 pl-6 flex items-center gap-1.5 flex-wrap">
              You can always bring it back by clicking the{" "}
              <InfoIcon size={12} className="inline-block opacity-70 shrink-0" />{" "}
              icon on the screen
            </p>
          </div>
        )}

        {/* Begin button */}
        <div className="px-5 pb-5 pt-3 border-t border-white/[0.06] shrink-0">
          <button
            onClick={handleBegin}
            disabled={isClosing}
            className="w-full py-4 rounded-xl text-base font-semibold text-white transition-all disabled:opacity-70"
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
  const [isClosing, setIsClosing] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = headerRef.current;
        if (el) {
          const rect = el.getBoundingClientRect();
          const x = (rect.left + rect.width / 2) / window.innerWidth;
          const y = (rect.top + rect.height / 2) / window.innerHeight;
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { x, y },
          });
        } else {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.35 },
          });
        }
      });
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!isClosing) return;
    const id = setTimeout(() => onContinue(), 280);
    return () => clearTimeout(id);
  }, [isClosing, onContinue]);

  // Keep backdrop opaque during close to avoid revealing old content before navigation
  return (
    <div
      className={`fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 ${isClosing ? "pointer-events-none" : ""}`}
      style={{
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(8px)",
        opacity: 1, // never fade backdrop — hides old content until new page loads
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: "#0f0f1a",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        }}
      >
        <div
          ref={headerRef}
          className="px-5 pt-5 pb-4 flex flex-col items-center gap-3"
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: "rgba(124,58,237,0.2)" }}
          >
            <BadgeIcon
              className="text-violet-400"
              style={{ width: 24, height: 24 }}
            />
          </div>
          <h2 className="text-xl font-semibold text-white text-center">
            Part{" "}
            {["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"][part - 1]}{" "}
            Complete
          </h2>
          <p className="text-sm text-white/72 text-center">{partName}</p>
        </div>
        <div className="px-5 py-4 border-t border-white/[0.06] flex flex-col gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/45 mb-1">
              What you learnt
            </p>
            <p className="text-sm text-white/85">{learned}</p>
          </div>
          {tip && (
            <p className="text-sm font-medium" style={{ color: "#a78bfa" }}>
              {tip}
            </p>
          )}
        </div>
        <div className="px-5 pb-5 pt-3 border-t border-white/[0.06]">
          <button
            onClick={() => !isClosing && setIsClosing(true)}
            disabled={isClosing}
            className="w-full py-4 rounded-xl text-base font-semibold text-white disabled:opacity-70"
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

// ── Journey Exercise ───────────────────────────────────────────────────────────
//
// URL-driven flow:
// 1. User visits /journey/[id] → page gets step id from URL
// 2. We find the stage in JOURNEY_STAGES
// 3. We render background/content by step type:
//    - Exercises (individual, sequence, slide): PitchCanvas + exercise UI
//    - Learn steps (technique_intro): plain background + scrollable content
// 4. PartCompleteModal shows when finishing the last step of a part
// 5. Continue → onNext(nextId) → router.push → new URL → flow repeats from 1

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
  onPrev,
}: {
  stageId: number;
  settings: Settings;
  pitchHz: number | null;
  pitchHzRef: React.RefObject<number | null>;
  onPlayTone: (band: Band) => void;
  onSettingsUpdate: <K extends keyof Settings>(
    key: K,
    value: Settings[K],
  ) => void;
  onOpenSettings: () => void;
  onBack: () => void;
  onNext: (nextStageId: number) => void;
  onPrev?: (prevStageId: number) => void;
}) {
  const router = useRouter();
  const highestCompleted = settings.journeyStage;
  const stage = JOURNEY_STAGES.find((s) => s.id === stageId)!;
  const isCompleted = stageId <= highestCompleted;
  const isCurrentStage = stageId === highestCompleted + 1;

  const allBands = useMemo(
    () => getScaleNotesForRange(
      settings.vocalRangeLowHz > 0 ? settings.vocalRangeLowHz : 131,
      settings.vocalRangeHighHz > 0 ? settings.vocalRangeHighHz : 523,
      settings.tuning,
    ),
    [settings.vocalRangeLowHz, settings.vocalRangeHighHz, settings.tuning],
  );

  // Resolve exercise bands from BandTarget configs
  const exerciseBands = useMemo(() => {
    if (stage.stageTypeId === "pitch-detection") {
      return stage.notes.flatMap((n) => resolveBandTarget(n.target, allBands));
    }
    if (stage.stageTypeId === "pitch-detection-slide") {
      const fromBands = resolveBandTarget(stage.notes[0].from, allBands);
      const toBands = resolveBandTarget(stage.notes[0].to, allBands);
      const fromIdx = fromBands[0] ? allBands.indexOf(fromBands[0]) : 0;
      const toIdx = toBands[0] ? allBands.indexOf(toBands[0]) : allBands.length - 1;
      const lo = Math.min(fromIdx, toIdx);
      const hi = Math.max(fromIdx, toIdx);
      return allBands.slice(lo, hi + 1);
    }
    return [];
  }, [stage, allBands]);

  const isRangeTarget =
    stage.stageTypeId === "pitch-detection" &&
    stage.notes.length === 1 &&
    stage.notes[0].target.kind === "range";

  const highlightIds = useMemo(() => exerciseBands.map((b) => b.id), [exerciseBands]);

  // Bands to play when user taps "Play tone"
  const toneBands = useMemo(() => {
    if (stage.stageTypeId === "pitch-detection") {
      return stage.notes.flatMap((n) => resolveBandTarget(n.target, allBands));
    }
    if (stage.stageTypeId === "pitch-detection-slide") {
      return [
        ...resolveBandTarget(stage.notes[0].from, allBands),
        ...resolveBandTarget(stage.notes[0].to, allBands),
      ];
    }
    return [];
  }, [stage, allBands]);

  // Sequence step bands (for multi-note indicator dots)
  const seqStepBands = useMemo(() => {
    if (stage.stageTypeId !== "pitch-detection" || stage.notes.length <= 1) return [];
    return stage.notes.map((n) => resolveBandTarget(n.target, allBands)[0]).filter(Boolean);
  }, [stage, allBands]);

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
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isTonePlaying, setIsTonePlaying] = useState(false);
  const toneTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);

  // Auto-show info modal before exercise (breathwork always; others unless user skipped)
  useEffect(() => {
    if (stage.stageTypeId === "intro") return;
    if (stage.stageTypeId === "breathwork") {
      setShowInfoModal(true);
      return;
    }
    const skipped = getSkippedInfoStageIds();
    if (!skipped.has(stageId)) setShowInfoModal(true);
  }, [stageId, stage.stageTypeId]);

  // Prefetch next page so it’s ready when the modal closes
  useEffect(() => {
    if (partCompleteData !== null) {
      const nextId = stageId + 1;
      if (nextId <= TOTAL_JOURNEY_STAGES) {
        router.prefetch(`/journey/${nextId}`);
      } else {
        router.prefetch("/");
      }
    }
  }, [partCompleteData, stageId, router]);

  const resetProgress = useCallback(() => {
    holdRef.current = 0;
    seqIndexRef.current = 0;
    noteHoldRef.current = 0;
    lastTickRef.current = 0;
    slideCountRef.current = 0;
    slideLastZoneRef.current = null;
    if (toneTimeoutRef.current) {
      clearTimeout(toneTimeoutRef.current);
      toneTimeoutRef.current = null;
    }
    setIsTonePlaying(false);
    setProgress(0);
    setSeqIndex(0);
    setSlideCount(0);
    setStageComplete(false);
  }, []);

  useEffect(() => {
    resetProgress();
  }, [stageId, resetProgress]);

  useEffect(() => {
    analytics.journeyExerciseStarted(stageId, stage.part, PART_TITLES[stage.part] ?? "");
  }, [stageId, stage.part]);

  useEffect(() => {
    if (!isCurrentStage || stageComplete || stage.stageTypeId === "breathwork") return;

    function tick() {
      const now = performance.now();
      const dt = lastTickRef.current ? (now - lastTickRef.current) / 1000 : 0;
      lastTickRef.current = now;

      const hz = pitchHzRef.current;

      if (stage.stageTypeId === "pitch-detection" && stage.notes.length === 1) {
        const holdSeconds = stage.notes[0].seconds;
        const targetBands = resolveBandTarget(stage.notes[0].target, allBands);
        const inTune =
          hz !== null &&
          (stage.notes[0].target.kind === "range"
            ? isInBandRange(hz, targetBands)
            : targetBands.some((t) => isInTune(hz, t.frequencyHz)));
        if (inTune) holdRef.current += dt;
        const p = holdRef.current / holdSeconds;
        setProgress(p);
        if (p >= 1) setStageComplete(true);
      } else if (stage.stageTypeId === "pitch-detection-slide" && hz !== null) {
        const fromBands = resolveBandTarget(stage.notes[0].from, allBands);
        const toBands = resolveBandTarget(stage.notes[0].to, allBands);
        const fromHz = fromBands[0]?.frequencyHz ?? 0;
        const toHz = toBands[0]?.frequencyHz ?? 0;
        const isHighToLow = fromHz > toHz;
        const freqs = exerciseBands.map((b) => b.frequencyHz);
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
      } else if (stage.stageTypeId === "pitch-detection" && stage.notes.length > 1) {
        const idx = seqIndexRef.current;
        const noteConfig = stage.notes[idx];
        if (!noteConfig) return;
        const targetBands = resolveBandTarget(noteConfig.target, allBands);
        const noteSeconds = noteConfig.seconds;
        if (targetBands.length > 0 && hz !== null && targetBands.some((t) => isInTune(hz, t.frequencyHz))) {
          noteHoldRef.current += dt;
          if (noteHoldRef.current >= noteSeconds) {
            noteHoldRef.current = 0;
            seqIndexRef.current = idx + 1;
            setSeqIndex(idx + 1);
            if (seqIndexRef.current >= stage.notes.length) {
              setStageComplete(true);
              setProgress(1);
              return;
            }
          }
        } else {
          noteHoldRef.current = Math.max(0, noteHoldRef.current - dt * 0.5);
        }
        setProgress(
          (seqIndexRef.current + noteHoldRef.current / noteSeconds) /
            stage.notes.length,
        );
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCurrentStage, stageComplete, stageId]);

  function navigateTo(targetId: number) {
    if (targetId < 1) return;
    onNext(targetId);
  }

  function navigateToPrev(targetId: number) {
    if (targetId < 1) return;
    onPrev?.(targetId);
  }

  function goToNextStage(markComplete: boolean) {
    if (markComplete) {
      onSettingsUpdate("journeyStage", Math.max(highestCompleted, stageId));
      analytics.journeyStageCompleted(stageId, stage.part);
    }
    if (isLastStageOfPart(stageId)) {
      const content = PART_COMPLETE_CONTENT[stage.part];
      const partName = PART_TITLES[stage.part] ?? "";
      analytics.journeyPartCompleted(stage.part, partName);
      setPartCompleteData({
        part: stage.part,
        partName,
        learned: content.learned,
        tip: content.tip,
      });
    } else {
      navigateTo(stageId + 1);
    }
  }

  function goToPrevStage() {
    const prevId = stageId - 1;
    if (prevId < 1) return;
    if (!onPrev) return;
    navigateToPrev(prevId);
  }

  function doAdvance() {
    if (stageId < TOTAL_JOURNEY_STAGES) {
      navigateTo(stageId + 1);
    } else {
      onBack();
    }
  }

  /** Skip: advance without marking complete. Show info modal when navigating. */
  function handleSkip() {
    goToNextStage(false);
  }

  /** Complete: mark as done and advance. Show info modal when navigating. */
  function handleComplete() {
    goToNextStage(true);
  }

  function handlePartCompleteContinue() {
    setPartCompleteData(null);
    doAdvance();
  }

  const TONE_DURATION_MS = 1800;
  const TONE_GAP_MS = 2000;

  function handleHearTone() {
    if (isTonePlaying) return;
    setIsTonePlaying(true);
    toneBands.forEach((band, i) => {
      setTimeout(() => onPlayTone(band), i * TONE_GAP_MS);
    });
    const totalMs = (toneBands.length - 1) * TONE_GAP_MS + TONE_DURATION_MS;
    if (toneTimeoutRef.current) clearTimeout(toneTimeoutRef.current);
    toneTimeoutRef.current = setTimeout(() => {
      toneTimeoutRef.current = null;
      setIsTonePlaying(false);
    }, totalMs);
  }

  const closestBand =
    pitchHz && exerciseBands.length > 0
      ? findClosestBand(pitchHz, exerciseBands)
      : null;
  const locked =
    pitchHz && closestBand &&
    (isRangeTarget
      ? isInBandRange(pitchHz, exerciseBands)
      : isInTune(pitchHz, closestBand.frequencyHz));

  return (
    <div className="flex flex-col h-full">
      {/* ── Sub-nav ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border-b border-white/[0.06] shrink-0 overflow-x-auto">
        <button
          onClick={onBack}
          className="flex items-center shrink-0 text-xs sm:text-sm text-white/58 hover:text-white/85 transition-colors"
        >
          ← Journey
        </button>
        <span className="text-white/25">|</span>
        <span className="text-xs sm:text-sm text-white/45 shrink-0">
          Part {["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"][stage.part - 1]}
        </span>
        <span className="hidden md:inline text-xs text-white/62 font-medium shrink-0">
          — {PART_TITLES[stage.part]}
        </span>
        <span className="text-white/25">·</span>
        <span className="text-xs sm:text-sm text-white/52 shrink-0">
          {getStepInPart(stageId).stepIndex} of{" "}
          {getStepInPart(stageId).stepsInPart}
        </span>
        <span className="text-white/25">—</span>
        <span className="text-xs sm:text-sm text-white/72 font-medium truncate min-w-0">
          {stage.title}
        </span>
        {stage.stageTypeId !== "intro" && (
          <InfoButton onClick={() => setShowInfoModal(true)} />
        )}
        <button
          onClick={onOpenSettings}
          className="ml-auto shrink-0 text-xs text-white/45 hover:text-white/72 transition-colors"
        >
          {settings.tuning}
        </button>
      </div>

      {/* Info modal — re-open from exercise (i) button — skip for intro */}
      {stage.stageTypeId !== "intro" && showInfoModal && (
        <ExerciseInfoModal
          stageId={stageId}
          settings={settings}
          onStart={() => setShowInfoModal(false)}
          onDismiss={() => setShowInfoModal(false)}
          showDontShowAgain={stage.stageTypeId !== "breathwork"}
        />
      )}

      {/* ── Main content: intro, breathwork, or canvas for exercises ─── */}
      {stage.stageTypeId === "intro" ? (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="max-w-lg mx-auto px-5 py-6 flex flex-col gap-6">
            {/* Part header — shown for every learning section */}
            <div className="pb-2 border-b border-white/[0.08]">
              <h2 className="text-xl font-semibold text-white">
                Part {["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"][stage.part - 1]} — {PART_TITLES[stage.part]}
              </h2>
              <p className="text-sm text-white/55 mt-0.5">
                {stage.title} · {getStepInPart(stageId).stepIndex} of {getStepInPart(stageId).stepsInPart}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              {stage.instruction.split("\n").map((line, i) => (
                <p
                  key={i}
                  className="text-base leading-relaxed"
                  style={{
                    color:
                      i === 0
                        ? "rgba(255,255,255,0.88)"
                        : "rgba(255,255,255,0.55)",
                  }}
                >
                  {line}
                </p>
              ))}
            </div>
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
            <p className="text-xs text-white/45">
              Tuning: {settings.tuning}
            </p>
          </div>
        </div>
      ) : stage.stageTypeId === "breathwork" ? (
        <div className="relative flex-1 min-h-0 flex items-center justify-center">
          <FarinelliExercise
            maxCount={stage.maxCount}
            startCount={4}
            onComplete={() => setStageComplete(true)}
          />
        </div>
      ) : (
      <div className="relative flex-1 min-h-0">
        <PitchCanvas
          bands={allBands}
          currentHzRef={pitchHzRef}
          highlightIds={highlightIds}
          showChakraLabels={stage.part === 9}
        />

        {/* Pitch overlay */}
        {pitchHz !== null && (
          <div className="pointer-events-none absolute top-3 left-4 fade-in">
            {isRangeTarget ? (
              <div
                className="text-2xl font-light"
                style={{ color: closestBand?.color ?? "#fff" }}
              >
                {locked ? "✓ " : ""}
                {stage.stageTypeId === "pitch-detection" && stage.notes[0].target.kind === "range" && stage.notes[0].target.from >= 0 ? "Low tone" : "High tone"}
              </div>
            ) : (
              <>
                <div
                  className="text-3xl font-light tabular-nums"
                  style={{ color: closestBand?.color ?? "#fff" }}
                >
                  {Math.round(pitchHz)} Hz
                </div>
                {closestBand && (
                  <div
                    className="text-sm mt-0.5"
                    style={{ color: `${closestBand.color}cc` }}
                  >
                    {locked ? "✓ " : "→ "}
                    {closestBand.name}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Sequence step indicator */}
        {stage.stageTypeId === "pitch-detection-slide" && isCurrentStage && !stageComplete && (
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
                    backgroundColor: done
                      ? "#a78bfa"
                      : "rgba(255,255,255,0.15)",
                  }}
                />
              );
            })}
            <span className="text-xs text-white/55 ml-1">
              slide {slideCount}/2
            </span>
          </div>
        )}
        {stage.stageTypeId === "pitch-detection" && stage.notes.length > 1 && isCurrentStage && !stageComplete && (
          <div className="pointer-events-none absolute bottom-3 left-4 flex items-center gap-2">
            {seqStepBands.map((b, i) => {
              const done = i < seqIndex;
              const active = i === seqIndex;
              return (
                <div
                  key={b.id}
                  className="rounded-full transition-all"
                  style={{
                    width: active ? 10 : 7,
                    height: active ? 10 : 7,
                    backgroundColor: done
                      ? b.color
                      : active
                        ? `${b.color}99`
                        : "rgba(255,255,255,0.15)",
                    boxShadow: active ? `0 0 8px ${b.color}88` : "none",
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
      )}

      {/* ── Bottom panel ──────────────────────────────────────────────────────── */}
      <div className="border-t border-white/[0.06] bg-white/[0.02] px-3 sm:px-5 py-2 sm:pt-2.5 sm:pb-1.5 flex flex-row flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-4 shrink-0">
        {stage.stageTypeId === "intro" ? (
          <div className="flex items-center gap-2 sm:gap-3 ml-auto w-full sm:w-auto justify-end">
            {stageId > 1 && onPrev && (
              <button
                onClick={goToPrevStage}
                className="flex-1 sm:flex-none px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium border border-white/20 text-white/58 hover:text-white/85 hover:border-white/30 transition-all min-w-0"
                title="Previous"
              >
                ← Prev
              </button>
            )}
            <button
              onClick={handleComplete}
              className="flex-1 sm:flex-none px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium text-white transition-all min-w-0"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                boxShadow: "0 0 16px rgba(124,58,237,0.4)",
              }}
            >
              {stageId < TOTAL_JOURNEY_STAGES ? "Next →" : "Complete ✓"}
            </button>
          </div>
        ) : (
          <>
        {isCurrentStage && !stageComplete && stage.stageTypeId !== "pitch-detection-slide" && stage.stageTypeId !== "breathwork" && (
          <div className="shrink-0 order-first sm:order-none">
            <ProgressArc progress={progress} />
          </div>
        )}
        {isCurrentStage && !stageComplete && stage.stageTypeId === "pitch-detection-slide" && (
          <div className="flex items-center gap-2 shrink-0 text-xs sm:text-sm text-white/55">
            Slide {slideCount}/2
          </div>
        )}
        {stageComplete && <span className="text-xl sm:text-2xl shrink-0">✓</span>}
        {isCompleted && !isCurrentStage && (
          <span className="text-sm sm:text-base text-white/48 shrink-0">Completed</span>
        )}

        <div className="flex flex-row items-center gap-2 sm:gap-3 flex-1 min-w-0 sm:flex-initial sm:min-w-0 justify-end sm:ml-auto">
          {stage.stageTypeId !== "breathwork" && (
          <button
            onClick={handleHearTone}
            disabled={isTonePlaying}
            className={`shrink-0 px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium border transition-all flex items-center gap-2 ${
              isTonePlaying
                ? "border-violet-500/50 bg-violet-600/30 text-white cursor-default"
                : "border-white/20 text-white/65 hover:text-white/90 hover:border-white/35"
            }`}
            title={isTonePlaying ? "Playing…" : "Play the target tone"}
          >
            {isTonePlaying ? (
              <>
                <span className="inline-flex gap-0.5">
                  <span className="w-0.5 h-3 bg-current rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
                  <span className="w-0.5 h-4 bg-current rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
                  <span className="w-0.5 h-3 bg-current rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
                  <span className="w-0.5 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: "75ms" }} />
                </span>
                Playing…
              </>
            ) : (
              <>▶ Play {toneBands.length > 1 ? "tones" : "tone"}</>
            )}
          </button>
          )}
          <div className="flex gap-2 flex-1 sm:flex-initial min-w-0">
            {stageId > 1 && onPrev && (
              <button
                onClick={goToPrevStage}
                className="flex-1 sm:flex-initial sm:min-w-[6.5rem] px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium border border-white/20 text-white/58 hover:text-white/85 hover:border-white/30 transition-all min-w-0"
                title="Previous exercise"
              >
                ← Prev
              </button>
            )}
            {(stageComplete || isCompleted) ? (
              <button
                onClick={handleComplete}
                className="flex-1 sm:flex-initial sm:min-w-[6.5rem] px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium text-white transition-all min-w-0"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                  boxShadow: "0 0 16px rgba(124,58,237,0.4)",
                }}
              >
                {stageId < TOTAL_JOURNEY_STAGES ? "Next →" : "Complete ✓"}
              </button>
            ) : (
              <button
                onClick={handleSkip}
                className="flex-1 sm:flex-initial sm:min-w-[6.5rem] px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium text-white transition-all min-w-0"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                  boxShadow: "0 0 16px rgba(124,58,237,0.4)",
                }}
                title="Skip this step (won't mark as complete)"
              >
                Skip →
              </button>
            )}
          </div>
        </div>
          </>
        )}
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

  return (
    <div className="h-full">
      <JourneyList
        settings={settings}
        onSelect={(stageId) => router.push(`/journey/${stageId}`)}
      />
    </div>
  );
}
