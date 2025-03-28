/**
 * Pattern Recognition Module Index
 * 
 * This module serves as a central export point for all pattern recognition components.
 * It exports the pattern handlers and utility functions used throughout the system.
 * 
 * Pattern handlers are organized in order of priority, with interval patterns having
 * highest priority, followed by frequency patterns, and then day of week patterns.
 */

// Import pattern handlers
import { frequencyPatternHandler } from './frequency';
import { intervalPatternHandler } from './interval';
import { dayOfWeekPatternHandler } from './dayOfWeek';
import { dayOfMonthPatternHandler } from './dayOfMonth';
import type { PatternHandler } from '../types';
import { PATTERN_PRIORITY } from '../constants';

// Export the handlers
export { 
  frequencyPatternHandler, 
  intervalPatternHandler, 
  dayOfWeekPatternHandler,
  dayOfMonthPatternHandler
};

// Export utility functions
export * from './utils';

/**
 * Complete set of pattern handlers in priority order
 * 
 * This array combines all available pattern handlers and sorts them by priority.
 * The transformer uses this array to process patterns in the correct order.
 * 
 * The ordering is critical:
 * 1. Interval patterns have highest priority as they set both interval and frequency
 * 2. Frequency patterns are next for basic frequency determination
 * 3. Day of week patterns come last to complement the established frequency
 * 
 * This array can be extended with new pattern handlers as they are developed,
 * with their position in the array determined by their priority value.
 */
export const patternHandlers: PatternHandler[] = [
  intervalPatternHandler,
  frequencyPatternHandler,
  dayOfWeekPatternHandler,
  dayOfMonthPatternHandler
].sort((a, b) => {
  // Sort by priority (higher number comes first)
  return b.priority - a.priority;
});

/**
 * Future extensions to the pattern system:
 * 
 * When adding a new pattern handler:
 * 1. Create a new module for the pattern category (e.g., dayOfMonth.ts)
 * 2. Implement the pattern handler with the same interface pattern
 * 3. Export the handler from this index file
 * 4. Add the handler to the patternHandlers array above
 * 
 * The priority value will determine where in the processing sequence
 * the new pattern handler fits. See PATTERN_PRIORITY in constants.ts
 * for guidance on appropriate priority values.
 */
