// Trinary classifier + label/color helpers + V2-contract defaults.

// V2 contract defaults so early-exit paths (Empty/tooShort/tooLong)
// still return the same field shape a v2 consumer expects. Without
// this, `result.document_classification === 'AI_ONLY'` is `undefined`
// on edge inputs and fails open.
// UNSCORED is returned on empty / too-short / too-long inputs where
// we declined to score. Distinct from HUMAN_ONLY (which is a positive
// classification) so a caller can't mistake a refused scan for a
// confident human verdict — a 50k-word LLM-generated document is
// not "human", it's just outside our scoring window.
function buildV2Defaults(classification, confidence) {
  const probs =
    classification === 'HUMAN_ONLY'
      ? { human: 1, mixed: 0, ai: 0 }
      : classification === 'AI_ONLY'
        ? { human: 0, mixed: 0, ai: 1 }
        : { human: 0.333, mixed: 0.334, ai: 0.333 };
  return {
    document_classification: classification,
    class_probabilities: probs,
    confidence_category: confidence,
    highlight_sentence_for_ai: [],
  };
}

// FN-biased: false positives damage trust more than false negatives,
// so MIXED is wide and AI_ONLY requires multiple signals.
// See docs/engine-history.md#trinary-calibration for the GPTZero basis.
function classifyTrinary({ score, issues, normFlags, wordCount, denseAIVocab }) {
  // Strong corroborators — each is near-dispositive on its own:
  //   - cutoff-disclaimer (LLM self-identifies as an AI)
  //   - reasoning-artifact + chatbot-artifact co-occurrence
  //   - normalization-flag at threshold (≥2 ZWSP or homoglyphs).
  //     Threshold parity prevents a single stray ZWSP in copy-paste
  //     from Word/Notion from flipping to AI_ONLY at score 0.
  //   - denseAIVocab: ≥4 distinct tier1 hits AND ≥1 tier2 cluster AND
  //     ≥1 transition phrase — the trifecta that saturated ChatGPT
  //     prose triggers without needing whitelisted stylometric hits.
  const hasCutoff = issues.some((i) => i.type === 'cutoff-disclaimer');
  const hasNormFlag = normFlags.zeroWidth >= 2 || normFlags.homoglyph >= 2;
  const hasReasoning = issues.some((i) => i.type === 'reasoning-artifact');
  const hasChatbot = issues.some((i) => i.type === 'chatbot');
  const strongCorrob =
    (hasCutoff ? 1 : 0) +
    (hasNormFlag ? 1 : 0) +
    (hasReasoning && hasChatbot ? 1 : 0) +
    (denseAIVocab ? 1 : 0);

  // Weak (stylometric) corroborators — suggestive on their own,
  // dispositive in combination. Smart-punct-signature matches
  // Word-edited human prose so doesn't count without other support.
  const stylometricHits = [
    'punct-distribution',
    'cross-para-burstiness',
    'fnword-trigram-entropy',
  ].filter((t) => issues.some((i) => i.type === t)).length;
  const hasSmartPunct = issues.some((i) => i.type === 'smart-punct-signature');
  const weakCorrob = (stylometricHits >= 2 ? 1 : 0) + (hasSmartPunct ? 1 : 0);

  // Thresholds:
  //   score < 15 with no strong → HUMAN_ONLY
  //   strong ≥ 1 OR score ≥ 70 → AI_ONLY (lowered from 80; high
  //     density of AI vocab is sufficient evidence)
  //   score ≥ 40 with any corroborator → AI_ONLY
  //   everything else with score ≥ 15 → MIXED
  const totalCorrob = strongCorrob + weakCorrob;
  let classification;
  if (score < 15 && strongCorrob === 0) classification = 'HUMAN_ONLY';
  else if (strongCorrob >= 1 || score >= 70) classification = 'AI_ONLY';
  else if (score >= 40 && totalCorrob >= 1) classification = 'AI_ONLY';
  else classification = 'MIXED';

  // Humanizer-flag escalation: presence of bypass-trick chars is
  // adversarial signal. If a normalization-flag fired we already
  // counted it in strongCorrob → AI_ONLY. Confidence also gets a
  // floor of 'medium' in that case (an adversary actively evading
  // detection should never read as low-confidence noise).

  // Soft probability distribution. Not calibrated against a labeled
  // corpus yet. Largest class is computed as `1 - others` after
  // rounding to guarantee sum=1 exactly. Sub-1% drift would otherwise
  // hide in toFixed.
  const aiSoft = Math.min(0.97, score / 100 + totalCorrob * 0.06 + strongCorrob * 0.08);
  let p;
  if (classification === 'HUMAN_ONLY')
    p = {
      human: Math.max(0.6, 1 - aiSoft),
      mixed: Math.min(0.35, aiSoft * 0.8),
      ai: Math.min(0.1, aiSoft * 0.3),
    };
  else if (classification === 'AI_ONLY')
    p = { human: Math.max(0.02, 1 - aiSoft - 0.05), mixed: 0.1, ai: aiSoft };
  else p = { human: Math.max(0.15, 0.6 - aiSoft * 0.5), mixed: 0.5, ai: aiSoft * 0.7 };
  const rawSum = p.human + p.mixed + p.ai;
  p.human = +(p.human / rawSum).toFixed(3);
  p.mixed = +(p.mixed / rawSum).toFixed(3);
  // Assign ai as the remainder so the three values sum to exactly 1.
  // Clamp to >= 0 in case rounding pushes human+mixed above 1 (the
  // remainder would otherwise show as -0 or -0.001 — surfaces as a
  // negative percentage in any UI doing Math.round(p.ai * 100)).
  p.ai = Math.max(0, +(1 - p.human - p.mixed).toFixed(3));
  const probabilities = p;

  // Confidence band:
  //   high   — strongCorrob ≥ 2, OR cutoff-disclaimer, OR score < 8 (clean long doc)
  //   medium — strongCorrob ≥ 1, OR score ≥ 45 with weak corroborator, OR score < 20
  //   low    — everything else
  let confidence;
  if (strongCorrob >= 2 || hasCutoff || (score < 8 && wordCount >= 100)) confidence = 'high';
  else if (strongCorrob >= 1 || (score >= 45 && weakCorrob >= 1) || score < 20)
    confidence = 'medium';
  else confidence = 'low';

  return { classification, probabilities, confidence };
}

function getLabel(score) {
  if (score === 0) return 'Clean';
  if (score <= 15) return 'Minimal AI signals';
  if (score <= 35) return 'Some AI patterns';
  if (score <= 60) return 'Moderate AI signals';
  if (score <= 80) return 'Strong AI signals';
  return 'Heavy AI patterns';
}

function getColor(score) {
  if (score <= 15) return '#44bb66';
  if (score <= 35) return '#88bb44';
  if (score <= 60) return '#ddaa00';
  if (score <= 80) return '#ff8833';
  return '#ff4444';
}

module.exports = { classifyTrinary, buildV2Defaults, getLabel, getColor };
