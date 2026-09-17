/**
 * Runner for the split detector fixtures.
 *
 * Requires each concern file in a deterministic order so every `test(...)`
 * registers against the shared harness counter, then prints the aggregate
 * result exactly once. Individual concern files never call process.exit.
 */

const { summary } = require('./_harness');

const files = [
  './gates.test.js',
  './scoring.test.js',
  './vocab-phrases.test.js',
  './newer-phrases.test.js',
  './newer-phrases-negative.test.js',
  './structural.test.js',
  './colon-reveal.test.js',
  './stylometry.test.js',
  './normalization.test.js',
  './trinary.test.js',
  './fingerprints.test.js',
  './echo.test.js',
];

for (const f of files) {
  require(f);
}

summary();
