const { weightFor } = require('./constants');

// Issue types that carry no document-substring anchor. They contribute to
// the document-level signal but not to sentence-region highlights.
// Filter by issue TYPE not text-regex: text-based filtering used to
// drop legitimate phrase issues containing "across" / "density".
const SUMMARY_ONLY_TYPES = new Set([
  'punct-distribution',
  'cross-para-burstiness',
  'fnword-trigram-entropy',
  'smart-punct-signature',
  'normalization-flag',
  'uniformity',
  'em-dash',
  'formatting',
  'tier3',
  'tier3-phrase',
  'tier3-phrase-cluster',
  'hashtag-stuff',
  'bullet-np-list',
  // Echo carries its own char offsets in `locations`; its summary text
  // ("X repeats within N words") is not a substring of the document, so
  // skip the substring-based region mapping to avoid inflating
  // unmappedHighlights.
  'echo',
]);

function buildSentenceRegions(text, issues) {
  // Split text into sentences with byte offsets preserved so the UI
  // can highlight spans accurately. Sentence boundaries are coarse
  // (.!?) — fine for highlighting, not for linguistic correctness.
  const sentences = [];
  const sentenceRe = /[^.!?]+[.!?]+|\S[^.!?]*$/g;
  let m;
  while ((m = sentenceRe.exec(text)) !== null) {
    const trimmed = m[0].trim();
    if (trimmed.length < 4) continue;
    sentences.push({ start: m.index, end: m.index + m[0].length, text: trimmed });
  }
  if (sentences.length === 0) return [];

  // Map issue.text back to sentence indexes via substring search. Issues
  // without a meaningful text (e.g. summary signals like "Punctuation
  // density uniform across paragraphs") have no sentence anchor — they
  // contribute to the document-level signal but not to highlights.
  const hits = sentences.map(() => ({ count: 0, weight: 0 }));
  const lowerText = text.toLowerCase();
  let unmappedHighlights = 0;
  for (const issue of issues) {
    if (!issue.text || issue.text.length > 200) continue;
    if (SUMMARY_ONLY_TYPES.has(issue.type)) continue;
    const needle = issue.text.toLowerCase();
    let idx = 0;
    let matched = false;
    while ((idx = lowerText.indexOf(needle, idx)) !== -1) {
      matched = true;
      for (let i = 0; i < sentences.length; i++) {
        if (idx >= sentences[i].start && idx < sentences[i].end) {
          hits[i].count++;
          hits[i].weight += weightFor(issue.type);
          break;
        }
      }
      idx += needle.length;
    }
    if (!matched) unmappedHighlights++;
  }

  // Window-merge contiguous flagged sentences. Allow 1 unflagged
  // sentence gap between two flagged ones (the "smoothing" — keeps
  // a single boring sentence from breaking what's clearly an AI
  // passage). A sentence is "flagged" if it has ≥1 hit.
  const regions = [];
  let cur = null;
  for (let i = 0; i < sentences.length; i++) {
    if (hits[i].count > 0) {
      if (cur === null) {
        cur = {
          startSentence: i,
          endSentence: i,
          start: sentences[i].start,
          end: sentences[i].end,
          hitCount: hits[i].count,
          weight: hits[i].weight,
        };
      } else {
        cur.endSentence = i;
        cur.end = sentences[i].end;
        cur.hitCount += hits[i].count;
        cur.weight += hits[i].weight;
      }
    } else if (cur !== null) {
      // Allow one-sentence gap.
      const next = hits[i + 1];
      if (next && next.count > 0) {
        cur.endSentence = i;
        cur.end = sentences[i].end;
        continue;
      }
      regions.push(finalizeRegion(cur));
      cur = null;
    }
  }
  if (cur !== null) regions.push(finalizeRegion(cur));
  // Expose the unmapped-highlight count via a non-enumerable property
  // so the array length still reads naturally for consumers; the
  // analyzer pulls it into stats.unmappedHighlights for diagnostics.
  Object.defineProperty(regions, '_unmapped', { value: unmappedHighlights, enumerable: false });
  return regions;
}

function finalizeRegion(r) {
  // Map cumulative weight inside the region to a 0-1 score. Cap at 20
  // weight = 1.0 (matches Heavy threshold density).
  const score = Math.min(1, r.weight / 20);
  return {
    startSentence: r.startSentence,
    endSentence: r.endSentence,
    start: r.start,
    end: r.end,
    hitCount: r.hitCount,
    score: Math.round(score * 100) / 100,
  };
}

module.exports = { buildSentenceRegions, finalizeRegion, SUMMARY_ONLY_TYPES };
