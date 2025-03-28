/**
 * Pattern Splitter Module
 * 
 * This module provides functionality to split complex natural language patterns
 * into simpler sub-patterns for more effective processing. It handles the detection
 * and protection of special phrases that should not be split despite containing
 * conjunction terms.
 * 
 * The module implements a hybrid approach that combines:
 * 1. A static list of specific protected phrases
 * 2. Dynamic pattern detection for categories of protected phrases
 * 
 * This design balances flexibility with maintainability, allowing the system to
 * handle a wide range of natural language inputs while remaining easy to extend.
 */

import { v4 as uuidv4 } from 'uuid';
import {
  PROTECTED_PHRASES,
  CONJUNCTION_TERMS,
  DAYS,
  MONTHS,
  ORDINAL_TERMS,
  SPECIAL_PATTERNS,
  type ConjunctionString
} from '../constants';

/**
 * Defines the structure for a protected phrase
 */
export interface ProtectedPhrase {
  /** The original text that was matched */
  original: string;
  
  /** The category of the protected phrase (ordinal, day range, etc.) */
  type: ProtectedPhraseType;
  
  /** The unique placeholder that temporarily replaces this phrase */
  placeholder: string;
}

/**
 * Defines the categories of protected phrases for better organization and debugging
 */
export enum ProtectedPhraseType {
  STATIC_PHRASE = 'static_phrase',
  ORDINAL_COMBINATION = 'ordinal_combination',
  DAY_RANGE = 'day_range',
  MONTH_RANGE = 'month_range',
  SPECIAL_FREQUENCY = 'special_frequency',
  WEEKEND_REFERENCE = 'weekend_reference'
}

/**
 * Result of the pattern splitting operation
 */
export interface SplitPatternResult {
  /** Array of individual pattern strings after splitting */
  patterns: string[];
  
  /** 
   * Map of placeholders to their original protected phrases, 
   * used to restore protected phrases after splitting
   */
  protectedPhraseMap: Map<string, ProtectedPhrase>;
}

/**
 * Splits a natural language pattern into multiple sub-patterns based on conjunction terms,
 * while preserving protected phrases that should not be split.
 * 
 * @param input - The natural language pattern to split
 * @returns An object containing the split patterns and a map of protected phrases
 * 
 * @example
 * splitPattern("every monday and friday") 
 * // returns { patterns: ["every monday", "friday"], protectedPhraseMap: Map }
 * 
 * splitPattern("first and last day of month") 
 * // returns { patterns: ["first and last day of month"], protectedPhraseMap: Map }
 */
export function splitPattern(input: string): SplitPatternResult {
  // Normalize input by converting to lowercase and trimming whitespace
  const normalizedInput = input.toLowerCase().trim();
  
  // Identify and protect phrases that should not be split
  const { processedText, phraseMap } = protectPhrases(normalizedInput);
  
  // Split the processed text on conjunction terms
  const rawPatterns = splitOnConjunctions(processedText);
  
  // Restore protected phrases and clean up the resulting patterns
  const finalPatterns = rawPatterns.map(pattern => {
    // Restore any protected phrases in this pattern
    let restoredPattern = pattern;
    for (const [placeholder, phrase] of phraseMap.entries()) {
      restoredPattern = restoredPattern.replace(placeholder, phrase.original);
    }
    
    // Clean up the pattern by trimming whitespace and fixing spacing
    return cleanPattern(restoredPattern);
  });
  
  // Filter out any empty patterns
  const validPatterns = finalPatterns.filter(pattern => pattern.trim().length > 0);
  
  return {
    patterns: validPatterns,
    protectedPhraseMap: phraseMap
  };
}

/**
 * Identifies and protects phrases that should not be split in the pattern.
 * Uses a hybrid approach of static list and dynamic pattern detection.
 * 
 * @param text - The input text to process
 * @returns Object containing the processed text with placeholders and a map of protected phrases
 */
export function protectPhrases(text: string): { 
  processedText: string; 
  phraseMap: Map<string, ProtectedPhrase>;
} {
  // Initialize the phrase map to store protected phrases
  const phraseMap = new Map<string, ProtectedPhrase>();
  
  // Initialize processed text with the input
  let processedText = text;
  
  // Combine statically and dynamically identified protected phrases
  const protectedPhrases = [
    // Static protected phrases from the constant list
    ...getStaticProtectedPhrases(text),
    
    // Dynamically detected protected phrases by category
    ...findOrdinalCombinations(text),
    ...findDayRanges(text),
    ...findMonthRanges(text),
    ...findSpecialFrequencies(text),
    ...findWeekendReferences(text)
  ];
  
  // Sort protected phrases by length (descending) to handle longer phrases first
  // This prevents partial matches from interfering with longer matches
  protectedPhrases.sort((a, b) => b.original.length - a.original.length);
  
  // Replace each protected phrase with a unique placeholder
  for (const phrase of protectedPhrases) {
    if (processedText.includes(phrase.original)) {
      const placeholder = `{{PROTECTED_${uuidv4()}}}`;
      processedText = processedText.replace(phrase.original, placeholder);
      
      // Store the mapping from placeholder to original phrase
      phraseMap.set(placeholder, {
        original: phrase.original,
        type: phrase.type,
        placeholder
      });
    }
  }
  
  return { processedText, phraseMap };
}

/**
 * Creates protected phrase objects from the static PROTECTED_PHRASES list.
 * 
 * @param text - The input text to search for protected phrases
 * @returns Array of protected phrase objects found in the text
 */
function getStaticProtectedPhrases(text: string): ProtectedPhrase[] {
  return PROTECTED_PHRASES
    .filter(phrase => text.includes(phrase))
    .map(phrase => ({
      original: phrase,
      type: ProtectedPhraseType.STATIC_PHRASE,
      placeholder: '' // Will be set in protectPhrases function
    }));
}

/**
 * Dynamically identifies ordinal combination phrases (e.g., "first and last", "1st and 3rd").
 * 
 * @param text - The input text to search for ordinal combinations
 * @returns Array of protected phrase objects for ordinal combinations
 */
function findOrdinalCombinations(text: string): ProtectedPhrase[] {
  const results: ProtectedPhrase[] = [];
  
  // Pattern for combinations of ordinals (word form)
  const wordOrdinalPattern = new RegExp(
    `\\b(${Object.values(ORDINAL_TERMS).join('|')})(\\s+${CONJUNCTION_TERMS.AND}\\s+(${Object.values(ORDINAL_TERMS).join('|')}|\\d+(?:st|nd|rd|th)))+\\b`,
    'gi'
  );
  
  // Pattern for combinations of ordinals (numeric form)
  const numericOrdinalPattern = /\b(\d+(?:st|nd|rd|th))(\s+and\s+(first|1st|second|2nd|third|3rd|fourth|4th|fifth|5th|last|\d+(?:st|nd|rd|th)))+\b/gi;
  
  // Find all word ordinal combinations
  let match;
  while ((match = wordOrdinalPattern.exec(text)) !== null) {
    results.push({
      original: match[0],
      type: ProtectedPhraseType.ORDINAL_COMBINATION,
      placeholder: ''
    });
  }
  
  // Find all numeric ordinal combinations
  while ((match = numericOrdinalPattern.exec(text)) !== null) {
    results.push({
      original: match[0],
      type: ProtectedPhraseType.ORDINAL_COMBINATION,
      placeholder: ''
    });
  }
  
  return results;
}

/**
 * Dynamically identifies day range phrases (e.g., "monday through friday").
 * 
 * @param text - The input text to search for day ranges
 * @returns Array of protected phrase objects for day ranges
 */
function findDayRanges(text: string): ProtectedPhrase[] {
  const results: ProtectedPhrase[] = [];
  
  // Get all day names for the pattern
  const dayNames = Object.values(DAYS).join('|');
  
  // Pattern for day ranges with through/to/thru
  const dayRangePattern = new RegExp(
    `\\b(${dayNames})\\s+(through|to|thru)\\s+(${dayNames})\\b`,
    'gi'
  );
  
  let match;
  while ((match = dayRangePattern.exec(text)) !== null) {
    results.push({
      original: match[0],
      type: ProtectedPhraseType.DAY_RANGE,
      placeholder: ''
    });
  }
  
  return results;
}

/**
 * Dynamically identifies month range phrases (e.g., "january through march").
 * 
 * @param text - The input text to search for month ranges
 * @returns Array of protected phrase objects for month ranges
 */
function findMonthRanges(text: string): ProtectedPhrase[] {
  const results: ProtectedPhrase[] = [];
  
  // Get all month names for the pattern
  const monthNames = Object.values(MONTHS).join('|');
  
  // Pattern for month ranges with through/to/thru
  const monthRangePattern = new RegExp(
    `\\b(${monthNames})\\s+(through|to|thru)\\s+(${monthNames})\\b`,
    'gi'
  );
  
  let match;
  while ((match = monthRangePattern.exec(text)) !== null) {
    results.push({
      original: match[0],
      type: ProtectedPhraseType.MONTH_RANGE,
      placeholder: ''
    });
  }
  
  return results;
}

/**
 * Dynamically identifies special frequency phrases (e.g., "every other week").
 * 
 * @param text - The input text to search for special frequency phrases
 * @returns Array of protected phrase objects for special frequency phrases
 */
function findSpecialFrequencies(text: string): ProtectedPhrase[] {
  const results: ProtectedPhrase[] = [];
  
  // Pattern for "every other X" phrases
  const everyOtherPattern = new RegExp(
    `\\b${SPECIAL_PATTERNS.EVERY}\\s+${SPECIAL_PATTERNS.OTHER}\\s+(day|week|month|year)\\b`,
    'gi'
  );
  
  let match;
  while ((match = everyOtherPattern.exec(text)) !== null) {
    results.push({
      original: match[0],
      type: ProtectedPhraseType.SPECIAL_FREQUENCY,
      placeholder: ''
    });
  }
  
  return results;
}

/**
 * Dynamically identifies weekend reference phrases (e.g., "saturday and sunday").
 * 
 * @param text - The input text to search for weekend references
 * @returns Array of protected phrase objects for weekend references
 */
function findWeekendReferences(text: string): ProtectedPhrase[] {
  const results: ProtectedPhrase[] = [];
  
  // Pattern for weekend days
  const weekendPattern = new RegExp(
    `\\b(${DAYS.SATURDAY}|${DAYS.SAT})\\s+${CONJUNCTION_TERMS.AND}\\s+(${DAYS.SUNDAY}|${DAYS.SUN})\\b`,
    'gi'
  );
  
  // Pattern for "every weekend" with modifiers
  const everyWeekendPattern = new RegExp(
    `\\b${SPECIAL_PATTERNS.EVERY}\\s+(${SPECIAL_PATTERNS.OTHER}\\s+)?${SPECIAL_PATTERNS.WEEKEND}\\b`,
    'gi'
  );
  
  let match;
  while ((match = weekendPattern.exec(text)) !== null) {
    results.push({
      original: match[0],
      type: ProtectedPhraseType.WEEKEND_REFERENCE,
      placeholder: ''
    });
  }
  
  while ((match = everyWeekendPattern.exec(text)) !== null) {
    results.push({
      original: match[0],
      type: ProtectedPhraseType.WEEKEND_REFERENCE,
      placeholder: ''
    });
  }
  
  return results;
}

/**
 * Splits text on conjunction terms while respecting protected phrases.
 * 
 * @param text - The text to split, with protected phrases already replaced by placeholders
 * @returns Array of raw pattern strings
 */
function splitOnConjunctions(text: string): string[] {
  // Get conjunction terms to split on
  const conjunctionTerms = Object.values(CONJUNCTION_TERMS);
  
  // Create a regex pattern for splitting
  const conjunctionPattern = new RegExp(`\\s+(${conjunctionTerms.join('|')})\\s+`, 'i');
  
  // Handle comma separately as it needs different spacing rules
  let patterns: string[] = [];
  
  // First split on comma+space
  const commaSplit = text.split(/\s*,\s*/);
  
  // Then process each comma-separated segment for other conjunctions
  for (const segment of commaSplit) {
    if (segment.trim().length === 0) continue;
    
    // Split on other conjunctions
    const subPatterns = segment.split(conjunctionPattern);
    patterns.push(...subPatterns);
  }
  
  return patterns;
}

/**
 * Cleans a pattern string by removing extra whitespace and ensuring proper format.
 * 
 * @param pattern - The pattern string to clean
 * @returns Cleaned pattern string
 */
function cleanPattern(pattern: string): string {
  // Trim whitespace
  let cleaned = pattern.trim();
  
  // Replace multiple spaces with a single space
  cleaned = cleaned.replace(/\s+/g, ' ');
  
  // Add "every" prefix for bare day names if needed
  // This is an example of pattern enhancement that could be applied
  // const isDayNameOnly = new RegExp(`^(${Object.values(DAYS).join('|')})$`, 'i');
  // if (isDayNameOnly.test(cleaned)) {
  //   cleaned = `every ${cleaned}`;
  // }
  
  return cleaned;
}

/**
 * Guidelines for extending the pattern splitter:
 * 
 * 1. Adding new static protected phrases:
 *    - Add to the PROTECTED_PHRASES constant in constants.ts
 *    - Use this approach for truly irregular phrases that don't follow clear patterns
 *    - Document why the phrase needs special handling
 * 
 * 2. Adding new dynamic pattern categories:
 *    - Create a new function similar to findOrdinalCombinations()
 *    - Add a new ProtectedPhraseType enum value
 *    - Add the function call to the protectPhrases() function
 *    - Use this approach for phrases that follow consistent patterns
 * 
 * 3. Consistency requirements:
 *    - All protected phrase detection functions must return the same ProtectedPhrase structure
 *    - All detected phrases must have a type assigned for debugging and analytics
 *    - Longer phrases should be detected before shorter ones to prevent partial matches
 * 
 * 4. Performance considerations:
 *    - Limit regex complexity for time-sensitive applications
 *    - Consider adding memoization for repeated pattern detection on common inputs
 *    - Maintain patterns that are specific enough to avoid false positives
 */ 