import type { SupabaseClient } from "@supabase/supabase-js";
import type { JourneyProgressData } from "@/lib/journey-progress";

/**
 * One-time migration: merge localStorage progress into DB on account creation.
 * Only called when the user has zero DB completions (i.e. brand new account).
 */
export async function migrateLocalProgressToDb(
  supabase: SupabaseClient,
  userId: string,
) {
  const raw = localStorage.getItem("attunr.journeyProgress");
  if (!raw) return;

  let localData: JourneyProgressData;
  try {
    localData = JSON.parse(raw);
  } catch {
    return;
  }

  const rows: {
    user_id: string;
    chapter_slug: string;
    stage_slug: string;
    exercise_slug: string;
    completed_at: string;
  }[] = [];

  for (const [chapter, stages] of Object.entries(localData)) {
    for (const [stage, exercises] of Object.entries(stages)) {
      for (const [exercise, progress] of Object.entries(exercises)) {
        if (progress.completed) {
          rows.push({
            user_id: userId,
            chapter_slug: chapter,
            stage_slug: stage,
            exercise_slug: exercise,
            completed_at: new Date(progress.completedAt ?? Date.now()).toISOString(),
          });
        }
      }
    }
  }

  if (rows.length > 0) {
    const { error } = await supabase
      .from("exercise_completions")
      .upsert(rows, {
        onConflict: "user_id,chapter_slug,stage_slug,exercise_slug",
      });

    if (error) {
      console.error("Failed to migrate local progress:", error.message);
    }
  }
}

/**
 * Load all exercise completions from DB into the format useJourneyProgress expects.
 */
export async function loadProgressFromDb(
  supabase: SupabaseClient,
  userId: string,
): Promise<JourneyProgressData> {
  const { data: rows, error } = await supabase
    .from("exercise_completions")
    .select("chapter_slug, stage_slug, exercise_slug, completed_at")
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to load DB progress:", error.message);
    return {};
  }

  const result: JourneyProgressData = {};
  for (const row of rows ?? []) {
    ((result[row.chapter_slug] ??= {})[row.stage_slug] ??= {})[row.exercise_slug] = {
      completed: true,
      completedAt: new Date(row.completed_at).getTime(),
    };
  }
  return result;
}

/**
 * Write a single exercise completion to the DB.
 */
export async function writeCompletionToDb(
  supabase: SupabaseClient,
  userId: string,
  chapterSlug: string,
  stageSlug: string,
  exerciseSlug: string,
  completedAt: number,
) {
  const { error } = await supabase.from("exercise_completions").upsert(
    {
      user_id: userId,
      chapter_slug: chapterSlug,
      stage_slug: stageSlug,
      exercise_slug: exerciseSlug,
      completed_at: new Date(completedAt).toISOString(),
    },
    { onConflict: "user_id,chapter_slug,stage_slug,exercise_slug" },
  );

  if (error) {
    console.error("Failed to write exercise completion:", error.message);
  }
}

/**
 * One-time migration: push localStorage voice/range to DB on account creation.
 * Only updates DB fields that are currently empty.
 */
export async function migrateProfileToDb(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("voice_type, vocal_range_low_hz, vocal_range_high_hz")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Failed to fetch profile:", error.message);
    return;
  }

  const localLowHz = Number(localStorage.getItem("attunr.vocalRangeLowHz")) || 0;
  const localHighHz = Number(localStorage.getItem("attunr.vocalRangeHighHz")) || 0;

  const updates: Record<string, unknown> = {};
  if (!profile.vocal_range_low_hz && localLowHz) updates.vocal_range_low_hz = localLowHz;
  if (!profile.vocal_range_high_hz && localHighHz) updates.vocal_range_high_hz = localHighHz;

  if (Object.keys(updates).length > 0) {
    await supabase.from("profiles").update(updates).eq("id", userId);
  }
}
