const assert = require('node:assert/strict');
const AIDetector = require('../patterns.js');
const { test } = require('./_harness');

console.log('Vocab & phrase fixtures');

test('"Interesting part of the project:" header opener flags emotional-flatline', () => {
  // The canonical AI list-intro pattern matched "the most interesting
  // part" but missed the bare "Interesting part of X:" section-header
  // form. v3.4 covers both shapes.
  const text =
    '\nInteresting part of the project:\nSome content follows that talks about the real on-chain tokenomics of the system at length.';
  const r = AIDetector.analyzeText(text);
  const types = new Set(r.issues.map((i) => i.type));
  assert.ok(types.has('emotional-flatline'), 'expected emotional-flatline flag');
});

test('"real on-chain tokenomics" flags real-actual-inflation', () => {
  const text =
    'The team is researching real on-chain tokenomics and actual reward sustainability versus electricity cost across the network deployment phase.';
  const r = AIDetector.analyzeText(text);
  const types = new Set(r.issues.map((i) => i.type));
  assert.ok(types.has('real-actual-inflation'), 'expected real-actual-inflation flag');
});

test('tier3-phrase fires on per-phrase repetition (>=2 hits)', () => {
  // The same boilerplate phrase used twice in one piece. Isolates the
  // per-phrase density rule from the cluster rule — cluster needs >=3
  // distinct phrases, this one needs >=2 hits of one phrase.
  const text =
    'The integration of payments matters for adoption. The integration of identity is the next step. Both unlock material flows.';
  const r = AIDetector.analyzeText(text);
  const types = new Set(r.issues.map((i) => i.type));
  assert.ok(types.has('tier3-phrase'), 'expected tier3-phrase flag for 2x repetition');
});

test('tier3-phrase-cluster fires on 3 distinct phrases at density 1 each', () => {
  // The cluster-rule boundary: each phrase appears only once, but three
  // distinct phrases stacked is the LLM-self-varies-boilerplate shape.
  // Per-phrase rule should NOT fire here; cluster rule should.
  const text =
    'The team works on decentralized compute. Their thesis is community-driven and the long-term sustainability of the network matters most. Adoption is improving.';
  const r = AIDetector.analyzeText(text);
  const types = new Set(r.issues.map((i) => i.type));
  assert.ok(
    types.has('tier3-phrase-cluster'),
    'expected tier3-phrase-cluster flag at 3 distinct phrases',
  );
  assert.ok(
    !types.has('tier3-phrase'),
    'per-phrase rule should NOT fire when each phrase appears once',
  );
});

test('tier3-phrase span dedup: overlapping regex matches count as one phrase', () => {
  // "designed for long-term sustainability" matches both
  // "designed for long-term" AND "long-term sustainability" — the second
  // is contained in the first. Span-dedup keeps this as one distinct hit.
  const text = 'This protocol is designed for long-term sustainability and nothing else.';
  const r = AIDetector.analyzeText(text);
  const types = new Set(r.issues.map((i) => i.type));
  assert.ok(
    !types.has('tier3-phrase-cluster'),
    'overlapping matches should not stack toward cluster threshold',
  );
});

test('emotional-flatline opener fires at position 0 (no leading newline)', () => {
  // Earlier (^|\n) form silently missed bare openers at true start of
  // input. /m flag fixes it.
  const text = 'Interesting part of the project:\nThey shipped in two weeks.';
  const r = AIDetector.analyzeText(text);
  const types = new Set(r.issues.map((i) => i.type));
  assert.ok(types.has('emotional-flatline'), 'expected emotional-flatline at position 0');
});

test('v2: formulaic opener fires', () => {
  const text =
    'In the rapidly evolving world of decentralized finance, new protocols have emerged as critical infrastructure. The market continues to expand at an unprecedented pace each quarter without fail.';
  const r = AIDetector.analyzeText(text);
  const types = new Set(r.issues.map((i) => i.type));
  assert.ok(types.has('formulaic-opener'), 'expected formulaic-opener flag');
});

test('v2: parenthetical hedge fires', () => {
  const text =
    'The protocol works as intended (and increasingly, with better latency than competitors). The team has shipped consistently for six months without missing a single release cadence target.';
  const r = AIDetector.analyzeText(text);
  const types = new Set(r.issues.map((i) => i.type));
  assert.ok(types.has('parenthetical-hedge'), 'expected parenthetical-hedge flag');
});

test('v2: context mode "technical" suppresses Title Case header flag', () => {
  const text =
    'Strategic Negotiations And Key Partnerships\n\nThe team closed three deals this quarter. Each agreement included revenue-share terms and dispute-resolution clauses. The legal review took two weeks per contract on average.';
  const general = AIDetector.analyzeText(text, { contextMode: 'general' });
  const technical = AIDetector.analyzeText(text, { contextMode: 'technical' });
  const generalHas = general.issues.some((i) => i.type === 'title-case-header');
  const technicalHas = technical.issues.some((i) => i.type === 'title-case-header');
  assert.ok(generalHas, 'general mode should flag title-case header');
  assert.ok(!technicalHas, 'technical mode should suppress title-case header');
});

test('v2: invalid contextMode falls back to general with stats.contextModeFallback set', () => {
  const text =
    'Strategic Negotiations And Key Partnerships\n\nThe team closed three deals. Each agreement included revenue-share terms. Legal review took two weeks per contract.';
  const r = AIDetector.analyzeText(text, { contextMode: 'tecnical' });
  assert.equal(r.stats.contextMode, 'general', 'invalid mode coerced to general');
  assert.equal(r.stats.contextModeFallback, 'tecnical', 'fallback echoes original');
});
