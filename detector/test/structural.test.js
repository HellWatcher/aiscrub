const assert = require('node:assert/strict');
const AIDetector = require('../patterns.js');
const { test } = require('./_harness');

console.log('Structural fixtures');

test('em-dash detector ignores CLI flags like --save-dev', () => {
  const text = 'Run npm install --save-dev and then npm run build --no-verify --silent. Takes about ten seconds on this machine. The package is installed into node_modules directly after the install command completes successfully.';
  const r = AIDetector.analyzeText(text);
  const emDashIssues = r.issues.filter((i) => i.type === 'em-dash');
  assert.equal(emDashIssues.length, 0, 'CLI flags should not count as em dashes');
});

test('crypto-shill social post with hashtag block + bullet-NP lists flags', () => {
  // Reported 2026-05-16 as a "skipped" detection. Avoids every Tier 1
  // word ("delve", "robust", "leverage") and substitutes synonyms the
  // wordlist misses, but stacks structural signals: 6-item bullet-NP
  // list, 15-tag hashtag block, "may become one of the most important
  // narratives" future-narrative template, "could potentially" hedge
  // stack, and ten distinct crypto-shill boilerplate phrases.
  const text = `The future of decentralized computational infrastructure is evolving rapidly as blockchain-integrated mining ecosystems continue to merge with artificial intelligence, distributed compute, and tokenized incentive structures.

MineBench represents an interesting example of this emerging sector by combining benchmark-based mining participation, token rewards, and scalable network contribution models into a unified ecosystem designed for long-term sustainability and user engagement.

After several hours of testing, the platform demonstrated:

* Stable mining efficiency
* Reliable pool connectivity
* Optimized RandomX computational performance
* Low failed share rates
* Effective hardware utilization
* Consistent thermal stability

The integration of reward-based participation mechanisms alongside decentralized infrastructure concepts could potentially create new opportunities for community-driven computational networks.

The intersection of AI, DePIN, mining infrastructure, and decentralized compute may become one of the most important narratives of the next market cycle.

#AI #Crypto #Blockchain #DePIN #Mining #Web3 #Solana #RandomX #DecentralizedAI #PassiveIncome #Infrastructure #Innovation #Technology #FutureTech #Tokenomics`;
  const r = AIDetector.analyzeText(text);
  const types = new Set(r.issues.map((i) => i.type));
  assert.ok(types.has('bullet-np-list'), 'expected bullet-np-list flag');
  assert.ok(types.has('hashtag-stuff'), 'expected hashtag-stuff flag');
  assert.ok(types.has('future-narrative'), 'expected future-narrative flag');
  assert.ok(types.has('hedge-stack'), 'expected hedge-stack flag');
  assert.ok(types.has('tier3-phrase-cluster'), 'expected tier3-phrase-cluster flag');
  assert.ok(r.score >= 25, `expected score ≥25 (Some/Moderate), got ${r.score}`);
});

test('hashtag-stuff does not fire on prose with 2-3 hashtags', () => {
  const text = 'Shipped the new build last night. Catching bugs faster with the new instrumentation. Notes are in the doc, and the next push lands tomorrow. #buildinpublic #devlog';
  const r = AIDetector.analyzeText(text);
  const types = new Set(r.issues.map((i) => i.type));
  assert.ok(!types.has('hashtag-stuff'), 'should not flag 2 hashtags as hashtag-stuff');
});

test('bullet-np-list does not fire on prose containing short verb-form bullets', () => {
  // Genuine list items with finite verbs should not trip the bare-NP
  // detector. The verb-token guard is what keeps todo lists, changelog
  // entries, and step-by-step instructions out of the false-positive
  // bucket.
  const text = `Today's changelog:

* fixed the auth bug that was hitting Safari users
* removed the legacy webhook handler that nobody calls anymore
* added a retry on the token refresh path
* shipped the new build to staging this morning
* will deploy to prod after the smoke tests pass

That's the full list for this push.`;
  const r = AIDetector.analyzeText(text);
  const types = new Set(r.issues.map((i) => i.type));
  assert.ok(!types.has('bullet-np-list'), 'verb-form bullets should not trip bare-NP detector');
});

test('bullet-np-list ignores bullets inside fenced code blocks', () => {
  // CLI flag docs / option dumps inside ``` fences are not prose AI
  // scaffolding. False-positive that would fire on most READMEs.
  const text = "Run with one of these modes via `--mode`:\n\n```\n- unit\n- smoke\n- integration\n- e2e\n- perf\n- stress\n```\n\nDefaults to `unit` if omitted.";
  const r = AIDetector.analyzeText(text);
  const types = new Set(r.issues.map((i) => i.type));
  assert.ok(!types.has('bullet-np-list'), 'bullets inside code fences should not flag');
});

test('bullet-np-list flushes on 2+ blank lines between bullet sections', () => {
  // A single blank line is normal Markdown spacing inside one list.
  // Two or more blank lines separate visually-disjoint sections — those
  // should not merge into one long run.
  const text = '* alpha\n* beta\n\n\nA paragraph of prose.\n\n\n* gamma\n* delta\n* epsilon';
  const r = AIDetector.analyzeText(text);
  const types = new Set(r.issues.map((i) => i.type));
  assert.ok(!types.has('bullet-np-list'), 'sections separated by 2+ blank lines should not merge');
});

test('hashtag-stuff matches tags after sentence punctuation', () => {
  // Hashtags immediately following sentence punctuation — common in
  // LinkedIn/X trailing blocks. The prior regex char class `[\s\\]`
  // had a literal backslash and silently missed any tag not preceded
  // by whitespace.
  const text = "Built a thing this week.\n#startup #crypto #web3 #ai #devlog #shipping #foundermode";
  const r = AIDetector.analyzeText(text);
  const types = new Set(r.issues.map((i) => i.type));
  assert.ok(types.has('hashtag-stuff'), 'expected hashtag-stuff on 7-tag trailing block');
});

test('hashtag-stuff excludes URL fragments from the count', () => {
  // URL anchors like example.com/page#section must not count toward
  // the hashtag threshold or every doc post with a fragment link
  // would false-positive.
  const text = 'See the spec at example.com/api#auth and the deploy guide at example.com/ops#rollback and the troubleshooting notes at example.com/help#errors and the changelog at example.com/log#latest. Also kb.example.com/faq#section1 and forum.example.com/t/123#post-4 round out the references.';
  const r = AIDetector.analyzeText(text);
  const types = new Set(r.issues.map((i) => i.type));
  assert.ok(!types.has('hashtag-stuff'), 'URL fragments should not count as hashtags');
});
