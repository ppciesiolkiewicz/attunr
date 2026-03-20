# Ideas: Progression & Unlockables

Early ideas for deepening engagement and simplifying internals. Not a detailed spec — a starting point for future design work.

---

## Non-linear progress

Current idea is:

- once you completed enough from the main path you can swipe path to the left and right and be left with Chapter 1 from another section, e.g. breath, body, rythm, voice, music...

## Secret stages

-- this mixes to - unlinear journey path and secret stages.
-- Secret stages can be both linear and non-linear:

The main journey stays linear, but at certain points **secret stages** branch off as side paths. These are visible in the UI but locked until their unlock condition is met.

### Unlock types

1. **Prerequisite-based** — complete a specific journey stage and the entire secret stage unlocks.
2. **Achievement-based** — earn a badge (see below) to unlock. These require cumulative effort that goes beyond simple progression, e.g. "10 minutes of breathwork exercises combined."

---

## Badge / achievement system

Badges reward cumulative practice and milestones. Some badges serve as keys that unlock secret stages; others are purely celebratory.

### Possible badge categories

- **Cumulative practice** — "10 minutes of breathwork", "50 exercises completed", "30 minutes of toning"
- **Streaks** — "3 days in a row", "weekly consistency"
- **Skill milestones** — "held a note for 10 seconds", "matched pitch within X cents"
- **Exploration** — "tried all exercise types", "completed a secret stage"

### Open questions

- Should badges be visible before they're earned (motivation) or hidden (surprise)?
  I like the surprise idea - you get your first badge and the Badges tab appears

- What data do we need to track to compute badge progress? (session time per exercise type, streak days, accuracy stats)

---

## Relationship between the two

```
Main Journey (linear)
  │
  ├── Stage 13 ──── unlocks ──→ [Secret: Deep Breath]  (prerequisite)
  │
  ├── Stage 25 ──── unlocks ──→ [Secret: Resonance Explorer]  (prerequisite)
  │
  │   Badge: "10 min breathwork" ──→ [Secret: Breath Mastery]  (achievement)
  │
  ├── Stage 40 ...
  │
  └── ...continues...
```

The main journey is always the spine. Secret stages are optional branches that reward engagement without blocking progress.

## Streak grace

- Freeze / grace mechanic (e.g. one free miss per week)?

## Social: Invite friends & multiplayer

Invite-based growth and social practice to make vocal training less solitary.

### Friend invites

- Users can share a **registration link** to invite friends.
- Track who invited whom (referral attribution).
- Possible rewards for inviter and invitee (badge, streak freeze, unlock a secret stage).

### Multiplayer games

Real-time or turn-based vocal games between friends (e.g. pitch-matching duels, call-and-response rounds).

---

## Turn Journey into /feature

Encapsulate the code into single direcory containing components, hooks, context, data etc.

## Share on social

## Maillist vs signup

## Feedback form via posthog

## PWA

## Decreasing progress in exercises

When we don't make a sound in hill or volume-detection
exercise the progress falls down.
Later it can fall down quicker forcing users to make sound for longer.

## Visual Feedback

We could have more visual feedback to drive engagement

## SEO

## Remove "kind": "index" from melody

I think would be more peformant to just store array of integers as alternative to other methods and assume we always use either index or the other type. Each note should note have "kind"

## Use Facemesh to detect i someone smiles too much

## Bug:

rep progress should start at 0, e.g. 0/3, then after first goes to 1/3

# Stop freesing canvas when i unfocus

This causes some issues when navigating away from browsers
