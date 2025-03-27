/**
 * Natural Language to RRule Converter
 * 
 * This module provides functions to convert natural language recurrence patterns
 * into RRule configurations. It bridges the gap between how humans naturally express
 * recurrence (like "every Monday") and the structured format RRule expects.
 * 
 * The main functions are:
 * - naturalLanguageToRRule: Converts text to RRule options
 * - createRRule: Creates an RRule instance from text
 * 
 * This library supports patterns like:
 * - "daily", "weekly", "monthly", "yearly"
 * - "every 2 days", "every other week"
 * - "every Monday", "every Tuesday and Thursday"
 * - "every weekday", "every weekend"
 */

import { RRule } from 'rrule';
import type { Options as RRuleOptions } from 'rrule';
import { transformRecurrencePattern } from './transformer';
import { datetime, asWeekdays } from './utils';

// Re-export utility functions
export { datetime };

/**
 * Converts a natural language recurrence pattern to an RRule options object
 * 
 * This function is the core conversion mechanism, taking natural language text
 * and transforming it into a structured options object that can be used with RRule.
 * 
 * @param startDate - The start date for the recurrence pattern
 * @param recurrencePattern - Natural language description (e.g., "every 2 weeks")
 * @param endDate - Optional end date for the recurrence pattern
 * @returns An RRule configuration object
 * 
 * @example
 * // Returns options for weekly recurrence on Mondays
 * naturalLanguageToRRule(new Date(), "every monday")
 */
export function naturalLanguageToRRule(
  startDate: Date,
  recurrencePattern: string,
  endDate?: Date
): RRuleOptions {
  // Transform the natural language pattern to RRule options
  const options = transformRecurrencePattern(recurrencePattern);

  // Add start and end dates to options
  options.dtstart = startDate;

  if (endDate) {
    options.until = endDate;
  }

  return options;
}

/**
 * Creates an RRule instance from a natural language recurrence pattern
 * 
 * This is a convenience function that combines naturalLanguageToRRule with
 * RRule instantiation, returning a ready-to-use RRule object.
 * 
 * @param startDate - The start date for the recurrence pattern
 * @param recurrencePattern - Natural language description (e.g., "every Monday")
 * @param endDate - Optional end date for the recurrence pattern
 * @returns An RRule instance
 * 
 * @example
 * // Create a rule for every Monday
 * const rule = createRRule(new Date(), "every monday");
 * 
 * // Get the next 5 occurrences
 * const nextFive = rule.all((date, i) => i < 5);
 */
export function createRRule(
  startDate: Date,
  recurrencePattern: string,
  endDate?: Date
): RRule {
  const options = naturalLanguageToRRule(startDate, recurrencePattern, endDate);
  return new RRule(options);
}

// For better compatibility with the RRule library, we also export the utility
// functions and other components that might be useful for consumers
export { asWeekdays };

// Export type definitions to be used by consumers
export type { RRuleOptions };
