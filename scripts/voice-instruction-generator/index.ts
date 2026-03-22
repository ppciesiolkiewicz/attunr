import * as fs from "fs";
import * as path from "path";
import { config } from "dotenv";
import { put } from "@vercel/blob";
import { voiceSettings } from "./settings";
import { getExerciseTypeVoiceConfig } from "./exercise-type-voice-config";
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
  voiceType: "instruction" | "tips" = "instruction",
  voiceOverrides?: { speed?: number; stability?: number; similarityBoost?: number; style?: number },
) {
  if (!ELEVENLABS_API_KEY) {
    throw new Error("ELEVENLABS_API_KEY not set in .env.local");
  }

  const charCount = ssml.length;
  const voice = voiceType === "tips" ? voiceSettings.tipsVoice : voiceSettings.instructionVoice;
  const speed = voiceOverrides?.speed ?? voice.speed;
  const stability = voiceOverrides?.stability ?? voice.stability;
  const similarityBoost = voiceOverrides?.similarityBoost ?? voice.similarityBoost;
  const style = voiceOverrides?.style ?? voice.style;
  console.log(`  [${segmentName}] Calling TTS (${charCount} chars)...`);

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
                ...(voice.speakerBoost !== undefined && {
                  use_speaker_boost: voice.speakerBoost,
                }),
              },
            }
          : {}),
        language_code: voiceSettings.languageCode,
        enable_ssml_parsing: true,
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

    await generateSegmentAudio(segment.ssml, segment.name, outDir, segment.voice, segment.voiceOverrides);
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

// ── generate-chapter ─────────────────────────────────────────────────────

async function generateChapter(chapterSlug: string, force: boolean) {
  const chapter = journey.chapters.find((c) => c.slug === chapterSlug);
  if (!chapter) throw new Error(`No chapter with slug "${chapterSlug}"`);

  const exercises = chapter.stages
    .flatMap((s) => s.exercises)
    .filter((e): e is LearnVoiceDrivenConfig => e.exerciseTypeId === "learn-voice-driven");

  if (exercises.length === 0) {
    console.log(`No learn-voice-driven exercises in chapter "${chapterSlug}"`);
    return;
  }

  console.log(`Generating voice for ${exercises.length} learn exercises in chapter "${chapterSlug}"...\n`);

  for (const exercise of exercises) {
    const outDir = path.join(OUTPUT_DIR, "exercise-types", "learn-voice-driven", chapterSlug, exercise.slug);
    console.log(`Exercise: ${exercise.slug} (${exercise.segments.length} segments)`);

    for (const segment of exercise.segments) {
      const audioPath = path.join(outDir, `${segment.name}.mp3`);
      if (!force && fs.existsSync(audioPath)) {
        console.log(`  Skipping ${segment.name} — already exists`);
        continue;
      }
      const ssml = `<speak>${segment.text}</speak>`;
      await generateSegmentAudio(ssml, segment.name, outDir, "instruction", { speed: 0.8 });
    }
    console.log();
  }

  console.log("Done!");
}

// ── upload-chapter ──────────────────────────────────────────────────────

async function uploadChapter(chapterSlug: string) {
  if (!BLOB_TOKEN) throw new Error("ATTUNR_BLOB_READ_WRITE_TOKEN not set in .env.local");

  const chapterDir = path.join(OUTPUT_DIR, "exercise-types", "learn-voice-driven", chapterSlug);
  if (!fs.existsSync(chapterDir)) {
    throw new Error(`No generated files found in ${chapterDir}. Run 'generate-chapter' first.`);
  }

  const exerciseDirs = fs.readdirSync(chapterDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const exerciseSlug of exerciseDirs) {
    const exerciseDir = path.join(chapterDir, exerciseSlug);
    const files = fs.readdirSync(exerciseDir).filter(
      (f) => f.endsWith(".mp3") || f.endsWith(".timestamps.json"),
    );

    const blobPrefix = `voice/exercise-types/learn-voice-driven/${chapterSlug}/${exerciseSlug}`;
    console.log(`Uploading ${files.length} files for ${chapterSlug}/${exerciseSlug}...`);

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

// ── test ─────────────────────────────────────────────────────────────────────

async function test() {
  const ssml = `<speak>Inhale. <break time="1s"/> 1 <break time="1s"/> 2 <break time="1s"/> 3</speak>`;
  const dir = path.join(OUTPUT_DIR, "_test");
  await generateSegmentAudio(ssml, "test", dir);
}

// ── CLI ──────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
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
      const [chapterSlug] = rest;
      if (!chapterSlug) {
        console.error("Usage: generate-chapter <chapterSlug> [--force]");
        process.exit(1);
      }
      await generateChapter(chapterSlug, force);
      break;
    }
    case "upload-chapter": {
      const [chapterSlug] = rest;
      if (!chapterSlug) {
        console.error("Usage: upload-chapter <chapterSlug>");
        process.exit(1);
      }
      await uploadChapter(chapterSlug);
      break;
    }
    case "test":
      await test();
      break;
    default:
      console.error(
        "Usage: npx tsx -r tsconfig-paths/register scripts/voice-instruction-generator <generate-type|generate-chapter|upload-type|upload-chapter|test> [args]",
      );
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
