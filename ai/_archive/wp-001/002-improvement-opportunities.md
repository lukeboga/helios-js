# Configuration System: Detailed Analysis & Improvement Opportunities

## Current State of Configuration in HeliosJS

Currently, HeliosJS offers limited configuration options for its transformation pipeline. The main configuration mechanism is through the `TransformerConfig` interface in `src/types.ts`:

```typescript
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
```

While this provides some basic control over the transformation process, it falls short of offering comprehensive configuration options that would make the library more adaptable to diverse use cases.

## Limitations in the Current Configuration System

### 1. Fixed Pattern Matching Behavior

Each pattern handler implements its own pattern matching logic with fixed regular expressions and matching rules. There's no way for users to adjust the "fuzziness" or strictness of pattern matching without modifying the source code.

For example, in `src/patterns/dayOfWeek.ts`, patterns are matched using fixed regular expressions:

```typescript
if (new RegExp(`\\b${SPECIAL_PATTERNS.EVERY}\\s+${SPECIAL_PATTERNS.WEEKDAY}\\b`).test(input)) {
  options.freq = RRule.WEEKLY;
  options.byweekday = WEEKDAYS;
  return;
}
```

Users can't adjust how strictly the library interprets "every weekday" or allow for variations like "each weekday" without code changes.

### 2. Limited Control Over Pattern Resolution

When multiple patterns could reasonably apply to a text, the library prioritizes patterns based on a fixed priority system without giving users control over these priorities or the resolution strategy.

The current priority system in `src/constants.ts` is rigid:

```typescript
export const PATTERN_PRIORITY = {
  INTERVAL: 300,
  FREQUENCY: 200,
  DAY_OF_WEEK: 100
  // Future pattern types will have their own priorities
};
```

### 3. No Configuration for Pattern Combinations

The system doesn't provide options for how patterns should combine or override each other. For example, if both a frequency and a day pattern are found, there's a fixed behavior for how they interact, with no user control.

### 4. No Fine-Grained Control Over Specific Pattern Types

Users can't enable/disable or configure specific types of patterns. For instance, they might want to only recognize day-of-week patterns and ignore frequency patterns.

## Proposed Configuration System Enhancements

Based on the project's vision of creating a flexible natural language processing system for recurrence patterns, here are detailed enhancements to the configuration system:

### 1. Pattern Matching Flexibility Configuration

Implement a configuration system that allows users to adjust how strictly patterns are matched:

```typescript
interface PatternMatchingConfig {
  /**
   * Controls how strictly pattern text is matched
   * - strict: Exact matches only
   * - normal: Minor variations allowed (default)
   * - loose: Accept more variations and synonyms
   */
  matchingMode: 'strict' | 'normal' | 'loose';
  
  /**
   * Custom synonyms to recognize for pattern keywords
   * Example: { "each": "every", "fortnightly": "every 2 weeks" }
   */
  synonyms?: Record<string, string>;
  
  /**
   * Whether to recognize patterns with spelling errors
   * Uses edit distance to identify likely matches
   */
  allowSpellingErrors?: boolean;
  
  /**
   * Maximum edit distance to consider for spelling errors
   * Only used when allowSpellingErrors is true
   */
  maxEditDistance?: number;
}
```

### 2. Pattern Priority and Resolution Configuration

Allow users to configure how conflicts between patterns are resolved:

```typescript
interface PatternResolutionConfig {
  /**
   * Custom priority values for pattern handlers
   * Higher values give higher priority
   */
  patternPriorities?: Partial<Record<string, number>>;
  
  /**
   * Resolution strategy when patterns conflict
   * - first: Use first pattern found (based on priority)
   * - all: Try to combine all patterns (default)
   * - mostSpecific: Use the most specific pattern
   */
  conflictResolution?: 'first' | 'all' | 'mostSpecific';
  
  /**
   * Whether later patterns can override earlier patterns
   */
  allowOverrides?: boolean;
}
```

### 3. Pattern Selection and Filtering

Enable users to select which pattern types to use:

```typescript
interface PatternSelectionConfig {
  /**
   * Enabled pattern categories
   * If empty, all patterns are enabled
   */
  enabledPatterns?: string[];
  
  /**
   * Disabled pattern categories
   * Takes precedence over enabledPatterns
   */
  disabledPatterns?: string[];
  
  /**
   * Custom pattern handlers to inject into the pipeline
   */
  customPatterns?: PatternHandler[];
}
```

### 4. Transformation Options Configuration

Provide configuration for the transformation process itself:

```typescript
interface TransformationConfig {
  /**
   * Whether to normalize input text before processing
   */
  normalizeInput?: boolean;
  
  /**
   * Normalization options for input text
   */
  normalizationOptions?: {
    lowercase?: boolean;
    trimWhitespace?: boolean;
    removeExtraSpaces?: boolean;
    removePunctuation?: boolean;
  };
  
  /**
   * Whether to apply default values for properties
   * not explicitly set by patterns
   */
  applyDefaults?: boolean;
  
  /**
   * Custom default values to use
   */
  defaultValues?: Partial<RecurrenceOptions>;
  
  /**
   * Whether to generate warnings for ambiguous patterns
   */
  generateWarnings?: boolean;
}
```

### 5. Integrated Configuration Object

Combine these configurations into a comprehensive system:

```typescript
interface HeliosConfig {
  /**
   * Pattern matching configuration
   */
  matching?: PatternMatchingConfig;
  
  /**
   * Pattern resolution configuration
   */
  resolution?: PatternResolutionConfig;
  
  /**
   * Pattern selection configuration
   */
  patterns?: PatternSelectionConfig;
  
  /**
   * Transformation process configuration
   */
  transformation?: TransformationConfig;
  
  /**
   * Whether to cache results for repeated inputs
   */
  enableCaching?: boolean;
  
  /**
   * Debug mode options
   */
  debug?: {
    enabled?: boolean;
    logLevel?: 'error' | 'warn' | 'info' | 'debug';
    detailedResults?: boolean;
  };
}
```

## Implementation Approach

The configuration system would be implemented by:

1. **Creating a Configuration Module**: A new module to manage configuration and provide defaults

2. **Enhancing the Transformer Pipeline**: Modify the transformer to incorporate configuration at each stage

3. **Updating Pattern Handlers**: Refactor pattern handlers to adapt their behavior based on configuration

4. **Adding Configuration Validation**: Ensure configurations are valid and consistent

5. **Providing Presets**: Include common configuration presets for different use cases

## Alignment with Project Vision

This enhanced configuration system aligns with the project's vision in several ways:

1. **Increased Flexibility**: Users can tailor the library's behavior to their specific needs

2. **Domain-Specific Adaptability**: Different applications might need different interpretations of the same text

3. **Extensibility**: The configuration system enables easier extension with custom patterns and behaviors

4. **User Control**: Gives users more control over how their natural language is interpreted

5. **Developer-Friendly**: Maintains the clean architecture while adding configuration points at key stages

## Example Use Cases

### 1. Strict Parsing for Critical Applications

```typescript
const config: HeliosConfig = {
  matching: {
    matchingMode: 'strict',
    allowSpellingErrors: false
  },
  resolution: {
    conflictResolution: 'first',
    allowOverrides: false
  },
  transformation: {
    generateWarnings: true
  }
};

const options = naturalLanguageToRRule(startDate, "every monday", undefined, config);
```

### 2. Flexible Parsing for User Input

```typescript
const config: HeliosConfig = {
  matching: {
    matchingMode: 'loose',
    allowSpellingErrors: true,
    maxEditDistance: 2,
    synonyms: {
      "each": "every",
      "daily": "every day"
    }
  },
  resolution: {
    conflictResolution: 'mostSpecific'
  }
};

const options = naturalLanguageToRRule(startDate, userInput, undefined, config);
```

### 3. Application-Specific Pattern Subset

```typescript
const config: HeliosConfig = {
  patterns: {
    enabledPatterns: ['dayOfWeek', 'interval']
  },
  transformation: {
    applyDefaults: true,
    defaultValues: {
      freq: RRule.WEEKLY
    }
  }
};

const options = naturalLanguageToRRule(startDate, "every monday and wednesday", undefined, config);
```

## Conclusion on Configuration System

Enhancing the configuration system would significantly increase the flexibility and adaptability of HeliosJS while maintaining its core architecture. By providing configuration points at key stages of the transformation pipeline, users would gain fine-grained control over how their natural language is interpreted and converted to RRule configurations.

This would make the library more valuable for a wider range of applications, from consumer-facing calendar interfaces to enterprise scheduling systems, each with their own requirements for pattern recognition strictness and behavior.
