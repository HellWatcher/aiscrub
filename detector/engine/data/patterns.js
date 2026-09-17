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
// intro), and (2) bare "Interesting X:" used as a section-header opener.
const EMOTIONAL_FLATLINE = [
  /\bwhat\s+surprised\s+me\s+most\b/gi,
  /\bi\s+was\s+fascinated\s+to\b/gi,
  /\bwhat\s+struck\s+me\s+was\b/gi,
  /\bi\s+was\s+excited\s+to\s+learn\b/gi,
  /\bthe\s+most\s+interesting\s+(?:part|thing|aspect|piece)\b/gi,
  // Multiline flag (/m) so `^` matches at every line start, including
  // position 0 of a pasted text that has no leading newline (a bare
  // `(?:^|\n)` form misses openers at the very start of input).
  /^\s*interesting\s+(?:part|thing|aspect|piece)(?:\s+of\s+(?:the\s+)?\w+)?\s*:/gim,
];

// ─── Lingering-attention claims ─────────────────────────────────────
// The share-post opener that claims duration of attention instead of
// saying anything about the thing ("the line I keep coming back to").
// The bare verb phrase "I keep coming back to X" is NOT matched on its
// own, since it is legitimate whenever a reason follows ("I keep coming
// back to Hirschman because it predicts who quits"); only the
// noun-anchored frame that introduces a subject fires.
const LINGERING_ATTENTION = [
  /\b(?:the|that|this)\s+(?:one\s+)?(?:line|quote|bit|part|idea|point|framing|comment|thing)\s+(?:that\s+)?i\s+keep\s+(?:coming\s+back\s+to|thinking\s+about)\b/gi,
  /\bi\s+can'?t\s+stop\s+thinking\s+about\b/gi,
  /\bstill\s+thinking\s+about\s+(?:this|that)\s+one\b/gi,
  /\b(?:been|be)\s+rattling\s+around\s+(?:in\s+)?my\s+(?:head|brain)\b/gi,
  /\bi'?ve\s+been\s+chewing\s+on\s+(?:this|that)\b/gi,
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
// Three near-definitive AI-origin signals: unlike the statistical
// patterns above, a single hit on any of these is strong evidence —
// the AI tool literally left its fingerprint in the text.
// Provenance: see docs/engine-history.md#ai-tool-fingerprints.

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
  // Gemini grounding citations: bracketed numeral refs ("[cite: 1]",
  // "[cite: 2, 5]") and the span-boundary markers that wrap grounded
  // text ("[span_1](start_span)"..."[span_1](end_span)").
  /\[cite:\s*\d+(?:\s*,\s*\d+)*\]/gi,
  /\[span_\d+\]\((?:start|end)_span\)/gi,
  // Grok's internal citation-card renderer token, and Perplexity's file
  // upload markup token — both leak through copy-paste from the chat UI.
  /\bgrok_render_citation_card_json\b/gi,
  /\bppl-ai-file-upload\b/gi,
  // ":::writing" container fences are left to judgment (see the catalog):
  // ":::name" is also a common Markdown admonition syntax, too generic for a
  // critical-weight match.
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
// fine; the stack is the tell. At most one word may sit between the
// modal and the hedge, and that word may never be a negator — "could
// not potentially" and "may never eventually" are the modal being
// hedged AWAY from, the opposite of the stacked-hedge tell.
const HEDGE_STACK = [
  /\b(?:could|may|might)\s+(?:(?!not\b|never\b|hardly\b|scarcely\b|barely\b)\w+\s+)?(?:potentially|eventually|ultimately|possibly|conceivably)\b/gi,
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
//
// The optional `#{1,6}` prefix lets a Markdown heading match too. Without
// it, `## Benefits And Strategic Considerations` never matched — the line
// starts with `#`, not a capital letter. Setext headings (`Title`/`=====`)
// need no prefix: their text line is already bare.
const TITLE_CASE_HEADER =
  /^(?:#{1,6}[ \t]+)?([A-Z][a-z]+(?:\s+(?:[A-Z][a-z]+|and|or|of|the|in|for|to|a|an))+\s+[A-Z][a-z]+)\s*$/gm;

// Function words whose presence MID-title marks the AI section-header shape.
// Word-anchored: without \b the "A" alternative matches inside any word and
// the guard silently degrades to "four tokens".
const FUNCTION_WORD = /\b(?:And|Or|Of|The|In|For|To|A|An)\b/;

// Must accept exactly what TITLE_CASE_HEADER accepts, or the `#` prefix
// survives into the token count and reintroduces the ##-as-token bug.
const MD_HEADING_PREFIX = /^#{1,6}[ \t]+/;

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

// ─── Social endorsement / CTA closers ──────────────────────────────
// The curatorial sign-off appended to LinkedIn / X posts that share or
// recommend something — usually a colon teeing up a link. Each pattern
// carries an anchor so it stays off literal-verb prose: the
// demonstrative object ("read THIS", not "read the runbook"), the
// trailing-terminal lookahead on "miss this" ("miss this meeting" does
// not fire), and the sentence-initial lookbehind on "thank me later"
// ("she will thank me later" does not fire).
const SOCIAL_CTA_CLOSER = [
  /\bthis\s+one['’]?s?\s+(?:is\s+)?(?:well\s+|totally\s+|absolutely\s+|definitely\s+|really\s+|truly\s+|easily\s+|more\s+than\s+)?worth\s+(?:your\s+time|the\s+read|a\s+read|every\s+(?:minute|second)|reading|watching|a\s+listen|a\s+watch|a\s+look|it)\b/gi,
  /\bthis\s+one['’]?s?\s+(?:is\s+)?a\s+must[-\s]?(?:read|watch|listen|see)\b/gi,
  /\b(?:highly|strongly|can['’]?t|cannot)\s+recommend\w*\s+(?:giving\s+)?(?:this|it)\s+(?:one\s+)?a\s+(?:read|listen|watch|look|go)\b/gi,
  /\bdo\s+yourself\s+a\s+favou?r\s+and\s+(?:read|watch|check\s+out)\s+(?:this|it)\b/gi,
  /\byou\s+(?:really\s+)?(?:won['’]?t|do\s*n['’]?t|will\s+not|do\s+not)\s+want\s+to\s+miss\s+this(?:\s+one)?(?=\s*(?:[:.!\n]|$))/gi,
  /(?<=^|[,.!?:\n]\s{0,4})(?:you\s+can\s+)?thank\s+me\s+later\b/gim,
  /(?<=^|[.!?:\n]\s{0,4})save\s+this\s+(?:one\s+)?for\s+later\b/gim,
  /\bbookmark\s+this(?:\s+(?:one|post|thread))?(?=\s*(?:[:.!\n]|$))/gi,
  /\bdo\s*n['’]?t\s+sleep\s+on\s+this\b/gi,
  /\btrust\s+me,?\s+(?:on\s+this|you['’]?ll)\b/gi,
];

// ─── Speculative scenario openers ──────────────────────────────────
// "Imagine a world where AI writes all our code" — the marketing-essay
// speculative-future opener. Gated to the world/future/reality object
// so it stays off instructional "imagine you have an array".
const SPECULATIVE_OPENERS = [
  /\b(?:imagine|picture|envision)(?:\s*,[^,\n]{1,30},)?\s+a\s+(?:world|future|reality)\s+(?:where|in\s+which)\b/gi,
];

// ─── Launch-copy dramatic introductions ────────────────────────────
// "Meet Flowdesk, your new favorite treasury dashboard" / "Think Notion
// meets Figma" — the LLM-default product-introduction move in launch
// and announcement copy.
const LAUNCH_INTROS = [
  /(?<=^|[.!?]\s|\n)Meet\s+[A-Z][\w'-]{1,29}\s*,\s*(?:your\s+new\s+(?:favorite|go-to)\b|the\s+new\s+(?:home\s+of\b|way\s+to\b|standard\s+(?:in|for)\b|(?:standard|way|home)(?=\s*(?:[.!?,;:–—]|$))))/g,
  /(?<=^|[.!?]\s|\n)[Tt]hink\s+[A-Z][\w'-]{1,29}\s+meets\s+[A-Z][\w'-]{1,29}\b/g,
];

// ─── Dramatized contrast against the crowd ─────────────────────────
// "shipped it in 2022, while everyone else was still debating
// timelines" — a claim propped on an implied lagging crowd. Gated to a
// dismissive verb plus the "was still" dramatization marker so ordinary
// simultaneity ("she read while everyone else watched the movie") stays
// clean.
const CROWD_CONTRAST = [
  /\bwhile\s+(?:everyone\s+else|the\s+(?:industry|market|competition)|others)\s+(?:was|were|is|are)\s+still\s+(?:busy\s+)?(?:(?:debat|deliberat|hesitat|theoriz|philosophiz|pontificat|speculat|argu)ing|(?:dither|bicker)ing)\b/gi,
  /\bwhile\s+(?:everyone\s+else|the\s+(?:industry|market|competition)|others)\s+(?:was\s+|were\s+)?(?:busy\s+)?(?:writing|wrote)\s+think-?\s?pieces\b/gi,
  /\bwhile\s+(?:everyone\s+else|the\s+(?:industry|market|competition)|others)\s+(?:was\s+|were\s+|is\s+|are\s+)?(?:still\s+)?play(?:ed|ing|s)?\s+catch[-\s]?up\b/gi,
];

// ─── Fake-casual props (stage directions and wink asides) ──────────
// Theatrical asterisk stage directions ("*checks notes*", "*chef's
// kiss*", "*mic drop*") and wink-aside parentheticals. Both lists are
// closed and short on purpose — precision over recall.
const FAKE_CASUAL_PROPS = [
  /\*\s?(?:checks\s+notes|chef['’]s\s+kiss|mic\s+drop|takes\s+a\s+deep\s+breath|sips\s+(?:coffee|tea)|nervous\s+laughter)\s?\*/gi,
  /\(\s?(?:yes|no)\s?,\s?(?:really|seriously)\s?\)/gi,
];

// ─── Performed-insight phrases ─────────────────────────────────────
// Essayist tics that announce profundity instead of delivering it.
// Adapted from Simon Willison's LLM cliché highlighter
// (tools.simonwillison.net/llm-cliche-highlighter).
const PERFORMED_INSIGHT = [
  /\bsit(?:s|ting)?\s+with\s+(?:that|this)(?=\s*(?:[.!?,;:)–—’"']|for\s+a\s+(?:moment|minute|second|beat)\b|$))(?:\s+for\s+a\s+(?:moment|minute|second|beat))?/gi,
  /\bsit(?:s|ting)?\s+with\s+(?:the|your)\s+(?:discomfort|tension|uncertainty|ambiguity|grief|unease)\b/gi,
  /\b(?:that|this|it|which)(?:['’]s|\s+(?:is|was))\s+not\s+nothing\b/gi,
  /\byou\s+already\s+know\s+the\s+answer\b/gi,
  /\b(?:do\s+not|don['’]t)\s+(?:have\s+to\s+)?take\s+my\s+word\s+for\s+it\b/gi,
  /(?<=^|[.!?]\s|\n)Turns\s+out\b/g,
  /(?:['’]s|\b(?:is|was|are|were))\s+the\s+(?:whole|entire)\s+(?:point|game|ballgame|trick|pitch|idea|play|business\s+model|value\s+proposition)\b/gi,
  /\b(?:that|this)(?:['’]s|\s+(?:is|was))\s+the\s+part\s+(?:that|I|you|we|nobody|no\s+one|most\s+people)\b/gi,
  /\bthe\s+only\s+[\w'’-]+\s+that\s+(?:matters|counts)\b/gi,
  /\bis\s+dead\s*[.;,:–—]\s*long\s+live\b/gi,
  /\b(?:that|this)(?:['’]s|\s+(?:is|was))\s+why\s+[^.!?\n]{0,60}\s+mattered\b/gi,
];

// ─── Negation chains ───────────────────────────────────────────────
// "No fluff, no filler, no jargon" / "It didn't ask, didn't wait" /
// "Don't call it X. Call it Y." Adapted from Simon Willison's LLM
// cliché highlighter. The "no …" chain must open its sentence (a
// mid-sentence inventory like "takes no arguments, no headers, and no
// body" is factual, not rhetorical); the "did not" chain must be
// comma-joined with the subject elided; the stop-lists keep idiomatic
// pairs ("no more, no less", "no matter what") from firing.
const NO_ITEM_STOP =
  '(?!matter\\b|one\\b|doubt\\b|longer\\b|way\\b|less\\b|more\\b|such\\b|other\\b|means\\b)';
const NO_ITEM_SECOND_STOP =
  '(?!(?:in|on|at|of|to|for|with|from|by|is|are|was|were|be|been|being|will|would|can|could|should|shall|may|might|must|have|has|had|do|does|did)\\b)';
const NEGATION_CHAIN = [
  new RegExp(
    '(?<=^|[.!?]\\s|\\n|[:\\u2013\\u2014]\\s)No\\s+' +
      NO_ITEM_STOP +
      "[a-z'’-]+(?:\\s+" +
      NO_ITEM_SECOND_STOP +
      "[a-z'’-]+)?" +
      '(?:\\s*,\\s*(?:and\\s+|or\\s+|just\\s+)?no\\s+' +
      NO_ITEM_STOP +
      "[a-z'’-]+(?:\\s+" +
      NO_ITEM_SECOND_STOP +
      "[a-z'’-]+)?){2,}",
    'gm',
  ),
  /\b(?:did\s+not|didn['’]t)\s+[a-z]+[^,.;!?\n]{0,20},\s*(?:did\s+not|didn['’]t)\s+[a-z]+/gi,
  /\b(?:do\s+not|don['’]t)\s+(?:just\s+)?(\w+)\s+it\b[^.!?\n]{0,60}[.!?;:,][\s'"”’]*(?:just\s+)?\1\s+it\b/gi,
];

// ─── Dev-blog boilerplate ──────────────────────────────────────────
// Stock simplicity slogans from developer marketing. Adapted from Simon
// Willison's LLM cliché highlighter.
const DEV_BLOG_BOILERPLATE = [
  /\bit\s+just\s+works\b(?!\s+out\b(?![-\s]+of[-\s]+the[-\s]+box\b))/gi,
  /\bzero[-\s]config(?:uration)?\b/gi,
  /\bsane\s+defaults\b/gi,
  /\b(?:hold|fit|fits|holds)\s+in\s+your\s+head\b/gi,
];

// ─── Unnecessary hyphenation ────────────────────────────────────────
// Precision-first subclasses only: curated open/closed compound forms
// and attributive-only forms whose surrounding syntax makes the
// unhyphenated form clear. General "is this compound modifier
// established English" judgment stays out of scope for the engine.
const UNNECESSARY_HYPHENATION = [
  // Compounds whose standard spelling is closed.
  { pattern: /\bcode-base\b/g, suggestion: (match) => match.replace('-', '') },
  { pattern: /\bdata-set\b/g, suggestion: (match) => match.replace('-', '') },
  { pattern: /\btime-frame\b/g, suggestion: (match) => match.replace('-', '') },
  { pattern: /\broad-map\b/g, suggestion: (match) => match.replace('-', '') },

  // Attributive-only forms used adverbially or as nouns. The boundary
  // after real-time / long-term is intentionally narrow: "real-time
  // analytics" and "long-term plan" must not fire.
  {
    pattern:
      /\bin\s+real-time(?=\s*(?:[,.!?;:]|$)|\s+(?:(?:across|as|automatically|because|but|continuously|during|dynamically|every|for|from|immediately|instantly|on|simultaneously|through|throughout|until|via|when|while|with|without)\b))/gi,
    suggestion: 'in real time',
  },
  {
    pattern:
      /\b(?:for|over)\s+the\s+long-term(?=\s*(?:[,.!?;:]|$)|\s+(?:across|because|but|by|during|for|from|on|through|throughout|until|via|when|while|with|without)\b)/gi,
    suggestion: (match) => match.replace(/long-term/i, 'long term'),
  },
  {
    pattern:
      /\b(?:functions?|functioned|functioning|operates?|operated|operating|runs?|ran|running|works?|worked|working)\s+out-of-the-box\b/gi,
    suggestion: (match) => match.replace(/out-of-the-box/i, 'out of the box'),
  },
];

// ─── Colon reveals ─────────────────────────────────────────────────
// Sourced from petergyang/no-ai-slop (MIT). A determiner-led noun phrase,
// a colon, then a lowercase dramatic reveal: "The detail that makes it
// work: a separate agent grades it." Catalog 52 already covers the
// interrogative hook ("The catch?"); this is the declarative twin.
//
// Narrow on purpose. Requiring a leading determiner keeps bare labels
// ("Note:", "Usage:", "Requirements:") and dialogue attributions
// ("Ferrik: ...") out with no extra list to maintain, and the colon can
// only be the first one on the line because the middle class excludes it.
// The clause after the colon must start lowercase, which is what
// separates a reveal from a heading or a proper-noun subtitle. Line
// shape, code, and genuine enumerations are filtered in
// passes/colon-reveal.js, not here.
const COLON_REVEAL =
  /(?:^|(?<=[.!?]\s))((?:The|This|That|A|An|One|My|Our|Your|Their|Its|His|Her|What)\s[^.!?:;,\n]{1,60}[A-Za-z0-9)"'])[ \t]*:[ \t]+([a-z][^.!?\n]{2,160})/gm;

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
  FUNCTION_WORD,
  MD_HEADING_PREFIX,
  PARENTHETICAL_HEDGE,
  CONFIDENCE_CALIBRATION,
  LINGERING_ATTENTION,
  SOCIAL_CTA_CLOSER,
  SPECULATIVE_OPENERS,
  LAUNCH_INTROS,
  CROWD_CONTRAST,
  FAKE_CASUAL_PROPS,
  PERFORMED_INSIGHT,
  NEGATION_CHAIN,
  DEV_BLOG_BOILERPLATE,
  UNNECESSARY_HYPHENATION,
  COLON_REVEAL,
};
