# Component Architecture Rules

## UI Primitives First

Before reaching for a native HTML element (`<button>`, `<p>`, `<input>`, etc.) or writing raw inline styles, check whether the project has a primitive UI component library (e.g. `src/components/ui/`). If a `Button`, `Text`, `Switch`, or similar atom already exists there, use it. If the primitive you need is missing, add it to the library rather than working around it inline.

## Atomic Design — Extract When It Makes Sense

Apply atomic design thinking as you build. If a piece of UI is cohesive and could stand on its own — a card, a row, a section, a modal body — extract it into its own named component. Prefer smaller, focused components over large monolithic ones. A useful prompt: "would this be easier to read, test, or reuse as its own component?" If yes, extract it.

Do not extract for its own sake; only extract when it genuinely reduces complexity or enables reuse.

## Component Directories for Internal Complexity

When a component grows to need internal sub-components that are implementation details, use a directory:

```
components/MyComponent/
  index.ts            # Public API — re-exports only what external consumers need
  MyComponent.tsx     # Root component
  components/         # Internal sub-components, not part of the public API
    InternalWidget.tsx
```

`index.ts` is the only public interface. Consumers import from `components/MyComponent`, never from `components/MyComponent/components/InternalWidget`. A small component with no sub-components can remain a single file — no directory needed.

## Avoid Harmful Abstractions (AHA)

Don't extract shared logic or a shared component until the pattern is stable and clear. A few similar-looking code blocks are often preferable to a premature abstraction that must twist to accommodate every caller's differences. Extract when the duplication genuinely hurts; hold off when you're not certain the abstraction will outlive the current moment. If callers end up working around an abstraction rather than with it, the abstraction is harmful — remove it.

## Clean Code Defaults

- **Names reveal intent.** `isLoading`, `journeyStages`, `handleSubmit` — not `flag`, `data`, `fn`.
- **One responsibility per unit.** If you need "and" to describe a function or component, split it.
- **Short, readable units.** Functions and components should fit on a screen. Extract when they exceed ~80 lines or have more than one clear concern.
- **No dead code.** Remove unused variables, imports, props, and commented-out blocks.
- **Explicit over clever.** Readable, obvious code is better than dense or clever code. Optimise for the next reader.
- **No premature optimisation.** Solve the real problem first. Add performance work only when there is a measured reason.
