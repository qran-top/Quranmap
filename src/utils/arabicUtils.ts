/**
 * Utility functions for Arabic text processing and normalization
 */

// Arabic diacritics and symbols regex
const DIACRITICS_REGEX = /[\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g;

// Normalize Arabic characters for fast and robust search
export function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    .replace(DIACRITICS_REGEX, '') // Remove tashkeel / harakat / Quranic marks
    .replace(/[إأآاٱ]/g, 'ا') // Standardize Alifs
    .replace(/ة/g, 'ه') // Standardize Taa Marbuta
    .replace(/ى/g, 'ي') // Standardize Alif Maqsoora
    .replace(/ؤ/g, 'و') // Standardize Waw with Hamza
    .replace(/ئ/g, 'ي') // Standardize Yaa with Hamza
    .replace(/ء/g, '') // Remove standalone hamza if needed or keep
    .replace(/[\s\-_.,!?:;"'(){}[\]«»]/g, '') // Remove punctuation
    .trim()
    .toLowerCase();
}

// Clean Arabic for display / preview
export function removeTashkeel(text: string): string {
  if (!text) return '';
  return text.replace(DIACRITICS_REGEX, '').trim();
}

/**
 * Check if a word matches a search term
 * Supports:
 * - Exact match
 * - Grammatical prefix match (with 'و', 'ف', 'ب', 'ل', 'ك', 'ال', 'كال', 'فال', 'وال', 'بال', 'لل', 'س')
 * - Grammatical suffix match (e.g. 'هم', 'ها', 'كم', 'نا', 'هم', 'هن', 'هما', 'ه', 'ي', 'ك')
 */
export function matchArabicWord(wordNormalized: string, searchNormalized: string, exactOnly = false): boolean {
  if (!searchNormalized || !wordNormalized) return false;

  if (wordNormalized === searchNormalized) {
    return true;
  }

  if (exactOnly) {
    return false;
  }

  // Common Arabic single and double prefixes
  const prefixes = ['و', 'ف', 'ب', 'ل', 'ك', 'ال', 'كال', 'فال', 'وال', 'بال', 'لل', 'س', 'فس', 'وس'];
  // Common Arabic attached pronoun suffixes
  const suffixes = ['هم', 'هن', 'ها', 'نا', 'كم', 'كن', 'هما', 'ه', 'ي', 'ك', 'ين', 'ون', 'ات', 'ان', 'ة', 'تم', 'تمو', 'وا'];

  // Check prefix match (e.g. محمد -> ومحمد، فمحمد، بمحمد، لمحمد)
  for (const prefix of prefixes) {
    if (wordNormalized === prefix + searchNormalized) return true;
  }

  // Check suffix match (e.g. كتاب -> كتابه، كتابها، كتابهم، كتابنا)
  for (const suffix of suffixes) {
    if (wordNormalized === searchNormalized + suffix) return true;
  }

  // Check prefix + suffix match (e.g. كتاب -> وكتابهم، فكتابنا، بالكتاب)
  for (const prefix of prefixes) {
    for (const suffix of suffixes) {
      if (wordNormalized === prefix + searchNormalized + suffix) return true;
    }
  }

  return false;
}
