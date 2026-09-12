const { matchPatterns, fenceRanges, inFenceRange } = require('../text-utils');
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
  FUNCTION_WORD,
  MD_HEADING_PREFIX,
  PARENTHETICAL_HEDGE,
  CONFIDENCE_CALIBRATION,
  LINGERING_ATTENTION,
  SOCIAL_CTA_CLOSER,
  SPECULATIVE_OPENERS,
  LAUNCH_INTROS,
  CROWD_CONTRAST,
  FAKE_CASUAL_PROPS,
  PERFORMED_INSIGHT,
  NEGATION_CHAIN,
  DEV_BLOG_BOILERPLATE,
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

  // ── Ported from upstream avoid-ai-writing v3.34.0 ────────────────
  issues.push(...matchPatterns(text, LINGERING_ATTENTION, 'lingering-attention', 'medium'));
  issues.push(...matchPatterns(text, SOCIAL_CTA_CLOSER, 'social-cta-closer', 'high'));
  issues.push(...matchPatterns(text, PERFORMED_INSIGHT, 'performed-insight', 'medium'));
  issues.push(...matchPatterns(text, NEGATION_CHAIN, 'negation-chain', 'high'));
  issues.push(...matchPatterns(text, DEV_BLOG_BOILERPLATE, 'dev-blog-boilerplate', 'medium'));
  issues.push(...matchPatterns(text, SPECULATIVE_OPENERS, 'speculative-opener', 'high'));
  issues.push(...matchPatterns(text, LAUNCH_INTROS, 'launch-intro', 'high'));
  issues.push(...matchPatterns(text, CROWD_CONTRAST, 'crowd-contrast', 'medium'));
  issues.push(...matchPatterns(text, FAKE_CASUAL_PROPS, 'fake-casual-prop', 'high'));

  // Title-case headers — gated to marketing/personal/general modes
  // (technical mode legitimately uses Title Case section headers).
  if (contextMode !== 'technical') {
    const titleHits = matchPatterns(text, [TITLE_CASE_HEADER], 'title-case-header', 'medium');
    // Strip an optional leading `#{1,6}` markdown-heading prefix before
    // the word-count guard, then require an INTERIOR (not leading)
    // function word — a proper-noun title ("The Great Gatsby") starts
    // with one and would false-positive, but the AI-section-header tell
    // ("Building And Deploying The Service") always has one mid-sentence.
    const filtered = titleHits.filter((h) => {
      const title = h.text.replace(MD_HEADING_PREFIX, '');
      const tokens = title.trim().split(/\s+/);
      if (tokens.length < 4) return false;
      return FUNCTION_WORD.test(tokens.slice(1).join(' '));
    });
    // Exclude anything inside a fenced code block — a Markdown-heavy
    // technical doc can quote a Title Case example inside a fence.
    const fences = filtered.length ? fenceRanges(text) : [];
    issues.push(...filtered.filter((h) => !inFenceRange(fences, h.index)));
  }

  // Confidence calibration is only flagged when it stacks (3+ instances).
  // Gating happens pre-dedup on raw match count, since that signals actual
  // stacking, not just vocabulary use.
  const confIssues = matchPatterns(text, CONFIDENCE_CALIBRATION, 'confidence-calibration', 'low');
  if (confIssues.length >= 3) issues.push(...confIssues);

  return issues;
}

module.exports = { runPhrasesPass };
