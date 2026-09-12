const assert = require('node:assert/strict');
const AIDetector = require('../patterns.js');
const { test } = require('./_harness');

console.log('Newer phrase types (ported from avoid-ai-writing v3.34.0)');

const pad = (n = 20) => 'padding word '.repeat(n);

function typesOf(text, opts) {
  return new Set(AIDetector.analyzeText(text, opts).issues.map((i) => i.type));
}

// ── tier1-clarity (Tier 1B wordiness) ───────────────────────────────
test('tier1-clarity fires for wordiness phrases, distinct from tier1', () => {
  const text = `We utilize this system in order to help teams. It serves as a bridge and boasts many features. ${pad()}`;
  const types = typesOf(text);
  assert.ok(types.has('tier1-clarity'), 'expected tier1-clarity flag');
});

test('tier1-clarity words are excluded from the dense-vocabulary (tier1) signal', () => {
  const text = `We utilize this system in order to help teams. It serves as a bridge and boasts many features. ${pad()}`;
  const r = AIDetector.analyzeText(text);
  const tier1Texts = r.issues.filter((i) => i.type === 'tier1').map((i) => i.text.toLowerCase());
  assert.ok(!tier1Texts.includes('utilize'), 'utilize must not also appear as tier1');
  assert.ok(!r.stats.denseAIVocab, 'clarity hits alone should not trigger denseAIVocab');
});

// ── social-cta-closer ────────────────────────────────────────────────
test('social-cta-closer fires on engagement-bait closers', () => {
  const text = `This one is totally worth your time. ${pad()}`;
  assert.ok(typesOf(text).has('social-cta-closer'));
});

test('social-cta-closer does not fire on plain sincere recommendation', () => {
  const text = `I recommend the new onboarding doc to every new hire on the team. ${pad()}`;
  assert.ok(!typesOf(text).has('social-cta-closer'));
});

// ── lingering-attention ──────────────────────────────────────────────
test('lingering-attention fires on "can\'t stop thinking about"', () => {
  const text = `I can't stop thinking about this framing of the problem. ${pad()}`;
  assert.ok(typesOf(text).has('lingering-attention'));
});

// ── speculative-opener ───────────────────────────────────────────────
test('speculative-opener fires on "Imagine a world where"', () => {
  const text = `Imagine a world where every developer ships bug-free code on the first try. ${pad()}`;
  assert.ok(typesOf(text).has('speculative-opener'));
});

// ── unnecessary-hyphenation ──────────────────────────────────────────
test('unnecessary-hyphenation fires on curated closed compounds', () => {
  const text = `Our code-base has grown and the road-map reflects that. ${pad()}`;
  assert.ok(typesOf(text).has('unnecessary-hyphenation'));
});

test('unnecessary-hyphenation does not fire inside fenced code', () => {
  const text = `Here is a snippet:\n\n\`\`\`\nconst codeBasePath = "src/code-base";\n\`\`\`\n\n${pad()}`;
  assert.ok(!typesOf(text).has('unnecessary-hyphenation'));
});

test('unnecessary-hyphenation "real-time" carve-out: attributive use before a verb still fires', () => {
  const text = `The dashboard updates in real-time across every region we support today. ${pad()}`;
  assert.ok(typesOf(text).has('unnecessary-hyphenation'));
});

test('unnecessary-hyphenation "real-time" carve-out: adjectival use ("real-time analytics") does not fire', () => {
  const text = `The dashboard ships with real-time analytics for every region we support today. ${pad()}`;
  assert.ok(!typesOf(text).has('unnecessary-hyphenation'));
});

// ── launch-intro ─────────────────────────────────────────────────────
test('launch-intro fires on "Meet X, the new standard" openers', () => {
  const text = `Meet Aurora, the new standard. It replaces three tools we used to juggle every day. ${pad()}`;
  assert.ok(typesOf(text).has('launch-intro'));
});

// ── crowd-contrast ───────────────────────────────────────────────────
test('crowd-contrast fires on dramatized "while everyone else" framing', () => {
  const text = `While everyone else was still debating timelines, we shipped the release. ${pad()}`;
  assert.ok(typesOf(text).has('crowd-contrast'));
});

test('crowd-contrast does not fire on ordinary simultaneity', () => {
  const text = `She read the report while everyone else watched the game in the next room. ${pad()}`;
  assert.ok(!typesOf(text).has('crowd-contrast'));
});

// ── fake-casual-prop ─────────────────────────────────────────────────
test('fake-casual-prop fires on theatrical asterisk stage directions', () => {
  const text = `*chef's kiss* this release is exactly what the team needed this quarter. ${pad()}`;
  assert.ok(typesOf(text).has('fake-casual-prop'));
});

// ── performed-insight ────────────────────────────────────────────────
test('performed-insight fires on "Turns out" sentence-initial and "not nothing"', () => {
  const text = `Turns out the fix was simpler than expected. That is not nothing. ${pad()}`;
  assert.ok(typesOf(text).has('performed-insight'));
});

// ── negation-chain ───────────────────────────────────────────────────
test('negation-chain fires on a sentence-initial three-item "No X, no Y, no Z" chain', () => {
  const text = `No fluff, no filler, no jargon. Just the numbers we shipped this quarter. ${pad()}`;
  assert.ok(typesOf(text).has('negation-chain'));
});

test('negation-chain does not fire on the idiomatic "no more, no less"', () => {
  const text = `We delivered exactly what was promised, no more, no less, this cycle. ${pad()}`;
  assert.ok(!typesOf(text).has('negation-chain'));
});

// ── dev-blog-boilerplate ─────────────────────────────────────────────
test('dev-blog-boilerplate fires on "it just works" / "zero-config" / "sane defaults"', () => {
  const text = `It just works, with zero-config setup and sane defaults out of the box. ${pad()}`;
  assert.ok(typesOf(text).has('dev-blog-boilerplate'));
});

// ── AI_CITATION_MARKUP: new leak fingerprints ───────────────────────
test('ai-citation-markup fires on Gemini [cite: N] leak', () => {
  const text = `The answer is documented [cite: 1] in the source material. ${pad()}`;
  assert.ok(typesOf(text).has('ai-citation-markup'));
});

test('ai-citation-markup fires on Gemini span markers', () => {
  const text = `See the passage [span_1](start_span) here [span_1](end_span) for context. ${pad()}`;
  assert.ok(typesOf(text).has('ai-citation-markup'));
});

test('ai-citation-markup fires on Grok citation-card leak', () => {
  const text = `The raw output still had grok_render_citation_card_json embedded in it. ${pad()}`;
  assert.ok(typesOf(text).has('ai-citation-markup'));
});

test('ai-citation-markup fires on Perplexity file-upload leak', () => {
  const text = `The response referenced ppl-ai-file-upload as part of its pipeline. ${pad()}`;
  assert.ok(typesOf(text).has('ai-citation-markup'));
});

// ── Ported engine fixes ──────────────────────────────────────────────
test('hedge-stack requires at most one word between modal and hedge', () => {
  const text = `This could potentially change everything for the roadmap this year. ${pad()}`;
  assert.ok(typesOf(text).has('hedge-stack'));
});

test('hedge-stack never fires across a negator', () => {
  const text = `This could not potentially change anything for the roadmap this year. ${pad()}`;
  assert.ok(!typesOf(text).has('hedge-stack'));
});

test('title-case-header requires an interior function word, not a leading one', () => {
  const leading = `## The Great Gatsby\n\n${pad()}`;
  const interior = `## Building And Deploying The Service\n\n${pad()}`;
  assert.ok(!typesOf(leading).has('title-case-header'), 'leading function word should not fire');
  assert.ok(typesOf(interior).has('title-case-header'), 'interior function word should fire');
});

test('title-case-header strips an optional markdown heading prefix before the word-count guard', () => {
  const text = `### Migrating And Scaling The Platform\n\n${pad()}`;
  assert.ok(typesOf(text).has('title-case-header'));
});

test('hashtag-stuff masks fenced code and ignores all-digit / hex-with-digit / #include forms', () => {
  const text = `See issue #1 #2 #3 #4 #5 #6 for details, plus colours #1a2b3c #4d5e6f. ${pad()}`;
  assert.ok(!typesOf(text).has('hashtag-stuff'), 'numeric refs and hex colours should not count');
});

test('hashtag-stuff still fires on a real social hashtag block', () => {
  const text = `#one #two #three #four #five #six trending right now across the feed. ${pad()}`;
  assert.ok(typesOf(text).has('hashtag-stuff'));
});

test('tier lookups use Object.hasOwn so "constructor" cannot false-positive via the prototype chain', () => {
  const text = `The constructor for this class takes three arguments and validates each one. ${pad()}`;
  const r = AIDetector.analyzeText(text);
  const tier1Hit = r.issues.some((i) => i.type === 'tier1' && i.text === 'constructor');
  const tier2Hit = r.issues.some((i) => i.type === 'tier2' && i.text === 'constructor');
  assert.ok(!tier1Hit && !tier2Hit, 'constructor must never be reported as a tier hit');
});

test('load-bearing phrase fires only before an abstract noun', () => {
  const abstractNoun = `This is a load-bearing assumption in our current design. ${pad()}`;
  const physicalNoun = `The load-bearing wall needs reinforcement before the renovation. ${pad()}`;
  const abstractHit = AIDetector.analyzeText(abstractNoun).issues.some(
    (i) => i.type === 'tier1' && i.text.toLowerCase().startsWith('load-bearing'),
  );
  const physicalHit = AIDetector.analyzeText(physicalNoun).issues.some(
    (i) => i.type === 'tier1' && i.text.toLowerCase().startsWith('load-bearing'),
  );
  assert.ok(abstractHit, 'load-bearing before "assumption" should fire');
  assert.ok(!physicalHit, 'load-bearing before "wall" should not fire');
});

test('"quietly" is Tier 2 (clusters, not always-flag)', () => {
  const text = `She quietly closed the door. He resonates with the idea in the same paragraph. ${pad()}`;
  const r = AIDetector.analyzeText(text);
  const quietlyHit = r.issues.find((i) => i.type === 'tier2' && i.text === 'quietly');
  assert.ok(quietlyHit, 'expected quietly to appear as a tier2 hit');
});

test('"deeply" is Tier 2 only in a significance collocation ("deeply integrated"), not bare use', () => {
  const bare = `The config is deeply nested inside three levels of JSON. She cares deeply about this. ${pad()}`;
  const collocation = `The new hire is deeply integrated with the platform team already. He resonates with the plan too. ${pad()}`;
  assert.ok(
    !typesOf(bare).has('tier2') ||
      !AIDetector.analyzeText(bare).issues.some((i) => i.text === 'deeply'),
    'bare "deeply" uses should not count toward tier2',
  );
  const collocationHit = AIDetector.analyzeText(collocation).issues.some(
    (i) => i.type === 'tier2' && i.text === 'deeply',
  );
  assert.ok(collocationHit, 'expected "deeply integrated" to count toward tier2');
});

test('"verbatim" is Tier 3 (density-gated)', () => {
  const text = `${'He copied it verbatim. '.repeat(5)}${pad()}`;
  const r = AIDetector.analyzeText(text);
  const verbatimHit = r.issues.some(
    (i) => i.type === 'tier3' && i.text.toLowerCase().includes('verbatim'),
  );
  assert.ok(verbatimHit, 'expected verbatim to be flagged as an overused tier3 word');
});

// ── aiscrub divergences must survive the port ────────────────────────
test('em dashes stay always-flagged at the current weight (no upstream score-neutral carve-out)', () => {
  const text = `The launch went well — better than expected — and the team is pleased. ${pad()}`;
  const { ISSUE_WEIGHTS } = require('../engine/constants');
  assert.equal(ISSUE_WEIGHTS['em-dash'], 6, 'em-dash weight must remain 6, not upstream 0');
  assert.ok(typesOf(text).has('em-dash'), 'em dash should still be flagged');
});

test('echo stays a flag-only, weight-0 signal', () => {
  const { ISSUE_WEIGHTS } = require('../engine/constants');
  assert.equal(ISSUE_WEIGHTS['echo'], 0, 'echo weight must remain 0');
});
