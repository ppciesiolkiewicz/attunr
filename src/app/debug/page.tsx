"use client";

import { useState, useEffect, useCallback } from "react";
import { Text, Button } from "@/components/ui";

const ATTUNR_PREFIX = "attunr.";

function readAttunrKeys(): Record<string, string> {
  const entries: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(ATTUNR_PREFIX)) {
      entries[key] = localStorage.getItem(key) ?? "";
    }
  }
  return entries;
}

function formatValue(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

export default function DebugPage() {
  const [entries, setEntries] = useState<Record<string, string>>({});

  const refresh = useCallback(() => setEntries(readAttunrKeys()), []);

  useEffect(refresh, [refresh]);

  if (process.env.NODE_ENV === "production") {
    return (
      <div className="p-8">
        <Text variant="body">Not found</Text>
      </div>
    );
  }

  const keys = Object.keys(entries).sort();

  function handleDelete(key: string) {
    localStorage.removeItem(key);
    refresh();
  }

  function handleClearAll() {
    keys.forEach((k) => localStorage.removeItem(k));
    refresh();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Text variant="heading" as="h1">Debug</Text>
        <Button variant="ghost" size="sm" onClick={handleClearAll}>
          Clear all
        </Button>
      </div>

      {keys.length === 0 ? (
        <Text variant="body-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
          No attunr.* keys in localStorage.
        </Text>
      ) : (
        <div className="flex flex-col gap-2">
          {keys.map((key) => (
            <div
              key={key}
              className="rounded-lg border px-3 py-2 flex items-start justify-between gap-3"
              style={{
                borderColor: "rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.025)",
              }}
            >
              <div className="min-w-0 flex-1">
                <Text variant="label" as="div" className="mb-1">
                  {key.slice(ATTUNR_PREFIX.length)}
                </Text>
                <pre
                  className="text-xs whitespace-pre-wrap break-all"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  {formatValue(entries[key])}
                </pre>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(key)}
                style={{ color: "rgba(255,100,100,0.7)", flexShrink: 0 }}
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
