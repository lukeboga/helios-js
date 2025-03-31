# Normalization Pipeline

This document explains the text normalization process in Helios-JS, which is a crucial preprocessing step before pattern matching. Understanding how normalization works will help you debug pattern recognition issues and extend the library with custom patterns.

## Overview

Text normalization standardizes input text to make pattern recognition more robust and consistent. Without normalization, pattern handlers would need to account for countless text variations, making the system more complex and error-prone.

![Normalization Pipeline](../assets/normalization-pipeline.png)

The normalization pipeline in Helios-JS consists of several stages, each responsible for a specific transformation. These stages work together to convert raw user input into a standardized format ready for pattern matching.

## Normalization Stages

The normalization process applies these transformations in the following order:

### 1. Misspelling Correction

First, the system attempts to correct common misspellings in the input text. This step happens before other transformations to ensure that subsequent steps work with well-formed text.

```typescript
// Example: Correcting misspellings
"evry mondey" → "every monday"
"tusday" → "tuesday"
"bi-weekley" → "bi-weekly"
```

The misspelling correction uses fuzzy matching to identify and correct common errors, particularly in day and month names.

### 2. Whitespace Normalization

Next, the system normalizes whitespace by replacing multiple consecutive spaces with a single space.

```typescript
// Example: Normalizing whitespace
"every   monday" → "every monday"
"monthly  on  the  15th" → "monthly on the 15th"
```

### 3. Trimming

Leading and trailing whitespace is removed from the input.

```typescript
// Example: Trimming whitespace
"  every monday  " → "every monday"
```

### 4. Ordinal Suffix Removal

Unless specifically configured to preserve them, ordinal suffixes (st, nd, rd, th) are removed from numbers to standardize numeric values.

```typescript
// Example: Removing ordinal suffixes
"1st of the month" → "1 of the month"
"every 2nd week" → "every 2 week"
```

### 5. Day Name Normalization

Day names are standardized to their singular, lowercase form. This handles plural forms like "Mondays" and uppercase variants.

```typescript
// Example: Normalizing day names
"Mondays and Fridays" → "monday and friday"
"Every Saturday" → "Every saturday"
```

### 6. Synonym Replacement

Common synonyms and alternative expressions are replaced with their canonical forms. This step standardizes terminology and handles special terms.

```typescript
// Example: Replacing synonyms
"bi-weekly" → "every 2 weeks"
"fortnightly" → "every 2 weeks"
"each day" → "every day"
"all weekdays" → "every weekday"
```

### 7. Case Normalization

Text is converted to lowercase to enable case-insensitive matching. This step happens after the corrections to preserve case sensitivity during the correction phases.

```typescript
// Example: Converting to lowercase
"Every Monday" → "every monday"
"Monthly On The 15th" → "monthly on the 15th"
```

### 8. Punctuation Normalization

Finally, punctuation is normalized by replacing or removing certain punctuation marks that might interfere with pattern matching.

```typescript
// Example: Normalizing punctuation
"monday, wednesday, and friday" → "monday wednesday and friday"
"every other week; until December" → "every other week until december"
```

## The `normalizeInput` Function

The normalization process is implemented in the `normalizeInput` function, which can be configured with options to customize its behavior:

```typescript
export function normalizeInput(input: string, options?: Partial<NormalizerOptions>): string {
  // Merge provided options with defaults
  const opts = { ...defaultOptions, ...options };
  
  let normalized = input;
  
  // FIRST: Correct common misspellings if enabled
  if (opts.correctMisspellings) {
    normalized = correctMisspellings(normalized, opts.spellingCorrectionThreshold);
  }
  
  // Normalize whitespace if enabled
  if (opts.normalizeWhitespace) {
    normalized = normalized.replace(/\s+/g, ' ');
  }
  
  // Trim whitespace if enabled
  if (opts.trim) {
    normalized = normalized.trim();
  }
  
  // Remove ordinal suffixes unless preserveOrdinalSuffixes is true
  if (!opts.preserveOrdinalSuffixes) {
    normalized = normalized.replace(/(\d+)(st|nd|rd|th)\b/g, '$1');
  }
  
  // Normalize day names if enabled
  if (opts.normalizeDayNames) {
    normalized = normalizeDayNames(normalized);
  }
  
  // Apply synonym replacement if enabled
  if (opts.applySynonyms) {
    normalized = applyTermSynonyms(normalized);
  }
  
  // Convert to lowercase if enabled - do this AFTER corrections
  if (opts.lowercase) {
    normalized = normalized.toLowerCase();
  }
  
  // Normalize punctuation if enabled
  if (opts.normalizePunctuation) {
    normalized = normalizePunctuation(normalized);
  }
  
  return normalized;
}
```

## Normalization Options

The normalization process can be customized using the `NormalizerOptions` interface:

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

### Default Options

By default, Helios-JS uses these normalization options:

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

## Key Components of the Normalization Pipeline

### Misspelling Correction (`correctMisspellings`)

This function uses fuzzy matching to correct common misspellings, particularly focusing on day and month names.

```typescript
function correctMisspellings(input: string, threshold = 0.85): string {
  // First, try direct lookup in our variants mapping
  let result = input;
  
  // Split the input into words
  const words = input.split(/\s+/);
  
  // Check each word against our known variants
  for (let i = 0; i < words.length; i++) {
    const word = words[i].toLowerCase();
    
    // Check for day name variants
    if (DAY_NAME_VARIANTS[word]) {
      words[i] = DAY_NAME_VARIANTS[word];
      continue;
    }
    
    // Check for month name variants
    if (MONTH_NAME_VARIANTS[word]) {
      words[i] = MONTH_NAME_VARIANTS[word];
      continue;
    }
    
    // If no direct match, try fuzzy matching
    // [Implementation details omitted for brevity]
  }
  
  return words.join(' ');
}
```

### Day Name Normalization (`normalizeDayNames`)

This function standardizes day names to their singular, lowercase form.

```typescript
export function normalizeDayNames(input: string): string {
  return input
    // Convert plural days to singular (mondays -> monday)
    .replace(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)s\b/gi,
      (match) => match.slice(0, -1))
    // Handle capitalized day names (Monday -> monday)
    .replace(/\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/g,
      (match) => match.toLowerCase());
}
```

### Synonym Replacement (`applyTermSynonyms`)

This function replaces common synonyms and alternative expressions with their canonical forms.

```typescript
export function applyTermSynonyms(input: string): string {
  let result = input;
  
  // Apply synonyms from longest to shortest to avoid partial matches
  const synonyms = Object.entries(TERM_SYNONYMS)
    .sort(([a], [b]) => b.length - a.length);
  
  for (const [term, replacement] of synonyms) {
    // Use word boundary to avoid partial matches
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    result = result.replace(regex, replacement);
  }
  
  return result;
}
```

### Punctuation Normalization (`normalizePunctuation`)

This function standardizes punctuation by replacing or removing certain marks.

```typescript
export function normalizePunctuation(input: string): string {
  return input
    // Replace semicolons with spaces
    .replace(/;/g, ' ')
    // Replace commas not used in numbers with spaces
    .replace(/,(?!\d)/g, ' ')
    // Replace multiple consecutive spaces with a single space
    .replace(/\s+/g, ' ')
    // Trim again to handle any leading/trailing spaces added by replacements
    .trim();
}
```

## Comprehensive Normalization

For convenience, Helios-JS also provides a `comprehensiveNormalize` function that applies all normalization steps with default options:

```typescript
export function comprehensiveNormalize(input: string): string {
  return normalizeInput(input, defaultOptions);
}
```

## Pattern Segmentation

After normalization, complex patterns can be split into segments for more focused analysis using the `splitPatternSegments` function:

```typescript
export function splitPatternSegments(input: string): string[] {
  // Common delimiters in recurrence patterns
  const delimiters = [' on ', ' starting ', ' until ', ' from ', ' ending ', ' beginning ', ' at '];

  let segments: string[] = [input];

  // Split by each delimiter while preserving the delimiter with the second segment
  delimiters.forEach(delimiter => {
    const newSegments: string[] = [];

    segments.forEach(segment => {
      const parts = segment.split(new RegExp(`(${delimiter})`, 'i'));

      if (parts.length > 1) {
        // Add first part as a segment
        newSegments.push(parts[0]);

        // Join the rest with the delimiter
        newSegments.push(
          parts.slice(1).join('')
        );
      } else {
        newSegments.push(segment);
      }
    });

    segments = newSegments;
  });

  // Filter out empty segments and trim each segment
  return segments
    .filter(segment => segment.trim().length > 0)
    .map(segment => segment.trim());
}
```

## Custom Normalization

You can customize the normalization process in several ways:

### 1. Configuring the Normalizer

You can provide custom options when calling `normalizeInput`:

```typescript
import { normalizeInput } from 'helios-js';

// Preserve ordinal suffixes
const normalized = normalizeInput("Every 2nd Week", {
  preserveOrdinalSuffixes: true
});
// Returns: "every 2nd week"

// Disable misspelling correction
const noCorrection = normalizeInput("evry mondey", {
  correctMisspellings: false
});
// Returns: "evry mondey" (misspellings preserved)
```

### 2. Adding Custom Synonyms

You can extend the synonym mapping with custom terms:

```typescript
import { TERM_SYNONYMS } from 'helios-js';

// Add custom synonyms
const customSynonyms = {
  ...TERM_SYNONYMS,
  'quarterly': 'every 3 months',
  'semi-annually': 'every 6 months'
};

// Use custom synonyms in your configuration
const config = {
  config: {
    matching: {
      synonyms: customSynonyms
    }
  }
};
```

### 3. Adding Custom Day/Month Variants

You can extend the variant mappings with custom spellings:

```typescript
import { DAY_NAME_VARIANTS, MONTH_NAME_VARIANTS } from 'helios-js';

// Add custom day name variants
const customDayVariants = {
  ...DAY_NAME_VARIANTS,
  'mon.': 'monday',
  'tues.': 'tuesday'
};

// Add custom month name variants
const customMonthVariants = {
  ...MONTH_NAME_VARIANTS,
  'sept.': 'september',
  'nov.': 'november'
};
```

## Normalization Tips

1. **Pattern Handler Design**: When designing pattern handlers, always assume normalized input. This simplifies your pattern matching logic.

2. **Debugging Normalization**: If a pattern isn't being recognized, check the normalized form first to ensure it's what you expect:

```typescript
import { normalizeInput } from 'helios-js';

console.log(normalizeInput("Your pattern here"));
```

3. **Preserving Original Text**: If you need to maintain a reference to the original text, store it before normalization:

```typescript
const original = userInput;
const normalized = normalizeInput(userInput);

// Later, you can reference both
console.log(`Original: ${original}`);
console.log(`Normalized: ${normalized}`);
```

4. **Custom Preprocessing**: For specialized applications, you can add custom preprocessing steps before calling `normalizeInput`:

```typescript
function customPreprocess(input: string): string {
  // Your custom preprocessing logic
  return input.replace(/special-term/g, 'replacement');
}

const preprocessed = customPreprocess(userInput);
const normalized = normalizeInput(preprocessed);
```

## Conclusion

The normalization pipeline is a critical component of Helios-JS, transforming raw text input into a standardized format for reliable pattern matching. By understanding how normalization works, you can debug pattern recognition issues, customize the behavior to suit your needs, and extend the library with new pattern handlers that work seamlessly with the rest of the system. 