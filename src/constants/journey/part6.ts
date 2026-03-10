import type { JourneyStage } from "./types";

/** Part 6: Mantra */
export const PART_6_STAGES: JourneyStage[] = [
  {
    id: 31,
    part: 6,
    type: "technique_intro",
    title: "Mantra",
    chakraIds: [],
    holdSeconds: 0,
    noteSeconds: 0,
    technique: "mantra",
    cardCue: "Sing each chakra's seed syllable — LAM, VAM, RAM, and more",
    instruction:
      "Each chakra has a seed syllable, or mantra. Sing that sound on the tone — LAM for Root, VAM for Sacral, RAM for Solar Plexus, YAM for Heart, HAM for Throat, OM for Third Eye, AH for Crown. The mantra helps focus the vibration in that chakra.",
  },
  {
    id: 32,
    part: 6,
    type: "individual",
    title: "Root — LAM",
    chakraIds: ["root"],
    holdSeconds: 3,
    noteSeconds: 0,
    technique: "mantra",
    chakraDetailStyle: "brief",
    instruction:
      "Sing LAM on the Root tone. Feel the 'L' and 'M' shape the sound, the 'ah' in the middle carries the pitch.",
  },
  {
    id: 33,
    part: 6,
    type: "individual",
    title: "Sacral — VAM",
    chakraIds: ["sacral"],
    holdSeconds: 3,
    noteSeconds: 0,
    technique: "mantra",
    chakraDetailStyle: "brief",
    instruction:
      "Sing VAM on the Sacral tone. Let the sound flow from your lower belly.",
  },
  {
    id: 34,
    part: 6,
    type: "individual",
    title: "Solar Plexus — RAM",
    chakraIds: ["solar-plexus"],
    holdSeconds: 3,
    noteSeconds: 0,
    technique: "mantra",
    chakraDetailStyle: "brief",
    instruction:
      "Sing RAM on the Solar Plexus tone. Feel the power in the 'R' — purpose and centre.",
  },
  {
    id: 35,
    part: 6,
    type: "individual",
    title: "Heart — YAM",
    chakraIds: ["heart"],
    holdSeconds: 3,
    noteSeconds: 0,
    technique: "mantra",
    chakraDetailStyle: "brief",
    instruction:
      "Sing YAM on the Heart tone. Open and soft — the bridge between body and mind.",
  },
  {
    id: 36,
    part: 6,
    type: "individual",
    title: "Throat — HAM",
    chakraIds: ["throat"],
    holdSeconds: 3,
    noteSeconds: 0,
    technique: "mantra",
    chakraDetailStyle: "brief",
    instruction:
      "Sing HAM on the Throat tone. Clear and true — let your voice be heard.",
  },
  {
    id: 37,
    part: 6,
    type: "individual",
    title: "Third Eye — OM",
    chakraIds: ["third-eye"],
    holdSeconds: 3,
    noteSeconds: 0,
    technique: "mantra",
    chakraDetailStyle: "brief",
    instruction:
      "Sing OM on the Third Eye tone. Gentle and inward — clarity and insight.",
  },
  {
    id: 38,
    part: 6,
    type: "individual",
    title: "Crown — AH",
    chakraIds: ["crown"],
    holdSeconds: 3,
    noteSeconds: 0,
    technique: "mantra",
    chakraDetailStyle: "brief",
    instruction:
      "Sing AH on the Crown tone. Soft and open — presence and unity.",
  },
];
