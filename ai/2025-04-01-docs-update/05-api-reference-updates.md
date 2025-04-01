# Draft Updates for `api-reference.md`

This document contains the draft updates for `docs/development/api-reference.md` based on our assessment. Each section includes the original content followed by the updated content, with explanations of significant changes.

## Change Log Format For Final Document

```
# API Reference

> **Change Log**:  
> - [Date]: Updated return type definitions for `naturalLanguageToRRule`
> - [Date]: Corrected parameter types from `TransformerConfig` to `RecurrenceProcessorOptions`
> - [Date]: Updated interface definitions to match implementation
> - [Date]: Revised configuration options documentation
> - [Date]: Updated code examples for accuracy
```

## 1. Core Functions - `naturalLanguageToRRule`

### Original Content

```typescript
function naturalLanguageToRRule(
  startDate: Date,
  recurrencePattern: string,
  config?: Partial<TransformerConfig>
): RRuleOptions & TransformationResult
```

**Parameters:**

- `startDate`: The start date for the recurrence pattern (required)
- `recurrencePattern`: Natural language description (e.g., "every 2 weeks") (required)
- `config`: Optional configuration for the transformation process

**Returns:**

An object containing RRule options and transformation metadata.

### Updated Content

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

> **Explanation of Change**: Updated return type from `RRuleOptions & TransformationResult` to `MinimalRRuleOptions | null` to match the actual implementation. Updated parameter type from `TransformerConfig` to `RecurrenceProcessorOptions`. Simplified the return description to be more accurate.

## 2. Core Functions - `createRRule`

### Original Content

```typescript
function createRRule(
  startDate: Date,
  recurrencePattern: string,
  config?: Partial<TransformerConfig>
): RRule
```

**Parameters:**

- `startDate`: The start date for the recurrence pattern (required)
- `recurrencePattern`: Natural language description (e.g., "every Monday") (required)
- `config`: Optional configuration for the transformation process

### Updated Content

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

> **Explanation of Change**: Updated parameter type from `TransformerConfig` to `RecurrenceProcessorOptions`. Added explicit return type documentation showing that the function can return `null`. Updated parameter description to use consistent terminology.

## 3. Core Functions - `validatePattern`

### Original Content

```typescript
function validatePattern(
  pattern: string,
  config?: Partial<TransformerConfig>
): ValidationResult
```

**Parameters:**

- `pattern`: The natural language pattern to validate (required)
- `config`: Optional configuration for the transformation process

**Returns:**

A validation result object with success flag, confidence score, and any warnings.

### Updated Content

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

> **Explanation of Change**: Updated parameter type from `TransformerConfig` to `RecurrenceProcessorOptions`. The return type name remains the same, but its definition needs to be updated (see Interface Updates section).

## 4. Interface Updates - `ValidationResult`

### Original Content

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
  
  /**
   * Array of pattern types that were matched
   */
  matchedPatterns: string[];
}
```

### Updated Content

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

> **Explanation of Change**: Removed the `matchedPatterns` property which doesn't exist in the actual implementation. The ValidationResult interface in the code only includes valid, confidence, and warnings properties.

## 5. Interface Updates - Replace `TransformerConfig` with `RecurrenceProcessorOptions`

### Original Content

```typescript
interface TransformerConfig {
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
```

### Updated Content

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

> **Explanation of Change**: Replaced the `TransformerConfig` interface with `RecurrenceProcessorOptions` to match the actual implementation. The new interface has different properties that reflect the current codebase (useCache, forceHandlers, defaults, correctMisspellings).

## 6. Code Example Updates - `naturalLanguageToRRule` Example

### Original Content

```typescript
import { naturalLanguageToRRule } from 'helios-js';

// Get RRule options for weekly recurrence on Mondays
const options = naturalLanguageToRRule(new Date(), "every monday");

// With end date in the pattern
const optionsWithEnd = naturalLanguageToRRule(
  new Date(), 
  "every monday until December 31, 2023"
);
```

### Updated Content

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

> **Explanation of Change**: Updated the example to check if `options` is not null before using it, since the function can return `null`. Added example code showing how to access properties.

## 7. Code Example Updates - `validatePattern` Example

### Original Content

```typescript
import { validatePattern } from 'helios-js';

// Check if a pattern is valid
const result = validatePattern("every monday and fridays");

if (result.valid) {
  console.log("Pattern is valid with confidence:", result.confidence);
  console.log("Matched patterns:", result.matchedPatterns);
} else {
  console.log("Pattern is invalid:", result.warnings);
}
```

### Updated Content

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

> **Explanation of Change**: Removed the reference to `result.matchedPatterns` which doesn't exist in the actual implementation.

## 8. Re-exported Types Section

### Original Content

```typescript
// Re-exported from RRule
export type { Options as RRuleOptions } from 'rrule';

// Internal types
export type { 
  TransformerConfig,
  NormalizerOptions,
  TransformationResult,
  ValidationResult,
  PatternHandler,
  PatternResult,
  PatternMatchMetadata,
  RecurrenceOptions
};
```

### Updated Content

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

> **Explanation of Change**: Updated to match the actual types exported in the codebase. Replaced `TransformerConfig` with `RecurrenceProcessorOptions` and removed types that aren't actually exported.

## 9. Advanced Configuration Section

### Original Content

The advanced configuration section includes detailed documentation for:
- `matchingMode`, `conflictResolution`, and `patternPriorities` (which aren't exposed in the current API)
- Advanced pattern resolution options
- Complex configuration options that aren't available in the actual implementation

### Updated Content

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

> **Explanation of Change**: Simplified the advanced configuration section to focus only on the options that are actually available in the current implementation: useCache, forceHandlers, defaults, and correctMisspellings. Removed documentation for unavailable features.

## Next Steps

After these updates are reviewed and approved, we will implement them in the actual `api-reference.md` file. We'll make the changes in the following order:

1. Core function signatures and return types
2. Interface definitions
3. Code examples
4. Configuration documentation
5. Re-exported types section

Each change will be carefully verified against the actual codebase to ensure accuracy. 