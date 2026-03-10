# License review — attunr dependencies

Summary: **None of your dependencies prevent monetization.** You can charge for your app.

---

## Direct dependencies

| Package | License | Commercial use |
|---------|---------|----------------|
| **canvas-confetti** | ISC | ✅ Yes — permissive |
| **ml5** | Custom (see below) | ✅ Yes — no commercial restriction |
| **next** | MIT | ✅ Yes |
| **react** | MIT | ✅ Yes |
| **react-dom** | MIT | ✅ Yes |

---

## ml5 — custom license

ml5 uses a custom license (since 2021) that requires compliance with its Code of Conduct.  
**Commercial use is not restricted.** The license forbids harmful uses, not monetization.

You must **not** use ml5 to build:

- Tools that discriminate against marginalized communities
- Tools to manipulate public opinion (e.g. fake news bots)
- Mass surveillance / repression tools
- Weapons control systems

You **must** include a link to the ml5 license: https://ml5js.org/license

attunr (vocal/chakra training for personal wellness) is compatible with these terms.

---

## Other licenses in the tree

- **MIT**, **Apache-2.0**, **ISC** — all allow commercial use
- **LGPL-3.0** (e.g. some sharp/libvips deps) — allows commercial use; only modified LGPL code must stay open. Your app does not modify those libraries.

---

## Recommendation

You can monetize attunr (subscriptions, one-time purchase, etc.) under the current dependencies.

For ml5, add a license notice, e.g. in your footer or an About/Legal page:

> attunr uses [ml5.js](https://ml5js.org/) for pitch detection. ml5 is licensed under the [ml5.js License](https://ml5js.org/license).
