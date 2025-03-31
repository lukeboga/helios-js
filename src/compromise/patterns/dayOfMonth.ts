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
  
  // Match patterns like "1st of the month", "on the 15th", etc.
  const dayOfMonthPattern = /\b(?:on\s+(?:the\s+)?)?(\d+)(?:st|nd|rd|th)(?:\s+(?:day\s+)?(?:of\s+(?:the|each|every)\s+)?month)?\b/i;
  const matches = dayOfMonthPattern.exec(text);
  
  if (matches && matches[1]) {
    const day = parseInt(matches[1], 10);
    if (day >= 1 && day <= 31) {
      options.bymonthday = [day];
      // Default to monthly if no frequency is set
      options.freq = options.freq || RRule.MONTHLY;
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
        options.bymonthday = days;
        // Default to monthly if no frequency is set
        options.freq = options.freq || RRule.MONTHLY;
        result.matched = true;
      }
    }
  }
  
  return result;
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