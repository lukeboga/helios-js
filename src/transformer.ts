/**
 * Transformer Module (LEGACY)
 * 
 * DEPRECATION NOTICE: This transformer implementation is provided for backward compatibility 
 * and will be maintained until the next major version release. New projects should directly 
 * use the CompromiseJS-based processor instead.
 * 
 * Migration path:
 * - For new code: import { processRecurrencePattern } from './processor' 
 * - For existing code: continue using this transformer (it delegates to the processor internally)
 * - See docs/migration-guide.md for detailed migration instructions
 *
 * This module provides backward compatibility with the original regex-based transformer 
 * by delegating to the new CompromiseJS processor while maintaining the legacy API.
 */

import { RRule } from 'rrule';
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
 * Helper function to handle the byweekday property conversion
 * Maps RRule weekday objects to the format expected by the transformer
 * 
 * @param weekdays - Array of weekday objects or null
 * @returns Properly formatted weekday objects for transformer output
 */
function convertWeekdays(weekdays: RRule.Weekday[] | null): any {
  if (!weekdays || weekdays.length === 0) {
    return null;
  }
  
  // For single weekday, return just that weekday
  if (weekdays.length === 1) {
    return weekdays[0];
  }
  
  // For multiple weekdays, return the array
  return weekdays;
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
  
  // Create the output object with properly converted properties
  const output: RecurrenceOptions & TransformationResult = {
    // Copy the frequency and interval
    freq: result.freq,
    interval: result.interval || 1,
    
    // Convert byweekday to match legacy transformer format
    byweekday: convertWeekdays(result.byweekday),
    
    // Copy other properties
    bymonthday: result.bymonthday,
    bymonth: result.bymonth,
    until: result.until,
    count: result.count,
    
    // Add metadata for backward compatibility
    confidence: result.confidence || 1.0,
    warnings: [],
    matchedPatterns: result.freq ? 
      [getFrequencyName(result.freq)] : []
  };
  
  return output;
}

/**
 * Gets a human-readable name for a frequency constant
 * 
 * @param freq - RRule frequency constant
 * @returns String name for the frequency
 */
function getFrequencyName(freq: number | null): string {
  if (freq === RRule.DAILY) return 'daily';
  if (freq === RRule.WEEKLY) return 'weekly';
  if (freq === RRule.MONTHLY) return 'monthly';
  if (freq === RRule.YEARLY) return 'yearly';
  return 'unknown';
}
