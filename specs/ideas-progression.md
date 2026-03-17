# Ideas: Progression & Unlockables

Early ideas for deepening engagement and simplifying internals. Not a detailed spec — a starting point for future design work.

---

## Secret stages

The main journey stays linear, but at certain points **secret stages** branch off as side paths. These are visible in the UI but locked until their unlock condition is met.

### Unlock types

1. **Prerequisite-based** — complete a specific journey stage and the entire secret stage unlocks.
2. **Achievement-based** — earn a badge (see below) to unlock. These require cumulative effort that goes beyond simple progression, e.g. "10 minutes of breathwork exercises combined."

Secret stages are self-contained side quests. Completing them is optional — the main journey never requires them — but they offer deeper dives into specific techniques or themes.

### Open questions

- How many secret stages? Where do they branch from?
- Do secret stages have their own part structure, or are they flat sequences?
- Do they appear inline in the journey list or in a separate section?
- Can secret stages themselves unlock further secret stages (chains)?

---

## Badge / achievement system

Badges reward cumulative practice and milestones. Some badges serve as keys that unlock secret stages; others are purely celebratory.

### Possible badge categories

- **Cumulative practice** — "10 minutes of breathwork", "50 exercises completed", "30 minutes of toning"
- **Streaks** — "3 days in a row", "weekly consistency"
- **Skill milestones** — "held a note for 10 seconds", "matched pitch within X cents"
- **Exploration** — "tried all exercise types", "completed a secret stage"

### Open questions

- Where do badges live in the UI? Dedicated profile/achievements screen? Inline in journey?
- Quiet personal milestones vs celebratory moments (modals, animations, confetti)?
- How granular? A few meaningful badges vs many small ones?
- Should badges be visible before they're earned (motivation) or hidden (surprise)?
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

---

## Streak tracking

Track consecutive days of practice to encourage daily habits. Streaks are a core engagement loop that ties into badges and notifications.

### How it works

- A **streak** increments each calendar day the user completes at least one exercise.
- Missing a day resets the streak to zero.
- The current streak and longest streak are persisted.

### Notifications

Push notifications nudge users to maintain their streak:

- **Evening reminder** — "Don't lose your 5-day streak! A quick warm-up keeps it alive."
- **Streak milestone** — "7 days in a row — you're building a real habit!"
- **Streak at risk** — late-day nudge if the user hasn't practiced yet: "Still time to keep your streak going."

Notification tone should be encouraging, never guilt-tripping. Users can disable or adjust notification timing.

### Connection to badges

Streak milestones feed directly into the badge system (e.g. "3 days in a row", "7-day streak", "30-day streak"). Some streak badges could unlock secret stages.

### Open questions

- What counts as "a day"? Calendar day in local timezone?
- Minimum exercise duration/completion to count toward streak?
- Freeze / grace mechanic (e.g. one free miss per week)?
- Where does the streak display in the UI? Journey screen, home, profile?

---

## Social: Invite friends & multiplayer

Invite-based growth and social practice to make vocal training less solitary.

### Friend invites

- Users can share a **registration link** to invite friends.
- Track who invited whom (referral attribution).
- Possible rewards for inviter and invitee (badge, streak freeze, unlock a secret stage).

### Multiplayer games

- Real-time or turn-based vocal games between friends (e.g. pitch-matching duels, call-and-response rounds).
- Leaderboards among friends for accuracy, streak length, or exercises completed.
- Collaborative challenges — friends work toward a shared goal together.

### Open questions

- What multiplayer formats fit vocal exercises? Synchronous vs asynchronous?
- How does matchmaking work — friends only, or open lobbies?
- What's the minimum viable social feature to ship first?
- Privacy considerations — how much practice data is visible to friends?

---

## Refactor: Journey owns resolution

Currently exercise configs go through a `resolveExercise` step that produces `ResolvedExercise` types. The idea: **unresolved configs are an internal detail of Journey** — consumers outside Journey should never see them.

Journey would expose a helper function (or resolve internally) so that by the time an exercise config leaves the journey boundary, it's already resolved. This eliminates the `ResolvedExercise` types from the public surface and simplifies the component layer — components just receive ready-to-use exercise data without knowing about resolution.
