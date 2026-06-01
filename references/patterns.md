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

### 3. Inflated vocabulary (tiered)
AI words appear far more often in post-2023 text and tend to co-occur. Flag by tier, not as a flat blocklist, so a single ordinary word in isolation does not get gutted. Tiering is adapted from `conorbronsdon/avoid-ai-writing`.

**Tier 1, always replace.** 5-20x more common in AI text. Replace on sight: delve, landscape (metaphor), tapestry, realm, paradigm, embark, beacon, testament to, robust, comprehensive, cutting-edge, leverage (verb), pivotal, underscores, meticulous, seamless, game-changer, utilize, nestled, vibrant, thriving, showcasing, deep dive, unpack, intricate/intricacies, ever-evolving, enduring, daunting, holistic, actionable, impactful, learnings, thought leader, best practices, at its core, synergy, interplay, in order to, due to the fact that, serves as, boasts, commence, endeavor, embrace (metaphor).

**Tier 2, flag when 2+ appear in one paragraph.** Fine alone, a tell in pairs: harness, navigate, foster, elevate, unleash, streamline, empower, bolster, spearhead, resonate, revolutionize, facilitate, underpin, nuanced, crucial, multifaceted, ecosystem (metaphor), myriad, plethora, encompass, catalyze, reimagine, galvanize, augment, cultivate, illuminate, elucidate, cornerstone, paramount, poised, burgeoning, nascent, quintessential, overarching.

**Tier 3, flag only at high density (~3%+ of words).** Normal words AI overuses: significant, innovative, effective, dynamic, scalable, compelling, unprecedented, exceptional, remarkable, sophisticated, instrumental, world-class, state-of-the-art.

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

### 11. Binary contrasts
False drama through a telegraphed reversal. State the point directly and drop the negation.

Patterns: "Not because X, but because Y", "[X] isn't the problem. [Y] is.", "The answer isn't X. It's Y.", "It feels like X. It's actually Y.", "not just X but also Y", "stops being X and starts being Y".

**Before:** It's not just about the beat riding under the vocals; it's part of the aggression and atmosphere.
**After:** The heavy beat adds to the aggressive tone.

### 12. Negative listing
Listing what something is *not* before revealing what it *is*. A rhetorical striptease.

Patterns: "Not a X... Not a Y... A Z.", "It wasn't X. It wasn't Y. It was Z." State Z. The reader does not need the runway.

### 13. Dramatic fragmentation
Sentence fragments for emphasis read as manufactured profundity.

Patterns: "[Noun]. That's it. That's the [thing].", "X. And Y. And Z.", "This unlocks something. [Word]." Use complete sentences and trust the content.

### 14. Rhetorical setups
Announce insight rather than deliver it.

Patterns: "What if [reframe]?", "Here's what I mean:", "Think about it:", "And that's okay." Make the point and let readers draw the conclusion.

### 15. Outline-like "Challenges and Future Prospects" sections
Formulaic filler sections. Replace with specific facts.

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

"I hope this helps!", "Of course!", "Certainly!", "You're absolutely right!", "Would you like...", "let me know", "here is a...".

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

### 41. Hyphenated word-pair overuse
AI hyphenates compounds uniformly, including in predicate position. Keep the hyphen when the compound is attributive; drop it when it follows the noun.

**Before:** The team is cross-functional, the report is high-quality, the method is data-driven.
**After:** The team is cross functional, the report is high quality, the method is data driven.

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
Internal citation tokens that survive copy-paste from chat UIs: `citeturn0search0`, `contentReference[oaicite:0]{index=0}`, `oai_citation`, `[attached_file:1]`, `grok_card`. Delete every token. If a citation was meaningful, replace it with a real reference.

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
Questions used to stall before the point: "But what does this mean for developers?", "So why should you care?", "What's next?". If you know the answer, say it. A rhetorical question is earned by strong setup, not dropped as a section transition.

### 54. False concession
"While X is impressive, Y remains a challenge" used to sound balanced without weighing anything, when both halves are vague. Make the concession specific (name what is impressive, name the actual challenge) or pick a side and argue it.

### 55. Confidence-calibration phrases
Words that tell the reader how to feel about a fact instead of letting it speak: "It's worth noting that", "Interestingly", "Notably", "Importantly", "Undoubtedly". One in 2,000 words is fine; three in 500 is emphasis-stacking. Flag by density.

### 56. Excessive structure
More than three headings in under 300 words, or 8+ bullets in under 200 words, is AI trying to look organized. Merge sections or use prose. Also flag default scaffolding headers ("Overview", "Key Points", "Summary", "Conclusion"); use headers that say something specific.

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
