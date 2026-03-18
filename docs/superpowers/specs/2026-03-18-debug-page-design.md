# Debug Page Design

## Overview

Dev-only `/debug` page that displays localStorage contents and lets you clear individual keys or all at once. Purely a developer tool — not linked from the app UI.

## Route

`src/app/debug/page.tsx` — single `"use client"` component, no extra layout.

## Dev Gate

Returns a "not found" style message when `process.env.NODE_ENV === 'production'`. No redirect, just a static message so the page is invisible in prod.

## UI

- **Header row:** "Debug" title + "Clear all" button
- **Key list:** All `attunr.*` keys from localStorage, each row showing:
  - Key name (with `attunr.` prefix stripped for readability)
  - Value — JSON pretty-printed if parseable, raw string otherwise
  - Delete button to remove that key
- After any delete or clear-all, the list re-renders with updated state
- Minimal dark-theme styling consistent with the rest of the app

## Behavior

- Reads localStorage on mount via `useEffect` + `useState`
- Delete/clear-all mutate localStorage directly, then refresh state
- No context providers, no server components, no API calls
