# Language & Messaging

> Adapted from `attunr-expo/specs/language-and-messaging.md` for the web platform.
> The brand voice principles and core terminology are identical — only the
> platform-specific references have been updated.

## Brand voice principles

- **User-friendly, engaging, and easy to understand** — copy should be inviting, clear, and accessible to all
- **Warm and grounded** — supportive, calm, and encouraging
- **Simple first** — plain language before music theory terms
- **Spiritual, not extreme** — invite exploration without overpromising
- **Experience-led** — describe what users may feel, then what it means
- **Choice-focused** — empower users to try both options and pick what resonates
- **Direct and personal** — prefer "you" language over passive/system wording

## Core terminology

| Prefer | Avoid | Why |
|--------|-------|-----|
| **Chakra tones** | "Solfeggio frequencies" in UI | Chakra language is more user-facing |
| **Standard tuning (A440 Hz)** | A440 alone without context | Explain the practical meaning |
| **Healing-focused tuning (A432 Hz)** | Mystical claims without guardrails | Keep spiritual framing credible |
| **Voice-based frequencies** | "Transposed", "scaled", "sacredFactor" | Keep technical jargon out of the UI |
| **Sing and watch** | "Pitch feedback", "Detected pitch" | Inviting, human-friendly |

## Tuning messaging

### A432 Hz — healing-focused positioning

- "A432 is a softer, warmer tuning many people connect with calming and healing-focused practice."
- "Great for reflective sessions, breathwork, and intention-based singing."

### A440 Hz — practical standard positioning

- "A440 is the standard tuning used in most Western music."
- "Best when you want compatibility with most songs and instruments."

### Guardrails

- Do not claim medical outcomes ("heals anxiety", "treats illness", etc.).
- Frame benefits as user experience: "may feel", "many people describe", "often experienced as".
- Always present both options as valid.

## Recommended copy by feature

### Frequency mode selector

| Mode | Label | Sub-label |
|------|-------|-----------|
| Absolute | **Absolute sacred** | "396–963 Hz, the same for everyone" |
| Voice-based | **By voice** | "Adjusted to your vocal range" |

### Absolute mode — info modal (shown when switching to Absolute)

Many absolute frequencies are outside normal singing range. Show a modal that:

1. **Explains the limitation** — "Many of these notes are outside the range most people can sing."
2. **Offers an alternative** — "You can blow air instead: lower notes use a gentle breath, higher notes a stronger flow. Visualise matching the tone — your body responds even when you're not singing."
3. **Safety disclaimer** — "Never push your voice. If anything feels strained or painful, stop and switch to By voice."

Copy should stay user-friendly, engaging, and easy to understand.

### Voice type disclaimer (shown only in voice-based mode)

Pattern: "Frequencies adjusted for [Voice type]. You can change this above."

Example: "Frequencies adjusted for Tenor. You can change this above."

- Keep it brief and reassuring.
- Do not expose internal terms like `sacredFactor` or Hz math.

### Pitch visualiser prompt

When the mic is not yet started, show an inviting prompt instead of a technical label:

- ✓ "Tap the mic and sing — you'll see when you're on pitch."
- ✗ "Start pitch detection"
- ✗ "Detected frequency: — Hz"

### In-tune confirmation

When pitch locks to a chakra:

- ✓ "✓ Heart — 639 Hz"
- ✗ "MATCH DETECTED"
- ✗ "In tolerance"

### Chakra band labels (canvas)

Each band shows two lines of right-aligned text:
1. Chakra name in small caps (e.g. `HEART`)
2. Frequency in muted text (e.g. `639 Hz`)

Left side shows the note letter (e.g. `F`).

### Model loading copy

When the ml5 CREPE model is downloading:

- Button sub-label: "Loading pitch model…"
- Helper text (below): "Downloading CREPE pitch model (~15 MB, first load only)"

## Tone examples

| Less ideal | Better |
|------------|--------|
| "Pick A432 for spiritual frequencies." | "Choose A432 for a softer, more meditative feel." |
| "A440 is non-spiritual." | "A440 is the standard tuning used by most songs and instruments." |
| "Pitch detection started" | "Listening…" |
| "No pitch detected" | (show nothing, or a subtle "Listening…") |
| "Error: getUserMedia failed" | "Couldn't access your microphone. Please allow access and try again." |
