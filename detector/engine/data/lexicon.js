// Vocabulary tiers for the AI-word detector, plus the O(1) Tier 3 lookup map.

// ─── Tier 1: Always flag ───────────────────────────────────────────
const TIER1 = {
  delve: 'explore, dig into, look at',
  tapestry: 'describe the actual complexity',
  paradigm: 'model, approach, framework',
  embark: 'start, begin',
  beacon: 'rewrite entirely',
  robust: 'strong, reliable, solid',
  comprehensive: 'thorough, complete, full',
  'cutting-edge': 'latest, newest, advanced',
  pivotal: 'important, key, critical',
  underscores: 'highlights, shows',
  meticulous: 'careful, detailed, precise',
  meticulously: 'carefully, precisely',
  seamless: 'smooth, easy, without friction',
  seamlessly: 'smoothly, easily',
  'game-changer': 'describe what changed',
  'game-changing': 'describe what changed',
  nestled: 'is located, sits',
  vibrant: 'describe what makes it active',
  thriving: 'growing, active',
  showcasing: 'showing, demonstrating',
  bustling: 'busy, active',
  intricate: 'complex, detailed',
  intricacies: 'complexities, details',
  'ever-evolving': 'changing, growing',
  enduring: 'lasting, long-running',
  daunting: 'hard, difficult',
  holistic: 'complete, full, whole',
  holistically: 'completely, fully',
  actionable: 'practical, useful, concrete',
  impactful: 'effective, significant',
  learnings: 'lessons, findings, takeaways',
  synergy: 'describe the combined effect',
  synergies: 'describe the combined effect',
  interplay: 'relationship, connection',
  symphony: 'describe the coordination',
  embrace: 'adopt, accept, use',
};

// Multi-word tier 1 phrases
const TIER1_PHRASES = [
  { pattern: /\bdelve\s+into\b/gi, replace: 'explore, dig into' },
  { pattern: /\blandscape\b/gi, replace: 'field, space, industry', filter: true },
  { pattern: /\brealm\b/gi, replace: 'area, field, domain' },
  { pattern: /\btestament\s+to\b/gi, replace: 'shows, proves' },
  { pattern: /\bleverage\b/gi, replace: 'use' },
  { pattern: /\bwatershed\s+moment\b/gi, replace: 'turning point, shift' },
  { pattern: /\bmarking\s+a\s+pivotal\s+moment\b/gi, replace: 'state what happened' },
  { pattern: /\bthe\s+future\s+looks\s+bright\b/gi, replace: 'cut or say something specific' },
  { pattern: /\bonly\s+time\s+will\s+tell\b/gi, replace: 'cut or say something specific' },
  {
    pattern: /\bdespite\s+challenges[^.]*continues?\s+to\s+thrive\b/gi,
    replace: 'name the challenge and response',
  },
  { pattern: /\bdeep\s+dive\b/gi, replace: 'look at, examine' },
  { pattern: /\bdive\s+into\b/gi, replace: 'look at, examine' },
  { pattern: /\bunpack(?:ing)?\b/gi, replace: 'explain, break down' },
  { pattern: /\bcomplexities\b/gi, replace: 'name the actual problems' },
  { pattern: /\bthought\s+leader(?:ship)?\b/gi, replace: 'expert, authority' },
  { pattern: /\bbest\s+practices\b/gi, replace: 'what works, proven methods' },
  { pattern: /\bat\s+its\s+core\b/gi, replace: 'cut, just state it' },

  // ─── Tier 1B: wordiness (clarity), not AI-frequency evidence ────────
  // Same "always flag" cadence as the rest of Tier 1, but these are
  // inflated/roundabout phrasing rather than a lexical AI tell — a human
  // editor would mark them for concision regardless of who wrote the
  // draft. Kept out of the dense-vocabulary signal (a different `type`
  // string than 'tier1' already excludes them) and weighted like tier2
  // in constants.js so a clarity fix cannot push a document toward an
  // AI classification.
  { pattern: /\bin\s+order\s+to\b/gi, replace: 'to', clarity: true },
  { pattern: /\bdue\s+to\s+the\s+fact\s+that\b/gi, replace: 'because', clarity: true },
  { pattern: /\bserves\s+as\b/gi, replace: 'is', clarity: true },
  { pattern: /\bfeatures\b/gi, replace: 'has, includes', filter: true, clarity: true },
  { pattern: /\bboasts\b/gi, replace: 'has', clarity: true },
  { pattern: /\bpresents\b/gi, replace: 'is, offers, shows', filter: true, clarity: true },
  { pattern: /\butiliz(?:e|es|ing|ed)\b/gi, replace: 'use', clarity: true },
  { pattern: /\bcommenc(?:e|es|ing|ed)\b/gi, replace: 'start, begin', clarity: true },
  { pattern: /\bascertain(?:s|ing|ed)?\b/gi, replace: 'find out, determine', clarity: true },
  { pattern: /\bendeavou?r(?:s|ing|ed)?\b/gi, replace: 'effort, attempt, try', clarity: true },

  // Hyphen required. The unhyphenated "load bearing" is ordinary English —
  // "the load bearing down on the bridge" — where `bearing` is a participle,
  // not part of a compound modifier. The tell is always hyphenated.
  //
  // Only match an immediately following abstract noun from this seed list.
  // Unknown nouns, mixed physical/abstract nouns, and predicative uses pass:
  // precision over recall. Keep the lookahead out of the matched span.
  {
    pattern:
      /\bload-bearing\b(?=[ \t]+(?:assumptions?|claims?|invariants?|premises?|constraints?|dependenc(?:y|ies)|arguments?|abstractions?)\b)/gi,
    replace: 'essential, critical, or say what breaks if you remove it',
  },
];

// ─── Tier 2: Flag in clusters (2+ per paragraph) ──────────────────
const TIER2 = {
  harness: 'use, take advantage of',
  navigate: 'work through, handle',
  navigating: 'working through, handling',
  foster: 'encourage, support, build',
  elevate: 'improve, raise, strengthen',
  unleash: 'release, enable, unlock',
  streamline: 'simplify, speed up',
  empower: 'enable, let, allow',
  bolster: 'support, strengthen',
  spearhead: 'lead, drive, run',
  resonate: 'connect with, appeal to',
  resonates: 'connects with, appeals to',
  revolutionize: 'change, transform',
  facilitate: 'enable, help, allow',
  facilitates: 'enables, helps, allows',
  underpin: 'support, form the basis of',
  nuanced: 'specific, subtle, detailed',
  crucial: 'important, key, necessary',
  multifaceted: 'describe the actual facets',
  ecosystem: 'system, community, network',
  myriad: 'many, numerous',
  plethora: 'many, a lot of',
  encompass: 'include, cover, span',
  catalyze: 'start, trigger, accelerate',
  reimagine: 'rethink, redesign, rebuild',
  galvanize: 'motivate, rally, push',
  augment: 'add to, expand, supplement',
  cultivate: 'build, develop, grow',
  illuminate: 'clarify, explain, show',
  elucidate: 'explain, clarify',
  juxtapose: 'compare, contrast',
  transformative: 'describe what changed',
  transformation: 'describe what changed',
  cornerstone: 'foundation, basis, key part',
  paramount: 'most important, top priority',
  poised: 'ready, set, about to',
  burgeoning: 'growing, emerging',
  nascent: 'new, early-stage',
  quintessential: 'typical, classic, defining',
  overarching: 'main, central, broad',
  underpinning: 'basis, foundation',
  underpinnings: 'basis, foundations',
  'paradigm-shifting': 'describe what shifted',
  quietly: 'cut, or name the concrete contrast',
};

// Conditional Tier 2 entries: everyday words whose AI tell is a specific
// significance collocation, not the word itself. They join a paragraph's
// Tier 2 cluster only when the collocation matches — bare uses ("deeply
// nested JSON", "cares deeply") never count, because the base rate of
// these words in innocent prose is far higher than the rest of the table
// and an unconditional entry measurably flags clean human writing.
const TIER2_CONDITIONAL = [
  {
    word: 'deeply',
    pattern:
      /\bdeeply\s+(?:integrated|committed|rooted|personal|human|flawed|resonant|transformative|interconnected|ingrained|embedded|meaningful)\b/i,
    suggestion: 'cut, or name what specifically runs deep',
  },
];

// ─── Tier 3: Flag by density ───────────────────────────────────────
const TIER3 = [
  'significant',
  'significantly',
  'innovative',
  'innovation',
  'effective',
  'effectively',
  'dynamic',
  'dynamics',
  'scalable',
  'scalability',
  'compelling',
  'unprecedented',
  'exceptional',
  'exceptionally',
  'remarkable',
  'remarkably',
  'sophisticated',
  'instrumental',
  'world-class',
  'state-of-the-art',
  'best-in-class',
  // `verbatim` is usually redundant with the verb it modifies ("copies X
  // verbatim" = "copies X"). It has a genuine term-of-art sense in legal,
  // research, and QA registers ("verbatim transcript"), so it lives at
  // Tier 3: density-gated, it only fires on overuse, not on a single
  // legitimate use.
  'verbatim',
];

// Multi-word Tier 3 phrases. Density-gated like single Tier 3 words because
// these legitimately show up in human crypto/web3/dev writing. Threshold is
// intentionally lower than single-word Tier 3 (≥2 occurrences of the same
// phrase) — repeating the same multi-word boilerplate is a stronger AI tell
// than re-using "significant."
const TIER3_PHRASES = [
  /\bemerging\s+(?:sector|space|category|industry)\b/gi,
  /\bthe\s+integration\s+of\b/gi,
  /\bthe\s+intersection\s+of\b/gi,
  /\bcommunity-?driven\b/gi,
  /\blong-?term\s+sustainability\b/gi,
  /\buser\s+engagement\b/gi,
  /\bdecentralized\s+compute\b/gi,
  /\b(?:sustainable\s+)?reward\s+emissions?\b/gi,
  /\btokenized\s+incentive\s+structures?\b/gi,
  /\bdesigned\s+for\s+long-?term\b/gi,
];

// O(1) lookup from any token form (hyphenated or dashless) to its canonical
// Tier 3 word. Counting originally did nested-loop word matching which was
// O(tokens × TIER3) — slow on long pastes.
const TIER3_LOOKUP = new Map();
for (const word of TIER3) {
  TIER3_LOOKUP.set(word, word);
  const dashless = word.replace(/-/g, '');
  if (dashless !== word) TIER3_LOOKUP.set(dashless, word);
}

module.exports = {
  TIER1,
  TIER1_PHRASES,
  TIER2,
  TIER2_CONDITIONAL,
  TIER3,
  TIER3_PHRASES,
  TIER3_LOOKUP,
};
