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
import { combinePatternResults, mergeOptions } from './patterns/combiner';

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
        try {
          // Process each pattern using the new-style pattern handlers
          const result = processPattern(pattern, finalConfig);
          
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
        } catch (error) {
          // If processing fails for a sub-pattern, add a warning and continue
          warnings.push(`Failed to process sub-pattern "${pattern}": ${(error as Error).message}`);
        }
      }
      
      // If we found multiple valid patterns, combine them
      if (patternResults.length > 1) {
        // Ensure all pattern results have their setProperties initialized
        patternResults.forEach(pattern => {
          if (!pattern.metadata.setProperties) {
            pattern.metadata.setProperties = new Set<keyof RecurrenceOptions>();
          }
        });
        
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
      // If we only found one valid pattern, process it as a regular pattern
      else if (patternResults.length === 1) {
        // Use the single matched pattern
        const result = cleanOptions(patternResults[0].options);
        
        // Add metadata
        result.matchedPatterns = matchedPatterns;
        result.confidence = confidence;
        result.warnings = warnings;
        
        return result;
      }
    }
    
    // For single patterns or when no combined patterns were found
    // Convert PatternResult to TransformationResult
    const patternResult = processPattern(normalizedInput, finalConfig);
    if (patternResult) {
      const result = cleanOptions(patternResult.options);
      
      // Transfer metadata from pattern result
      result.matchedPatterns = [patternResult.metadata.patternName];
      result.confidence = patternResult.metadata.confidence;
      result.warnings = patternResult.metadata.warnings || [];
      
      return result;
    }
    
    // If no pattern was matched, create a basic result
    const options = initializeOptions();
    
    // Apply defaults if required
    if (finalConfig.applyDefaults) {
      applyDefaults(options);
    }
    
    // Clean up options
    const result = cleanOptions(options);
    result.warnings = ["No matching pattern found"];
    result.confidence = 0.0;
    
    return result;
    
  } catch (error) {
    // If there was an error in the processing, return a basic result with the error
    const options = initializeOptions();
    
    // Apply defaults if required
    if (finalConfig.applyDefaults) {
      applyDefaults(options);
    }
    
    // Clean up options
    const result = cleanOptions(options);
    
    // Add error as a warning
    result.warnings = [(error as Error).message];
    result.confidence = 0.0;
    
    return result;
  }
}

/**
 * Processes a pattern using pattern handlers and returns a PatternResult
 * 
 * @param input - The normalized pattern to process
 * @param config - Configuration for the transformation
 * @returns PatternResult if a pattern was matched, null otherwise
 */
function processPattern(input: string, config: TransformerConfig): PatternResult | null {
  // Initialize options with defaults
  const options: RecurrenceOptions = initializeOptions();

  // Apply pattern handlers in order
  for (const handler of config.handlers) {
    try {
      // Use the handler's apply method to process the input
      const result = handler.apply(input);
      
      if (result) {
        // We found a matching pattern
        return result;
      }
    } catch (error) {
      // Log the error but continue with other handlers
      console.warn(`Error in pattern handler ${handler.name}:`, error);
    }
  }

  // If no handler matched, return null
  return null;
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
