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
 * Note on type compatibility: This function handles the type discrepancy between:
 * 1. RRuleOptions (from the rrule package import) - allows null values
 * 2. RRule.Options (from RRule constructor) - uses undefined instead of null
 * 
 * These discrepancies are handled with proper null checks and type conversions.
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
  // Get the RRule options from the natural language transformer
  const options = naturalLanguageToRRule(startDate, recurrencePattern, endDate);
  
  // Create a clean options object for the RRule constructor
  // We use type assertion because we know the values are compatible at runtime
  // even though TypeScript sees incompatibilities between RRuleOptions and RRule.Options
  const ruleOptions: RRule.Options = {
    freq: options.freq,
    dtstart: startDate,
    interval: options.interval || 1
  };
  
  // Copy remaining properties, converting nulls to undefined
  if (options.wkst !== null) ruleOptions.wkst = options.wkst;
  if (options.count !== null) ruleOptions.count = options.count;
  if (options.until !== null) ruleOptions.until = options.until;
  if (options.bysetpos !== null) ruleOptions.bysetpos = options.bysetpos;
  if (options.bymonth !== null) ruleOptions.bymonth = options.bymonth;
  if (options.bymonthday !== null) ruleOptions.bymonthday = options.bymonthday;
  if (options.byyearday !== null) ruleOptions.byyearday = options.byyearday;
  if (options.byweekno !== null) ruleOptions.byweekno = options.byweekno;
  if (options.byhour !== null) ruleOptions.byhour = options.byhour;
  if (options.byminute !== null) ruleOptions.byminute = options.byminute;
  if (options.bysecond !== null) ruleOptions.bysecond = options.bysecond;
  
  // Handle byweekday property specially
  if (options.byweekday !== null) {
    // Direct cast as any -> correct type for RRule constructor
    // This works at runtime despite the TypeScript type mismatch
    ruleOptions.byweekday = options.byweekday as any;
  }
  
  return new RRule(ruleOptions);
}

// For better compatibility with the RRule library, we also export the utility
// functions and other components that might be useful for consumers
export { asWeekdays };

// Export type definitions to be used by consumers
export type { RRuleOptions };
