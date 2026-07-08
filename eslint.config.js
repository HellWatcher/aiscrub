// Flat ESLint config (ESLint 9). Correctness only — Prettier owns formatting
// (eslint-config-prettier is applied last to switch off stylistic rules).
// Dev-only tooling; the detector runtime stays zero-dependency.
'use strict';

const js = require('@eslint/js');
const prettier = require('eslint-config-prettier');

module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        module: 'writable',
        require: 'readonly',
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        Buffer: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'error',
      'no-undef': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'smart'],
      // The normalize / lookalike detectors use control-range char classes
      // deliberately to strip zero-width and homoglyph bypass characters.
      'no-control-regex': 'off',
    },
  },
  // The line-cap guard owns file length; ESLint must not also police it, so
  // that the DATA-file exemption lives in exactly one place.
  prettier,
  {
    ignores: ['node_modules/', 'package-lock.json'],
  },
];
