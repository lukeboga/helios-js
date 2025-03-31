/**
 * Transformer Module
 * 
 * This module provides backward compatibility with the original transformer implementation
 * by delegating to the new CompromiseJS processor.
 */

import { processRecurrencePattern } from './processor';
import { RecurrenceOptions } from './types';

/**
 * Legacy transformation result interface
 */
export interface TransformationResult {
  confidence: number;
  warnings: string[];
  matchedPatterns?: string[];
  [key: string]: any;
}

/**
 * Legacy transformer config interface
 */
export interface TransformerConfig {
  useCache?: boolean;
  enforceRules?: string[];
  [key: string]: any;
}

/**
 * Transform a natural language recurrence pattern into RRule options
 * This function delegates to the new processRecurrencePattern function
 * to ensure backward compatibility
 * 
 * @param pattern - Natural language recurrence pattern
 * @param config - Optional configuration
 * @returns RRule options and transformation metadata
 */
export function transformRecurrencePattern(
  pattern: string,
  config?: Partial<TransformerConfig>
): RecurrenceOptions & TransformationResult {
  // Delegate to the new processor
  const result = processRecurrencePattern(pattern, {
    useCache: config?.useCache,
    forceHandlers: config?.enforceRules
  });
  
  // If processor returned null, create a default result
  if (!result) {
    return {
      freq: null,
      interval: 1,
      byweekday: null,
      bymonthday: null,
      bymonth: null,
      until: null,
      count: null,
      confidence: 0.1,
      warnings: ["No patterns matched"],
      matchedPatterns: []
    } as RecurrenceOptions & TransformationResult;
  }
  
  // Create a merged result object with both RecurrenceOptions and TransformationResult properties
  const mergedResult = { 
    ...result,
    warnings: [],
    matchedPatterns: []
  } as RecurrenceOptions & TransformationResult;
  
  return mergedResult;
}
