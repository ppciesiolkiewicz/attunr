# Journey Part Pruning

## Context

The journey has 18 active parts (1–10, 13–20; 11–12 already removed). To focus development effort, we're pruning to a minimal set that covers every `exerciseTypeId` and `techniqueId` combination currently in use.

## Design

### Approach

Comment out imports and `JOURNEY_CONFIG` entries in `src/constants/journey/index.ts`. Part files stay untouched — easy to re-enable later.

Add a `// Core idea: ...` comment above each part entry (both active and commented-out) describing that part's purpose.

### Active parts

| Part | Title | exerciseTypeIds | techniqueIds |
|------|-------|-----------------|--------------|
| 1 | Introduction | `learn`, `learn-notes-1` | `sustain` |
| 2 | First Sounds | `learn`, `pitch-detection`, `breathwork-farinelli`, `melody`, `tone-follow` | `sustain`, `lip-rolls` |
| 3 | Lip Rolls & Breath | `tone-follow`, `breathwork-farinelli`, `pitch-detection` | `lip-rolls`, `sustain` |
| 4 | Low Resonance | `learn`, `pitch-detection`, `breathwork-farinelli` | `sustain` |
| 5 | Building Range | `pitch-detection`, `breathwork-farinelli` | — |
| 9 | Breath & Body | `learn`, `pitch-detection`, `breathwork-farinelli` | `puffy-cheeks` |

### Commented-out parts

| Part | Title | Core idea |
|------|-------|-----------|
| 6 | Rounded Vowels | OO and OH vowels on low-to-mid tones |
| 7 | Vowel Warmth | OO/OH deeper; 4-tone rising sequences; lip roll sustain |
| 8 | The Open AH | AH vowel; first vowel flow (U→AH); 4-tone sequences |
| 10 | Sequences & Range | Multi-tone sequences with U, Hum, AH, OO; skip sequences |
| 11 | Chakras — Earth | Already removed |
| 12 | Chakras — Sky | Already removed |
| 13 | Forward EH | EH vowel (forward resonance); OH→EH flow |
| 14 | EH Mastery | Extended EH holds; 4-tone EH sequences; puffy cheeks; AH→EH flow |
| 15 | Warmup III | Advanced warmup combining all prior techniques |
| 16 | Vowel EE | EE vowel on low/mid/mid-high; 3-tone sequences |
| 17 | EE & Brightness | EE on high tones; U→EE full vowel flow; 7-tone sequence |
| 18 | Vowel Flow | Vowel transition mastery: U→OO, OO→AH, AH→EH, EH→EE flows |
| 19 | Vowel Mastery | Advanced flows (U→EE high, OO→EE); vowel cascade |
| 20 | Vocal Control | Peak difficulty — all techniques combined |

### Coverage

**exerciseTypeIds:** `learn`, `learn-notes-1`, `pitch-detection`, `breathwork-farinelli`, `melody`, `tone-follow` — all types currently used in config. (`pitch-detection-slide` is defined in types but unused.)

**techniqueIds:** `sustain`, `lip-rolls`, `puffy-cheeks` — all except `mantra` (skipped intentionally; only used in removed chakra parts 11–12).

### Skipped

- `mantra` technique — only used in chakra parts (already removed)
- `pitch-detection-slide` exercise type — defined in types but not used in any part

## Files to modify

| File | Change |
|------|--------|
| `src/constants/journey/index.ts` | Comment out imports for parts 6–8, 10, 13–20. Comment out corresponding `JOURNEY_CONFIG` entries. Add `// Core idea: ...` comment above every part entry. |

## Verification

1. `npx tsc --noEmit` — no type errors
2. Dev server loads, journey shows 6 parts
3. All 6 parts playable end-to-end
