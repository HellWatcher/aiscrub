# Detection catalog

Every pattern AIScrub looks for, with the fix for each. The catalog merges the
Wikipedia-derived pattern list from `blader/humanizer` with the phrase and
structure rules from `hardikpandya/stop-slop`. Scan for clusters, not isolated
hits, and rewrite rather than delete.

---

## Phrasing

### 1. Throat-clearing openers
Announcement phrases that delay the point. State the content directly.

Cut: "Here's the thing:", "Here's what/why/how [X]", "The uncomfortable truth is", "It turns out", "The real [X] is", "Let me be clear", "The truth is,", "I'm going to be honest", "Can we talk about", "In today's [X]", "In a world where", "When it comes to", "It's worth noting", "At the end of the day".

Any "here's what/this/that" construction is throat-clearing. Cut it and state the point.

### 2. Emphasis crutches
Add no meaning. Delete them.

"Full stop." / "Period." / "Let that sink in." / "Make no mistake" / "This matters because" / "Here's why that matters".

"This matters because" and "here's why that matters" are crutches only when what follows restates importance ("This matters because it is important"). Keep them when a concrete consequence follows ("This matters because retries can charge the customer twice"), and never invent stakes to fill the slot.

### 3. Inflated vocabulary (tiered)
AI words appear far more often in post-2023 text and tend to co-occur. Flag by tier, not as a flat blocklist, so a single ordinary word in isolation does not get gutted. Tiering is adapted from `conorbronsdon/avoid-ai-writing`.

**Tier 1, always replace.** 5-20x more common in AI text. Replace on sight: delve, landscape (metaphor), tapestry, realm, paradigm, embark, beacon, testament to, robust, comprehensive, cutting-edge, leverage (verb), pivotal, underscores, meticulous, seamless, game-changer, nestled, vibrant, thriving, showcasing, deep dive, unpack, intricate/intricacies, ever-evolving, enduring, daunting, holistic, actionable, impactful, learnings, thought leader, best practices, at its core, synergy, interplay, embrace (metaphor), load-bearing (only before an abstract noun: assumption, claim, invariant, premise, constraint, dependency, argument, abstraction; the literal sense passes).

**Tier 1B, wordiness.** Same verdict, different reason: these are not AI-only words, they are padding that AI defaults to. Replace with the plain form: utilize -> use, in order to -> to, due to the fact that -> because, serves as -> is, features/boasts/presents (verb) -> has, commence -> start, ascertain -> find out, endeavor -> try. The detector weights them like Tier 2 and keeps them out of the density signal, so ordinary prose with one "in order to" is not treated as machine-dense.

**Tier 2, flag when 2+ appear in one paragraph.** Fine alone, a tell in pairs: harness, navigate, foster, elevate, unleash, streamline, empower, bolster, spearhead, resonate, revolutionize, facilitate, underpin, nuanced, crucial, multifaceted, ecosystem (metaphor), myriad, plethora, encompass, catalyze, reimagine, galvanize, augment, cultivate, illuminate, elucidate, cornerstone, paramount, poised, burgeoning, nascent, quintessential, overarching, quietly, deeply (only in "deeply integrated / committed / rooted"), gate/gated/gating (figurative), key (adjective), highlight (verb), valuable.

**Tier 3, flag only at high density (~3%+ of words).** Normal words AI overuses: significant, innovative, effective, dynamic, scalable, compelling, unprecedented, exceptional, remarkable, sophisticated, instrumental, world-class, state-of-the-art, verbatim.

**Tier 3 phrases.** Boilerplate that reads fine once and marks a template at density: emerging sector, the integration of, the intersection of, community-driven, long-term sustainability, user engagement, decentralized compute, reward emissions, tokenized incentive structures, "designed for long-term X". The detector tracks these separately (`tier3-phrase`) and flags clusters.

**Audience-fit collisions.** A generic word that is a term of art for the audience is worse than inflated: "proof" and "proof point" in a cryptography post read as claims about proofs. Check the domain before reaching for a generic proof-term.

**Before:** Additionally, an enduring testament to Italian influence is the widespread adoption of pasta in the local culinary landscape, showcasing how these dishes integrated into the diet.
**After:** Pasta dishes, introduced during Italian colonization, remain common, especially in the south.

### 4. Business jargon
Replace with plain language.

| Avoid | Use |
|---|---|
| navigate (challenges) | handle, address |
| unpack (analysis) | explain, examine |
| lean into | accept, embrace |
| landscape (context) | situation, field |
| game-changer | significant |
| double down | commit, increase |
| deep dive | analysis |
| take a step back | reconsider |
| moving forward | next, from now |
| circle back | return to |
| on the same page | agreed |

### 5. Adverbs and empty intensifiers
Cut most adverbs. They add emphasis, not meaning.

Frequent offenders: really, just, literally, genuinely, honestly, simply, actually, deeply, truly, fundamentally, inherently, inevitably, interestingly, importantly, crucially.

"Actually" does two jobs. Delete it when it only adds emphasis ("this is actually useful"); keep it when it carries a named correction or expectation gap ("the cache was actually cold, not warm"). The same token performs both, so this stays a judgment call.

### 6. Filler phrases
Tighten.

- "In order to achieve this goal" -> "To achieve this"
- "Due to the fact that it was raining" -> "Because it was raining"
- "At this point in time" -> "Now"
- "In the event that you need help" -> "If you need help"
- "The system has the ability to process" -> "The system can process"
- "It is important to note that the data shows" -> "The data shows"

### 7. Excessive hedging
Stop over-qualifying.

**Before:** It could potentially possibly be argued that the policy might have some effect on outcomes.
**After:** The policy may affect outcomes.

Also stacked qualifiers that hedge the hedge: "to be fair", "it's also possible that", "this is an inference", "I could be wrong, but", three in one paragraph. One qualification where the uncertainty is real; the rest are insurance.

### 8. Persuasive authority tropes
These pretend to cut through noise to a deeper truth, then restate an ordinary point with ceremony.

Watch: "The real question is", "at its core", "in reality", "what really matters", "fundamentally", "the deeper issue", "the heart of the matter".

**Before:** The real question is whether teams can adapt. At its core, what really matters is organizational readiness.
**After:** Whether teams adapt mostly depends on whether the organization is ready to change its habits.

### 9. Meta-commentary and signposting
The text announces what it will do instead of doing it. Delete it and let the writing move.

Watch: "Let's dive in", "let's explore", "let's break this down", "here's what you need to know", "without further ado", "Hint:", "Plot twist:", "The rest of this essay explains...", "In this section, we'll...", "As we'll see...".

---

## Structure

### 10. Rule of three
LLMs force ideas into groups of three to look comprehensive. Two items beat three.

**Before:** The event features keynote sessions, panel discussions, and networking opportunities. Attendees can expect innovation, inspiration, and industry insights.
**After:** The event includes talks and panels, with time for informal networking between sessions.

The commonest shape is a colon opening onto exactly three comma-separated items ("separate ports, processes, and local state"). Audit the list: if there are really two things, or four, write that. Noisy by design in technical writing, where three-item lists are often simply true, so weigh it by genre, not per hit.

### 11. Binary contrasts
False drama through a telegraphed reversal. State the point directly and drop the negation.

Patterns: "Not because X, but because Y", "[X] isn't the problem. [Y] is.", "The answer isn't X. It's Y.", "It feels like X. It's actually Y.", "not just X but also Y", "stops being X and starts being Y".

Also the split-sentence form ("This does not mean X. It means Y."), the multi-negation countdown ("It's not X. It's not Y. It's not even Z. It's W."), the tailing negation clipped onto a claim ("..., no guessing"), and the stranded auxiliary contrast ("The tool died; the data didn't.", "Reading mostly passed. Writing didn't."). One stranded auxiliary is fine style; as a recurring rhythm it is a signature move, so ration it and write the next contrast out in full.

**Before:** It's not just about the beat riding under the vocals; it's part of the aggression and atmosphere.
**After:** The heavy beat adds to the aggressive tone.

### 12. Negative listing
Listing what something is *not* before revealing what it *is*. A rhetorical striptease.

Patterns: "Not a X... Not a Y... A Z.", "It wasn't X. It wasn't Y. It was Z." State Z. The reader does not need the runway.

The same move at phrase scale is the negation chain: "No fluff, no filler, no jargon.", stacked "It didn't ask. It didn't wait.", and the negated-then-repeated verb ("Don't call it a pivot. Call it a correction."). One negation earns its place when the reader would otherwise assume the opposite; a chain is a drumroll. Factual inventories ("takes no arguments, no headers, and no body") and narration with restated subjects pass. The detector (`negation-chain`) fires only on sentence-initial chains of three or more short "no ..." items and comma-joined, subject-elided "did not ..." chains; shorter chains are judgment calls.

### 13. Dramatic fragmentation
Sentence fragments for emphasis read as manufactured profundity.

Patterns: "[Noun]. That's it. That's the [thing].", "X. And Y. And Z.", "This unlocks something. [Word]." Use complete sentences and trust the content.

Three close cousins. The one-line closer that ends a paragraph or section on a quotable beat ("That is the real win.", "Read that again.", "And that changes everything.", "every. single. day."), especially the same closer shape repeated after several sections. Repeated setup-and-reversal punchlines ("We planned for every failure mode. Except the one that happened.") when the twist stands in for the explanation that is missing; a supported reversal with a concrete contrast stays. Repeated empty concession pairs ("Not always. Not perfectly.") that stage honesty without saying where the claim fails; two meaningful concessions ("Not during failover. Not for expired tokens.") stay. Keep the one fragment that earns its emphasis and fold the rest into sentences that state the claim. Never invent a failure case to fill the gap; if the writer has not named it, ask.

### 14. Rhetorical setups
Announce insight rather than deliver it.

Patterns: "What if [reframe]?", "Here's what I mean:", "Think about it:", "And that's okay." Make the point and let readers draw the conclusion.

### 15. Outline-like "Challenges and Future Prospects" sections
Formulaic filler sections. Replace with specific facts. Same for stock "Legacy", "Awards and recognition", "Future outlook", and "Impact" sections and their send-off sentences, which exist because the template had a slot, not because the subject earned one.

**Before:** Despite its prosperity, the town faces challenges typical of urban areas. Despite these challenges, it continues to thrive.
**After:** Traffic congestion rose after 2015 when three IT parks opened. The municipality began a drainage project in 2022 to address recurring floods.

### 16. False ranges
"From X to Y" where X and Y are not on a real scale.

**Before:** Our journey takes us from the singularity of the Big Bang to the grand cosmic web, from the birth of stars to the dance of dark matter.
**After:** The book covers the Big Bang, star formation, and current theories about dark matter.

### 17. Elegant variation (synonym cycling)
Repetition-penalty habits drive needless synonym swaps for the same referent.

**Before:** The protagonist faces challenges. The main character overcomes obstacles. The central figure triumphs. The hero returns home.
**After:** The protagonist faces many challenges but eventually triumphs and returns home.

### 18. Fragmented headers
A heading followed by a one-line paragraph that restates the heading before the real content.

**Before:** ## Performance / Speed matters. / When users hit a slow page, they leave.
**After:** ## Performance / When users hit a slow page, they leave.

Same family: the first sentence repeating the heading it sits under ("## Pricing", then "Pricing is where this gets interesting."), and a document opening with a level-1 heading that repeats its own title. Cut the repeat.

---

## Voice and stance

### 19. Passive voice and subjectless fragments
Every sentence needs an actor doing something. Passive voice hides the actor and drains energy.

"X was created" -> name who created it. "It is believed that" -> name who believes it. "No configuration file needed" -> "You do not need a configuration file."

### 20. False agency
Inanimate things given human verbs. A person makes those things happen; AI loves this because it avoids naming the actor.

| Pattern | Why it is wrong |
|---|---|
| "a complaint becomes a fix" | someone fixed it |
| "the decision emerges" | someone decided |
| "the culture shifts" | people changed behavior |
| "the data tells us" | someone read it and drew a conclusion |
| "the market rewards" | buyers paid for something |

Name the human. If none fits, use "you" to put the reader in the seat.

### 21. Narrator-from-a-distance
Floating above the scene instead of putting the reader in it.

Patterns: "Nobody designed this.", "This happens because...", "People tend to...". Put the reader in the room: "You don't sit down one day and decide to..." beats "Nobody designed this."

### 22. Wh- sentence starters
Sentences opening with What, When, Where, Which, Who, Why, How become a crutch.

**Before:** What makes this hard is the constraint.
**After:** The constraint is [name it].

### 23. Vague attributions and weasel words
Opinions pinned to vague authorities with no source.

**Before:** Experts believe it plays a crucial role in the regional ecosystem.
**After:** The river supports several endemic fish species, according to a 2019 survey by the Chinese Academy of Sciences.

Includes vague third-party validation: "industry leaders praised", "widely regarded as", "critics have noted", "recognized by experts". Name the leader, the critic, or the award, with a date, or drop the claim.

### 24. Vague declaratives
Announcing importance without naming the specific thing.

Cut or replace with the specific thing: "The reasons are structural", "The implications are significant", "The stakes are high", "The consequences are real".

### 25. Lazy extremes
Sweeping absolutes used for false authority: every, always, never, everyone, everybody, nobody. Use specifics.

### 26. Superficial -ing analyses
Present-participle phrases tacked on to fake depth.

Watch: highlighting/underscoring/emphasizing..., ensuring..., reflecting/symbolizing..., contributing to..., showcasing...

**Before:** The palette resonates with the region's beauty, symbolizing the bluebonnets and the Gulf, reflecting the community's connection to the land.
**After:** The architect chose blue, green, and gold to reference local bluebonnets and the Gulf coast.

### 27. Copula avoidance
Elaborate constructions standing in for "is" / "are".

"serves as / stands as / boasts / features" -> "is / has".

### 28. Promotional language
Trouble holding a neutral tone, especially for "heritage" topics.

Watch: boasts a, vibrant, rich (figurative), nestled, in the heart of, renowned, breathtaking, must-visit, stunning.

**Before:** Nestled within the breathtaking region of Gonder, the town stands as a vibrant place with rich cultural heritage.
**After:** The town is in the Gonder region of Ethiopia, known for its weekly market and 18th-century church.

### 29. Significance inflation
Puffing up importance by tying arbitrary details to broader trends.

Watch: stands/serves as, is a testament, a pivotal/crucial moment, marking a shift, evolving landscape, setting the stage for, leaving an indelible mark.

**Before:** The institute was established in 1989, marking a pivotal moment in the evolution of regional statistics.
**After:** The institute was established in 1989 to publish regional statistics independently from the national office.

### 30. Notability name-dropping
Listing outlets and follower counts to assert importance.

**Before:** Her views have been cited in the NYT, BBC, FT, and The Hindu. She has over 500,000 followers.
**After:** In a 2024 New York Times interview, she argued that AI regulation should focus on outcomes rather than methods.

---

## Tone and communication

### 31. Chatbot artifacts
Correspondence pasted as content. Remove entirely.

"I hope this helps!", "Of course!", "Certainly!", "You're absolutely right!", "Would you like...", "Want me to...?", "Should I continue?", "let me know", "here is a...".

Includes acknowledgment loops that restate the prompt before answering: "You're asking about", "To answer your question", "The question of whether". The reader knows what they asked. Same for a section that opens by recapping the previous one.

### 32. Sycophantic tone
Overly positive, people-pleasing language.

**Before:** Great question! You're absolutely right that this is complex. Excellent point about the economics.
**After:** The economic factors you mentioned are relevant here.

### 33. Knowledge-cutoff disclaimers and speculative gap-filling
Two related tells: leftover cutoff disclaimers, and inventing plausible filler when no source is found.

Watch: "as of [date]", "based on available information", "not publicly available", "maintains a low profile", "keeps personal details private", "likely [grew up/studied]", "it is believed that".

**Before:** Information about her early life is not publicly available, suggesting she maintains a low profile. She likely grew up in a middle-class household.
**After:** Her early life is not documented in the available sources. (Or cut the section.)

### 34. Generic positive conclusions
Vague upbeat endings.

**Before:** The future looks bright. Exciting times lie ahead as they continue their journey toward excellence.
**After:** The company plans to open two more locations next year.

---

## Style

### 35. Em dashes and en dashes: cut them
The final rewrite contains no em dashes or en dashes. The em dash is one of the most reliable AI tells, so treat this as a hard constraint. Replace each, in rough order of preference: a period, a comma, a colon, parentheses, or restructure. Also catch spaced em dashes ( — ) and double hyphens ( -- ). Scan the final draft for these before delivering.

**Before:** The policy, announced without warning, affects thousands of workers. The changes -- long overdue -- take effect now.
**After:** The policy, announced without warning, affects thousands of workers. The changes, long overdue, take effect now.

### 36. Boldface overuse
AI emphasizes phrases in bold mechanically.

**Before:** It blends **OKRs**, **KPIs**, and tools like the **Business Model Canvas**.
**After:** It blends OKRs, KPIs, and tools like the Business Model Canvas.

### 37. Inline-header vertical lists
List items that start with a bold header and a colon.

**Before:** - **Performance:** Performance improved through optimized algorithms.
**After:** The update speeds up load times through optimized algorithms.

List labels that end in a period instead of a colon are a sibling tell ("- **Performance.** Improved through..."), the same inline-header list with different punctuation. Same fix.

### 38. Title case in headings
AI capitalizes every main word.

**Before:** ## Strategic Negotiations And Global Partnerships
**After:** ## Strategic negotiations and global partnerships

### 39. Emojis
Decorative emoji on headings or bullets.

**Before:** 🚀 **Launch Phase:** The product launches in Q3
**After:** The product launches in Q3.

### 40. Curly quotation marks
ChatGPT uses curly quotes instead of straight ones. (Only a tell when stacked with others; most editors auto-curl.)

**Before:** He said “the project is on track.”
**After:** He said "the project is on track."

Related weak signal: immaculate typography in a casual register. Curly quotes, a true ellipsis character, and typographically correct apostrophes in a Slack reply or a GitHub comment, where people type straight quotes and three periods, corroborate other tells. Never a finding on its own.

### 41. Hyphenated word-pair overuse
AI hyphenates compounds uniformly, including in predicate position. Keep the hyphen when the compound is attributive; drop it when it follows the noun.

**Before:** The team is cross-functional, the report is high-quality, the method is data-driven.
**After:** The team is cross functional, the report is high quality, the method is data driven.

Also unnecessary hyphenation: welding open compounds ("research-impact aggregator"), hyphenating closed forms ("code-base" for codebase), and hyphenating adverbial phrases ("in real-time" for in real time). P2 and score-neutral in the detector (`unnecessary-hyphenation`), which checks a curated list and masks code, quotes, URLs, paths, and flags; anything outside that list is a judgment call. Hyphenated-modifier stacking ("a fast-moving, high-stakes, data-driven decision") belongs here too.

### 42. Diff-anchored writing
Documentation written as if narrating a change rather than describing the thing as it is. Unless the document is version-scoped (changelogs, release notes), it should read coherently without knowing the last commit.

**Before:** This function was added to replace the previous approach of iterating through all items, which caused O(n²) performance.
**After:** This function uses a hash map for O(1) lookups, avoiding the O(n²) cost of naive iteration.

---

## Fingerprints and newer patterns

These are mostly from `conorbronsdon/avoid-ai-writing`. The first three are
*fingerprints*: their presence is near-proof the text was pasted from a chat
tool, regardless of how the surrounding prose reads. Strip them mechanically.

### 43. Chatbot citation-markup leaks
Internal citation tokens that survive copy-paste from chat UIs. ChatGPT: `citeturn0search0`, `contentReference[oaicite:0]{index=0}`, `oai_citation`, `:::writing` fences. Gemini: `[cite: 1]`, `[span_1](start_span)` / `(end_span)`. Grok: `grok_card`, `grok_render_citation_card_json`. Perplexity: `[attached_file:1]`, `ppl-ai-file-upload` URLs. DeepSeek: lenticular brackets (【1】) and dagger markers. Delete every token. If a citation was meaningful, replace it with a real reference.

### 44. AI-tool URL parameters
Tracking params AI tools append to URLs: `utm_source=chatgpt.com`, `utm_source=copilot.com`, `utm_source=claude.ai`, `utm_source=perplexity.ai`, `referrer=grok.com`. Strip the parameter; keep the URL if the link matters.

### 45. Unfilled placeholders
Bracketed slot-fillers shipped unedited: `[Your Name]`, `[INSERT SOURCE URL]`, `[Describe the section]`, `2025-XX-XX`, `<!-- add citation -->`. Treat any visible placeholder as a publishing bug: fill it with real content or delete the sentence.

### 46. Parataxis (no connective tissue)
Chaining short declaratives because that is easier than building a thought: "Short sentence. Then another. Then another." Connect related ideas with subordinate clauses, conjunctions, or punctuation that shows how they relate (cause, contrast, qualification).

**Before:** The build failed. The cache was stale. We cleared it. It passed.
**After:** The build failed because the cache was stale, so we cleared it and it passed.

### 47. Hashtag stuffing
Six or more hashtags on a short post, usually mixing a specific tag with broad category tags (#AI #Crypto #Innovation #FutureTech). Cut to two or three specific tags, or none. A hashtag that would not help a reader find related work is filler.

### 48. Novelty inflation
Treating established ideas as if the subject invented them: "He coined the phrase", "a concept nobody's naming", "the failure mode nobody talks about". Describe what the person *did with* the idea, not that they discovered it. Assume an idea is not novel unless you can confirm it.

### 49. Emotional flatline
Claiming an emotion as a crutch instead of conveying it: "What surprised me most", "I was fascinated to discover", "What struck me was", and the bare header form "Interesting part:". If a thing is surprising, the reader should feel it from the content. Cut the claim and present the thing.

### 50. Self-labeling significance
Pointing back at an item and labeling it for the reader: "That last move is the contrarian one", "This is the interesting part", "Here's where it gets clever". If a move is genuinely contrarian, the description shows it. Cut the label and let the explanation do the work, or lead with the item you wanted to highlight.

### 51. Reasoning-chain artifacts
Chain-of-thought scaffolding leaking into prose: "Let me think step by step", "Breaking this down", "To approach this systematically", "First, let's consider". The reader does not need the scaffolding. State the conclusion, then the evidence.

### 52. Infomercial engagement hooks
Fragment-hooks teeing up a reveal: "The catch?", "The kicker?", "Here's the thing.", "The best part?", "Plot twist:". Delete the hook and state the thing. "The catch? It only works on weekends." becomes "It only works on weekends."

### 53. Rhetorical-question openers
Questions used to stall before the point: "But what does this mean for developers?", "So why should you care?", "What's next?". If you know the answer, say it. A rhetorical question is earned by strong setup, not dropped as a section transition. Stacked rhetorical questions are the chain form ("Do I know how it works? Where it breaks? Which corners it cut?"): keep at most one, answer it, and turn the rest into the statements they were hiding. Interviews, FAQs, and dialogue stack questions legitimately, so the chain form stays a judgment call.

### 54. False concession
"While X is impressive, Y remains a challenge" used to sound balanced without weighing anything, when both halves are vague. Make the concession specific (name what is impressive, name the actual challenge) or pick a side and argue it.

### 55. Confidence-calibration phrases
Words that tell the reader how to feel about a fact instead of letting it speak: "It's worth noting that", "Interestingly", "Notably", "Importantly", "Undoubtedly". One in 2,000 words is fine; three in 500 is emphasis-stacking. Flag by density.

### 56. Excessive structure
More than three headings in under 300 words, or 8+ bullets in under 200 words, is AI trying to look organized. Merge sections or use prose. Also flag default scaffolding headers ("Overview", "Key Points", "Summary", "Conclusion"); use headers that say something specific. Decorative structure counts too: a horizontal rule between every section, skipped heading levels (## straight to ####), several level-1 headings in one document, arrows or emoji in headings. Remove the decoration and keep the hierarchy honest.

### 57. Numbered-list inflation
"Three key takeaways", "Five things to know", "the top seven". Use a numbered list only when the content genuinely has that many discrete parallel items. Padding to hit a number means the list should not exist.

### 58. Low information density (treadmill)
Restating the premise in fresh words instead of advancing it: lots of motion, no distance. The tell is that you could cut 40-60% and lose nothing. For each paragraph, name the one fact, claim, or turn it adds; if there is none, cut it.

### 59. Vocabulary uniformity (stylometric)
On general prose over ~200 words, a very low type-token ratio (distinct words / total words, below ~0.40) signals a model locked on a small vocabulary loop. Human prose usually lands 0.50-0.65. The fix is not a thesaurus pass; it is to broaden the *what*: name specific things, cite specific cases, replace a re-used abstract noun with the concrete instance behind it. (Narrow technical topics and second-language writing legitimately compress vocabulary, so treat low TTR as a prompt to look, not a verdict.)

### 60. Rejected-alternative commentary (negative decision logs)
Comments, docs, or notes that justify a choice by narrating what was *not* chosen: "did not use X, went with Y", "instead of a Map, this uses an array", "rather than recursion, we iterate", "chose not to cache here". The artifact describes the road not taken rather than the thing as it is. AI produces these because it is narrating its own decision process; a reader six months later only needs to know what the code does and why *this* approach holds, not the menu of options that were passed over.

Show what was chosen, not the negative of what wasn't. Cut the comparison when there is no reason attached, or when the reason is common sense ("used a list because order matters" next to an obviously ordered list) or hand-waving ("for flexibility", "for clarity"). This is the decision-log cousin of #42 (diff-anchored writing): #42 narrates a change, this narrates a discarded alternative.

**Carve-out, keep it when the why is load-bearing.** A rejected alternative earns its place only when the reason is genuine, non-obvious, and would otherwise trip up the next person: a real constraint, a measured tradeoff, or a gotcha that invites someone to "fix" the code back to the obvious-but-wrong version. Then name the alternative *and* the concrete reason. Prefer framing it as a warning, not a decision diary.

**Before:**
> // We don't use a recursive approach here, we use an explicit stack instead.
> // Chose Postgres over MySQL for the database.

**After:**
> // Explicit stack, not recursion: inputs nest ~50k deep and blow the call stack.
> Postgres. (Drop the MySQL comparison; no one needs the runner-up.)

### 61. Social endorsement closers
Share-post sign-offs that instruct the reader to value the piece instead of showing why: "This one is worth your time:", "must-read", "Do yourself a favor and read this", "Save this for later", "Bookmark this", "Don't sleep on this one", "Thank me later". The LinkedIn share-post tell. Cut the closer and say what the linked thing does or argues; one specific claim beats an instruction to care.

### 62. Lingering-attention claims
Performing that a thing stuck with you: "the line I keep coming back to", "the quote I can't stop thinking about", "this has been rattling around in my head", "the bit I keep returning to". The claim substitutes for the reason. Quote the line and say what it changed in your thinking; if nothing did, cut it. Bare "I keep coming back to X" passes when a reason follows.

### 63. Speculative scenario openers
"Imagine a world where", "Picture a future in which", "Envision a world where", including the padded "Imagine, for a moment, a world where". The opener asks the reader to do the work of the argument. Start with the concrete claim or the real example the scenario was standing in for.

### 64. Launch-copy introductions
Product-announcement staging: "Meet X, your new favorite ...", "Meet X, the new standard in ...", "Think X meets Y", "Say hello to X", "Enter X." Name the thing and what it does in one plain sentence.

**Before:** Meet Relay, your new go-to for incident timelines.
**After:** Relay builds incident timelines from Slack threads.

### 65. Dramatized contrast against the crowd
A claim propped on an invented lagging crowd, usually stamped with a date: "shipped it in 2022, while everyone else was still debating timelines", "while the industry wrote think-pieces", "while the competition played catch-up". The crowd costs nothing because nobody has to be named. State the fact and cut the clause, or name the actual competitor and what they did. Literal simultaneity stays: "she read while everyone else watched the film" is narrative, not a tell.

### 66. Fake-casual props
Stage directions and parenthetical winks that perform informality: *checks notes*, *chef's kiss*, *mic drop*, *takes a deep breath*, *sips coffee*, *nervous laughter*, "(yes, really)", "(no, seriously)". Also "because of course it does" and the self-Q&A volley ("Did it work? Reader, it did."). Delete the prop. If the sentence needed the wink to land, rewrite the sentence.

### 67. Performed-insight phrases
Essayist tics that announce profundity rather than deliver it: "sit with that for a moment", "that's not nothing", "you already know the answer", "the punchline is", "worth naming", "don't take my word for it", "that's the whole point", "that's the part nobody mentions", "the only metric that matters", "X is dead; long live X", and sentence-initial "Turns out". One can be voice; several in a piece is a tell. Replace each with the claim it gestured at: "that's not nothing" becomes the actual size of the thing. Quoted speech and genuine comedy, where a punchline is literal, are exempt.

### 68. Dev-blog boilerplate
Slogans standing in for demonstrable properties: "batteries included", "it just works", "zero config", "sane defaults", "small enough to fit in your head". Name the behavior: "installs with no config file" beats "zero config"; "the whole API is six functions" beats "fits in your head". Quoting a product's own tagline is exempt.

### 69. Narrated candor
Announcing a disclosure instead of making it: "I want to be upfront:", "To be fully transparent:", "Rather than bury this, I'll say it plainly:", "Two caveats I would rather flag than let you discover later:", "Being honest about the limitations here:". Chatbot artifacts perform helpfulness, sycophancy validates the reader, and this performs candor about oneself. The deletion test: cut the frame, and if nothing is lost it was never content ("Two caveats: X and Y" says the same thing). Keep the disclosure itself ("I haven't tested this on Windows") and conventional conflict-of-interest openers that carry a material fact ("In the interest of full disclosure, I own shares in the company"). Judgment-only: the phrasings overlap with real disclosure language, so no regex can separate them.

### 70. Recap-flattery opener
Replying to someone by summarizing their own work back at them with praise before getting to the point: "Thanks for all the legwork here. The migration script and rollback plan you worked through are what made this possible." They know what they did; the recap performs appreciation. Substance first, and if thanks is warranted, one plain clause: "Thanks for the legwork. This looks right to me, one comment below." Distinct from sycophantic tone (generic validation) and acknowledgment loops (restating the question): this echoes the other person's own work.

### 71. Wall-of-text replies
In conversational registers (issue and PR comments, chat, DMs, casual email), a reply-length text of under about 150 words with four or more sentences and no line break anywhere. People break replies at thought boundaries; models emit one dense block. Break at those boundaries. Never flag continuous long-form prose for lacking internal breaks: a single dense paragraph is the correct shape in a blog intro or a docs paragraph, which is why this is a judgment call and not a detector.

### 72. Aphorism formulas
Sayings that sound deep and say nothing: "X is the language of Y", "X is the currency of Y", "the architecture of Y", "X becomes a trap", "X is the new Y", "a feature, not a bug" as a closer. The formula manufactures profundity from a genitive. Replace with the specific claim, or cut. Judgment-only: a regex for "X is the Y of Z" would flag "Paris is the capital of France".

### 73. Arguing with no one
Staging a rebuttal to an objection nobody raised: "I'm not saying X", "To be clear, this isn't about", "Don't get me wrong", "This isn't mainly about", "A tempting approach would be", "One might be tempted to", "You might think ... but". The writer invents a wrong reader to correct. State the position; if a real objection exists, name who holds it and answer it. False concession (#54) is the balanced-sounding cousin; this is the defensive one.

### 74. Vague connection or association
Linking two things without saying how: "associated with", "in association with", "connected to", "in connection with", "linked to", "tied to", "related to". The verb hides whether one caused, funded, employed, preceded, or merely resembled the other. Name the relation.

**Before:** The outage was linked to the migration.
**After:** The migration dropped an index, and the missing index caused the outage.

### 75. Moral-adjective category errors
Moral or emotional adjectives on things that cannot hold them: "an honest architecture", "a humble function", "a generous API", "a brave default". Nearby: ontological slop about assumptions ("baked into the fabric of the system", "the DNA of the codebase") and gratuitous universal quantifiers ("every engineer knows", "all systems eventually"). Say what the thing does. "An honest error message" -> "an error message that names the failing field".

### 76. Invented contrast-pair mirroring
Manufactured antitheses where the two halves mirror each other's grammar but only one carries content: "We optimize for depth, not breadth. For signal, not noise. For durability, not novelty." The second half of each pair exists to complete the rhythm. Keep the half that says something and drop the mirror, or state the tradeoff with the actual thing that was given up.

### 77. Historical analogy stacking
Piling up grand precedents to borrow their weight: "like the printing press, like electricity, like the internet", "the Gutenberg moment for X", "this is our Sputnik". One earned analogy, developed, can carry an argument; a stack of them is a costume. Pick the one that maps, show where the mapping holds and where it breaks, and cut the rest.

### 78. Transformation crutch
Relabeling without explaining: "X is no longer a Y; it's a Z", "this turns X into Y", "the shift from X to Y", stacked across a passage with no account of what changed. Literal and explained changes pass ("the queue became a log once we needed replay"). Flag when several relabelings stand where the mechanism should be. P2, judged across the passage, never per sentence.

### 79. Same-opener sentence runs
Three or more consecutive sentences opening on the same word ("Maybe nobody needed it. Maybe it solved the wrong problem. Maybe the timing was off."), or built on the same skeleton ("A cart is an object in the system. A chat room is an object in the system."). Deliberate anaphora is a device; models reach for it constantly. Keep the first, then vary or merge the rest. Pronoun-opener runs ("He ... He ... He ...") are ordinary narration and pass.

### 80. Colon reveals
A noun phrase, a colon, then a lowercase dramatic reveal: "The detail that makes it work: a separate agent grades it.", "The best part: it learns." The colon does the work a sentence should do, and the lowercase clause after it performs a reveal the content has not earned. Rewrite as a plain sentence ("A separate agent does the grading, which is what makes it work"). Colons keep their real jobs: lists, labels, and quotes. Infomercial hooks (#52) are the interrogative twin of this ("The catch?", "The best part?"); this is the declarative one. A full clause before the colon is ordinary punctuation and passes ("The reason it works is simple: nobody touches it"), as does a colon opening onto a genuine list. Sourced from `petergyang/no-ai-slop` (MIT).

---

## Code and repository artifacts

AI tells specific to source, comments, commits, PRs, and tests. These are
**judgment-only** (the regex detector does not run on code) and they apply under
the `code` context profile (see [profiles.md](profiles.md)), which also relaxes
prose-only rules that do not fit code.

One principle sits under all of them: **comment the *why*, not the *what*.** The
code already states what it does. A comment earns its place only when it captures
intent, a constraint, a gotcha, or context the code cannot express. Patterns 85
and 87 touch executable logic, so for those the skill **flags and explains; it
never silently cuts.**

### 81. Restating-the-code comments
Comments that paraphrase the line below them and add nothing.

**Before:**
> i += 1  // increment i by 1
> users = []  // initialize an empty list for users

**After:**
> i += 1
> users = []

*Carve-out:* keep it when it explains the why, e.g. `i += 1  // skip the header row`.

### 82. Ceremonial docstrings
Doc blocks that fill every slot with the function's own name and types, so the doc says exactly what the signature already says.

**Before:**
> /** Gets the user by ID. @param userId The user ID. @returns The user. */

**After:**
> (delete it) — or, if it earns a docstring — /** Returns null for soft-deleted users; callers must handle that. */

*Carve-out:* public API docs, non-obvious return contracts, units, side effects, ownership.

### 83. Tutorial comments in production code
Explaining the language or a library to an imagined student: "Arrow functions preserve `this`, so we use one here", "We await the promise to get the resolved value". The codebase is not a textbook. Delete them.

### 84. Banner and divider comments
`// ===== HELPERS =====`, `// ---- Main logic ----` used to over-organize a short file. If a file needs banners to navigate, split it rather than decorate it. (Code cousin of #56, excessive structure.)

### 85. Placeholder and TODO theater (flag, don't cut)
Scaffolding shipped as if it were finished work: `// TODO: add validation` on a merged path, `throw new Error("Not implemented")` reachable in production, `const apiKey = "your-api-key-here"`. Code cousin of #45 (unfilled placeholders). Because a TODO can mark real, intentionally-deferred work, **flag it and ask** rather than deleting it; the fix is to do the work or remove the dead stub, and that is the author's call.

### 86. Inflated commit and PR prose
Tier 1 vocabulary (see #3) leaking into repo metadata, plus vague bullet-soup descriptions. State what changed and why, concretely.

**Before:**
> Refactor and enhance the authentication module for improved robustness and maintainability
> ## Changes: Improved performance. Enhanced error handling. Updated various files.

**After:**
> Lock account after 5 failed logins (was unlimited)
> Replaces the per-request DB lookup with a 60s cache; cuts auth latency from ~40ms to ~3ms.

### 87. Over-defensive ceremony (flag, don't cut)
Try/catch that only rethrows or logs-and-swallows, null guards on values that cannot be null, parameters added "just in case", a `let result = ...; return result;` two-step. This **edits executable logic**, and a guard sometimes protects a real edge case the author hit once at 3am. So the skill **reports the smell and proposes the change**; it does not remove a guard on its own. Treat it like #60's carve-out: assume a check may be load-bearing until shown otherwise.

### 88. Vacuous tests and over-described test names
Tautological assertions (`expect(true).toBe(true)`), tests that only assert a mock was called with what you fed the mock, and names like `it("should successfully return the correct value given valid input under normal conditions")`. Test the behavior, and name the test for that behavior: `it("locks the account after 5 failed logins")`.
