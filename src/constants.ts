/**
 * Constants for Natural Language to RRule Converter
 * 
 * This file contains constant definitions used throughout the converter system.
 * Centralizing constants here ensures consistency and provides a single source
 * of truth for values used across multiple modules.
 */

/**
 * Day name constants for both full names and abbreviations.
 * These are used for pattern matching of day names in natural language input.
 */
export const DAYS = {
  // Full day names
  MONDAY: 'monday',
  TUESDAY: 'tuesday',
  WEDNESDAY: 'wednesday',
  THURSDAY: 'thursday',
  FRIDAY: 'friday',
  SATURDAY: 'saturday',
  SUNDAY: 'sunday',

  // Common abbreviations
  MON: 'mon',
  TUE: 'tue',
  WED: 'wed',
  THU: 'thu',
  FRI: 'fri',
  SAT: 'sat',
  SUN: 'sun'
} as const;

/**
 * Type representing all possible day string values.
 * This provides a union type of all the string literals in the DAYS object.
 */
export type DayString = typeof DAYS[keyof typeof DAYS];

/**
 * Time unit constants for pattern matching.
 * These represent the basic time units used in recurrence patterns.
 */
export const TIME_UNITS = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year'
} as const;

/**
 * Type representing all possible time unit string values.
 * This provides a union type of all the string literals in the TIME_UNITS object.
 */
export type TimeUnitString = typeof TIME_UNITS[keyof typeof TIME_UNITS];

/**
 * Frequency term constants for pattern matching.
 * These represent the basic frequency terms used in recurrence patterns.
 */
export const FREQUENCY_TERMS = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
  ANNUALLY: 'annually'
} as const;

/**
 * Type representing all possible frequency term string values.
 * This provides a union type of all the string literals in the FREQUENCY_TERMS object.
 */
export type FrequencyTermString = typeof FREQUENCY_TERMS[keyof typeof FREQUENCY_TERMS];

/**
 * Special pattern constants for pattern matching.
 * These represent special recurring pattern terms.
 */
export const SPECIAL_PATTERNS = {
  WEEKDAY: 'weekday',
  WEEKEND: 'weekend',
  EVERY_OTHER: 'every other',
  EVERY: 'every'
} as const;

/**
 * Type representing all possible special pattern string values.
 * This provides a union type of all the string literals in the SPECIAL_PATTERNS object.
 */
export type SpecialPatternString = typeof SPECIAL_PATTERNS[keyof typeof SPECIAL_PATTERNS];

/**
 * Day group constants for pattern matching.
 * These represent common groupings of days.
 */
export const DAY_GROUPS = {
  WEEKDAYS: [DAYS.MONDAY, DAYS.TUESDAY, DAYS.WEDNESDAY, DAYS.THURSDAY, DAYS.FRIDAY],
  WEEKEND_DAYS: [DAYS.SATURDAY, DAYS.SUNDAY],
  ALL_DAYS: [DAYS.MONDAY, DAYS.TUESDAY, DAYS.WEDNESDAY, DAYS.THURSDAY, DAYS.FRIDAY, DAYS.SATURDAY, DAYS.SUNDAY]
} as const;

/**
 * Pattern priority constants.
 * These define the order in which patterns should be applied, with higher numbers
 * indicating higher priority (processed first).
 */
export const PATTERN_PRIORITY = {
  INTERVAL: 100,   // Interval patterns have highest priority as they set both interval and frequency
  FREQUENCY: 90,   // Basic frequency patterns processed next
  DAY_OF_WEEK: 80, // Day specifications processed after frequency is established
  DAY_OF_MONTH: 70, // Future: Day of month patterns
  MONTH: 60,       // Future: Month-based patterns
  POSITION: 50,    // Future: Positional patterns (first Monday, etc.)
  TIME: 40         // Future: Time-of-day patterns
} as const;
