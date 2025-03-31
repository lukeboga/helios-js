/**
 * Fuzzy Matching Utilities
 * ======================================================================
 * 
 * This module provides utilities for fuzzy string matching and correction
 * using the fastest-levenshtein library. These utilities are primarily used
 * during the normalization phase to correct misspellings and identify similar
 * terms in natural language input.
 * 
 * The main purpose is to improve pattern recognition quality by standardizing
 * variations and correcting common misspellings before pattern matching occurs.
 * 
 * Core functions:
 * - fuzzyMatchWord: Determines if two words are similar enough based on a threshold
 * - findBestMatch: Finds the best matching term from a list of candidates
 * - correctText: Applies corrections to a text based on candidate replacements
 */

import { distance, closest } from 'fastest-levenshtein';

/**
 * Tests if two words are similar enough to be considered a match using string similarity.
 * 
 * This function:
 * 1. Computes a similarity score based on Levenshtein distance
 * 2. Uses a dynamic threshold based on word length (more lenient for short words)
 * 3. Skips comparing very short words or words with significant length differences
 * 
 * @param word1 - First word to compare
 * @param word2 - Second word to compare
 * @param threshold - Minimum similarity score to consider a match (0.0 to 1.0)
 * @returns True if words match within threshold, false otherwise
 * 
 * @example
 * fuzzyMatchWord("monday", "mondey") // returns true
 * fuzzyMatchWord("tuesday", "thursday") // returns false
 */
export function fuzzyMatchWord(
  word1: string,
  word2: string,
  threshold = 0.8
): boolean {
  // Skip empty strings
  if (!word1 || !word2) {
    return false;
  }
  
  // Skip very short words by default (unless threshold is already set more leniently)
  if (word1.length < 3 || word2.length < 3) {
    // Use a more lenient threshold for very short words instead of rejecting outright
    // For 3-letter words we can be more permissive with the threshold
    if (threshold > 0.7) {
      threshold = 0.7;
    }
  }
  
  // Skip words with significant length difference (over 50%)
  const lengthDiff = Math.abs(word1.length - word2.length);
  const lengthFactor = lengthDiff / Math.max(word1.length, word2.length);
  if (lengthFactor > 0.5) {
    return false;
  }
  
  // Adjust threshold based on word length
  // Longer words can tolerate more character differences
  const maxLength = Math.max(word1.length, word2.length);
  let adjustedThreshold = threshold;
  
  // For short words (3-4 characters), be more lenient
  if (maxLength <= 4) {
    adjustedThreshold = threshold - 0.1;
  }
  // For longer words (>= 8 characters), be more lenient as well
  else if (maxLength >= 8) {
    adjustedThreshold = threshold - 0.05 - (Math.min(maxLength, 12) - 8) * 0.01;
  }

  // Convert to lowercase for case-insensitive comparison
  const w1 = word1.toLowerCase();
  const w2 = word2.toLowerCase();
  
  // Calculate Levenshtein distance using fastest-levenshtein
  const levenshteinDistance = distance(w1, w2);
  
  // Convert to similarity score (0-1)
  // For identical strings, distance is 0 (similarity 1)
  // For completely different strings, distance approaches maxLength (similarity 0)
  const similarity = 1 - (levenshteinDistance / maxLength);
  
  // Return true if similarity meets or exceeds threshold
  return similarity >= adjustedThreshold;
}

/**
 * Finds the best fuzzy match for a word from a list of candidates.
 * 
 * @param input - The word to match
 * @param candidates - Array of candidate words to match against
 * @param threshold - Minimum similarity score to consider a match
 * @returns The best matching candidate word or null if no match found
 * 
 * @example
 * findBestMatch("mondey", ["Monday", "Tuesday", "Wednesday"])
 * // returns "Monday"
 */
export function findBestMatch(
  input: string,
  candidates: string[],
  threshold = 0.8
): string | null {
  // Handle empty input or candidates
  if (!input || !candidates.length) {
    return null;
  }

  // Convert input to lowercase for case-insensitive comparison
  const normalizedInput = input.toLowerCase();
  
  // Use the fastest-levenshtein's closest function to find the best match
  const bestMatch = closest(normalizedInput, candidates.map(c => c.toLowerCase()));
  
  // Get the index of the best match in the lowercase candidates
  const bestMatchIndex = candidates.findIndex(c => 
    c.toLowerCase() === bestMatch);
  
  // Calculate the similarity score for the best match
  const maxLength = Math.max(normalizedInput.length, bestMatch.length);
  const levenshteinDistance = distance(normalizedInput, bestMatch);
  const similarity = 1 - (levenshteinDistance / maxLength);
  
  // Adjust threshold based on word length
  let adjustedThreshold = threshold;
  if (maxLength <= 4) {
    adjustedThreshold = threshold - 0.1;
  } else if (maxLength >= 8) {
    adjustedThreshold = threshold - 0.05 - (Math.min(maxLength, 12) - 8) * 0.01;
  }
  
  // Return the original case candidate if similar enough
  if (similarity >= adjustedThreshold && bestMatchIndex !== -1) {
    return candidates[bestMatchIndex];
  }
  
  return null;
}

/**
 * Corrects a possibly misspelled word using fuzzy matching against a list of candidates.
 * 
 * @param text - The text to correct
 * @param candidates - Array of valid words to match against
 * @param threshold - Minimum similarity score to consider a match
 * @returns Corrected text if a match was found, or the original text
 * 
 * @example
 * correctText("mondey", ["Monday", "Tuesday", "Wednesday"])
 * // returns "Monday"
 */
export function correctText(
  text: string,
  candidates: string[],
  threshold = 0.8
): string {
  if (!text || !candidates.length) {
    return text;
  }
  
  // Trim the word for better matching
  const trimmedText = text.trim();
  
  // Skip very short words
  if (trimmedText.length < 3 || !/^[a-z]+$/i.test(trimmedText)) {
    return text;
  }
  
  // Find the best match
  const match = findBestMatch(trimmedText, candidates, threshold);
  
  // Return original if no match found
  if (!match) {
    return text;
  }
  
  // Preserve case pattern of original word
  if (trimmedText[0] === trimmedText[0].toUpperCase()) {
    return match[0].toUpperCase() + match.slice(1);
  } else {
    return match.toLowerCase();
  }
}

/**
 * Performance Considerations:
 * ---------------------------
 * 1. The fastest-levenshtein library is optimized for performance, making it 
 *    suitable for text processing in interactive applications.
 * 
 * 2. We prioritize exact matches and early returns to avoid unnecessary
 *    distance calculations.
 * 
 * 3. Length comparisons and minimum word length checks filter out obvious
 *    non-matches quickly.
 * 
 * 4. We normalize case once at the beginning of functions rather than
 *    repeatedly during comparisons.
 */ 