const { matchPatterns } = require('../text-utils');
const {
  TRANSITIONS,
  CHATBOT_ARTIFACTS,
  SYCOPHANTIC,
  FILLERS,
  GENERIC_CONCLUSIONS,
  LETS_PATTERNS,
  REASONING_ARTIFACTS,
  ACKNOWLEDGMENT_LOOPS,
  SIGNIFICANCE_INFLATION,
  VAGUE_ATTRIBUTIONS,
  HOLLOW_INTENSIFIERS,
  EMOTIONAL_FLATLINE,
  NOVELTY_INFLATION,
  CUTOFF_DISCLAIMERS,
  AI_PLACEHOLDERS,
  AI_CITATION_MARKUP,
  AI_UTM_SOURCE,
  TEMPLATE_PHRASES,
  FALSE_CONCESSION,
  RHETORICAL_QUESTIONS,
  HEDGE_STACK,
  FUTURE_NARRATIVE,
  REAL_ACTUAL_INFLATION,
  FORMULAIC_OPENERS,
  TITLE_CASE_HEADER,
  PARENTHETICAL_HEDGE,
  CONFIDENCE_CALIBRATION,
} = require('../data/patterns');

// All the matchPatterns-based phrase passes, plus the mode-gated
// title-case-header check and the ≥3-gated confidence-calibration check.
function runPhrasesPass({ text, contextMode }) {
  const issues = [];

  // ── 4–21. Pattern categories ─────────────────────────────────
  issues.push(...matchPatterns(text, TRANSITIONS, 'transition', 'medium'));
  issues.push(...matchPatterns(text, CHATBOT_ARTIFACTS, 'chatbot', 'critical'));
  issues.push(...matchPatterns(text, SYCOPHANTIC, 'sycophantic', 'critical'));
  issues.push(...matchPatterns(text, FILLERS, 'filler', 'medium'));
  issues.push(...matchPatterns(text, GENERIC_CONCLUSIONS, 'generic-conclusion', 'medium'));
  issues.push(...matchPatterns(text, LETS_PATTERNS, 'lets-construction', 'medium'));
  issues.push(...matchPatterns(text, REASONING_ARTIFACTS, 'reasoning-artifact', 'critical'));
  issues.push(...matchPatterns(text, ACKNOWLEDGMENT_LOOPS, 'acknowledgment-loop', 'medium'));
  issues.push(...matchPatterns(text, SIGNIFICANCE_INFLATION, 'significance-inflation', 'high'));
  issues.push(...matchPatterns(text, VAGUE_ATTRIBUTIONS, 'vague-attribution', 'critical'));
  issues.push(...matchPatterns(text, HOLLOW_INTENSIFIERS, 'hollow-intensifier', 'medium'));
  issues.push(...matchPatterns(text, EMOTIONAL_FLATLINE, 'emotional-flatline', 'low'));
  issues.push(...matchPatterns(text, NOVELTY_INFLATION, 'novelty-inflation', 'medium'));
  issues.push(...matchPatterns(text, CUTOFF_DISCLAIMERS, 'cutoff-disclaimer', 'critical'));
  issues.push(...matchPatterns(text, AI_PLACEHOLDERS, 'ai-placeholder', 'critical'));
  issues.push(...matchPatterns(text, AI_CITATION_MARKUP, 'ai-citation-markup', 'critical'));
  issues.push(...matchPatterns(text, AI_UTM_SOURCE, 'ai-utm-source', 'critical'));
  issues.push(...matchPatterns(text, TEMPLATE_PHRASES, 'template-phrase', 'high'));
  issues.push(...matchPatterns(text, FALSE_CONCESSION, 'false-concession', 'medium'));
  issues.push(...matchPatterns(text, RHETORICAL_QUESTIONS, 'rhetorical-question', 'medium'));
  issues.push(...matchPatterns(text, HEDGE_STACK, 'hedge-stack', 'high'));
  issues.push(...matchPatterns(text, FUTURE_NARRATIVE, 'future-narrative', 'high'));
  issues.push(...matchPatterns(text, REAL_ACTUAL_INFLATION, 'real-actual-inflation', 'medium'));

  // ── Tier 1 v2: formulaic openers + parenthetical hedges ──────────
  issues.push(...matchPatterns(text, FORMULAIC_OPENERS, 'formulaic-opener', 'high'));
  issues.push(...matchPatterns(text, PARENTHETICAL_HEDGE, 'parenthetical-hedge', 'medium'));

  // Title-case headers — gated to marketing/personal/general modes
  // (technical mode legitimately uses Title Case section headers).
  if (contextMode !== 'technical') {
    const titleHits = matchPatterns(text, [TITLE_CASE_HEADER], 'title-case-header', 'medium');
    // Drop matches that look like proper-noun titles (single line, all
    // tokens capitalized incl. function words) — that's headline style,
    // not the AI-section-header tell which has mid-sentence "And".
    const filtered = titleHits.filter((h) => {
      const tokens = h.text.split(/\s+/);
      return tokens.length >= 4 && /\b(?:And|Or|Of|The|In|For|To|A|An)\b/.test(h.text);
    });
    issues.push(...filtered);
  }

  // Confidence calibration is only flagged when it stacks (3+ instances).
  // Gating happens pre-dedup on raw match count, since that signals actual
  // stacking, not just vocabulary use.
  const confIssues = matchPatterns(text, CONFIDENCE_CALIBRATION, 'confidence-calibration', 'low');
  if (confIssues.length >= 3) issues.push(...confIssues);

  return issues;
}

module.exports = { runPhrasesPass };
