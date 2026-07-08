// Pure, dependency-free text helpers shared across the engine. Leaf module —
// imports nothing.

function tokenize(text) {
  return text.toLowerCase().match(/[\w'-]+/g) || [];
}

function countWords(text) {
  return (text.match(/\S+/g) || []).length;
}

function getParagraphs(text) {
  return text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
}

function getSentences(text) {
  return text.split(/[.!?]+/).filter(s => s.trim().length > 5);
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
  return issues.filter(issue => {
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

module.exports = {
  tokenize,
  countWords,
  getParagraphs,
  getSentences,
  matchPatterns,
  deduplicateIssues,
  lightStem,
};
