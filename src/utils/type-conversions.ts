/**
 * Type Conversion Utilities
 * 
 * This module provides utilities for handling type conversions between
 * different but compatible types within the application.
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
 * Future type conversion utilities would be added here, such as:
 * - Conversion between other incompatible but runtime-compatible types
 * - Safe type casting functions with validation
 */ 