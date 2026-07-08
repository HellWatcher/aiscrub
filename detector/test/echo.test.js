const assert = require('node:assert/strict');
const AIDetector = require('../patterns.js');
const { test } = require('./_harness');

console.log('Echo fixtures');

test('echo: exact content-word repeat across adjacent sentences flags', () => {
  const text =
    "I used methodical testing to reach a resolution. I'd rather work the problem to a resolution than hand it off.";
  const issues = AIDetector.detectEcho(text);
  const r = AIDetector.analyzeText(
    text + ' Padding to clear the word-count gate so the full analyzer runs.',
  );
  assert.ok(
    issues.some((i) => i.type === 'echo' && /resolution/.test(i.text)),
    'expected echo on "resolution"',
  );
  assert.ok(
    r.issues.some((i) => i.type === 'echo'),
    'echo should surface through analyzeText',
  );
});

test('echo: within-sentence content-word repeat flags', () => {
  const text =
    'I would rather work the problem all the way to a fix than hand the problem off to someone else.';
  const issues = AIDetector.detectEcho(text);
  assert.ok(
    issues.some((i) => /problem/.test(i.text)),
    'expected echo on "problem"',
  );
});

test('echo: each issue carries both source locations', () => {
  const text =
    'The more capable I get, the more I can take on the harder work I currently cannot take.';
  const issues = AIDetector.detectEcho(text);
  const echo = issues.find((i) => /take/.test(i.text));
  assert.ok(echo, 'expected echo on "take"');
  assert.ok(Array.isArray(echo.locations) && echo.locations.length === 2, 'echo has two locations');
  assert.ok(echo.locations[1] > echo.locations[0], 'second location after the first');
});

test('echo: severity is P2 (flag-only polish, never P0/P1)', () => {
  const text = 'I would rather work the problem to a fix than hand the problem off.';
  const issues = AIDetector.detectEcho(text);
  const echo = issues.find((i) => i.type === 'echo');
  assert.equal(AIDetector.SEVERITY_LABELS[echo.severity], 'P2');
});

test('echo: weight 0 — flags but does not move the AI-origin score', () => {
  // Prose whose only detector hit is an echo (no tier vocab, transitions,
  // em-dashes, or stylometric triggers). The echo must surface in issues[]
  // while the score stays at 0 — flag-only, score-neutral by design.
  const text =
    'I would rather work the problem to a fix than hand the problem off to a teammate today.';
  const r = AIDetector.analyzeText(text);
  assert.ok(
    r.issues.some((i) => i.type === 'echo'),
    'expected an echo issue',
  );
  assert.equal(
    r.issues.filter((i) => i.type !== 'echo').length,
    0,
    'precondition: echo is the only signal',
  );
  assert.equal(r.score, 0, `echo must not move the score, got ${r.score}`);
});

test('echo: stopword anaphora ("where ... where") does not flag', () => {
  const text =
    'I know exactly where my value is and where it stays, and I do not chase titles to feel it.';
  const issues = AIDetector.detectEcho(text);
  assert.equal(
    issues.length,
    0,
    `stopword anaphora should not flag, got ${JSON.stringify(issues.map((i) => i.text))}`,
  );
});

test('echo: intentional parallelism ("the people ... and the people") is skipped', () => {
  const text =
    'It is a government of the people, by the people, and for the people, built to last.';
  const issues = AIDetector.detectEcho(text);
  assert.ok(
    !issues.some((i) => /people/.test(i.text)),
    'coordinated parallelism on "people" should be skipped',
  );
});

test('echo: a document-wide domain term is exempt (frequency floor)', () => {
  const text =
    'The router speaks BGP to its peers. BGP sessions reset on link flap, so we damp the BGP routes. Every BGP neighbor reconverges within a minute, and BGP keeps the table stable after that.';
  const issues = AIDetector.detectEcho(text);
  assert.ok(!issues.some((i) => /bgp/i.test(i.text)), 'recurring topic term BGP should be exempt');
});

test('echo: repeats outside the window / non-adjacent sentences do not flag', () => {
  const text =
    'Resolution is the goal of every ticket we open. We triage by severity, gather logs, reproduce locally, write a regression test, ship the patch, and only then do we mark another resolution as final.';
  const issues = AIDetector.detectEcho(text);
  assert.ok(
    !issues.some((i) => /resolution/.test(i.text)),
    'distant repeats should be out of window',
  );
});

test('echo: stem pass catches shared roots that exact mode misses', () => {
  const text =
    'She was handling the rollout calmly while I handled the customer comms in the next room.';
  const exact = AIDetector.detectEcho(text, { echoStem: false });
  const stem = AIDetector.detectEcho(text, { echoStem: true });
  assert.equal(exact.length, 0, 'exact mode should miss handling/handled');
  assert.ok(
    stem.some((i) => /handl/.test(i.text)),
    'stem mode should catch the shared root',
  );
});

test('echo: stem pass is off by default (no shared-root flags without opt-in)', () => {
  const text =
    'Good managers cultivate trust slowly, cultivating small wins before they ever ask for a big one.';
  const issues = AIDetector.detectEcho(text);
  assert.equal(issues.length, 0, 'default (exact) mode should not flag cultivate/cultivating');
});
