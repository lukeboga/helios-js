/**
 * Error Classes
 * 
 * This module defines custom error types used throughout the application.
 * Using specialized error classes improves error handling and makes debugging easier.
 */

/**
 * Base error class for all library-specific errors
 */
export class HeliosError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HeliosError';
  }
}

/**
 * Error thrown when a pattern is invalid or cannot be processed
 */
export class PatternError extends HeliosError {
  constructor(message: string) {
    super(message);
    this.name = 'PatternError';
  }
}

/**
 * Error thrown when an invalid day name is encountered
 */
export class InvalidDayError extends PatternError {
  constructor(day: string) {
    super(`Invalid day name: ${day}`);
    this.name = 'InvalidDayError';
  }
}

/**
 * Error thrown when an invalid time unit is encountered
 */
export class InvalidTimeUnitError extends PatternError {
  constructor(unit: string) {
    super(`Invalid time unit: ${unit}`);
    this.name = 'InvalidTimeUnitError';
  }
} 