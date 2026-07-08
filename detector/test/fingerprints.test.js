const assert = require('node:assert/strict');
const AIDetector = require('../patterns.js');
const { test } = require('./_harness');

console.log('Fingerprint fixtures');

test('ai-placeholder fires on common slot-fill bracket patterns', () => {
  // The canonical AI-generated boilerplate that users paste without
  // filling in. Each shape is enough on its own. Catches the "[Your
  // Name]" family, dated stubs, and HTML comment placeholders.
  for (const text of [
    'Dear [Recipient], I am writing regarding [Topic of Discussion].',
    'Last updated 2025-XX-XX. Authors: [INSERT TEAM NAMES HERE].',
    'See the report from XX/XX/2024 for context.',
    '<!-- TODO: add citation when paper publishes -->',
    '<!-- fill in the missing section before shipping -->',
  ]) {
    const r = AIDetector.analyzeText(text + ' Additional padding text to clear the word-count gate. '.repeat(2));
    const types = new Set(r.issues.map((i) => i.type));
    assert.ok(types.has('ai-placeholder'), `expected ai-placeholder for: ${text}`);
  }
});

test('ai-placeholder does not fire on legitimate bracketed content', () => {
  // Real bracketed content — citations, optional matches, code
  // references — should NOT trip the placeholder regex. The pattern
  // is gated on placeholder VERBS (Your/Insert/Add/Describe/etc.).
  const text = 'The release notes for [v1.2.3] cover the [auth.refresh] path and reference [@example/user]. We saw it on commit [a3f7b21]. Padding text to clear the word-count gate so the analyzer runs the full pass cleanly.';
  const r = AIDetector.analyzeText(text);
  const types = new Set(r.issues.map((i) => i.type));
  assert.ok(!types.has('ai-placeholder'), `expected no ai-placeholder, got: ${[...types].join(', ')}`);
});

test('ai-citation-markup fires on chatbot-internal tokens', () => {
  // Each of these is a near-definitive fingerprint of a specific
  // chat tool. Their presence is proof of copy-paste origin.
  for (const text of [
    'The school has been recognized as an international centre. citeturn0search1 More details below.',
    'See the appendix contentReference[oaicite:3]{index=3} for the data.',
    'According to the source oai_citation provided by the model, the figure is 12.',
    'The user uploaded [attached_file:1] for review.',
    'The grok_card here links to the relevant policy. ' + 'Padding text to clear the gate. '.repeat(3),
  ]) {
    const r = AIDetector.analyzeText(text + ' '.repeat(0) + 'Padding text to clear the word-count gate. '.repeat(2));
    const types = new Set(r.issues.map((i) => i.type));
    assert.ok(types.has('ai-citation-markup'), `expected ai-citation-markup for: ${text.slice(0, 50)}...`);
  }
});

test('ai-utm-source fires on AI-tool tracking parameters', () => {
  // utm_source values that AI tools auto-append to URLs they generate.
  // Each one is essentially proof the URL came out of a chatbot.
  for (const text of [
    'See https://example.com/article?utm_source=chatgpt.com for the source.',
    'Link: https://example.com/?utm_source=copilot.com&utm_medium=referral',
    'https://docs.example.com/page?utm_source=claude.ai is the canonical reference.',
    'Reference URL: https://example.com/post?utm_source=perplexity.ai found via search.',
    'Article: https://example.com/blog?referrer=grok.com via the link.',
  ]) {
    const r = AIDetector.analyzeText(text + ' Padding text to clear the word-count gate so the analyzer runs cleanly across all categories.');
    const types = new Set(r.issues.map((i) => i.type));
    assert.ok(types.has('ai-utm-source'), `expected ai-utm-source for: ${text.slice(0, 60)}...`);
  }
});

test('ai-utm-source does not fire on benign utm_source values', () => {
  // Real marketing UTMs from non-AI sources should not flag.
  const text = 'See https://example.com/article?utm_source=newsletter for the source. Padding text to clear the word-count gate so the analyzer runs the full pass cleanly across all categories without surprises.';
  const r = AIDetector.analyzeText(text);
  const types = new Set(r.issues.map((i) => i.type));
  assert.ok(!types.has('ai-utm-source'), 'newsletter UTM should not flag as AI source');
});
