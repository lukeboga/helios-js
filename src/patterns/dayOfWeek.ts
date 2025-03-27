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
import type { RecurrenceOptions } from '../types';
import { DAYS, SPECIAL_PATTERNS, PATTERN_PRIORITY } from '../constants';
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
   * @param options - Options object to be updated with recognized patterns
   */
  apply(input: string, options: RecurrenceOptions): void;

  /**
   * The priority of this pattern handler
   */
  priority: number;

  /**
   * Descriptive name of this pattern handler
   */
  name: string;
}

/**
 * Day of week pattern handler implementation
 */
export const dayOfWeekPatternHandler: DayOfWeekPatternHandler = {
  /**
   * Applies day of week pattern recognition to the input string
   * 
   * @param input - Normalized recurrence pattern string  
   * @param options - Options object to be updated with recognized patterns
   */
  apply(input: string, options: RecurrenceOptions): void {
    applyDayOfWeekRules(input, options);
  },

  /**
   * The priority of this pattern handler (from constants)
   */
  priority: PATTERN_PRIORITY.DAY_OF_WEEK,

  /**
   * Descriptive name of this pattern handler
   */
  name: 'Day of Week Pattern Handler'
};

/**
 * Applies day of week transformation rules to the input string and updates the options object
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
 * @param options - Options object to be updated with recognized patterns
 */
export function applyDayOfWeekRules(input: string, options: RecurrenceOptions): void {
  // Skip day of week processing if we've already established a MONTHLY or YEARLY frequency
  // Day of week patterns shouldn't override these higher-level frequencies
  if (options.freq === RRule.MONTHLY || options.freq === RRule.YEARLY) {
    return;
  }

  // First handle special cases where we already have weekday definitions
  if (Array.isArray(options.byweekday) && options.byweekday.length > 0) {
    return;
  }

  // Check for special day groups first (these are handled as special cases)

  // Weekday pattern (Monday-Friday)
  if (new RegExp(`\\b${SPECIAL_PATTERNS.EVERY}\\s+${SPECIAL_PATTERNS.WEEKDAY}\\b`).test(input)) {
    options.freq = RRule.WEEKLY;
    // WEEKDAYS is already of type RRule.Weekday[], which matches our RecurrenceOptions.byweekday
    options.byweekday = WEEKDAYS;
    return;
  }

  // Weekend pattern (Saturday-Sunday)
  if (new RegExp(`\\b${SPECIAL_PATTERNS.EVERY}\\s+${SPECIAL_PATTERNS.WEEKEND}\\b`).test(input)) {
    options.freq = RRule.WEEKLY;
    // WEEKEND_DAYS is already of type RRule.Weekday[], which matches our RecurrenceOptions.byweekday
    options.byweekday = WEEKEND_DAYS;
    return;
  }

  // Check for the common "Day X and Day Y" pattern
  // This handles cases like "every tuesday and thursday"
  const dayNamePattern = Object.values(DAYS).join('|');
  const combinedDaysRegex = new RegExp(
    `\\b(${dayNamePattern})(?:\\s+and\\s+(${dayNamePattern}))+\\b`,
    'i'
  );

  if (combinedDaysRegex.test(input)) {
    // Extract all day names from the input
    const matchedDays = extractDayNames(input);

    if (matchedDays.length > 0) {
      // matchedDays is already of type RRule.Weekday[], which matches our RecurrenceOptions.byweekday
      options.byweekday = matchedDays;

      // If frequency wasn't set, assume weekly
      if (options.freq === null) {
        options.freq = RRule.WEEKLY;
      }
      return;
    }
  }

  // Check for specific days pattern (e.g., "every monday")
  const specificDayRegex = new RegExp(
    `\\b${SPECIAL_PATTERNS.EVERY}\\s+(${dayNamePattern})\\b`,
    'gi'
  );

  let dayMatch;
  const daysFound: RRule.Weekday[] = [];

  // Find all occurrences of "every [day]" patterns
  while ((dayMatch = specificDayRegex.exec(input)) !== null) {
    const day = dayMatch[1].toLowerCase();
    
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

    // If frequency wasn't set, assume weekly
    if (options.freq === null) {
      options.freq = RRule.WEEKLY;
    }
  }
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
