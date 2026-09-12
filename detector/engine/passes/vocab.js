const { tokenize } = require('../text-utils');
const {
  TIER1,
  TIER1_PHRASES,
  TIER2,
  TIER2_CONDITIONAL,
  TIER3_LOOKUP,
  TIER3_PHRASES,
} = require('../data/lexicon');

// Vocabulary passes: Tier 1 words + phrases, Tier 2 clusters, Tier 3
// density, and the Tier 3 multi-word phrase + cluster detection.
//
// Returns { issues, tier2Clusters } — tier2Clusters is a paragraph count
// the orchestrator threads into denseAIVocab and stats.
function runVocabPass({ text, tokens, paragraphs, wordCount }) {
  const issues = [];

  // ── 1. Tier 1 words ──────────────────────────────────────────
  const tier1Found = new Set();
  for (const token of tokens) {
    if (Object.hasOwn(TIER1, token) && !tier1Found.has(token)) {
      tier1Found.add(token);
      issues.push({
        type: 'tier1',
        text: token,
        severity: 'high',
        suggestion: TIER1[token],
      });
    }
  }

  // Tier 1 multi-word phrases. Adds each distinct phrase (lowercased) to
  // `tier1Found` so the same phrase hit multiple times only produces one
  // issue — matches the downstream dedup behavior.
  for (const phrase of TIER1_PHRASES) {
    const regex = new RegExp(phrase.pattern.source, phrase.pattern.flags);
    let match;
    while ((match = regex.exec(text)) !== null) {
      const lower = match[0].toLowerCase();
      if (tier1Found.has(lower)) continue;
      tier1Found.add(lower);
      issues.push({
        // Clarity-band entries are wordiness edits, not frequency evidence.
        // Same fix, weaker claim — see the Tier 1A/1B split in CATEGORIES.md.
        type: phrase.clarity ? 'tier1-clarity' : 'tier1',
        text: match[0],
        severity: phrase.clarity ? 'medium' : 'high',
        suggestion: phrase.replace,
      });
    }
  }

  // ── 2. Tier 2 clusters ───────────────────────────────────────
  let tier2Clusters = 0;
  for (const para of paragraphs) {
    const paraTokens = tokenize(para);
    const found = [];
    const suggestions = {};
    for (const token of paraTokens) {
      if (Object.hasOwn(TIER2, token) && !found.includes(token)) {
        found.push(token);
        suggestions[token] = TIER2[token];
      }
    }
    for (const cond of TIER2_CONDITIONAL) {
      if (!found.includes(cond.word) && cond.pattern.test(para)) {
        found.push(cond.word);
        suggestions[cond.word] = cond.suggestion;
      }
    }
    if (found.length >= 2) {
      tier2Clusters++;
      for (const word of found) {
        issues.push({
          type: 'tier2',
          text: word,
          severity: 'medium',
          suggestion: suggestions[word],
        });
      }
    }
  }

  // ── 3. Tier 3 density ────────────────────────────────────────
  const tier3Counts = {};
  for (const token of tokens) {
    const canonical = TIER3_LOOKUP.get(token);
    if (canonical) tier3Counts[canonical] = (tier3Counts[canonical] || 0) + 1;
  }
  // Flag at 3% of word count, but never below 3 occurrences — the floor
  // of 3 keeps a single "significant" in a short text from reading as
  // overuse. See docs/engine-history.md#tier-3-density.
  const densityThreshold = Math.max(3, Math.floor(wordCount * 0.03));
  for (const [word, count] of Object.entries(tier3Counts)) {
    if (count >= densityThreshold) {
      issues.push({
        type: 'tier3',
        text: `"${word}" x${count}`,
        severity: 'low',
        suggestion: `Overused (${count} times in ${wordCount} words)`,
      });
    }
  }

  // ── Tier 3 multi-word phrase density ─────────────────────────
  // Two complementary rules:
  //   (a) Per-phrase density — same gating as single-word Tier 3: each
  //       phrase fine alone, repetition is the tell. Threshold = 2.
  //   (b) Cross-phrase clustering — ≥3 *distinct* boilerplate phrases
  //       in one piece. LLMs varying their own boilerplate often use
  //       each phrase only once but stack 5-10 across the text. The
  //       per-phrase rule misses this; the cluster rule catches it.
  // Track non-overlapping match spans so a longer phrase swallowing a
  // shorter one (e.g., "designed for long-term sustainability" matches
  // both "designed for long-term" AND "long-term sustainability") only
  // contributes one distinct hit. Without dedup the cluster threshold
  // can be reached by a single sentence stacking overlapping regexes.
  const claimedSpans = [];
  function spanOverlaps(start, end) {
    for (const [s, e] of claimedSpans) {
      if (start < e && end > s) return true;
    }
    return false;
  }
  let distinctPhrasesHit = 0;
  for (const phrase of TIER3_PHRASES) {
    const regex = new RegExp(phrase.source, phrase.flags);
    const phraseSpans = [];
    let phraseMatch;
    while ((phraseMatch = regex.exec(text)) !== null) {
      const start = phraseMatch.index;
      const end = start + phraseMatch[0].length;
      if (!spanOverlaps(start, end)) {
        phraseSpans.push([start, end, phraseMatch[0]]);
      }
    }
    if (phraseSpans.length === 0) continue;
    for (const [s, e] of phraseSpans) claimedSpans.push([s, e]);
    distinctPhrasesHit++;
    if (phraseSpans.length >= 2) {
      issues.push({
        type: 'tier3-phrase',
        text: `"${phraseSpans[0][2].toLowerCase()}" x${phraseSpans.length}`,
        severity: 'medium',
        suggestion: `Boilerplate phrase repeated ${phraseSpans.length}× — replace at least one with specifics`,
      });
    }
  }
  if (distinctPhrasesHit >= 3) {
    issues.push({
      type: 'tier3-phrase-cluster',
      text: `${distinctPhrasesHit} distinct boilerplate phrases`,
      severity: 'high',
      suggestion:
        'Several stock crypto/web3 phrases stacked in one piece. Rewrite around one specific claim or observation.',
    });
  }

  return { issues, tier2Clusters };
}

module.exports = { runVocabPass };
