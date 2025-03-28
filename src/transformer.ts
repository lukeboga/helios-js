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
import type { 
  RecurrenceOptions, 
  TransformerConfig, 
  TransformationResult, 
  PatternResult 
} from './types';
import { normalizeInput } from './normalizer';
import { patternHandlers } from './patterns';
import { asWeekdays } from './utils';
import { splitPattern } from './patterns/splitter';
import { combinePatternResults } from './patterns/combiner';

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
 * 2. Splits the input into sub-patterns if it contains conjunctions
 * 3. Processes each sub-pattern individually
 * 4. Combines the results using the pattern combiner
 * 5. Applies default values and cleans up the result
 * 
 * @param input - Natural language recurrence pattern
 * @param config - Optional configuration for the transformation process
 * @returns RRule options object that can be used to create an RRule
 * 
 * @example
 * // Returns options for a weekly recurrence on Mondays and Fridays
 * transformRecurrencePattern("every monday and friday")
 */
export function transformRecurrencePattern(
  input: string,
  config: Partial<TransformerConfig> = {}
): TransformationResult {
  // Merge provided config with defaults
  const finalConfig: TransformerConfig = { ...defaultConfig, ...config };

  // Normalize the input
  const normalizedInput = normalizeInput(input);

  // Track which patterns matched for debugging and metadata
  const matchedPatterns: string[] = [];
  
  // Track confidence of the overall transformation
  let confidence = 1.0;
  
  // Track any warnings generated during transformation
  const warnings: string[] = [];

  try {
    // Split the input into sub-patterns if it contains conjunctions
    const { patterns } = splitPattern(normalizedInput);
    
    // If we have multiple patterns, process each one and combine them
    if (patterns.length > 1) {
      // Process each sub-pattern individually
      const patternResults: PatternResult[] = [];
      
      for (const pattern of patterns) {
        const result = processPatternWithAdapter(pattern, finalConfig);
        if (result) {
          patternResults.push(result);
          
          // Add any matched patterns to our tracking list
          if (result.metadata.patternName) {
            matchedPatterns.push(result.metadata.patternName);
          }
          
          // Update confidence to the minimum of all patterns
          confidence = Math.min(confidence, result.metadata.confidence);
          
          // Add any warnings from this pattern
          if (result.metadata.warnings) {
            warnings.push(...result.metadata.warnings);
          }
        }
      }
      
      // If we found multiple valid patterns, combine them
      if (patternResults.length > 1) {
        // Use the combiner to merge all pattern results
        const combinedOptions = combinePatternResults(patternResults);
        
        // Create the final cleaned result
        const result = cleanOptions(combinedOptions);
        
        // Add metadata
        result.matchedPatterns = matchedPatterns;
        result.confidence = confidence;
        result.warnings = warnings;
        
        return result;
      }
      // If we only found one valid pattern or none, fall back to the traditional approach
    }
    
    // For single patterns or fallback, use the traditional approach
    return processTraditional(normalizedInput, finalConfig);
    
  } catch (error) {
    // If there was an error in the advanced processing, fall back to the traditional approach
    console.warn('Error in advanced pattern processing, falling back to traditional approach:', error);
    return processTraditional(normalizedInput, finalConfig);
  }
}

/**
 * Adapter function that processes a pattern using the existing pattern handlers
 * but returns a PatternResult compatible with the new combiner system.
 * 
 * This function bridges between the old handler.apply(input, options) format
 * and the new handler.apply(input): PatternResult format that's expected by the combiner.
 * 
 * @param pattern - The normalized pattern to process
 * @param config - Configuration for the transformation
 * @returns PatternResult if a pattern was matched, null otherwise
 */
function processPatternWithAdapter(pattern: string, config: TransformerConfig): PatternResult | null {
  // Initialize options with defaults
  const options: RecurrenceOptions = initializeOptions();
  
  // Create a PatternResult to return
  let result: PatternResult | null = null;
  let matchedHandler = null;
  
  // Try each handler to see if it can process this pattern
  for (const handler of config.handlers) {
    // Save initial state to detect if handler made changes
    const optionsBefore = JSON.stringify(options);
    
    // Apply the handler the traditional way
    // TypeScript doesn't know that our handlers actually support this signature
    // but we know they do based on implementation
    (handler as any).apply(pattern, options);
    
    // Check if options were modified
    if (JSON.stringify(options) !== optionsBefore) {
      // Track which handler matched
      matchedHandler = handler;
      
      // If we're not applying all handlers, stop after the first match
      if (!config.applyAll) {
        break;
      }
    }
  }
  
  // If a handler matched, create a PatternResult
  if (matchedHandler) {
    // Make a deep copy of the options to avoid reference issues
    const optionsCopy = JSON.parse(JSON.stringify(options));
    
    // Recreate any non-serializable properties (like RRule.Weekday objects)
    if (options.byweekday) {
      optionsCopy.byweekday = options.byweekday;
    }
    
    result = {
      options: optionsCopy,
      metadata: {
        patternName: matchedHandler.name,
        category: matchedHandler.category || '',
        matchedText: pattern,
        confidence: 0.8, // Default confidence
        isPartial: true, 
        setProperties: new Set<keyof RecurrenceOptions>()
      }
    };
  }
  
  return result;
}

/**
 * Processes a pattern using the traditional approach (for backward compatibility)
 * 
 * @param input - The normalized pattern to process
 * @param config - Configuration for the transformation
 * @returns TransformationResult
 */
function processTraditional(input: string, config: TransformerConfig): TransformationResult {
  // Initialize options with defaults
  const options: RecurrenceOptions = initializeOptions();

  // Track which patterns matched for debugging and metadata
  const matchedPatterns: string[] = [];

  // Apply pattern handlers in order
  for (const handler of config.handlers) {
    // Save initial state to detect if handler made changes
    const optionsBefore = JSON.stringify(options);

    // Apply the handler the traditional way
    // TypeScript doesn't know that our handlers actually support this signature
    // but we know they do based on implementation
    (handler as any).apply(input, options);

    // Check if options were modified
    if (JSON.stringify(options) !== optionsBefore) {
      matchedPatterns.push(handler.name);

      // If we're not applying all handlers, stop after the first match
      if (!config.applyAll) {
        break;
      }
    }
  }

  // Apply defaults if required
  if (config.applyDefaults) {
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
    // Convert from internal RRule.Weekday[] to the Weekday[] type expected by RRule options
    // This is critical for type compatibility between our internal representation and RRule's API
    result.byweekday = asWeekdays(options.byweekday);
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
  
  if (options.until) {
    result.until = options.until;
  }
  
  if (options.count) {
    result.count = options.count;
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
