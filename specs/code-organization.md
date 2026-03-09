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

`src/constants/journey.ts` (or similar exercise config) can be split per part:

```
src/constants/
├── journey/
│   ├── types.ts           — JourneyStage, TechniqueId, etc.
│   ├── index.ts           — re-exports JOURNEY_STAGES, TOTAL_JOURNEY_STAGES
│   ├── part-1-chakra.ts   — Part 1: Chakra tones
│   ├── part-2-warmup.ts   — Part 2: Vocal warmups (lip rolls)
│   ├── part-3-sustain.ts   — Part 3: Sustain
│   ├── part-4-sequences.ts — Part 4: Sequences
│   └── ...                — one file per part
```

Each part file exports its stages; `index.ts` concatenates and exports the full array. Consumers import from `@/constants/journey` unchanged.

## Specs

The same principles apply to specs:

- If a spec grows beyond ~200 lines, consider splitting into sub-specs (e.g. `journey-stages.md`, `journey-flow.md`).
- Link between related specs instead of duplicating content.
