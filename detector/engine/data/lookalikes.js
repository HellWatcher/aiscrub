// Latin-lookalike character maps used by the normalization pre-pass.
// Humanizer tools and prompt-injection bypass techniques insert
// invisible / lookalike chars to defeat exact-string detectors. Unicode
// ranges sourced from It-s-AI/llm-detection/detection/attacks/.

const CYRILLIC_LOOKALIKES = {
  'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c', 'х': 'x',
  'у': 'y', 'к': 'k', 'м': 'm', 'н': 'h', 'в': 'b', 'т': 't',
  'А': 'A', 'Е': 'E', 'О': 'O', 'Р': 'P', 'С': 'C', 'Х': 'X',
  'У': 'Y', 'К': 'K', 'М': 'M', 'Н': 'H', 'В': 'B', 'Т': 'T',
};
const GREEK_LOOKALIKES = { 'ο': 'o', 'Ο': 'O', 'α': 'a', 'Α': 'A', 'ρ': 'p', 'Ρ': 'P' };

module.exports = { CYRILLIC_LOOKALIKES, GREEK_LOOKALIKES };
