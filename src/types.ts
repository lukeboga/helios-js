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

import { RRule } from 'rrule';
import type { Options as RRuleOptions } from 'rrule';
import type { Frequency } from 'rrule';
import type { DayString, TimeUnitString } from './constants';

/**
 * Pattern Handler interface defines the structure for all pattern recognition modules.
 * Each pattern handler analyzes input text and updates the rule options accordingly.
 * 
 * This interface allows for consistent implementation of pattern handlers throughout
 * the system.
 */
export interface PatternHandler {
  /**
   * Applies pattern recognition to input text and returns a result if the pattern matches.
   * 
   * @param input - Normalized recurrence pattern string
   * @returns PatternResult if a pattern was matched, null otherwise
   */
  apply(input: string): PatternResult | null;

  /**
   * The priority of this pattern handler in the transformation pipeline.
   * Higher priority handlers are executed first.
   */
  priority: number;

  /**
   * Descriptive name of the pattern handler for debugging and logging.
   */
  name: string;

  /**
   * The category this pattern handler belongs to.
   * Used for enabling/disabling groups of related patterns.
   */
  category: string;
}

/**
 * Represents the result of a pattern match, including the recognized options
 * and metadata about the match.
 */
export interface PatternResult {
  /**
   * The recurrence options extracted from the pattern.
   */
  options: RecurrenceOptions;
  
  /**
   * Metadata about the pattern match.
   */
  metadata: PatternMatchMetadata;
}

/**
 * Metadata about a pattern match, useful for debugging, combining patterns,
 * and providing user feedback.
 */
export interface PatternMatchMetadata {
  /**
   * The pattern handler name that produced this result.
   */
  patternName: string;
  
  /**
   * The pattern category (frequency, interval, dayOfWeek, etc.)
   */
  category: string;
  
  /**
   * The specific text that was matched.
   */
  matchedText: string;
  
  /**
   * The confidence level of this match (0.0 to 1.0).
   * Higher values indicate more certain matches.
   */
  confidence: number;
  
  /**
   * Whether this is a partial match that might be combined with others.
   */
  isPartial: boolean;
  
  /**
   * The specific properties that were set by this pattern.
   */
  setProperties: Set<keyof RecurrenceOptions>;
  
  /**
   * Optional warnings about this pattern match.
   */
  warnings?: string[];
}

/**
 * Core recurrence options extracted from natural language patterns.
 * These represent both currently implemented and future planned properties.
 * 
 * This interface extends beyond current functionality to include placeholder
 * properties for future pattern categories, ensuring forward compatibility.
 * 
 * Note: We use RRule.Weekday for internal representation (from RRule.MO constants) while
 * the final output to RRule constructor uses the imported Weekday type through conversion.
 */
export interface RecurrenceOptions {
  // Basic frequency and interval (currently implemented)
  freq: Frequency | null;
  interval: number;

  // Day of week specification (currently implemented)
  // We use RRule.Weekday internally from RRule.MO constants
  byweekday: RRule.Weekday[] | null;

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
  
  // End date specification (parsed from natural language)
  until?: Date | null;
  
  // Count specification (for "X times" patterns)
  count?: number | null;
  
  // Tracking which properties have been explicitly set by patterns
  // This is useful for pattern combination and conflict resolution
  setProperties?: Set<keyof RecurrenceOptions>;
  
  // Source information for debugging and user feedback
  sourcePatterns?: string[];
}

/**
 * Pattern Combiner interface defines how multiple pattern results can be combined.
 * This allows for handling complex recurrence expressions like "every Monday and the first of the month".
 */
export interface PatternCombiner {
  /**
   * The name of this combiner for debugging and logging.
   */
  name: string;
  
  /**
   * Priority of this combiner in the combination pipeline.
   * Higher priority combiners are applied first.
   */
  priority: number;
  
  /**
   * Determines if this combiner can combine the given pattern results.
   * 
   * @param pattern1 - First pattern result
   * @param pattern2 - Second pattern result
   * @returns true if the patterns can be combined, false otherwise
   */
  canCombine(pattern1: PatternResult, pattern2: PatternResult): boolean;
  
  /**
   * Combines two compatible pattern results into a single result.
   * 
   * @param pattern1 - First pattern result
   * @param pattern2 - Second pattern result
   * @returns Combined pattern result
   */
  combine(pattern1: PatternResult, pattern2: PatternResult): PatternResult;
}

/**
 * Pattern matching configuration options to control how patterns are recognized.
 */
export interface PatternMatchingConfig {
  /**
   * Controls how strictly pattern text is matched.
   * - strict: Exact matches only
   * - normal: Minor variations allowed (default)
   * - loose: Accept more variations and synonyms
   */
  matchingMode?: 'strict' | 'normal' | 'loose';
  
  /**
   * Custom synonyms to recognize for pattern keywords.
   * Example: { "each": "every", "fortnightly": "every 2 weeks" }
   */
  synonyms?: Record<string, string>;
  
  /**
   * Whether to recognize patterns with spelling errors.
   * Uses edit distance to identify likely matches.
   */
  allowSpellingErrors?: boolean;
  
  /**
   * Maximum edit distance to consider for spelling errors.
   * Only used when allowSpellingErrors is true.
   * Default is 2.
   */
  maxEditDistance?: number;
}

/**
 * Pattern resolution configuration to control how conflicts are handled.
 */
export interface PatternResolutionConfig {
  /**
   * Custom priority values for pattern handlers.
   * Higher values give higher priority.
   */
  patternPriorities?: Partial<Record<string, number>>;
  
  /**
   * Resolution strategy when patterns conflict.
   * - first: Use first pattern found (based on priority)
   * - all: Try to combine all patterns (default)
   * - mostSpecific: Use the most specific pattern
   */
  conflictResolution?: 'first' | 'all' | 'mostSpecific';
  
  /**
   * Whether later patterns can override earlier patterns.
   */
  allowOverrides?: boolean;
}

/**
 * Pattern selection configuration to control which patterns are used.
 */
export interface PatternSelectionConfig {
  /**
   * Enabled pattern categories.
   * If empty, all patterns are enabled.
   */
  enabledPatterns?: string[];
  
  /**
   * Disabled pattern categories.
   * Takes precedence over enabledPatterns.
   */
  disabledPatterns?: string[];
  
  /**
   * Custom pattern handlers to inject into the pipeline.
   */
  customPatterns?: PatternHandler[];
}

/**
 * Transformation configuration options.
 */
export interface TransformationConfig {
  /**
   * Whether to normalize input text before processing.
   */
  normalizeInput?: boolean;
  
  /**
   * Normalization options for input text.
   */
  normalizationOptions?: {
    lowercase?: boolean;
    trimWhitespace?: boolean;
    removeExtraSpaces?: boolean;
    removePunctuation?: boolean;
  };
  
  /**
   * Whether to apply default values for properties
   * not explicitly set by patterns.
   */
  applyDefaults?: boolean;
  
  /**
   * Custom default values to use.
   */
  defaultValues?: Partial<RecurrenceOptions>;
  
  /**
   * Whether to generate warnings for ambiguous patterns.
   */
  generateWarnings?: boolean;
}

/**
 * Complete configuration options for the HeliosJS library.
 */
export interface HeliosConfig {
  /**
   * Pattern matching configuration.
   */
  matching?: PatternMatchingConfig;
  
  /**
   * Pattern resolution configuration.
   */
  resolution?: PatternResolutionConfig;
  
  /**
   * Pattern selection configuration.
   */
  patterns?: PatternSelectionConfig;
  
  /**
   * Transformation process configuration.
   */
  transformation?: TransformationConfig;
  
  /**
   * Whether to cache results for repeated inputs.
   */
  enableCaching?: boolean;
  
  /**
   * Debug mode options.
   */
  debug?: {
    enabled?: boolean;
    logLevel?: 'error' | 'warn' | 'info' | 'debug';
    detailedResults?: boolean;
  };
}

/**
 * Mapping from day name strings to RRule day constants.
 * Used for converting natural language day names to their corresponding
 * RRule constants.
 * 
 * Note: We use RRule.Weekday since we're working with constants like RRule.MO.
 */
export type DayMapping = Record<DayString, RRule.Weekday>;

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
  
  /**
   * List of pattern combiners to apply, in priority order.
   */
  combiners?: PatternCombiner[];
  
  /**
   * Complete configuration for the transformation process.
   */
  config?: HeliosConfig;
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
  
  /**
   * Confidence score of the transformation (0.0 to 1.0).
   * Higher values indicate more certain interpretations.
   */
  confidence?: number;
}

/**
 * Mapping of synonyms to their standardized terms.
 * Used for normalizing different expressions to a standard format.
 */
export interface SynonymMapping {
  [synonym: string]: string;
}
