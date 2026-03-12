# Component Architecture Rules

## Component Hierarchy

```
src/components/
  ui/               # Atoms — primitive building blocks (Button, Modal, Spinner, …)
                     # Import via `@ui` or `@/components/ui`
  MyFeature.tsx      # Standalone feature component (single file)
  MyFeature/         # Feature component with internal complexity
    index.ts         # Public API — only re-exports what consumers need
    MyFeature.tsx    # Root component
    components/      # Internal sub-components (NOT part of public API)
      SubWidget.tsx
    lib/             # Internal helpers, hooks, utils
```

**Atoms (`ui/`)** are the lowest-level, design-system-grade elements: `Button`, `Modal`, `CloseButton`, `Spinner`, etc. They own visual styling, expose `variant`/`size` props, and have no domain knowledge.

**Feature components** live directly in `components/`. They compose atoms and contain domain/business logic. When a feature component grows internal sub-components, promote it to a directory. Consumers always import from the directory root (`components/JourneyView`), never reach into `components/JourneyView/components/InternalWidget`.

A small component with no sub-components stays as a single file — no directory needed.

## Atoms First — Never Use Raw HTML When an Atom Exists

Before writing a raw HTML element (`<button>`, `<input>`, `<select>`, etc.) or ad-hoc inline styles, check `src/components/ui/`. If the atom exists, use it. If the atom you need is missing, add it to `ui/` rather than writing one-off markup.

```tsx
// Bad
<button className="px-4 py-2 rounded-lg bg-violet-600 …">Save</button>

// Good
<Button variant="secondary" size="sm">Save</Button>
```

Import atoms via the barrel: `import { Button, Modal } from "@ui"` (or `@/components/ui`).

## Variant-Driven Primitives

Atoms expose `variant` and/or `size` props to cover different visual treatments — like Material UI or Radix Themes. This keeps styling decisions centralised and consistent.

- When a new visual treatment is needed, prefer adding a variant to an existing atom over a one-off styled element. Only create a separate component when the behaviour or semantics genuinely differ.
- Variant names are semantic (`ghost`, `outline`, `primary`), not visual (`purple`, `big`).
- Variants should be the minimal set that covers real usage. Don't pre-create variants speculatively.

## Extract When It Makes Sense

Apply atomic design thinking as you build. If a piece of UI is cohesive and could stand on its own — a card, a row, a section, a modal body — extract it. Prefer smaller, focused components over large monolithic ones.

Do not extract for its own sake; only when it genuinely reduces complexity or enables reuse.

## Avoid Harmful Abstractions (AHA)

Don't extract shared logic or a shared component until the pattern is stable and clear. A few similar-looking code blocks are often preferable to a premature abstraction that must twist to accommodate every caller. If callers end up working around an abstraction rather than with it, the abstraction is harmful — remove it.

## Clean Code Defaults

- **Names reveal intent.** `isLoading`, `journeyStages`, `handleSubmit` — not `flag`, `data`, `fn`.
- **One responsibility per unit.** If you need "and" to describe a function or component, split it.
- **Short, readable units.** Functions and components should fit on a screen. Extract when they exceed ~80 lines or have more than one clear concern.
- **No dead code.** Remove unused variables, imports, props, and commented-out blocks.
- **Explicit over clever.** Readable, obvious code is better than dense or clever code. Optimise for the next reader.
- **No premature optimisation.** Solve the real problem first. Add performance work only when there is a measured reason.
