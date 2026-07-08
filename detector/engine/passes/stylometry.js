const { getSentences, countWords } = require('../text-utils');

// Stylometric passes: smart-punct signature, punctuation-distribution,
// function-word trigram entropy, cross-paragraph burstiness, low TTR,
// sentence-length uniformity, paragraph-length uniformity.
function runStylometryPass({ text, wordCount, tokens, paragraphs, sentences }) {
  const issues = [];

  // ── Smart-punctuation co-occurrence signature ────────────────────
  // Curly quotes + em-dash + Oxford comma all present + zero typos
  // (no double-spaces, no missing apostrophes in common contractions)
  // is a near-dispositive paste-from-LLM signature: humans typing
  // directly into a textarea don't produce all four. Standalone any of
  // these is meaningless — co-occurrence is the signal.
  {
    const hasCurly = /[“”‘’]/.test(text);
    const hasEmDash = /—/.test(text);
    const oxfordHit = text.match(/\b\w+,\s+\w+,\s+and\s+\w+/g);
    const hasOxford = (oxfordHit?.length || 0) >= 1;
    const doubleSpaces = (text.match(/[^.!?]  +/g) || []).length;
    const missingApos = /\b(?:dont|wont|cant|isnt|wasnt|shouldnt|wouldnt|couldnt|youre|theyre|its\s+a\s+\w+ing)\b/i.test(text);
    const clean = doubleSpaces === 0 && !missingApos;
    const signals = [hasCurly, hasEmDash, hasOxford, clean].filter(Boolean).length;
    if (signals >= 4 && wordCount >= 80) {
      issues.push({
        type: 'smart-punct-signature',
        text: 'curly-quotes + em-dash + Oxford comma + zero typos',
        severity: 'high',
        suggestion: 'Smart-punctuation signature consistent with LLM output. Humans typing into textareas rarely produce all four.',
      });
    }
  }

  // ── Punctuation distribution mode ────────────────────────────────
  // Humans cluster trimodal across paragraphs (some paras heavy, some
  // light, some none). AI converges on a normal distribution. We can't
  // run a real modality test client-side, but we can flag the AI
  // signature: low variance of per-paragraph punctuation density.
  // Requires ≥4 paragraphs to be meaningful.
  if (paragraphs.length >= 4) {
    const densities = paragraphs.map((p) => {
      const words = (p.match(/\S+/g) || []).length;
      if (words < 5) return null;
      const puncts = (p.match(/[,;:—()]/g) || []).length;
      return puncts / words;
    }).filter((d) => d !== null);
    if (densities.length >= 4) {
      const mean = densities.reduce((a, b) => a + b, 0) / densities.length;
      const variance = densities.reduce((s, d) => s + (d - mean) ** 2, 0) / densities.length;
      const cv = mean > 0 ? Math.sqrt(variance) / mean : 0;
      // CV < 0.25 across paragraphs means each paragraph has the same
      // punctuation density — the AI signature. Humans usually swing
      // wider. Threshold derived from stylometry papers (arxiv 2507.00838).
      if (cv < 0.25 && mean >= 0.04) {
        issues.push({
          type: 'punct-distribution',
          text: `Punctuation density uniform across paragraphs (CV=${cv.toFixed(2)})`,
          severity: 'medium',
          suggestion: 'AI text holds punctuation density steady; human writers swing between dense and sparse paragraphs.',
        });
      }
    }
  }

  // ── Function-word trigram entropy ────────────────────────────────
  // POS-trigram entropy is the academic signal; function-word trigram
  // entropy approximates it without a tagger (function words ARE the
  // closed-class POS classes). AI text has lower entropy because LLM
  // sampling collapses onto a narrower set of grammatical templates.
  //
  // Method: extract function-word indicators per sentence, build
  // trigrams over the sequence, compute Shannon entropy. Bins below
  // threshold flag.
  if (wordCount >= 150) {
    const FUNC_WORDS = new Set([
      'the','a','an','and','or','but','of','to','in','on','at','by','for','with',
      'from','as','is','was','are','were','be','been','being','have','has','had',
      'do','does','did','will','would','should','could','may','might','must','can',
      'this','that','these','those','it','its','they','them','their','there','here',
      'we','our','us','i','you','your','he','she','his','her','him','not','no','so',
      'if','then','than','when','where','which','who','what','how','why','because',
    ]);
    const seq = tokens.map((t) => FUNC_WORDS.has(t) ? t : '_').filter((_, i, arr) => arr[i] !== '_' || (i > 0 && arr[i - 1] !== '_'));
    if (seq.length >= 50) {
      const trigrams = {};
      for (let i = 0; i < seq.length - 2; i++) {
        const tg = `${seq[i]}|${seq[i + 1]}|${seq[i + 2]}`;
        trigrams[tg] = (trigrams[tg] || 0) + 1;
      }
      const total = seq.length - 2;
      let entropy = 0;
      for (const c of Object.values(trigrams)) {
        const p = c / total;
        entropy -= p * Math.log2(p);
      }
      // Normalize by log2(distinct trigrams) so entropy ranges roughly
      // 0..1 and threshold is interpretable. Empirical threshold: human
      // prose ~0.85-0.95 normalized, AI prose ~0.70-0.82.
      const distinctCount = Object.keys(trigrams).length;
      const normalized = distinctCount > 1 ? entropy / Math.log2(distinctCount) : 1;
      if (normalized < 0.82 && total >= 50) {
        issues.push({
          type: 'fnword-trigram-entropy',
          text: `Function-word trigram entropy ${normalized.toFixed(2)} (low)`,
          severity: 'medium',
          suggestion: 'Grammatical structure is unusually repetitive. AI sampling collapses onto narrower templates than human writing.',
        });
      }
      // Degenerate case: single distinct trigram repeated across the
      // whole document is the strongest possible AI signal but the
      // normalized fallback returns 1.0 (= "fully human"), inverting
      // the signal. Catch it explicitly.
      if (distinctCount === 1 && total >= 50) {
        issues.push({
          type: 'fnword-trigram-entropy',
          text: 'Single function-word trigram repeated across document',
          severity: 'high',
          suggestion: 'Grammatical structure is fully degenerate — every clause uses the same function-word skeleton.',
        });
      }
    }
  }

  // ── Cross-paragraph burstiness ───────────────────────────────────
  // We already check within-paragraph sentence-length uniformity. AI
  // is also flat ACROSS paragraphs — every paragraph has roughly the
  // same sentence-length variance. Humans vary: terse paras next to
  // discursive paras. Measure variance of CV across paragraphs.
  if (paragraphs.length >= 4) {
    const cvs = paragraphs.map((p) => {
      const sents = getSentences(p);
      if (sents.length < 3) return null;
      const lens = sents.map(countWords);
      const m = lens.reduce((a, b) => a + b, 0) / lens.length;
      if (m === 0) return null;
      const v = lens.reduce((s, l) => s + (l - m) ** 2, 0) / lens.length;
      return Math.sqrt(v) / m;
    }).filter((c) => c !== null);
    if (cvs.length >= 4) {
      const cvMean = cvs.reduce((a, b) => a + b, 0) / cvs.length;
      const cvVar = cvs.reduce((s, c) => s + (c - cvMean) ** 2, 0) / cvs.length;
      const cvStd = Math.sqrt(cvVar);
      // Std-of-CV below 0.08 means every paragraph has roughly the same
      // internal rhythm — AI signature. Human prose typically swings
      // 0.15-0.40 across paragraphs of mixed purpose.
      if (cvStd < 0.08 && cvMean < 0.45) {
        issues.push({
          type: 'cross-para-burstiness',
          text: `Sentence-rhythm uniform across paragraphs (σCV=${cvStd.toFixed(2)})`,
          severity: 'medium',
          suggestion: 'Every paragraph has the same internal rhythm. Humans vary cadence between terse and discursive paragraphs.',
        });
      }
    }
  }

  // ── 23. Sentence length uniformity ───────────────────────────
  if (sentences.length >= 5) {
    const lengths = sentences.map(s => countWords(s));
    const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((sum, l) => sum + Math.pow(l - avg, 2), 0) / lengths.length;
    const stdDev = Math.sqrt(variance);
    const cv = avg > 0 ? stdDev / avg : 0;

    if (cv < 0.25 && avg > 10) {
      issues.push({
        type: 'uniformity',
        text: `Sentence lengths cluster around ${Math.round(avg)} words (low variation)`,
        severity: 'medium',
        suggestion: 'Mix short punchy sentences with longer flowing ones',
      });
    }
  }

  // ── Type-token ratio (stylometric — vocabulary diversity) ────
  // TTR = distinct word types / total tokens. Human prose at 200+
  // words typically sits around 0.50–0.65 for English; AI prose
  // tends flatter (0.55–0.75 looks normal, but the lower end of the
  // *too-flat* tail at >=200 words is where the signal lives — too
  // FEW unique words for the length). This is the simplest of the
  // four stylometric signals identified in the May 2026 detection-
  // research review (docs/competitive/detection-research.md): no
  // POS tagger required, no model, pure JS.
  //
  // Threshold tuning: flag only when the sample is large enough
  // that low TTR is meaningfully suspicious (>=200 tokens) AND TTR
  // is below 0.40 (very vocabulary-poor). Conservative on purpose;
  // false positives on short or topic-narrow human prose are easy
  // to trigger and would drown out other signals. The detector-
  // research lens flagged TTR as one of four stylometric add-ons;
  // POS-bigram log-odds, function-word z-scores, and sentence-
  // length burstiness are still TODO.
  if (tokens.length >= 200) {
    const unique = new Set(tokens).size;
    const ttr = unique / tokens.length;
    if (ttr < 0.4) {
      issues.push({
        type: 'low-ttr',
        text: `Vocabulary diversity ${(ttr * 100).toFixed(1)}% (${unique} unique / ${tokens.length} tokens)`,
        severity: 'low',
        suggestion: 'Text reuses a narrow word set. Vary nouns and verbs deliberately, or check if the topic genuinely warrants the repetition.',
      });
    }
  }

  // ── 24. Paragraph length uniformity ──────────────────────────
  if (paragraphs.length >= 4) {
    const paraLengths = paragraphs.map(p => getSentences(p).length);
    const avg = paraLengths.reduce((a, b) => a + b, 0) / paraLengths.length;
    const allSimilar = paraLengths.every(l => Math.abs(l - avg) <= 1);
    if (allSimilar && avg >= 3) {
      issues.push({
        type: 'uniformity',
        text: `All paragraphs are ~${Math.round(avg)} sentences`,
        severity: 'low',
        suggestion: 'Vary paragraph length deliberately',
      });
    }
  }

  return issues;
}

module.exports = { runStylometryPass };
