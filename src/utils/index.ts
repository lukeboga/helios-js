/**
 * Utilities Module
 * 
 * This module provides utility functions used throughout the application.
 * These utilities help with common tasks and improve code readability.
 */

import { RRule } from 'rrule';
import type { Weekday } from 'rrule';

/**
 * Converts RRule.Weekday constants for use in RRule options
 * 
 * This function solves a critical type compatibility issue between:
 * 1. The RRule.Weekday type (e.g., RRule.MO) that we use internally
 * 2. The imported Weekday type that RRule's constructor expects
 * 
 * While these types represent the same concept, TypeScript treats them as distinct.
 * RRule.Weekday (from the namespace) lacks a required 'weekday' property that the
 * imported Weekday class has. This function performs the necessary type cast.
 * 
 * @param weekdays - Array of RRule weekday constants (RRule.MO, etc.)
 * @returns The same array with the proper Weekday[] type for RRule options
 * 
 * @example
 * // Usage in transformer or at API boundaries
 * options.byweekday = asWeekdays([RRule.MO, RRule.WE]); 
 */
export function asWeekdays(weekdays: RRule.Weekday[]): Weekday[] {
  // No actual conversion needed at runtime - this is purely to satisfy TypeScript
  // The values are compatible in the actual RRule library execution
  return weekdays as unknown as Weekday[];
}

/**
 * Creates a date in UTC format with month starting from 1 (not 0)
 * 
 * This is a helper function similar to the one provided by RRule,
 * making it easier to create dates without month off-by-one errors.
 * 
 * @param year - The year
 * @param month - The month (1-12, not 0-11)
 * @param day - The day of month
 * @param hour - The hour (optional)
 * @param minute - The minute (optional)
 * @param second - The second (optional)
 * @returns A Date object in UTC
 */
export function datetime(
  year: number,
  month: number,
  day: number,
  hour: number = 0,
  minute: number = 0,
  second: number = 0
): Date {
  return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
}

/**
 * Future utilities can be added here as needed.
 * This module is a good place for:
 * - Date manipulation helpers
 * - String processing utilities
 * - Other general-purpose functions
 */
