/**
 * Avoid AI Writing — detection engine (canonical source of truth)
 * Implements 43-category pattern detection. This repo's SKILL.md
 * catalogs the human-editable pattern rules; this engine is the executable
 * expression of the regex-detectable subset and extends it with stylometric and
 * AI-tool-fingerprint detectors that don't make sense as skill prose
 * (cross-paragraph burstiness, smart-punct signatures, function-word
 * trigram entropy, low type-token ratio, AI-tool URL parameters,
 * chatbot citation markup leaks, unfilled placeholders).
 *
 * Scoring model:
 *   Each category has a weight in the ISSUE_WEIGHTS table. Detection runs
 *   produce raw (possibly duplicate) issues which are then deduplicated by
 *   (type, text) pair. rawScore is the sum of category weights across the
 *   deduped list — so the number reflects the same distinct signals the
 *   user sees in the issue list.
 *
 *   Weights are deliberately non-flat across severity tags. Cutoff
 *   disclaimers (10) and chatbot artifacts (8) weigh more than vague
 *   attributions (5), even though all three are tagged `critical`, because
 *   the skill treats them as stronger or weaker AI-origin signals.
 *
 *   rawScore is then normalized to 0-100 via `log2(wordCount/50)` so longer
 *   texts don't accumulate unboundedly on the same density of patterns.
 *
 * The implementation now lives under ./engine/ as a set of focused modules
 * (data tables, pure helpers, detection passes, orchestrator). This file is
 * a thin barrel so `require('./detector/patterns.js')` keeps its exact public
 * API: { analyzeText, normalizeText, detectEcho, getLabel, getColor,
 * SEVERITY_LABELS, TYPE_LABELS }.
 */

module.exports = require('./engine');
