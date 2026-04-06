// After uploading new audio, bump AUDIO_VERSION in src/constants/settings.ts
// to force clients to re-download cached voice files.

import * as fs from "fs";
import * as path from "path";
import { config } from "dotenv";
import { put } from "@vercel/blob";
import { voiceSettings, australianBaritone } from "./settings";
import { getExerciseTypeVoiceConfig } from "./exercise-type-voice-config";
// Note: generate-chapter handles per-exercise voice directly (not via exercise-type-voice-config)
import { journey } from "../../src/constants/journey";
import type { LearnVoiceDrivenConfig } from "../../src/constants/journey";

// Load .env.local
config({ path: path.resolve(__dirname, "../../.env.local") });

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const BLOB_TOKEN = process.env.ATTUNR_BLOB_READ_WRITE_TOKEN;

const OUTPUT_DIR = path.resolve(__dirname, "output");

// ── TTS Core ─────────────────────────────────────────────────────────────────

async function generateSegmentAudio(
  ssml: string,
  segmentName: string,
  outDir: string,
  voice = australianBaritone(),
) {
  if (!ELEVENLABS_API_KEY) {
    throw new Error("ELEVENLABS_API_KEY not set in .env.local");
  }

  const charCount = ssml.length;
  console.log(`  [${segmentName}] Calling TTS (${charCount} chars, voice: ${voice.name})...`);

  const { speed, stability, similarityBoost, style, speakerBoost } = voice;
  const hasVoiceSettings = speed !== undefined || stability !== undefined;
  const ttsResponse = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voice.voiceId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY,
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: ssml,
        model_id: voiceSettings.modelId,
        ...(hasVoiceSettings
          ? {
              voice_settings: {
                ...(speed !== undefined && { speed }),
                ...(stability !== undefined && { stability }),
                ...(similarityBoost !== undefined && { similarity_boost: similarityBoost }),
                ...(style !== undefined && { style }),
                ...(speakerBoost !== undefined && {
                  use_speaker_boost: speakerBoost,
                }),
              },
            }
          : {}),
        language_code: voiceSettings.languageCode,
      }),
    },
  );

  if (!ttsResponse.ok) {
    const errorText = await ttsResponse.text();
    throw new Error(
      `ElevenLabs TTS error (${ttsResponse.status}): ${errorText}`,
    );
  }

  const audioBuffer = Buffer.from(await ttsResponse.arrayBuffer());
  console.log(
    `  [${segmentName}] TTS done — ${(audioBuffer.length / 1024).toFixed(1)} KB`,
  );

  // Speech-to-text for word timestamps
  console.log(`  [${segmentName}] Running STT for timestamps...`);

  const formData = new FormData();
  formData.append(
    "file",
    new Blob([audioBuffer], { type: "audio/mpeg" }),
    `${segmentName}.mp3`,
  );
  formData.append("model_id", "scribe_v1");
  formData.append("timestamps_granularity", "word");
  formData.append("language_code", voiceSettings.languageCode);

  const sttResponse = await fetch(
    "https://api.elevenlabs.io/v1/speech-to-text",
    {
      method: "POST",
      headers: { "xi-api-key": ELEVENLABS_API_KEY },
      body: formData,
    },
  );

  if (!sttResponse.ok) {
    const errorText = await sttResponse.text();
    throw new Error(
      `ElevenLabs STT error (${sttResponse.status}): ${errorText}`,
    );
  }

  const sttData = await sttResponse.json();

  // Write files
  fs.mkdirSync(outDir, { recursive: true });

  const audioPath = path.join(outDir, `${segmentName}.mp3`);
  fs.writeFileSync(audioPath, audioBuffer);

  const timestampsPath = path.join(outDir, `${segmentName}.timestamps.json`);
  fs.writeFileSync(
    timestampsPath,
    JSON.stringify(
      { text: sttData.text, words: sttData.words ?? [] },
      null,
      2,
    ),
  );

  const infoPath = path.join(outDir, `${segmentName}.info.json`);
  fs.writeFileSync(
    infoPath,
    JSON.stringify(
      {
        ssml,
        voice: voice.name,
        voiceId: voice.voiceId,
        modelId: voiceSettings.modelId,
        characters: charCount,
        generatedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  );

  console.log(`  [${segmentName}] Done`);
}

// ── generate-type ────────────────────────────────────────────────────────────

async function generateType(exerciseTypeId: string, force: boolean) {
  const config = getExerciseTypeVoiceConfig(exerciseTypeId);
  const segments = config.segments();
  const outDir = path.join(OUTPUT_DIR, "exercise-types", exerciseTypeId);

  console.log(
    `Generating ${segments.length} segments for ${exerciseTypeId}...`,
  );

  let generated = 0;
  let skipped = 0;

  for (const segment of segments) {
    const audioPath = path.join(outDir, `${segment.name}.mp3`);

    if (!force && fs.existsSync(audioPath)) {
      console.log(`  Skipping ${segment.name} — already exists`);
      skipped++;
      continue;
    }

    await generateSegmentAudio(segment.ssml, segment.name, outDir, segment.voice);
    generated++;
  }

  console.log(
    `\nDone! Generated: ${generated}, Skipped: ${skipped}, Total: ${segments.length}`,
  );
}

// ── upload-type ──────────────────────────────────────────────────────────────

async function uploadType(exerciseTypeId: string) {
  if (!BLOB_TOKEN) {
    throw new Error("ATTUNR_BLOB_READ_WRITE_TOKEN not set in .env.local");
  }

  const outDir = path.join(OUTPUT_DIR, "exercise-types", exerciseTypeId);
  if (!fs.existsSync(outDir)) {
    throw new Error(
      `No generated files found in ${outDir}. Run 'generate-type' first.`,
    );
  }

  const files = fs.readdirSync(outDir).filter(
    (f) => f.endsWith(".mp3") || f.endsWith(".timestamps.json"),
  );

  if (files.length === 0) {
    throw new Error(`No audio files found in ${outDir}`);
  }

  const blobPrefix = `voice/exercise-types/${exerciseTypeId}`;
  console.log(`Uploading ${files.length} files for ${exerciseTypeId}...`);

  for (const file of files) {
    const filePath = path.join(outDir, file);
    const contentType = file.endsWith(".mp3")
      ? "audio/mpeg"
      : "application/json";

    const blob = await put(`${blobPrefix}/${file}`, fs.readFileSync(filePath), {
      access: "public",
      token: BLOB_TOKEN,
      contentType,
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    console.log(`  ${file} → ${blob.url}`);
  }

  console.log(`\nUpload complete! Base URL: voice/exercise-types/${exerciseTypeId}/`);
}

// ── Voice generation entry ───────────────────────────────────────────────────
// Describes how to generate voice for a single exercise. Each exercise type
// that carries voice content returns one or more GenerationEntry items.

interface GenerationEntry {
  slug: string;
  /** Subfolder under OUTPUT_DIR/chapter/<chapterSlug>/<exerciseSlug>/ */
  exerciseTypeId: string;
  segments: { name: string; ssml: string; voice?: ReturnType<typeof australianBaritone> }[];
}

/** Collect all exercises in a chapter that have voice content to generate. */
function collectVoiceEntries(chapterSlug: string): GenerationEntry[] {
  const chapter = journey.chapters.find((c) => c.slug === chapterSlug);
  if (!chapter) throw new Error(`No chapter with slug "${chapterSlug}"`);

  const allStages = chapter.warmup ? [chapter.warmup, ...chapter.stages] : chapter.stages;
  const exercises = allStages.flatMap((s) => s.exercises);
  const entries: GenerationEntry[] = [];

  for (const exercise of exercises) {
    // learn-voice-driven: segments with spokenText
    if (exercise.exerciseTypeId === "learn-voice-driven") {
      const ex = exercise as LearnVoiceDrivenConfig;
      const voiced = ex.segments.filter((s) => s.spokenText);
      if (voiced.length > 0) {
        entries.push({
          slug: ex.slug,
          exerciseTypeId: ex.exerciseTypeId,
          segments: voiced.map((s) => ({
            name: s.name,
            ssml: s.spokenText!,
            voice: australianBaritone(),
          })),
        });
      }
    }

    // Any exercise with voice.spokenText (hill, pitch-detection, etc.)
    if (exercise.voice?.spokenText) {
      entries.push({
        slug: exercise.slug,
        exerciseTypeId: exercise.exerciseTypeId,
        segments: [{
          name: "instruction",
          ssml: exercise.voice.spokenText,
          voice: australianBaritone(),
        }],
      });
    }
  }

  return entries;
}

// ── generate-chapter ─────────────────────────────────────────────────────

async function generateChapter(chapterSlug: string, exerciseSlug: string | undefined, force: boolean) {
  let entries = collectVoiceEntries(chapterSlug);

  if (exerciseSlug) {
    entries = entries.filter((e) => e.slug === exerciseSlug);
    if (entries.length === 0) {
      throw new Error(`No exercise "${exerciseSlug}" with voice content in chapter "${chapterSlug}"`);
    }
  }

  if (entries.length === 0) {
    console.log(`No exercises with voice content in chapter "${chapterSlug}"`);
    return;
  }

  if (!exerciseSlug && entries.length > 1) {
    const readline = await import("readline");
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await new Promise<string>((resolve) =>
      rl.question(`Generate voice for all ${entries.length} exercises in "${chapterSlug}"? (y/N) `, resolve),
    );
    rl.close();
    if (answer.toLowerCase() !== "y") {
      console.log("Aborted.");
      return;
    }
  }

  console.log(`Generating voice for ${entries.length} exercises in chapter "${chapterSlug}"...\n`);

  for (const entry of entries) {
    const outDir = path.join(OUTPUT_DIR, "exercise-types", entry.exerciseTypeId, "chapters", chapterSlug, entry.slug);
    console.log(`${entry.slug} [${entry.exerciseTypeId}] (${entry.segments.length} segment${entry.segments.length > 1 ? "s" : ""})`);

    for (const segment of entry.segments) {
      const audioPath = path.join(outDir, `${segment.name}.mp3`);
      if (!force && fs.existsSync(audioPath)) {
        console.log(`  Skipping ${segment.name} — already exists`);
        continue;
      }
      await generateSegmentAudio(segment.ssml, segment.name, outDir, segment.voice);
    }
    console.log();
  }

  console.log("Done!");
}

// ── upload-chapter ──────────────────────────────────────────────────────

async function uploadChapter(chapterSlug: string, exerciseSlug?: string) {
  if (!BLOB_TOKEN) throw new Error("ATTUNR_BLOB_READ_WRITE_TOKEN not set in .env.local");

  // Collect entries so we know which exercise-type dirs to look in
  const entries = collectVoiceEntries(chapterSlug);
  if (entries.length === 0) throw new Error(`No exercises with voice content in chapter "${chapterSlug}"`);

  const filtered = exerciseSlug ? entries.filter((e) => e.slug === exerciseSlug) : entries;
  if (filtered.length === 0) throw new Error(`No exercise "${exerciseSlug}" with voice content in chapter "${chapterSlug}"`);

  for (const entry of filtered) {
    const exerciseDir = path.join(OUTPUT_DIR, "exercise-types", entry.exerciseTypeId, "chapters", chapterSlug, entry.slug);
    if (!fs.existsSync(exerciseDir)) {
      console.log(`Skipping ${entry.slug} — no generated files`);
      continue;
    }

    const files = fs.readdirSync(exerciseDir).filter(
      (f) => f.endsWith(".mp3") || f.endsWith(".timestamps.json"),
    );

    const blobPrefix = `voice/exercise-types/${entry.exerciseTypeId}/chapters/${chapterSlug}/${entry.slug}`;
    console.log(`Uploading ${files.length} files for ${entry.exerciseTypeId}/${chapterSlug}/${entry.slug}...`);

    for (const file of files) {
      const filePath = path.join(exerciseDir, file);
      const contentType = file.endsWith(".mp3") ? "audio/mpeg" : "application/json";

      const blob = await put(`${blobPrefix}/${file}`, fs.readFileSync(filePath), {
        access: "public",
        token: BLOB_TOKEN,
        contentType,
        addRandomSuffix: false,
        allowOverwrite: true,
      });

      console.log(`  ${file} → ${blob.url}`);
    }
  }

  console.log("\nUpload complete!");
}

// ── upload-all ──────────────────────────────────────────────────────────────

async function uploadAll() {
  if (!BLOB_TOKEN) throw new Error("ATTUNR_BLOB_READ_WRITE_TOKEN not set in .env.local");

  const exerciseTypesDir = path.join(OUTPUT_DIR, "exercise-types");
  if (!fs.existsSync(exerciseTypesDir)) throw new Error("No output/exercise-types directory found");

  /** Recursively find uploadable files and upload them preserving path structure. */
  async function uploadDir(localDir: string, blobPrefix: string) {
    const entries = fs.readdirSync(localDir, { withFileTypes: true });
    for (const entry of entries) {
      const localPath = path.join(localDir, entry.name);
      if (entry.isDirectory()) {
        await uploadDir(localPath, `${blobPrefix}/${entry.name}`);
      } else if (entry.name.endsWith(".mp3") || entry.name.endsWith(".timestamps.json")) {
        const contentType = entry.name.endsWith(".mp3") ? "audio/mpeg" : "application/json";
        const blob = await put(`${blobPrefix}/${entry.name}`, fs.readFileSync(localPath), {
          access: "public",
          token: BLOB_TOKEN!,
          contentType,
          addRandomSuffix: false,
          allowOverwrite: true,
        });
        console.log(`  ${blobPrefix}/${entry.name} → ${blob.url}`);
      }
    }
  }

  const types = fs.readdirSync(exerciseTypesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const typeId of types) {
    console.log(`\n${typeId}/`);
    await uploadDir(path.join(exerciseTypesDir, typeId), `voice/exercise-types/${typeId}`);
  }

  console.log("\nUpload complete!");
}

// ── test ─────────────────────────────────────────────────────────────────────

async function test() {
  const text = "Inhale. 1. 2. 3.";
  const dir = path.join(OUTPUT_DIR, "_test");
  await generateSegmentAudio(text, "test", dir);
}

// ── test-v3 ─────────────────────────────────────────────────────────────────
// TODO: remove test-v3 command once v3 migration is fully validated

interface TestVariant {
  name: string;
  text: string;
  modelId: string;
  enableSsml: boolean;
  speed?: number;
}

async function testV3() {
  const dir = path.join(OUTPUT_DIR, "_test-v3");

  // Two test phrases: one for counted breathwork, one for spoken instruction
  const phrases = {
    counting: {
      label: "counting",
      variants: [
        {
          name: "v2-ssml-baseline",
          text: '<speak>Inhale. <break time="1s"/> 1 <break time="1s"/> 2 <break time="1s"/> 3</speak>',
          modelId: "eleven_multilingual_v2",
          enableSsml: true,
          speed: undefined as number | undefined,
        },
        ...[0.73].map((speed) => ({
          name: `v3-plain-${speed}`,
          text: "Inhale. 1. 2. 3.",
          modelId: "eleven_v3",
          enableSsml: false,
          speed,
        })),
      ] satisfies TestVariant[],
    },
    instruction: {
      label: "instruction",
      variants: [
        ...[0.73].map((speed) => ({
          name: `v3-plain-${speed}`,
          text: "Put your hand on your chest. Now hum a low note. Feel that vibration? That's your voice, living in your body.",
          modelId: "eleven_v3",
          enableSsml: false,
          speed,
        })),
      ] satisfies TestVariant[],
    },
  };

  // tmp: filter to just the variant we want
  const ONLY = "v3-plain-0.73";

  for (const [, { label, variants }] of Object.entries(phrases)) {
    console.log(`\n═══ ${label} ═══`);
    for (const variant of variants.filter((v) => v.name === ONLY)) {
      const segDir = path.join(dir, label);
      const voice = australianBaritone({ speed: variant.speed });

      // Temporarily override model and ssml settings
      const origModel = voiceSettings.modelId;
      voiceSettings.modelId = variant.modelId;

      // Generate with custom ssml flag
      if (!ELEVENLABS_API_KEY) throw new Error("ELEVENLABS_API_KEY not set in .env.local");

      const charCount = variant.text.length;
      console.log(`\n  [${variant.name}] model=${variant.modelId} speed=${variant.speed ?? "default"} (${charCount} chars)`);

      const { speed, stability, similarityBoost, style, speakerBoost } = voice;
      const hasVoiceSettings = speed !== undefined || stability !== undefined;
      const ttsResponse = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voice.voiceId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": ELEVENLABS_API_KEY,
            Accept: "audio/mpeg",
          },
          body: JSON.stringify({
            text: variant.text,
            model_id: variant.modelId,
            ...(hasVoiceSettings
              ? {
                  voice_settings: {
                    ...(speed !== undefined && { speed }),
                    ...(stability !== undefined && { stability }),
                    ...(similarityBoost !== undefined && { similarity_boost: similarityBoost }),
                    ...(style !== undefined && { style }),
                    ...(speakerBoost !== undefined && { use_speaker_boost: speakerBoost }),
                  },
                }
              : {}),
            language_code: voiceSettings.languageCode,
            ...(variant.enableSsml && { enable_ssml_parsing: true }),
          }),
        },
      );

      if (!ttsResponse.ok) {
        const errorText = await ttsResponse.text();
        console.error(`  [${variant.name}] ERROR: ${errorText}`);
        voiceSettings.modelId = origModel;
        continue;
      }

      const audioBuffer = Buffer.from(await ttsResponse.arrayBuffer());
      fs.mkdirSync(segDir, { recursive: true });
      fs.writeFileSync(path.join(segDir, `${variant.name}.mp3`), audioBuffer);
      console.log(`  [${variant.name}] ✓ ${(audioBuffer.length / 1024).toFixed(1)} KB`);

      voiceSettings.modelId = origModel;
    }
  }

  console.log(`\n\nAll test files written to: ${dir}`);
  console.log("Compare the .mp3 files side by side!");
}

// ── CLI ──────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  if (args.includes("--help")) { args.push("help"); }
  const positional = args.filter((a) => !a.startsWith("--"));
  const [subcommand, ...rest] = positional;

  switch (subcommand) {
    case "generate-type": {
      const [exerciseTypeId] = rest;
      if (!exerciseTypeId) {
        console.error(
          "Usage: generate-type <exerciseTypeId> [--force]",
        );
        process.exit(1);
      }
      await generateType(exerciseTypeId, force);
      break;
    }
    case "upload-type": {
      const [exerciseTypeId] = rest;
      if (!exerciseTypeId) {
        console.error("Usage: upload-type <exerciseTypeId>");
        process.exit(1);
      }
      await uploadType(exerciseTypeId);
      break;
    }
    case "generate-chapter": {
      const [chapterSlug, exerciseSlug] = rest;
      if (!chapterSlug) {
        console.error("Usage: generate-chapter <chapterSlug> [exerciseSlug] [--force]");
        process.exit(1);
      }
      await generateChapter(chapterSlug, exerciseSlug, force);
      break;
    }
    case "upload-chapter": {
      const [chapterSlug, exerciseSlug] = rest;
      if (!chapterSlug) {
        console.error("Usage: upload-chapter <chapterSlug> [exerciseSlug]");
        process.exit(1);
      }
      await uploadChapter(chapterSlug, exerciseSlug);
      break;
    }
    case "upload-all":
      await uploadAll();
      break;
    case "test":
      await test();
      break;
    case "test-v3":
      await testV3();
      break;
    case "--help":
    case "help":
      console.log(`Voice Instruction Generator

Commands:
  generate-type <exerciseTypeId> [--force]          Generate reusable segments for an exercise type (e.g. breathwork-farinelli)
  upload-type <exerciseTypeId>                      Upload generated segments for an exercise type

  generate-chapter <chapter> [exercise] [--force]   Generate per-exercise voice content in a chapter
  upload-chapter <chapter> [exercise]               Upload generated voice for a chapter

  upload-all                                        Upload everything in output/exercise-types/ to blob

  test                                              Generate a short test segment
  test-v3                                           Compare v2 vs v3 pause variants side by side

Options:
  --force   Regenerate even if files already exist
  --help    Show this help message

Examples:
  generate-type breathwork-farinelli                 # reusable segments shared across exercises
  generate-chapter introduction                      # all exercises in chapter (asks for confirmation)
  generate-chapter introduction gentle-hum --force   # single exercise
  upload-chapter introduction gentle-hum
  upload-all                                         # upload everything`);
      break;
    default:
      console.error(
        "Unknown command. Run with --help for usage.",
      );
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
