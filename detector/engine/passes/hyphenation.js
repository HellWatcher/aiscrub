const { maskCode, blankRange } = require('../text-utils');
const { UNNECESSARY_HYPHENATION } = require('../data/patterns');

// Masks spans where a hyphenated compound is structural, not prose, so the
// curated UNNECESSARY_HYPHENATION list below can't misfire on it: fenced or
// inline code (via maskCode), quoted strings, URLs, file/route paths, and
// CLI flags. Deliberately compact — this is NOT upstream's full
// technical-identifier masker (CSS selectors, scoped npm packages,
// versioned tokens, npm-install command lines, etc.); the curated list here
// only needs the common structural cases carved out to stay
// false-positive-safe. See docs/engine-history.md for the scope call.
function maskHyphenationProtected(text) {
  const masked = maskCode(text);
  const chars = masked.split('');

  const protectedPatterns = [
    // Quoted strings on a single line — don't "fix" hyphenation inside a
    // direct quote.
    /"[^"\n]*"/g,
    /'[^'\n]*'/g,
    // URLs.
    /\bhttps?:\/\/\S+/g,
    // File/route paths: at least one slash, path-like character set.
    /(?:^|[\s(])(?:\.{0,2}\/)?(?:[\w.-]+\/)+[\w.-]*/g,
    // CLI flags: --long-flag, --long-flag=value, or a short -f.
    /(?:^|\s)--?[\w][\w-]*/g,
  ];
  for (const re of protectedPatterns) {
    let m;
    while ((m = re.exec(masked)) !== null) {
      blankRange(chars, m.index, m.index + m[0].length);
    }
  }
  return chars.join('');
}

// Score-neutral (weight 0 in constants.js) — a curated concision fix, not
// AI-origin evidence. Runs against the masked text but reports the original
// matched substring so the editor sees real source text.
function findUnnecessaryHyphenation(text) {
  const scanText = maskHyphenationProtected(text);
  const issues = [];
  for (const entry of UNNECESSARY_HYPHENATION) {
    const regex = new RegExp(entry.pattern.source, entry.pattern.flags);
    let match;
    while ((match = regex.exec(scanText)) !== null) {
      issues.push({
        type: 'unnecessary-hyphenation',
        text: match[0],
        severity: 'medium',
        suggestion:
          typeof entry.suggestion === 'function' ? entry.suggestion(match[0]) : entry.suggestion,
      });
    }
  }
  return issues;
}

module.exports = { findUnnecessaryHyphenation, maskHyphenationProtected };
