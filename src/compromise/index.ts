/**
 * CompromiseJS Integration Main Index
 * 
 * This file exports all CompromiseJS-related functionality for the HeliosJS library.
 * It serves as the main entry point for the CompromiseJS integration.
 */

// Export setup functions
export { setupCompromise, getDocument } from './setup';

// Export pattern handlers
export { 
  applyFrequencyPatterns,
  applyIntervalPatterns,
  applyDayOfWeekPatterns,
  applyDayOfMonthPatterns,
  applyUntilDatePatterns
} from './patterns';

// Export utility functions
export { normalizeDayNames, extractDayNames } from './dayNormalizer';

// Export types
export type { CompromiseDocument } from './types'; 