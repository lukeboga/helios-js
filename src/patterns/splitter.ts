/**
 * Pattern Splitter Module
 * =====================================================================
 * 
 * This module provides functionality to split complex natural language patterns
 * into simpler sub-patterns for more effective processing. It plays a critical 
 * role in the natural language recurrence processing pipeline by:
 * 
 * 1. Breaking down complex multi-part patterns into individual components
 * 2. Preserving special phrases that should remain intact despite containing conjunctions
 * 3. Ensuring each component can be processed independently by pattern handlers
 * 
 * EXAMPLES:
 * ---------
 * Input: "every monday and friday"
 * Output: ["every monday", "friday"]
 * 
 * Input: "first and last day of month"
 * Output: ["first and last day of month"]  
 *         ↑ Protected as a single pattern
 * 
 * CORE ALGORITHM:
 * ---------------
 * 1. Identify and protect special phrases that should not be split
 * 2. Replace these phrases with unique placeholders
 * 3. Split the modified text on conjunction terms
 * 4. Restore the original protected phrases in each split component
 * 5. Clean and normalize the resulting patterns
 * 
 * DESIGN PHILOSOPHY:
 * ------------------
 * The module implements a hybrid approach combining:
 * - STATIC LIST: Predefined phrases with known special handling needs
 * - DYNAMIC DETECTION: Pattern-based rules to identify additional protected phrases
 * 
 * This hybrid approach provides:
 * - Flexibility to handle diverse natural language inputs
 * - Maintainability through clear categorization
 * - Extensibility for new patterns without code changes
 * - Debugging support through protected phrase categorization
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

//====================================================================
// INTERFACE DEFINITIONS
//====================================================================

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
  STATIC_PHRASE = 'static_phrase',         // From predefined list
  ORDINAL_COMBINATION = 'ordinal_combination', // E.g., "first and third"
  DAY_RANGE = 'day_range',                 // E.g., "monday through friday"
  MONTH_RANGE = 'month_range',             // E.g., "january to march"
  SPECIAL_FREQUENCY = 'special_frequency', // E.g., "every other week"
  WEEKEND_REFERENCE = 'weekend_reference'  // E.g., "saturday and sunday"
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

//====================================================================
// PRIMARY EXPORT FUNCTIONS
//====================================================================

/**
 * Splits a natural language pattern into multiple sub-patterns based on conjunction terms,
 * while preserving protected phrases that should not be split.
 * 
 * This is the main entry point for pattern splitting, orchestrating the entire process:
 * 1. Normalize the input text (lowercase, trim)
 * 2. Protect special phrases by replacing them with placeholders
 * 3. Split on conjunctions (and, plus, comma, etc.)
 * 4. Restore the original protected phrases
 * 5. Clean and normalize each resulting pattern
 * 
 * @param input - The natural language pattern to split
 * @returns An object containing the split patterns and a map of protected phrases
 * 
 * @example
 * splitPattern("every monday and friday") 
 * // returns { patterns: ["every monday", "friday"], protectedPhraseMap: Map }
 * 
 * @example
 * splitPattern("first and last day of month") 
 * // returns { patterns: ["first and last day of month"], protectedPhraseMap: Map }
 * 
 * @example
 * splitPattern("every monday, wednesday, and friday")
 * // returns { patterns: ["every monday", "wednesday", "friday"], protectedPhraseMap: Map }
 */
export function splitPattern(input: string): SplitPatternResult {
  // Normalize input by converting to lowercase and trimming whitespace
  const normalizedInput = input.toLowerCase().trim();
  
  // STEP 1: Identify and protect phrases that should not be split
  // This replaces sensitive phrases with placeholders to protect them during splitting
  const { processedText, phraseMap } = protectPhrases(normalizedInput);
  
  // STEP 2: Split the processed text on conjunction terms
  // With protected phrases replaced, we can safely split on conjunctions
  const rawPatterns = splitOnConjunctions(processedText);
  
  // STEP 3: Restore protected phrases and clean up the resulting patterns
  const finalPatterns = rawPatterns.map(pattern => {
    // Restore any protected phrases in this pattern
    let restoredPattern = pattern;
    for (const [placeholder, phrase] of phraseMap.entries()) {
      restoredPattern = restoredPattern.replace(placeholder, phrase.original);
    }
    
    // Clean up the pattern by trimming whitespace and fixing spacing
    return cleanPattern(restoredPattern);
  });
  
  // STEP 4: Filter out any empty patterns
  // This ensures we only return meaningful patterns
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
 * The protection process:
 * 1. Identifies phrases that need protection using various detection methods
 * 2. Replaces each phrase with a unique placeholder (using UUIDs for uniqueness)
 * 3. Returns both the modified text and a map to restore the original phrases
 * 
 * WHY USE THIS APPROACH: The hybrid method balances flexibility and reliability.
 * Static lists handle idiomatic phrases, while dynamic patterns capture 
 * structurally consistent phrases, providing both precision and coverage.
 * 
 * @param text - The input text to process
 * @returns Object containing the processed text with placeholders and a map of protected phrases
 * 
 * @example Input: "every monday and first and third friday of month"
 *          Output: {
 *            processedText: "every monday and {{PROTECTED_123abc}}",
 *            phraseMap: Map(1) { "{{PROTECTED_123abc}}" => {
 *              original: "first and third friday of month",
 *              type: "ordinal_combination",
 *              placeholder: "{{PROTECTED_123abc}}"
 *            }}
 *          }
 */
export function protectPhrases(text: string): { 
  processedText: string; 
  phraseMap: Map<string, ProtectedPhrase>;
} {
  // Initialize the phrase map to store protected phrases
  const phraseMap = new Map<string, ProtectedPhrase>();
  
  // Initialize processed text with the input
  let processedText = text;
  
  // STEP 1: Collect all potentially protected phrases
  // We combine results from static lists and dynamic pattern detection
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
  
  // STEP 2: Sort by length (descending) to handle longer phrases first
  // WHY: This prevents partial matches from interfering with longer matches
  // For example, in "first and third and last day", we want to match the entire phrase
  // not just "first and third" leaving "and last day" as a separate fragment
  protectedPhrases.sort((a, b) => b.original.length - a.original.length);
  
  // STEP 3: Replace each protected phrase with a unique placeholder
  for (const phrase of protectedPhrases) {
    if (processedText.includes(phrase.original)) {
      // Use UUID to generate globally unique identifiers
      // WHY: This ensures no accidental collisions, even with similar phrases
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

//====================================================================
// PROTECTED PHRASE DETECTION
//====================================================================

/**
 * Creates protected phrase objects from the static PROTECTED_PHRASES list.
 * 
 * This is the simplest form of protection - it uses a predefined list of
 * phrases that require special handling based on domain knowledge.
 * 
 * WHY USE A STATIC LIST: Some phrases are idiomatic or have irregular 
 * structures that are difficult to capture with patterns. A static list
 * provides precise control for these special cases.
 * 
 * @param text - The input text to search for protected phrases
 * @returns Array of protected phrase objects found in the text
 * 
 * @example For input: "first and last day of the month"
 *          Returns: [{
 *            original: "first and last day of the month",
 *            type: ProtectedPhraseType.STATIC_PHRASE,
 *            placeholder: ""
 *          }]
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
 * These are phrases that combine multiple ordinal positions that should be treated
 * as a single unit, such as "first and third Monday" or "1st and 15th of the month".
 * 
 * WHY PROTECT THESE: When a person says "first and third Friday", they're specifying
 * a complex recurrence pattern that needs to be processed together, not as separate 
 * "first Friday" and "third Friday" patterns.
 * 
 * PATTERN STRUCTURE:
 * <ordinal word/number> + "and" + <ordinal word/number> [+ "and" + <ordinal word/number>]...
 * 
 * @param text - The input text to search for ordinal combinations
 * @returns Array of protected phrase objects for ordinal combinations
 * 
 * @example For input: "the first and third monday of each month"
 *          Protects: "first and third"
 * 
 * @example For input: "on the 1st and 15th of every month"
 *          Protects: "1st and 15th"
 */
function findOrdinalCombinations(text: string): ProtectedPhrase[] {
  const results: ProtectedPhrase[] = [];
  
  // Pattern for combinations of ordinals (word form)
  // Matches phrases like "first and third" or "second and fourth and last"
  const wordOrdinalPattern = new RegExp(
    `\\b(${Object.values(ORDINAL_TERMS).join('|')})(\\s+${CONJUNCTION_TERMS.AND}\\s+(${Object.values(ORDINAL_TERMS).join('|')}|\\d+(?:st|nd|rd|th)))+\\b`,
    'gi'
  );
  
  // Pattern for combinations of ordinals (numeric form)
  // Matches phrases like "1st and 3rd" or "2nd and 4th and 5th"
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
 * These are phrases that specify a range of days that should be treated as
 * a single unit, commonly used for specifying weekday or custom day ranges.
 * 
 * WHY PROTECT THESE: Day ranges like "Monday through Friday" represent a continuous
 * set of days, not individual days connected by "and". Splitting these would
 * lose the range semantics in favor of individual days.
 * 
 * PATTERN STRUCTURE:
 * <day name> + ("through" | "to" | "thru") + <day name>
 * 
 * @param text - The input text to search for day ranges
 * @returns Array of protected phrase objects for day ranges
 * 
 * @example For input: "every monday through friday"
 *          Protects: "monday through friday"
 * 
 * @example For input: "repeat tuesday to thursday"
 *          Protects: "tuesday to thursday"
 */
function findDayRanges(text: string): ProtectedPhrase[] {
  const results: ProtectedPhrase[] = [];
  
  // Get all day names for the pattern
  const dayNames = Object.values(DAYS).join('|');
  
  // Pattern for day ranges with through/to/thru
  // Matches phrases like "monday through friday" or "tue to thu"
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
 * These are phrases that specify a range of months that should be treated as
 * a single unit, commonly used for seasonal or quarterly recurrences.
 * 
 * WHY PROTECT THESE: Similar to day ranges, month ranges like "January through March"
 * represent a continuous period, not individual months. Protecting these preserves
 * the range semantics.
 * 
 * PATTERN STRUCTURE:
 * <month name> + ("through" | "to" | "thru") + <month name>
 * 
 * @param text - The input text to search for month ranges
 * @returns Array of protected phrase objects for month ranges
 * 
 * @example For input: "every january through march"
 *          Protects: "january through march" 
 * 
 * @example For input: "occurring apr to jun"
 *          Protects: "apr to jun"
 */
function findMonthRanges(text: string): ProtectedPhrase[] {
  const results: ProtectedPhrase[] = [];
  
  // Get all month names for the pattern
  const monthNames = Object.values(MONTHS).join('|');
  
  // Pattern for month ranges with through/to/thru
  // Matches phrases like "january through march" or "apr to jun"
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
 * These are phrases that specify special recurrence intervals that should
 * be treated as a single unit.
 * 
 * WHY PROTECT THESE: Phrases like "every other week" define a specific recurrence
 * interval (equivalent to "every 2 weeks"). Splitting on "other" would lose this
 * interval information.
 * 
 * PATTERN STRUCTURE:
 * "every" + "other" + <time unit>
 * 
 * @param text - The input text to search for special frequency phrases
 * @returns Array of protected phrase objects for special frequency phrases
 * 
 * @example For input: "every other week"
 *          Protects: "every other week"
 * 
 * @example For input: "every other month until December"
 *          Protects: "every other month"
 */
function findSpecialFrequencies(text: string): ProtectedPhrase[] {
  const results: ProtectedPhrase[] = [];
  
  // Pattern for "every other X" phrases
  // Matches phrases like "every other day" or "every other month"
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
 * These are phrases that refer to weekend days either explicitly or as a concept,
 * which should be treated as a semantic unit.
 * 
 * WHY PROTECT THESE: "Saturday and Sunday" represents the concept of a weekend,
 * not just two individual days. Similarly, "every other weekend" is a specific
 * pattern that should be handled as a unit.
 * 
 * PATTERN STRUCTURES:
 * 1. "saturday" + "and" + "sunday" (or abbreviations)
 * 2. "every" + ["other"] + "weekend"
 * 
 * @param text - The input text to search for weekend references
 * @returns Array of protected phrase objects for weekend references
 * 
 * @example For input: "every saturday and sunday"
 *          Protects: "saturday and sunday"
 * 
 * @example For input: "every other weekend"
 *          Protects: "every other weekend"
 */
function findWeekendReferences(text: string): ProtectedPhrase[] {
  const results: ProtectedPhrase[] = [];
  
  // Pattern for weekend days
  // Matches "saturday and sunday" or abbreviations like "sat and sun"
  const weekendPattern = new RegExp(
    `\\b(${DAYS.SATURDAY}|${DAYS.SAT})\\s+${CONJUNCTION_TERMS.AND}\\s+(${DAYS.SUNDAY}|${DAYS.SUN})\\b`,
    'gi'
  );
  
  // Pattern for "every weekend" with modifiers
  // Matches "every weekend" or "every other weekend"
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

//====================================================================
// PATTERN SPLITTING AND CLEANING
//====================================================================

/**
 * Splits text on conjunction terms while respecting protected phrases.
 * 
 * This function processes text where protected phrases have already been
 * replaced with placeholders, making it safe to split on conjunctions
 * without losing the integrity of special phrases.
 * 
 * The splitting process works in two phases:
 * 1. First split on commas, as they're the primary delimiter in lists
 * 2. Then process each comma-separated segment for other conjunctions (and, plus, etc.)
 * 
 * VISUAL EXAMPLE:
 * Input:  "every monday, wednesday and friday"
 * Output: ["every monday", "wednesday", "friday"]
 * 
 * Input:  "{{PROTECTED_123}} and wednesday" (where the placeholder is "every other day")
 * Output: ["every other day", "wednesday"]
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
  let segments: string[] = [];
  
  // STEP 1: First split on comma+space
  // WHY: Commas are the primary list delimiter in natural language
  const commaSplit = text.split(/\s*,\s*/);
  
  // STEP 2: Process each comma-separated segment for other conjunctions
  for (const segment of commaSplit) {
    if (segment.trim().length === 0) continue;
    
    // Split on other conjunctions (and, plus, etc.)
    // WHY: We use a more sophisticated approach than simple splitting
    // to preserve the context and intent of each pattern part
    if (conjunctionPattern.test(segment)) {
      // Split the segment but keep track of where we are
      let lastIndex = 0;
      let match;
      const conjunctionRegex = new RegExp(conjunctionPattern.source, 'gi');
      
      // Iterate through all conjunction matches
      while ((match = conjunctionRegex.exec(segment)) !== null) {
        // Add the part before this conjunction
        const beforeConjunction = segment.substring(lastIndex, match.index).trim();
        if (beforeConjunction) {
          segments.push(beforeConjunction);
        }
        
        // Update lastIndex to skip over the conjunction
        lastIndex = match.index + match[0].length;
      }
      
      // Add the last part after the final conjunction
      const afterLastConjunction = segment.substring(lastIndex).trim();
      if (afterLastConjunction) {
        segments.push(afterLastConjunction);
      }
    } else {
      // No conjunctions in this segment, add it as is
      segments.push(segment);
    }
  }
  
  return segments;
}

/**
 * Cleans a pattern string by removing extra whitespace and ensuring proper format.
 * 
 * This function performs final normalization on each pattern after protected
 * phrases have been restored. It ensures consistent formatting for downstream
 * pattern handlers.
 * 
 * WHY CLEAN PATTERNS: Consistent formatting reduces edge cases in pattern
 * handlers and improves matching reliability.
 * 
 * @param pattern - The pattern string to clean
 * @returns Cleaned pattern string
 * 
 * @example "  every  monday  " -> "every monday"
 * @example "first   of   month" -> "first of month"
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

//====================================================================
// EXTENSION GUIDELINES
//====================================================================

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
 * 
 * 5. Testing new patterns:
 *    - Add test cases that cover both the patterns you want to protect
 *    - Include negative tests for similar patterns that should be split
 *    - Consider edge cases with mixed protected and non-protected phrases
 */ 