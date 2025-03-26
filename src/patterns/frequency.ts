/**
 * Frequency Pattern Module
 * 
 * This module handles basic frequency recognition in natural language recurrence patterns.
 * It identifies simple frequency terms like "daily", "weekly", "monthly", "yearly",
 * as well as special cases like "weekday" and "weekend".
 * 
 * The frequency pattern is typically the most fundamental aspect of a recurrence rule,
 * establishing the base period for the recurrence.
 */

import { RRule } from 'rrule';
import type { RecurrenceOptions } from '../types';
import { FREQUENCY_TERMS, SPECIAL_PATTERNS, PATTERN_PRIORITY } from '../constants';
import { WEEKDAYS, WEEKEND_DAYS } from './utils';

/**
 * Interface defining a frequency pattern handler implementation
 */
export interface FrequencyPatternHandler {
  /**
   * Applies frequency pattern recognition to the input string
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
 * Frequency pattern handler implementation
 */
export const frequencyPatternHandler: FrequencyPatternHandler = {
  /**
   * Applies frequency pattern recognition to the input string
   * 
   * @param input - Normalized recurrence pattern string  
   * @param options - Options object to be updated with recognized patterns
   */
  apply(input: string, options: RecurrenceOptions): void {
    applyFrequencyRules(input, options);
  },

  /**
   * The priority of this pattern handler (from constants)
   */
  priority: PATTERN_PRIORITY.FREQUENCY,

  /**
   * Descriptive name of this pattern handler
   */
  name: 'Frequency Pattern Handler'
};

/**
 * Applies frequency transformation rules to the input string and updates the options object
 * 
 * This function recognizes:
 * - Basic frequency terms ("daily", "weekly", "monthly", "yearly")
 * - Equivalent terms ("every day", "every week", etc.)
 * - Special cases ("every weekday", "every weekend")
 * 
 * @param input - Normalized recurrence pattern string
 * @param options - Options object to be updated with recognized patterns
 */
export function applyFrequencyRules(input: string, options: RecurrenceOptions): void {
  // Simple frequency patterns - using word boundaries for precise matching

  // Daily frequency
  if (new RegExp(`\\b(${FREQUENCY_TERMS.DAILY}|${SPECIAL_PATTERNS.EVERY}\\s+day)\\b`).test(input)) {
    options.freq = RRule.DAILY;
    return;
  }

  // Weekly frequency
  if (new RegExp(`\\b(${FREQUENCY_TERMS.WEEKLY}|${SPECIAL_PATTERNS.EVERY}\\s+week)\\b`).test(input)) {
    options.freq = RRule.WEEKLY;
    return;
  }

  // Monthly frequency
  if (new RegExp(`\\b(${FREQUENCY_TERMS.MONTHLY}|${SPECIAL_PATTERNS.EVERY}\\s+month)\\b`).test(input)) {
    options.freq = RRule.MONTHLY;
    return;
  }

  // Yearly frequency
  if (new RegExp(`\\b(${FREQUENCY_TERMS.YEARLY}|${FREQUENCY_TERMS.ANNUALLY}|${SPECIAL_PATTERNS.EVERY}\\s+year)\\b`).test(input)) {
    options.freq = RRule.YEARLY;
    return;
  }

  // Special case: Weekdays (Monday-Friday)
  if (new RegExp(`\\b${SPECIAL_PATTERNS.EVERY}\\s+${SPECIAL_PATTERNS.WEEKDAY}\\b`).test(input)) {
    options.freq = RRule.WEEKLY;
    options.byweekday = WEEKDAYS;
    return;
  }

  // Special case: Weekend days (Saturday-Sunday)
  if (new RegExp(`\\b${SPECIAL_PATTERNS.EVERY}\\s+${SPECIAL_PATTERNS.WEEKEND}\\b`).test(input)) {
    options.freq = RRule.WEEKLY;
    options.byweekday = WEEKEND_DAYS;
    return;
  }

  // If no frequency pattern was matched, leave options.freq as null
  // A default will be applied later in the processing pipeline
}

/**
 * Future extensions to this module could include:
 * 
 * 1. Support for custom frequency terms like "fortnightly" or "quarterly"
 * 2. More sophisticated detection of implied frequencies based on context
 * 3. Recognition of ambiguous terms with multiple interpretations
 */
