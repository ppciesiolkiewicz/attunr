#!/usr/bin/env node

/**
 * CLI tool for managing Vercel Blob voice assets.
 *
 * Usage:
 *   node scripts/blob.mjs list [prefix]              — list blobs (optionally filtered by prefix)
 *   node scripts/blob.mjs delete <url|prefix>        — delete a single blob by URL, or all matching a prefix
 *
 * Examples:
 *   node scripts/blob.mjs list voice/exercise-types/breathwork-farinelli/tip
 *   node scripts/blob.mjs delete voice/exercise-types/breathwork-farinelli/tip
 *
 * Requires ATTUNR_BLOB_READ_WRITE_TOKEN in .env.local
 */

import { config } from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "..", ".env.local") });

const TOKEN = process.env.ATTUNR_BLOB_READ_WRITE_TOKEN;

if (!TOKEN) {
  console.error(
    "Missing ATTUNR_BLOB_READ_WRITE_TOKEN in .env.local\n" +
      "Get one from Vercel → Project → Storage → Blob"
  );
  process.exit(1);
}

// ── Vercel Blob REST helpers ────────────────────────────────────────────────

const API = "https://blob.vercel-storage.com";

async function listBlobs(prefix) {
  const blobs = [];
  let cursor;

  do {
    const params = new URLSearchParams({ limit: "100" });
    if (prefix) params.set("prefix", prefix);
    if (cursor) params.set("cursor", cursor);

    const res = await fetch(`${API}?${params}`, {
      headers: { authorization: `Bearer ${TOKEN}` },
    });

    if (!res.ok) {
      console.error(`List failed: ${res.status} ${await res.text()}`);
      process.exit(1);
    }

    const data = await res.json();
    blobs.push(...data.blobs);
    cursor = data.hasMore ? data.cursor : undefined;
  } while (cursor);

  return blobs;
}

async function deleteBlobs(urls) {
  const res = await fetch(`${API}/delete`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${TOKEN}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ urls }),
  });

  if (!res.ok) {
    console.error(`Delete failed: ${res.status} ${await res.text()}`);
    process.exit(1);
  }
}

// ── Commands ────────────────────────────────────────────────────────────────

const [command, ...args] = process.argv.slice(2);

if (command === "list") {
  const prefix = args[0] || undefined;
  const blobs = await listBlobs(prefix);

  if (blobs.length === 0) {
    console.log("No blobs found.");
  } else {
    console.log(`Found ${blobs.length} blob(s):\n`);
    for (const b of blobs) {
      const size = (b.size / 1024).toFixed(1);
      console.log(`  ${b.pathname}  (${size} KB)`);
    }
  }
} else if (command === "delete") {
  const target = args[0];
  if (!target) {
    console.error("Usage: node scripts/blob.mjs delete <url|prefix>");
    process.exit(1);
  }

  // If it looks like a full URL, delete that single blob
  if (target.startsWith("http")) {
    console.log(`Deleting ${target} ...`);
    await deleteBlobs([target]);
    console.log("Done.");
  } else {
    // Treat as prefix — list matching blobs, confirm, then delete
    const blobs = await listBlobs(target);
    if (blobs.length === 0) {
      console.log(`No blobs matching prefix "${target}".`);
      process.exit(0);
    }

    console.log(`Will delete ${blobs.length} blob(s):\n`);
    for (const b of blobs) {
      console.log(`  ${b.pathname}`);
    }

    // Auto-confirm with --yes flag, otherwise prompt
    if (args.includes("--yes")) {
      await deleteBlobs(blobs.map((b) => b.url));
      console.log(`\nDeleted ${blobs.length} blob(s).`);
    } else {
      const readline = await import("readline");
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      const answer = await new Promise((resolve) =>
        rl.question("\nProceed? (y/N) ", resolve)
      );
      rl.close();

      if (answer.toLowerCase() === "y") {
        await deleteBlobs(blobs.map((b) => b.url));
        console.log(`Deleted ${blobs.length} blob(s).`);
      } else {
        console.log("Aborted.");
      }
    }
  }
} else {
  console.log(
    "Usage:\n" +
      "  node scripts/blob.mjs list [prefix]        — list blobs\n" +
      "  node scripts/blob.mjs delete <url|prefix>   — delete blob(s)\n" +
      "\nExamples:\n" +
      '  node scripts/blob.mjs list voice/exercise-types/breathwork-farinelli/tip\n' +
      '  node scripts/blob.mjs delete voice/exercise-types/breathwork-farinelli/tip'
  );
}
