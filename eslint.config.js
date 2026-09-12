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
      // The bypass-char stripper matches literal zero-width characters inside
      // a regex literal (and tests embed them in fixtures). Allow them there;
      // still catch a stray invisible char pasted into ordinary code.
      'no-irregular-whitespace': [
        'error',
        { skipStrings: true, skipTemplates: true, skipRegExps: true, skipComments: true },
      ],
    },
  },
  // The line-cap guard owns file length; ESLint must not also police it, so
  // that the DATA-file exemption lives in exactly one place.
  prettier,
  {
    // docs/tmp/ holds gitignored vendored upstream copies used for porting research.
    ignores: ['node_modules/', 'package-lock.json', 'docs/'],
  },
];
