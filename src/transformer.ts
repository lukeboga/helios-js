/**
 * Transformer Module
 * 
 * This module implements the transformation pipeline that converts natural language
 * recurrence patterns into structured RRule options. It orchestrates the application
 * of pattern handlers and manages the transformation process.
 * 
 * The transformer is responsible for:
 * 1. Initializing the options object with default values
 * 2. Applying pattern handlers in order of priority
 * 3. Applying default values for missing properties
 * 4. Cleaning up the options object before it's used to create an RRule
 */

import { RRule } from 'rrule';
import type { Options as RRuleOptions } from 'rrule';
import type { RecurrenceOptions, TransformerConfig, TransformationResult } from './types';
import { normalizeInput } from './normalizer';
import { patternHandlers } from './patterns';

/**
 * Default configuration for the transformer
 */
const defaultConfig: TransformerConfig = {
  handlers: patternHandlers,
  applyAll: true,
  applyDefaults: true
};

/**
 * Transforms a natural language recurrence pattern into RRule options
 * 
 * This function coordinates the entire transformation process:
 * 1. Normalizes the input text
 * 2. Initializes the options object
 * 3. Applies pattern handlers in priority order
 * 4. Applies default values and cleans up the result
 * 
 * @param input - Natural language recurrence pattern
 * @param config - Optional configuration for the transformation process
 * @returns RRule options object that can be used to create an RRule
 * 
 * @example
 * // Returns options for a weekly recurrence on Mondays
 * transformRecurrencePattern("every monday")
 */
export function transformRecurrencePattern(
  input: string,
  config: Partial<TransformerConfig> = {}
): TransformationResult {
  // Merge provided config with defaults
  const finalConfig: TransformerConfig = { ...defaultConfig, ...config };

  // Normalize the input
  const normalizedInput = normalizeInput(input);

  // Initialize options with defaults
  const options: RecurrenceOptions = initializeOptions();

  // Track which patterns matched for debugging and metadata
  const matchedPatterns: string[] = [];

  // Apply pattern handlers in order
  for (const handler of finalConfig.handlers) {
    // Save initial state to detect if handler made changes
    const optionsBefore = JSON.stringify(options);

    // Apply the handler
    handler.apply(normalizedInput, options);

    // Check if options were modified
    if (JSON.stringify(options) !== optionsBefore) {
      matchedPatterns.push(handler.name);

      // If we're not applying all handlers, stop after the first match
      if (!finalConfig.applyAll) {
        break;
      }
    }
  }

  // Apply defaults if required
  if (finalConfig.applyDefaults) {
    applyDefaults(options);
  }

  // Clean up options
  const result = cleanOptions(options);

  // Add metadata
  result.matchedPatterns = matchedPatterns;

  return result;
}

/**
 * Initializes an options object with default values
 * 
 * @returns Initialized options object
 */
function initializeOptions(): RecurrenceOptions {
  return {
    freq: null,
    interval: 1,
    byweekday: null,
    bymonthday: null,
    bymonth: null
  };
}

/**
 * Applies default values to options that weren't set by pattern handlers
 * 
 * @param options - Options object to apply defaults to
 */
function applyDefaults(options: RecurrenceOptions): void {
  // If no frequency was determined, default to daily
  if (options.freq === null) {
    options.freq = RRule.DAILY;
  }
}

/**
 * Cleans up the options object by removing empty arrays and null values
 * 
 * @param options - Options object to clean
 * @returns Cleaned options object suitable for creating an RRule
 */
function cleanOptions(options: RecurrenceOptions): TransformationResult {
  // Start with the basic required properties
  const result: Partial<RRuleOptions> = {
    freq: options.freq as number // Type assertion needed because null is not expected in final result
  };

  // Copy non-null/non-empty properties
  if (options.interval !== 1) {
    result.interval = options.interval;
  }

  if (Array.isArray(options.byweekday) && options.byweekday.length > 0) {
    // The byweekday property in RRule can accept the day constants directly
    result.byweekday = options.byweekday;
  }

  if (Array.isArray(options.bymonthday) && options.bymonthday.length > 0) {
    result.bymonthday = options.bymonthday;
  }

  if (Array.isArray(options.bymonth) && options.bymonth.length > 0) {
    result.bymonth = options.bymonth;
  }

  // Handle potential future properties
  if (Array.isArray(options.byhour) && options.byhour.length > 0) {
    result.byhour = options.byhour;
  }

  if (Array.isArray(options.byminute) && options.byminute.length > 0) {
    result.byminute = options.byminute;
  }

  if (Array.isArray(options.bysetpos) && options.bysetpos.length > 0) {
    result.bysetpos = options.bysetpos;
  }

  // Add metadata for the transformation result
  return result as TransformationResult;
}

/**
 * Future extensions to the transformer could include:
 * 
 * 1. Enhanced conflict resolution between pattern handlers
 * 2. Support for returning multiple possible interpretations for ambiguous inputs
 * 3. Warning generation for potentially incorrect interpretations
 * 4. Support for additional RRule properties not currently covered
 */
