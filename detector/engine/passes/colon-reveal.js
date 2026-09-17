const { maskCode } = require('../text-utils');
const { COLON_REVEAL } = require('../data/patterns');

// Lines where a colon is structural rather than dramatic: Markdown
// headings, list items (a bold label plus colon is catalog 37's rule,
// not this one), and table rows.
const STRUCTURAL_LINE = /^\s*(?:#{1,6}\s|>|(?:[-*+•]|\d+[.)])\s|\|)/;

// A colon introducing a real enumeration ("three things: ports,
// processes, and local state") is correct punctuation. Two commas, or a
// comma before a conjunction, means list — leave it alone.
const ENUMERATION = /,\s+(?:and|or|plus)\s|,[^,]*,/;

// An independent clause before the colon ("The reason it works is
// simple: nobody touches it") is ordinary punctuation, not a reveal. The
// tell is a bare noun phrase. Same auxiliary/modal-only test the
// bullet-NP pass uses: it leaves ordinary verbs inside a relative clause
// alone, so "The detail that makes it work:" still fires.
const CLAUSE_VERB =
  /\b(?:is|are|was|were|has|have|had|will|would|should|must|do|does|did|can|could|may|might|am|been|being)\b/i;

// A clause the reveal could plausibly be hiding needs at least two words.
// One word after the colon is a label or a value ("The verdict: no"),
// which reads as terse rather than theatrical.
const MIN_CLAUSE_WORDS = 2;

// Returns the [start, end) offsets of the line containing `index`.
function lineBounds(text, index) {
  const start = text.lastIndexOf('\n', index - 1) + 1;
  const end = text.indexOf('\n', index);
  return [start, end === -1 ? text.length : end];
}

// Catalog 80: noun phrase, colon, lowercase dramatic reveal. Matches run
// against code-masked text so a fenced block or a backticked span can't
// fire, but every reported offset indexes the original text (maskCode
// blanks in place and preserves length).
function runColonRevealPass({ text }) {
  const issues = [];
  const masked = maskCode(text);
  const regex = new RegExp(COLON_REVEAL.source, COLON_REVEAL.flags);
  let match;

  while ((match = regex.exec(masked)) !== null) {
    const [phrase, clause] = [match[1], match[2]];
    const [lineStart, lineEnd] = lineBounds(masked, match.index);

    // The masked copy answers "is this prose?"; the original answers
    // "what did the writer actually type?". A backtick anywhere in the
    // phrase means the colon is introducing a definition for a code
    // token, and maskCode has already hollowed the phrase out.
    if (STRUCTURAL_LINE.test(masked.slice(lineStart, lineEnd))) continue;
    if (text.slice(match.index, match.index + match[0].length).includes('`')) continue;
    if (CLAUSE_VERB.test(phrase)) continue;
    if (ENUMERATION.test(clause)) continue;
    if ((clause.match(/\S+/g) || []).length < MIN_CLAUSE_WORDS) continue;

    const shown = clause.length > 48 ? `${clause.slice(0, 48).trimEnd()}...` : clause;
    issues.push({
      type: 'colon-reveal',
      text: `${phrase}: ${shown}`,
      index: match.index,
      severity: 'medium',
      suggestion: 'Rewrite as one plain sentence. Keep colons for lists, labels, and quotes.',
    });
  }

  return issues;
}

module.exports = { runColonRevealPass };
