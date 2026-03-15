# Code Organization

Guidelines for keeping the codebase maintainable. These rules apply to both specs and source code.

## File size

- **Keep files small.** Aim for under ~300 lines per file when practical.
- **If a file grows large** (over ~400 lines), consider splitting it.
- Large config or data files are prime candidates: split by domain or logical unit rather than arbitrary chunks.

## Splitting strategy

When splitting a large file:

1. **Extract by logical unit** — e.g. one file per section, part, or feature.
2. **Preserve a single public surface** — re-export from an index or main module so imports stay simple.
3. **Share types** — put shared types in a dedicated file (e.g. `types.ts`) and import where needed.

## Example: Journey / exercise config

`src/constants/journey/` is split per part. See [Journey](../../specs/journey.md#code-structure).

```
src/constants/journey/
├── types.ts    — JourneyExercise discriminated union, ExerciseTypeId, JourneyPart, etc.
├── index.ts    — exports JOURNEY_CONFIG (JourneyPart[]), JOURNEY_EXERCISES (flat), etc.
├── part1.ts    — Part I:    Introduction
├── part2.ts    — Part II:   First Sounds
├── part3.ts    — Part III:  Lip Rolls & Breath
├── part4.ts    — Part IV:   Low Resonance
├── part5.ts    — Part V:    Building Range
├── part6.ts    — Part VI:   Rounded Vowels
├── part7.ts    — Part VII:  Vowel Warmth
├── part8.ts    — Part VIII: The Open AH
├── part9.ts    — Part IX:   Breath & Body
```

Each part file exports its exercises; `index.ts` wraps them in `JOURNEY_CONFIG: JourneyPart[]` and derives the flat `JOURNEY_EXERCISES` list. Consumers import from `@/constants/journey` unchanged.

## Specs

The same principles apply to specs:

- If a spec grows beyond ~200 lines, consider splitting into sub-specs (e.g. `journey-stages.md`, `journey-flow.md`).
- Link between related specs instead of duplicating content.
