# Attunr — Claude Code Guide

## Project Structure

```
src/
  app/            # Next.js App Router pages and layouts
  components/     # React components
    ui/           # Primitive UI building blocks (atomic design atoms)
  constants/      # Static data and configuration
  context/        # React context providers
  features/       # Self-contained feature modules (streak, etc.)
  hooks/          # Custom React hooks
  lib/            # Third-party integrations and utilities
  data/           # In-app data (articles, etc.)
  types/          # TypeScript type declarations
specs/            # Product and feature specs
claude/rules/     # Language, messaging, and coding rules for AI guidance
```
