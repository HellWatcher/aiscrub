const assert = require('node:assert/strict');
const AIDetector = require('../patterns.js');
const { test } = require('./_harness');

console.log('Stylometry fixtures');

test('low-ttr fires on a 200+ token text with narrow vocabulary', () => {
  // Vocabulary-poor synthetic sample: same 11-word sentence repeated.
  // ~200 tokens, ~11 unique = ~5% TTR. Well under the 40% threshold.
  // Stylometric signal from the May 2026 detection-research review
  // (docs/competitive/detection-research.md).
  const sentence = 'The system shows the system improves the system every iteration. ';
  const text = sentence.repeat(20);
  const r = AIDetector.analyzeText(text);
  const types = new Set(r.issues.map((i) => i.type));
  assert.ok(types.has('low-ttr'), `expected low-ttr flag, got types: ${[...types].join(', ')}`);
});

test('low-ttr does not fire on natural human prose at 200+ tokens', () => {
  // 200+ tokens of varied human-style prose. TTR should comfortably
  // exceed the 0.40 threshold even with some natural repetition.
  const text = `When the build broke this morning, I rolled back the recent auth refactor and
ran the integration tests again. Most of them passed cleanly, but a handful
of edge cases around token refresh still tripped the staging environment.
Safari users hit a 401 on the second request of any session that crossed
the hour mark, while Firefox sessions stayed authenticated as expected.
Digging through the logs, the culprit looked like a cookie scope issue
introduced during the migration to the new domain. I patched the path
parameter, redeployed to staging, and watched the metrics dashboard for
twenty minutes before pushing to production. Memory usage stayed flat,
latency held steady around forty milliseconds, and the error rate dropped
back below baseline once the rollout completed. Closing the incident
ticket now and writing up notes for the team retrospective tomorrow.`;
  const r = AIDetector.analyzeText(text);
  const types = new Set(r.issues.map((i) => i.type));
  assert.ok(!types.has('low-ttr'), `low-ttr should not fire on natural prose, got types: ${[...types].join(', ')}`);
});

test('low-ttr does not fire on short texts (<200 tokens)', () => {
  // Same vocab-poor pattern but only ~50 tokens — below the sample-size
  // threshold. Avoids drowning short social posts in a stylometric flag
  // that needs more data to be reliable.
  const text = ('The system shows the system improves the system. '.repeat(5));
  const r = AIDetector.analyzeText(text);
  const types = new Set(r.issues.map((i) => i.type));
  assert.ok(!types.has('low-ttr'), 'low-ttr should not fire below 200 tokens');
});

test('v2: punct-distribution fires on uniform per-paragraph density', () => {
  // Four paragraphs, each ~30 words, each with the same number of
  // commas. Uniform punctuation density across paragraphs is the AI
  // signature this rule catches.
  const text = [
    'The protocol design centers on three core principles, including modularity, composability, and forward compatibility, which together enable predictable behavior across many environments and deployment topologies.',
    'Implementation choices reflect a deliberate preference for simplicity, including small interfaces, narrow contracts, and explicit invariants, which together make the codebase tractable for new contributors and reviewers.',
    'Testing strategy emphasizes property-based coverage, including invariants, contract tests, and regression fixtures, which together guard against silent behavior changes in performance-critical paths across releases.',
    'Documentation follows a layered approach, including conceptual overviews, narrative guides, and reference material, which together orient readers without forcing them through any single rigid sequence of pages.',
  ].join('\n\n');
  const r = AIDetector.analyzeText(text);
  const types = new Set(r.issues.map((i) => i.type));
  assert.ok(types.has('punct-distribution'), 'expected punct-distribution flag on uniform density');
});

test('v2: cross-para-burstiness fires on uniform sentence rhythm', () => {
  // Four paragraphs, each with three sentences of similar length.
  // Std-of-CV across paragraphs is low → flag fires.
  const text = [
    'The system processes events synchronously. Each event triggers a downstream handler. The handler updates state immediately.',
    'The database uses optimistic locking. Concurrent writes retry transparently. The retry budget allows three attempts.',
    'Authentication relies on signed tokens. Tokens expire after fifteen minutes. Refresh requests issue new tokens.',
    'Logging captures every state change. The pipeline routes logs centrally. Storage retains entries for ninety days.',
  ].join('\n\n');
  const r = AIDetector.analyzeText(text);
  const types = new Set(r.issues.map((i) => i.type));
  assert.ok(types.has('cross-para-burstiness'), 'expected cross-para-burstiness on uniform rhythm');
});
