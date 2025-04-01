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

// Import the CompromiseDocument type to avoid circular dependencies
import type { CompromiseDocument } from './compromise/types';

/**
 * Pattern Handler interface defines the structure for all pattern recognition modules.
 * Each pattern handler analyzes input text and updates the rule options accordingly.
 * 
 * This interface allows for consistent implementation of pattern handlers throughout
 * the system.
 * 
 * NOTE: This interface is being deprecated in favor of the function-based approach
 * with the factory pattern. It is kept for reference and backward compatibility.
 * New pattern handlers should use the factory-based approach.
 * 
 * @deprecated Use the factory-based pattern handler approach instead.
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
  
  // Confidence level of the pattern recognition (0.0 to 1.0)
  // Higher values indicate more certain matches
  confidence?: number;
}

/**
 * Result object returned by pattern handlers
 * 
 * This interface defines the structure of results returned by pattern handlers,
 * providing a consistent way to communicate match results and metadata.
 */
export interface PatternHandlerResult {
  /** Whether the pattern was matched */
  matched: boolean;
  
  /** 
   * Confidence level of the match (0.0-1.0)
   * Higher values indicate more certain matches
   */
  confidence?: number;
  
  /** 
   * Any warnings during processing
   * Used to provide feedback about potential issues
   */
  warnings?: string[];
}

/**
 * Represents a matched pattern recognized in natural language text.
 * This is a more focused and standardized alternative to the PatternResult interface,
 * designed to work with the modern factory-based pattern handler approach.
 * 
 * Each pattern match contains the specific information extracted from text,
 * along with metadata to help process and evaluate the match quality.
 */
export interface PatternMatch {
  /**
   * The type of pattern that was matched (e.g., 'frequency', 'dayOfWeek', 'interval')
   * Used to route the match to the appropriate processor
   */
  type: string;
  
  /**
   * The extracted value from the match, which can be of various types
   * depending on the pattern (e.g., RRule.DAILY, [RRule.MO, RRule.WE], 2)
   */
  value: any;
  
  /**
   * The specific text that was matched in the document
   * Useful for debugging and providing user feedback
   */
  text: string;
  
  /**
   * Optional confidence score (0.0 to 1.0) indicating how certain the match is
   * Higher values indicate more confidence in the match
   */
  confidence?: number;
  
  /**
   * Optional array of warning messages related to this match
   * Used to provide feedback about potential issues
   */
  warnings?: string[];
}

/**
 * Function type for pattern matchers that identify specific patterns in text.
 * 
 * Pattern matchers examine a CompromiseJS document and extract structured
 * information about patterns found in the text. They return null if no pattern
 * is matched, or a PatternMatch object with the extracted information.
 * 
 * This function type enables a clean separation between pattern recognition
 * and pattern processing, making handlers more modular and easier to maintain.
 */
export type PatternMatcher = (
  doc: CompromiseDocument, 
  config?: PatternMatcherConfig
) => PatternMatch | null;

/**
 * Function type for pattern processors that update recurrence options based on a match.
 * 
 * Pattern processors take a match produced by a PatternMatcher and update
 * the recurrence options accordingly. They also update the result object
 * with any warnings or additional information.
 * 
 * This separation of matcher and processor enables more flexible and
 * composable pattern handling logic.
 */
export type PatternProcessor = (
  options: RecurrenceOptions,
  match: PatternMatch,
  result: PatternHandlerResult
) => void;

/**
 * Configuration options for pattern matchers.
 * 
 * This replaces the use of 'any' in configuration parameters,
 * providing better type safety and documentation of available options.
 */
export interface PatternMatcherConfig {
  /**
   * Whether to perform case-sensitive matching
   * Default is false (case-insensitive)
   */
  caseSensitive?: boolean;
  
  /**
   * Whether to allow fuzzy matching for similar words
   * Default is true
   */
  fuzzyMatching?: boolean;
  
  /**
   * Minimum confidence threshold for accepting a match
   * Default is 0.6 (60% confidence)
   */
  minConfidence?: number;
  
  /**
   * Whether to apply synonyms during matching
   * Default is true
   */
  applySynonyms?: boolean;
  
  /**
   * Custom synonym mappings to apply during matching
   * These override the default synonyms
   */
  synonymMap?: Record<string, string>;
}

/**
 * Modern Pattern Handler function type definition.
 * 
 * This represents the new standardized function signature for pattern handlers,
 * replacing the older interface-based approach. It processes a CompromiseJS document
 * and updates the recurrence options based on patterns found in the text.
 * 
 * The function returns a PatternHandlerResult indicating whether a pattern was matched
 * and providing any additional information about the match.
 * 
 * This function type will be used by the handler factory to generate consistent
 * pattern handler implementations.
 */
export type ModernPatternHandler = (
  doc: CompromiseDocument,
  options: RecurrenceOptions,
  config?: PatternMatcherConfig
) => PatternHandlerResult;

/**
 * Metadata for pattern handlers created by the factory function.
 * 
 * This provides additional information about a pattern handler that isn't
 * part of its function signature but is useful for processing and debugging.
 */
export interface PatternHandlerMetadata {
  /**
   * Name of the pattern handler
   */
  name: string;
  
  /**
   * Category the pattern handler belongs to (e.g., 'frequency', 'interval')
   */
  category: string;
  
  /**
   * Priority of the pattern handler in the processing pipeline
   * Higher values indicate higher priority (processed earlier)
   */
  priority: number;
  
  /**
   * The matchers used by this pattern handler
   */
  matchers: PatternMatcher[];
  
  /**
   * The processor function used by this pattern handler
   */
  processor: PatternProcessor;
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
