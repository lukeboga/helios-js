/**
 * Interval Pattern Handler
 * 
 * This module handles interval pattern recognition using CompromiseJS.
 * It identifies patterns like "every 2 days", "every other week", 
 * "biweekly", "fortnightly", etc.
 */

import { RRule } from 'rrule';
import type { RecurrenceOptions } from '../../types';
import type { PatternHandlerResult } from '../../processor';
import type { CompromiseDocument } from '../types';

/**
 * Applies interval pattern recognition using CompromiseJS
 * 
 * @param doc - CompromiseJS document
 * @param options - Current recurrence options
 * @param config - Optional configuration
 * @returns Pattern handler result
 */
export function applyIntervalPatterns(
  doc: CompromiseDocument,
  options: RecurrenceOptions,
  config?: any
): PatternHandlerResult {
  const result: PatternHandlerResult = {
    matched: false,
    confidence: 1.0,
    warnings: []
  };
  
  // Check for special interval terms first (biweekly, fortnightly)
  if (doc.has('biweekly') || doc.has('fortnightly')) {
    options.freq = options.freq || RRule.WEEKLY;
    options.interval = 2;
    result.matched = true;
    return result;
  }
  
  // Check for special bimonthly term
  if (doc.has('bimonthly')) {
    options.freq = options.freq || RRule.MONTHLY;
    options.interval = 2;
    result.matched = true;
    return result;
  }
  
  // Check for numeric intervals: "every N (days|weeks|months|years)"
  const numericPattern = /(every|each)\s+(\d+)\s+(day|days|week|weeks|month|months|year|years)/i;
  let numericMatch = numericPattern.exec(doc.text());
  
  if (numericMatch) {
    // Extract interval value
    const value = parseInt(numericMatch[2], 10);
    
    // Determine frequency based on time unit
    const unit = numericMatch[3].toLowerCase();
    if (unit === 'day' || unit === 'days') {
      options.freq = options.freq || RRule.DAILY;
    } else if (unit === 'week' || unit === 'weeks') {
      options.freq = options.freq || RRule.WEEKLY;
    } else if (unit === 'month' || unit === 'months') {
      options.freq = options.freq || RRule.MONTHLY;
    } else if (unit === 'year' || unit === 'years') {
      options.freq = options.freq || RRule.YEARLY;
    }
    
    // Set interval value
    if (value > 0) {
      options.interval = value;
      result.matched = true;
      return result;
    }
  }
  
  // Check for "every other" pattern
  const everyOtherPattern = /(every|each)\s+other\s+(day|week|month|year)/i;
  const everyOtherMatch = everyOtherPattern.exec(doc.text());
  
  if (everyOtherMatch) {
    // Set interval to 2
    options.interval = 2;
    
    // Determine frequency based on time unit
    const unit = everyOtherMatch[2].toLowerCase();
    if (unit === 'day') {
      options.freq = options.freq || RRule.DAILY;
    } else if (unit === 'week') {
      options.freq = options.freq || RRule.WEEKLY;
    } else if (unit === 'month') {
      options.freq = options.freq || RRule.MONTHLY;
    } else if (unit === 'year') {
      options.freq = options.freq || RRule.YEARLY;
    }
    
    result.matched = true;
    return result;
  }
  
  return result;
} 