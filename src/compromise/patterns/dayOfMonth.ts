/**
 * Day of Month Pattern Handler
 * 
 * This module handles day of month pattern recognition using CompromiseJS.
 * It identifies patterns like "1st of each month", "on the 15th", etc.
 */

import { RRule } from 'rrule';
import type { RecurrenceOptions } from '../../types';
import type { PatternHandlerResult } from '../../processor';
import type { CompromiseDocument } from '../types';

/**
 * Maps ordinal position words to their numeric values
 */
const ORDINAL_POSITION: {[key: string]: number} = {
  'first': 1,
  '1st': 1,
  'second': 2,
  '2nd': 2,
  'third': 3,
  '3rd': 3,
  'fourth': 4,
  '4th': 4,
  'fifth': 5,
  '5th': 5,
  'last': -1
};

/**
 * Applies day of month pattern recognition using CompromiseJS
 * 
 * @param doc - CompromiseJS document
 * @param options - Current recurrence options
 * @param config - Optional configuration
 * @returns Pattern handler result
 */
export function applyDayOfMonthPatterns(
  doc: CompromiseDocument,
  options: RecurrenceOptions,
  config?: any
): PatternHandlerResult {
  const result: PatternHandlerResult = {
    matched: false,
    confidence: 1.0,
    warnings: []
  };

  const text = doc.text().toLowerCase();
  
  // First, try to handle ordinal day of week patterns like "first Monday of the month"
  // or "last Friday of every month"
  const ordinalDayPattern = /\b(first|1st|second|2nd|third|3rd|fourth|4th|fifth|5th|last)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|tues|wed|thur|thurs|fri|sat|sun)\s+(?:of\s+(?:the|each|every)\s+month)\b/i;
  const ordinalMatches = ordinalDayPattern.exec(text);
  
  if (ordinalMatches && ordinalMatches[1] && ordinalMatches[2]) {
    const ordinalPosition = ORDINAL_POSITION[ordinalMatches[1].toLowerCase()];
    const dayOfWeek = mapDayToRRuleDay(ordinalMatches[2].toLowerCase());
    
    if (ordinalPosition && dayOfWeek) {
      options.freq = RRule.MONTHLY;
      options.byweekday = [dayOfWeek];
      options.bysetpos = [ordinalPosition];
      result.matched = true;
      
      // Return early since we've matched a specific pattern
      return result;
    }
  }
  
  // Match patterns like "1st of the month", "on the 15th", etc.
  const dayOfMonthPattern = /\b(?:on\s+(?:the\s+)?)?(\d+)(?:st|nd|rd|th)(?:\s+(?:day\s+)?(?:of\s+(?:the|each|every)\s+)?month)?\b/i;
  const matches = dayOfMonthPattern.exec(text);
  
  if (matches && matches[1]) {
    const day = parseInt(matches[1], 10);
    if (day >= 1 && day <= 31) {
      // Create or add to bymonthday array
      if (!options.bymonthday) {
        options.bymonthday = [day];
      } else if (Array.isArray(options.bymonthday)) {
        options.bymonthday.push(day);
      } else {
        options.bymonthday = [options.bymonthday, day];
      }
      
      // Default to monthly if no frequency is set
      if (options.freq === undefined) {
        options.freq = RRule.MONTHLY;
      }
      
      result.matched = true;
    }
  }
  
  // Match patterns with multiple days like "on the 1st and 15th of each month"
  const multiDayPattern = /\b(?:on\s+(?:the\s+)?)?((?:\d+)(?:st|nd|rd|th)(?:\s+and\s+(?:\d+)(?:st|nd|rd|th))+)(?:\s+(?:day\s+)?(?:of\s+(?:the|each|every)\s+)?month)?\b/i;
  const multiMatches = multiDayPattern.exec(text);
  
  if (multiMatches && multiMatches[1]) {
    const dayPart = multiMatches[1];
    const dayNumbers = dayPart.match(/\d+/g);
    
    if (dayNumbers && dayNumbers.length > 0) {
      const days = dayNumbers.map(num => parseInt(num, 10))
                             .filter(day => day >= 1 && day <= 31);
      
      if (days.length > 0) {
        // Create or add to bymonthday array
        if (!options.bymonthday) {
          options.bymonthday = days;
        } else if (Array.isArray(options.bymonthday)) {
          options.bymonthday.push(...days);
        } else {
          options.bymonthday = [options.bymonthday, ...days];
        }
        
        // Default to monthly if no frequency is set
        if (options.freq === undefined) {
          options.freq = RRule.MONTHLY;
        }
        
        result.matched = true;
      }
    }
  }
  
  // If we found any matches, but the text also includes "every month", "each month", etc.
  // make sure the frequency is set to MONTHLY
  if (result.matched && (/\b(every|each|the)\s+month\b/i.test(text))) {
    options.freq = RRule.MONTHLY;
  }
  
  return result;
}

/**
 * Maps a day name to its corresponding RRule weekday constant
 * 
 * @param dayName - Name of the day (monday, mon, etc.)
 * @returns RRule weekday constant or null if not recognized
 */
function mapDayToRRuleDay(dayName: string): any {
  const dayMappings: {[key: string]: any} = {
    'monday': RRule.MO,
    'mon': RRule.MO,
    'tuesday': RRule.TU,
    'tue': RRule.TU,
    'tues': RRule.TU,
    'wednesday': RRule.WE,
    'wed': RRule.WE,
    'thursday': RRule.TH,
    'thur': RRule.TH,
    'thurs': RRule.TH,
    'friday': RRule.FR,
    'fri': RRule.FR,
    'saturday': RRule.SA,
    'sat': RRule.SA,
    'sunday': RRule.SU,
    'sun': RRule.SU
  };
  
  return dayMappings[dayName] || null;
}

/**
 * Extracts a day number from an ordinal text
 * 
 * @param text - Ordinal text (e.g., "1st", "2nd", "3rd", "15th")
 * @returns Day number or 0 if not recognized
 */
function extractDayNumber(text: string): number {
  // Remove ordinal suffixes
  const cleanText = text.replace(/(st|nd|rd|th)$/i, '');
  
  // Try to parse as integer
  try {
    const day = parseInt(cleanText, 10);
    return day;
  } catch (e) {
    return 0;
  }
} 