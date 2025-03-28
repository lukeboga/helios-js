/**
 * Day of Month Pattern Module
 * 
 * This module handles day of month recognition in natural language recurrence patterns.
 * It identifies patterns like "1st of every month", "on the 15th", "on the 15th of each month",
 * and similar patterns that specify a particular day of the month.
 * 
 * Day of month patterns typically work with monthly frequency and can be combined
 * with other patterns like day of week or specific months.
 */

import { RRule } from 'rrule';
import type { RecurrenceOptions, PatternResult, PatternMatchMetadata } from '../types';
import { SPECIAL_PATTERNS, PATTERN_PRIORITY, PATTERN_CATEGORIES } from '../constants';

/**
 * Interface for numeric ordinals with their word forms
 */
interface OrdinalMapping {
  [key: string]: number;
}

/**
 * Mapping from ordinal words to their numeric values
 */
const ORDINAL_WORD_MAP: OrdinalMapping = {
  'first': 1,
  'second': 2,
  'third': 3,
  'fourth': 4,
  'fifth': 5,
  'sixth': 6,
  'seventh': 7,
  'eighth': 8,
  'ninth': 9,
  'tenth': 10,
  'eleventh': 11,
  'twelfth': 12,
  'thirteenth': 13,
  'fourteenth': 14,
  'fifteenth': 15,
  'sixteenth': 16,
  'seventeenth': 17,
  'eighteenth': 18,
  'nineteenth': 19,
  'twentieth': 20,
  'twenty-first': 21,
  'twenty-second': 22,
  'twenty-third': 23,
  'twenty-fourth': 24,
  'twenty-fifth': 25,
  'twenty-sixth': 26,
  'twenty-seventh': 27,
  'twenty-eighth': 28,
  'twenty-ninth': 29,
  'thirtieth': 30,
  'thirty-first': 31,
  'last': -1  // Special case for "last day of month"
};

/**
 * Day of Month pattern handler that recognizes patterns like "1st of month"
 */
export const dayOfMonthPatternHandler = {
  /**
   * Applies pattern recognition to input text and returns a pattern result if matched
   * 
   * @param input - Normalized recurrence pattern string
   * @returns PatternResult if a pattern was matched, null otherwise
   */
  apply(input: string): PatternResult | null {
    const result = applyDayOfMonthPattern(input);
    return result;
  },

  /**
   * The priority of this pattern handler (from constants)
   */
  priority: PATTERN_PRIORITY.DAY_OF_MONTH,

  /**
   * Descriptive name of this pattern handler
   */
  name: 'Day of Month Pattern Handler',

  /**
   * The category this pattern handler belongs to
   */
  category: PATTERN_CATEGORIES.DAY_OF_MONTH
};

/**
 * Applies day of month pattern recognition to the input string
 * 
 * This function recognizes:
 * - Numeric day of month ("1st of every month")
 * - Word form ordinals ("first of the month")
 * - Special cases like "last day of month"
 * - Multiple monthdays ("1st and 15th of every month")
 * 
 * @param input - Normalized recurrence pattern string
 * @returns PatternResult if a pattern was matched, null otherwise
 */
function applyDayOfMonthPattern(input: string): PatternResult | null {
  // The final list of monthdays we'll detect
  const monthdays: number[] = [];
  let matchedText = '';
  
  // Match patterns like "1st of the month", "on the 15th", etc.
  const numericOrdinalRegex = /\b(?:on\s+(?:the\s+)?)?(\d+)(?:st|nd|rd|th)(?:\s+(?:day\s+)?(?:of\s+(?:the\s+)?(?:every|each|a|the)?\s+month))?\b/gi;
  let match;
  
  // Find all numeric ordinal matches
  while ((match = numericOrdinalRegex.exec(input)) !== null) {
    const day = parseInt(match[1], 10);
    if (day >= 1 && day <= 31) {
      monthdays.push(day);
      matchedText += (matchedText ? ', ' : '') + match[0];
    }
  }
  
  // Match patterns with word ordinals like "first of the month"
  const wordOrdinalPattern = Object.keys(ORDINAL_WORD_MAP).join('|');
  const wordOrdinalRegex = new RegExp(`\\b(${wordOrdinalPattern})(?:\\s+(?:day\\s+)?(?:of\\s+(?:the\\s+)?(?:every|each|a|the)?\\s+month))?\\b`, 'gi');
  
  // Reset for the next set of matches
  match = null;
  
  // Find all word ordinal matches
  while ((match = wordOrdinalRegex.exec(input)) !== null) {
    const ordinalWord = match[1].toLowerCase();
    const day = ORDINAL_WORD_MAP[ordinalWord];
    
    if (day) {
      monthdays.push(day);
      matchedText += (matchedText ? ', ' : '') + match[0];
    }
  }
  
  // If we found any day of month patterns
  if (monthdays.length > 0) {
    // Create the options with the monthdays we found
    const options: RecurrenceOptions = {
      freq: RRule.MONTHLY, // Default to monthly frequency for day of month patterns
      interval: 1,
      byweekday: null,
      bymonthday: monthdays,
      bymonth: null
    };
    
    // Create metadata for this pattern match
    const metadata: PatternMatchMetadata = {
      patternName: 'dayOfMonthPattern',
      category: PATTERN_CATEGORIES.DAY_OF_MONTH,
      matchedText,
      confidence: 0.9,
      isPartial: true,
      setProperties: new Set(['freq', 'bymonthday'])
    };
    
    return {
      options,
      metadata
    };
  }
  
  // No day of month pattern was found
  return null;
}

/**
 * Utility function to extract numeric day from a string with a suffix like "1st", "2nd", etc.
 * 
 * @param text - Text containing an ordinal number like "1st", "2nd", "3rd", etc.
 * @returns The numeric value or null if not found
 */
function extractNumericDay(text: string): number | null {
  const match = text.match(/(\d+)(?:st|nd|rd|th)/i);
  if (match) {
    const day = parseInt(match[1], 10);
    if (day >= 1 && day <= 31) {
      return day;
    }
  }
  return null;
}

/**
 * Future extensions to this module could include:
 * 
 * 1. Support for more complex patterns like "the first 5 days of the month"
 * 2. Support for negative day indexes like "2nd to last day of month" 
 * 3. Combinations with specific month patterns
 * 4. Recognition of day ranges like "1st through 5th of each month"
 */
