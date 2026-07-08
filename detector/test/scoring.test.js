const assert = require('node:assert/strict');
const AIDetector = require('../patterns.js');
const { test } = require('./_harness');

console.log('Scoring fixtures');

test('AI-heavy paragraph scores in Strong/Heavy range', () => {
  const text = [
    "In today's ever-evolving landscape, we delve into the intricate",
    'tapestry of innovation. This seamless, robust paradigm showcases a',
    'comprehensive framework. Moreover, it truly is a game-changer.',
    'Furthermore, this pivotal moment underscores how we navigate the',
    'complexities of modern AI.',
  ].join(' ');
  const r = AIDetector.analyzeText(text);
  assert.ok(r.score >= 60, `expected score ≥60, got ${r.score}`);
  assert.ok(['Strong AI signals', 'Heavy AI patterns'].includes(r.label), `got label: ${r.label}`);
});

test('plain human bug-report prose stays in Minimal range', () => {
  const text = [
    'The build broke again this morning. Rolled back the auth refactor',
    'and tests pass now. Still need to figure out why the token refresh',
    'path hits a 401 for users on Safari but not Firefox — probably a',
    'cookie scope issue but I want to confirm before shipping a fix.',
  ].join(' ');
  const r = AIDetector.analyzeText(text);
  assert.ok(r.score <= 20, `expected score ≤20, got ${r.score}`);
});

test('repeated Tier 1 phrase does not inflate score linearly', () => {
  const single = AIDetector.analyzeText('We delve into the landscape of many things today.');
  const fivefold = AIDetector.analyzeText(
    'We delve into the landscape. We delve into the landscape. We delve into the landscape. We delve into the landscape. We delve into the landscape of things.'
  );
  assert.ok(
    fivefold.score <= single.score + 20,
    `repeated phrase should not 5× the score (single=${single.score}, fivefold=${fivefold.score})`
  );
});

test('v2: probability fields sum to exactly 1.000 (no float drift)', () => {
  const texts = [
    'In the rapidly evolving world of decentralized finance, we delve into the intricate tapestry of innovation. This seamless, robust paradigm showcases a comprehensive framework that catalyzes transformative change across the ecosystem.',
    'The build broke. Rolled back. Tests pass. Will investigate the root cause tomorrow afternoon after the standup with the on-call engineer.',
    'A neutral middle paragraph that mixes some flagged words like robust and comprehensive but in normal context, leveraging some technical terms in the way a real engineer might describe their implementation choices over coffee.',
  ];
  for (const t of texts) {
    const r = AIDetector.analyzeText(t);
    const sum = r.class_probabilities.human + r.class_probabilities.mixed + r.class_probabilities.ai;
    assert.ok(Math.abs(sum - 1) < 0.0005, `probabilities should sum to exactly 1.000, got ${sum} for: ${t.slice(0, 40)}...`);
  }
});

test('v2: probability sum is exactly 1 with no negative components', () => {
  // Round-2 fix: clamp p.ai to >= 0 after the remainder calculation
  // since toFixed(3) rounding can push human+mixed slightly above 1.
  const texts = [
    'In the rapidly evolving world of decentralized finance, we delve into the intricate tapestry of innovation. This seamless, robust paradigm showcases a comprehensive framework that catalyzes transformative change across the ecosystem. Furthermore, this pivotal moment marks a fundamental shift.',
    'The build broke. Rolled back. Tests pass.',
    'A neutral middle paragraph that mixes some words like robust and comprehensive in normal context, leveraging technical terms the way a real engineer might describe their implementation choices over coffee with a teammate.',
    '',
    'word '.repeat(11000),
  ];
  for (const t of texts) {
    const r = AIDetector.analyzeText(t);
    const { human, mixed, ai } = r.class_probabilities;
    assert.ok(human >= 0, `human prob negative: ${human}`);
    assert.ok(mixed >= 0, `mixed prob negative: ${mixed}`);
    assert.ok(ai >= 0, `ai prob negative: ${ai}`);
    const sum = human + mixed + ai;
    assert.ok(Math.abs(sum - 1) < 0.002, `sum should be ~1, got ${sum} for: ${(t || '<empty>').slice(0, 40)}`);
  }
});

test('v2: backward compat — score, label, issues, stats still present', () => {
  const r = AIDetector.analyzeText('We delve into the landscape of leveraging robust paradigms. The team continues to navigate this comprehensive transformation.');
  assert.ok(typeof r.score === 'number', 'score still numeric');
  assert.ok(typeof r.label === 'string', 'label still string');
  assert.ok(Array.isArray(r.issues), 'issues still array');
  assert.ok(r.stats && typeof r.stats === 'object', 'stats still object');
});
