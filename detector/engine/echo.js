const { ECHO_STOPWORDS } = require('./data/echo-stopwords');
const { lightStem } = require('./text-utils');

// ─── Echo detection (word/root repetition in a close window) ────────
// A deterministic writing-quality signal: the same content word — or,
// with the optional stem pass, the same root — repeating inside a short
// window (within a sentence or across adjacent sentences). Usually a
// rewrite artifact, not a deliberate choice.
//
// Flag-only (P2 / severity 'medium'). Unlike the AI-vocabulary rules it
// does NOT contribute to the AI-origin score (ISSUE_WEIGHTS.echo = 0):
// echo is a human smell too, so counting it would inflate the score on
// perfectly human prose and break the false-positive budget. It surfaces
// in issues[] with both source offsets in `locations` for the editor to
// act on; it never auto-rewrites (which instance to change is a judgment).
//
// Guards against the obvious false positives:
//   - stopwords (closed-class words) never count;
//   - words shorter than 4 chars never count;
//   - a topic term repeated across the whole document is exempt
//     (domain-frequency floor), so "Tier 2 … Tier 2 … Tier 2" technical
//     repetition doesn't fire;
//   - intentional parallelism ("the people … and the people") is skipped
//     when both occurrences share the preceding word and a coordinator
//     sits between them.
//
// Window/threshold (default 20 words) chosen from the labeled sample in
// eval/echo-fixtures.json — see eval/echo.js for the precision/recall
// sweep and the exact-vs-stem FP comparison.
function detectEcho(text, options = {}) {
  const useStem = !!options.echoStem;
  const window = options.echoWindow || 20;

  // Sentence spans (coarse .!? split) so we can bound echoes to the same
  // or an adjacent sentence.
  const sentSpans = [];
  const sentenceRe = /[^.!?]+[.!?]+|\S[^.!?]*$/g;
  let sm;
  while ((sm = sentenceRe.exec(text)) !== null) {
    sentSpans.push({ start: sm.index, end: sm.index + sm[0].length });
  }

  // Token stream with char offsets and owning sentence index.
  const tokens = [];
  const wordRe = /[A-Za-z][A-Za-z'’-]*/g;
  let wm;
  let si = 0;
  while ((wm = wordRe.exec(text)) !== null) {
    const idx = wm.index;
    while (si < sentSpans.length - 1 && idx >= sentSpans[si].end) si++;
    const lower = wm[0].toLowerCase().replace(/’/g, "'");
    tokens.push({ raw: wm[0], lower, idx, sent: sentSpans.length ? si : 0 });
  }

  const isContent = (t) => t.lower.length >= 4 && !ECHO_STOPWORDS.has(t.lower);
  const keyOf = (t) => (useStem ? lightStem(t.lower) : t.lower);

  // Document frequency + sentence spread per content key → domain-term
  // exemption. A word that recurs across the whole piece is a topic term;
  // local repetition of it is expected, not an echo.
  const docFreq = new Map();
  const keySents = new Map();
  let contentCount = 0;
  for (const t of tokens) {
    if (!isContent(t)) continue;
    contentCount++;
    const k = keyOf(t);
    docFreq.set(k, (docFreq.get(k) || 0) + 1);
    if (!keySents.has(k)) keySents.set(k, new Set());
    keySents.get(k).add(t.sent);
  }
  const domainFloor = Math.max(5, Math.ceil(contentCount * 0.02));

  const issues = [];
  const claimed = new Set();
  for (let i = 0; i < tokens.length; i++) {
    const a = tokens[i];
    if (!isContent(a)) continue;
    const k = keyOf(a);
    if ((docFreq.get(k) || 0) >= domainFloor) continue;
    if ((keySents.get(k)?.size || 0) >= 4) continue;
    for (let j = i + 1; j < tokens.length && j - i <= window; j++) {
      const b = tokens[j];
      if (!isContent(b)) continue;
      if (keyOf(b) !== k) continue;
      if (b.sent - a.sent > 1) break; // past the adjacent-sentence window
      const claimKey = `${k}:${a.sent}`;
      if (claimed.has(claimKey)) break;
      // Intentional-parallelism guard: same word before both occurrences
      // with a coordinator (and/or/nor/but or comma) between them.
      const prevA = tokens[i - 1]?.lower;
      const prevB = tokens[j - 1]?.lower;
      const between = text.slice(a.idx, b.idx);
      if (prevA && prevA === prevB && /(\b(?:and|or|nor|but)\b|,)/.test(between)) break;
      claimed.add(claimKey);
      const sameRoot = useStem && a.lower !== b.lower;
      issues.push({
        type: 'echo',
        text: `"${a.lower}"${sameRoot ? `/"${b.lower}"` : ''} repeats within ${j - i} words`,
        index: a.idx,
        locations: [a.idx, b.idx],
        severity: 'medium',
        suggestion: `Possible echo: "${a.raw}" … "${b.raw}" — vary one if the repeat isn't deliberate.`,
      });
      break;
    }
  }
  return issues;
}

module.exports = { detectEcho };
