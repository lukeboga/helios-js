/**
 * Day of Week Pattern Module
 * 
 * This module handles day of week recognition in natural language recurrence patterns.
 * It identifies patterns like "every Monday", "every Monday and Wednesday", and
 * handles combinations of days and existing frequency settings.
 * 
 * Day of week patterns typically come after frequency and interval patterns in the
 * processing pipeline, as they complement the already established recurrence schedule.
 */

import { RRule } from 'rrule';
import type { RecurrenceOptions, PatternResult, PatternMatchMetadata } from '../types';
import { DAYS, SPECIAL_PATTERNS, PATTERN_PRIORITY, PATTERN_CATEGORIES } from '../constants';
import { DAY_MAP, WEEKDAYS, WEEKEND_DAYS, extractDayNames } from './utils';
import type { DayString } from '../constants';

/**
 * Interface defining a day of week pattern handler implementation
 */
export interface DayOfWeekPatternHandler {
  /**
   * Applies day of week pattern recognition to the input string
   * 
   * @param input - Normalized recurrence pattern string
   * @returns PatternResult if a pattern was matched, null otherwise
   */
  apply(input: string): PatternResult | null;

  /**
   * The priority of this pattern handler
   */
  priority: number;

  /**
   * Descriptive name of this pattern handler
   */
  name: string;

  /**
   * The category this pattern handler belongs to
   */
  category: string;
}

/**
 * Day of week pattern handler implementation
 */
export const dayOfWeekPatternHandler: DayOfWeekPatternHandler = {
  /**
   * Applies day of week pattern recognition to the input string
   * 
   * @param input - Normalized recurrence pattern string
   * @returns PatternResult if a pattern was matched, null otherwise
   */
  apply(input: string): PatternResult | null {
    const result = applyDayOfWeekRules(input);
    return result;
  },

  /**
   * The priority of this pattern handler (from constants)
   */
  priority: PATTERN_PRIORITY.DAY_OF_WEEK,

  /**
   * Descriptive name of this pattern handler
   */
  name: 'Day of Week Pattern Handler',

  /**
   * The category this pattern handler belongs to
   */
  category: PATTERN_CATEGORIES.DAY_OF_WEEK
};

/**
 * Applies day of week transformation rules to the input string
 * 
 * This function recognizes:
 * - Single day specifications ("every Monday")
 * - Multiple day combinations ("every Monday and Wednesday")
 * - Special day groups ("every weekday", "every weekend")
 * 
 * The function respects existing frequency settings and only modifies the frequency
 * if it hasn't been set or if it's compatible with day-of-week specifications.
 * 
 * @param input - Normalized recurrence pattern string
 * @returns PatternResult if a pattern was matched, null otherwise
 */
export function applyDayOfWeekRules(input: string): PatternResult | null {
  // Initialize options
  const options: RecurrenceOptions = {
    freq: null,
    interval: 1,
    byweekday: null,
    bymonthday: null,
    bymonth: null
  };
  
  // Track which properties are set
  const setProperties = new Set<keyof RecurrenceOptions>();
  let matchedText = '';

  // Weekday pattern (Monday-Friday)
  const weekdayMatch = new RegExp(`\\b${SPECIAL_PATTERNS.EVERY}\\s+${SPECIAL_PATTERNS.WEEKDAY}\\b`).exec(input);
  if (weekdayMatch) {
    options.freq = RRule.WEEKLY;
    options.byweekday = WEEKDAYS;
    setProperties.add('freq');
    setProperties.add('byweekday');
    matchedText = weekdayMatch[0];
    return createPatternResult(options, matchedText, setProperties);
  }

  // Weekend pattern (Saturday-Sunday)
  const weekendMatch = new RegExp(`\\b${SPECIAL_PATTERNS.EVERY}\\s+${SPECIAL_PATTERNS.WEEKEND}\\b`).exec(input);
  if (weekendMatch) {
    options.freq = RRule.WEEKLY;
    options.byweekday = WEEKEND_DAYS;
    setProperties.add('freq');
    setProperties.add('byweekday');
    matchedText = weekendMatch[0];
    return createPatternResult(options, matchedText, setProperties);
  }

  // Check for the common "Day X and Day Y" pattern
  // This handles cases like "every tuesday and thursday"
  const dayNamePattern = Object.values(DAYS).join('|');
  const combinedDaysRegex = new RegExp(
    `\\b(${dayNamePattern})(?:\\s+and\\s+(${dayNamePattern}))+\\b`,
    'i'
  );

  const combinedDaysMatch = combinedDaysRegex.exec(input);
  if (combinedDaysMatch) {
    // Extract all day names from the input
    const matchedDays = extractDayNames(input);

    if (matchedDays.length > 0) {
      // matchedDays is already of type RRule.Weekday[], which matches our RecurrenceOptions.byweekday
      options.byweekday = matchedDays;
      options.freq = RRule.WEEKLY; // Assume weekly for day patterns
      
      setProperties.add('byweekday');
      setProperties.add('freq');
      matchedText = combinedDaysMatch[0];
      return createPatternResult(options, matchedText, setProperties);
    }
  }

  // Check for specific days pattern (e.g., "every monday")
  const specificDayRegex = new RegExp(
    `\\b${SPECIAL_PATTERNS.EVERY}\\s+(${dayNamePattern})\\b`,
    'gi'
  );

  let dayMatch;
  const daysFound: RRule.Weekday[] = [];
  let fullMatchText = '';

  // Find all occurrences of "every [day]" patterns
  while ((dayMatch = specificDayRegex.exec(input)) !== null) {
    const day = dayMatch[1].toLowerCase();
    fullMatchText += (fullMatchText ? ', ' : '') + dayMatch[0];
    
    // Check if the day string is a valid key in our day mapping
    if (isValidDayName(day)) {
      const dayConstant = DAY_MAP[day as DayString];
      daysFound.push(dayConstant);
    }
  }

  // If specific days were found
  if (daysFound.length > 0) {
    // daysFound is already of type RRule.Weekday[], which matches our RecurrenceOptions.byweekday
    options.byweekday = daysFound;
    options.freq = RRule.WEEKLY; // Assume weekly for day patterns
    
    setProperties.add('byweekday');
    setProperties.add('freq');
    matchedText = fullMatchText;
    return createPatternResult(options, matchedText, setProperties);
  }

  // If no day of week pattern was matched, return null
  return null;
}

/**
 * Creates a standardized PatternResult object
 */
function createPatternResult(
  options: RecurrenceOptions, 
  matchedText: string,
  setProperties: Set<keyof RecurrenceOptions>
): PatternResult {
  const metadata: PatternMatchMetadata = {
    patternName: 'dayOfWeekPattern',
    category: PATTERN_CATEGORIES.DAY_OF_WEEK,
    matchedText,
    confidence: 0.9,
    isPartial: true,
    setProperties
  };
  
  return {
    options,
    metadata
  };
}

/**
 * Checks if a string is a valid day name in our mapping.
 * 
 * @param day - The day name to check (assumed to be already lowercase)
 * @returns True if the day is a valid key in our DAY_MAP
 */
function isValidDayName(day: string): boolean {
  return Object.keys(DAY_MAP).includes(day);
}

/**
 * Future extensions to this module could include:
 * 
 * 1. Support for nth weekday patterns like "first Monday of the month"
 * 2. Recognition of day ranges like "Monday through Friday"
 * 3. Support for "on" phrases like "weekly on Monday"
 * 4. Integration with positional patterns for complex expressions
 */
