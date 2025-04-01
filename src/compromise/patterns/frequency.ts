/**
 * Frequency Pattern Handler
 * 
 * This module handles frequency pattern recognition using CompromiseJS.
 * It identifies patterns like "daily", "weekly", "monthly", "yearly".
 * 
 * This is the first pattern handler refactored to use the new factory pattern.
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
import { FREQUENCY_TERMS, PATTERN_CATEGORIES, PATTERN_PRIORITY } from '../../constants';

/**
 * Matcher for daily frequency patterns.
 * Identifies phrases like "daily", "every day", "each day".
 */
export const dailyMatcher: PatternMatcher = (doc: CompromiseDocument): PatternMatch | null => {
  const text = doc.text().toLowerCase();
  
  if (doc.has(FREQUENCY_TERMS.DAILY) || doc.has('every day') || /each day/i.test(text)) {
    return {
      type: PATTERN_CATEGORIES.FREQUENCY,
      value: RRule.DAILY,
      text: doc.match('(daily|every day|each day)').text(),
      confidence: 1.0
    };
  }
  
  return null;
};

/**
 * Matcher for weekly frequency patterns.
 * Identifies phrases like "weekly", "every week", "each week".
 */
export const weeklyMatcher: PatternMatcher = (doc: CompromiseDocument): PatternMatch | null => {
  const text = doc.text().toLowerCase();
  
  if (doc.has(FREQUENCY_TERMS.WEEKLY) || doc.has('every week') || /each week/i.test(text)) {
    return {
      type: PATTERN_CATEGORIES.FREQUENCY,
      value: RRule.WEEKLY,
      text: doc.match('(weekly|every week|each week)').text(),
      confidence: 1.0
    };
  }
  
  return null;
};

/**
 * Matcher for monthly frequency patterns.
 * Identifies phrases like "monthly", "every month", "each month".
 */
export const monthlyMatcher: PatternMatcher = (doc: CompromiseDocument): PatternMatch | null => {
  const text = doc.text().toLowerCase();
  
  if (doc.has(FREQUENCY_TERMS.MONTHLY) || doc.has('every month') || /each month/i.test(text)) {
    return {
      type: PATTERN_CATEGORIES.FREQUENCY,
      value: RRule.MONTHLY,
      text: doc.match('(monthly|every month|each month)').text(),
      confidence: 1.0
    };
  }
  
  return null;
};

/**
 * Matcher for yearly frequency patterns.
 * Identifies phrases like "yearly", "annually", "every year", "each year".
 */
export const yearlyMatcher: PatternMatcher = (doc: CompromiseDocument): PatternMatch | null => {
  const text = doc.text().toLowerCase();
  
  if (doc.has(FREQUENCY_TERMS.YEARLY) || 
      doc.has(FREQUENCY_TERMS.ANNUALLY) || 
      doc.has('every year') || 
      /each year/i.test(text)) {
    return {
      type: PATTERN_CATEGORIES.FREQUENCY,
      value: RRule.YEARLY,
      text: doc.match('(yearly|annually|every year|each year)').text(),
      confidence: 1.0
    };
  }
  
  return null;
};

/**
 * Processor for frequency patterns.
 * Updates the recurrence options based on the frequency match.
 */
export const frequencyProcessor: PatternProcessor = (
  options: RecurrenceOptions, 
  match: PatternMatch
): RecurrenceOptions => {
  if (match.type === PATTERN_CATEGORIES.FREQUENCY && typeof match.value === 'number') {
    options.freq = match.value;
  }
  
  return options;
};

/**
 * Frequency pattern handler created using the new factory pattern.
 * Combines multiple matchers and a processor function to handle all frequency patterns.
 */
export const frequencyPatternHandler = createPatternHandler(
  'frequency',
  [dailyMatcher, weeklyMatcher, monthlyMatcher, yearlyMatcher],
  frequencyProcessor,
  {
    category: PATTERN_CATEGORIES.FREQUENCY,
    priority: PATTERN_PRIORITY.FREQUENCY,
    description: 'Recognizes frequency terms like daily, weekly, monthly, yearly'
  }
); 