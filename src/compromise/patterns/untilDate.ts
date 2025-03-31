/**
 * Until Date Pattern Handler
 * 
 * This module handles until date pattern recognition using CompromiseJS.
 * It identifies patterns like "until May 1st", "ending on 12/31/2023", etc.
 */

import { RRule } from 'rrule';
import type { RecurrenceOptions } from '../../types';
import type { PatternHandlerResult } from '../../processor';
import type { CompromiseDocument } from '../types';

/**
 * Applies until date pattern recognition using CompromiseJS
 * 
 * @param doc - CompromiseJS document
 * @param options - Current recurrence options
 * @param config - Optional configuration
 * @returns Pattern handler result
 */
export function applyUntilDatePatterns(
  doc: CompromiseDocument,
  options: RecurrenceOptions,
  config?: any
): PatternHandlerResult {
  // Initialize result with warnings as an empty array
  const result: PatternHandlerResult = {
    matched: false,
    confidence: 1.0,
    warnings: [] // Ensure warnings is always initialized
  };
  
  const text = doc.text().toLowerCase();
  
  // Match patterns like "until May 1st", "ending on December 31, 2023", etc.
  const untilPattern = /\b(?:until|till|through|ending|end date|ending on|end on|ends on)\s+([a-z]+\s+\d+(?:st|nd|rd|th)?(?:,?\s+\d{4})?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\b/i;
  const matches = untilPattern.exec(text);
  
  if (matches && matches[1]) {
    // Extract the date part from the match
    const datePart = matches[1].trim();
    
    try {
      // Use JavaScript Date parsing for the date part
      const date = new Date(datePart);
      
      // Check if the date is valid
      if (!isNaN(date.getTime())) {
        // Set the time to end of day to include the last day
        date.setHours(23, 59, 59, 999);
        
        // Set the until date
        options.until = date;
        
        // If no frequency is set, default to daily for standalone patterns like "until december"
        if (options.freq === undefined || options.freq === null) {
          options.freq = RRule.DAILY;
        }
        
        result.matched = true;
      }
    } catch (e) {
      // If date parsing fails, add a warning
      if (!result.warnings) {
        result.warnings = []; // Double-check warnings is initialized
      }
      result.warnings.push(`Failed to parse end date: ${datePart}`);
    }
  }
  
  return result;
} 