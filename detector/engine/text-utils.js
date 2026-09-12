// Pure, dependency-free text helpers shared across the engine. Leaf module —
// imports nothing.

function tokenize(text) {
  return text.toLowerCase().match(/[\w'-]+/g) || [];
}

function countWords(text) {
  return (text.match(/\S+/g) || []).length;
}

function getParagraphs(text) {
  return text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
}

function getSentences(text) {
  return text.split(/[.!?]+/).filter((s) => s.trim().length > 5);
}

function matchPatterns(text, patterns, category, severity) {
  const issues = [];
  for (const pat of patterns) {
    const regex = new RegExp(pat.source, pat.flags);
    let match;
    while ((match = regex.exec(text)) !== null) {
      issues.push({
        type: category,
        text: match[0],
        index: match.index,
        severity,
        suggestion: null,
      });
    }
  }
  return issues;
}

function deduplicateIssues(issues) {
  const seen = new Set();
  return issues.filter((issue) => {
    const key = `${issue.type}:${issue.text.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Lightweight, dependency-free stemmer for the optional shared-root echo
// pass. Strips a conservative set of inflectional suffixes and normalizes
// the silent 'e' so take/taking, handle/handled, cultivate/cultivating
// collapse to one root. Deliberately shallow: it does NOT bridge
// derivational gaps (resolution↔resolved stay distinct), which is the
// documented recall cost of staying false-positive-cheap. See eval/echo.js
// for the measured precision/recall/FP comparison vs. exact-token mode.
function lightStem(word) {
  let w = word.toLowerCase();
  if (w.length < 4) return w;
  if (/ies$/.test(w) && w.length > 4) w = w.slice(0, -3) + 'y';
  else if (/(sses|shes|ches|xes)$/.test(w)) w = w.slice(0, -2);
  else if (/s$/.test(w) && !/(ss|us|is)$/.test(w)) w = w.slice(0, -1);
  if (/(ing|ed)$/.test(w) && w.length > 4) w = w.replace(/(ing|ed)$/, '');
  if (/ly$/.test(w) && w.length > 4) w = w.slice(0, -2);
  if (/e$/.test(w) && w.length > 3) w = w.slice(0, -1);
  return w;
}

// ─── Code/quote masking (ported from upstream avoid-ai-writing v3.34.0) ────
// Index-preserving "blank out" of fenced/inline code so downstream regex
// passes never fire inside a code block or backtick span, while match
// indices into the ORIGINAL text stay valid (blanking keeps length and
// newlines intact — only non-newline characters are replaced with spaces).

// Finds ```/~~~ fenced code block ranges as [start, end) character offsets.
// A fence must be closed by a same-or-longer run of the same character on
// its own line (optionally trailing whitespace); an unterminated opening
// fence masks to the end of the text rather than leaking the rest of the
// document as "inside a fence".
function fenceRanges(text) {
  const re = /^[ \t]{0,3}(`{3,}|~{3,})([^\n]*)$/gm;
  const ranges = [];
  let open = null;
  let m;
  while ((m = re.exec(text)) !== null) {
    const marker = m[1];
    if (!open) {
      open = { char: marker[0], len: marker.length, start: m.index };
    } else if (marker[0] === open.char && marker.length >= open.len && /^[ \t]*\r?$/.test(m[2])) {
      ranges.push([open.start, m.index + m[0].length]);
      open = null;
    }
  }
  if (open) ranges.push([open.start, text.length]);
  return ranges;
}

// True when `index` falls inside one of the [start, end) ranges from
// fenceRanges (or any other range list of the same shape).
function inFenceRange(ranges, index) {
  return typeof index === 'number' && ranges.some(([a, b]) => index >= a && index < b);
}

// Overwrites chars[start, end) with spaces, in place, preserving newlines so
// line-based regexes (like fenceRanges' own `^...$/gm`) keep working on the
// masked output.
function blankRange(chars, start, end) {
  for (let i = start; i < end && i < chars.length; i += 1) {
    if (chars[i] !== '\n') chars[i] = ' ';
  }
}

// Returns `text` with fenced code blocks and inline `code` spans blanked
// out (same length, same offsets) so a caller can run a regex over the
// result and still use match.index against the original text.
function maskCode(text) {
  const chars = text.split('');
  for (const [a, b] of fenceRanges(text)) blankRange(chars, a, b);
  const withoutFences = chars.join('');
  const inlineRe = /(`+)(?:(?!\1)[^\n])+\1/g;
  let m;
  while ((m = inlineRe.exec(withoutFences)) !== null) {
    blankRange(chars, m.index, m.index + m[0].length);
  }
  return chars.join('');
}

module.exports = {
  tokenize,
  countWords,
  getParagraphs,
  getSentences,
  matchPatterns,
  deduplicateIssues,
  lightStem,
  fenceRanges,
  inFenceRange,
  blankRange,
  maskCode,
};
