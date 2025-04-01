/**
 * Interval Pattern Handler
 * 
 * This module handles interval pattern recognition using CompromiseJS.
 * It identifies patterns like "every 2 days", "every other week", 
 * "biweekly", "fortnightly", etc.
 * 
 * Uses the factory pattern for consistent implementation.
 */

import { RRule } from 'rrule';
import type { 
  PatternMatch, 
  PatternMatcher, 
  PatternProcessor, 
  RecurrenceOptions 
} from '../../types';
import type { CompromiseDocument } from '../types';
import { createPatternHandler } from '../utils/handlerFactory';
import { PATTERN_CATEGORIES, PATTERN_PRIORITY } from '../../constants';

/**
 * Matcher for special interval terms like "biweekly" and "fortnightly"
 */
export const specialIntervalMatcher: PatternMatcher = (
  doc: CompromiseDocument
): PatternMatch | null => {
  // Check for special interval terms (biweekly, fortnightly)
  if (doc.has('biweekly') || doc.has('fortnightly')) {
    return {
      type: PATTERN_CATEGORIES.INTERVAL,
      value: JSON.stringify({
        frequency: RRule.WEEKLY,
        intervalValue: 2
      }),
      text: doc.match('(biweekly|fortnightly)').text(),
      confidence: 1.0
    };
  }
  
  // Check for special bimonthly term
  if (doc.has('bimonthly')) {
    return {
      type: PATTERN_CATEGORIES.INTERVAL,
      value: JSON.stringify({
        frequency: RRule.MONTHLY,
        intervalValue: 2
      }),
      text: doc.match('bimonthly').text(),
      confidence: 1.0
    };
  }
  
  return null;
};

/**
 * Matcher for numeric interval patterns like "every 2 days"
 */
export const numericIntervalMatcher: PatternMatcher = (
  doc: CompromiseDocument
): PatternMatch | null => {
  const text = doc.text();
  
  // Check for numeric intervals: "every N (days|weeks|months|years)"
  const numericPattern = /(every|each)\s+(\d+)\s+(day|days|week|weeks|month|months|year|years)/i;
  const numericMatch = numericPattern.exec(text);
  
  if (numericMatch) {
    // Extract interval value
    const value = parseInt(numericMatch[2], 10);
    
    // Only process valid interval values
    if (value <= 0) {
      return null;
    }
    
    // Determine frequency based on time unit
    const unit = numericMatch[3].toLowerCase();
    let frequency: number;
    
    if (unit === 'day' || unit === 'days') {
      frequency = RRule.DAILY;
    } else if (unit === 'week' || unit === 'weeks') {
      frequency = RRule.WEEKLY;
    } else if (unit === 'month' || unit === 'months') {
      frequency = RRule.MONTHLY;
    } else if (unit === 'year' || unit === 'years') {
      frequency = RRule.YEARLY;
    } else {
      return null; // Unknown unit
    }
    
    return {
      type: PATTERN_CATEGORIES.INTERVAL,
      value: JSON.stringify({
        frequency,
        intervalValue: value
      }),
      text: numericMatch[0],
      confidence: 1.0
    };
  }
  
  return null;
};

/**
 * Matcher for "every other" patterns like "every other week"
 */
export const everyOtherMatcher: PatternMatcher = (
  doc: CompromiseDocument
): PatternMatch | null => {
  const text = doc.text();
  
  // Check for "every other" pattern
  const everyOtherPattern = /(every|each)\s+other\s+(day|week|month|year)/i;
  const everyOtherMatch = everyOtherPattern.exec(text);
  
  if (everyOtherMatch) {
    // Determine frequency based on time unit
    const unit = everyOtherMatch[2].toLowerCase();
    let frequency: number;
    
    if (unit === 'day') {
      frequency = RRule.DAILY;
    } else if (unit === 'week') {
      frequency = RRule.WEEKLY;
    } else if (unit === 'month') {
      frequency = RRule.MONTHLY;
    } else if (unit === 'year') {
      frequency = RRule.YEARLY;
    } else {
      return null; // Unknown unit
    }
    
    return {
      type: PATTERN_CATEGORIES.INTERVAL,
      value: JSON.stringify({
        frequency,
        intervalValue: 2 // "Every other" means interval of 2
      }),
      text: everyOtherMatch[0],
      confidence: 1.0
    };
  }
  
  return null;
};

/**
 * Processor for interval patterns
 * Updates recurrence options based on interval matches
 */
export const intervalProcessor: PatternProcessor = (
  options: RecurrenceOptions,
  match: PatternMatch
): RecurrenceOptions => {
  if (match.type === PATTERN_CATEGORIES.INTERVAL && typeof match.value === 'string') {
    try {
      // Parse the JSON string to get the interval data
      const intervalData = JSON.parse(match.value);
      const { frequency, intervalValue } = intervalData;
      
      // Only set freq if not already set or it's the same as the current one
      if (!options.freq || options.freq === frequency) {
        options.freq = frequency;
      }
      
      options.interval = intervalValue;
    } catch (error) {
      // Log error and continue without updating options
      console.error('Error parsing interval data:', error);
    }
  }
  
  return options;
};

/**
 * Interval pattern handler created using the factory pattern
 * Combines all interval matchers and the interval processor
 */
export const intervalPatternHandler = createPatternHandler(
  'interval',
  [specialIntervalMatcher, numericIntervalMatcher, everyOtherMatcher],
  intervalProcessor,
  {
    category: PATTERN_CATEGORIES.INTERVAL,
    priority: PATTERN_PRIORITY.INTERVAL,
    description: 'Recognizes interval patterns like "every 2 weeks" or "bi-weekly"'
  }
); 