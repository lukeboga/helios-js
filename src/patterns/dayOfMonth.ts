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
import { SPECIAL_PATTERNS, PATTERN_PRIORITY, PATTERN_CATEGORIES, ORDINAL_WORD_MAP } from '../constants';
import { createPatternResult } from './utils';

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
    const setProperties = new Set<keyof RecurrenceOptions>(['freq', 'bymonthday']);
    
    return createPatternResult(options, matchedText, setProperties, PATTERN_CATEGORIES.DAY_OF_MONTH, 'dayOfMonthPattern');
  }
  
  // No day of month pattern was found
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
