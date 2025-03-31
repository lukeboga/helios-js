/**
 * Frequency Pattern Handler
 * 
 * This module handles frequency pattern recognition using CompromiseJS.
 * It identifies patterns like "daily", "weekly", "monthly", "yearly".
 */

import { RRule } from 'rrule';
import type { RecurrenceOptions } from '../../types';
import type { PatternHandlerResult } from '../../processor';
import type { CompromiseDocument } from '../types';

/**
 * Applies frequency pattern recognition using CompromiseJS
 * 
 * @param doc - CompromiseJS document
 * @param options - Current recurrence options
 * @param config - Optional configuration
 * @returns Pattern handler result
 */
export function applyFrequencyPatterns(
  doc: CompromiseDocument,
  options: RecurrenceOptions,
  config?: any
): PatternHandlerResult {
  const result: PatternHandlerResult = {
    matched: false,
    confidence: 1.0,
    warnings: []
  };

  // Simple frequency terms
  const text = doc.text().toLowerCase();
  
  // Check for daily pattern
  if (doc.has('daily') || doc.has('every day') || /each day/i.test(text)) {
    options.freq = RRule.DAILY;
    result.matched = true;
    return result;
  }
  
  // Check for weekly pattern
  if (doc.has('weekly') || doc.has('every week') || /each week/i.test(text)) {
    options.freq = RRule.WEEKLY;
    result.matched = true;
    return result;
  }
  
  // Check for monthly pattern
  if (doc.has('monthly') || doc.has('every month') || /each month/i.test(text)) {
    options.freq = RRule.MONTHLY;
    result.matched = true;
    return result;
  }
  
  // Check for yearly pattern
  if (doc.has('yearly') || doc.has('annually') || doc.has('every year') || /each year/i.test(text)) {
    options.freq = RRule.YEARLY;
    result.matched = true;
    return result;
  }
  
  return result;
} 