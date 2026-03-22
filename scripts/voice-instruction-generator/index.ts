import * as fs from "fs";
import * as path from "path";
import { config } from "dotenv";
import { put } from "@vercel/blob";
import { voiceSettings } from "./settings";
import { getExerciseTypeVoiceConfig } from "./exercise-type-voice-config";

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
) {
  if (!ELEVENLABS_API_KEY) {
    throw new Error("ELEVENLABS_API_KEY not set in .env.local");
  }

  const charCount = ssml.length;
  const voice = voiceSettings.instructionVoice;
  console.log(`  [${segmentName}] Calling TTS (${charCount} chars)...`);

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
        ...(voice.speed !== undefined ||
        voice.stability !== undefined
          ? {
              voice_settings: {
                ...(voice.speed !== undefined && { speed: voice.speed }),
                ...(voice.stability !== undefined && {
                  stability: voice.stability,
                }),
                ...(voice.similarityBoost !== undefined && {
                  similarity_boost: voice.similarityBoost,
                }),
                ...(voice.style !== undefined && { style: voice.style }),
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

    await generateSegmentAudio(segment.ssml, segment.name, outDir);
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
    });

    console.log(`  ${file} → ${blob.url}`);
  }

  console.log(`\nUpload complete! Base URL: voice/exercise-types/${exerciseTypeId}/`);
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
    case "test":
      await test();
      break;
    default:
      console.error(
        "Usage: npx tsx -r tsconfig-paths/register scripts/voice-instruction-generator <generate-type|upload-type|test> [args]",
      );
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
