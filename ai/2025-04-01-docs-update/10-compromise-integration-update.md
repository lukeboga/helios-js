# Draft: Updates for `compromise-integration.md`

This document outlines the necessary updates to the `docs/compromise-integration.md` file, specifically focusing on modernizing the misspelling correction section to align with our enhancement plan.

## Change Log to Add

```
> **Change Log**:  
> - [April 2025]: Updated misspelling correction section with current implementation details
> - [April 2025]: Added pattern handler modernization information
> - [April 2025]: Updated code examples to use modern pattern handling approach
```

## Misspelling Correction Section Updates

The current misspelling correction section describes a dictionary-based approach with fuzzy matching. Based on the modernization plan, we should update this section to reflect the current implementation and future direction.

### Current Content (to be updated)

```markdown
## Misspelling Correction

The Helios system includes robust misspelling correction capabilities, allowing it to recognize and process natural language patterns even when they contain common spelling errors. This feature is particularly important for handling user input, which often contains typos or spelling variations.

### How Misspelling Correction Works

1. **Pre-processing Pipeline**: Before text is processed by CompromiseJS, it goes through a normalization pipeline that includes misspelling correction.

2. **Dictionary-based Approach**: We maintain comprehensive dictionaries of common misspellings for:
   - Day names (e.g., "mondey" → "monday", "tuseday" → "tuesday")
   - Month names (e.g., "janurary" → "january", "feburary" → "february")
   - Frequency terms (e.g., "dayly" → "daily", "wekly" → "weekly")
   - Special pattern words (e.g., "evrey" → "every", "weekdys" → "weekday")
   - Interval terms (e.g., "bi-weekley" → "bi-weekly", "fortnightley" → "fortnightly")
   - Other calendar-related terminology

3. **Fuzzy Matching**: For words not explicitly in our dictionaries, we use the `fastest-levenshtein` library to perform fuzzy matching, with dynamic thresholds based on word length.

### Supported Misspelling Patterns

The system can effectively handle:

- Day name misspellings: "mondey", "tuseday", "wednessday", etc.
- Month name misspellings: "janurary", "feburary", "septembr", etc.
- Frequency term misspellings: "dayly", "wekly", "monthy", "yeerly", etc.
- Special term misspellings: "evry", "eech", "untill", etc.
- Combined patterns with multiple misspellings: "evrey weekdys", "last friady of eech month", etc.

### Adding New Misspellings

When you encounter common misspellings that aren't handled correctly:

1. Add them to the appropriate dictionary in `src/constants.ts`:
   - `DAY_NAME_VARIANTS` for day misspellings
   - `MONTH_NAME_VARIANTS` for month misspellings
   - `TERM_SYNONYMS` for other term misspellings

2. Follow the existing pattern format:
   ```typescript
   'misspelling': DAYS.CORRECT_DAY,
   // or
   'misspelling': 'correct term',
   ```

3. Run the misspelling correction tests to verify your additions:
   ```
   npm run test:misspellings
   ```

By continuously expanding our misspelling dictionaries, we can improve the system's ability to understand natural language inputs. 
```

### Updated Content

```markdown
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
```

## Pattern Handler Modernization Section Addition

We should also add a new section about the pattern handler modernization to guide contributors:

```markdown
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
    options.freq = RRule.WEEKLY;
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

For comprehensive details on creating pattern handlers, see the [Contributing Guide](./development/contributing-guide.md#pattern-handler-development).
```

## Other Updates

The rest of the document appears to be generally accurate, though we should:

1. Update the reference to the contribution guide to point to the new merged guide:
   - Change `For more details on contributing pattern handlers, see the [Contribution Guide](./contribution-guide.md).`
   - To `For more details on contributing pattern handlers, see the [Contributing Guide](./development/contributing-guide.md#pattern-handler-development).`

2. Update any code examples to use the current API signatures with `RecurrenceProcessorOptions` instead of any outdated configuration types.

3. Add information about CompromiseJS plugins and custom tags if relevant to the modernization plan.

## Implementation Plan

1. Create a draft of the updated document with all changes applied
2. Review for consistency with other documentation
3. Update the file at `/docs/compromise-integration.md`
4. Update the progress tracking table in the implementation approach document 