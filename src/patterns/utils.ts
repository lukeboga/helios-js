/**
 * Pattern Utilities
 * 
 * This module provides shared utilities and constants for pattern recognition modules.
 * It centralizes common functionality used across different pattern handlers,
 * reducing duplication and ensuring consistency.
 * 
 * The utilities are designed to support both current pattern recognition needs
 * and provide a foundation for future pattern categories.
 */

import { RRule } from 'rrule';
import type { Frequency } from 'rrule';
import type { DayMapping, FrequencyMapping, SynonymMapping } from '../types';
import { DAYS, TIME_UNITS, MONTH_NAMES } from '../constants';
import type { DayString, TimeUnitString, MonthString } from '../constants';
import { InvalidDayError, InvalidTimeUnitError, InvalidMonthError } from '../errors';

/**
 * Maps day names (and abbreviations) to RRule day constants.
 * This mapping allows conversion from natural language day names to
 * their corresponding RRule constants.
 * 
 * Includes both full names (monday) and abbreviations (mon) for flexibility.
 */
export const DAY_MAP: DayMapping = {
  // Full day names
  [DAYS.MONDAY]: RRule.MO,
  [DAYS.TUESDAY]: RRule.TU,
  [DAYS.WEDNESDAY]: RRule.WE,
  [DAYS.THURSDAY]: RRule.TH,
  [DAYS.FRIDAY]: RRule.FR,
  [DAYS.SATURDAY]: RRule.SA,
  [DAYS.SUNDAY]: RRule.SU,

  // Common abbreviations
  [DAYS.MON]: RRule.MO,
  [DAYS.TUE]: RRule.TU,
  [DAYS.WED]: RRule.WE,
  [DAYS.THU]: RRule.TH,
  [DAYS.FRI]: RRule.FR,
  [DAYS.SAT]: RRule.SA,
  [DAYS.SUN]: RRule.SU
};

/**
 * Maps time unit strings to RRule frequency constants.
 * This mapping allows conversion from natural language time units to
 * their corresponding RRule frequency constants.
 */
export const FREQUENCY_MAP: FrequencyMapping = {
  [TIME_UNITS.DAY]: RRule.DAILY,
  [TIME_UNITS.WEEK]: RRule.WEEKLY,
  [TIME_UNITS.MONTH]: RRule.MONTHLY,
  [TIME_UNITS.YEAR]: RRule.YEARLY
};

/**
 * Maps month names to their numeric values (1-12).
 * Includes both full names and three-letter abbreviations.
 */
export const MONTH_MAP: Record<string, number> = {
  [MONTH_NAMES.JANUARY]: 1,
  [MONTH_NAMES.FEBRUARY]: 2, 
  [MONTH_NAMES.MARCH]: 3,
  [MONTH_NAMES.APRIL]: 4,
  [MONTH_NAMES.MAY]: 5,
  [MONTH_NAMES.JUNE]: 6,
  [MONTH_NAMES.JULY]: 7,
  [MONTH_NAMES.AUGUST]: 8,
  [MONTH_NAMES.SEPTEMBER]: 9,
  [MONTH_NAMES.OCTOBER]: 10,
  [MONTH_NAMES.NOVEMBER]: 11,
  [MONTH_NAMES.DECEMBER]: 12,
  
  // Common abbreviations
  [MONTH_NAMES.JAN]: 1,
  [MONTH_NAMES.FEB]: 2,
  [MONTH_NAMES.MAR]: 3,
  [MONTH_NAMES.APR]: 4,
  [MONTH_NAMES.MAY_ABBR]: 5,
  [MONTH_NAMES.JUN]: 6,
  [MONTH_NAMES.JUL]: 7,
  [MONTH_NAMES.AUG]: 8,
  [MONTH_NAMES.SEP]: 9,
  [MONTH_NAMES.OCT]: 10,
  [MONTH_NAMES.NOV]: 11,
  [MONTH_NAMES.DEC]: 12
};

/**
 * Common synonym mappings for recurrence terms.
 * Maps various terms to their standardized equivalents.
 */
export const SYNONYMS: SynonymMapping = {
  // Frequency synonyms
  'everyday': 'daily',
  'each day': 'daily',
  'daily': 'daily',
  'every day': 'daily',
  
  'weekly': 'weekly',
  'every week': 'weekly',
  'each week': 'weekly',
  
  'monthly': 'monthly',
  'every month': 'monthly',
  'each month': 'monthly',
  
  'yearly': 'yearly',
  'annually': 'yearly',
  'every year': 'yearly',
  'each year': 'yearly',
  
  // Position synonyms
  'first': '1st',
  'second': '2nd',
  'third': '3rd',
  'fourth': '4th',
  'fifth': '5th',
  'last': 'last',
  
  // Special terms
  'weekday': 'weekday',
  'weekdays': 'weekday',
  'business day': 'weekday',
  'business days': 'weekday',
  'work day': 'weekday',
  'work days': 'weekday',
  
  'weekend': 'weekend',
  'weekends': 'weekend'
};

/**
 * Array of RRule constants representing weekdays (Monday through Friday).
 * Used for patterns like "every weekday".
 */
export const WEEKDAYS = [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR];

/**
 * Array of RRule constants representing weekend days (Saturday and Sunday).
 * Used for patterns like "every weekend".
 */
export const WEEKEND_DAYS = [RRule.SA, RRule.SU];

/**
 * Regular expression pattern for matching any day name.
 * Includes both full names and abbreviations.
 * 
 * This pattern uses word boundaries (\b) to ensure it matches complete words.
 * It can be used in larger regular expressions to identify day names.
 */
export const DAY_NAME_PATTERN =
  '\\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\\b';

/**
 * Regular expression pattern for matching any time unit (day, week, month, year).
 * Can be used in larger regular expressions to identify time units.
 * 
 * Includes both singular and plural forms (e.g., "day" and "days").
 */
export const TIME_UNIT_PATTERN = '\\b(day|week|month|year)s?\\b';

/**
 * Regular expression pattern for matching any month name.
 * Includes both full names and three-letter abbreviations.
 */
export const MONTH_NAME_PATTERN = 
  '\\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\\b';

/**
 * Regular expression pattern for matching ordinal numbers.
 * Matches formats like "1st", "2nd", "3rd", "4th", etc.
 */
export const ORDINAL_NUMBER_PATTERN = '\\b(\\d+)(st|nd|rd|th)\\b';

/**
 * Regular expression pattern for matching ordinal words.
 * Matches words like "first", "second", "third", etc.
 */
export const ORDINAL_WORD_PATTERN = 
  '\\b(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth|thirteenth|fourteenth|fifteenth|sixteenth|seventeenth|eighteenth|nineteenth|twentieth|twenty-first|twenty-second|twenty-third|twenty-fourth|twenty-fifth|twenty-sixth|twenty-seventh|twenty-eighth|twenty-ninth|thirtieth|thirty-first|last)\\b';

/**
 * Checks if a string is a valid day name.
 * 
 * @param day - The day name to check
 * @returns True if the day name is valid, false otherwise
 * 
 * @example
 * isValidDayName('monday') // returns true
 * isValidDayName('someday') // returns false
 */
export function isValidDayName(day: string): boolean {
  return day.toLowerCase() in DAY_MAP;
}

/**
 * Converts a day name to its corresponding RRule day constant.
 * 
 * @param day - The day name to convert (case-insensitive)
 * @returns The RRule day constant
 * @throws InvalidDayError if the day name is invalid
 * 
 * @example
 * dayNameToRRuleDay('monday') // returns RRule.MO
 * dayNameToRRuleDay('MON') // returns RRule.MO
 */
export function dayNameToRRuleDay(day: string): RRule.Weekday {
  const normalizedDay = day.toLowerCase();
  if (isValidDayName(normalizedDay)) {
    // Use type assertion since we've already verified this is a valid day name key
    return DAY_MAP[normalizedDay as DayString];
  }
  throw new InvalidDayError(day);
}

/**
 * Checks if a string is a valid time unit.
 * 
 * @param unit - The time unit to check (case-insensitive)
 * @returns True if the time unit is valid, false otherwise
 * 
 * @example
 * isValidTimeUnit('week') // returns true
 * isValidTimeUnit('fortnight') // returns false
 */
export function isValidTimeUnit(unit: string): boolean {
  // Remove trailing 's' if present (to handle plural forms)
  const singularUnit = unit.toLowerCase().replace(/s$/, '');
  return singularUnit in FREQUENCY_MAP;
}

/**
 * Converts a time unit to its corresponding RRule frequency constant.
 * 
 * @param unit - The time unit to convert (case-insensitive)
 * @returns The RRule frequency constant
 * @throws InvalidTimeUnitError if the time unit is invalid
 * 
 * @example
 * timeUnitToFrequency('week') // returns RRule.WEEKLY
 * timeUnitToFrequency('weeks') // returns RRule.WEEKLY
 */
export function timeUnitToFrequency(unit: string): Frequency {
  // Remove trailing 's' if present (to handle plural forms)
  const singularUnit = unit.toLowerCase().replace(/s$/, '');
  if (isValidTimeUnit(singularUnit)) {
    // Use type assertion since we've already verified this is a valid time unit key
    return FREQUENCY_MAP[singularUnit as TimeUnitString];
  }
  throw new InvalidTimeUnitError(unit);
}

/**
 * Checks if a string is a valid month name.
 * 
 * @param month - The month name to check (case-insensitive)
 * @returns True if the month name is valid, false otherwise
 * 
 * @example
 * isValidMonthName('january') // returns true
 * isValidMonthName('janitor') // returns false
 */
export function isValidMonthName(month: string): boolean {
  return month.toLowerCase() in MONTH_MAP;
}

/**
 * Converts a month name to its corresponding numeric value (1-12).
 * 
 * @param month - The month name to convert (case-insensitive)
 * @returns The month number (1-12)
 * @throws InvalidMonthError if the month name is invalid
 * 
 * @example
 * monthNameToNumber('january') // returns 1
 * monthNameToNumber('JAN') // returns 1
 */
export function monthNameToNumber(month: string): number {
  const normalizedMonth = month.toLowerCase();
  if (isValidMonthName(normalizedMonth)) {
    return MONTH_MAP[normalizedMonth];
  }
  throw new InvalidMonthError(month);
}

/**
 * Extracts all day names from an input string.
 * 
 * @param input - The input string to search for day names
 * @returns Array of RRule day constants for all found day names
 * 
 * @example
 * extractDayNames('every monday and wednesday') // returns [RRule.MO, RRule.WE]
 */
export function extractDayNames(input: string): RRule.Weekday[] {
  const dayPattern = new RegExp(DAY_NAME_PATTERN, 'gi');
  const matches = input.match(dayPattern) || [];

  return matches.map(day => dayNameToRRuleDay(day));
}

/**
 * Helper function to create a regular expression that matches a set of words.
 * Useful for building pattern recognition expressions.
 * 
 * @param words - Array of words to match
 * @param options - Regular expression options (like 'i' for case-insensitive)
 * @returns Regular expression that matches any of the given words with word boundaries
 * 
 * @example
 * createWordMatchPattern(['daily', 'weekly']) // returns /\b(daily|weekly)\b/
 */
export function createWordMatchPattern(words: string[], options?: string): RegExp {
  const pattern = `\\b(${words.join('|')})\\b`;
  return new RegExp(pattern, options);
}

/**
 * Applies synonym normalization to an input string.
 * Replaces known synonyms with their standardized terms.
 * 
 * @param input - The input string to normalize
 * @returns Normalized string with standardized terms
 * 
 * @example
 * applySynonyms('every business day') // returns 'every weekday'
 */
export function applySynonyms(input: string): string {
  let normalizedInput = input.toLowerCase();
  
  // Sort synonyms by length (descending) to ensure longer phrases are matched first
  const synonymKeys = Object.keys(SYNONYMS).sort((a, b) => b.length - a.length);
  
  for (const synonym of synonymKeys) {
    // Create a regex with word boundaries to avoid partial matches
    const synonymRegex = new RegExp(`\\b${synonym}\\b`, 'gi');
    normalizedInput = normalizedInput.replace(synonymRegex, SYNONYMS[synonym]);
  }
  
  return normalizedInput;
}

/**
 * Performs fuzzy matching for a term in an input string.
 * Considers common misspellings and variations.
 * 
 * @param input - The input string to search in
 * @param term - The term to match (with variations)
 * @param threshold - Similarity threshold (0.0 to 1.0, higher is more strict)
 * @returns True if a fuzzy match is found, false otherwise
 * 
 * @example
 * fuzzyMatch('every mondey', 'monday', 0.8) // returns true
 */
export function fuzzyMatch(input: string, term: string, threshold = 0.8): boolean {
  const normalizedInput = input.toLowerCase();
  const normalizedTerm = term.toLowerCase();
  
  // Exact match is always valid
  if (normalizedInput.includes(normalizedTerm)) {
    return true;
  }
  
  // Simple character-based similarity measure (Levenshtein distance divided by max length)
  function similarity(a: string, b: string): number {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    
    const matrix: number[][] = [];
    
    // Initialize matrix
    for (let i = 0; i <= a.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= b.length; j++) {
      matrix[0][j] = j;
    }
    
    // Fill matrix
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // deletion
          matrix[i][j - 1] + 1,      // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }
    
    // Calculate similarity
    const distance = matrix[a.length][b.length];
    const maxLength = Math.max(a.length, b.length);
    return 1 - (distance / maxLength);
  }
  
  // Check each word in the input
  const words = normalizedInput.split(/\s+/);
  for (const word of words) {
    if (similarity(word, normalizedTerm) >= threshold) {
      return true;
    }
  }
  
  return false;
}

/**
 * Extracts ordinal numbers from an input string.
 * Finds patterns like "1st", "2nd", "3rd", "4th" and converts them to integers.
 * 
 * @param input - The input string containing ordinal numbers
 * @returns Array of extracted numbers
 * 
 * @example
 * extractOrdinalNumbers('on the 1st and 15th of each month') // returns [1, 15]
 */
export function extractOrdinalNumbers(input: string): number[] {
  const ordinalPattern = new RegExp(ORDINAL_NUMBER_PATTERN, 'gi');
  const matches = Array.from(input.matchAll(ordinalPattern));
  
  return matches.map(match => parseInt(match[1], 10));
}

/**
 * Mapping from ordinal words to their numeric values.
 */
export const ORDINAL_WORD_MAP: Record<string, number> = {
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
 * Extracts ordinal words from an input string and converts them to numbers.
 * Recognizes words like "first", "second", "third", etc.
 * 
 * @param input - The input string containing ordinal words
 * @returns Array of extracted numbers
 * 
 * @example
 * extractOrdinalWords('on the first and third Monday') // returns [1, 3]
 */
export function extractOrdinalWords(input: string): number[] {
  const ordinalWordPattern = new RegExp(ORDINAL_WORD_PATTERN, 'gi');
  const matches = input.match(ordinalWordPattern) || [];
  
  return matches.map(word => ORDINAL_WORD_MAP[word.toLowerCase()]).filter(num => num !== undefined);
}

/**
 * Extracts all ordinals (both numeric and word form) from an input string.
 * 
 * @param input - The input string containing ordinals
 * @returns Array of extracted numbers
 * 
 * @example
 * extractAllOrdinals('on the 1st and third Monday') // returns [1, 3]
 */
export function extractAllOrdinals(input: string): number[] {
  return [...extractOrdinalNumbers(input), ...extractOrdinalWords(input)];
}

/**
 * Extracts month names from an input string and converts them to month numbers (1-12).
 * 
 * @param input - The input string containing month names
 * @returns Array of month numbers (1-12)
 * 
 * @example
 * extractMonthNames('in January and July') // returns [1, 7]
 */
export function extractMonthNames(input: string): number[] {
  const monthPattern = new RegExp(MONTH_NAME_PATTERN, 'gi');
  const matches = input.match(monthPattern) || [];
  
  return matches.map(monthName => monthNameToNumber(monthName));
}

/**
 * Converts an array of RRule.Weekday objects to the format expected by the RRule constructor.
 * This is needed because the internal representation of Weekday objects sometimes differs
 * from what the RRule constructor expects.
 * 
 * @param weekdays - Array of RRule.Weekday objects
 * @returns Array of weekday objects in the format expected by RRule
 */
export function asWeekdays(weekdays: RRule.Weekday[] | null): RRule.Weekday[] | null {
  if (!weekdays) return null;
  
  // No transformation needed in most cases, but this function provides a place
  // to handle any necessary conversions if the internal representation changes
  return weekdays;
}

/**
 * Creates a standardized PatternResult object helper
 */
export function createPatternResult(
  options: any, 
  matchedText: string, 
  category: string,
  patternName: string,
  setProperties: Set<string>,
  confidence = 0.9
): any {
  const metadata = {
    patternName,
    category,
    matchedText,
    confidence,
    isPartial: true,
    setProperties
  };
  
  return {
    options,
    metadata
  };
}
