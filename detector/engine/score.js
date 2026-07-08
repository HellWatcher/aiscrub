const { weightFor } = require('./constants');

// Score from the deduped issue list. Dedup runs before scoring so each
// distinct issue contributes its category weight exactly once — the
// number reflects the same signals the user sees, not inflated counts
// from repeated or overlapping matches of the same phrase.
// See docs/engine-history.md#scoring-and-dedup-ordering.
function scoreIssues(deduped, wordCount) {
  let rawScore = 0;
  for (const issue of deduped) {
    rawScore += weightFor(issue.type);
  }

  // Scale by text length: longer text gets more chances to trigger.
  const lengthFactor = Math.max(1, Math.log2(wordCount / 50));
  const normalizedScore = Math.min(100, Math.round(rawScore / lengthFactor));

  return { rawScore, normalizedScore };
}

module.exports = { scoreIssues };
