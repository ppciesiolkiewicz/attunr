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

`src/constants/journey/` is split per part. See [Journey](./journey.md#code-structure).

```
src/constants/journey/
├── types.ts    — JourneyStage, TechniqueId, ChakraDetailStyle, etc.
├── index.ts    — re-exports JOURNEY_STAGES, TOTAL_JOURNEY_STAGES, etc.
├── part1.ts    — Part 1: Chakra tones
├── part2.ts    — Part 2: Vocal warmups
├── part3.ts    — Part 3: Sustain
├── part4.ts    — Part 4: Sequences
├── part5.ts    — Part 5: Vowel U
├── part6.ts    — Part 6: Mantra
├── part7.ts    — Part 7: Vowel EE
├── part8.ts    — Part 8: Vowel flow U → EE
├── part9.ts    — Part 9: Puffy cheeks
```

Each part file exports its stages; `index.ts` concatenates and re-exports. Consumers import from `@/constants/journey` unchanged.

## Specs

The same principles apply to specs:

- If a spec grows beyond ~200 lines, consider splitting into sub-specs (e.g. `journey-stages.md`, `journey-flow.md`).
- Link between related specs instead of duplicating content.
