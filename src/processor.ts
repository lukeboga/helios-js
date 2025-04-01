/**
 * Recurrence Pattern Processor
 * 
 * This module processes natural language recurrence patterns into RRule options.
 * It uses CompromiseJS to parse and extract patterns from text.
 */

import { RRule } from 'rrule';
import { RecurrenceOptions, PatternHandler } from './types';

// Import CompromiseJS setup and patterns
import { setupCompromise, getDocument } from './compromise/index';
import { 
  applyFrequencyPatterns,
  applyIntervalPatterns,
  applyDayOfWeekPatterns,
  applyDayOfMonthPatterns,
  applyUntilDatePatterns 
} from './compromise/index';

// Pattern cache to avoid reprocessing
const patternCache = new Map<string, RecurrenceOptions>();

/**
 * Options for recurrence pattern processing
 */
export interface RecurrenceProcessorOptions {
  /** Whether to use cached results */
  useCache?: boolean;
  /** Force specific pattern handlers */
  forceHandlers?: string[];
  /** Default options to apply */
  defaults?: Partial<RecurrenceOptions>;
  /** Whether to correct misspellings */
  correctMisspellings?: boolean;
}

/**
 * Try to process recurrence pattern with simple regex patterns
 * for better performance with common patterns
 * 
 * @param pattern - Natural language recurrence pattern
 * @returns RecurrenceOptions or null if no match
 */
function trySimplePatterns(pattern: string): RecurrenceOptions | null {
  // Simple regex patterns to avoid CompromiseJS overhead
  const lowerPattern = pattern.toLowerCase().trim();
  
  // Simple daily pattern
  if (/^daily$/.test(lowerPattern)) {
    return { 
      freq: RRule.DAILY, 
      interval: 1, 
      confidence: 1.0,
      byweekday: null,
      bymonthday: null,
      bymonth: null,
      until: null
    };
  }
  
  // Simple weekly pattern
  if (/^weekly$/.test(lowerPattern)) {
    return { 
      freq: RRule.WEEKLY, 
      interval: 1, 
      confidence: 1.0,
      byweekday: null,
      bymonthday: null,
      bymonth: null,
      until: null 
    };
  }
  
  // Simple monthly pattern
  if (/^monthly$/.test(lowerPattern)) {
    return { 
      freq: RRule.MONTHLY, 
      interval: 1, 
      confidence: 1.0,
      byweekday: null,
      bymonthday: null,
      bymonth: null,
      until: null 
    };
  }
  
  // Simple yearly pattern
  if (/^yearly$|^annually$/.test(lowerPattern)) {
    return { 
      freq: RRule.YEARLY, 
      interval: 1, 
      confidence: 1.0,
      byweekday: null,
      bymonthday: null,
      bymonth: null,
      until: null 
    };
  }
  
  // No match with simple patterns
  return null;
}

/**
 * Apply default values to recurrence options
 * 
 * @param options - Current recurrence options
 * @param defaults - Default values to apply
 * @returns Updated recurrence options
 */
function applyDefaults(
  options: RecurrenceOptions, 
  defaults?: Partial<RecurrenceOptions>
): RecurrenceOptions {
  if (!defaults) return options;
  
  // Create a new object with defaults and options
  return {
    ...defaults,
    ...options,
  };
}

/**
 * Update the pattern cache with processed result
 * 
 * @param pattern - The original pattern
 * @param options - Processed recurrence options
 */
function updateCache(pattern: string, options: RecurrenceOptions): void {
  patternCache.set(pattern, options);
}

/**
 * Process a natural language recurrence pattern into RRule options
 * 
 * @param pattern - Natural language recurrence pattern
 * @param processorOptions - Processing options
 * @returns Recurrence options or null if not recognized
 */
export function processRecurrencePattern(
  pattern: string,
  processorOptions: RecurrenceProcessorOptions = {}
): RecurrenceOptions | null {
  const { useCache = true, defaults, forceHandlers, correctMisspellings = true } = processorOptions;
  
  // Check cache first if enabled
  if (useCache && patternCache.has(pattern)) {
    return patternCache.get(pattern)!;
  }
  
  // Start with empty options
  const options: RecurrenceOptions = {
    confidence: 0,
    freq: null,
    interval: 0,
    byweekday: null,
    bymonthday: null,
    bymonth: null,
    until: null
  };
  
  // Try simple patterns first for performance
  const simpleResult = trySimplePatterns(pattern);
  if (simpleResult) {
    const finalOptions = applyDefaults(simpleResult, defaults);
    // Cache the result if caching is enabled
    if (useCache) {
      updateCache(pattern, finalOptions);
    }
    return finalOptions;
  }
  
  // Setup CompromiseJS and get document
  const doc = getDocument(pattern, { correctMisspellings });
  
  // Apply pattern handlers in sequence
  let matchFound = false;
  const warnings: string[] = [];
  let highestConfidence = 0;
  
  // Order matters here - apply more specific patterns first
  // Define handlers as PatternHandler but still using the existing functions
  // This is temporary until we implement the factory pattern
  const patternHandlers: { name: string, handler: any }[] = [
    { name: 'frequency', handler: applyFrequencyPatterns },
    { name: 'interval', handler: applyIntervalPatterns },
    { name: 'dayOfWeek', handler: applyDayOfWeekPatterns },
    { name: 'dayOfMonth', handler: applyDayOfMonthPatterns },
    { name: 'untilDate', handler: applyUntilDatePatterns }
  ];
  
  // Apply each handler unless specific handlers are forced
  for (const { name, handler } of patternHandlers) {
    // Skip if we're forcing specific handlers and this one isn't included
    if (forceHandlers && !forceHandlers.includes(name)) {
      continue;
    }
    
    // Apply the handler
    const result = handler(doc, options);
    
    // Track if any handler matched
    if (result.matched) {
      matchFound = true;
      
      // Track the highest confidence level
      if (result.confidence && result.confidence > highestConfidence) {
        highestConfidence = result.confidence;
      }
    }
    
    // Collect warnings
    if (result.warnings && result.warnings.length > 0) {
      warnings.push(...result.warnings);
    }
  }
  
  // If no pattern matched, return null
  if (!matchFound) {
    return null;
  }
  
  // Set the confidence level based on handlers
  options.confidence = highestConfidence;
  
  // Set default interval to 1 if not specified
  if (options.freq !== undefined && options.interval === undefined) {
    options.interval = 1;
  }
  
  // Apply defaults
  const finalOptions = applyDefaults(options, defaults);
  
  // Cache the result if caching is enabled
  if (useCache) {
    updateCache(pattern, finalOptions);
  }
  
  return finalOptions;
} 