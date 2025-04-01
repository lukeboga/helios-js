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
 * PatternMatch represents a matched pattern with various attributes.
 */
export interface PatternMatch {
  /** Type of pattern that was matched */
  type: string;
  
  /** Value extracted from the pattern */
  value: string | number | Date | null;
  
  /** Original text that matched the pattern */
  text: string;
  
  /** Confidence level of the match (0-1) */
  confidence: number;
  
  /** Optional warning messages about the match */
  warnings?: string[];
}

/**
 * PatternMatcher function type for pattern recognition.
 * Returns a PatternMatch object or null if no match.
 */
export type PatternMatcher = (
  doc: CompromiseDocument, 
  config?: PatternMatcherConfig
) => PatternMatch | null;

/**
 * PatternProcessor function type for updating options based on matched patterns.
 */
export type PatternProcessor = (
  options: RecurrenceOptions, 
  match: PatternMatch
) => RecurrenceOptions;

/**
 * Pattern Handler function type definition.
 * Combines a matcher and processor to handle pattern recognition and processing.
 * The function returns a PatternHandlerResult indicating whether a pattern was matched
 * and any updates to the recurrence options.
 */
export type PatternHandler = (
  doc: CompromiseDocument,
  options: RecurrenceOptions
) => PatternHandlerResult;

/**
 * Metadata for factory-created pattern handlers
 */
export interface PatternHandlerMetadata {
  /** Unique name of the pattern handler */
  name: string;
  
  /** Category the handler belongs to (e.g., "date", "frequency") */
  category?: string;
  
  /** Priority level (higher numbers = higher priority) */
  priority: number;
  
  /** Description of what patterns this handler recognizes */
  description?: string;
}

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
 * Pattern selection configuration for the transformer
 */
export interface PatternSelectionConfig {
  /** Patterns to explicitly enable */
  enabledPatterns?: string[];
  
  /** Patterns to explicitly disable */
  disabledPatterns?: string[];
  
  /** Custom pattern handlers to include */
  customPatterns?: PatternHandler[];
}

/**
 * Configuration options for the transformer
 */
export interface TransformerConfig {
  /** Pattern handlers to use */
  handlers: PatternHandler[];
  
  /** Whether to apply all handlers or stop on first match */
  applyAll?: boolean;
  
  /** Whether to apply default values */
  applyDefaults?: boolean;
  
  /** Configuration options for pattern matchers */
  config?: PatternMatcherConfig;
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
