"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import ChakraDetailCard from "@/components/ChakraDetailCard";
import { FarinelliExercise, FARINELLI_ADVICES } from "@/components/FarinelliExercise";
import { HeadphonesNotice, InfoButton, InfoIcon } from "@/components/TabInfoModal";
import { Button, CloseButton, Modal, VideoPlaceholder } from "@/components/ui";
import { JOURNEY_STAGES } from "@/constants/journey";
import { getScaleNotesForRange } from "@/lib/vocal-scale";
import {
  addSkippedInfoStageId,
  getStageChakraIds,
  getStageDisplayColors,
  getStepInPart,
} from "../utils";
import { BookIcon } from "./BookIcon";
import type { Settings } from "@/hooks/useSettings";

interface ExerciseInfoModalProps {
  stageId: number;
  settings: Settings;
  onStart: () => void;
  onDismiss: () => void;
  onAdvanceWithoutExercise?: () => void;
  showDontShowAgain?: boolean;
}

export function ExerciseInfoModal({
  stageId,
  settings,
  onStart,
  onDismiss,
  onAdvanceWithoutExercise,
  showDontShowAgain,
}: ExerciseInfoModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const stage = JOURNEY_STAGES.find((s) => s.id === stageId)!;
  const isTechniqueIntro = stage.stageTypeId === "intro";

  const allBands = useMemo(
    () =>
      getScaleNotesForRange(
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

  const noteTime =
    stage.stageTypeId === "pitch-detection" ? stage.notes[0]?.seconds ?? 0 : 0;
  const isMultiNote =
    stage.stageTypeId === "pitch-detection" && stage.notes.length > 1;
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
      if (isTechniqueIntro && onAdvanceWithoutExercise)
        onAdvanceWithoutExercise();
      else onStart();
    };
  });

  useEffect(() => {
    if (!isClosing) return;
    const id = setTimeout(() => commitBeginRef.current(), 280);
    return () => clearTimeout(id);
  }, [isClosing]);

  const hideBackdropOnClose = !showDontShowAgain;

  return (
    <Modal
      onBackdropClick={isClosing ? undefined : onDismiss}
      className={`transition-opacity duration-300 ease-out ${isClosing ? "pointer-events-none" : ""}`}
      style={{ opacity: isClosing && hideBackdropOnClose ? 0 : 1 }}
      panelClassName="transition-all duration-300 ease-out"
      panelStyle={{
        opacity: isClosing ? 0 : 1,
        transform: isClosing ? "scale(0.96)" : "scale(1)",
      }}
    >
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-white/[0.06] shrink-0">
          <div>
            <p className="text-xs text-white/55 mb-1 flex items-center gap-1.5">
              {isTechniqueIntro && <BookIcon className="opacity-70" />}
              <span className="uppercase tracking-widest">
                Part{" "}
                {["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"][
                  stage.part - 1
                ]}
              </span>
              <span className="text-white/45">·</span>
              <span>
                {getStepInPart(stageId).stepIndex} of{" "}
                {getStepInPart(stageId).stepsInPart}
              </span>
              <span className="text-white/45">·</span>
              <span>
                {isTechniqueIntro
                  ? "Learn"
                  : stage.stageTypeId === "breathwork"
                    ? "Breathwork"
                    : stage.part === 2
                      ? "Warmup"
                      : stage.stageTypeId === "pitch-detection-slide"
                        ? "Slide"
                        : isMultiNote
                          ? "Sequence"
                          : stage.part >= 5
                            ? "Technique"
                            : "Individual"}
              </span>
            </p>
            <h2 className="text-xl font-semibold text-white">{stage.title}</h2>
            <p className="text-sm mt-1" style={{ color: primaryColor }}>
              {objective}
            </p>
          </div>
          <CloseButton onClick={onDismiss} className="ml-4 mt-0.5 shrink-0" />
        </div>

        <div className="flex flex-col gap-4 px-5 py-5 overflow-y-auto flex-1 min-h-0">
          {stage.part === 9 &&
            !isTechniqueIntro &&
            chakraIds.length > 0 &&
            stage.stageTypeId !== "breathwork" && (
              <ChakraDetailCard
                chakraIds={chakraIds}
                frequencyOverrides={freqOverrides}
                style="full"
              />
            )}

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
                <p className="text-sm text-white/82 leading-relaxed">
                  If you have heart or respiratory conditions, or are pregnant,
                  check with your doctor first. Stop immediately if you feel
                  dizzy, lightheaded, or unwell at any time.
                </p>
              </div>
              <div className="flex items-center justify-center py-3">
                <span className="text-white/55 text-[0.5em] leading-none">
                  ●
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <p
                  className="text-base leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.88)" }}
                >
                  {stage.instruction.split("\n\n")[0]}
                </p>
              </div>
              <VideoPlaceholder />
              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium text-white/78 tracking-wide uppercase">
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
              {isTechniqueIntro && <VideoPlaceholder />}
            </>
          )}

          {!isTechniqueIntro &&
            stage.stageTypeId !== "breathwork" && <HeadphonesNotice />}

          <p className="text-xs text-white/55 text-center">
            Tuning: {settings.tuning}
          </p>
        </div>

        {showDontShowAgain && (
          <div className="px-5 py-2 flex flex-col gap-1 shrink-0 border-t border-white/[0.06]">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 rounded border-white/30 bg-white/5 text-violet-500 focus:ring-violet-500/50"
              />
              <span className="text-sm text-white/68">
                Don&apos;t show for this exercise again
              </span>
            </label>
            <p className="text-xs text-white/50 pl-6 flex items-center gap-1.5 flex-wrap">
              You can always bring it back by clicking the{" "}
              <InfoIcon size={12} className="inline-block opacity-70 shrink-0" />{" "}
              icon on the screen
            </p>
          </div>
        )}

        <div className="px-5 pb-5 pt-3 border-t border-white/[0.06] shrink-0">
          <Button size="lg" onClick={handleBegin} disabled={isClosing} className="w-full">
            {isTechniqueIntro ? "Continue →" : "Begin exercise →"}
          </Button>
        </div>
    </Modal>
  );
}
