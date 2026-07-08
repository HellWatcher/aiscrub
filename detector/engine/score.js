const { weightFor } = require('./constants');

// Score from the deduped issue list.
// Previously rawScore was accumulated inline per pattern hit, so
// repeated hits of the same phrase (or overlapping matches) inflated
// the score while the displayed issue list was deduplicated. That
// produced the UX regression where a "heavy AI patterns" label sat
// above a list of two items. Now the dedup runs first, then each
// distinct issue contributes its category weight — so the number
// reflects the same signals the user actually sees.
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
