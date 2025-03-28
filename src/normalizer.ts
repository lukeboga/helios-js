/**
 * Normalizer Module
 * 
 * This module handles preprocessing of natural language input text
 * to standardize it for pattern matching. It applies various text
 * transformations to make pattern recognition more consistent and
 * handle common variations in how users might express recurrence patterns.
 * 
 * The normalizer is the first step in the transformation pipeline,
 * ensuring that downstream pattern recognition has clean, consistent input.
 */

import { TERM_SYNONYMS, DAY_NAME_VARIANTS, MONTH_NAME_VARIANTS } from './constants';
import { applySynonyms } from './patterns/utils';

/**
 * Configuration options for the normalizer.
 */
export interface NormalizerOptions {
  /**
   * Whether to convert text to lowercase.
   * Default: true
   */
  lowercase?: boolean;
  
  /**
   * Whether to normalize whitespace.
   * Default: true
   */
  normalizeWhitespace?: boolean;
  
  /**
   * Whether to trim leading and trailing whitespace.
   * Default: true
   */
  trim?: boolean;
  
  /**
   * Whether to preserve ordinal suffixes (1st, 2nd, etc.).
   * Default: false (removes suffixes by default)
   */
  preserveOrdinalSuffixes?: boolean;
  
  /**
   * Whether to normalize day names (e.g., "Mondays" to "monday").
   * Default: true
   */
  normalizeDayNames?: boolean;
  
  /**
   * Whether to apply synonym replacement.
   * Default: true
   */
  applySynonyms?: boolean;
  
  /**
   * Whether to handle common misspellings.
   * Default: true
   */
  correctMisspellings?: boolean;
  
  /**
   * Whether to normalize punctuation.
   * Default: true
   */
  normalizePunctuation?: boolean;
}

/**
 * Default normalizer options.
 */
const defaultOptions: NormalizerOptions = {
  lowercase: true,
  normalizeWhitespace: true,
  trim: true,
  preserveOrdinalSuffixes: false,
  normalizeDayNames: true,
  applySynonyms: true,
  correctMisspellings: true,
  normalizePunctuation: true
};

/**
 * Normalizes a natural language recurrence pattern for more consistent pattern matching.
 * 
 * This function applies several transformations to make the input more consistent:
 * 1. Converts text to lowercase for case-insensitive matching
 * 2. Normalizes whitespace (converts multiple spaces to single spaces)
 * 3. Trims leading and trailing whitespace
 * 4. Removes ordinal suffixes from numbers (e.g., "1st" becomes "1") unless preserveOrdinalSuffixes is true
 * 5. Normalizes day names (e.g., "Mondays" to "monday")
 * 6. Applies synonym replacements (e.g., "fortnightly" to "every 2 weeks")
 * 7. Corrects common misspellings (e.g., "mondey" to "monday")
 * 8. Normalizes punctuation (e.g., replacing semicolons with spaces)
 * 
 * @param input - The raw natural language recurrence pattern
 * @param options - Optional configuration options
 * @returns Normalized text ready for pattern matching
 * 
 * @example
 * normalizeInput("Every 2nd Week on Monday")
 * // returns "every 2 week on monday"
 * 
 * @example
 * normalizeInput("  monthly  on the 1st  ")
 * // returns "monthly on the 1"
 * 
 * @example
 * normalizeInput("Every mondey and tusday", { correctMisspellings: true })
 * // returns "every monday and tuesday"
 */
export function normalizeInput(input: string, options?: Partial<NormalizerOptions>): string {
  // Merge provided options with defaults
  const opts = { ...defaultOptions, ...options };
  
  let normalized = input;
  
  // Convert to lowercase if enabled
  if (opts.lowercase) {
    normalized = normalized.toLowerCase();
  }
  
  // Normalize whitespace if enabled
  if (opts.normalizeWhitespace) {
    normalized = normalized.replace(/\s+/g, ' ');
  }
  
  // Trim whitespace if enabled
  if (opts.trim) {
    normalized = normalized.trim();
  }
  
  // Remove ordinal suffixes unless preserveOrdinalSuffixes is true
  if (!opts.preserveOrdinalSuffixes) {
    normalized = normalized.replace(/(\d+)(st|nd|rd|th)\b/g, '$1');
  }
  
  // Normalize day names if enabled
  if (opts.normalizeDayNames) {
    normalized = normalizeDayNames(normalized);
  }
  
  // Apply synonym replacement if enabled
  if (opts.applySynonyms) {
    normalized = applyTermSynonyms(normalized);
  }
  
  // Correct common misspellings if enabled
  if (opts.correctMisspellings) {
    normalized = correctMisspellings(normalized);
  }
  
  // Normalize punctuation if enabled
  if (opts.normalizePunctuation) {
    normalized = normalizePunctuation(normalized);
  }
  
  return normalized;
}

/**
 * Splits a normalized input string into potential pattern segments.
 * 
 * This is a helper function that can be used to break down complex
 * recurrence patterns into smaller parts for more focused analysis.
 * 
 * @param input - The normalized input string
 * @returns Array of pattern segments
 * 
 * @example
 * splitPatternSegments("every 2 weeks on monday and wednesday")
 * // returns ["every 2 weeks", "on monday and wednesday"]
 */
export function splitPatternSegments(input: string): string[] {
  // Common delimiters in recurrence patterns
  const delimiters = [' on ', ' starting ', ' until ', ' from ', ' ending ', ' beginning ', ' at '];

  let segments: string[] = [input];

  // Split by each delimiter while preserving the delimiter with the second segment
  delimiters.forEach(delimiter => {
    const newSegments: string[] = [];

    segments.forEach(segment => {
      const parts = segment.split(new RegExp(`(${delimiter})`, 'i'));

      if (parts.length > 1) {
        // Add first part as a segment
        newSegments.push(parts[0]);

        // Join the rest with the delimiter
        newSegments.push(
          parts.slice(1).join('')
        );
      } else {
        newSegments.push(segment);
      }
    });

    segments = newSegments;
  });

  // Filter out empty segments and trim each segment
  return segments
    .filter(segment => segment.trim().length > 0)
    .map(segment => segment.trim());
}

/**
 * Normalizes day names in the input text to improve pattern matching.
 * 
 * This function handles plural forms of days (e.g., "Mondays" to "monday")
 * and ensures consistent formatting.
 * 
 * @param input - The input text to normalize
 * @returns Text with normalized day names
 * 
 * @example
 * normalizeDayNames("every mondays and fridays")
 * // returns "every monday and friday"
 */
export function normalizeDayNames(input: string): string {
  return input
    // Convert plural days to singular (mondays -> monday)
    .replace(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)s\b/gi,
      (match) => match.slice(0, -1))
    // Handle capitalized day names (Monday -> monday)
    .replace(/\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/g,
      (match) => match.toLowerCase());
}

/**
 * Applies term synonyms to the input text to standardize terminology.
 * 
 * @param input - The input text to normalize
 * @returns Text with standardized terminology
 * 
 * @example
 * applyTermSynonyms("bi-weekly on Monday")
 * // returns "every 2 weeks on Monday"
 */
export function applyTermSynonyms(input: string): string {
  // First try the pattern utils version which has more sophisticated handling
  try {
    return applySynonyms(input);
  } catch (e) {
    // Fallback to simpler implementation if that fails
    let result = input.toLowerCase();
    
    // Apply synonyms from longest to shortest to avoid partial matches
    const synonyms = Object.entries(TERM_SYNONYMS)
      .sort(([a], [b]) => b.length - a.length);
    
    for (const [term, replacement] of synonyms) {
      // Use word boundary to avoid partial matches
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      result = result.replace(regex, replacement);
    }
    
    return result;
  }
}

/**
 * Corrects common misspellings of day and month names.
 * 
 * @param input - The input text to correct
 * @returns Text with corrected spelling
 * 
 * @example
 * correctMisspellings("every mondey and tusday")
 * // returns "every monday and tuesday"
 */
export function correctMisspellings(input: string): string {
  let result = input.toLowerCase();
  
  // Correct day name misspellings
  for (const [misspelling, correction] of Object.entries(DAY_NAME_VARIANTS)) {
    const regex = new RegExp(`\\b${misspelling}\\b`, 'gi');
    result = result.replace(regex, correction);
  }
  
  // Correct month name misspellings
  for (const [misspelling, correction] of Object.entries(MONTH_NAME_VARIANTS)) {
    const regex = new RegExp(`\\b${misspelling}\\b`, 'gi');
    result = result.replace(regex, correction);
  }
  
  return result;
}

/**
 * Normalizes punctuation in the input text.
 * 
 * @param input - The input text to normalize
 * @returns Text with normalized punctuation
 * 
 * @example
 * normalizePunctuation("monday, wednesday; and friday")
 * // returns "monday wednesday and friday"
 */
export function normalizePunctuation(input: string): string {
  return input
    // Replace semicolons and commas with spaces
    .replace(/[;,]/g, ' ')
    // Replace multiple spaces with a single space
    .replace(/\s+/g, ' ')
    // Replace common separators with standardized forms
    .replace(/(\d+)\s*-\s*(\d+)/g, '$1 to $2')
    // Standardize forward slash usage for dates
    .replace(/(\d+)\s*\/\s*(\d+)/g, '$1/$2')
    // Ensure there's space around ampersands
    .replace(/(\S)&(\S)/g, '$1 & $2')
    .trim();
}

/**
 * Normalizes and standardizes date formats in the input text.
 * 
 * @param input - The input text containing dates
 * @returns Text with standardized date formats
 * 
 * @example
 * normalizeDateFormats("until 01/15/2024")
 * // returns "until 15/01/2024" (using the locale-dependent date format)
 */
export function normalizeDateFormats(input: string): string {
  // This is a placeholder for future implementation
  // Date normalization is complex and would require determining
  // the user's locale and preferred date format
  return input;
}

/**
 * Normalizes time formats in the input text.
 * 
 * @param input - The input text containing times
 * @returns Text with standardized time formats
 * 
 * @example
 * normalizeTimeFormats("meeting at 3:00pm")
 * // returns "meeting at 15:00"
 */
export function normalizeTimeFormats(input: string): string {
  return input
    // Convert 12-hour format to 24-hour format
    .replace(/(\d{1,2}):(\d{2})\s*(am|pm)/gi, (match, hour, minute, period) => {
      let h = parseInt(hour, 10);
      if (period.toLowerCase() === 'pm' && h < 12) h += 12;
      if (period.toLowerCase() === 'am' && h === 12) h = 0;
      return `${h.toString().padStart(2, '0')}:${minute}`;
    })
    // Standardize times without colons
    .replace(/\b(\d{1,2})(am|pm)\b/gi, (match, hour, period) => {
      let h = parseInt(hour, 10);
      if (period.toLowerCase() === 'pm' && h < 12) h += 12;
      if (period.toLowerCase() === 'am' && h === 12) h = 0;
      return `${h.toString().padStart(2, '0')}:00`;
    });
}

/**
 * Performs comprehensive text normalization for natural language processing.
 * This applies all available normalizers in the appropriate order.
 * 
 * @param input - The raw input text
 * @param options - Optional configuration options
 * @returns Fully normalized text
 * 
 * @example
 * comprehensiveNormalize("Every 2nd Monday of the month at 3PM, starting January 1st")
 * // returns "every 2 monday of the month at 15:00 starting january 1"
 */
export function comprehensiveNormalize(input: string, options?: Partial<NormalizerOptions>): string {
  // Merge provided options with defaults
  const opts = { ...defaultOptions, ...options };
  
  // Apply basic normalization first
  let result = normalizeInput(input, opts);
  
  // Apply additional normalizers
  if (!options?.preserveOrdinalSuffixes) {
    // Convert ordinal words to numbers
    result = result
      .replace(/\bfirst\b/gi, '1')
      .replace(/\bsecond\b/gi, '2')
      .replace(/\bthird\b/gi, '3')
      .replace(/\bfourth\b/gi, '4')
      .replace(/\bfifth\b/gi, '5');
  }
  
  // Apply time format normalization
  result = normalizeTimeFormats(result);
  
  return result;
}

/**
 * This module could be extended in the future with additional normalizers for:
 * - Synonym handling (e.g., "fortnightly" -> "every 2 weeks")
 * - Spelling correction for common mistakes
 * - Language-specific normalizations
 * - More sophisticated sentence structure analysis
 */
