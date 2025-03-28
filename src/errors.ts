/**
 * Error Classes
 * 
 * This module defines custom error types used throughout the application.
 * Using specialized error classes improves error handling and makes debugging easier.
 * Each error type is designed to provide specific information about what went wrong,
 * making it easier to diagnose and resolve issues.
 */

/**
 * Base error class for all library-specific errors.
 * All other error classes in the library extend from this base class,
 * making it easy to catch and handle all library errors with a single catch block.
 */
export class HeliosError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HeliosError';
  }
}

/**
 * Error thrown when a pattern is invalid or cannot be processed.
 * This is a base class for more specific pattern-related errors.
 */
export class PatternError extends HeliosError {
  constructor(message: string) {
    super(message);
    this.name = 'PatternError';
  }
}

/**
 * Error thrown when an invalid day name is encountered.
 * This occurs when trying to convert a string that's not a valid day name
 * to an RRule weekday constant.
 */
export class InvalidDayError extends PatternError {
  /**
   * @param day - The invalid day name that was encountered
   */
  constructor(day: string) {
    super(`Invalid day name: ${day}`);
    this.name = 'InvalidDayError';
  }
}

/**
 * Error thrown when an invalid time unit is encountered.
 * This occurs when trying to convert a string that's not a valid time unit
 * (day, week, month, year) to an RRule frequency constant.
 */
export class InvalidTimeUnitError extends PatternError {
  /**
   * @param unit - The invalid time unit that was encountered
   */
  constructor(unit: string) {
    super(`Invalid time unit: ${unit}`);
    this.name = 'InvalidTimeUnitError';
  }
}

/**
 * Error thrown when no patterns match the input text.
 * This indicates that the input text couldn't be interpreted as a valid recurrence pattern.
 */
export class NoMatchingPatternError extends PatternError {
  /**
   * @param input - The input text that couldn't be matched
   * @param suggestions - Optional array of suggested patterns that might be close matches
   */
  constructor(input: string, public suggestions: string[] = []) {
    super(`No matching pattern found for: "${input}"`);
    this.name = 'NoMatchingPatternError';
  }
}

/**
 * Error thrown when a pattern combination is invalid or leads to conflicts.
 * This occurs when trying to combine incompatible patterns.
 */
export class PatternCombinationError extends PatternError {
  /**
   * @param message - Description of the combination error
   * @param patterns - The patterns that couldn't be combined
   */
  constructor(message: string, public patterns: string[]) {
    super(`Pattern combination error: ${message}`);
    this.name = 'PatternCombinationError';
  }
}

/**
 * Error thrown when a property conflict occurs during pattern combination.
 * This is a more specific type of combination error that identifies which
 * properties are in conflict.
 */
export class PropertyConflictError extends PatternCombinationError {
  /**
   * @param property - The property name that has conflicting values
   * @param value1 - The first conflicting value
   * @param value2 - The second conflicting value
   * @param patterns - The patterns with conflicting properties
   */
  constructor(
    public property: string,
    public value1: any,
    public value2: any,
    patterns: string[]
  ) {
    super(
      `Conflicting values for property "${property}": ${JSON.stringify(value1)} vs ${JSON.stringify(value2)}`,
      patterns
    );
    this.name = 'PropertyConflictError';
  }
}

/**
 * Error thrown when an unsupported pattern or configuration is encountered.
 * This indicates that the user is trying to use a feature that's not implemented yet.
 */
export class UnsupportedPatternError extends PatternError {
  /**
   * @param pattern - The unsupported pattern
   * @param reason - Optional reason why the pattern is unsupported
   */
  constructor(pattern: string, reason?: string) {
    super(
      `Unsupported pattern: "${pattern}"${reason ? ` (${reason})` : ''}`
    );
    this.name = 'UnsupportedPatternError';
  }
}

/**
 * Error thrown when a configuration error occurs.
 * This indicates that the library was configured incorrectly.
 */
export class ConfigurationError extends HeliosError {
  /**
   * @param message - Description of the configuration error
   */
  constructor(message: string) {
    super(`Configuration error: ${message}`);
    this.name = 'ConfigurationError';
  }
}

/**
 * Error thrown when input validation fails.
 * This indicates that the input to a function is invalid.
 */
export class ValidationError extends HeliosError {
  /**
   * @param message - Description of the validation error
   */
  constructor(message: string) {
    super(`Validation error: ${message}`);
    this.name = 'ValidationError';
  }
}

/**
 * Error thrown when a required dependency is missing.
 * This could occur if the library is used without a required polyfill or plugin.
 */
export class DependencyError extends HeliosError {
  /**
   * @param dependency - The name of the missing dependency
   * @param message - Optional additional information
   */
  constructor(dependency: string, message?: string) {
    super(`Missing dependency: ${dependency}${message ? ` - ${message}` : ''}`);
    this.name = 'DependencyError';
  }
} 