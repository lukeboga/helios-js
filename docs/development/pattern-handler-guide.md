# Pattern Handler Guide

This guide explains how pattern handlers work in Helios-JS and provides detailed instructions for creating custom pattern handlers. Whether you're extending the library with new pattern types or troubleshooting existing pattern recognition, this guide will help you understand the pattern handling system.

## What is a Pattern Handler?

A pattern handler is a specialized component responsible for recognizing a specific type of natural language pattern and transforming it into structured RRule options. Each handler focuses on a particular pattern category, such as frequency patterns ("daily", "weekly"), interval patterns ("every 2 weeks"), or day patterns ("every Monday").

Pattern handlers are the core of Helios-JS's pattern recognition system. They work together to transform a wide variety of natural language inputs into structured recurrence rules.

## Pattern Handler Interface

All pattern handlers implement the `PatternHandler` interface:

```typescript
interface PatternHandler {
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
```

## Pattern Result Structure

When a pattern handler recognizes a pattern, it returns a `PatternResult` object:

```typescript
interface PatternResult {
  /**
   * The recurrence options extracted from the pattern.
   */
  options: RecurrenceOptions;
  
  /**
   * Metadata about the pattern match.
   */
  metadata: PatternMatchMetadata;
}

interface PatternMatchMetadata {
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
```

The `options` field contains the RRule options extracted from the pattern, while the `metadata` field provides information about the match for debugging and pattern combination.

## Built-in Pattern Handlers

Helios-JS includes several built-in pattern handlers, each responsible for a specific pattern category:

1. **intervalPatternHandler**: Recognizes patterns with explicit intervals (e.g., "every 2 weeks")
2. **frequencyPatternHandler**: Recognizes basic frequency terms (e.g., "daily", "weekly")
3. **dayOfWeekPatternHandler**: Recognizes day-based patterns (e.g., "every Monday", "every weekday")
4. **dayOfMonthPatternHandler**: Recognizes month day patterns (e.g., "1st of the month")
5. **untilDatePatternHandler**: Recognizes end date specifications (e.g., "until December 31st")

These handlers are applied in priority order, with higher priority handlers processing first.

## How Pattern Handlers Work

### The `apply` Method

The core of each pattern handler is the `apply` method, which follows this general structure:

```typescript
apply(input: string): PatternResult | null {
  // 1. Check if the input matches this pattern type
  // 2. Extract relevant components from the match
  // 3. Transform extracted components into RRule options
  // 4. Return a PatternResult object with options and metadata
  // 5. Return null if the pattern doesn't match
}
```

Let's examine a simplified version of the frequency pattern handler to understand how this works:

```typescript
apply(input: string): PatternResult | null {
  // Look for basic frequency terms
  if (input === 'daily') {
    // Create recurrence options
    const options: RecurrenceOptions = {
      freq: RRule.DAILY,
      interval: 1,
      byweekday: null,
      bymonthday: null,
      bymonth: null
    };
    
    // Set the properties that were explicitly defined
    const setProperties = new Set<keyof RecurrenceOptions>(['freq', 'interval']);
    
    // Return the pattern result
    return {
      options,
      metadata: {
        patternName: this.name,
        category: this.category,
        matchedText: input,
        confidence: 1.0, // High confidence for exact match
        isPartial: false,
        setProperties
      }
    };
  }
  
  // Similar checks for weekly, monthly, yearly...
  
  // Return null if no pattern matched
  return null;
}
```

### Pattern Recognition Techniques

Pattern handlers use various techniques to recognize patterns:

1. **Direct String Matching**: For simple terms like "daily", "weekly"
2. **Regular Expressions**: For more complex patterns like "every 2 weeks"
3. **String Manipulation**: For extracting components from matched patterns
4. **Fuzzy Matching**: For handling slight variations and misspellings

Here's an example of using regular expressions in the interval pattern handler:

```typescript
apply(input: string): PatternResult | null {
  // Match patterns like "every 2 weeks"
  const intervalRegex = /every\s+(\d+)\s+(day|week|month|year)s?/i;
  const match = input.match(intervalRegex);
  
  if (match) {
    const interval = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();
    
    // Determine frequency based on unit
    let freq: Frequency;
    switch (unit) {
      case 'day': freq = RRule.DAILY; break;
      case 'week': freq = RRule.WEEKLY; break;
      case 'month': freq = RRule.MONTHLY; break;
      case 'year': freq = RRule.YEARLY; break;
      default: return null; // Shouldn't happen, but just in case
    }
    
    // Create recurrence options
    const options: RecurrenceOptions = {
      freq,
      interval,
      byweekday: null,
      bymonthday: null,
      bymonth: null
    };
    
    // Set the properties that were explicitly defined
    const setProperties = new Set<keyof RecurrenceOptions>(['freq', 'interval']);
    
    // Return the pattern result
    return {
      options,
      metadata: {
        patternName: this.name,
        category: this.category,
        matchedText: input,
        confidence: 0.9, // High confidence for regex match
        isPartial: false,
        setProperties
      }
    };
  }
  
  // Return null if no pattern matched
  return null;
}
```

## Creating Custom Pattern Handlers

Now that you understand how pattern handlers work, let's create a custom pattern handler step by step.

### Step 1: Define the Pattern Types

First, identify the patterns you want to recognize. For this example, let's create a handler for time-of-day patterns like "at 3pm", "at noon", etc.

### Step 2: Create a New Pattern Handler Class

```typescript
import { PatternHandler, PatternResult, RecurrenceOptions } from 'helios-js';
import { RRule } from 'rrule';
import { PATTERN_CATEGORIES, PATTERN_PRIORITY } from 'helios-js/constants';

export const timeOfDayPatternHandler: PatternHandler = {
  name: 'timeOfDayPattern',
  category: PATTERN_CATEGORIES.TIME,
  priority: PATTERN_PRIORITY.TIME,
  
  apply(input: string): PatternResult | null {
    // Define regex patterns for time expressions
    const timeRegex = /\bat\s+((\d{1,2})(?::(\d{2}))?\s*(am|pm)|noon|midnight)\b/i;
    const match = input.match(timeRegex);
    
    if (!match) {
      return null; // No match found
    }
    
    let hour = 0;
    let minute = 0;
    
    // Parse the time expression
    const timeExpr = match[1].toLowerCase();
    if (timeExpr === 'noon') {
      hour = 12;
    } else if (timeExpr === 'midnight') {
      hour = 0;
    } else {
      hour = parseInt(match[2], 10);
      if (match[3]) {
        minute = parseInt(match[3], 10);
      }
      
      // Handle am/pm
      const period = match[4].toLowerCase();
      if (period === 'pm' && hour < 12) {
        hour += 12;
      } else if (period === 'am' && hour === 12) {
        hour = 0;
      }
    }
    
    // Create recurrence options
    const options: RecurrenceOptions = {
      freq: null, // Don't set frequency - this will be combined with other patterns
      interval: 1,
      byweekday: null,
      bymonthday: null,
      bymonth: null,
      byhour: [hour],
      byminute: [minute]
    };
    
    // Set the properties that were explicitly defined
    const setProperties = new Set<keyof RecurrenceOptions>(['byhour', 'byminute']);
    
    // Return the pattern result
    return {
      options,
      metadata: {
        patternName: this.name,
        category: this.category,
        matchedText: match[0],
        confidence: 0.9,
        isPartial: true, // This is a partial match that should be combined with others
        setProperties
      }
    };
  }
};
```

### Step 3: Register the Pattern Handler

To use your custom pattern handler, you need to register it with the transformer:

```typescript
import { naturalLanguageToRRule, patternHandlers } from 'helios-js';
import { timeOfDayPatternHandler } from './timeOfDayPattern';

// Use custom handler along with built-in handlers
const options = naturalLanguageToRRule(new Date(), "every monday at 3pm", {
  handlers: [...patternHandlers, timeOfDayPatternHandler]
});
```

Or, you can create a custom configuration that includes your handler:

```typescript
import { createRRule, patternHandlers } from 'helios-js';
import { timeOfDayPatternHandler } from './timeOfDayPattern';

// Create a custom configuration
const config = {
  handlers: [...patternHandlers, timeOfDayPatternHandler]
};

// Use the custom configuration
const rule = createRRule(new Date(), "every monday at 3pm", config);
```

## Advanced Pattern Handler Techniques

### Confidence Scoring

Confidence scoring helps the system evaluate how certain it is about a pattern match. Use these guidelines:

- **1.0**: Perfect, unambiguous match (e.g., "daily" exactly matches a frequency pattern)
- **0.9**: Strong match with minor parsing involved (e.g., "every 2 weeks" requires number parsing)
- **0.8**: Good match with more complex parsing (e.g., "every monday and friday" requires day parsing)
- **0.7**: Reasonable match with some uncertainty (e.g., "biweekly" which could mean twice per week or every two weeks)
- **0.6 and below**: Matches with significant uncertainty or ambiguity

Example of confidence scoring:

```typescript
// Direct match: highest confidence
if (input === 'daily') {
  return createResult(RRule.DAILY, 1.0);
}

// Pattern match: high confidence
const match = input.match(/every\s+(\d+)\s+weeks?/i);
if (match) {
  const interval = parseInt(match[1], 10);
  return createResult(RRule.WEEKLY, interval, 0.9);
}

// Ambiguous match: lower confidence
if (input.includes('biweekly')) {
  // Assume every 2 weeks, but flag as less certain
  return createResult(RRule.WEEKLY, 2, 0.7, ['Ambiguous term "biweekly" interpreted as "every 2 weeks"']);
}
```

### Handling Partial Matches

Many patterns are meant to be combined with others. Mark these as partial matches:

```typescript
return {
  options,
  metadata: {
    // ...other metadata
    isPartial: true, // This pattern should be combined with others
    setProperties: new Set(['byhour', 'byminute'])
  }
};
```

### Warning Generation

Include warnings when a pattern is ambiguous or might be misinterpreted:

```typescript
apply(input: string): PatternResult | null {
  // ...pattern matching logic
  
  // Create warnings array for ambiguous patterns
  const warnings: string[] = [];
  
  if (input.includes('biweekly')) {
    warnings.push('The term "biweekly" is ambiguous and has been interpreted as "every 2 weeks".');
  }
  
  // Return result with warnings
  return {
    options,
    metadata: {
      // ...other metadata
      warnings
    }
  };
}
```

### Property Tracking

Track which properties are set by your pattern handler to help with pattern combination:

```typescript
const options: RecurrenceOptions = {
  freq: RRule.WEEKLY,
  interval: 2,
  byweekday: [RRule.MO, RRule.FR],
  bymonthday: null,
  bymonth: null
};

// Track the properties that were explicitly set
const setProperties = new Set<keyof RecurrenceOptions>([
  'freq', 
  'interval', 
  'byweekday'
]);
```

## Pattern Handler Best Practices

1. **Focus on One Pattern Category**: Each handler should focus on a specific pattern type.

2. **Prioritize Correctly**: Set the appropriate priority for your handler based on its pattern type.

3. **Normalize Input**: Always assume the input has been normalized.

4. **Use Regular Expressions Carefully**: Make regex patterns precise but not overly strict.

5. **Handle Edge Cases**: Consider plural forms, variations, and potential ambiguities.

6. **Provide Good Metadata**: Include confidence scores, clear names, and useful warnings.

7. **Track Properties**: Always track which properties your handler sets.

8. **Document Patterns**: Document the patterns your handler recognizes.

## Debugging Pattern Handlers

When developing or troubleshooting pattern handlers, these techniques can help:

### 1. Test Individual Handlers

Test your handler directly to see if it recognizes a pattern:

```typescript
// Test a specific handler
const result = yourPatternHandler.apply("pattern to test");
console.log(result);
```

### 2. Log Normalized Input

Make sure the input is normalized as expected:

```typescript
import { normalizeInput } from 'helios-js';

const normalized = normalizeInput("Your pattern here");
console.log("Normalized:", normalized);
```

### 3. Use Debug Configuration

Create a configuration that logs the transformation process:

```typescript
const config = {
  config: {
    debug: {
      enabled: true,
      logLevel: 'debug',
      detailedResults: true
    }
  }
};

const options = naturalLanguageToRRule(new Date(), "pattern to test", config);
```

### 4. Check Pattern Result

Examine the pattern result to understand what was recognized:

```typescript
const options = naturalLanguageToRRule(new Date(), "pattern to test");
console.log("Matched patterns:", options.matchedPatterns);
console.log("Confidence:", options.confidence);
console.log("Warnings:", options.warnings);
```

## Example: Month Name Pattern Handler

Here's a complete example of a custom pattern handler that recognizes month names like "in January", "during February", etc.:

```typescript
import { PatternHandler, PatternResult, RecurrenceOptions } from 'helios-js';
import { RRule } from 'rrule';
import { PATTERN_CATEGORIES, PATTERN_PRIORITY, MONTHS } from 'helios-js/constants';

export const monthNamePatternHandler: PatternHandler = {
  name: 'monthNamePattern',
  category: PATTERN_CATEGORIES.MONTH,
  priority: PATTERN_PRIORITY.MONTH,
  
  apply(input: string): PatternResult | null {
    // Define regex for month name patterns
    const monthRegex = /\b(in|during)\s+(january|february|march|april|may|june|july|august|september|october|november|december)\b/i;
    const match = input.match(monthRegex);
    
    if (!match) {
      return null; // No match found
    }
    
    // Get the month name from the match
    const monthName = match[2].toLowerCase();
    
    // Map month name to month number (1-12)
    let monthNumber = 0;
    const monthEntries = Object.entries(MONTHS);
    for (const [key, value] of monthEntries) {
      if (value === monthName) {
        // Extract month number from month entries
        // MONTHS.JANUARY -> 1, MONTHS.FEBRUARY -> 2, etc.
        monthNumber = monthEntries.findIndex(([k, v]) => k === key) % 12 + 1;
        break;
      }
    }
    
    // If monthNumber is still 0, no valid month was found
    if (monthNumber === 0) {
      return null;
    }
    
    // Create recurrence options
    const options: RecurrenceOptions = {
      freq: null, // Don't set frequency - this will be combined with other patterns
      interval: 1,
      byweekday: null,
      bymonthday: null,
      bymonth: [monthNumber]
    };
    
    // Set the properties that were explicitly defined
    const setProperties = new Set<keyof RecurrenceOptions>(['bymonth']);
    
    // Return the pattern result
    return {
      options,
      metadata: {
        patternName: this.name,
        category: this.category,
        matchedText: match[0],
        confidence: 0.9,
        isPartial: true, // This is a partial match that should be combined with others
        setProperties
      }
    };
  }
};
```

## Conclusion

Pattern handlers are the heart of Helios-JS's natural language processing capabilities. By understanding how they work and how to create custom handlers, you can extend the library to recognize new pattern types and tailor it to your specific needs.

Whether you're adding support for time-of-day patterns, specific month patterns, or any other recurrence rule aspect, the pattern handler system provides a flexible and powerful framework for natural language processing. 