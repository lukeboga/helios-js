/**
 * CompromiseJS Setup Module
 * 
 * This module initializes the CompromiseJS library with our custom language model
 * for recurrence patterns. It defines tags and rules for recognizing different
 * types of recurrence patterns.
 */

import nlp from 'compromise';

/**
 * Flag to track whether CompromiseJS has been initialized
 */
let initialized = false;

/**
 * Sets up CompromiseJS with our custom language model for recurrence patterns
 */
export function setupCompromise(): void {
  // Skip initialization if already done
  if (initialized) return;
  
  // Create custom plugin for recurrence patterns
  const recurrencePlugin = {
    words: {
      // Day names
      monday: 'WeekDay',
      tuesday: 'WeekDay',
      wednesday: 'WeekDay',
      thursday: 'WeekDay',
      friday: 'WeekDay',
      saturday: 'WeekDay',
      sunday: 'WeekDay',
      
      // Plural day forms
      mondays: 'PluralDay',
      tuesdays: 'PluralDay',
      wednesdays: 'PluralDay',
      thursdays: 'PluralDay',
      fridays: 'PluralDay',
      saturdays: 'PluralDay',
      sundays: 'PluralDay',
      
      // Day abbreviations
      mon: 'WeekDayAbbr',
      tue: 'WeekDayAbbr',
      tues: 'WeekDayAbbr',
      wed: 'WeekDayAbbr',
      weds: 'WeekDayAbbr',
      thu: 'WeekDayAbbr',
      thur: 'WeekDayAbbr',
      thurs: 'WeekDayAbbr',
      fri: 'WeekDayAbbr',
      sat: 'WeekDayAbbr',
      sun: 'WeekDayAbbr',
      
      // Special day groups
      weekday: 'DayGroup',
      weekdays: 'DayGroup',
      weekend: 'DayGroup',
      weekends: 'DayGroup',
      
      // Frequency terms
      daily: 'Frequency',
      weekly: 'Frequency',
      monthly: 'Frequency',
      yearly: 'Frequency',
      annually: 'Frequency',
      
      // Every/each terms
      every: 'Every',
      each: 'Every',
      
      // Special interval terms
      biweekly: 'Interval',
      fortnightly: 'Interval',
      bimonthly: 'Interval',
      
      // Numeric qualifiers
      other: 'IntervalQualifier',
      
      // Until terms
      until: 'Until',
      through: 'Until',
      thru: 'Until',
      ending: 'Until',
      end: 'Until',
      till: 'Until',
      
      // Ordinal terms
      first: 'Ordinal',
      second: 'Ordinal',
      third: 'Ordinal',
      fourth: 'Ordinal',
      fifth: 'Ordinal',
      last: 'Ordinal',
    },
    
    rules: [
      // Plural day name rule (transform to recurring pattern)
      { match: '#PluralDay', tag: 'RecurringDay', reason: 'plural-form' },
      
      // Explicit recurring day
      { match: '#Every #WeekDay', tag: 'RecurringDay', reason: 'explicit-recurring' },
      { match: '#Every #WeekDayAbbr', tag: 'RecurringDay', reason: 'explicit-recurring-abbr' },
      
      // Special day groups
      { match: '#Every #DayGroup', tag: 'RecurringDayGroup', reason: 'day-group' },
      
      // Frequency patterns
      { match: '#Frequency', tag: 'FrequencyPattern', reason: 'basic-frequency' },
      { match: '#Every day', tag: 'FrequencyPattern', reason: 'every-day' },
      { match: '#Every week', tag: 'FrequencyPattern', reason: 'every-week' },
      { match: '#Every month', tag: 'FrequencyPattern', reason: 'every-month' },
      { match: '#Every year', tag: 'FrequencyPattern', reason: 'every-year' },
      
      // Interval patterns
      { match: '#Every #Value (day|days|week|weeks|month|months|year|years)', tag: 'IntervalPattern', reason: 'numbered-interval' },
      { match: '#Every #IntervalQualifier (day|days|week|weeks|month|months|year|years)', tag: 'IntervalPattern', reason: 'every-other' },
      { match: '#Interval', tag: 'IntervalPattern', reason: 'special-interval' },
      
      // Day of month patterns
      { match: '#Ordinal (of|of the) month', tag: 'DayOfMonthPattern', reason: 'ordinal-of-month' },
      { match: '#Ordinal [day]', tag: 'DayOfMonthPattern', reason: 'ordinal-day' },
      { match: 'day #Value', tag: 'DayOfMonthPattern', reason: 'day-number' },
      { match: 'on the #Value', tag: 'DayOfMonthPattern', reason: 'on-the-number' },
      
      // Until patterns
      { match: '#Until .+', tag: 'UntilPattern', reason: 'until-date' },
    ]
  };
  
  // Register the plugin with CompromiseJS
  nlp.extend(recurrencePlugin);
  
  // Mark as initialized
  initialized = true;
}

/**
 * Gets a normalized CompromiseJS document for the input text
 * Ensures the CompromiseJS setup is initialized and applies normalization
 * 
 * @param text - Input text to process
 * @param options - Optional processing options
 * @returns CompromiseJS document
 */
export function getDocument(text: string, options?: { correctMisspellings?: boolean }): any {
  // Ensure CompromiseJS is set up
  setupCompromise();
  
  // Import normalizeInput here to avoid circular dependencies
  const { normalizeInput } = require('../normalizer');
  
  // Apply normalization with spelling correction if enabled
  const normalizedText = normalizeInput(text, { 
    correctMisspellings: options?.correctMisspellings !== false,
    normalizeDayNames: true,
    applySynonyms: true
  });
  
  // Return a processed document
  return nlp(normalizedText);
} 