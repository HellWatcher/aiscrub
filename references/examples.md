# Before / after examples

Short transformations first, then one full worked example that runs the whole
loop: draft, audit, score, final.

## Short transformations

### Throat-clearing and binary contrast
**Before:** "Here's the thing: building products is hard. Not because the technology is complex. Because people are complex. Let that sink in."
**After:** "Building products is hard. The technology is manageable. People aren't."

### Filler and unnecessary reassurance
**Before:** "It turns out that most teams struggle with alignment. The uncomfortable truth is that nobody wants to admit they're confused. And that's okay."
**After:** "Teams struggle with alignment. Nobody admits the confusion."

### Business jargon stack
**Before:** "In today's fast-paced landscape, we need to lean into discomfort and navigate uncertainty with clarity. This matters because your competition isn't waiting."
**After:** "Move faster. Your competition is."

### Significance inflation and copula avoidance
**Before:** "Gallery 825 serves as LAAA's exhibition space and boasts over 3,000 square feet, marking a pivotal venue in the local art landscape."
**After:** "Gallery 825 is LAAA's exhibition space. It has four rooms totaling 3,000 square feet."

### Superficial -ing analysis
**Before:** "The temple's palette of blue, green, and gold resonates with the region, symbolizing the bluebonnets and the Gulf, reflecting the community's connection to the land."
**After:** "The architect chose blue, green, and gold to reference local bluebonnets and the Gulf coast."

## Full worked example

**Source (AI-sounding):**
> Great question! Here is an essay on this topic. I hope this helps!
>
> AI-assisted coding serves as an enduring testament to the transformative potential of large language models, marking a pivotal moment in the evolution of software development. In today's rapidly evolving landscape, these groundbreaking tools—nestled at the intersection of research and practice—are reshaping how engineers ideate, iterate, and deliver.
>
> At its core, the value is clear: streamlining processes, enhancing collaboration, and fostering alignment. It's not just about autocomplete; it's about unlocking creativity at scale. The tool serves as a catalyst. The assistant functions as a partner.
>
> In conclusion, the future looks bright. Exciting times lie ahead! Let me know if you'd like me to expand on any section!

**Draft rewrite:**
> AI coding assistants speed up some tasks. In a 2024 study, developers using an assistant finished simple functions faster than a control group but showed no gain on debugging or design decisions.
>
> The tools are good at boilerplate: config files, test scaffolding, repetitive refactors. They are bad at knowing when they are wrong. I have accepted suggestions that compiled, passed lint, and still did the wrong thing because I stopped paying attention.
>
> None of this makes them useless. It makes them tools. They do not replace judgment, and without tests you cannot tell whether a suggestion is right.

**Audit (what still reads as AI):**
- The rhythm is a touch tidy; the paragraphs are evenly paced.
- The closer ("without tests you cannot tell...") leans slogan-y.
- "In a 2024 study" reads like a placeholder unless the study is real and named.

**Score:** Directness 8, Rhythm 6, Trust 8, Authenticity 6, Density 8 = **36/50**. Passes, but Rhythm and Authenticity are weak, so one more pass.

**Final rewrite:**
> AI coding assistants make you faster at the boring parts. Not everything, and definitely not architecture.
>
> They are great at boilerplate: config files, test scaffolding, the refactors you would rather not type. They are also great at looking right while being wrong. I have shipped suggestions that compiled, passed lint, and missed the point, because I stopped reading closely.
>
> People I talk to split into two camps. Some treat it like autocomplete for chores and review every line. Others switched it off after it kept suggesting patterns they did not want. Both seem reasonable to me. If you do not have tests, though, you are mostly guessing.

**Final score:** Directness 9, Rhythm 8, Trust 8, Authenticity 8, Density 8 = **41/50**. Clears the gate, zero em or en dashes.

**Main changes:** Cut the chatbot framing, significance inflation, the -ing padding, the rule of three, the "not just X, it's Y" contrast, the copula avoidance, the em dashes, and the upbeat conclusion. Rebuilt the voice with varied rhythm and a concrete admission.
