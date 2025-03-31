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
 * Get date for month name
 * 
 * @param monthName - Name of month
 * @param day - Optional day of month
 * @returns Date object for the specified month
 */
function getDateForMonth(monthName: string, day: number = 0): Date | null {
  const months: {[key: string]: number} = {
    'january': 0, 'february': 1, 'march': 2, 'april': 3,
    'may': 4, 'june': 5, 'july': 6, 'august': 7,
    'september': 8, 'october': 9, 'november': 10, 'december': 11,
    'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'jun': 5, 'jul': 6,
    'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
  };
  
  const month = months[monthName.toLowerCase()];
  if (month === undefined) return null;
  
  const date = new Date();
  date.setMonth(month);
  
  // If day is specified, set it, otherwise set to last day of month
  if (day > 0) {
    date.setDate(day);
  } else {
    // Set to end of month
    date.setMonth(month + 1);
    date.setDate(0);
  }
  
  return date;
}

/**
 * Get date for relative time expressions
 * 
 * @param expression - Relative time expression (next month, end of year, etc.)
 * @returns Date object for the specified relative time
 */
function getRelativeDate(expression: string): Date | null {
  const today = new Date();
  
  // Next month
  if (/next\s+month/i.test(expression)) {
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);
    // Set to last day of next month
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(0);
    return nextMonth;
  }
  
  // End of year
  if (/end\s+of\s+(the\s+)?year/i.test(expression)) {
    const endOfYear = new Date(today);
    endOfYear.setMonth(11); // December
    endOfYear.setDate(31);
    return endOfYear;
  }
  
  // Next week
  if (/next\s+week/i.test(expression)) {
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    return nextWeek;
  }
  
  return null;
}

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
  
  // First, try to extract dates using compromise
  const dates = doc.match('#Date');
  if (dates.found) {
    // Check if the date is part of an until phrase
    const untilPhrases = ['until', 'till', 'through', 'ending', 'ends on', 'end date'];
    let isUntilDate = false;
    
    // Find the until phrase before the date
    for (const phrase of untilPhrases) {
      if (text.includes(phrase)) {
        isUntilDate = true;
        break;
      }
    }
    
    if (isUntilDate) {
      // Try to extract month name first
      const monthMatch = /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\b\s*(\d{1,2})?(?:st|nd|rd|th)?/i.exec(text);
      
      if (monthMatch) {
        // Extract month and optional day
        const monthName = monthMatch[1];
        const day = monthMatch[2] ? parseInt(monthMatch[2], 10) : 0;
        
        // Get date for month
        const date = getDateForMonth(monthName, day);
        
        if (date) {
          // Set the time to end of day
          date.setHours(23, 59, 59, 999);
          
          // Set the until date
          options.until = date;
          
          // If no frequency is set, default to daily for standalone patterns
          if (options.freq === undefined) {
            options.freq = RRule.DAILY;
          }
          
          result.matched = true;
          return result;
        }
      }
      
      // Try relative expressions like "next month"
      const relativeMatch = /\b(next\s+month|next\s+week|end\s+of\s+(the\s+)?year)\b/i.exec(text);
      
      if (relativeMatch) {
        const expression = relativeMatch[1];
        const date = getRelativeDate(expression);
        
        if (date) {
          // Set the time to end of day
          date.setHours(23, 59, 59, 999);
          
          // Set the until date
          options.until = date;
          
          // If no frequency is set, default to daily for standalone patterns
          if (options.freq === undefined) {
            options.freq = RRule.DAILY;
          }
          
          result.matched = true;
          return result;
        }
      }
      
      // Try numeric date formats like MM/DD/YYYY
      const dateFormatMatch = /\b(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\b/.exec(text);
      
      if (dateFormatMatch) {
        const datePart = dateFormatMatch[1];
        
        try {
          // Use JavaScript Date parsing
          const date = new Date(datePart);
          
          // Check if the date is valid
          if (!isNaN(date.getTime())) {
            // Set the time to end of day
            date.setHours(23, 59, 59, 999);
            
            // Set the until date
            options.until = date;
            
            // If no frequency is set, default to daily for standalone patterns
            if (options.freq === undefined) {
              options.freq = RRule.DAILY;
            }
            
            result.matched = true;
            return result;
          }
        } catch (e) {
          result.warnings?.push(`Failed to parse date format: ${datePart}`);
        }
      }
    }
  }
  
  // Handle standalone until patterns like "until december"
  if (text.startsWith('until ') || text.startsWith('till ')) {
    // Extract what comes after "until/till"
    const afterUntil = text.replace(/^(until|till)\s+/, '').trim();
    
    // Check if it's a month name
    const monthMatch = /^(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\b/i.exec(afterUntil);
    
    if (monthMatch) {
      const monthName = monthMatch[1];
      const date = getDateForMonth(monthName);
      
      if (date) {
        // Set the time to end of day
        date.setHours(23, 59, 59, 999);
        
        // Set the until date
        options.until = date;
        
        // For standalone until patterns, default to daily
        options.freq = RRule.DAILY;
        
        result.matched = true;
        return result;
      }
    }
    
    // Check for relative expressions
    const relativeMatch = /^(next\s+month|next\s+week|end\s+of\s+(the\s+)?year)\b/i.exec(afterUntil);
    
    if (relativeMatch) {
      const expression = relativeMatch[1];
      const date = getRelativeDate(expression);
      
      if (date) {
        // Set the time to end of day
        date.setHours(23, 59, 59, 999);
        
        // Set the until date
        options.until = date;
        
        // For standalone until patterns, default to daily
        options.freq = RRule.DAILY;
        
        result.matched = true;
        return result;
      }
    }
  }
  
  return result;
} 