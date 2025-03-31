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
 * - validatePattern: Validates if a pattern can be parsed correctly
 * 
 * This library supports patterns like:
 * - "daily", "weekly", "monthly", "yearly"
 * - "every 2 days", "every other week"
 * - "every Monday", "every Tuesday and Thursday"
 * - "every weekday", "every weekend" 
 * - "1st of the month", "last day of month"
 * - "until December 31st, 2023"
 * - Combined patterns like "every Monday and Friday until December 31st"
 */

import { RRule } from 'rrule';
import type { Options as RRuleOptions, ByWeekday } from 'rrule';
import type { Frequency } from 'rrule';
import { processRecurrencePattern, RecurrenceProcessorOptions } from './processor';
import { normalizeInput, comprehensiveNormalize, type NormalizerOptions } from './normalizer';
import { datetime, asWeekdays } from './utils';
import type { RecurrenceOptions } from './types';

// Re-export utility functions
export { datetime, normalizeInput, comprehensiveNormalize };

// Re-export types
export type { RecurrenceProcessorOptions, NormalizerOptions };

// Type for RRule constructor that requires only freq property
interface MinimalRRuleOptions {
  freq: Frequency;
  dtstart?: Date;
  interval?: number;
  [key: string]: any;
}

/**
 * Converts a natural language recurrence pattern to an RRule options object
 * 
 * This function is the core conversion mechanism, taking natural language text
 * and transforming it into a structured options object that can be used with RRule.
 * 
 * End dates can be specified directly in the recurrence pattern 
 * (e.g., "every Monday until December 31st").
 * 
 * @param startDate - The start date for the recurrence pattern
 * @param recurrencePattern - Natural language description (e.g., "every 2 weeks")
 * @param config - Optional configuration for the processing
 * @returns An RRule configuration object or null if pattern couldn't be processed
 * 
 * @example
 * // Returns options for weekly recurrence on Mondays
 * naturalLanguageToRRule(new Date(), "every monday")
 * 
 * @example
 * // Using end date in the pattern
 * naturalLanguageToRRule(new Date(), "every monday until December 31, 2023")
 */
export function naturalLanguageToRRule(
  startDate: Date,
  recurrencePattern: string,
  config?: Partial<RecurrenceProcessorOptions>
): MinimalRRuleOptions | null {
  // Process the natural language pattern to RRule options
  const options = processRecurrencePattern(recurrencePattern, config);
  
  // If no pattern was recognized or no frequency was found, return null
  if (!options || options.freq === null) {
    return null;
  }

  // Create the output options object with required properties
  const ruleOptions: MinimalRRuleOptions = {
    freq: options.freq,
    dtstart: startDate,
    interval: options.interval || 1
  };
  
  // Copy optional properties if they exist
  if (options.byweekday) ruleOptions.byweekday = options.byweekday as unknown as ByWeekday[];
  if (options.bymonthday) ruleOptions.bymonthday = options.bymonthday;
  if (options.bymonth) ruleOptions.bymonth = options.bymonth;
  if (options.until) ruleOptions.until = options.until;
  if (options.count) ruleOptions.count = options.count;
  if (options.byhour) ruleOptions.byhour = options.byhour;
  if (options.byminute) ruleOptions.byminute = options.byminute;
  if (options.bysetpos) ruleOptions.bysetpos = options.bysetpos;
  
  return ruleOptions;
}

/**
 * Creates an RRule instance from a natural language recurrence pattern
 * 
 * This is a convenience function that combines naturalLanguageToRRule with
 * RRule instantiation, returning a ready-to-use RRule object.
 * 
 * @param startDate - The start date for the recurrence pattern
 * @param recurrencePattern - Natural language description (e.g., "every Monday")
 * @param config - Optional configuration for the processing
 * @returns An RRule instance or null if pattern couldn't be processed
 * 
 * @example
 * // Create a rule for every Monday
 * const rule = createRRule(new Date(), "every monday");
 * 
 * // Get the next 5 occurrences
 * const nextFive = rule.all((date, i) => i < 5);
 * 
 * @example
 * // Create a rule with an end date in the pattern
 * const rule = createRRule(new Date(), "every monday until December 31, 2023");
 */
export function createRRule(
  startDate: Date,
  recurrencePattern: string,
  config?: Partial<RecurrenceProcessorOptions>
): RRule | null {
  // Get the RRule options from the natural language processor
  const ruleOptions = naturalLanguageToRRule(startDate, recurrencePattern, config);
  
  // If no pattern was recognized, return null
  if (!ruleOptions) {
    return null;
  }
  
  // Create the RRule instance with the options
  return new RRule(ruleOptions);
}

/**
 * Validates if a natural language pattern can be parsed correctly
 * 
 * This function checks if a given pattern can be successfully processed
 * into RRule options. It returns a validation result with details about
 * the success or failure of the parsing attempt.
 * 
 * @param pattern - The natural language pattern to validate
 * @param config - Optional configuration for the processing
 * @returns Validation result with success flag and confidence score
 * 
 * @example
 * // Check if a pattern is valid
 * const result = validatePattern("every monday and fridays");
 * if (result.valid) {
 *   console.log("Pattern is valid with confidence:", result.confidence);
 * } else {
 *   console.log("Pattern is invalid");
 * }
 */
export function validatePattern(
  pattern: string,
  config?: Partial<RecurrenceProcessorOptions>
): ValidationResult {
  try {
    // Attempt to process the pattern
    const result = processRecurrencePattern(pattern, config);
    
    // Check if we have any result
    const isValid = result !== null;
    
    // Return the validation result
    return {
      valid: isValid,
      confidence: result?.confidence || 0,
      warnings: []
    };
  } catch (error) {
    // If processing throws an error, the pattern is invalid
    return {
      valid: false,
      confidence: 0,
      warnings: [(error as Error).message]
    };
  }
}

/**
 * Suggests corrections for potentially invalid patterns
 * 
 * This function attempts to identify common issues in natural language patterns
 * and suggests potential corrections or alternatives.
 * 
 * @param pattern - The natural language pattern to analyze
 * @returns Array of suggested corrections or empty array if no suggestions
 * 
 * @example
 * // Get suggestions for an invalid pattern
 * const suggestions = suggestPatternCorrections("evry monday");
 * // Returns: ["every monday"]
 */
export function suggestPatternCorrections(pattern: string): string[] {
  // Start with the normalized pattern
  const normalizedPattern = comprehensiveNormalize(pattern);
  
  // If the normalized pattern is different and valid, suggest it
  if (normalizedPattern !== pattern) {
    const validation = validatePattern(normalizedPattern);
    
    if (validation.valid) {
      return [normalizedPattern];
    }
  }
  
  // More sophisticated suggestions could be added here
  // For example, detecting common pattern types and suggesting templates
  
  // No suggestions found
  return [];
}

/**
 * Result of pattern validation
 */
export interface ValidationResult {
  /**
   * Whether the pattern is valid
   */
  valid: boolean;
  
  /**
   * Confidence score (0.0 to 1.0) indicating how confident the system is
   * in its interpretation of the pattern
   */
  confidence: number;
  
  /**
   * Array of warnings or error messages
   */
  warnings: string[];
}

// For better compatibility with the RRule library, we also export the utility
// functions and other components that might be useful for consumers
export { asWeekdays };

// Export type definitions to be used by consumers
export type { RRuleOptions, RecurrenceOptions };
