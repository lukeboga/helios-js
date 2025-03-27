/**
 * Utilities Module
 * 
 * This module provides utility functions used throughout the application.
 * These utilities help with common tasks and improve code readability.
 */

import { RRule } from 'rrule';
import type { Weekday } from 'rrule';

/**
 * Properly converts RRule weekday constants for use in RRule options
 * 
 * This function helps handle the type discrepancy between how RRule weekday
 * constants are exported (as RRule.Weekday) and how they're expected in options
 * (as Weekday). There's no runtime conversion, only type alignment.
 * 
 * @param weekdays - Array of RRule weekday constants (RRule.MO, etc.)
 * @returns The same array with the proper Weekday[] type for RRule options
 */
export function asWeekdays(weekdays: RRule.Weekday[]): Weekday[] {
  // No actual conversion needed - this is just for TypeScript
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
