/**
 * Pattern Handlers Index
 * 
 * This file exports all pattern handlers for easy importing.
 * All handlers use the factory-based approach for consistency.
 */

// Export factory-based pattern handlers
export { 
  // Frequency pattern handler
  frequencyPatternHandler,
  
  // Export individual matchers and processors for reuse
  dailyMatcher,
  weeklyMatcher,
  monthlyMatcher,
  yearlyMatcher,
  frequencyProcessor
} from './frequency'; 

// Export interval pattern handler and components
export {
  intervalPatternHandler,
  
  // Export individual matchers and processor for reuse
  specialIntervalMatcher,
  numericIntervalMatcher,
  everyOtherMatcher,
  intervalProcessor
} from './interval'; 