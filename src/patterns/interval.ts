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
import type { RecurrenceOptions, PatternResult, PatternMatchMetadata } from '../types';
import { TIME_UNITS, SPECIAL_PATTERNS, PATTERN_PRIORITY, PATTERN_CATEGORIES } from '../constants';
import { timeUnitToFrequency, createPatternResult } from './utils';

/**
 * Interface defining an interval pattern handler implementation
 */
export interface IntervalPatternHandler {
  /**
   * Applies interval pattern recognition to the input string
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
 * Interval pattern handler implementation
 */
export const intervalPatternHandler = {
  /**
   * Applies interval pattern recognition to the input string
   * 
   * @param input - Normalized recurrence pattern string
   * @returns PatternResult if a pattern was matched, null otherwise
   */
  apply(input: string): PatternResult | null {
    const result = applyIntervalRules(input);
    return result;
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
 * Applies interval transformation rules to the input string
 * 
 * This function recognizes:
 * - Numeric intervals ("every 2 days", "every 3 weeks", etc.)
 * - "Every other" patterns ("every other day", "every other week", etc.)
 * 
 * When an interval pattern is matched, it sets both the interval and frequency based
 * on the time unit specified in the pattern.
 * 
 * @param input - Normalized recurrence pattern string
 * @returns PatternResult if a pattern was matched, null otherwise
 */
export function applyIntervalRules(input: string): PatternResult | null {
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
    setProperties.add('interval');

    // Set the frequency based on the unit from the interval pattern
    options.freq = unitToFrequency[unit];
    setProperties.add('freq');
    
    matchedText = intervalMatch[0];
    return createPatternResult(options, matchedText, setProperties, PATTERN_CATEGORIES.INTERVAL, 'intervalPattern');
  }

  // Check for "every other X" pattern
  // This is a special case that sets interval to 2
  const otherMatch = new RegExp(
    `${SPECIAL_PATTERNS.EVERY}\\s+${SPECIAL_PATTERNS.OTHER}\\s+(${TIME_UNITS.DAY}|${TIME_UNITS.WEEK}|${TIME_UNITS.MONTH}|${TIME_UNITS.YEAR})`,
    'i'
  ).exec(input);

  if (otherMatch) {
    options.interval = 2; // "Every other" means interval of 2
    setProperties.add('interval');

    // Set frequency based on the matched unit
    const unit = otherMatch[1].toLowerCase();
    options.freq = unitToFrequency[unit];
    setProperties.add('freq');
    
    matchedText = otherMatch[0];
    return createPatternResult(options, matchedText, setProperties, PATTERN_CATEGORIES.INTERVAL, 'intervalPattern');
  }

  // If no interval pattern was matched, return null
  return null;
}

/**
 * Future extensions to this module could include:
 * 
 * 1. Support for more complex interval expressions like "bi-weekly" or "semi-monthly"
 * 2. Recognition of interval expressions in different languages
 * 3. Handling of numeric words like "every three months" instead of "every 3 months"
 * 4. Support for fractional intervals (though RRule may not support this)
 */
