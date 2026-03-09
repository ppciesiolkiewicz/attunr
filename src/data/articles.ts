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
      "Specific frequencies aligned with the body's energy centres — and why singing them can deepen presence and body awareness.",
    content: `Chakra tones are specific frequencies aligned with the seven main energy centres in the body — from Root at the base of the spine to Crown at the top of the head. Many traditions use the Solfeggio scale (396 Hz for Root, 417 Hz for Sacral, 528 Hz for Solar Plexus, and so on) as a starting point. Your voice type adjusts these to fit your natural range.

When you sing these tones, you're not just listening — you're creating the vibration from within. That can help you tune into each chakra, notice where tension or ease lives in your body, and develop a deeper connection between voice and awareness. Some people feel grounding in the lower tones, clarity in the higher ones, or a sense of flow moving between them.

The goal is not perfection, but presence. Feel where the sound lands. Notice how it shifts your state. Even a few minutes of practice can bring you more into your body and out of your head.`,
  },
  {
    slug: "lip-rolls-vocal-warmup",
    title: "Why lip rolls are a great vocal warmup",
    excerpt:
      "One of the gentlest vocal warmups: loosen the jaw, warm the voice, and prepare to sing with minimal effort.",
    content: `Lip rolls (or lip trills) are one of the gentlest and most effective vocal warmups. You let your lips buzz loosely — like a motorboat — while you hum or sing through your range. No equipment, no complicated technique. Just relax the lips and let them vibrate.

The vibration does several things at once: it relaxes the jaw, warms the vocal folds, and encourages steady breath flow without strain. Because the lips absorb some of the pressure, you're less likely to push or force. That makes lip rolls ideal at the start of a session, when your voice is still cold.

Try a few minutes before each practice. Start high and glide down, or low and glide up. Sustain the buzz on a single tone for five seconds. Many singers and voice teachers use lip rolls as the first step before scales or songs — and for good reason.`,
  },
  {
    slug: "solfeggio-frequencies",
    title: "Solfeggio frequencies and sound healing",
    excerpt:
      "The Solfeggio scale — 396 to 963 Hz — has roots in sacred music and offers a coherent framework for vocal practice.",
    content: `The Solfeggio frequencies — 396, 417, 528, 639, 741, 852 Hz (and 963 Hz for Crown) — appear in ancient Gregorian chant and later sound healing traditions. Each is said to correspond to a chakra: 396 Hz for Root, 417 for Sacral, 528 for Solar Plexus, 639 for Heart, 741 for Throat, 852 for Third Eye, 963 for Crown.

Some traditions assign qualities to each: 396 for liberation from guilt, 528 as the "miracle" or "love" tone, and so on. Whether you take those claims literally or not, these frequencies form a coherent scale that fits the human voice. They offer a structured way to explore resonance from your belly to the top of your head.

Practising them can deepen body awareness, improve vocal control, and give you a simple framework for daily sound work. No belief system required — just curiosity and a willingness to feel.`,
  },
  {
    slug: "tuning",
    title: "Tuning: A432, A440, A444, A528",
    excerpt:
      "A432, A440, A444, A528 — what each tuning does and when to choose it.",
    content: `attunr lets you choose the tuning standard — the reference note A that all other notes are based on. This shifts the entire scale up or down.

A440 Hz is standard Western tuning. Pianos, orchestras, and most recorded music use it. If you want familiarity, start here.

A432 Hz is often called "healing" or "natural" tuning. Slightly lower than A440, it's popular in sound healing and meditation music. Many people find it softer and easier to sing.

A444 Hz is slightly higher. It appears in some sacred and classical traditions and can feel brighter or more energising.

A528 Hz is associated with the "miracle tone" and the Heart chakra. Choosing this makes 528 Hz your reference A, shifting the whole scale accordingly.

Try each and keep the one that feels right. Tuning only affects voice-based mode — Absolute mode uses fixed frequencies.`,
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}
