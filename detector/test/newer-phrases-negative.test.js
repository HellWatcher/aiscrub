const assert = require('node:assert/strict');
const AIDetector = require('../patterns.js');
const { ISSUE_WEIGHTS } = require('../engine/constants');
const { test } = require('./_harness');

console.log('Newer phrase types: should-not-fire cases');

const pad = (n = 20) => 'padding word '.repeat(n);

function typesOf(text, opts) {
  return new Set(AIDetector.analyzeText(text, opts).issues.map((i) => i.type));
}

// Each new type has a literal or ordinary-prose neighbour that the regex
// must leave alone. These lock in the precision guards the catalog promises.

test('tier1-clarity stays quiet on plain prose with no wordiness phrases', () => {
  const text = `We use the system to help teams. It is a bridge and has many options. ${pad()}`;
  assert.ok(!typesOf(text).has('tier1-clarity'));
});

test('lingering-attention ignores the bare "keep coming back to" with a reason', () => {
  const text = `I keep coming back to the cache layer because the retry path charges customers twice. ${pad()}`;
  assert.ok(!typesOf(text).has('lingering-attention'));
});

test('speculative-opener ignores instructional "imagine you have"', () => {
  const text = `Imagine you have an array of ten integers and need the largest one. ${pad()}`;
  assert.ok(!typesOf(text).has('speculative-opener'));
});

test('launch-intro ignores introducing a person by role', () => {
  const text = `Meet Sarah, your new account manager for the northeast region. ${pad()}`;
  assert.ok(!typesOf(text).has('launch-intro'));
});

test('fake-casual-prop ignores literal props and gestures', () => {
  const text = `The chef made a kiss-shaped cake and checked the notes twice before service. ${pad()}`;
  assert.ok(!typesOf(text).has('fake-casual-prop'));
});

test('performed-insight ignores the literal sense of "sit with"', () => {
  const text = `I sat with him on the porch until the rain stopped and the bus came. ${pad()}`;
  assert.ok(!typesOf(text).has('performed-insight'));
});

test('dev-blog-boilerplate ignores a literal "just works" claim about a recipe', () => {
  const text = `The recipe just works if you weigh the flour instead of scooping it. ${pad()}`;
  assert.ok(!typesOf(text).has('dev-blog-boilerplate'));
});

test('unnecessary-hyphenation carries weight 0 and does not move the score', () => {
  assert.equal(ISSUE_WEIGHTS['unnecessary-hyphenation'], 0);
  const flagged = `Our code-base has grown and the road-map reflects that. ${pad()}`;
  const fixed = `Our codebase has grown and the roadmap reflects that. ${pad()}`;
  const a = AIDetector.analyzeText(flagged);
  const b = AIDetector.analyzeText(fixed);
  assert.ok(
    a.issues.some((i) => i.type === 'unnecessary-hyphenation'),
    'expected a hyphenation hit',
  );
  assert.equal(a.score, b.score, 'hyphenation hits must not change the score');
});

test('ai-citation-markup does not fire on a generic :::name admonition fence', () => {
  const text = `:::writing\nDraft your answer here.\n:::\n\n${pad()}`;
  assert.ok(!typesOf(text).has('ai-citation-markup'));
});
