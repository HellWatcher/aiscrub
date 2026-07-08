const assert = require('node:assert/strict');
const AIDetector = require('../patterns.js');
const { test } = require('./_harness');

console.log('Gate fixtures');

test('empty text returns Empty label', () => {
  const r = AIDetector.analyzeText('');
  assert.equal(r.label, 'Empty');
  assert.equal(r.issues.length, 0);
});

test('text under 10 words returns tooShort flag', () => {
  const r = AIDetector.analyzeText('Short unscorable text snippet.');
  assert.equal(r.tooShort, true);
  assert.equal(r.label, 'Too short');
});

test('text over 10k words returns tooLong flag', () => {
  const r = AIDetector.analyzeText('word '.repeat(10001));
  assert.equal(r.tooLong, true);
  assert.equal(r.label, 'Text too long');
});

test('stats fields sum to issues length', () => {
  const text = [
    "In today's landscape of innovation, we leverage seamless paradigms",
    'to harness the power of transformation. It is important to note',
    'that experts believe this is pivotal. Let me think step by step.',
  ].join(' ');
  const r = AIDetector.analyzeText(text);
  const sum = r.stats.tier1Count + r.stats.tier2Count + r.stats.tier3Count + r.stats.patternCount;
  assert.equal(sum, r.issues.length, `stats sum (${sum}) != issues (${r.issues.length})`);
});

test('chatbot artifacts score as P0 critical', () => {
  const text =
    'I hope this helps! Let me know if you need anything else. Great question! Feel free to reach out.';
  const r = AIDetector.analyzeText(text);
  const chatbotIssues = r.issues.filter((i) => i.type === 'chatbot');
  assert.ok(chatbotIssues.length >= 2, `expected chatbot detections, got ${chatbotIssues.length}`);
  assert.equal(AIDetector.SEVERITY_LABELS[chatbotIssues[0].severity], 'P0');
});

test('severity labels are distinct across all four tiers', () => {
  const labels = new Set(Object.values(AIDetector.SEVERITY_LABELS));
  assert.equal(labels.size, 4, 'expected P0/P1/P2/P3 as four distinct labels');
});

test('v2: trinary fields present on tooShort / tooLong / empty as UNSCORED', () => {
  // Early-exit paths return UNSCORED (not HUMAN_ONLY) so a caller can't
  // mistake a refused scan for a confident human verdict. A 50k-word
  // LLM-generated document falling into tooLong is not "human."
  const empty = AIDetector.analyzeText('');
  const tooShort = AIDetector.analyzeText('Short text.');
  const tooLong = AIDetector.analyzeText('word '.repeat(10001));
  for (const [name, r] of [
    ['empty', empty],
    ['tooShort', tooShort],
    ['tooLong', tooLong],
  ]) {
    assert.equal(
      r.document_classification,
      'UNSCORED',
      `${name}: expected UNSCORED, got ${r.document_classification}`,
    );
    assert.equal(r.confidence_category, 'low', `${name}: expected low confidence`);
    assert.ok(r.class_probabilities, `${name}: missing class_probabilities`);
    assert.ok(Array.isArray(r.highlight_sentence_for_ai), `${name}: missing highlight array`);
  }
  // Empty case has empty stats so contextMode field absent is fine;
  // tooShort/tooLong should surface contextMode for traceability.
  assert.equal(tooShort.stats.contextMode, 'general', 'tooShort stats includes contextMode');
  assert.equal(tooLong.stats.contextMode, 'general', 'tooLong stats includes contextMode');
});

test('v2: unmappedHighlights counter surfaced in stats', () => {
  const r = AIDetector.analyzeText(
    'We delve into the landscape of innovation and continue to navigate the comprehensive transformation.',
  );
  assert.equal(typeof r.stats.unmappedHighlights, 'number', 'unmappedHighlights should be numeric');
});

test('v2: stats.denseAIVocab and stats.tier1Distinct surface for observability', () => {
  const r = AIDetector.analyzeText(
    'We delve into the landscape with robust comprehensive seamless innovative cutting-edge solutions.',
  );
  assert.equal(typeof r.stats.denseAIVocab, 'boolean', 'denseAIVocab should be boolean');
  assert.equal(typeof r.stats.tier1Distinct, 'number', 'tier1Distinct should be number');
});
