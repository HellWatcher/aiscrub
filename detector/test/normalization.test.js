const assert = require('node:assert/strict');
const AIDetector = require('../patterns.js');
const { test } = require('./_harness');

console.log('Normalization fixtures');

test('v2: zero-width chars trigger normalization-flag', () => {
  // ZWSP between "del" and "ve" defeats naive "delve" exact-match. Pre-
  // pass strips it, then Tier 1 fires AND normalization-flag fires.
  const zwsp = '​';
  const text = `In today's landscape, we del${zwsp}ve into the intricate tapestry of innovation. This robust paradigm showcases comprehensive frameworks. The framework underscores how organizations harness cutting-edge tools.`;
  const r = AIDetector.analyzeText(text);
  const types = new Set(r.issues.map((i) => i.type));
  assert.ok(types.has('normalization-flag'), 'expected normalization-flag on ZWSP injection');
  assert.ok(r.stats.normalization.zeroWidth > 0, 'norm.zeroWidth should count strip');
});

test('v2: Cyrillic homoglyph swap restores Tier 1 hit', () => {
  // "dеlve" uses Cyrillic 'е' (U+0435). Without normalization the token
  // 'dеlve' would not equal 'delve' and Tier 1 misses it. After
  // normalization, the Latin form fires Tier 1 AND triggers normalization-flag.
  const text =
    'In tоday’s landscape we dеlve intо the intricate tapestry оf the rоbust ecоsystem and dеep dive intо each layer with comprehensive depth.';
  const r = AIDetector.analyzeText(text);
  const types = new Set(r.issues.map((i) => i.type));
  assert.ok(types.has('normalization-flag'), 'expected normalization-flag on homoglyph cluster');
  assert.ok(
    r.stats.normalization.homoglyph >= 2,
    `expected >=2 homoglyph swaps, got ${r.stats.normalization.homoglyph}`,
  );
});

test('v2: markdown **bold** is preserved by normalize pre-pass', () => {
  // Regression: lookbehind/lookahead added in review fix. The pre-fix
  // regex stripped the inner half of `**bold**` and counted each as
  // a roleplay marker, false-positiving normalization-flag on any
  // README / Substack post with bold runs.
  const text = '**First bold** and **another bold** plus **a third one**.';
  const norm = AIDetector.normalizeText(text);
  assert.equal(
    norm.flags.roleplay,
    0,
    `expected roleplay=0 on markdown bold, got ${norm.flags.roleplay}`,
  );
  assert.ok(norm.text.includes('**First bold**'), 'bold marker preserved');
});

test('v2: legitimate *italic phrase* is NOT stripped by roleplay rule', () => {
  // Round-2 fix: roleplay regex now requires an action-verb prefix
  // (nods/sighs/laughs/etc.). Markdown italic with arbitrary multi-word
  // content like *italic phrase here* should survive untouched.
  const text = 'We use *italic phrase here* for emphasis and *another phrase too* in some places.';
  const norm = AIDetector.normalizeText(text);
  assert.equal(
    norm.flags.roleplay,
    0,
    `expected roleplay=0 on plain italic, got ${norm.flags.roleplay}`,
  );
  assert.ok(norm.text.includes('*italic phrase here*'), 'italic preserved');
});

test('v2: *roleplay action verb* IS stripped', () => {
  // The actual chat-model artifact — verb-led action description.
  const text =
    'I think about the problem *nods thoughtfully* and consider the options *sighs deeply* before answering.';
  const norm = AIDetector.normalizeText(text);
  assert.ok(norm.flags.roleplay >= 2, `expected ≥2 roleplay strips, got ${norm.flags.roleplay}`);
});

test('v2: single ZWSP does not flip to AI_ONLY (hair-trigger fix)', () => {
  // Common in copy-paste from Word/Notion/Slack-rendered text. Round-1
  // made single ZWSP a strong corroborator → AI_ONLY at score 0. Round-2
  // raised the threshold to ≥2 for parity with homoglyph.
  const zwsp = '​';
  const text = `Our team shipped a fix on Monday${zwsp} afternoon. Tests pass and the deploy is green. Everything looks good. Plain human text with one accidental zero-width character pasted from a Notion doc.`;
  const r = AIDetector.analyzeText(text);
  assert.notEqual(
    r.document_classification,
    'AI_ONLY',
    `single ZWSP should not flip to AI_ONLY, got ${r.document_classification}`,
  );
});

test('v2: blockquoted AI text does not penalize the human wrapper', () => {
  // A human reacting to AI text by quoting it shouldn't have the quoted
  // block scored against their own prose. The `> ` lines get stripped
  // in a pre-pass and the count surfaces in stats.quotedLines.
  const text = [
    'I asked ChatGPT to describe my project and got this response:',
    '',
    '> In the rapidly evolving world of decentralized finance, we delve into the intricate tapestry of innovation.',
    '> This seamless, robust paradigm showcases a comprehensive framework that catalyzes transformative change.',
    '> Moreover, this represents a pivotal moment in the ecosystem.',
    '',
    'The response was pretty bad. I rewrote it as a normal sentence about what we actually do.',
  ].join('\n');
  const r = AIDetector.analyzeText(text);
  assert.ok(r.stats.quotedLines >= 3, `expected quotedLines >= 3, got ${r.stats.quotedLines}`);
  assert.notEqual(
    r.document_classification,
    'AI_ONLY',
    `human wrapping AI quote should not classify AI_ONLY, got ${r.document_classification}`,
  );
});

test('v2: single-line shell prompt > is NOT stripped as blockquote', () => {
  // Blockquote strip now requires ≥2 consecutive lines.
  const text =
    'To check the directory:\n\n> ls -la\n\nThen review the output and look for any unexpected files. The team uses this command frequently when debugging deployment issues that involve filesystem permissions.';
  const r = AIDetector.analyzeText(text);
  assert.equal(
    r.stats.quotedLines,
    0,
    `single > line should not strip, got quotedLines=${r.stats.quotedLines}`,
  );
});
