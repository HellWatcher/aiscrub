const assert = require('node:assert/strict');
const AIDetector = require('../patterns.js');
const { test } = require('./_harness');

console.log('Trinary fixtures');

test('v2: trinary output present + FN-biased for ambiguous text', () => {
  // A plain human bug-report should not get AI_ONLY even if score lifts.
  const text =
    'The build broke again this morning. Rolled back the auth refactor and tests pass now. Still need to figure out why the token refresh path hits a 401 for users on Safari but not Firefox — probably a cookie scope issue but I want to confirm before shipping a fix.';
  const r = AIDetector.analyzeText(text);
  assert.ok(r.document_classification, 'expected document_classification field');
  assert.ok(
    ['HUMAN_ONLY', 'MIXED'].includes(r.document_classification),
    `human prose got ${r.document_classification}`,
  );
  assert.ok(r.class_probabilities, 'expected class_probabilities');
  const sum = r.class_probabilities.human + r.class_probabilities.mixed + r.class_probabilities.ai;
  assert.ok(Math.abs(sum - 1) < 0.02, `probabilities should sum to ~1, got ${sum}`);
  assert.ok(
    ['high', 'medium', 'low'].includes(r.confidence_category),
    'expected confidence_category',
  );
});

test('v2: highly AI-marked text reaches AI_ONLY with corroborators', () => {
  // High score + cutoff disclaimer (corroborator) → AI_ONLY at high confidence.
  const text = [
    "As of my last update, I don't have access to real-time data. In the rapidly evolving world of decentralized finance, we delve into the intricate tapestry of innovation.",
    'This seamless, robust paradigm showcases a comprehensive framework. Moreover, it truly is a game-changer that underscores how we navigate the complexities of modern AI.',
    'Furthermore, this pivotal moment marks a watershed for the industry. Let me think step by step about how to approach this systematically. I hope this helps!',
  ].join(' ');
  const r = AIDetector.analyzeText(text);
  assert.equal(
    r.document_classification,
    'AI_ONLY',
    `expected AI_ONLY, got ${r.document_classification} (score=${r.score})`,
  );
  assert.ok(
    ['medium', 'high'].includes(r.confidence_category),
    `expected medium/high confidence, got ${r.confidence_category}`,
  );
});

test('v2: highlight_sentence_for_ai returns regions with start/end offsets', () => {
  const text =
    'In the rapidly evolving world of AI, we delve into the intricate tapestry. This is a robust, comprehensive paradigm. Plain second paragraph here is just normal prose without any of the tells. The team shipped a fix on Monday afternoon after the rollback completed successfully.';
  const r = AIDetector.analyzeText(text);
  assert.ok(Array.isArray(r.highlight_sentence_for_ai), 'expected highlight array');
  if (r.highlight_sentence_for_ai.length > 0) {
    const region = r.highlight_sentence_for_ai[0];
    assert.ok(typeof region.start === 'number', 'region has start offset');
    assert.ok(typeof region.end === 'number', 'region has end offset');
    assert.ok(region.end > region.start, 'end > start');
    assert.ok(
      typeof region.score === 'number' && region.score >= 0 && region.score <= 1,
      'region.score 0-1',
    );
  }
});

test('v2: mid-score isolated stylometric hits do not reach AI_ONLY', () => {
  // Pins the FN-bias contract with fail-loud preconditions. If the corpus
  // drifts and the preconditions break, the test fails on the precondition
  // assertion (not silently passes). Text designed to have NO strong
  // corroborators: no cutoff disclaimer, no chatbot artifact, no homoglyph,
  // no dense-vocab trifecta. Should classify HUMAN_ONLY or MIXED.
  const text =
    'The team continues making progress on the platform. The framework supports many needs. Building collaboration across teams stays important. Improving the deployment path is a goal. The setup gives everyone a foundation.';
  const r = AIDetector.analyzeText(text);
  const hasCutoff = r.issues.some((i) => i.type === 'cutoff-disclaimer');
  const hasReasonChat =
    r.issues.some((i) => i.type === 'reasoning-artifact') &&
    r.issues.some((i) => i.type === 'chatbot');
  const hasNorm = r.issues.some((i) => i.type === 'normalization-flag');
  // Preconditions: assert the test corpus matches the no-strong-corroborator
  // shape. If these fail, the corpus drifted and the test is meaningless.
  assert.ok(!hasCutoff, 'precondition: corpus should not trigger cutoff-disclaimer');
  assert.ok(!hasReasonChat, 'precondition: corpus should not trigger reasoning+chatbot');
  assert.ok(!hasNorm, 'precondition: corpus should not trigger normalization-flag');
  assert.ok(r.score < 70, `precondition: corpus score should be < 70, got ${r.score}`);
  // Contract: without strong corroborators and below the score-only threshold,
  // never AI_ONLY.
  assert.notEqual(
    r.document_classification,
    'AI_ONLY',
    `no-strong-corroborator below score 70 should not be AI_ONLY, got ${r.document_classification} at score ${r.score}`,
  );
});

test('v2: humanizer bypass escalates to AI_ONLY (normalization-flag corroborator)', () => {
  const zwsp = '​';
  const text = `In tоday's landscape we del${zwsp}ve into the intricate tap${zwsp}estry of innovátion. This seamless, robust paradigm showcases comprehensive frameworks. The framework underscores how organizations harness cutting-edge tools to navigate complexities across the ecosystem.`;
  const r = AIDetector.analyzeText(text);
  assert.equal(
    r.document_classification,
    'AI_ONLY',
    `bypass should reach AI_ONLY, got ${r.document_classification}`,
  );
  assert.ok(
    ['medium', 'high'].includes(r.confidence_category),
    `bypass should not be low-confidence, got ${r.confidence_category}`,
  );
});

test('v2: canonical saturated-AI essay reaches AI_ONLY (calibration regression)', () => {
  // Regression for review finding: pre-recalibration this text scored
  // ~47/MIXED. AI_ONLY was effectively dead code. Threshold now lets
  // a saturated essay actually fire.
  const text =
    "In today's rapidly evolving landscape, we delve into the intricate tapestry of decentralized finance. It is important to note that this seamless, robust paradigm showcases a comprehensive framework. Moreover, this transformative ecosystem leverages cutting-edge protocols to navigate the complex multifaceted challenges of modern finance. Furthermore, the integration of innovative solutions underscores how pivotal this moment is. The future looks bright for those who embrace these emerging opportunities. By harnessing the power of blockchain technology, organizations can foster unprecedented growth and catalyze meaningful change across the ecosystem.";
  const r = AIDetector.analyzeText(text);
  assert.equal(
    r.document_classification,
    'AI_ONLY',
    `saturated essay should AI_ONLY, got ${r.document_classification} at score ${r.score}`,
  );
});

test('v2: dense-AI-vocab trifecta reaches AI_ONLY (calibration regression)', () => {
  // Saturated ChatGPT prose without cutoff/chatbot/normalization should
  // still reach AI_ONLY via the dense-AI-vocab strong corroborator
  // (≥4 tier1 distinct + tier2 cluster + transition). Round-1 left this
  // class of essay stuck at MIXED.
  const text =
    'In the rapidly evolving world of decentralized finance, organizations leverage robust and comprehensive frameworks. Moreover, this seamless paradigm enables them to navigate the intricate tapestry of modern challenges. Furthermore, they harness cutting-edge tools to foster sustainable growth and catalyze transformative change. Additionally, the platform showcases meticulous attention to user experience across the ecosystem.';
  const r = AIDetector.analyzeText(text);
  assert.equal(
    r.document_classification,
    'AI_ONLY',
    `dense AI vocab should AI_ONLY, got ${r.document_classification} at score ${r.score}`,
  );
});

test('v2: real Rust technical post does NOT classify AI_ONLY (denseAIVocab FP fix)', () => {
  // Round-3 regression: pre-fix this scored AI_ONLY at 30 because
  // denseAIVocab required only 4 tier1 + 1 tier2 cluster + transition,
  // which legitimate dense-jargon technical writing trips. Threshold
  // raised to 5 tier1 + 2 tier2 clusters + 150-word gate.
  const text =
    'Rust offers a robust and comprehensive approach to systems programming. Engineers leverage zero-cost abstractions to navigate intricate memory hierarchies without runtime overhead. The borrow checker provides meticulous compile-time guarantees that catch entire categories of bugs. Furthermore, the type system encourages a holistic approach to API design where contracts are explicit. The ecosystem around cargo, crates.io, and the Rust toolchain has matured significantly over the past five years, with libraries spanning embedded systems, web servers, and game engines.';
  const r = AIDetector.analyzeText(text);
  assert.notEqual(
    r.document_classification,
    'AI_ONLY',
    `Rust tech post should not classify AI_ONLY, got ${r.document_classification} at score ${r.score}`,
  );
});

test('v2: canonical "As an AI language model" disclaimer fires cutoff-disclaimer + AI_ONLY', () => {
  // Round-3 finding: this canonical LLM self-id phrase was missing
  // entirely from CUTOFF_DISCLAIMERS.
  const text =
    'As an AI language model, I cannot provide legal advice on this matter. However, I can suggest you consult a licensed attorney. The general principle is that contract law varies by jurisdiction and specific facts matter.';
  const r = AIDetector.analyzeText(text);
  const types = new Set(r.issues.map((i) => i.type));
  assert.ok(
    types.has('cutoff-disclaimer'),
    'expected cutoff-disclaimer flag on AI language model self-id',
  );
  assert.equal(
    r.document_classification,
    'AI_ONLY',
    `expected AI_ONLY on canonical disclaimer, got ${r.document_classification}`,
  );
  assert.equal(
    r.confidence_category,
    'high',
    `expected high confidence on canonical disclaimer, got ${r.confidence_category}`,
  );
});
