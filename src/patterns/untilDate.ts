/**
 * Until Date Pattern Module
 * 
 * This module handles end date recognition in natural language recurrence patterns.
 * It identifies patterns like "until January 1st", "ending on December 31st", etc.,
 * and sets the until property in RecurrenceOptions.
 * 
 * End date patterns are typically processed after frequency and day specifications.
 */

import * as chrono from 'chrono-node';
import type { RecurrenceOptions, PatternResult, PatternMatchMetadata } from '../types';
import { SPECIAL_PATTERNS, PATTERN_PRIORITY, PATTERN_CATEGORIES } from '../constants';

/**
 * End date pattern handler that recognizes patterns like "until December 31st"
 */
export const untilDatePatternHandler = {
  /**
   * Applies pattern recognition to input text and returns a pattern result if matched
   * 
   * @param input - Normalized recurrence pattern string
   * @returns PatternResult if a pattern was matched, null otherwise
   */
  apply(input: string): PatternResult | null {
    const result = applyUntilDatePattern(input);
    return result;
  },

  /**
   * The priority of this pattern handler (from constants)
   */
  priority: PATTERN_PRIORITY.UNTIL_DATE,

  /**
   * Descriptive name of this pattern handler
   */
  name: 'Until Date Pattern Handler',

  /**
   * The category this pattern handler belongs to
   */
  category: PATTERN_CATEGORIES.UNTIL_DATE
};

/**
 * Terms that indicate an end date specification
 */
const END_DATE_TERMS = [
  SPECIAL_PATTERNS.UNTIL,
  'ending',
  'ending on',
  'end on',
  'ends on',
  'through',
  'up to',
  'up until',
  'till',
  'no later than'
];

/**
 * Applies until date pattern recognition to the input string
 * 
 * This function recognizes:
 * - "until [date]" patterns
 * - "ending on [date]" patterns
 * - Other variations that specify an end date
 * 
 * @param input - Normalized recurrence pattern string
 * @returns PatternResult if a pattern was matched, null otherwise
 */
function applyUntilDatePattern(input: string): PatternResult | null {
  let matchedText = '';
  let untilDate: Date | null = null;
  
  // Build a regex pattern for all the end date terms
  const endDateTermsPattern = END_DATE_TERMS.join('|');
  const endDateRegex = new RegExp(`\\b(${endDateTermsPattern})\\s+(.+?)(?:[,;]|$)`, 'i');
  
  // Match the end date term and capture everything after it
  const match = endDateRegex.exec(input);
  
  if (match) {
    const endTerm = match[1];
    const dateText = match[2].trim();
    matchedText = `${endTerm} ${dateText}`;
    
    // Try to parse the date using chrono-node
    const parsedResults = chrono.parse(dateText);
    
    if (parsedResults && parsedResults.length > 0) {
      // Get the first parsed date result
      const parsedDate = parsedResults[0].start.date();
      
      // Ensure the date is set to the end of the day (11:59:59 PM)
      // This makes more sense for end dates in recurrences
      untilDate = new Date(
        parsedDate.getFullYear(),
        parsedDate.getMonth(),
        parsedDate.getDate(),
        23, 59, 59, 999
      );
    } else {
      // If chrono couldn't parse it, we'll try some common date formats manually
      const manuallyParsedDate = tryManualDateParsing(dateText);
      if (manuallyParsedDate) {
        untilDate = manuallyParsedDate;
      }
    }
  }
  
  // If we couldn't find or parse an end date, return null
  if (!untilDate) {
    return null;
  }
  
  // Create the options with the until date we found
  const options: RecurrenceOptions = {
    freq: null, // Don't set frequency, as this will be combined with other patterns
    interval: 1,
    byweekday: null,
    bymonthday: null,
    bymonth: null,
    until: untilDate
  };
  
  // Create metadata for this pattern match
  const metadata: PatternMatchMetadata = {
    patternName: 'untilDatePattern',
    category: PATTERN_CATEGORIES.UNTIL_DATE,
    matchedText,
    confidence: 0.9,
    isPartial: true,
    setProperties: new Set(['until'])
  };
  
  return {
    options,
    metadata
  };
}

/**
 * Tries to parse a date string manually for common formats that chrono-node might miss
 * 
 * @param dateText - The date text to parse
 * @returns Date object if parsing was successful, null otherwise
 */
function tryManualDateParsing(dateText: string): Date | null {
  // Try to match common date formats like MM/DD/YYYY, MM-DD-YYYY, etc.
  const dateRegex = /(\d{1,2})[-\/\.](\d{1,2})[-\/\.](\d{2,4})/;
  const match = dateRegex.exec(dateText);
  
  if (match) {
    // Assuming MM/DD/YYYY format for simplicity
    const month = parseInt(match[1], 10) - 1; // Month is 0-indexed in Date
    const day = parseInt(match[2], 10);
    let year = parseInt(match[3], 10);
    
    // Handle 2-digit years (assumed to be 2000s)
    if (year < 100) {
      year += 2000;
    }
    
    // Create and validate the date with end of day time
    const date = new Date(year, month, day, 23, 59, 59, 999);
    if (isNaN(date.getTime())) {
      return null;
    }
    
    return date;
  }
  
  return null;
}

/**
 * Future extensions to this module could include:
 * 
 * 1. Support for more complex date formats
 * 2. Relative dates like "until next month"
 * 3. Better handling of ambiguous dates
 * 4. Localization for date formats in different languages
 */
