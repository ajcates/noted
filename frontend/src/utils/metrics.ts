/**
 * Counts the number of words in a string.
 */
export function countWords(text: string): number {
  if (!text) return 0;
  const words = text.trim().split(/\s+/);
  return words.length === 1 && words[0] === '' ? 0 : words.length;
}

/**
 * Estimates the reading time in minutes based on average reading speed (200 words per minute).
 */
export function estimateReadingTime(text: string): number {
  const words = countWords(text);
  const wordsPerMinute = 200;
  return Math.ceil(words / wordsPerMinute);
}
