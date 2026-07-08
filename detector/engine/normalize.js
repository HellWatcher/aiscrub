const { CYRILLIC_LOOKALIKES, GREEK_LOOKALIKES } = require('./data/lookalikes');

// ═══ Tier 1 pre-pass: normalize bypass tricks ══════════════════════
//
// Humanizer tools and prompt-injection bypass techniques insert
// invisible / lookalike chars to defeat exact-string detectors. Strip
// them BEFORE pattern matching so "delve" with a Cyrillic 'е' still
// hits the Tier 1 list. Unicode ranges sourced from
// It-s-AI/llm-detection/detection/attacks/.
//
// Tracks what was stripped so the trinary classifier can use
// "normalization triggered" as a corroborating AI signal — humans don't
// paste ZWSPs into their own writing.
function normalizeText(text) {
  const flags = { zeroWidth: 0, homoglyph: 0, roleplay: 0 };
  let out = text;

  // 1. Strip zero-width chars (ZWSP U+200B, ZWNJ U+200C, ZWJ U+200D,
  //    BOM U+FEFF, word joiner U+2060).
  out = out.replace(/[​-‍﻿⁠]/g, () => { flags.zeroWidth++; return ''; });

  // 2. Swap Cyrillic / Greek Latin-lookalike chars back to Latin so
  //    pattern matching catches obfuscated tokens.
  out = out.replace(/[Ѐ-ӿͰ-Ͽ]/g, (m) => {
    const swap = CYRILLIC_LOOKALIKES[m] ?? GREEK_LOOKALIKES[m];
    if (swap) { flags.homoglyph++; return swap; }
    return m;
  });

  // 3. Strip *roleplay-action* markers — paired *...* containing an
  //    action verb (nods, sighs, laughs, smiles, etc.) anchored to
  //    the start of the inner phrase. This is the actual chat-model
  //    artifact shape. Markdown `**bold**` is rejected by the
  //    lookbehind/lookahead; legitimate multi-word `*italic*` is
  //    preserved because the verb whitelist is narrow.
  const ROLEPLAY_VERBS = /^(?:nods|sighs|laughs|smiles|frowns|shrugs|grins|winks|chuckles|gasps|pauses|thinks|wonders|whispers|shouts|gestures|raises|leans|turns|looks|glances|smirks|blinks|nodding|sighing|laughing|smiling|thinking|gesturing)\b/i;
  out = out.replace(/(?<!\*)\*([^*\n]{1,80}?)\*(?!\*)/gu, (m, inner) => {
    if (ROLEPLAY_VERBS.test(inner)) { flags.roleplay++; return ''; }
    return m;
  });

  return { text: out, flags };
}

module.exports = { normalizeText };
