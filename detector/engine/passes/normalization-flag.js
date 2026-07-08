// ── Normalization-trigger flag ───────────────────────────────────
// ZWSPs or homoglyphs in pasted prose are near-dispositive: humans
// don't insert these into their own writing. Single roleplay marker
// can be a false positive on Markdown emphasis (filtered to multi-
// word inner already), so requires ≥2.
//
// Takes the `flags` object produced by normalizeText, returns issues.
function runNormalizationFlagPass(normFlags) {
  const issues = [];
  if (normFlags.zeroWidth > 0 || normFlags.homoglyph >= 2) {
    issues.push({
      type: 'normalization-flag',
      text: `${normFlags.zeroWidth} zero-width + ${normFlags.homoglyph} homoglyph swap${normFlags.homoglyph === 1 ? '' : 's'}`,
      severity: 'critical',
      suggestion: 'Text contains invisible/lookalike chars typical of AI-humanizer bypass tools. Re-type from your own keyboard.',
    });
  }
  if (normFlags.roleplay >= 2) {
    issues.push({
      type: 'normalization-flag',
      text: `${normFlags.roleplay} *roleplay-action* markers stripped`,
      severity: 'high',
      suggestion: 'Paired *action* markers are a chat-model artifact.',
    });
  }
  return issues;
}

module.exports = { runNormalizationFlagPass };
