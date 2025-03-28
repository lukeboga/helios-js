/**
 * Pattern Combiner Module
 * 
 * This module implements the logic for combining multiple pattern results into a
 * single coherent recurrence rule. It handles merging, conflict resolution, and
 * validation of combined patterns.
 * 
 * WHAT THIS MODULE DOES:
 * - Takes individual pattern matches (like "every Monday" and "every Friday")
 * - Combines them into a single coherent recurrence rule (like "every Monday and Friday")
 * - Resolves conflicts when patterns have incompatible settings
 * - Applies special handling for different types of combinations
 * 
 * WHY THIS IS IMPORTANT:
 * Natural language often contains multiple patterns that need to be combined.
 * For example, "every Monday and Friday at 10am" contains:
 * 1. A day-of-week pattern ("Monday and Friday")
 * 2. A time pattern ("at 10am")
 * These need to be properly combined to create the correct recurrence rule.
 * 
 * The combiner system uses a priority-based approach to determine which combinations
 * should be processed first, and implements specialized combiners for different
 * pattern types.
 */

import { RRule } from 'rrule';
import type { PatternResult, PatternCombiner as PatternCombinerInterface, RecurrenceOptions, PatternMatchMetadata } from '../types';
import { COMBINER_PRIORITY, PATTERN_CATEGORIES } from '../constants';
import { 
  PropertyConflictError, 
  PatternCombinationError 
} from '../errors';

// This declaration block helps TypeScript understand the constructor signatures
// for our error types. This ensures proper type checking when we create errors.
declare module '../errors' {
  interface PatternCombinationError {
    new(message: string, patterns: string[]): PatternCombinationError;
  }
  
  interface PropertyConflictError {
    new(property: string, value1: any, value2: any, message: string): PropertyConflictError;
  }
}

/**
 * Extended version of the PatternCombiner interface for our implementation
 * that works with arrays of patterns rather than just pairs.
 * 
 * WHAT THIS INTERFACE DOES:
 * The standard PatternCombiner interface (from types.ts) only works with pairs
 * of patterns. This extended version can handle multiple patterns at once,
 * which is more efficient and makes the code more flexible.
 * 
 * For example, we can combine "every Monday", "every Wednesday", and "every Friday"
 * all at once, rather than having to combine them two at a time.
 */
interface MultiPatternCombiner {
  /**
   * The name of this combiner for debugging and logging.
   * Each combiner has a unique name to identify it in logs and error messages.
   */
  name: string;
  
  /**
   * Priority of this combiner in the combination pipeline.
   * Higher priority combiners are applied first.
   * 
   * WHY PRIORITY MATTERS:
   * Some combinations need to happen before others. For example:
   * - Day-with-day combinations (Monday + Friday) should happen before
   * - Day-with-time combinations (Monday + 10am)
   */
  priority: number;
  
  /**
   * Determines if this combiner can combine the given pattern with others.
   * This is like a "pre-check" before attempting to combine patterns.
   * 
   * @param pattern - The pattern to check
   * @param allPatterns - All available patterns to combine with
   * @returns true if the pattern can be combined, false otherwise
   * 
   * EXAMPLE:
   * The dayWithDayCombiner checks if the pattern is a day of week.
   * If yes, it can be combined with other day patterns.
   */
  canCombine(pattern: PatternResult, allPatterns: PatternResult[]): boolean;
  
  /**
   * Combines multiple compatible pattern results by merging their options.
   * This is where the actual combination logic happens.
   * 
   * @param patterns - Array of pattern results to combine
   * @param target - The target options object to merge into
   * 
   * EXAMPLE:
   * The dayWithDayCombiner takes multiple day patterns like
   * "Monday" and "Friday" and combines them into a single pattern
   * with both days set in the byweekday array.
   */
  combine(patterns: PatternResult[], target: RecurrenceOptions): void;
}

/**
 * Combines multiple pattern results into a single recurrence option set.
 * 
 * This function is the main entry point for pattern combination. It orchestrates
 * the entire combination process from start to finish.
 * 
 * STEP-BY-STEP EXPLANATION:
 * 1. Handles special cases (empty or single patterns)
 * 2. Sorts patterns by category for proper handling
 * 3. Applies appropriate combiners based on pattern types
 * 4. Resolves conflicts between pattern results
 * 5. Returns a single combined options object
 * 
 * @param patternResults - Array of pattern results to combine
 * @returns Combined recurrence options
 * @throws PatternCombinationError if patterns cannot be combined
 * 
 * USAGE EXAMPLE:
 * ```
 * const result1 = { options: { freq: RRule.WEEKLY, byweekday: [RRule.MO] } };
 * const result2 = { options: { byweekday: [RRule.FR] } };
 * const combined = combinePatternResults([result1, result2]);
 * // combined will have byweekday: [RRule.MO, RRule.FR]
 * ```
 */
export function combinePatternResults(patternResults: PatternResult[]): RecurrenceOptions {
  // SPECIAL CASE 1: If no patterns provided, return default options
  if (patternResults.length === 0) {
    return {
      freq: null,
      interval: 1,
      byweekday: null,
      bymonthday: null,
      bymonth: null
    };
  }
  
  // SPECIAL CASE 2: If only one pattern, just return its options
  if (patternResults.length === 1) {
    return patternResults[0].options;
  }
  
  // Initialize combined options with default values
  // These are the baseline settings that will be modified
  // as we combine patterns
  const combinedOptions: RecurrenceOptions = {
    freq: null,         // Frequency (daily, weekly, etc.)
    interval: 1,        // How often (every 1 day, every 2 weeks, etc.)
    byweekday: null,    // Which days of week (Monday, Tuesday, etc.)
    bymonthday: null,   // Which days of month (1st, 15th, etc.)
    bymonth: null       // Which months (January, February, etc.)
  };
  
  // Track which combiners have been applied to avoid
  // applying the same combiner multiple times
  const appliedCombiners = new Set<string>();
  
  // SORTING PATTERNS:
  // We sort the patterns by their category priority
  // This ensures that foundational patterns are processed first
  // For example, a frequency pattern should be handled before day patterns
  const sortedResults = [...patternResults].sort((a, b) => {
    // Get the category from each pattern's metadata
    const categoryA = a.metadata.category || '';
    const categoryB = b.metadata.category || '';
    
    // Create keys to look up priorities from the COMBINER_PRIORITY constant
    // Example: 'DAY_OF_WEEK' becomes 'DAY_OF_WEEK_WITH_DAY_OF_WEEK'
    const keyA = `${categoryA.toUpperCase()}_WITH_${categoryA.toUpperCase()}`;
    const keyB = `${categoryB.toUpperCase()}_WITH_${categoryB.toUpperCase()}`;
    
    // Look up the priorities, defaulting to 0 if not found
    const priorityA = keyA in COMBINER_PRIORITY ? COMBINER_PRIORITY[keyA as keyof typeof COMBINER_PRIORITY] : 0;
    const priorityB = keyB in COMBINER_PRIORITY ? COMBINER_PRIORITY[keyB as keyof typeof COMBINER_PRIORITY] : 0;
    
    // Sort in descending order (higher priority first)
    return priorityB - priorityA;
  });
  
  // APPLYING COMBINERS:
  // We go through each specialized combiner in priority order 
  // and apply it to matching patterns
  for (const combiner of getPatternCombiners()) {
    // Skip combiners that have already been applied
    if (appliedCombiners.has(combiner.name)) {
      continue;
    }
    
    // Find patterns that match this combiner's capabilities
    // We ask each combiner "can you handle this pattern?"
    const matchingPatterns = sortedResults.filter(result => 
      combiner.canCombine(result, sortedResults));
    
    // Only proceed if we have at least 2 patterns to combine
    if (matchingPatterns.length >= 2) {
      try {
        // Apply the combiner to matching patterns
        // This is where the actual combination happens
        combiner.combine(matchingPatterns, combinedOptions);
        
        // Mark this combiner as applied so we don't use it again
        appliedCombiners.add(combiner.name);
        
        // Remove the handled patterns from the sorted results
        // so they don't get processed again
        matchingPatterns.forEach(pattern => {
          const index = sortedResults.indexOf(pattern);
          if (index !== -1) {
            sortedResults.splice(index, 1);
          }
        });
      } catch (error) {
        // If we get a property conflict, create a more user-friendly error
        if (error instanceof PropertyConflictError) {
          // Extract the matched text from each pattern for better error messages
          const patternTexts = matchingPatterns.map(p => p.metadata.matchedText);
          
          throw new PatternCombinationError(
            `Cannot combine patterns: ${error.message}`,
            patternTexts
          );
        }
        throw error;
      }
    }
  }
  
  // HANDLING REMAINING PATTERNS:
  // Process any patterns that weren't handled by specialized combiners
  // These get merged one by one using the general mergeOptions function
  for (const result of sortedResults) {
    mergeOptions(combinedOptions, result.options);
  }
  
  return combinedOptions;
}

/**
 * Merges two sets of recurrence options, handling conflicts appropriately.
 * 
 * WHAT THIS FUNCTION DOES:
 * This function takes two RecurrenceOptions objects and combines them into one.
 * It's like combining two recipes - some ingredients blend well, some need special handling,
 * and some might conflict with each other.
 * 
 * KEY BEHAVIOR:
 * - For frequency (daily/weekly/etc): Raises an error if they conflict
 * - For interval (every X days): Uses the least common multiple
 * - For count/until (end conditions): Uses the most restrictive one
 * - For arrays (like days of week): Combines without duplicates
 * - For other properties: Raises an error if they conflict
 * 
 * EXAMPLE:
 * ```
 * // Options 1: Every Monday
 * const options1 = { freq: RRule.WEEKLY, byweekday: [RRule.MO] };
 * 
 * // Options 2: Every Friday
 * const options2 = { freq: RRule.WEEKLY, byweekday: [RRule.FR] };
 * 
 * // Result: Every Monday and Friday
 * mergeOptions(options1, options2);
 * // options1 is now { freq: RRule.WEEKLY, byweekday: [RRule.MO, RRule.FR] }
 * ```
 * 
 * @param target - The target options object to merge into (will be modified)
 * @param source - The source options to merge from (will not be modified)
 * @throws PropertyConflictError if there's a conflict that can't be resolved
 */
export function mergeOptions(target: RecurrenceOptions, source: RecurrenceOptions): void {
  // Iterate through each property in the source options
  for (const [key, value] of Object.entries(source)) {
    // Skip null or undefined values - they don't contribute anything
    if (value === null || value === undefined) {
      continue;
    }
    
    // Handle different types of properties based on their name and behavior
    if (key === 'freq') {
      // FREQUENCY HANDLING:
      // For frequency (DAILY, WEEKLY, etc.), we can't have conflicts
      // If both patterns specify different frequencies, that's an error
      // Example: "daily" and "weekly" can't be combined
      
      if (target.freq !== null && target.freq !== undefined && target.freq !== value) {
        throw new PropertyConflictError(
          key,
          target.freq,
          value,
          [`Cannot combine different frequencies: ${target.freq} and ${value}`]
        );
      }
      target.freq = value;
    } else if (key === 'interval') {
      // INTERVAL HANDLING:
      // For interval (every X days/weeks/etc.), we use the least common multiple
      // This ensures the pattern repeats at the correct intervals for both patterns
      // Example: "every 2 days" and "every 3 days" becomes "every 6 days"
      
      if (target.interval && value) {
        target.interval = leastCommonMultiple(target.interval, value as number);
      } else {
        target.interval = value as number;
      }
    } else if (key === 'count' || key === 'until') {
      // COUNT/UNTIL HANDLING:
      // For end conditions, we use the most restrictive one
      // This ensures the recurrence ends at the earliest appropriate point
      // Example: "for 5 times" and "for 10 times" becomes "for 5 times"
      
      const targetValue = target[key as keyof RecurrenceOptions];
      if (targetValue === undefined || 
          (key === 'count' && (value as number) < (targetValue as number)) || 
          (key === 'until' && (value as Date) < (targetValue as Date))) {
        (target as any)[key] = value;
      }
    } else if (Array.isArray(value)) {
      // ARRAY PROPERTY HANDLING:
      // For array properties (like byweekday, bymonthday), we combine the arrays
      // Example: [Monday] and [Friday] becomes [Monday, Friday]
      
      const targetKey = key as keyof RecurrenceOptions;
      const targetArray = target[targetKey] as unknown as any[] || [];
      
      // Combine arrays without duplicates
      if (Array.isArray(targetArray)) {
        // Special handling for weekday objects since they don't compare well with ===
        if (key === 'byweekday') {
          // Convert existing days to a set of weekday numbers for fast lookups
          const existingDays = new Set(
            (targetArray as RRule.Weekday[]).map(day => (day as any).weekday)
          );
          
          // Add new days if they don't exist yet
          (value as RRule.Weekday[]).forEach(day => {
            if (!existingDays.has((day as any).weekday)) {
              targetArray.push(day);
              existingDays.add((day as any).weekday);
            }
          });
        } else {
          // For other array properties, use Set to remove duplicates
          // This is a clean way to ensure we don't have duplicates
          (target as any)[key] = Array.from(new Set([...targetArray, ...value]));
        }
      } else {
        (target as any)[key] = [...value];
      }
    } else {
      // OTHER PROPERTY HANDLING:
      // For all other properties, use the source value if target doesn't have one
      // If both have values and they're different, that's a conflict
      
      const targetValue = (target as any)[key];
      if (targetValue === undefined || targetValue === null) {
        (target as any)[key] = value;
      } else if (targetValue !== value) {
        // If there's a conflict, throw an error
        throw new PropertyConflictError(
          key,
          targetValue,
          value,
          [`Conflicting values: ${targetValue} and ${value}`]
        );
      }
    }
  }
}

/**
 * Calculates the greatest common divisor (GCD) of two numbers.
 * This is a mathematical helper function used for calculating the LCM.
 * 
 * WHAT THIS FUNCTION DOES:
 * Finds the largest positive integer that divides both numbers without a remainder.
 * 
 * HOW IT WORKS:
 * Uses the Euclidean algorithm, which is based on the principle that if a and b are
 * two positive integers, then gcd(a,b) = gcd(b, a mod b).
 * 
 * EXAMPLE:
 * greatestCommonDivisor(12, 18) = 6
 * greatestCommonDivisor(35, 10) = 5
 * 
 * @param a - First number
 * @param b - Second number
 * @returns Greatest common divisor
 */
function greatestCommonDivisor(a: number, b: number): number {
  // The Euclidean algorithm in its simplest form
  // When b becomes 0, a is the GCD
  return b === 0 ? a : greatestCommonDivisor(b, a % b);
}

/**
 * Calculates the least common multiple (LCM) of two numbers.
 * This is used for combining intervals in recurrence patterns.
 * 
 * WHAT THIS FUNCTION DOES:
 * Finds the smallest positive number that is divisible by both input numbers.
 * 
 * WHY THIS MATTERS:
 * When combining patterns like "every 2 weeks" and "every 3 weeks",
 * we need to find a recurrence that works for both (in this case, "every 6 weeks").
 * 
 * HOW IT WORKS:
 * LCM(a,b) = (a * b) / GCD(a,b)
 * 
 * EXAMPLE:
 * leastCommonMultiple(2, 3) = 6
 * leastCommonMultiple(4, 6) = 12
 * 
 * @param a - First number
 * @param b - Second number
 * @returns Least common multiple
 */
function leastCommonMultiple(a: number, b: number): number {
  return (a * b) / greatestCommonDivisor(a, b);
}

/**
 * Gets all available pattern combiners in priority order.
 * 
 * WHAT THIS FUNCTION DOES:
 * Returns an array of all the specialized combiners, sorted by priority.
 * Higher priority combiners appear first in the array.
 * 
 * WHY PRIORITY ORDER MATTERS:
 * Some combinations need to happen before others. For example:
 * - Day-with-day combinations should happen before day-with-position
 * - Core pattern combinations should happen before adding limitations
 * 
 * @returns Array of pattern combiners sorted by priority (highest first)
 */
function getPatternCombiners(): MultiPatternCombiner[] {
  return [
    dayWithDayCombiner,         // Combines multiple days (Monday and Friday)
    frequencyWithDayCombiner,   // Combines frequency with days (weekly on Monday)
    dayWithPositionCombiner,    // Combines days with positions (first Monday)
    patternWithUntilCombiner,   // Combines patterns with end dates
    patternWithCountCombiner    // Combines patterns with count limits
  ].sort((a, b) => b.priority - a.priority);
}

/**
 * Combiner for multiple day-of-week patterns.
 * 
 * WHAT THIS COMBINER DOES:
 * Combines patterns that specify different days of the week into a single pattern
 * that includes all days.
 * 
 * EXAMPLE SCENARIO:
 * Input patterns:
 * 1. "every Monday" (byweekday: [RRule.MO])
 * 2. "every Friday" (byweekday: [RRule.FR])
 * 
 * Result:
 * "every Monday and Friday" (byweekday: [RRule.MO, RRule.FR])
 * 
 * WHEN THIS COMBINER IS USED:
 * This combiner is used when the user specifies multiple days in their recurrence
 * pattern, either directly ("Monday and Friday") or across multiple patterns.
 * It's one of the most common combination scenarios.
 */
export const dayWithDayCombiner: MultiPatternCombiner = {
  name: 'dayWithDayCombiner',
  priority: COMBINER_PRIORITY.DAY_WITH_DAY,
  
  // This determines if the pattern can be combined using this combiner
  canCombine(pattern: PatternResult, _allPatterns: PatternResult[]): boolean {
    // We only care if this is a day-of-week pattern
    // The underscore in _allPatterns indicates we don't use this parameter
    return pattern.metadata.category === PATTERN_CATEGORIES.DAY_OF_WEEK;
  },
  
  // This performs the actual combination
  combine(patterns: PatternResult[], target: RecurrenceOptions): void {
    // Make sure we have a byweekday array to add days to
    if (!target.byweekday) {
      target.byweekday = [];
    }
    
    // Process all day patterns
    for (const pattern of patterns) {
      if (pattern.options.byweekday) {
        // Keep track of days we've already added to avoid duplicates
        // We use a Set for efficient lookups
        const existingWeekdays = new Set(
          (target.byweekday as RRule.Weekday[]).map(day => (day as any).weekday)
        );
        
        // Add each day from this pattern if it's not already in our list
        for (const day of pattern.options.byweekday as RRule.Weekday[]) {
          if (!existingWeekdays.has((day as any).weekday)) {
            target.byweekday.push(day);
            existingWeekdays.add((day as any).weekday);
          }
        }
      }
    }
    
    // If no frequency is set yet, we'll default to weekly
    // This is a reasonable assumption when combining day patterns
    if (!target.freq) {
      target.freq = RRule.WEEKLY;
    }
  }
};

/**
 * Combiner for frequency and day-of-week patterns.
 * 
 * WHAT THIS COMBINER DOES:
 * Combines a frequency pattern (like "weekly") with day-of-week patterns
 * (like "on Monday") into a complete recurrence specification.
 * 
 * EXAMPLE SCENARIO:
 * Input patterns:
 * 1. "weekly" (freq: RRule.WEEKLY)
 * 2. "on Monday" (byweekday: [RRule.MO])
 * 
 * Result:
 * "weekly on Monday" (freq: RRule.WEEKLY, byweekday: [RRule.MO])
 * 
 * WHEN THIS COMBINER IS USED:
 * This combiner is used when the user specifies both a frequency and specific days,
 * either in a single sentence or across multiple patterns.
 * It ensures the frequency and days work together correctly.
 */
export const frequencyWithDayCombiner: MultiPatternCombiner = {
  name: 'frequencyWithDayCombiner',
  priority: COMBINER_PRIORITY.FREQUENCY_WITH_DAY,
  
  canCombine(pattern: PatternResult, allPatterns: PatternResult[]): boolean {
    // Check if this pattern is a frequency or day pattern
    const isFrequency = pattern.metadata.category === PATTERN_CATEGORIES.FREQUENCY;
    const isDay = pattern.metadata.category === PATTERN_CATEGORIES.DAY_OF_WEEK;
    
    // If it's neither frequency nor day, this combiner can't help
    if (!isFrequency && !isDay) {
      return false;
    }
    
    // We need to find a matching counterpart
    // If this is a frequency pattern, we need a day pattern
    // If this is a day pattern, we need a frequency pattern
    return allPatterns.some(other => 
      other !== pattern && (
        (isFrequency && other.metadata.category === PATTERN_CATEGORIES.DAY_OF_WEEK) ||
        (isDay && other.metadata.category === PATTERN_CATEGORIES.FREQUENCY)
      )
    );
  },
  
  combine(patterns: PatternResult[], target: RecurrenceOptions): void {
    // Find the frequency pattern (if any)
    const frequencyPattern = patterns.find(p => 
      p.metadata.category === PATTERN_CATEGORIES.FREQUENCY
    );
    
    // Find all day patterns
    const dayPatterns = patterns.filter(p => 
      p.metadata.category === PATTERN_CATEGORIES.DAY_OF_WEEK
    );
    
    // If we have a frequency pattern, merge it in first
    // This ensures the frequency is set before we add days
    if (frequencyPattern) {
      mergeOptions(target, frequencyPattern.options);
    }
    
    // Then merge in all day patterns
    // This adds all specified days to the byweekday array
    for (const dayPattern of dayPatterns) {
      mergeOptions(target, dayPattern.options);
    }
  }
};

/**
 * Combiner for day-of-week and position patterns.
 * 
 * WHAT THIS COMBINER DOES:
 * Combines a day-of-week pattern (like "Monday") with a position pattern
 * (like "first") to create patterns like "first Monday of the month".
 * 
 * EXAMPLE SCENARIO:
 * Input patterns:
 * 1. "Monday" (byweekday: [RRule.MO])
 * 2. "first" (bysetpos: [1])
 * 
 * Result:
 * "first Monday of the month" (freq: RRule.MONTHLY, byweekday: [RRule.MO], bysetpos: [1])
 * 
 * WHEN THIS COMBINER IS USED:
 * This combiner is used for patterns that refer to specific occurrences of days
 * within a larger time frame, like "first Monday of the month" or
 * "last Friday of the year".
 */
export const dayWithPositionCombiner: MultiPatternCombiner = {
  name: 'dayWithPositionCombiner',
  priority: COMBINER_PRIORITY.DAY_WITH_POSITION,
  
  canCombine(pattern: PatternResult, allPatterns: PatternResult[]): boolean {
    // Check if this pattern is a day or position pattern
    const isDay = pattern.metadata.category === PATTERN_CATEGORIES.DAY_OF_WEEK;
    const isPosition = pattern.metadata.category === PATTERN_CATEGORIES.POSITION;
    
    // If it's neither day nor position, this combiner can't help
    if (!isDay && !isPosition) {
      return false;
    }
    
    // We need to find a matching counterpart
    // If this is a day pattern, we need a position pattern
    // If this is a position pattern, we need a day pattern
    return allPatterns.some(other => 
      other !== pattern && (
        (isDay && other.metadata.category === PATTERN_CATEGORIES.POSITION) ||
        (isPosition && other.metadata.category === PATTERN_CATEGORIES.DAY_OF_WEEK)
      )
    );
  },
  
  combine(patterns: PatternResult[], target: RecurrenceOptions): void {
    // Find the day pattern (like "Monday")
    const dayPattern = patterns.find(p => 
      p.metadata.category === PATTERN_CATEGORIES.DAY_OF_WEEK
    );
    
    // Find the position pattern (like "first")
    const positionPattern = patterns.find(p => 
      p.metadata.category === PATTERN_CATEGORIES.POSITION
    );
    
    // We need both a day and a position to proceed
    if (!dayPattern || !positionPattern) {
      return;
    }
    
    // Merge the options from both patterns
    mergeOptions(target, dayPattern.options);
    mergeOptions(target, positionPattern.options);
    
    // If no frequency is set, default to monthly
    // This is because "first Monday" typically implies "of the month"
    if (!target.freq) {
      target.freq = RRule.MONTHLY;
    }
  }
};

/**
 * Combiner for patterns with an until date.
 * 
 * WHAT THIS COMBINER DOES:
 * Combines any recurrence pattern with an end date specification,
 * creating patterns like "every Monday until June 30".
 * 
 * EXAMPLE SCENARIO:
 * Input patterns:
 * 1. "every Monday" (freq: RRule.WEEKLY, byweekday: [RRule.MO])
 * 2. "until June 30" (until: new Date(2023, 5, 30))
 * 
 * Result:
 * "every Monday until June 30" (freq: RRule.WEEKLY, byweekday: [RRule.MO], until: new Date(2023, 5, 30))
 * 
 * WHEN THIS COMBINER IS USED:
 * This combiner is used whenever a recurrence pattern includes an end date.
 * It ensures the until date is properly applied to the recurrence.
 */
export const patternWithUntilCombiner: MultiPatternCombiner = {
  name: 'patternWithUntilCombiner',
  priority: COMBINER_PRIORITY.PATTERN_WITH_UNTIL,
  
  canCombine(pattern: PatternResult, allPatterns: PatternResult[]): boolean {
    // Check if this is an until date pattern
    const isUntil = pattern.metadata.category === PATTERN_CATEGORIES.UNTIL_DATE;
    
    // For until patterns, we just need to verify there are other patterns to combine with
    // An until date on its own doesn't make sense
    if (isUntil) {
      return allPatterns.some(other => other !== pattern);
    }
    
    // For other patterns, check if there's an until pattern to combine with
    return allPatterns.some(other => 
      other !== pattern && other.metadata.category === PATTERN_CATEGORIES.UNTIL_DATE
    );
  },
  
  combine(patterns: PatternResult[], target: RecurrenceOptions): void {
    // Find the until pattern (containing the end date)
    const untilPattern = patterns.find(p => 
      p.metadata.category === PATTERN_CATEGORIES.UNTIL_DATE
    );
    
    // Find all other patterns (the base recurrence pattern)
    const otherPatterns = patterns.filter(p => 
      p.metadata.category !== PATTERN_CATEGORIES.UNTIL_DATE
    );
    
    // We must have an until pattern to proceed
    if (!untilPattern) {
      return;
    }
    
    // Merge the base patterns first to establish the recurrence
    for (const pattern of otherPatterns) {
      mergeOptions(target, pattern.options);
    }
    
    // Then merge the until pattern to add the end date
    mergeOptions(target, untilPattern.options);
  }
};

/**
 * Combiner for patterns with a count limit.
 * 
 * WHAT THIS COMBINER DOES:
 * Combines any recurrence pattern with a count limit specification,
 * creating patterns like "every Monday for 10 times".
 * 
 * EXAMPLE SCENARIO:
 * Input patterns:
 * 1. "every Monday" (freq: RRule.WEEKLY, byweekday: [RRule.MO])
 * 2. "for 10 times" (count: 10)
 * 
 * Result:
 * "every Monday for 10 times" (freq: RRule.WEEKLY, byweekday: [RRule.MO], count: 10)
 * 
 * WHEN THIS COMBINER IS USED:
 * This combiner is used whenever a recurrence pattern includes a count limit.
 * It ensures the count is properly applied to the recurrence.
 */
export const patternWithCountCombiner: MultiPatternCombiner = {
  name: 'patternWithCountCombiner',
  priority: COMBINER_PRIORITY.PATTERN_WITH_COUNT,
  
  canCombine(pattern: PatternResult, allPatterns: PatternResult[]): boolean {
    // Check if this is a count pattern
    const isCount = pattern.metadata.category === PATTERN_CATEGORIES.COUNT;
    
    // For count patterns, we just need to verify there are other patterns to combine with
    // A count on its own doesn't make sense
    if (isCount) {
      return allPatterns.some(other => other !== pattern);
    }
    
    // For other patterns, check if there's a count pattern to combine with
    return allPatterns.some(other => 
      other !== pattern && other.metadata.category === PATTERN_CATEGORIES.COUNT
    );
  },
  
  combine(patterns: PatternResult[], target: RecurrenceOptions): void {
    // Find the count pattern (containing the count limit)
    const countPattern = patterns.find(p => 
      p.metadata.category === PATTERN_CATEGORIES.COUNT
    );
    
    // Find all other patterns (the base recurrence pattern)
    const otherPatterns = patterns.filter(p => 
      p.metadata.category !== PATTERN_CATEGORIES.COUNT
    );
    
    // We must have a count pattern to proceed
    if (!countPattern) {
      return;
    }
    
    // Merge the base patterns first to establish the recurrence
    for (const pattern of otherPatterns) {
      mergeOptions(target, pattern.options);
    }
    
    // Then merge the count pattern to add the limit
    mergeOptions(target, countPattern.options);
  }
};

/**
 * Adapter to convert our MultiPatternCombiner to the PatternCombiner interface.
 * 
 * WHAT THIS FUNCTION DOES:
 * Creates a bridge between our enhanced MultiPatternCombiner implementation
 * and the standard PatternCombiner interface defined in types.ts.
 * 
 * WHY THIS IS NEEDED:
 * Our implementation can handle multiple patterns at once for efficiency,
 * but the standard interface only works with pairs of patterns.
 * This adapter allows our implementation to be used anywhere the standard
 * interface is expected.
 * 
 * TECHNICAL EXPLANATION:
 * This is an example of the Adapter Pattern in software design. It allows
 * objects with incompatible interfaces to work together by wrapping an instance
 * of one class into an interface expected by the clients.
 * 
 * @param multiCombiner - Our extended combiner implementation
 * @returns A standard PatternCombiner as defined in the types
 * 
 * EXAMPLE USAGE:
 * ```
 * // Convert our enhanced combiner to the standard interface
 * const standardCombiner = adaptToPatternCombiner(dayWithDayCombiner);
 * 
 * // Now we can use it with the standard interface
 * const canCombine = standardCombiner.canCombine(pattern1, pattern2);
 * const result = standardCombiner.combine(pattern1, pattern2);
 * ```
 */
export function adaptToPatternCombiner(multiCombiner: MultiPatternCombiner): PatternCombinerInterface {
  return {
    // Keep the same name and priority
    name: multiCombiner.name,
    priority: multiCombiner.priority,
    
    // Adapt the canCombine method to work with just two patterns
    canCombine(pattern1: PatternResult, pattern2: PatternResult): boolean {
      // Call our implementation with pattern2 wrapped in an array
      return multiCombiner.canCombine(pattern1, [pattern2]);
    },
    
    // Adapt the combine method to work with just two patterns
    combine(pattern1: PatternResult, pattern2: PatternResult): PatternResult {
      // Create a target options object to combine into
      const combinedOptions: RecurrenceOptions = {
        freq: null,
        interval: 1,
        byweekday: null,
        bymonthday: null,
        bymonth: null
      };
      
      // Call our implementation with both patterns in an array
      multiCombiner.combine([pattern1, pattern2], combinedOptions);
      
      // Create metadata for the combined result
      const combinedMetadata: PatternMatchMetadata = {
        // Join the pattern names with a + symbol
        patternName: `${pattern1.metadata.patternName}+${pattern2.metadata.patternName}`,
        // Use the category from the first pattern (could be improved)
        category: pattern1.metadata.category,
        // Join the matched text with "and"
        matchedText: `${pattern1.metadata.matchedText} and ${pattern2.metadata.matchedText}`,
        // Use the lower confidence for the combined result
        confidence: Math.min(pattern1.metadata.confidence, pattern2.metadata.confidence),
        // Mark as not partial since it's a complete combination
        isPartial: false,
        // Combine the set properties from both patterns
        setProperties: new Set([
          ...(pattern1.metadata.setProperties || []),
          ...(pattern2.metadata.setProperties || [])
        ] as any)
      };
      
      // Return the combined result
      return {
        options: combinedOptions,
        metadata: combinedMetadata
      };
    }
  };
}

/**
 * Guidelines for extending the pattern combiner
 * 
 * This section provides detailed instructions for developers who want to
 * add new combiners or modify existing ones. Following these guidelines
 * ensures consistency and maintainability.
 * 
 * =====================================================================
 * ADDING A NEW COMBINER:
 * =====================================================================
 * 
 * 1. Implement the MultiPatternCombiner interface:
 *    Create a new constant following the same pattern as existing combiners.
 *    Make sure to implement all required methods and properties.
 * 
 *    ```typescript
 *    export const myNewCombiner: MultiPatternCombiner = {
 *      name: 'myNewCombiner',
 *      priority: COMBINER_PRIORITY.MY_NEW_PRIORITY,
 *      
 *      canCombine(pattern, allPatterns) {
 *        // Your logic here
 *      },
 *      
 *      combine(patterns, target) {
 *        // Your logic here
 *      }
 *    };
 *    ```
 * 
 * 2. Add the combiner to the getPatternCombiners() function:
 *    This makes your combiner available to the combination process.
 * 
 *    ```typescript
 *    function getPatternCombiners(): MultiPatternCombiner[] {
 *      return [
 *        // Existing combiners
 *        myNewCombiner,  // Add your new combiner here
 *      ].sort((a, b) => b.priority - a.priority);
 *    }
 *    ```
 * 
 * 3. Add a priority constant in constants.ts:
 *    Define where in the priority order your combiner should run.
 * 
 *    ```typescript
 *    // In constants.ts
 *    export const COMBINER_PRIORITY = {
 *      // Existing priorities
 *      MY_NEW_PRIORITY: 250,  // Choose an appropriate value
 *    };
 *    ```
 * 
 * =====================================================================
 * DETERMINING COMBINER PRIORITY:
 * =====================================================================
 * 
 * - Higher priority combiners run first (higher numbers)
 * - Use these guidelines for setting priorities:
 *   * 300-400: Core combiners that establish basic patterns (day with day)
 *   * 200-300: Combiners that establish the recurrence framework (frequency with day)
 *   * 100-200: Combiners that add specifications (day with position)
 *   * 0-100: Combiners that add limits or metadata (count/until)
 * 
 * - Combiners that set core properties should run before those that modify them
 *   Example: Establish days of week before adding position information
 * 
 * - Combiners for related pattern types should have similar priorities
 *   Example: All day-related combiners should have similar priorities
 * 
 * =====================================================================
 * COMBINER IMPLEMENTATION REQUIREMENTS:
 * =====================================================================
 * 
 * 1. The canCombine method should efficiently determine if a pattern can be combined
 *    - Focus on identifying patterns this combiner can handle
 *    - Return true only if this combiner can actually help with this pattern
 *    - Check for necessary counterpart patterns when needed
 * 
 * 2. The combine method should handle all edge cases and conflict resolution
 *    - Always check inputs for null/undefined values before using them
 *    - Handle empty arrays and missing properties gracefully
 *    - Consider what happens when patterns partially overlap
 * 
 * 3. Always check for null/undefined values before accessing properties
 *    - Use default values or early returns when properties are missing
 *    - Use optional chaining (?.) and nullish coalescing (??) when appropriate
 * 
 * 4. Use the mergeOptions helper to ensure consistent property merging
 *    - Don't reinvent property merging logic in your combiner
 *    - Let mergeOptions handle conflict resolution
 * 
 * =====================================================================
 * HANDLING CONFLICTS:
 * =====================================================================
 * 
 * 1. Throw PropertyConflictError for irreconcilable conflicts
 *    - When two patterns specify different values for the same property
 *      and there's no clear way to combine them
 *    - Include detailed information about the conflict
 * 
 * 2. For ambiguous cases, favor the interpretation that creates a valid recurrence
 *    - When there are multiple possible interpretations, choose the most likely one
 *    - Consider adding a warning in the metadata rather than failing
 * 
 * 3. Document any special conflict resolution logic in comments
 *    - If your combiner handles conflicts in a special way, document it
 *    - This helps other developers understand your decisions
 */ 