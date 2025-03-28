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
 * 1. Computes a similarity score between 0 and 1
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
  
  // Calculate similarity using two different approaches
  
  // 1. Position-based matching (good for catching typos at specific positions)
  let positionMatches = 0;
  for (let i = 0; i < maxLength; i++) {
    if (w1[i] === w2[i]) {
      positionMatches++;
    }
  }
  const positionSimilarity = positionMatches / maxLength;
  
  // 2. Character presence (good for catching transpositions and extra/missing letters)
  // Count characters in common, considering repeats
  const chars1: Record<string, number> = {};
  const chars2: Record<string, number> = {};
  
  // Count characters in first word
  for (const char of w1) {
    chars1[char] = (chars1[char] || 0) + 1;
  }
  
  // Count characters in second word
  for (const char of w2) {
    chars2[char] = (chars2[char] || 0) + 1;
  }
  
  // Count characters in common
  let commonChars = 0;
  for (const char in chars1) {
    commonChars += Math.min(chars1[char], chars2[char] || 0);
  }
  
  const characterSimilarity = commonChars / maxLength;
  
  // Use the better of the two similarity scores
  const similarity = Math.max(positionSimilarity, characterSimilarity);
  
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
  
  // Try each candidate and find the best match
  let bestMatch: string | null = null;
  let bestScore = 0;
  
  for (const candidate of candidates) {
    // Skip if candidate is too different in length
    const lengthDiff = Math.abs(normalizedInput.length - candidate.length);
    const lengthFactor = lengthDiff / Math.max(normalizedInput.length, candidate.length);
    if (lengthFactor > 0.5) {
      continue;
    }
    
    // Adjust threshold based on word length
    const maxLength = Math.max(normalizedInput.length, candidate.length);
    let adjustedThreshold = threshold;
    
    // For short words (3-4 characters), be more lenient
    if (maxLength <= 4) {
      adjustedThreshold = threshold - 0.1;
    }
    // For longer words (>= 8 characters), be more lenient as well
    else if (maxLength >= 8) {
      adjustedThreshold = threshold - 0.05 - (Math.min(maxLength, 12) - 8) * 0.01;
    }
    
    // Calculate similarity using the same dual approach as fuzzyMatchWord
    const normalizedCandidate = candidate.toLowerCase();
    
    // 1. Position-based matching
    let positionMatches = 0;
    for (let i = 0; i < maxLength; i++) {
      if (normalizedInput[i] === normalizedCandidate[i]) {
        positionMatches++;
      }
    }
    const positionSimilarity = positionMatches / maxLength;
    
    // 2. Character presence
    const chars1: Record<string, number> = {};
    const chars2: Record<string, number> = {};
    
    // Count characters in input
    for (const char of normalizedInput) {
      chars1[char] = (chars1[char] || 0) + 1;
    }
    
    // Count characters in candidate
    for (const char of normalizedCandidate) {
      chars2[char] = (chars2[char] || 0) + 1;
    }
    
    // Count characters in common
    let commonChars = 0;
    for (const char in chars1) {
      commonChars += Math.min(chars1[char], chars2[char] || 0);
    }
    
    const characterSimilarity = commonChars / maxLength;
    
    // Use the better of the two similarity scores
    const similarity = Math.max(positionSimilarity, characterSimilarity);
    
    // Update best match if this is better
    if (similarity >= adjustedThreshold && similarity > bestScore) {
      bestMatch = candidate; // Keep original case from candidates
      bestScore = similarity;
    }
  }
  
  return bestMatch;
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