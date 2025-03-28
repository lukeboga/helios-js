/**
 * Date Utilities
 * 
 * This module provides date-related utility functions used throughout the application.
 * These utilities help with common date manipulation tasks and improve code readability.
 */

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
 * 
 * @example
 * // Create a date for January 15, 2023
 * const date = datetime(2023, 1, 15);
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
 * Future date utilities would be added here, such as:
 * - Date formatting functions
 * - Date comparison helpers
 * - Date generation utilities (next N occurrences, etc.)
 */ 