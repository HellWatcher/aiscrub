// Shared leaf constants for the detection engine. Imports nothing so it can
// be required by any module without risking a cycle.

// Per-category score weights. Applied to distinct (deduplicated) issues so
// the score reflects the same signals the user sees in the issue list.
// Non-uniform on purpose: critical rules like cutoff disclaimers (×10) and
// chatbot artifacts (×8) weigh more than vague attributions (×5), even
// though all three are tagged `critical`.
const ISSUE_WEIGHTS = {
  tier1: 5,
  tier2: 3,
  tier3: 2,
  transition: 2,
  chatbot: 8,
  sycophantic: 8,
  filler: 2,
  'generic-conclusion': 3,
  'lets-construction': 2,
  'reasoning-artifact': 6,
  'acknowledgment-loop': 3,
  'significance-inflation': 4,
  'vague-attribution': 5,
  'hollow-intensifier': 2,
  'emotional-flatline': 2,
  'novelty-inflation': 3,
  'cutoff-disclaimer': 10,
  'template-phrase': 3,
  'false-concession': 2,
  'rhetorical-question': 2,
  'confidence-calibration': 2,
  'em-dash': 6,
  uniformity: 5,
  formatting: 3,
  'tier3-phrase': 3,
  // Structural / cluster signals are deliberately weighted high. Unlike
  // single-vocabulary hits they're near-dispositive on social-length
  // posts (a 15-hashtag block, a 6-item bullet-NP list, three distinct
  // crypto-shill phrases stacked) and would otherwise be suppressed by
  // the log2(words/50) length divisor on short pastes.
  'tier3-phrase-cluster': 12,
  'hashtag-stuff': 12,
  'bullet-np-list': 10,
  'hedge-stack': 6,
  'future-narrative': 12,
  'real-actual-inflation': 5,
  'formulaic-opener': 8,
  'title-case-header': 4,
  'parenthetical-hedge': 3,
  'smart-punct-signature': 6,
  'punct-distribution': 6,
  'fnword-trigram-entropy': 5,
  'cross-para-burstiness': 5,
  'normalization-flag': 9,
  // Echo (close word/root repetition) is a flag-only writing-quality
  // signal, NOT an AI-origin tell — humans echo under deadline as readily
  // as models do. Weight 0 keeps it out of the score so it can't inflate
  // a human draft or trip the false-positive budget; it still appears in
  // issues[] with both source offsets for the editor.
  echo: 0,
  // Vocabulary-diversity signal (type-token ratio). Weighted modestly
  // because the threshold (>=200 tokens AND TTR<0.4) is conservative;
  // it stacks with structural signals to push borderline scores up.
  'low-ttr': 3,
  // AI-tool fingerprints. Weighted higher than statistical patterns
  // because each is a near-definitive single-hit signal — the AI tool
  // literally left its mark in the text. citation-markup ranks highest
  // (smoking gun: the literal internal markup of ChatGPT/Grok/etc.),
  // UTM tracking second (auto-appended by the tool to URLs it writes),
  // placeholders third (strong but humans use bracketed slots in
  // templates legitimately and forget them — still a publishing bug
  // but slightly less definitive AI evidence).
  'ai-placeholder': 10,
  'ai-citation-markup': 15,
  'ai-utm-source': 12,
};

// Single source of truth for the `ISSUE_WEIGHTS[type] ?? 2` default. Routed
// through here from BOTH the scorer and the region-weighter so the fallback
// weight can never drift between the two call sites.
function weightFor(type) {
  return ISSUE_WEIGHTS[type] ?? 2;
}

// ─── Severity labels ──────────────────────────────────────────
const SEVERITY_LABELS = {
  critical: 'P0',
  high: 'P1',
  medium: 'P2',
  low: 'P3',
};

const TYPE_LABELS = {
  tier1: 'AI vocabulary',
  tier2: 'Word cluster',
  tier3: 'Overused word',
  transition: 'AI transition',
  chatbot: 'Chatbot artifact',
  sycophantic: 'Sycophantic tone',
  filler: 'Filler phrase',
  'generic-conclusion': 'Generic conclusion',
  'lets-construction': '"Let\'s" opener',
  'reasoning-artifact': 'Reasoning artifact',
  'acknowledgment-loop': 'Acknowledgment loop',
  'significance-inflation': 'Significance inflation',
  'vague-attribution': 'Vague attribution',
  'hollow-intensifier': 'Hollow intensifier',
  'emotional-flatline': 'Emotional flatline',
  'novelty-inflation': 'Novelty inflation',
  'cutoff-disclaimer': 'Cutoff disclaimer',
  'template-phrase': 'Template phrase',
  'false-concession': 'False concession',
  'rhetorical-question': 'Rhetorical question',
  'confidence-calibration': 'Confidence stacking',
  'em-dash': 'Em dash',
  uniformity: 'Rhythm uniformity',
  formatting: 'Formatting',
  'tier3-phrase': 'Boilerplate phrase',
  'tier3-phrase-cluster': 'Boilerplate cluster',
  'hashtag-stuff': 'Hashtag stuffing',
  'bullet-np-list': 'Bullet-NP list',
  'hedge-stack': 'Hedge-stacked prediction',
  'future-narrative': 'Generic future narrative',
  'real-actual-inflation': '"Real/actual" inflation',
  'formulaic-opener': 'Formulaic opener',
  'title-case-header': 'Title Case header',
  'parenthetical-hedge': 'Parenthetical hedge',
  'smart-punct-signature': 'Smart-punct signature',
  'punct-distribution': 'Punctuation distribution',
  'fnword-trigram-entropy': 'Grammar repetition',
  'cross-para-burstiness': 'Cross-paragraph rhythm',
  'normalization-flag': 'Bypass-trick chars',
  'low-ttr': 'Low vocabulary diversity',
  echo: 'Word echo',
  'ai-placeholder': 'Unfilled placeholder',
  'ai-citation-markup': 'Chatbot citation markup leak',
  'ai-utm-source': 'AI-tool URL parameter',
};

// Upper bound for one scan. Above this we bail rather than running all
// regex passes over a huge buffer — protects page perf on pasted novels.
const MAX_WORDS = 10000;

// Mode validation: an unknown string (e.g. typo "tecnical") would
// otherwise silently downgrade to general-mode behavior. Coerce to
// 'general' and surface the original value in stats for traceability.
const VALID_CONTEXT_MODES = new Set(['general', 'technical', 'marketing', 'personal']);

module.exports = {
  ISSUE_WEIGHTS,
  SEVERITY_LABELS,
  TYPE_LABELS,
  MAX_WORDS,
  VALID_CONTEXT_MODES,
  weightFor,
};
