// Regex pattern arrays for the phrase-matching detection passes. One named
// export per category. Comments preserved verbatim from the original engine.

// ─── Transition phrases ────────────────────────────────────────────
const TRANSITIONS = [
  /\bmoreover\b/gi,
  /\bfurthermore\b/gi,
  /\badditionally\b/gi,
  /\bin\s+today'?s\b/gi,
  /\bin\s+an\s+era\s+where\b/gi,
  /\bit'?s\s+worth\s+noting\s+that\b/gi,
  /\bnotably\b/gi,
  /\bin\s+conclusion\b/gi,
  /\bin\s+summary\b/gi,
  /\bto\s+summarize\b/gi,
  /\bwhen\s+it\s+comes\s+to\b/gi,
  /\bat\s+the\s+end\s+of\s+the\s+day\b/gi,
  /\bthat\s+(?:being\s+)?said\b/gi,
];

// ─── Chatbot artifacts ─────────────────────────────────────────────
const CHATBOT_ARTIFACTS = [
  /\bi\s+hope\s+this\s+helps\b/gi,
  /\bcertainly!\b/gi,
  /\babsolutely!\b/gi,
  /\bgreat\s+question!\b/gi,
  /\bexcellent\s+point!\b/gi,
  /\bfeel\s+free\s+to\s+reach\s+out\b/gi,
  /\blet\s+me\s+know\s+if\s+you\s+need\s+anything\b/gi,
  /\bin\s+this\s+article,?\s+we\s+will\s+explore\b/gi,
  /\blet'?s\s+dive\s+in!?\b/gi,
];

// ─── Sycophantic tone ──────────────────────────────────────────────
const SYCOPHANTIC = [
  /\byou'?re\s+absolutely\s+right\b/gi,
  /\bthat'?s\s+a\s+really\s+insightful\b/gi,
  /\bthat'?s\s+a\s+great\s+question\b/gi,
  /\bexcellent\s+question\b/gi,
];

// ─── Filler phrases ────────────────────────────────────────────────
const FILLERS = [
  /\bit\s+is\s+important\s+to\s+note\s+that\b/gi,
  /\bin\s+terms\s+of\b/gi,
  /\bthe\s+reality\s+is\s+that\b/gi,
  /\bit'?s\s+important\s+to\s+note\s+that\b/gi,
];

// ─── Generic conclusions ───────────────────────────────────────────
const GENERIC_CONCLUSIONS = [
  /\bthe\s+future\s+looks\s+bright\b/gi,
  /\bonly\s+time\s+will\s+tell\b/gi,
  /\bone\s+thing\s+is\s+certain\b/gi,
  /\bas\s+we\s+move\s+forward\b/gi,
];

// ─── "Let's" constructions ─────────────────────────────────────────
const LETS_PATTERNS = [
  /\blet'?s\s+explore\b/gi,
  /\blet'?s\s+take\s+a\s+look\b/gi,
  /\blet'?s\s+break\s+this\s+down\b/gi,
  /\blet'?s\s+examine\b/gi,
  /\blet'?s\s+(?:consider|discuss|delve|unpack|walk\s+through)\b/gi,
];

// ─── Reasoning chain artifacts ─────────────────────────────────────
const REASONING_ARTIFACTS = [
  /\blet\s+me\s+think\s+step\s+by\s+step\b/gi,
  /\bbreaking\s+this\s+down\b/gi,
  /\bto\s+approach\s+this\s+systematically\b/gi,
  /\bhere'?s\s+my\s+thought\s+process\b/gi,
  /\bfirst,?\s+let'?s\s+consider\b/gi,
  /\bworking\s+through\s+this\s+logically\b/gi,
];

// ─── Acknowledgment loops ──────────────────────────────────────────
const ACKNOWLEDGMENT_LOOPS = [
  /\byou'?re\s+asking\s+about\b/gi,
  /\bthe\s+question\s+of\s+whether\b/gi,
  /\bto\s+answer\s+your\s+question\b/gi,
];

// ─── Significance inflation ────────────────────────────────────────
const SIGNIFICANCE_INFLATION = [
  /\bmarking\s+a\s+(?:pivotal|significant|important)\s+moment\b/gi,
  /\ba\s+watershed\s+moment\s+for\b/gi,
  /\bin\s+the\s+evolution\s+of\b/gi,
  /\ba\s+(?:pivotal|defining)\s+moment\s+in\b/gi,
];

// ─── Vague attributions ────────────────────────────────────────────
const VAGUE_ATTRIBUTIONS = [
  /\bexperts\s+(?:believe|say|suggest|agree)\b/gi,
  /\bstudies\s+(?:show|suggest|indicate)\b/gi,
  /\bresearch\s+(?:shows|suggests|indicates)\b/gi,
  /\bindustry\s+leaders\s+(?:agree|believe|say)\b/gi,
];

// ─── Hollow intensifiers ──────────────────────────────────────────
const HOLLOW_INTENSIFIERS = [
  /\bgenuine(?:ly)?\b/gi,
  /\btruly\b/gi,
  /\bquite\s+frankly\b/gi,
  /\bto\s+be\s+honest\b/gi,
  /\blet'?s\s+be\s+clear\b/gi,
];

// ─── Emotional flatline ────────────────────────────────────────────
// The "interesting (part|thing|aspect|piece)" family is matched in two
// shapes: (1) "the most interesting X" inline (the canonical AI list
// intro), and (2) bare "Interesting X:" used as a section-header opener,
// which is the section-break variant that slipped past v3.3.x.
const EMOTIONAL_FLATLINE = [
  /\bwhat\s+surprised\s+me\s+most\b/gi,
  /\bi\s+was\s+fascinated\s+to\b/gi,
  /\bwhat\s+struck\s+me\s+was\b/gi,
  /\bi\s+was\s+excited\s+to\s+learn\b/gi,
  /\bthe\s+most\s+interesting\s+(?:part|thing|aspect|piece)\b/gi,
  // Multiline flag (/m) so `^` matches at every line start, including
  // position 0 of a pasted text that has no leading newline. The earlier
  // `(?:^|\n)` form silently missed bare openers at the very start of
  // input — caught by silent-failure audit 2026-05-16.
  /^\s*interesting\s+(?:part|thing|aspect|piece)(?:\s+of\s+(?:the\s+)?\w+)?\s*:/gim,
];

// ─── Novelty inflation ─────────────────────────────────────────────
const NOVELTY_INFLATION = [
  /\bthe\s+failure\s+mode\s+nobody'?s?\s+naming\b/gi,
  /\ba\s+problem\s+nobody\s+talks\s+about\b/gi,
  /\bthe\s+insight\s+everyone'?s?\s+missing\b/gi,
  /\bwhat\s+nobody\s+tells\s+you\b/gi,
];

// ─── Cutoff disclaimers ────────────────────────────────────────────
// Includes the canonical LLM self-identification phrases — these are
// near-dispositive on their own (real humans don't write "as an AI
// language model" in first person). Patterns cover the major model
// families' default disclaimer language.
const CUTOFF_DISCLAIMERS = [
  /\bas\s+of\s+my\s+last\s+update\b/gi,
  /\bas\s+of\s+my\s+(?:knowledge\s+)?(?:cut-?off|last\s+training)\b/gi,
  /\bi\s+don'?t\s+have\s+access\s+to\s+real-?time\s+(?:data|information)\b/gi,
  /\bbased\s+on\s+available\s+information\b/gi,
  /\bas\s+an?\s+(?:ai|artificial\s+intelligence|large\s+language|ai\s+language)\s+(?:language\s+)?model\b/gi,
  /\bi\s+(?:am|'m)\s+an?\s+(?:ai|artificial\s+intelligence|large\s+language)\s+(?:assistant|model)?\b/gi,
  /\bi\s+cannot\s+(?:provide|give|offer)\s+(?:legal|medical|financial|professional)\s+advice\b/gi,
  /\bmy\s+training\s+data\s+(?:only\s+)?(?:goes\s+up\s+to|extends\s+to|ends\s+(?:in|at))\b/gi,
];

// ─── AI-tool fingerprints ──────────────────────────────────────────
// Three near-definitive AI-origin signals adapted from
// Aboudjem/humanizer-skill P33-P35 (see docs/competitive/audits/
// 2026-05-17-aboudjem-humanizer-skill.md). Unlike the statistical
// patterns above, single hit on any of these is strong evidence —
// the AI tool literally left its fingerprint in the text.

// Unfilled slot-fill placeholders. Catches the canonical "[Your Name]"
// family plus dated stubs and HTML/MD comments with placeholder verbs.
const AI_PLACEHOLDERS = [
  // Directive stubs ("[Your Name]", "[INSERT SOURCE URL]",
  // "[Describe the specific section]") — verb-led, the user was
  // told to fill in.
  /\[(?:Your|Insert|Add|Enter|Describe|Specify|Choose|Pick)[^\]\n]{1,80}\]/gi,
  // Noun-only template variables common in AI-generated email or
  // letter boilerplate. Match the bare noun OR noun + qualifier.
  // Conservative list: only nouns that almost never appear as
  // bracketed real content (citation refs, code identifiers, etc.
  // are excluded because they typically contain dots, slashes,
  // hyphens, or version numbers).
  /\[(?:Recipient|Sender|Topic|Subject|Salutation|Closing|Position|Department|Project Name|Company Name|Date)(?:\s+[^\]\n]{0,60})?\]/gi,
  // All-caps directive forms ("[INSERT X]", "[FILL IN]") — the
  // uppercase tells you it's a slot, not real content.
  /\[(?:INSERT|FILL\s+IN|ADD|TODO|TBD|PLACEHOLDER)[^\]\n]{0,80}\]/g,
  // Date stubs.
  /\b(?:19|20)\d{2}-XX-XX\b/g,
  /\bXX\/XX\/(?:19|20)\d{2}\b/g,
  // HTML/Markdown comment placeholders with placeholder verbs.
  /<!--\s*(?:add|fill\s+in|insert|todo|placeholder)[^>]{0,120}-->/gi,
];

// Chatbot citation/markup tokens that leak through copy-paste.
// `citeturn0search0` / `citeturn0news5` from ChatGPT, contentReference
// tokens, oai_citation, attached_file references, grok_card markers.
// Each is a near-definitive signature of a specific tool.
const AI_CITATION_MARKUP = [
  /\bcite(?:turn|news|search|navigation)\d+(?:search|turn|news|navigation)\d+/gi,
  /contentReference\s*\[oaicite:[^\]]+\]\s*\{[^}]*\}/gi,
  /\boai_citation\b/gi,
  /\[attached_file:\d+\]/gi,
  /\bgrok_card\b/gi,
];

// UTM/tracking parameters auto-appended by AI tools to URLs they
// generate. Survives copy-paste even when nothing else does.
const AI_UTM_SOURCE = [
  /[?&]utm_source=(?:chatgpt|openai|copilot|claude|grok|gemini|perplexity)(?:\.com|\.ai)?\b/gi,
  /[?&]referrer=(?:chatgpt|copilot|grok|claude|gemini|perplexity)\.(?:com|ai)\b/gi,
];

// ─── Template phrases ──────────────────────────────────────────────
const TEMPLATE_PHRASES = [
  /\ba\s+\w+\s+step\s+(?:towards?|forward\s+for)\b/gi,
  /\bwhether\s+you'?re\s+\w+\s+or\s+\w+/gi,
  /\bi\s+recently\s+had\s+the\s+pleasure\s+of\b/gi,
];

// ─── False concession ──────────────────────────────────────────────
const FALSE_CONCESSION = [
  /\bwhile\s+\w+\s+is\s+impressive\b/gi,
  /\balthough\s+\w+\s+has\s+made\s+strides\b/gi,
  /\bdespite\s+\w+\s+challenges?\b/gi,
];

// ─── Rhetorical question openers ───────────────────────────────────
const RHETORICAL_QUESTIONS = [
  /\bbut\s+what\s+does\s+this\s+mean\s+for\b/gi,
  /\bso\s+why\s+should\s+you\s+care\b/gi,
  /\bwhat'?s\s+next\?\s*/gi,
];

// ─── Hedge-stacked predictions ─────────────────────────────────────
// Stacks a modal with a hedge adverb: "could potentially create new
// opportunities", "may eventually unlock value." Either word alone is
// fine; the stack is the tell.
const HEDGE_STACK = [
  /\b(?:could|may|might)\s+(?:\w+\s+){0,2}(?:potentially|eventually|ultimately|possibly|conceivably)\b/gi,
  /\b(?:potentially|eventually|ultimately)\s+(?:could|may|might)\b/gi,
];

// ─── Generic future-narrative closers ──────────────────────────────
// The "may become one of the most important narratives" template — vague
// future significance with no falsifiable claim. Covers narratives /
// stories / trends / themes / chapters / movements.
const FUTURE_NARRATIVE = [
  /\b(?:may|could|will|is\s+(?:poised|set)\s+to)\s+become\s+(?:one\s+of\s+)?(?:the\s+)?(?:most\s+)?\w+\s+(?:narratives?|stories|developments?|trends?|movements?|chapters?|themes?|forces?)\b/gi,
  /\bone\s+of\s+the\s+most\s+important\s+(?:narratives?|stories|trends?|themes?)\s+of\s+the\s+(?:next|coming)\s+\w+\b/gi,
];

// ─── "Real/actual" adjective inflation ─────────────────────────────
// "Real on-chain tokenomics", "actual reward sustainability" — using
// real/actual/genuine/true as an empty intensifier on an abstract noun
// to imply the rest of the field is fake/superficial.
const REAL_ACTUAL_INFLATION = [
  /\b(?:real|actual|genuine|true)\s+(?:on-?chain\s+)?(?:tokenomics|economics|utility|adoption|sustainability|impact|revenue|fundamentals|demand|value|innovation|traction)\b/gi,
];

// ─── Formulaic openers ─────────────────────────────────────────────
// The "In the rapidly evolving world of X, Y has emerged as..." family
// — LLM-default essay openers.
const FORMULAIC_OPENERS = [
  /\bin\s+the\s+(?:rapidly\s+|ever-?\s*)?(?:evolving|changing|expanding|growing|shifting)\s+(?:world|landscape|realm|space|field|domain|era)\s+of\b/gi,
  /\bin\s+(?:an?|the)\s+(?:digital\s+)?age\s+(?:where|of)\b/gi,
  /\bas\s+(?:we|the\s+world|society|industries?)\s+(?:continue|move|navigate|enter)\s+(?:to\s+)?(?:evolve|forward|into|through)\b/gi,
  // "has emerged as a leader/force/category" — gated to the inflated
  // nouns that signal pseudo-significance, since bare "has emerged as
  // a" matches normal English ("Rust has emerged as a serious systems
  // language"). Same gating for "has become increasingly".
  /\bhas\s+emerged\s+as\s+(?:a|the|one\s+of)\s+(?:leading|key|major|critical|essential|fundamental|pivotal|prominent|dominant|important)\s+\w+/gi,
  /\bhas\s+become\s+increasingly\s+(?:important|critical|popular|relevant|prominent|essential)\b/gi,
];

// ─── Title Case Section Headers in non-technical prose ─────────────
// "Strategic Negotiations And Key Partnerships" — every content word
// capitalized. Acceptable in API docs, ML papers, news headlines. Tell
// in marketing/personal/blog prose. Gated to "personal" / "marketing"
// context modes (technical mode skips this check).
const TITLE_CASE_HEADER = /^([A-Z][a-z]+(?:\s+(?:[A-Z][a-z]+|and|or|of|the|in|for|to|a|an))+\s+[A-Z][a-z]+)\s*$/gm;

// ─── Parenthetical hedging asides ──────────────────────────────────
// "(and increasingly, X)", "(or more precisely, Y)", "(though to be
// fair, Z)" — pseudo-aside that adds no information but performs
// thoughtfulness. Different from genuine human parentheticals which
// tend to be tangents or clarifications, not hedges.
const PARENTHETICAL_HEDGE = [
  /\(\s*(?:and\s+)?(?:increasingly|notably|importantly|crucially|interestingly|perhaps)[,]?\s+[^)]{3,60}\)/gi,
  /\(\s*or\s+more\s+(?:precisely|accurately|specifically)[,]?\s+[^)]{3,60}\)/gi,
  /\(\s*though\s+to\s+be\s+fair[,]?\s+[^)]{3,60}\)/gi,
  /\(\s*at\s+least\s+(?:in\s+)?(?:theory|principle|part)[,]?\s+[^)]{0,60}\)/gi,
];

// ─── Confidence calibration ────────────────────────────────────────
const CONFIDENCE_CALIBRATION = [
  /\binterestingly\b/gi,
  /\bsurprisingly\b/gi,
  /\bimportantly\b/gi,
  /\bsignificantly\b/gi,
  /\bcertainly\b/gi,
  /\bundoubtedly\b/gi,
  /\bwithout\s+a\s+doubt\b/gi,
];

module.exports = {
  TRANSITIONS,
  CHATBOT_ARTIFACTS,
  SYCOPHANTIC,
  FILLERS,
  GENERIC_CONCLUSIONS,
  LETS_PATTERNS,
  REASONING_ARTIFACTS,
  ACKNOWLEDGMENT_LOOPS,
  SIGNIFICANCE_INFLATION,
  VAGUE_ATTRIBUTIONS,
  HOLLOW_INTENSIFIERS,
  EMOTIONAL_FLATLINE,
  NOVELTY_INFLATION,
  CUTOFF_DISCLAIMERS,
  AI_PLACEHOLDERS,
  AI_CITATION_MARKUP,
  AI_UTM_SOURCE,
  TEMPLATE_PHRASES,
  FALSE_CONCESSION,
  RHETORICAL_QUESTIONS,
  HEDGE_STACK,
  FUTURE_NARRATIVE,
  REAL_ACTUAL_INFLATION,
  FORMULAIC_OPENERS,
  TITLE_CASE_HEADER,
  PARENTHETICAL_HEDGE,
  CONFIDENCE_CALIBRATION,
};
