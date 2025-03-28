/**
 * Frequency Pattern Module
 * 
 * This module handles frequency recognition in natural language recurrence patterns.
 * It matches patterns like "daily", "weekly", "monthly", "yearly" and their variants,
 * setting the appropriate frequency in the options object.
 * 
 * Frequency patterns are typically processed early in the pipeline as they establish
 * the fundamental recurrence type.
 */

import { RRule } from 'rrule';
import type { RecurrenceOptions, PatternResult, PatternMatchMetadata } from '../types';
import { FREQUENCY_TERMS, SPECIAL_PATTERNS, PATTERN_PRIORITY, PATTERN_CATEGORIES } from '../constants';
import { WEEKDAYS, WEEKEND_DAYS, createPatternResult } from './utils';

/**
 * Frequency pattern handler implementation
 */
export const frequencyPatternHandler = {
  /**
   * Applies frequency pattern recognition to the input string
   * 
   * @param input - Normalized recurrence pattern string
   * @returns PatternResult if a pattern was matched, null otherwise
   */
  apply(input: string): PatternResult | null {
    const result = applyFrequencyRules(input);
    return result;
  },

  /**
   * The priority of this pattern handler (from constants)
   */
  priority: PATTERN_PRIORITY.FREQUENCY,

  /**
   * Descriptive name of this pattern handler
   */
  name: 'Frequency Pattern Handler',
  
  /**
   * The category this pattern handler belongs to
   */
  category: PATTERN_CATEGORIES.FREQUENCY
};

/**
 * Applies frequency transformation rules to the input string
 * 
 * This function recognizes:
 * - Basic frequency terms ("daily", "weekly", "monthly", "yearly")
 * - Equivalent terms ("every day", "every week", etc.)
 * - Special cases ("every weekday", "every weekend")
 * 
 * @param input - Normalized recurrence pattern string
 * @returns PatternResult if a pattern was matched, null otherwise
 */
export function applyFrequencyRules(input: string): PatternResult | null {
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

  // Simple frequency patterns - using word boundaries for precise matching

  // Daily frequency
  if (new RegExp(`\\b(${FREQUENCY_TERMS.DAILY}|${SPECIAL_PATTERNS.EVERY}\\s+day)\\b`).test(input)) {
    options.freq = RRule.DAILY;
    setProperties.add('freq');
    matchedText = input.match(new RegExp(`\\b(${FREQUENCY_TERMS.DAILY}|${SPECIAL_PATTERNS.EVERY}\\s+day)\\b`))![0];
    return createPatternResult(options, matchedText, setProperties, PATTERN_CATEGORIES.FREQUENCY, 'frequencyPattern');
  }

  // Weekly frequency
  if (new RegExp(`\\b(${FREQUENCY_TERMS.WEEKLY}|${SPECIAL_PATTERNS.EVERY}\\s+week)\\b`).test(input)) {
    options.freq = RRule.WEEKLY;
    setProperties.add('freq');
    matchedText = input.match(new RegExp(`\\b(${FREQUENCY_TERMS.WEEKLY}|${SPECIAL_PATTERNS.EVERY}\\s+week)\\b`))![0];
    return createPatternResult(options, matchedText, setProperties, PATTERN_CATEGORIES.FREQUENCY, 'frequencyPattern');
  }

  // Monthly frequency
  if (new RegExp(`\\b(${FREQUENCY_TERMS.MONTHLY}|${SPECIAL_PATTERNS.EVERY}\\s+month)\\b`).test(input)) {
    options.freq = RRule.MONTHLY;
    setProperties.add('freq');
    matchedText = input.match(new RegExp(`\\b(${FREQUENCY_TERMS.MONTHLY}|${SPECIAL_PATTERNS.EVERY}\\s+month)\\b`))![0];
    return createPatternResult(options, matchedText, setProperties, PATTERN_CATEGORIES.FREQUENCY, 'frequencyPattern');
  }

  // Yearly frequency
  if (new RegExp(`\\b(${FREQUENCY_TERMS.YEARLY}|${FREQUENCY_TERMS.ANNUALLY}|${SPECIAL_PATTERNS.EVERY}\\s+year)\\b`).test(input)) {
    options.freq = RRule.YEARLY;
    setProperties.add('freq');
    matchedText = input.match(new RegExp(`\\b(${FREQUENCY_TERMS.YEARLY}|${FREQUENCY_TERMS.ANNUALLY}|${SPECIAL_PATTERNS.EVERY}\\s+year)\\b`))![0];
    return createPatternResult(options, matchedText, setProperties, PATTERN_CATEGORIES.FREQUENCY, 'frequencyPattern');
  }

  // Special case: Weekdays (Monday-Friday)
  if (new RegExp(`\\b${SPECIAL_PATTERNS.EVERY}\\s+${SPECIAL_PATTERNS.WEEKDAY}\\b`).test(input)) {
    options.freq = RRule.WEEKLY;
    options.byweekday = WEEKDAYS;
    setProperties.add('freq');
    setProperties.add('byweekday');
    matchedText = input.match(new RegExp(`\\b${SPECIAL_PATTERNS.EVERY}\\s+${SPECIAL_PATTERNS.WEEKDAY}\\b`))![0];
    return createPatternResult(options, matchedText, setProperties, PATTERN_CATEGORIES.FREQUENCY, 'frequencyPattern');
  }

  // Special case: Weekend days (Saturday-Sunday)
  if (new RegExp(`\\b${SPECIAL_PATTERNS.EVERY}\\s+${SPECIAL_PATTERNS.WEEKEND}\\b`).test(input)) {
    options.freq = RRule.WEEKLY;
    options.byweekday = WEEKEND_DAYS;
    setProperties.add('freq');
    setProperties.add('byweekday');
    matchedText = input.match(new RegExp(`\\b${SPECIAL_PATTERNS.EVERY}\\s+${SPECIAL_PATTERNS.WEEKEND}\\b`))![0];
    return createPatternResult(options, matchedText, setProperties, PATTERN_CATEGORIES.FREQUENCY, 'frequencyPattern');
  }

  // If no frequency pattern was matched, return null
  return null;
}

/**
 * Future extensions to this module could include:
 * 
 * 1. Support for custom frequency terms like "fortnightly" or "quarterly"
 * 2. More sophisticated detection of implied frequencies based on context
 * 3. Recognition of ambiguous terms with multiple interpretations
 */
