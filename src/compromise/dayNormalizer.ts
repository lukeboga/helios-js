/**
 * Day Name Normalizer Module
 * 
 * This module provides utilities for normalizing day names in CompromiseJS documents,
 * particularly handling plural day forms and preserving their semantics as recurring
 * patterns.
 */

import nlp from 'compromise';
import type { CompromiseDocument } from './types';

/**
 * Normalizes day names in a CompromiseJS document, preserving semantics
 * 
 * @param doc - CompromiseJS document
 * @returns Processed document
 */
export function normalizeDayNames(doc: CompromiseDocument): CompromiseDocument {
  // Replace plural days with explicit recurrence forms
  // but avoid redundancy with existing "every" terms
  doc.match('#PluralDay')
    .not('(every|each) #PluralDay') // Avoid redundancy
    .replaceWith((match: CompromiseDocument) => {
      const term = match.terms(0);
      const day = term.text().toLowerCase().replace(/s$/, '');
      return `every ${day}`;
    });
  
  // Fix redundant forms: "every mondays" → "every monday"
  doc.match('(every|each) #PluralDay')
    .replaceWith((match: CompromiseDocument) => {
      const prefix = match.match('(every|each)').text();
      const day = match.match('#PluralDay').text().toLowerCase().replace(/s$/, '');
      return `${prefix} ${day}`;
    });
  
  return doc;
}

/**
 * Extracts day of week information from a CompromiseJS match
 * Handles both singular and pluralized day names
 * 
 * @param match - CompromiseJS match with day information
 * @returns Array of day name strings (lowercase, singular)
 */
export function extractDayNames(match: CompromiseDocument): string[] {
  const days: string[] = [];
  
  // Get all terms from the match
  const terms = match.terms();
  
  // Process each term
  for (let i = 0; i < terms.length; i++) {
    const term = terms.eq(i);
    
    // Get the base text
    let text = term.text().toLowerCase();
    
    // Remove prefixes like "every" or "each"
    text = text.replace(/^(every|each)\s+/, '');
    
    // Remove plural suffix
    text = text.replace(/s$/, '');
    
    // Only include what appears to be a day name (basic check)
    const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
                      'mon', 'tue', 'tues', 'wed', 'weds', 'thu', 'thur', 'thurs', 'fri', 'sat', 'sun'];
    
    if (dayNames.includes(text)) {
      days.push(text);
    }
  }
  
  return days;
} 