export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
}

export const ARTICLES: Article[] = [
  {
    slug: "chakra-tones",
    title: "What are chakra tones?",
    excerpt:
      "Chakra tones are specific frequencies used in sound healing and vocal practice to align with the body's energy centres.",
    content: `Chakra tones are specific frequencies aligned with the seven main energy centres in the body — from Root at the base of the spine to Crown at the top of the head. Many traditions use the Solfeggio scale (396 Hz, 417 Hz, 528 Hz, etc.) as a starting point, then adjust for your voice range.

Practising these tones through singing can help you tune into each chakra, notice where tension or ease lives in your body, and develop a deeper connection between voice and awareness. The goal is not perfection, but presence — feeling where the sound lands and how it shifts your state.`,
  },
  {
    slug: "lip-rolls-vocal-warmup",
    title: "Why lip rolls are a great vocal warmup",
    excerpt:
      "Lip rolls loosen the jaw, warm the voice, and prepare you to sing — all with minimal effort.",
    content: `Lip rolls (or lip trills) are one of the gentlest and most effective vocal warmups. You let your lips buzz loosely — like a motorboat — while you hum or sing through your range. The vibration does several things at once: it relaxes the jaw, warms the vocal folds, and encourages steady breath flow without strain.

Because the lips absorb some of the pressure, you're less likely to push or force. That makes lip rolls ideal at the start of a session, when your voice is still cold. Many singers and voice teachers use them as the first step before scales or songs.`,
  },
  {
    slug: "solfeggio-frequencies",
    title: "Solfeggio frequencies and sound healing",
    excerpt:
      "The Solfeggio scale has roots in sacred music and is widely used in sound healing practice.",
    content: `The Solfeggio frequencies — 396, 417, 528, 639, 741, 852 Hz (and 963 Hz for Crown) — appear in ancient Gregorian chant and later sound healing traditions. Each is said to correspond to a chakra and a particular quality: 396 Hz for Root and liberation from guilt, 528 Hz for Heart and "love" or "miracle" tone, and so on.

Whether you take the spiritual claims literally or not, these frequencies form a coherent scale that fits the human voice and offers a structured way to explore resonance across your range. Practising them can deepen body awareness and vocal control.`,
  },
  {
    slug: "tuning",
    title: "Tuning: A432, A440, A444, A528",
    excerpt:
      "Different reference pitches change how your chakra tones sound. Here's what each tuning option means.",
    content: `attunr lets you choose the tuning standard — the reference note A that all other notes are based on.

A440 Hz is standard Western tuning, used in most music worldwide. A432 Hz is often called "healing" or "natural" tuning — slightly lower, popular in sound healing. A444 Hz is slightly higher, found in some sacred traditions. A528 Hz ties the "miracle tone" to your scale so 528 Hz becomes the reference A.

Try each and keep the one that feels right. Tuning only affects voice-based mode — Absolute mode uses fixed frequencies.`,
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}
