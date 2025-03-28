/**
 * Interval Pattern Module
 * 
 * This module handles interval-based recurrence patterns in natural language input.
 * It detects patterns like "every 2 weeks" or "every other month" and sets
 * appropriate interval and frequency values.
 * 
 * Interval patterns typically take precedence over basic frequency patterns
 * because they provide more specific information about the recurrence schedule.
 */

import { RRule } from 'rrule';
import type { Frequency } from 'rrule';
import type { RecurrenceOptions } from '../types';
import { TIME_UNITS, SPECIAL_PATTERNS, PATTERN_PRIORITY, PATTERN_CATEGORIES } from '../constants';
import { timeUnitToFrequency } from './utils';

/**
 * Interface defining an interval pattern handler implementation
 */
export interface IntervalPatternHandler {
  /**
   * Applies interval pattern recognition to the input string
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

  /**
   * The category this pattern handler belongs to
   */
  category: string;
}

/**
 * Interval pattern handler implementation
 */
export const intervalPatternHandler: IntervalPatternHandler = {
  /**
   * Applies interval pattern recognition to the input string
   * 
   * @param input - Normalized recurrence pattern string  
   * @param options - Options object to be updated with recognized patterns
   */
  apply(input: string, options: RecurrenceOptions): void {
    applyIntervalRules(input, options);
  },

  /**
   * The priority of this pattern handler (from constants)
   */
  priority: PATTERN_PRIORITY.INTERVAL,

  /**
   * Descriptive name of this pattern handler
   */
  name: 'Interval Pattern Handler',
  
  /**
   * The category this pattern handler belongs to
   */
  category: PATTERN_CATEGORIES.INTERVAL
};

/**
 * Frequency mapping that converts time unit strings to RRule frequency constants
 * This map is used to set the frequency based on the time unit in interval patterns
 */
const unitToFrequency: Record<string, Frequency> = {
  [TIME_UNITS.DAY]: RRule.DAILY,
  [TIME_UNITS.WEEK]: RRule.WEEKLY,
  [TIME_UNITS.MONTH]: RRule.MONTHLY,
  [TIME_UNITS.YEAR]: RRule.YEARLY
};

/**
 * Applies interval transformation rules to the input string and updates the options object
 * 
 * This function recognizes:
 * - Numeric intervals ("every 2 days", "every 3 weeks", etc.)
 * - "Every other" patterns ("every other day", "every other week", etc.)
 * 
 * When an interval pattern is matched, it sets both the interval and frequency based
 * on the time unit specified in the pattern.
 * 
 * @param input - Normalized recurrence pattern string
 * @param options - Options object to be updated with recognized patterns
 */
export function applyIntervalRules(input: string, options: RecurrenceOptions): void {
  // Check for "every X days/weeks/months/years" pattern
  // Uses a regex with capturing groups to extract both the interval number and the time unit
  const intervalMatch = new RegExp(
    `${SPECIAL_PATTERNS.EVERY}\\s+(\\d+)\\s+(${TIME_UNITS.DAY}|${TIME_UNITS.WEEK}|${TIME_UNITS.MONTH}|${TIME_UNITS.YEAR})s?`,
    'i'
  ).exec(input);

  if (intervalMatch) {
    const interval = parseInt(intervalMatch[1], 10);
    const unit = intervalMatch[2].toLowerCase();

    // Set the interval
    options.interval = interval;

    // Always set the frequency based on the unit from the interval pattern
    // This takes precedence over any previously set frequency
    options.freq = unitToFrequency[unit];
    return; // Return early to avoid checking other patterns
  }

  // Check for "every other X" pattern
  // This is a special case that sets interval to 2
  const otherMatch = new RegExp(
    `${SPECIAL_PATTERNS.EVERY}\\s+${SPECIAL_PATTERNS.OTHER}\\s+(${TIME_UNITS.DAY}|${TIME_UNITS.WEEK}|${TIME_UNITS.MONTH}|${TIME_UNITS.YEAR})`,
    'i'
  ).exec(input);

  if (otherMatch) {
    options.interval = 2; // "Every other" means interval of 2

    // Set frequency based on the matched unit
    const unit = otherMatch[1].toLowerCase();
    options.freq = unitToFrequency[unit];
  }

  // If no interval pattern was matched, leave options.interval as is
  // (it should be initialized to 1 by default)
}

/**
 * Future extensions to this module could include:
 * 
 * 1. Support for more complex interval expressions like "bi-weekly" or "semi-monthly"
 * 2. Recognition of interval expressions in different languages
 * 3. Handling of numeric words like "every three months" instead of "every 3 months"
 * 4. Support for fractional intervals (though RRule may not support this)
 */
