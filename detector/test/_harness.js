/**
 * Shared test harness for the split detector fixtures.
 *
 * A single module-level failure counter is shared across every concern file
 * that imports this module (Node caches the module instance). Each file calls
 * `test(...)`; the aggregate `summary()` is invoked once by `run.js`.
 */

let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed++;
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
  }
}

function summary() {
  if (failed > 0) {
    console.error(`\n${failed} test(s) failed`);
    process.exit(1);
  }
  console.log('\nAll detector fixtures passed.');
}

module.exports = { test, summary };
