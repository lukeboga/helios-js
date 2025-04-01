# API Reference

> **Change Log**:  
> - [April 2025]: Updated return type definitions for `naturalLanguageToRRule`
> - [April 2025]: Corrected parameter types from `TransformerConfig` to `RecurrenceProcessorOptions`
> - [April 2025]: Updated interface definitions to match implementation
> - [April 2025]: Revised configuration options documentation
> - [April 2025]: Updated code examples for accuracy

This document provides detailed documentation for all exported functions, interfaces, and configuration options in Helios-JS. It serves as a technical reference for developers who want to integrate or extend the library.

## Core Functions

### `naturalLanguageToRRule`

Converts a natural language recurrence pattern to an RRule options object.

```typescript
function naturalLanguageToRRule(
  startDate: Date,
  recurrencePattern: string,
  config?: Partial<RecurrenceProcessorOptions>
): MinimalRRuleOptions | null
```

**Parameters:**

- `startDate`: The start date for the recurrence pattern (required)
- `recurrencePattern`: Natural language description (e.g., "every 2 weeks") (required)
- `config`: Optional configuration for the recurrence processing

**Returns:**

An object containing RRule options that can be used with the RRule constructor, or `null` if the pattern couldn't be processed.

**Example:**

```typescript
import { naturalLanguageToRRule } from 'helios-js';

// Get RRule options for weekly recurrence on Mondays
const options = naturalLanguageToRRule(new Date(), "every monday");
if (options) {
  // options contains freq, interval, byweekday etc.
  console.log(`Frequency: ${options.freq}, Interval: ${options.interval}`);
}

// With end date in the pattern
const optionsWithEnd = naturalLanguageToRRule(
  new Date(), 
  "every monday until December 31, 2023"
);
if (optionsWithEnd && optionsWithEnd.until) {
  console.log(`End date: ${optionsWithEnd.until.toDateString()}`);
}
```

### `createRRule`

Creates an RRule instance from a natural language recurrence pattern.

```typescript
function createRRule(
  startDate: Date,
  recurrencePattern: string,
  config?: Partial<RecurrenceProcessorOptions>
): RRule | null
```

**Parameters:**

- `startDate`: The start date for the recurrence pattern (required)
- `recurrencePattern`: Natural language description (e.g., "every Monday") (required)
- `config`: Optional configuration for the recurrence processing

**Returns:**

An RRule instance configured according to the natural language pattern, or `null` if the pattern couldn't be processed.

**Example:**

```typescript
import { createRRule } from 'helios-js';

// Create a rule for every Monday
const rule = createRRule(new Date(), "every monday");
if (rule) {
  // Get the next 5 occurrences
  const nextFive = rule.all((date, i) => i < 5);
}

// With an end date in the pattern
const ruleWithEnd = createRRule(
  new Date(), 
  "every monday until December 31, 2023"
);
if (ruleWithEnd) {
  console.log("Rule has end date:", ruleWithEnd.options.until);
}
```

### `validatePattern`

Validates if a natural language pattern can be parsed correctly.

```typescript
function validatePattern(
  pattern: string,
  config?: Partial<RecurrenceProcessorOptions>
): ValidationResult
```

**Parameters:**

- `pattern`: The natural language pattern to validate (required)
- `config`: Optional configuration for the recurrence processing

**Returns:**

A validation result object with success flag, confidence score, and any warnings.

**Example:**

```typescript
import { validatePattern } from 'helios-js';

// Check if a pattern is valid
const result = validatePattern("every monday and fridays");

if (result.valid) {
  console.log("Pattern is valid with confidence:", result.confidence);
} else {
  console.log("Pattern is invalid:", result.warnings);
}
```

### `suggestPatternCorrections`

Suggests corrections for potentially invalid patterns.

```typescript
function suggestPatternCorrections(pattern: string): string[]
```

**Parameters:**

- `pattern`: The natural language pattern to analyze (required)

**Returns:**

Array of suggested corrections or empty array if no suggestions.

**Example:**

```typescript
import { suggestPatternCorrections } from 'helios-js';

// Get suggestions for an invalid pattern
const suggestions = suggestPatternCorrections("evry monday");
// Returns: ["every monday"]
```

### `normalizeInput`

Normalizes a natural language recurrence pattern for more consistent pattern matching.

```typescript
function normalizeInput(
  input: string, 
  options?: Partial<NormalizerOptions>
): string
```

**Parameters:**

- `input`: The raw natural language recurrence pattern (required)
- `options`: Optional configuration options

**Returns:**

Normalized text ready for pattern matching.

**Example:**

```typescript
import { normalizeInput } from 'helios-js';

// Simple normalization with default options
const normalized = normalizeInput("Every 2nd Week on Monday");
// Returns: "every 2 week on monday"

// Preserve ordinal suffixes
const withOrdinals = normalizeInput("Every 2nd Week", {
  preserveOrdinalSuffixes: true
});
// Returns: "every 2nd week"
```

### `comprehensiveNormalize`

Performs comprehensive normalization including misspelling correction, synonym replacement, and more.

```typescript
function comprehensiveNormalize(input: string): string
```

**Parameters:**

- `input`: The raw natural language recurrence pattern (required)

**Returns:**

Fully normalized text with corrected misspellings and standardized terminology.

**Example:**

```typescript
import { comprehensiveNormalize } from 'helios-js';

// Correct misspellings and standardize terminology
const normalized = comprehensiveNormalize("evry mondey and tusday");
// Returns: "every monday and tuesday"

// Handle plural forms and normalize terminology
const normalized2 = comprehensiveNormalize("on mondays and the last day of each month");
// Returns: "on monday and the last day of each month"

// Replace synonyms with canonical forms
const normalized3 = comprehensiveNormalize("fortnightly on weekdays");
// Returns: "every 2 weeks on weekday"
```

This function applies all normalization steps with their default settings, making it ideal for general-purpose text preparation before pattern matching. It's particularly useful for handling user inputs that might contain common misspellings, synonym variations, or irregular formatting.

## Utility Functions

### `datetime`

Provides utility functions for working with dates.

```typescript
const datetime = {
  parseText(text: string): Date | null;
  addDays(date: Date, days: number): Date;
  addWeeks(date: Date, weeks: number): Date;
  addMonths(date: Date, months: number): Date;
  addYears(date: Date, years: number): Date;
  // Additional date manipulation utilities
}
```

**Example:**

```typescript
import { datetime } from 'helios-js';

// Parse a date from text
const date = datetime.parseText("next Friday");

// Add time units
const nextWeek = datetime.addWeeks(new Date(), 1);
const nextMonth = datetime.addMonths(new Date(), 1);
```

### `asWeekdays`

Converts day strings to RRule weekday constants.

```typescript
function asWeekdays(days: string[]): RRule.Weekday[]
```

**Parameters:**

- `days`: Array of day strings ("monday", "tuesday", etc.) (required)

**Returns:**

Array of RRule weekday constants (RRule.MO, RRule.TU, etc.).

**Example:**

```typescript
import { asWeekdays } from 'helios-js';
import { RRule } from 'rrule';

// Convert day names to RRule weekday constants
const weekdays = asWeekdays(["monday", "wednesday", "friday"]);
// Returns: [RRule.MO, RRule.WE, RRule.FR]

// Use in RRule options
const options = {
  freq: RRule.WEEKLY,
  byweekday: weekdays
};
```

## Interfaces

### `RecurrenceProcessorOptions`

```typescript
interface RecurrenceProcessorOptions {
  /**
   * Whether to use cached results
   * Default: true
   */
  useCache?: boolean;
  
  /**
   * Force specific pattern handlers to be used (by name)
   * Example: ['frequency', 'dayOfWeek']
   */
  forceHandlers?: string[];
  
  /**
   * Default options to apply to the result
   */
  defaults?: Partial<RecurrenceOptions>;
  
  /**
   * Whether to correct misspellings in the input pattern
   * Default: true
   */
  correctMisspellings?: boolean;
}
```

### `NormalizerOptions`

```typescript
interface NormalizerOptions {
  /**
   * Whether to convert text to lowercase.
   * Default: true
   */
  lowercase?: boolean;
  
  /**
   * Whether to normalize whitespace.
   * Default: true
   */
  normalizeWhitespace?: boolean;
  
  /**
   * Whether to trim leading and trailing whitespace.
   * Default: true
   */
  trim?: boolean;
  
  /**
   * Whether to preserve ordinal suffixes (1st, 2nd, etc.).
   * Default: false (removes suffixes by default)
   */
  preserveOrdinalSuffixes?: boolean;
  
  /**
   * Whether to normalize day names (e.g., "Mondays" to "monday").
   * Default: true
   */
  normalizeDayNames?: boolean;
  
  /**
   * Whether to apply synonym replacement.
   * Default: true
   */
  applySynonyms?: boolean;
  
  /**
   * Whether to handle common misspellings.
   * Default: true
   */
  correctMisspellings?: boolean;
  
  /**
   * Whether to normalize punctuation.
   * Default: true
   */
  normalizePunctuation?: boolean;
  
  /**
   * The fuzzy matching threshold for spell correction.
   * Higher values require closer matches (0.0 to 1.0).
   * Default: 0.85
   */
  spellingCorrectionThreshold?: number;
}
```

### `ValidationResult`

```typescript
interface ValidationResult {
  /**
   * Whether the pattern is valid
   */
  valid: boolean;
  
  /**
   * Confidence score (0.0 to 1.0) indicating how confident the system is
   * in its interpretation of the pattern
   */
  confidence: number;
  
  /**
   * Array of warnings or error messages
   */
  warnings: string[];
}
```

### `MinimalRRuleOptions`

```typescript
interface MinimalRRuleOptions {
  /**
   * The frequency of the recurrence (DAILY, WEEKLY, etc.)
   */
  freq: Frequency;
  
  /**
   * Start date for the recurrence
   */
  dtstart?: Date;
  
  /**
   * Interval between occurrences (e.g., 1 for every occurrence, 2 for every other)
   */
  interval?: number;
  
  /**
   * Additional RRule properties that may be set
   */
  [key: string]: any;
}
```

## Configuration

### Pattern Handlers

Helios-JS uses these pattern handlers by default, applied in priority order:

1. `frequencyPatternHandler`: Recognizes basic frequency terms like "daily", "weekly"
2. `intervalPatternHandler`: Recognizes interval patterns like "every 2 weeks"
3. `dayOfWeekPatternHandler`: Recognizes day-based patterns like "every Monday"
4. `dayOfMonthPatternHandler`: Recognizes month day patterns like "1st of the month"
5. `untilDatePatternHandler`: Recognizes end date specifications like "until December 31st"

### Default Configuration

The default processor options are:

```typescript
const defaultOptions: RecurrenceProcessorOptions = {
  useCache: true,            // Use pattern cache
  correctMisspellings: true, // Auto-correct misspellings
  forceHandlers: undefined,  // Use all pattern handlers
  defaults: undefined        // No default values
};
```

### Default Normalizer Options

The default options for the normalizer are:

```typescript
const defaultOptions: NormalizerOptions = {
  lowercase: true,
  normalizeWhitespace: true,
  trim: true,
  preserveOrdinalSuffixes: false,
  normalizeDayNames: true,
  applySynonyms: true,
  correctMisspellings: true,
  normalizePunctuation: true,
  spellingCorrectionThreshold: 0.85
};
```

## Customizing Pattern Recognition

You can configure the recurrence processor with custom options:

```typescript
// Configuration example with available options
import { createRRule } from 'helios-js';

const config = {
  // Whether to use cached results (default: true)
  useCache: true,
  
  // Only apply specific pattern handlers
  forceHandlers: ['frequency', 'dayOfWeek'],
  
  // Set default values for the result
  defaults: { count: 10 },
  
  // Disable misspelling correction (default: true)
  correctMisspellings: false
};

const rule = createRRule(new Date(), "every monday", config);
```

## Error Handling

Helios-JS provides detailed warnings and error messages:

```typescript
try {
  const options = naturalLanguageToRRule(new Date(), "every mon and fridays");
  
  // Check if options is not null
  if (options) {
    // Check for warnings even on successful parsing
    if (options.warnings && options.warnings.length > 0) {
      console.warn("Warnings:", options.warnings);
    }
    
    // Check confidence of match
    if (options.confidence && options.confidence < 0.7) {
      console.warn("Low confidence match:", options.confidence);
    }
  } else {
    console.warn("Couldn't process the pattern");
  }
} catch (error) {
  console.error("Failed to parse pattern:", error.message);
}
```

## Type Definitions

For TypeScript users, Helios-JS exports these type definitions:

```typescript
// Re-exported from RRule
export type { Options as RRuleOptions } from 'rrule';

// Internal types
export type { 
  RecurrenceProcessorOptions,
  NormalizerOptions,
  ValidationResult,
  RecurrenceOptions
};
```

## Dependency on RRule

Helios-JS is designed to work with the RRule library. It transforms natural language into RRule options, which can then be used to create RRule instances.

```typescript
import { naturalLanguageToRRule } from 'helios-js';
import { RRule } from 'rrule';

const options = naturalLanguageToRRule(new Date(), "every monday");
if (options) {
  const rule = new RRule(options);
  console.log("Next occurrence:", rule.after(new Date()));
}
```

For full documentation on what you can do with the resulting RRule object, see the [RRule documentation](https://github.com/jakubroztocil/rrule). 