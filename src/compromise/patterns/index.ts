/**
 * Pattern Handlers Index
 * 
 * This file exports all CompromiseJS-based pattern handlers for easy importing.
 */

// Export legacy pattern application functions for backward compatibility
export { applyFrequencyPatterns } from './frequency';
export { applyIntervalPatterns } from './interval';
export { applyDayOfWeekPatterns } from './dayOfWeek';
export { applyDayOfMonthPatterns } from './dayOfMonth';
export { applyUntilDatePatterns } from './untilDate';

// Export factory-based pattern handlers
export { 
  // New frequency pattern handler
  frequencyPatternHandler,
  
  // Export individual matchers and processors for reuse
  dailyMatcher,
  weeklyMatcher,
  monthlyMatcher,
  yearlyMatcher,
  frequencyProcessor
} from './frequency'; 