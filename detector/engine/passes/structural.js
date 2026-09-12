const { maskCode } = require('../text-utils');

// A non-social `#tag` we should never count toward the stuffing threshold:
// an all-digit reference (`#88` issue number), a 6/8-char hex colour that
// contains at least one digit (so `#fff`/`#abc` word-like triples still
// don't collide with real short tags), or a C-preprocessor directive
// (`#include`, `#define`, ...).
const HEX_COLOUR = /^(?=[0-9a-f]*\d)(?:[0-9a-f]{6}|[0-9a-f]{8})$/i;
const CPP_DIRECTIVE =
  /^(?:include|define|undef|if|ifdef|ifndef|elif|else|endif|pragma|error|warning|line)$/;
function isSocialTag(tag) {
  return !/^\d+$/.test(tag) && !HEX_COLOUR.test(tag) && !CPP_DIRECTIVE.test(tag);
}

// Structural / formatting passes: hashtag stuffing, bullet-NP lists,
// em-dash, bold overuse. Takes { text, wordCount }, returns issues.
function runStructuralPass({ text, wordCount }) {
  const issues = [];

  // ── Hashtag stuffing ─────────────────────────────────────────
  // 6+ hashtags in a single post is rare for thoughtful humans and
  // near-universal for LLM-generated social posts. Counted globally,
  // not per-paragraph, since the trailing hashtag block is the shape
  // we care about.
  // Match #tag at start of text or after any non-word char (whitespace,
  // punctuation, line breaks). URL fragments are already excluded
  // because the char immediately before `#` in a URL path is always
  // a word char (e.g. `example.com/page#section` — `e` before `#`).
  // Code is masked and non-tag `#` forms are subtracted first (via
  // maskCode/isSocialTag) so a changelog paragraph citing six issue
  // numbers, a palette listing six hex colours, or a header with six
  // `#include` lines doesn't score as a hashtag block.
  // See docs/engine-history.md#hashtag-and-bullet-np for the char-class fix history.
  const hashtagMatches = [...maskCode(text).matchAll(/(?:^|\W)#(\w[\w-]*)/g)].filter((m) =>
    isSocialTag(m[1]),
  );
  if (hashtagMatches.length >= 6) {
    issues.push({
      type: 'hashtag-stuff',
      text: `${hashtagMatches.length} hashtags`,
      severity: 'medium',
      suggestion: 'Cut to 2-3 specific tags or none. Long hashtag blocks read as bot output.',
    });
  }

  // ── Bullet list of bare noun phrases ─────────────────────────
  // ≥5 consecutive bullet items that are short (≤6 words) and contain
  // no finite-verb / modal token. Catches the "Stable mining efficiency
  // / Reliable pool connectivity / Optimized RandomX performance ..."
  // shape LLMs default to. Markdown bullets, escaped Markdown bullets,
  // unicode bullets, and dashes are all matched. Numbered lists are
  // excluded — those have a separate "numbered list inflation" rule.
  //
  // Note: verbRe covers auxiliaries and modals ("was", "will", "can",
  // etc.). Regular past-tense verbs ("fixed", "removed") are not
  // matched here; instead, the ≤6-word length gate excludes most
  // real-world changelog lines, which tend to read "fixed the X that
  // was doing Y" (>6 words). Short two-word action items ("* fixed
  // bug") would pass both gates — an acceptable trade-off to avoid
  // false-negative risk from adjectives ending in -ed ("skilled",
  // "advanced") that share the same surface form.
  const lines = text.split(/\r?\n/);
  const bulletRe = /^\s*(?:\*|-|•|\+)\s+(.+)$/;
  const verbRe =
    /\b(?:is|are|was|were|has|have|had|will|would|should|must|do|does|did|can|could|may|might|am|been|being)\b/i;
  const fenceRe = /^\s*(?:```|~~~)/;
  let run = [];
  let blankStreak = 0;
  let inFence = false;
  function flushRun() {
    if (run.length >= 5) {
      const bareNP = run.filter((it) => {
        const wc = (it.match(/\S+/g) || []).length;
        return wc > 0 && wc <= 6 && !verbRe.test(it);
      });
      if (bareNP.length >= 5 && bareNP.length / run.length >= 0.75) {
        issues.push({
          type: 'bullet-np-list',
          text: `${run.length}-item bullet list of bare noun phrases`,
          severity: 'high',
          suggestion:
            'Convert to a prose paragraph or merge items. Long lists of bare adj+noun pairs read as AI scaffolding.',
        });
      }
    }
    run = [];
    blankStreak = 0;
  }
  for (const line of lines) {
    if (fenceRe.test(line)) {
      // Code-fence toggle. Bullets inside fences are CLI flag docs or
      // option dumps, not prose AI scaffolding — flush any prose run
      // we were tracking and skip until the fence closes.
      flushRun();
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = line.match(bulletRe);
    if (m) {
      run.push(m[1].trim());
      blankStreak = 0;
    } else if (line.trim() === '') {
      // A single blank line inside a list is normal Markdown spacing;
      // two or more blank lines break the run, since visually-disjoint
      // bullet sections shouldn't merge into one logical list.
      blankStreak++;
      if (blankStreak >= 2) flushRun();
    } else {
      flushRun();
    }
  }
  flushRun();

  // ── 22. Em dash ──────────────────────────────────────────────
  // Always flag any em dash. Match real em dashes, plus `--` only when
  // surrounded by whitespace on at least one side (skips CLI flags like
  // --save-dev and YAML `---` blocks).
  const emDashCount = (text.match(/—|(?<=\s)--(?=\s|$)|(?<=^|\s)--(?=\s)/gm) || []).length;
  if (emDashCount > 0) {
    issues.push({
      type: 'em-dash',
      text: `${emDashCount} em dash${emDashCount === 1 ? '' : 'es'} in ${wordCount} words`,
      severity: 'medium',
      suggestion: 'Replace with commas, periods, or rewrite',
    });
  }

  // ── 25. Bold overuse ─────────────────────────────────────────
  const boldMatches = text.match(/\*\*[^*]+\*\*/g) || [];
  if (boldMatches.length > 3) {
    issues.push({
      type: 'formatting',
      text: `${boldMatches.length} bold phrases`,
      severity: 'medium',
      suggestion: 'Strip bold from most; restructure to lead with key info',
    });
  }

  return issues;
}

module.exports = { runStructuralPass };
