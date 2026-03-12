# App Overview

## Vision

Voice is one of the most powerful tools humans have for regulating emotions and breathing.

**Problem:** Modern adults rarely use their voice intentionally, even though vocalization has measurable benefits for mood, breathing, and nervous system regulation.

**Solution:** Guided vocal and breathwork exercises with real-time pitch feedback — somatic wellbeing through voice, not singing lessons.

The core concept is **vocal placement**: feeling where sound resonates in the body, and using that connection deliberately. Keywords: somatic, meditation, feeling, regulation.

**Future direction:** A growing library of short, varied exercises. Think Candy Crush Saga: structured progression alongside quick creative variety. Low barrier, high return.

No install, no account. Open the page and begin.

## Tone system

Exercises use tones fitted to the user's vocal range, detected during onboarding. Low tones resonate in the chest, high tones in the head. Frequencies scale to a comfortable range for any voice type.

Four tuning standards are available in Settings: A432 (default, warmer), A440 (standard Western), A444, A528.

## App structure

Three main views accessed via bottom nav:

| View        | Route        | Description                                          |
| ----------- | ------------ | ---------------------------------------------------- |
| **Journey** | `/`          | Guided 49-stage progression through vocal techniques |
| **Train**   | (tab)        | Free-form practice — any tone, any order              |
| **Explore** | `/explore`   | Same as Train, accessed via separate route            |

Plus **Settings** (slide-up panel), and **Onboarding** (first launch only).

## Feature status

| Feature                                 | Status  |
| --------------------------------------- | ------- |
| Pitch detection (ml5 / CREPE)           | ✓ Built |
| Onboarding with vocal range detection   | ✓ Built |
| Tone playback with binaural beats       | ✓ Built |
| Train tab (free-form)                   | ✓ Built |
| Journey (49 guided stages, 9 parts)     | ✓ Built |
| Settings panel with localStorage        | ✓ Built |
| Farinelli breathwork exercise           | ✓ Built |
| Mantra/sound cards (Part 9 only)        | ✓ Built |
| Drone accompaniment                     | Not built |
| Waveform ring visualiser                | Not built |
| Login / accounts                        | Out of scope |

## Journey structure

49 stages across 9 parts:

| Part | Name                       | Stages  | Focus                              |
| ---- | -------------------------- | ------- | ---------------------------------- |
| I    | Introduction               | 1       | Vocal placement concept            |
| II   | Vocal warmups              | 2–9     | Farinelli, lip rolls, Low U, Hoo hoo |
| III  | Sustain                    | 10–17   | Hold each of the 7 tones           |
| IV   | Sequences                  | 18–23   | Multi-tone sequences               |
| V    | Vowel U                    | 24–31   | Uuu across all 7 tones             |
| VI   | Vowel EE                   | 32–35   | EE on low, mid, high               |
| VII  | Vowel flow U→EE            | 36–37   | Vowel transition on one tone       |
| VIII | Puffy cheeks               | 38–41   | Breath control technique           |
| IX   | Sounds and Mantras         | 42–49   | Mantras (LAM–AH) on each tone      |

## Stage types

| stageTypeId              | Description                                            |
| ------------------------ | ------------------------------------------------------ |
| `intro`                  | Instructional card, no exercise                        |
| `pitch-detection`        | Hold one or more tones in sequence                     |
| `pitch-detection-slide`  | Continuous glide between two tones                     |
| `breathwork`             | Farinelli breathing cycles (no pitch detection)        |

## Tech highlights

- **ml5 CREPE** — deep-learning pitch detection, accurate for voice
- **Web Audio API** — binaural tone playback
- **Next.js / Vercel** — fast global delivery, no install
- **localStorage** — all settings and progress persisted client-side, no account needed
