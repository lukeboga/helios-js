/**
 * Day of Week Pattern Handler
 * 
 * This module handles day of week pattern recognition using CompromiseJS.
 * It identifies patterns like "Mondays", "on Monday and Wednesday", etc.
 */

import { RRule } from 'rrule';
import type { RecurrenceOptions } from '../../types';
import type { PatternHandlerResult } from '../../processor';
import type { CompromiseDocument } from '../types';
import { normalizeDayNames } from '../dayNormalizer';

// Map day names to RRule constants
const DAY_MAP: Record<string, RRule.Weekday> = {
  monday: RRule.MO,
  tuesday: RRule.TU,
  wednesday: RRule.WE,
  thursday: RRule.TH,
  friday: RRule.FR,
  saturday: RRule.SA,
  sunday: RRule.SU
};

// Common day groups
const WEEKDAYS: RRule.Weekday[] = [
  RRule.MO,
  RRule.TU, 
  RRule.WE, 
  RRule.TH, 
  RRule.FR
];

const WEEKEND_DAYS: RRule.Weekday[] = [
  RRule.SA, 
  RRule.SU
];

/**
 * Extracts day names from text using regular expressions
 * 
 * @param text - Text to extract day names from
 * @returns Array of day names
 */
function extractDaysFromText(text: string): string[] {
  const dayPattern = /\b(monday|mon|tuesday|tue|wednesday|wed|thursday|thu|friday|fri|saturday|sat|sunday|sun)s?\b/gi;
  const matches = text.match(dayPattern) || [];
  
  return matches.map(day => day.toLowerCase().replace(/s$/, ''));
}

/**
 * Applies day of week pattern recognition using CompromiseJS
 * 
 * @param doc - CompromiseJS document
 * @param options - Current recurrence options
 * @param config - Optional configuration
 * @returns Pattern handler result
 */
export function applyDayOfWeekPatterns(
  doc: CompromiseDocument,
  options: RecurrenceOptions,
  config?: any
): PatternHandlerResult {
  const result: PatternHandlerResult = {
    matched: false,
    confidence: 1.0,
    warnings: []
  };
  
  // Normalize day names to standard forms
  const normalizedDoc = normalizeDayNames(doc);
  const text = normalizedDoc.text().toLowerCase();
  
  // Check for weekdays pattern
  if (text.includes('weekday') || text.includes('weekdays')) {
    options.byweekday = WEEKDAYS;
    // Default to weekly if no frequency is set
    options.freq = options.freq || RRule.WEEKLY;
    result.matched = true;
    return result;
  }
  
  // Check for weekend pattern
  if (text.includes('weekend') || text.includes('weekends')) {
    options.byweekday = WEEKEND_DAYS;
    // Default to weekly if no frequency is set
    options.freq = options.freq || RRule.WEEKLY;
    result.matched = true;
    return result;
  }
  
  // Extract day names
  const dayNames = extractDaysFromText(text);
  
  if (dayNames.length > 0) {
    const validWeekdays: RRule.Weekday[] = [];
    
    // Map day names to RRule weekday constants
    for (const day of dayNames) {
      // Handle short forms
      let dayKey = day.toLowerCase();
      if (dayKey === 'mon') dayKey = 'monday';
      if (dayKey === 'tue' || dayKey === 'tues') dayKey = 'tuesday';
      if (dayKey === 'wed') dayKey = 'wednesday';
      if (dayKey === 'thu' || dayKey === 'thur' || dayKey === 'thurs') dayKey = 'thursday';
      if (dayKey === 'fri') dayKey = 'friday';
      if (dayKey === 'sat') dayKey = 'saturday';
      if (dayKey === 'sun') dayKey = 'sunday';
      
      if (DAY_MAP[dayKey] !== undefined) {
        validWeekdays.push(DAY_MAP[dayKey]);
      }
    }
    
    if (validWeekdays.length > 0) {
      options.byweekday = validWeekdays;
      // Default to weekly if no frequency is set
      options.freq = options.freq || RRule.WEEKLY;
      result.matched = true;
    }
  }
  
  return result;
} 