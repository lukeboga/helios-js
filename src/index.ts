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
import type { Options as RRuleOptions } from 'rrule';
import { transformRecurrencePattern } from './transformer';
import { normalizeInput, comprehensiveNormalize, type NormalizerOptions } from './normalizer';
import { datetime, asWeekdays } from './utils';
import type { TransformerConfig, TransformationResult } from './types';

// Re-export utility functions
export { datetime, normalizeInput, comprehensiveNormalize };

// Re-export types
export type { TransformerConfig, NormalizerOptions };

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
 * @param config - Optional configuration for the transformation process
 * @returns An RRule configuration object
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
  config?: Partial<TransformerConfig>
): RRuleOptions & TransformationResult {
  // Transform the natural language pattern to RRule options
  const options = transformRecurrencePattern(recurrencePattern, config);

  // Add start date to options
  options.dtstart = startDate;

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
 * @param config - Optional configuration for the transformation process
 * @returns An RRule instance
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
  config?: Partial<TransformerConfig>
): RRule {
  // Get the RRule options from the natural language transformer
  const options = naturalLanguageToRRule(startDate, recurrencePattern, config);
  
  // Create a clean options object for the RRule constructor
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
    ruleOptions.byweekday = options.byweekday as any;
  }
  
  return new RRule(ruleOptions);
}

/**
 * Validates if a natural language pattern can be parsed correctly
 * 
 * This function checks if a given pattern can be successfully transformed
 * into RRule options. It returns a validation result with details about
 * the success or failure of the parsing attempt.
 * 
 * @param pattern - The natural language pattern to validate
 * @param config - Optional configuration for the transformation process
 * @returns Validation result with success flag, confidence score, and any warnings
 * 
 * @example
 * // Check if a pattern is valid
 * const result = validatePattern("every monday and fridays");
 * if (result.valid) {
 *   console.log("Pattern is valid with confidence:", result.confidence);
 * } else {
 *   console.log("Pattern is invalid:", result.warnings);
 * }
 */
export function validatePattern(
  pattern: string,
  config?: Partial<TransformerConfig>
): ValidationResult {
  try {
    // Attempt to transform the pattern
    const result = transformRecurrencePattern(pattern, config);
    
    // Check if we have any frequency set (the minimum requirement)
    const isValid = result.freq !== null;
    
    // Return the validation result
    return {
      valid: isValid,
      confidence: result.confidence || 0,
      warnings: result.warnings || [],
      matchedPatterns: result.matchedPatterns || []
    };
  } catch (error) {
    // If transformation throws an error, the pattern is invalid
    return {
      valid: false,
      confidence: 0,
      warnings: [(error as Error).message],
      matchedPatterns: []
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
  
  /**
   * Array of pattern types that were matched
   */
  matchedPatterns: string[];
}

// For better compatibility with the RRule library, we also export the utility
// functions and other components that might be useful for consumers
export { asWeekdays };

// Export type definitions to be used by consumers
export type { RRuleOptions, TransformationResult };
