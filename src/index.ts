/**
 * Natural Language to RRule Converter
 * 
 * This module converts natural language recurrence patterns into RRule configurations.
 * It uses regex patterns to match common recurrence expressions and transforms them
 * into the appropriate RRule options.
 */

import { RRule, Options as RRuleOptions } from 'rrule';

/**
 * Converts a natural language recurrence pattern to an RRule options object
 * 
 * @param {Date} startDate - The start date for the recurrence pattern
 * @param {string} recurrencePattern - Natural language description of recurrence (e.g., "every 2 weeks")
 * @param {Date} [endDate] - Optional end date for the recurrence pattern
 * @returns {RRuleOptions} An RRule configuration object
 */
export function naturalLanguageToRRule(
  startDate: Date,
  recurrencePattern: string,
  endDate?: Date
): RRuleOptions {
  // Normalize input to improve pattern matching
  const normalizedInput = normalizeInput(recurrencePattern);

  // Apply transformation rules to extract RRule options
  const rruleOptions = applyTransformationRules(normalizedInput);

  // Add start and end dates to options
  rruleOptions.dtstart = startDate;

  if (endDate) {
    rruleOptions.until = endDate;
  }

  return rruleOptions;
}

/**
 * Normalizes the input string to improve pattern matching
 * 
 * @param {string} input - The recurrence pattern string
 * @returns {string} Normalized input string
 */
function normalizeInput(input: string): string {
  return input
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/(\d+)(st|nd|rd|th)/g, '$1'); // Convert "1st" to "1"
}

/**
 * Applies transformation rules to convert natural language to RRule options
 * 
 * @param {string} input - Normalized recurrence pattern string
 * @returns {RRuleOptions} RRule options object
 */
/**
 * Applies transformation rules to convert natural language to RRule options
 * 
 * @param {string} input - Normalized recurrence pattern string
 * @returns {RRuleOptions} RRule options object
 */
function applyTransformationRules(input: string): RRuleOptions {
  // Initialize options object with defaults
  const options: RRuleOptions = {
    freq: null,
    interval: 1,
    byweekday: [],
    bymonthday: [],
    bymonth: [],
  };

  // First detect basic frequency patterns - these are the most direct indicators
  // of the user's intent and should take precedence
  applyFrequencyRules(input, options);

  // Next, check for interval patterns which may modify the frequency
  applyIntervalRules(input, options);

  // Finally apply day of week patterns, but only if they don't conflict with
  // already established frequency settings like "every month"
  applyDayOfWeekRules(input, options);

  // Set a default frequency if none was determined
  if (options.freq === null) {
    options.freq = RRule.DAILY; // Default to daily if no pattern was matched
  }

  // Clean up options: remove empty arrays and null values
  for (const key in options) {
    if (Array.isArray(options[key]) && options[key].length === 0) {
      delete options[key];
    } else if (options[key] === null) {
      delete options[key];
    }
  }

  return options;
}

/**
 * Applies frequency transformation rules
 * 
 * @param {string} input - Normalized recurrence pattern string
 * @param {RRuleOptions} options - RRule options object to modify
 */
/**
 * Applies frequency transformation rules
 * 
 * @param {string} input - Normalized recurrence pattern string
 * @param {RRuleOptions} options - RRule options object to modify
 */
function applyFrequencyRules(input: string, options: RRuleOptions): void {
  // Simple frequency patterns - using more specific regex patterns with word boundaries
  // to ensure we match complete phrases
  if (/\b(daily|every\s+day)\b/.test(input)) {
    options.freq = RRule.DAILY;
  } else if (/\b(weekly|every\s+week)\b/.test(input)) {
    options.freq = RRule.WEEKLY;
  } else if (/\b(monthly|every\s+month)\b/.test(input)) {
    options.freq = RRule.MONTHLY;
  } else if (/\b(yearly|annually|every\s+year)\b/.test(input)) {
    options.freq = RRule.YEARLY;
  }

  // Handle special frequency cases that include day specifications
  else if (/\bevery\s+weekday\b/.test(input)) {
    options.freq = RRule.WEEKLY;
    options.byweekday = [
      RRule.MO,
      RRule.TU,
      RRule.WE,
      RRule.TH,
      RRule.FR
    ];
  } else if (/\bevery\s+weekend\b/.test(input)) {
    options.freq = RRule.WEEKLY;
    options.byweekday = [RRule.SA, RRule.SU];
  }
}

/**
 * Applies interval transformation rules
 * 
 * @param {string} input - Normalized recurrence pattern string
 * @param {RRuleOptions} options - RRule options object to modify
 */
/**
 * Applies interval transformation rules
 * 
 * @param {string} input - Normalized recurrence pattern string
 * @param {RRuleOptions} options - RRule options object to modify
 */
function applyIntervalRules(input: string, options: RRuleOptions): void {
  // Create a map for frequency constants
  const freqMap = {
    'day': RRule.DAILY,
    'week': RRule.WEEKLY,
    'month': RRule.MONTHLY,
    'year': RRule.YEARLY
  };

  // Check for "every X days/weeks/months/years" pattern
  const intervalMatch = /every\s+(\d+)\s+(day|week|month|year)s?/.exec(input);
  if (intervalMatch) {
    const interval = parseInt(intervalMatch[1], 10);
    const unit = intervalMatch[2];

    // Set the interval
    options.interval = interval;

    // Always set the frequency based on the unit from the interval pattern
    // This takes precedence over previously set frequency
    options.freq = freqMap[unit];
    return; // Return early to avoid checking other patterns
  }

  // Check for "every other X" pattern
  const otherMatch = /every\s+other\s+(day|week|month|year)/.exec(input);
  if (otherMatch) {
    options.interval = 2;

    // Set frequency based on the matched unit
    const unit = otherMatch[1];
    options.freq = freqMap[unit];
  }
}

/**
 * Applies day of week transformation rules
 * 
 * @param {string} input - Normalized recurrence pattern string
 * @param {RRuleOptions} options - RRule options object to modify
 */
/**
 * Applies day of week transformation rules
 * 
 * @param {string} input - Normalized recurrence pattern string
 * @param {RRuleOptions} options - RRule options object to modify
 */
function applyDayOfWeekRules(input: string, options: RRuleOptions): void {
  // Skip day of week processing if we've already established a MONTHLY or YEARLY frequency
  // This prevents day patterns from incorrectly overriding basic frequency patterns
  if (options.freq === RRule.MONTHLY || options.freq === RRule.YEARLY) {
    return;
  }

  // Define day name to RRule day constant mapping
  const dayMap: Record<string, number> = {
    'monday': RRule.MO,
    'tuesday': RRule.TU,
    'wednesday': RRule.WE,
    'thursday': RRule.TH,
    'friday': RRule.FR,
    'saturday': RRule.SA,
    'sunday': RRule.SU,
    // Support abbreviations
    'mon': RRule.MO,
    'tue': RRule.TU,
    'wed': RRule.WE,
    'thu': RRule.TH,
    'fri': RRule.FR,
    'sat': RRule.SA,
    'sun': RRule.SU
  };

  // First handle special cases where we already have weekday definitions
  if (Array.isArray(options.byweekday) && options.byweekday.length > 0) {
    return;
  }

  // Check for the common "Day X and Day Y" pattern first
  // This handles cases like "every tuesday and thursday"
  if (/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)(?:\s+and\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun))+\b/i.test(input)) {
    // Extract all day names from the input with a global regex
    const dayMatches = input.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\b/gi);

    if (dayMatches && dayMatches.length > 0) {
      // Convert all matched day names to their RRule constants
      options.byweekday = dayMatches.map(day => dayMap[day.toLowerCase()]);

      // If frequency wasn't set, assume weekly
      if (options.freq === null) {
        options.freq = RRule.WEEKLY;
      }
      return; // Return early to avoid checking other patterns
    }
  }

  // Check for specific days pattern (e.g., "every monday")
  const dayPattern = /every\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\b/gi;
  let dayMatch;
  let daysFound: number[] = [];

  while ((dayMatch = dayPattern.exec(input)) !== null) {
    const day = dayMatch[1].toLowerCase();
    daysFound.push(dayMap[day]);
  }

  // If specific days were found
  if (daysFound.length > 0) {
    options.byweekday = daysFound;

    // If frequency wasn't set, assume weekly
    if (options.freq === null) {
      options.freq = RRule.WEEKLY;
    }
  }

  // Double-check for weekday and weekend patterns
  if (/\bevery\s+weekday\b/.test(input)) {
    options.freq = RRule.WEEKLY;
    options.byweekday = [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR];
  } else if (/\bevery\s+weekend\b/.test(input)) {
    options.freq = RRule.WEEKLY;
    options.byweekday = [RRule.SA, RRule.SU];
  }
}

// Create a factory function that returns an RRule instance
export function createRRule(
  startDate: Date,
  recurrencePattern: string,
  endDate?: Date
): RRule {
  const options = naturalLanguageToRRule(startDate, recurrencePattern, endDate);
  return new RRule(options);
}
