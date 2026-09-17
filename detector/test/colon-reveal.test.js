const assert = require('node:assert/strict');
const AIDetector = require('../patterns.js');
const { test } = require('./_harness');

console.log('Colon reveals (catalog 80, sourced from petergyang/no-ai-slop)');

const pad = (n = 20) => 'padding word '.repeat(n);

function hits(text, opts) {
  return AIDetector.analyzeText(text, opts).issues.filter((i) => i.type === 'colon-reveal');
}

// ── Positives ────────────────────────────────────────────────────────
test('colon-reveal fires on a noun phrase opening onto a lowercase reveal', () => {
  const found = hits(`The detail that makes it work: a separate agent grades it. ${pad()}`);
  assert.equal(found.length, 1);
  assert.match(found[0].text, /^The detail that makes it work: a separate agent grades it$/);
});

test('colon-reveal fires mid-paragraph, not just at the start of a line', () => {
  assert.equal(
    hits(`We shipped Tuesday. The kicker: nobody noticed for a week. ${pad()}`).length,
    1,
  );
});

test('colon-reveal fires on the faux-insight form', () => {
  assert.equal(hits(`What nobody tells you: distribution is the moat. ${pad()}`).length, 1);
});

test('colon-reveal reports an index that points at the phrase in the source', () => {
  const text = `Nothing to see yet. The best part: it learns from every run. ${pad()}`;
  const [found] = hits(text);
  assert.ok(found, 'expected a hit');
  assert.ok(text.slice(found.index).startsWith('The best part:'));
});

// ── Negatives: colons doing their real jobs ──────────────────────────
test('a bare label keeps its colon', () => {
  assert.equal(hits(`Note: the build needs node 20 or later to run. ${pad()}`).length, 0);
});

test('a colon opening onto a genuine list is not a reveal', () => {
  assert.equal(
    hits(`The stack has three parts: ports, processes, and local state. ${pad()}`).length,
    0,
  );
});

test('a full clause before the colon is ordinary punctuation', () => {
  assert.equal(
    hits(`The reason it works is simple: nobody touches the config. ${pad()}`).length,
    0,
  );
});

// ── Negatives: line shapes that belong to other rules ────────────────
test('Markdown headings and list labels are left to the formatting rules', () => {
  const text = `## The detail: a separate agent grades it\n\n- The best part: it learns from every run\n\n${pad()}`;
  assert.equal(hits(text).length, 0);
});

test('a colon introducing a code token is not a reveal', () => {
  assert.equal(hits(`The \`--json\` flag: prints machine-readable output. ${pad()}`).length, 0);
});

test('fenced code is never scanned for reveals', () => {
  const text = `Here is the config.\n\n\`\`\`yaml\nThe detail: a separate agent grades it\n\`\`\`\n\n${pad()}`;
  assert.equal(hits(text).length, 0);
});

test('clock times and capitalized continuations do not fire', () => {
  assert.equal(hits(`The standup starts at 9:30 every morning in the room. ${pad()}`).length, 0);
  assert.equal(hits(`The winner: Ferrik took the prize again this year. ${pad()}`).length, 0);
});

// ── Scoring contract ─────────────────────────────────────────────────
test('a single colon reveal cannot classify a draft as AI on its own', () => {
  const r = AIDetector.analyzeText(`The best part: it learns from every run. ${pad(40)}`);
  assert.ok(
    r.issues.some((i) => i.type === 'colon-reveal'),
    'expected the reveal to be flagged',
  );
  assert.notEqual(r.document_classification, 'AI_ONLY');
});
