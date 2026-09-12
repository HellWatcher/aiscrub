const { MAX_WORDS, VALID_CONTEXT_MODES } = require('./constants');
const {
  tokenize,
  countWords,
  getParagraphs,
  getSentences,
  deduplicateIssues,
} = require('./text-utils');
const { normalizeText } = require('./normalize');
const { detectEcho } = require('./echo');
const { buildSentenceRegions } = require('./regions');
const { classifyTrinary, buildV2Defaults, getLabel } = require('./classify');
const { scoreIssues } = require('./score');
const { runVocabPass } = require('./passes/vocab');
const { runPhrasesPass } = require('./passes/phrases');
const { runNormalizationFlagPass } = require('./passes/normalization-flag');
const { runStylometryPass } = require('./passes/stylometry');
const { runStructuralPass } = require('./passes/structural');
const { findUnnecessaryHyphenation } = require('./passes/hyphenation');

// ═══ Main analysis ═════════════════════════════════════════════════
// Orchestrates the pre-pass (blockquote strip → normalize → word-count
// gates → tokenize/paragraph/sentence split), runs each detection pass,
// then the fixed pipeline: dedup → score → regions → stats → classify.
function analyzeText(text, options = {}) {
  if (!text || text.trim().length === 0) {
    return {
      ...buildV2Defaults('UNSCORED', 'low'),
      score: 0,
      label: 'Empty',
      issues: [],
      stats: {},
      tooShort: true,
    };
  }

  // Context mode gates rules that are noisy in technical writing. Modes:
  //   'general' (default) — full ruleset
  //   'technical' — skip title-case headers, formulaic openers gated to
  //                 prose-only structures; lower em-dash + formatting weights
  //   'marketing' — full ruleset + boost on formulaic-opener / future-narrative
  //   'personal'  — full ruleset, normal weights
  // Mode is purely a soft gate; nothing is silently suppressed without
  // being reflected in stats.contextMode for transparency.
  const requestedMode = options.contextMode || 'general';
  const contextMode = VALID_CONTEXT_MODES.has(requestedMode) ? requestedMode : 'general';
  const contextModeFallback = requestedMode !== contextMode ? requestedMode : null;

  // Pre-pass: strip Markdown blockquotes before scoring. A human
  // reacting to AI text by quoting it shouldn't have the quoted block
  // counted against their own writing. Requires ≥2 consecutive `> `
  // lines to count as a blockquote — single-line `> ls -la` shell
  // prompts in technical docs stay in the text.
  let quotedLines = 0;
  const rawLines = text.split(/\r?\n/);
  const isQuote = rawLines.map((l) => /^\s*>\s/.test(l));
  const stripIdx = new Set();
  for (let i = 0; i < rawLines.length; i++) {
    if (isQuote[i] && ((isQuote[i - 1] && i > 0) || isQuote[i + 1])) {
      stripIdx.add(i);
      quotedLines++;
    }
  }
  text = rawLines.filter((_, i) => !stripIdx.has(i)).join('\n');

  // Pre-pass: strip bypass-trick chars before pattern matching so
  // "delve" with a Cyrillic 'е' still hits Tier 1. Original text is
  // preserved so reported `match.index` values remain visually accurate.
  const norm = normalizeText(text);
  text = norm.text;

  const wordCount = countWords(text);
  if (wordCount < 10) {
    return {
      ...buildV2Defaults('UNSCORED', 'low'),
      score: 0,
      label: 'Too short',
      issues: [],
      stats: { wordCount, contextMode, contextModeFallback },
      tooShort: true,
    };
  }
  if (wordCount > MAX_WORDS) {
    return {
      ...buildV2Defaults('UNSCORED', 'low'),
      score: 0,
      label: 'Text too long',
      issues: [],
      stats: { wordCount, contextMode, contextModeFallback },
      tooLong: true,
    };
  }

  const tokens = tokenize(text);
  const paragraphs = getParagraphs(text);
  const sentences = getSentences(text);
  const issues = [];

  // ── Detection passes ─────────────────────────────────────────────
  // tier2Clusters (a paragraph count) is threaded downstream into
  // denseAIVocab + stats; tier3Flags is the raw (pre-dedup) tier3
  // density-flag count.
  const vocab = runVocabPass({ text, tokens, paragraphs, wordCount });
  issues.push(...vocab.issues);
  const tier2Clusters = vocab.tier2Clusters;
  const tier3Flags = vocab.issues.filter((i) => i.type === 'tier3').length;

  issues.push(...runPhrasesPass({ text, contextMode }));
  issues.push(...runNormalizationFlagPass(norm.flags));
  issues.push(...runStylometryPass({ text, wordCount, tokens, paragraphs, sentences }));
  issues.push(...runStructuralPass({ text, wordCount }));
  issues.push(...findUnnecessaryHyphenation(text));

  // Echo (close word/root repetition) — flag-only, P2, weight 0 (see
  // ISSUE_WEIGHTS.echo) so it never moves the AI-origin score.
  issues.push(...detectEcho(text, options));

  // ── Fixed pipeline: dedup → score → regions → stats → classify ───
  // Dedup runs FIRST so scoring, region-building, and stats all operate
  // on the same distinct issue list the user sees.
  const deduped = deduplicateIssues(issues);
  const { normalizedScore } = scoreIssues(deduped, wordCount);
  const label = getLabel(normalizedScore);

  // ── Sentence-region smoothing (HMM-style without an HMM) ─────────
  // Pass the SAME deduped array; buildSentenceRegions attaches a
  // non-enumerable `_unmapped` we read below — never spread/copy it.
  const regions = buildSentenceRegions(text, deduped);

  // Stats derived from the same deduped list so tier counts + patternCount
  // sum to `deduped.length`.
  const tier1Count = deduped.filter((i) => i.type === 'tier1').length;
  const tier2Count = deduped.filter((i) => i.type === 'tier2').length;
  const tier3Count = deduped.filter((i) => i.type === 'tier3').length;

  // ── Trinary classification (GPTZero-shaped) ──────────────────────
  // tier1Distinct is derived from the DEDUPED list here (not in a pass).
  // Dense-AI-vocab trifecta: ≥5 distinct tier1 hits + ≥2 tier2 cluster
  // paragraphs + ≥1 transition phrase, AND ≥150 words.
  const tier1Distinct = new Set(
    deduped.filter((i) => i.type === 'tier1').map((i) => (i.text || '').toLowerCase()),
  ).size;
  const hasTier2Cluster = tier2Clusters >= 2;
  const hasTransition = deduped.some((i) => i.type === 'transition');
  const denseAIVocab = wordCount >= 150 && tier1Distinct >= 5 && hasTier2Cluster && hasTransition;

  const trinary = classifyTrinary({
    score: normalizedScore,
    issues: deduped,
    normFlags: norm.flags,
    wordCount,
    denseAIVocab,
  });

  return {
    // Legacy fields preserved for existing callers.
    score: normalizedScore,
    label,
    issues: deduped,
    stats: {
      wordCount,
      tier1Count,
      tier2Count,
      tier2Clusters,
      tier3Count,
      tier3Flags,
      patternCount: deduped.length - tier1Count - tier2Count - tier3Count,
      contextMode,
      contextModeFallback,
      normalization: norm.flags,
      quotedLines,
      unmappedHighlights: regions._unmapped ?? 0,
      denseAIVocab,
      tier1Distinct,
    },
    // Trinary API — shape mirrors GPTZero so integrators can swap.
    document_classification: trinary.classification,
    class_probabilities: trinary.probabilities,
    confidence_category: trinary.confidence,
    highlight_sentence_for_ai: regions,
  };
}

module.exports = { analyzeText };
