// Engine barrel — assembles the public AIDetector object with exactly the
// seven keys the original single-file module exported.
const { analyzeText } = require('./analyze');
const { normalizeText } = require('./normalize');
const { detectEcho } = require('./echo');
const { getLabel, getColor } = require('./classify');
const { SEVERITY_LABELS, TYPE_LABELS } = require('./constants');

module.exports = {
  analyzeText,
  normalizeText,
  detectEcho,
  getLabel,
  getColor,
  SEVERITY_LABELS,
  TYPE_LABELS,
};
