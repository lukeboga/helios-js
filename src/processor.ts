/**
 * Recurrence Pattern Processor
 * 
 * This module processes natural language recurrence patterns into RRule options.
 * It uses CompromiseJS to parse and extract patterns from text.
 */

import { RRule } from 'rrule';
import { RecurrenceOptions, PatternHandler } from './types';

// Import CompromiseJS setup
import { 
  setupCompromise, 
  getDocument,
  // Import legacy pattern handlers that will be refactored in subsequent steps
  applyIntervalPatterns,
  applyDayOfWeekPatterns,
  applyDayOfMonthPatterns,
  applyUntilDatePatterns
} from './compromise/index';

// Import factory-based pattern handlers
import { frequencyPatternHandler } from './compromise/patterns';

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
  /** Enable performance metrics collection */
  collectMetrics?: boolean;
}

/**
 * Performance metrics for pattern processing
 */
export interface ProcessorMetrics {
  /** Total processing time in milliseconds */
  totalTime: number;
  /** Time spent in each pattern handler in milliseconds */
  handlerTimes: Record<string, number>;
  /** Number of patterns matched */
  matchedPatterns: number;
  /** Whether a simple pattern was matched */
  usedSimplePattern: boolean;
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
  const { 
    useCache = true, 
    defaults, 
    forceHandlers, 
    correctMisspellings = true,
    collectMetrics = false 
  } = processorOptions;
  
  // Initialize metrics if enabled
  const metrics: ProcessorMetrics = {
    totalTime: 0,
    handlerTimes: {},
    matchedPatterns: 0,
    usedSimplePattern: false
  };
  
  const startTime = collectMetrics ? performance.now() : 0;
  
  // Check cache first if enabled
  if (useCache && patternCache.has(pattern)) {
    if (collectMetrics) {
      metrics.totalTime = performance.now() - startTime;
    }
    return patternCache.get(pattern)!;
  }
  
  // Start with empty options
  const options: RecurrenceOptions = {
    confidence: 0,
    freq: null,
    interval: 1,  // Default interval is 1
    byweekday: null,
    bymonthday: null,
    bymonth: null,
    until: null
  };
  
  // Try simple patterns first for performance
  const simpleResult = trySimplePatterns(pattern);
  if (simpleResult) {
    if (collectMetrics) {
      metrics.usedSimplePattern = true;
      metrics.totalTime = performance.now() - startTime;
    }
    
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
  
  // Define handlers using new factory-based approach where available
  // Mix of new and legacy handlers during transition
  const patternHandlers: { name: string, handler: PatternHandler }[] = [
    // New factory-based handlers
    { name: 'frequency', handler: frequencyPatternHandler },
    
    // Legacy handlers (will be replaced in subsequent steps)
    { name: 'interval', handler: applyIntervalPatterns as PatternHandler },
    { name: 'dayOfWeek', handler: applyDayOfWeekPatterns as PatternHandler },
    { name: 'dayOfMonth', handler: applyDayOfMonthPatterns as PatternHandler },
    { name: 'untilDate', handler: applyUntilDatePatterns as PatternHandler }
  ];
  
  // Apply each handler unless specific handlers are forced
  for (const { name, handler } of patternHandlers) {
    // Skip if we're forcing specific handlers and this one isn't included
    if (forceHandlers && !forceHandlers.includes(name)) {
      continue;
    }
    
    // Measure handler execution time if metrics are enabled
    const handlerStartTime = collectMetrics ? performance.now() : 0;
    
    // Apply the handler
    const result = handler(doc, options);
    
    // Track metrics if enabled
    if (collectMetrics) {
      metrics.handlerTimes[name] = performance.now() - handlerStartTime;
    }
    
    // Track if any handler matched
    if (result.matched) {
      matchFound = true;
      metrics.matchedPatterns++;
      
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
    if (collectMetrics) {
      metrics.totalTime = performance.now() - startTime;
    }
    return null;
  }
  
  // Set the confidence level based on handlers
  options.confidence = highestConfidence;
  
  // Apply defaults
  const finalOptions = applyDefaults(options, defaults);
  
  // Cache the result if caching is enabled
  if (useCache) {
    updateCache(pattern, finalOptions);
  }
  
  // Calculate total processing time if metrics are enabled
  if (collectMetrics) {
    metrics.totalTime = performance.now() - startTime;
    // Store metrics on the result object for analysis
    (finalOptions as any)._metrics = metrics;
  }
  
  return finalOptions;
} 