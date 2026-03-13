"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import PitchCanvas from "../../PitchCanvas";
import BalanceBallCanvas from "../../BalanceBallCanvas";
import { FarinelliExercise } from "../../FarinelliExercise";
import { InfoButton } from "../../TabInfoModal";
import { Button, VideoPlaceholder } from "@/components/ui";
import { resolveBandTarget, getSkippedInfoStageIds, getStepInPart } from "../utils";
import { ProgressArc } from "./ProgressArc";
import { ExerciseInfoModal } from "./ExerciseInfoModal";
import { PartCompleteModal } from "./PartCompleteModal";
import { JOURNEY_STAGES, TOTAL_JOURNEY_STAGES, isLastStageOfPart, PART_COMPLETE_CONTENT, PART_TITLES } from "@/constants/journey";
import { analytics } from "@/lib/analytics";
import { getScaleNotesForRange } from "@/lib/vocal-scale";
import { findClosestBand, isInTune, matchesBandTarget } from "@/lib/pitch";
import type { Band } from "@/constants/chakras";
import type { Settings } from "@/hooks/useSettings";

export function JourneyExercise({
  stageId,
  settings,
  pitchHz,
  pitchHzRef,
  onPlayTone,
  onPlaySlide,
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
  onPlaySlide?: (fromBand: Band, toBand: Band) => void;
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
  const [showCongrats, setShowCongrats] = useState(false);
  const [isTonePlaying, setIsTonePlaying] = useState(false);
  const toneTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);

  // Fire confetti + show "Congratulations" when exercise hits 100%
  useEffect(() => {
    if (!stageComplete) return;
    setShowCongrats(true);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.45 } });
    const id = setTimeout(() => setShowCongrats(false), 2400);
    return () => clearTimeout(id);
  }, [stageComplete]);

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
    if (stageComplete || stage.stageTypeId === "breathwork") return;

    function tick() {
      const now = performance.now();
      const dt = lastTickRef.current ? (now - lastTickRef.current) / 1000 : 0;
      lastTickRef.current = now;

      const hz = pitchHzRef.current;

      if (stage.stageTypeId === "pitch-detection" && stage.notes.length === 1) {
        const holdSeconds = stage.notes[0].seconds;
        const target = stage.notes[0].target;
        const targetBands = resolveBandTarget(target, allBands);
        const lipRollTolerance = stage.technique === "lip-rolls" ? 0.08 : 0.03;
        const inTune =
          hz !== null &&
          (target.kind === "range"
            ? matchesBandTarget(hz, targetBands, target.accept ?? "within")
            : targetBands.some((t) => isInTune(hz, t.frequencyHz, lipRollTolerance)));
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
        // Lip-roll slides: use permissive thresholds so high/low zones are easier to hit
        const isLipRoll = stage.technique === "lip-rolls";
        const highThreshold = isLipRoll ? maxFreq * 0.5 : maxFreq * 0.75;
        const lowThreshold = isLipRoll ? minFreq * 1.5 : minFreq * 1.25;
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
  }, [stageComplete, stageId]);

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
  const SLIDE_DURATION_MS = 300 + 1500 + 500; // hold-start + slide + hold-end

  function handleHearTone() {
    if (isTonePlaying) return;
    setIsTonePlaying(true);

    // Lip-roll slides: play a smooth glide (highest → lowest) instead of discrete tones
    if (
      stage.stageTypeId === "pitch-detection-slide" &&
      stage.technique === "lip-rolls" &&
      onPlaySlide &&
      toneBands.length >= 2
    ) {
      const freqs = toneBands.map((b) => b.frequencyHz);
      const highBand = toneBands[freqs.indexOf(Math.max(...freqs))];
      const lowBand = toneBands[freqs.indexOf(Math.min(...freqs))];
      onPlaySlide(highBand, lowBand);
      if (toneTimeoutRef.current) clearTimeout(toneTimeoutRef.current);
      toneTimeoutRef.current = setTimeout(() => {
        toneTimeoutRef.current = null;
        setIsTonePlaying(false);
      }, SLIDE_DURATION_MS);
      return;
    }

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
  const rangeAccept =
    isRangeTarget && stage.notes[0].target.kind === "range"
      ? stage.notes[0].target.accept ?? "within"
      : "within";
  const lipRollTolerance = stage.technique === "lip-rolls" ? 0.08 : 0.03;
  const locked =
    pitchHz && closestBand &&
    (isRangeTarget
      ? matchesBandTarget(pitchHz, exerciseBands, rangeAccept)
      : isInTune(pitchHz, closestBand.frequencyHz, lipRollTolerance));

  // Current target band for "Too low / Too high" hint
  const targetBand = (() => {
    if (stage.stageTypeId !== "pitch-detection") return null;
    if (isRangeTarget) return null;
    if (stage.notes.length === 1) return exerciseBands[0] ?? null;
    return seqStepBands[seqIndex] ?? null;
  })();

  return (
    <div className="flex flex-col h-full">
      {/* ── Sub-nav ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border-b border-white/[0.06] shrink-0 overflow-x-auto">
        <Button variant="ghost" onClick={onBack} className="shrink-0 text-xs sm:text-sm text-white/68 hover:text-white/90 pr-1!">
          ← Journey
        </Button>
        <span className="text-white/35">|</span>
        <span className="text-xs sm:text-sm text-white/55 shrink-0">
          Part {["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"][stage.part - 1]}
        </span>
        <span className="hidden md:inline text-xs text-white/72 font-medium shrink-0">
          — {PART_TITLES[stage.part]}
        </span>
        <span className="text-white/35">·</span>
        <span className="text-xs sm:text-sm text-white/62 shrink-0">
          {getStepInPart(stageId).stepIndex} of{" "}
          {getStepInPart(stageId).stepsInPart}
        </span>
        <span className="text-white/35">—</span>
        <span className="text-xs sm:text-sm text-white/80 font-medium truncate min-w-0">
          {stage.title}
        </span>
        {stage.stageTypeId !== "intro" && (
          <span className="ml-1.5">
            <InfoButton onClick={() => setShowInfoModal(true)} />
          </span>
        )}
        <Button variant="ghost" onClick={onOpenSettings} className="ml-auto shrink-0 text-xs text-white/55 hover:text-white/80">
          {settings.tuning}
        </Button>
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
              <p className="text-sm text-white/65 mt-0.5">
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
            <VideoPlaceholder />
            <p className="text-xs text-white/55">
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
        {stage.stageTypeId === "pitch-detection" && stage.notes.length === 1 ? (
          <BalanceBallCanvas
            bands={exerciseBands}
            currentHzRef={pitchHzRef}
            highlightIds={highlightIds}
            inTuneOverride={
              isRangeTarget && stage.notes[0].target.kind === "range"
                ? { bands: exerciseBands, accept: rangeAccept }
                : undefined
            }
          />
        ) : (
          <PitchCanvas
            bands={exerciseBands}
            currentHzRef={pitchHzRef}
            inTuneOverride={
              isRangeTarget && stage.notes[0].target.kind === "range"
                ? { bands: exerciseBands, accept: rangeAccept }
                : undefined
            }
            showChakraLabels={stage.part === 9}
          />
        )}

        {/* Completion checkmark overlay */}
        {showCongrats && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
            <div className="congrats-appear flex items-center justify-center w-20 h-20 rounded-full bg-violet-600/25 drop-shadow-lg">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
        )}

        {/* Pitch overlay */}
        {pitchHz !== null && (
          <div className="pointer-events-none absolute top-3 left-4 fade-in">
            {isRangeTarget ? (
              <>
                <div
                  className="text-2xl font-light"
                  style={{ color: closestBand?.color ?? "#fff" }}
                >
                  {locked ? "✓ " : ""}
                  {stage.stageTypeId === "pitch-detection" && stage.notes[0].target.kind === "range" && stage.notes[0].target.from >= 0 ? "Low tone" : "High tone"}
                </div>
                {!locked && (
                  <div className="text-sm mt-1 text-white/55">
                    {rangeAccept === "below" ? "↑ Too high" : rangeAccept === "above" ? "↓ Too low" : ""}
                  </div>
                )}
              </>
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
                {!locked && targetBand && (
                  <div className="text-sm mt-1 text-white/55">
                    {pitchHz < targetBand.frequencyHz ? "↓ Too low" : "↑ Too high"}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Sequence step indicator */}
        {stage.stageTypeId === "pitch-detection-slide" && !stageComplete && (
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
            <span className="text-xs text-white/65 ml-1">
              slide {slideCount}/2
            </span>
          </div>
        )}
        {stage.stageTypeId === "pitch-detection" && stage.notes.length > 1 && !stageComplete && (
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
              <Button variant="outline" onClick={goToPrevStage} title="Previous" className="flex-1 sm:flex-none px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm min-w-0">
                ← Prev
              </Button>
            )}
            <Button onClick={handleComplete} className="flex-1 sm:flex-none px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm min-w-0">
              {stageId < TOTAL_JOURNEY_STAGES ? "Next →" : "Complete ✓"}
            </Button>
          </div>
        ) : (
          <>
        {stage.stageTypeId !== "breathwork" && (
          <div className="shrink-0 order-first sm:order-none flex items-center gap-2">
            <ProgressArc
              progress={
                stageComplete
                  ? 1
                  : stage.stageTypeId === "pitch-detection-slide"
                    ? slideCount / 2
                    : progress
              }
              complete={stageComplete}
            />
          </div>
        )}

        <div className="flex flex-row items-center gap-2 sm:gap-3 flex-1 min-w-0 sm:flex-initial sm:min-w-0 justify-end sm:ml-auto">
          {stage.stageTypeId !== "breathwork" && (
          <Button
            variant="outline"
            onClick={handleHearTone}
            disabled={isTonePlaying}
            className={`shrink-0 px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm flex items-center gap-2 ${
              isTonePlaying
                ? "border-violet-500/50 bg-violet-600/30 text-white cursor-default"
                : ""
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
          </Button>
          )}
          <div className="flex gap-2 flex-1 sm:flex-initial min-w-0">
            {stageId > 1 && onPrev && (
              <Button variant="outline" onClick={goToPrevStage} title="Previous exercise" className="flex-1 sm:flex-initial sm:min-w-[6.5rem] px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm min-w-0">
                ← Prev
              </Button>
            )}
            {(stageComplete || isCompleted) ? (
              <Button onClick={handleComplete} className="flex-1 sm:flex-initial sm:min-w-[6.5rem] px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm min-w-0">
                {stageId < TOTAL_JOURNEY_STAGES ? "Next →" : "Complete ✓"}
              </Button>
            ) : (
              <Button onClick={handleSkip} title="Skip this step (won't mark as complete)" className="flex-1 sm:flex-initial sm:min-w-[6.5rem] px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm min-w-0">
                Skip →
              </Button>
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
