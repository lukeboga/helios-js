# CompromiseJS Integration for HeliosJS

> **Change Log**:  
> - [April 2025]: Updated misspelling correction section with current implementation details
> - [April 2025]: Added pattern handler modernization information
> - [April 2025]: Updated code examples to use modern pattern handling approach

This document outlines how HeliosJS integrates [CompromiseJS](https://github.com/spencermountain/compromise) for natural language recurrence pattern processing. 

## Overview

HeliosJS uses CompromiseJS to parse natural language date recurrence patterns like "every Monday," "biweekly," or "monthly until December" into structured RRule options. This approach provides:

- Reliable pattern recognition
- Better handling of complex patterns
- Easier maintenance and extensibility
- Improved performance with optimizations

## Usage

The main entry point is the `processRecurrencePattern` function which analyzes natural language patterns and converts them to RRule options:

```typescript
import { processRecurrencePattern } from 'helios-js';
import { RRule } from 'rrule';

// Process a natural language pattern
const options = processRecurrencePattern('every monday and friday');
if (options) {
  // Create an RRule instance
  const rule = new RRule(options);

  // Display the recurrence rule
  console.log(rule.toText());  // "every Monday and Friday"

  // Get next occurrence dates
  const nextDates = rule.all((date) => date.getTime() < Date.now() + 30 * 24 * 60 * 60 * 1000);
  console.log(nextDates);  // Next 30 days of occurrences
}
```

For convenience, you can also use the top-level helpers:

```typescript
import { createRRule } from 'helios-js';

// Create an RRule directly from a pattern
const rule = createRRule(new Date(), 'every monday and friday');
if (rule) {
  console.log(rule.toText());
}
```

## Supported Pattern Types

The implementation supports a wide range of pattern types:

### Frequency Patterns

Simple frequency terms define how often the event occurs:

- `daily`
- `weekly`
- `monthly`
- `yearly` or `annually`
- `every day`
- `every week`
- `every month`
- `every year`

### Interval Patterns

Interval patterns define frequencies with periods greater than 1:

- `every 2 weeks`
- `every 3 days`
- `every other month`
- `biweekly` or `fortnightly`
- `bimonthly`

### Day of Week Patterns

Day of week patterns specify which days of the week events occur:

- `every monday`
- `mondays`
- `mondays and fridays`
- `every weekday`
- `every weekend`

### Day of Month Patterns

Day of month patterns specify which days of the month events occur:

- `1st of each month`
- `on the 15th`
- `on the 1st and 15th of each month`

### End Date Patterns

End date patterns specify when recurrences should end:

- `until december`
- `ending on 12/31/2023`
- `every Tuesday until next month`

## Advanced Usage

### Custom Processing Options

You can customize processing with options:

```typescript
import { processRecurrencePattern } from 'helios-js';

const options = processRecurrencePattern('every monday', {
  // Use cache for repeated patterns
  useCache: true,
  
  // Only apply specific handlers
  forceHandlers: ['frequency', 'dayOfWeek'],
  
  // Default options to apply if not specified in the pattern
  defaults: {
    count: 10  // Limit to 10 occurrences
  }
});
```

### Handling Complex Patterns

The CompromiseJS integration can handle complex combinations of patterns:

```typescript
// Complex pattern with day of week and interval
const weeklyOptions = processRecurrencePattern('every other Monday until December');

// Pattern with multiple days and specific end date
const multiDayOptions = processRecurrencePattern('Mondays and Fridays until end of year');

// Pattern with day of month
const monthlyOptions = processRecurrencePattern('1st and 15th of each month');
```

## Modern Pattern Handler Architecture

HeliosJS is transitioning to a modern pattern handler architecture that emphasizes:

1. **Separation of Concerns**: Splitting pattern matching and processing
2. **Factory-Based Creation**: Standardized creation of pattern handlers
3. **Component Reusability**: Shared matchers and processors
4. **Improved Testability**: Easier unit testing of individual components

### Pattern Handler Components

A modern pattern handler consists of:

1. **Matcher Functions**: Pure functions that identify patterns in text
2. **Processor Function**: Updates recurrence options based on matches
3. **Handler Factory**: Combines matchers and processors

### Example Modern Pattern Handler

```typescript
// src/compromise/patterns/weekend.ts
import { Doc } from 'compromise';
import { RRule } from 'rrule';
import { PatternMatch, RecurrenceOptions } from '../../types';
import { createPatternHandler } from '../utils/handlerFactory';

// 1. Define matcher function
const weekendMatcher = (doc: Doc): PatternMatch | null => {
  const matches = doc.match('(every|on|during) (weekend|weekends)');
  
  if (matches.found) {
    return {
      type: 'weekend',
      value: 'weekend',
      text: matches.text()
    };
  }
  
  return null;
};

// 2. Define processor function
const weekendProcessor = (options: RecurrenceOptions, match: PatternMatch): void => {
  if (match.type === 'weekend') {
    // Set to weekly frequency
    options.freq = RRule.WEEKLY;
    
    // Set to Saturday and Sunday
    options.byweekday = [RRule.SA, RRule.SU];
  }
};

// 3. Create and export the pattern handler
export const weekendPatternHandler = createPatternHandler(
  'weekend',           // Handler name
  [weekendMatcher],    // Array of matchers
  weekendProcessor,    // Processor function
  {
    category: 'dayOfWeek',
    priority: 2
  }
);
```

### Benefits of the Modern Architecture

- **Enhanced Maintainability**: Focused components with single responsibilities
- **Improved Testability**: Test matchers and processors independently
- **Better CompromiseJS Integration**: Direct access to CompromiseJS document object
- **Simplified Extension**: Clear pattern for adding new handlers
- **Type Safety**: Strong typing throughout the pattern handling pipeline

For comprehensive details on creating pattern handlers, see the [Contributing Guide](./contributing-guide.md#pattern-handler-development).

## Performance Considerations

The implementation includes several performance optimizations:

1. **Lazy Initialization**: CompromiseJS is only initialized when needed
2. **Fast Paths**: Simple patterns like "daily" use regex for minimal overhead
3. **Result Caching**: Results are cached to avoid reprocessing identical patterns

## Text Normalization and Misspelling Correction

HeliosJS includes robust text normalization and misspelling correction capabilities to process natural language patterns even when they contain common spelling errors or formatting inconsistencies. This feature is particularly important for handling user input, which often contains typos, spelling variations, or irregular formatting.

### Normalization Process

Text normalization happens through a multi-stage pipeline in `normalizer.ts`:

1. **Basic Normalization**: Converts text to lowercase, normalizes whitespace, and trims the input.
2. **Misspelling Correction**: Applies dictionary-based and fuzzy matching to correct common spelling errors.
3. **Synonym Replacement**: Replaces variations and synonyms with canonical terms.
4. **Format Standardization**: Normalizes punctuation and ordinal suffixes.

### Centralized Pattern Definition

Misspelling corrections and synonyms are defined in centralized pattern registries:

```typescript
// Example of centralized pattern definitions (from src/constants.ts)
export const SPELLING_CORRECTIONS = {
  // Day names
  'mondey': 'monday',
  'tuseday': 'tuesday',
  'wednessday': 'wednesday',
  // ...
  
  // Common terms
  'evry': 'every',
  'eech': 'each',
  'bi-weekley': 'biweekly',
  // ...
};

export const TERM_SYNONYMS = {
  // Frequency synonyms
  'fortnightly': 'every 2 weeks',
  'biweekly': 'every 2 weeks',
  'bimonthly': 'every 2 months',
  // ...
};
```

This centralized approach makes it easier to maintain and extend the correction dictionaries without modifying the core normalization logic.

### Fuzzy Matching Implementation

For words not explicitly in our dictionaries, the system uses a distance-based fuzzy matching algorithm:

```typescript
export function fuzzyCorrect(word: string, dictionary: string[]): string | null {
  // Implementation uses Levenshtein distance with dynamic thresholds
  // based on word length to find the closest match
  
  // Returns the matched word or null if no match above threshold
}
```

### Configuration Options

Text normalization and misspelling correction can be configured through the `NormalizerOptions` interface:

```typescript
interface NormalizerOptions {
  // Whether to convert text to lowercase
  lowercase?: boolean;
  
  // Whether to normalize whitespace
  normalizeWhitespace?: boolean;
  
  // Whether to trim leading/trailing whitespace
  trim?: boolean;
  
  // Whether to apply synonym replacement
  applySynonyms?: boolean;
  
  // Whether to correct misspellings
  correctMisspellings?: boolean;
  
  // Threshold for fuzzy spelling correction (0.0-1.0)
  spellingCorrectionThreshold?: number;
  
  // Additional options...
}
```

### Using Normalization in Custom Pattern Handlers

When creating custom pattern handlers, you can leverage the normalization system to handle variations in input:

```typescript
import { normalizeInput } from 'helios-js';

// In your pattern matcher
const normalizedText = normalizeInput(inputText, {
  correctMisspellings: true,
  applySynonyms: true
});

// Now process the normalized text
```

### Extending the Misspelling Correction

To add new corrections to the system:

1. Identify common misspellings through user feedback or log analysis
2. Add them to the appropriate dictionary in `src/constants/patterns.ts`:
   ```typescript
   export function extendSpellingCorrections(corrections: Record<string, string>) {
     // Add your new corrections here
     Object.assign(SPELLING_CORRECTIONS, corrections);
   }
   ```

3. Validate with appropriate tests:
   ```typescript
   // test/unit/normalizer/misspellings.test.ts
   it('corrects custom misspellings', () => {
     extendSpellingCorrections({
       'custm': 'custom',
       'misspeling': 'misspelling'
     });
     
     expect(normalizeInput('custm misspeling')).toBe('custom misspelling');
   });
   ```

By using this centralized, configurable approach to text normalization, HeliosJS can continually improve its ability to understand natural language inputs while maintaining a clean, maintainable codebase.

## Troubleshooting

If you encounter issues with pattern recognition:

1. Ensure pattern text is clear and unambiguous
2. For complex patterns, try breaking them into simpler components
3. Check the result's `confidence` property; lower values indicate potential issues
4. Remember that `processRecurrencePattern` returns `null` for unrecognized patterns

## Testing Pattern Handlers

The HeliosJS library includes a comprehensive test suite for pattern handlers using Vitest. Tests are located in the `test/unit/compromise` directory and organized by pattern type. 

Each pattern handler has its own set of tests that verify:
- Basic pattern recognition
- Parameter extraction
- Variations of the same pattern
- Edge cases and special formats
- Combinations with other patterns

Debug tests are also available in `test/debug` for more complex scenarios and pattern combinations that need additional debugging.

For detailed information about our testing approach, structure, and best practices, see the [Testing Guide](./testing-guide.md).

When adding new pattern handlers, always include comprehensive tests to ensure your implementation works correctly in isolation and when combined with other patterns. 