/**
 * Natural Language to RRule Converter - Type Definitions
 * 
 * This file contains all type definitions used throughout the converter system.
 * It defines interfaces for pattern recognition, transformation rules, and
 * RRule configuration options.
 * 
 * These types provide a foundation for type safety across the codebase and
 * include extension points for future pattern categories.
 */

import { Options as RRuleOptions } from 'rrule';
import type { Frequency, Weekday } from 'rrule';
import type { DayString, TimeUnitString } from './constants';

/**
 * Pattern Handler interface defines the structure for all pattern recognition modules.
 * Each pattern handler analyzes input text and updates the rule options accordingly.
 * 
 * This interface allows for consistent implementation of both current and future
 * pattern handlers.
 */
export interface PatternHandler {
  /**
   * Applies pattern recognition to input text and modifies options.
   * 
   * @param input - Normalized recurrence pattern string
   * @param options - Rule options object that will be modified based on pattern matches
   */
  apply(input: string, options: RecurrenceOptions): void;

  /**
   * The priority of this pattern handler in the transformation pipeline.
   * Higher priority handlers are executed first.
   */
  priority: number;

  /**
   * Descriptive name of the pattern handler for debugging and logging.
   */
  name: string;
}

/**
 * Core recurrence options extracted from natural language patterns.
 * These represent both currently implemented and future planned properties.
 * 
 * This interface extends beyond current functionality to include placeholder
 * properties for future pattern categories, ensuring forward compatibility.
 */
export interface RecurrenceOptions {
  // Basic frequency and interval (currently implemented)
  freq: Frequency | null;
  interval: number;

  // Day of week specification (currently implemented)
  byweekday: Weekday[] | null;

  // Day of month specification (future extension)
  bymonthday: number[] | null;

  // Month specification (future extension)
  bymonth: number[] | null;

  // Time of day specification (future extension)
  byhour?: number[] | null;
  byminute?: number[] | null;

  // Positional pattern support (future extension)
  // This will handle patterns like "first Monday of month"
  bysetpos?: number[] | null;
}

/**
 * Mapping from day name strings to RRule day constants.
 * Used for converting natural language day names to their corresponding
 * RRule constants.
 */
export type DayMapping = Record<DayString, Weekday>;

/**
 * Mapping from time unit strings to RRule frequency constants.
 * Used for converting natural language time units (day, week, month, year)
 * to their corresponding RRule frequency constants.
 */
export type FrequencyMapping = Record<TimeUnitString, Frequency>;

/**
 * Configuration options for the transformer pipeline.
 * Controls how pattern handlers are registered and applied.
 */
export interface TransformerConfig {
  /**
   * List of pattern handlers to apply, in priority order.
   */
  handlers: PatternHandler[];

  /**
   * Whether to continue processing after a pattern match is found.
   * Default is true, meaning all handlers are applied regardless of previous matches.
   */
  applyAll?: boolean;

  /**
   * Whether to apply default values for unspecified properties.
   * Default is true.
   */
  applyDefaults?: boolean;
}

/**
 * Transformation result containing the final RRule options and metadata.
 * This extends RRuleOptions (which can be passed directly to the RRule constructor)
 * and includes additional metadata about the transformation process.
 */
export interface TransformationResult extends RRuleOptions {
  /**
   * List of pattern types that were matched during transformation.
   * Useful for debugging and understanding how the input was interpreted.
   */
  matchedPatterns?: string[];

  /**
   * Any warnings generated during transformation, such as ambiguous
   * or potentially conflicting patterns.
   */
  warnings?: string[];
}
