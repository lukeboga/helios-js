/**
 * Pattern Utilities
 * 
 * This module provides shared utilities and constants for pattern recognition modules.
 * It centralizes common functionality used across different pattern handlers,
 * reducing duplication and ensuring consistency.
 * 
 * The utilities are designed to support both current pattern recognition needs
 * and provide a foundation for future pattern categories.
 */

import { RRule, Frequency } from 'rrule';
import { DayMapping, FrequencyMapping, } from '../types';

/**
 * Maps day names (and abbreviations) to RRule day constants.
 * This mapping allows conversion from natural language day names to
 * their corresponding RRule constants.
 * 
 * Includes both full names (monday) and abbreviations (mon) for flexibility.
 */
export const DAY_MAP: DayMapping = {
  // Full day names
  'monday': RRule.MO,
  'tuesday': RRule.TU,
  'wednesday': RRule.WE,
  'thursday': RRule.TH,
  'friday': RRule.FR,
  'saturday': RRule.SA,
  'sunday': RRule.SU,

  // Common abbreviations
  'mon': RRule.MO,
  'tue': RRule.TU,
  'wed': RRule.WE,
  'thu': RRule.TH,
  'fri': RRule.FR,
  'sat': RRule.SA,
  'sun': RRule.SU
};

/**
 * Maps time unit strings to RRule frequency constants.
 * This mapping allows conversion from natural language time units to
 * their corresponding RRule frequency constants.
 */
export const FREQUENCY_MAP: FrequencyMapping = {
  'day': RRule.DAILY,
  'week': RRule.WEEKLY,
  'month': RRule.MONTHLY,
  'year': RRule.YEARLY
};

/**
 * Array of RRule constants representing weekdays (Monday through Friday).
 * Used for patterns like "every weekday".
 */
export const WEEKDAYS = [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR];

/**
 * Array of RRule constants representing weekend days (Saturday and Sunday).
 * Used for patterns like "every weekend".
 */
export const WEEKEND_DAYS = [RRule.SA, RRule.SU];

/**
 * Regular expression pattern for matching any day name.
 * Includes both full names and abbreviations.
 * 
 * This pattern uses word boundaries (\b) to ensure it matches complete words.
 * It can be used in larger regular expressions to identify day names.
 */
export const DAY_NAME_PATTERN =
  '\\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\\b';

/**
 * Regular expression pattern for matching any time unit (day, week, month, year).
 * Can be used in larger regular expressions to identify time units.
 * 
 * Includes both singular and plural forms (e.g., "day" and "days").
 */
export const TIME_UNIT_PATTERN = '\\b(day|week|month|year)s?\\b';

/**
 * Checks if a string is a valid day name.
 * 
 * @param day - The day name to check
 * @returns True if the day name is valid, false otherwise
 * 
 * @example
 * isValidDayName('monday') // returns true
 * isValidDayName('someday') // returns false
 */
export function isValidDayName(day: string): boolean {
  return day.toLowerCase() in DAY_MAP;
}

/**
 * Converts a day name to its corresponding RRule day constant.
 * 
 * @param day - The day name to convert (case-insensitive)
 * @returns The RRule day constant
 * @throws Error if the day name is invalid
 * 
 * @example
 * dayNameToRRuleDay('monday') // returns RRule.MO
 * dayNameToRRuleDay('MON') // returns RRule.MO
 */
export function dayNameToRRuleDay(day: string): number {
  const normalizedDay = day.toLowerCase();
  if (isValidDayName(normalizedDay)) {
    return DAY_MAP[normalizedDay];
  }
  throw new Error(`Invalid day name: ${day}`);
}

/**
 * Checks if a string is a valid time unit.
 * 
 * @param unit - The time unit to check (case-insensitive)
 * @returns True if the time unit is valid, false otherwise
 * 
 * @example
 * isValidTimeUnit('week') // returns true
 * isValidTimeUnit('fortnight') // returns false
 */
export function isValidTimeUnit(unit: string): boolean {
  // Remove trailing 's' if present (to handle plural forms)
  const singularUnit = unit.toLowerCase().replace(/s$/, '');
  return singularUnit in FREQUENCY_MAP;
}

/**
 * Converts a time unit to its corresponding RRule frequency constant.
 * 
 * @param unit - The time unit to convert (case-insensitive)
 * @returns The RRule frequency constant
 * @throws Error if the time unit is invalid
 * 
 * @example
 * timeUnitToFrequency('week') // returns RRule.WEEKLY
 * timeUnitToFrequency('weeks') // returns RRule.WEEKLY
 */
export function timeUnitToFrequency(unit: string): Frequency {
  // Remove trailing 's' if present (to handle plural forms)
  const singularUnit = unit.toLowerCase().replace(/s$/, '');
  if (isValidTimeUnit(singularUnit)) {
    return FREQUENCY_MAP[singularUnit];
  }
  throw new Error(`Invalid time unit: ${unit}`);
}

/**
 * Extracts all day names from an input string.
 * 
 * @param input - The input string to search for day names
 * @returns Array of RRule day constants for all found day names
 * 
 * @example
 * extractDayNames('every monday and wednesday') // returns [RRule.MO, RRule.WE]
 */
export function extractDayNames(input: string): number[] {
  const dayPattern = new RegExp(DAY_NAME_PATTERN, 'gi');
  const matches = input.match(dayPattern) || [];

  return matches.map(day => dayNameToRRuleDay(day));
}

/**
 * Helper function to create a regular expression that matches a set of words.
 * Useful for building pattern recognition expressions.
 * 
 * @param words - Array of words to match
 * @param options - Regular expression options (like 'i' for case-insensitive)
 * @returns Regular expression that matches any of the given words with word boundaries
 * 
 * @example
 * createWordMatchPattern(['daily', 'weekly']) // returns /\b(daily|weekly)\b/
 */
export function createWordMatchPattern(words: string[], options?: string): RegExp {
  const pattern = `\\b(${words.join('|')})\\b`;
  return new RegExp(pattern, options);
}

// Additional utilities for future pattern categories:

/**
 * Helper for future implementation of ordinal number extraction.
 * Will be useful for patterns like "1st Monday of month" or "on the 15th".
 * 
 * @param input - The input string containing ordinal numbers
 * @returns Array of extracted numbers
 */
export function extractOrdinalNumbers(input: string): number[] {
  // This is a placeholder implementation for future extension
  // It would extract numbers like "1st", "2nd", "3rd", "4th" from text

  // Example implementation:
  // const ordinalPattern = /(\d+)(st|nd|rd|th)/gi;
  // const matches = [...input.matchAll(ordinalPattern)];
  // return matches.map(match => parseInt(match[1], 10));

  return [];
}

/**
 * Helper for future implementation of month name extraction.
 * Will be useful for patterns like "in January and July".
 * 
 * @param input - The input string containing month names
 * @returns Array of month numbers (1-12)
 */
export function extractMonthNames(input: string): number[] {
  // This is a placeholder implementation for future extension
  // It would extract month names and convert them to month numbers

  // Example implementation:
  // const monthPattern = /\b(january|february|...)\b/gi;
  // const monthMap = { 'january': 1, 'february': 2, ... };
  // const matches = input.match(monthPattern) || [];
  // return matches.map(month => monthMap[month.toLowerCase()]);

  return [];
}
