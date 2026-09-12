# Engine history

Engineering provenance trimmed from the inline comments in `detector/engine/`.
The source files keep the notes that help you read the *current* code; the
dated audits, round-by-round fix narratives, version references, external
citations, and roadmap items live here so nothing is lost. Each section maps to
a `see docs/engine-history.md#…` pointer left in the source.

## AI-tool fingerprints

The three AI-tool fingerprint detectors (`ai-placeholder`, `ai-citation-markup`,
`ai-utm-source`) were adapted from Aboudjem/humanizer-skill P33-P35, found in a
May 2026 audit of that skill upstream (the audit notes were not vendored). Unlike the
statistical patterns, a single hit on any of these is strong evidence because
the AI tool literally left its fingerprint in the text.

## Emotional-flatline / openers

- The bare `Interesting X:` section-header shape (the second matched shape of
  the "interesting (part|thing|aspect|piece)" family) is the section-break
  variant that slipped past v3.3.x.
- The `/m` multiline flag on the bare-opener regex was added after a
  silent-failure audit (2026-05-16): the earlier `(?:^|\n)` form silently
  missed bare openers at the very start of input (position 0 of a pasted text
  with no leading newline).

## Scoring and dedup ordering

Previously `rawScore` was accumulated inline per pattern hit, so repeated hits
of the same phrase (or overlapping matches) inflated the score while the
displayed issue list was deduplicated. That produced the UX regression where a
"heavy AI patterns" label sat above a list of two items. The fix runs dedup
first, then each distinct issue contributes its category weight — so the number
reflects the same signals the user actually sees.

## Trinary calibration

- The FN-biased threshold design follows GPTZero's stated stance: it "biases
  the detector to prefer making less-harmful false-negative errors over
  false-positive errors."
- The soft probability distribution is not calibrated against a labeled corpus
  yet — TODO when a corpus exists (was tracked in roadmap.md).

## Stylometry thresholds

- Punctuation-distribution: the `CV < 0.25` cross-paragraph threshold is
  derived from stylometry papers (arxiv 2507.00838).
- Type-token ratio (low-TTR) is the simplest of the four stylometric signals
  identified in the May 2026 detection-research review upstream (not vendored;
  the surviving note is `docs/research/metaphor-density.md`): no POS tagger, no
  model, pure JS.
  The detector-research lens flagged TTR as one of four stylometric add-ons;
  POS-bigram log-odds, function-word z-scores, and sentence-length burstiness
  are still TODO.

## Hashtag and bullet-NP

The hashtag-stuffing regex char class went through two fixes: an earlier
`[\s\\]` had a literal backslash and silently missed hashtags after sentence
punctuation; an interim `[\s]` fix on origin only caught whitespace-preceded
tags. The current `(?:^|\W)` form matches a hashtag at the start of text or
after any non-word char.

## Tier 3 density

The Tier-3 density threshold is `Math.max(3, floor(wordCount * 0.03))`. The
previous floor of 1 meant a 50-word text with one "significant" got flagged as
Tier 3 overuse, which was noise.
