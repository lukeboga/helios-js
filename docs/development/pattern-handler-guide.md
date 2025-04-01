# Pattern Handler Guide

> **Change Log**:  
> - [April 2025]: Updated pattern handler interface to match implementation
> - [April 2025]: Updated pattern result structure to match actual PatternHandlerResult
> - [April 2025]: Corrected code examples to use function-based approach
> - [April 2025]: Updated extension guidance for adding new pattern handlers

This guide explains how pattern handlers work in Helios-JS and provides detailed instructions for creating custom pattern handlers. Whether you're extending the library with new pattern types or troubleshooting existing pattern recognition, this guide will help you understand the pattern handling system.

## What is a Pattern Handler?

A pattern handler is a specialized function responsible for recognizing a specific type of natural language pattern and transforming it into structured RRule options. Each handler focuses on a particular pattern category, such as frequency patterns ("daily", "weekly"), interval patterns ("every 2 weeks"), or day patterns ("every Monday").

Pattern handlers are the core of Helios-JS's pattern recognition system. They work together to transform a wide variety of natural language inputs into structured recurrence rules.

## Pattern Handler Interface

All pattern handlers follow this function signature:

```typescript
/**
 * Applies pattern recognition using CompromiseJS
 * 
 * @param doc - CompromiseJS document
 * @param options - Current recurrence options
 * @param config - Optional configuration
 * @returns Pattern handler result
 */
function patternHandler(
  doc: CompromiseDocument,
  options: RecurrenceOptions,
  config?: any
): PatternHandlerResult
```

## Pattern Handler Result Structure

When a pattern handler processes text, it returns a `PatternHandlerResult` object:

```typescript
interface PatternHandlerResult {
  /** Whether the pattern was matched */
  matched: boolean;
  /** Confidence level of the match (0.0-1.0) */
  confidence?: number;
  /** Any warnings during processing */
  warnings?: string[];
}
```

Instead of returning a new object with options, pattern handlers directly modify the `options` object passed to them. The result simply indicates whether a match was found, the confidence level, and any warnings.

## Built-in Pattern Handlers

Helios-JS includes several built-in pattern handlers, each responsible for a specific pattern category:

1. **applyIntervalPatterns**: Recognizes patterns with explicit intervals (e.g., "every 2 weeks")
2. **applyFrequencyPatterns**: Recognizes basic frequency terms (e.g., "daily", "weekly")
3. **applyDayOfWeekPatterns**: Recognizes day-based patterns (e.g., "every Monday", "every weekday")
4. **applyDayOfMonthPatterns**: Recognizes month day patterns (e.g., "1st of the month")
5. **applyUntilDatePatterns**: Recognizes end date specifications (e.g., "until December 31st")

These handlers are applied in a specific order as defined in the processor.

## How Pattern Handlers Work

### The Pattern Handler Function

The core of each pattern handler follows this general structure:

```typescript
function applyPatternType(
  doc: CompromiseDocument,
  options: RecurrenceOptions,
  config?: any
): PatternHandlerResult {
  // Initialize result
  const result: PatternHandlerResult = {
    matched: false,
    confidence: 1.0,
    warnings: []
  };

  // 1. Check if the input matches this pattern type using CompromiseJS
  // 2. Extract relevant components from the match
  // 3. Modify the options object with the extracted data
  // 4. Set result.matched = true if a pattern was recognized
  // 5. Set confidence and warnings as needed

  return result;
}
```

Let's examine a simplified version of the frequency pattern handler:

```typescript
function applyFrequencyPatterns(
  doc: CompromiseDocument,
  options: RecurrenceOptions,
  config?: any
): PatternHandlerResult {
  const result: PatternHandlerResult = {
    matched: false,
    confidence: 1.0,
    warnings: []
  };

  // Simple frequency terms
  const text = doc.text().toLowerCase();
  
  // Check for daily pattern
  if (doc.has('daily') || doc.has('every day') || /each day/i.test(text)) {
    options.freq = RRule.DAILY;
    result.matched = true;
    return result;
  }
  
  // Check for weekly pattern
  if (doc.has('weekly') || doc.has('every week') || /each week/i.test(text)) {
    options.freq = RRule.WEEKLY;
    result.matched = true;
    return result;
  }
  
  // Similar checks for monthly, yearly patterns...
  
  return result;
}
```

### Pattern Recognition Techniques

Pattern handlers use CompromiseJS to recognize patterns:

1. **Text Matching**: Using `doc.has()` to check for specific terms
2. **Regular Expressions**: Using regex patterns for more complex matching
3. **NLP Methods**: Using CompromiseJS's natural language processing features
4. **Text Normalization**: Working with normalized text to handle variations

## Creating Custom Pattern Handlers

Now that you understand how pattern handlers work, let's create a custom pattern handler step by step.

### Step 1: Define the Pattern Types

First, identify the patterns you want to recognize. For this example, let's create a handler for time-of-day patterns like "at 3pm", "at noon", etc.

### Step 2: Create a New Pattern Handler Function

```typescript
import { RRule } from 'rrule';
import type { RecurrenceOptions } from '../../types';
import type { PatternHandlerResult } from '../../processor';
import type { CompromiseDocument } from '../types';

/**
 * Applies time-of-day pattern recognition using CompromiseJS
 * 
 * @param doc - CompromiseJS document
 * @param options - Current recurrence options
 * @param config - Optional configuration
 * @returns Pattern handler result
 */
export function applyTimeOfDayPatterns(
  doc: CompromiseDocument,
  options: RecurrenceOptions,
  config?: any
): PatternHandlerResult {
  const result: PatternHandlerResult = {
    matched: false,
    confidence: 1.0,
    warnings: []
  };

  // Match patterns like "at 3pm", "at noon"
  const timeMatches = doc.match('at #Value (am|pm)');
  
  if (timeMatches.found) {
    // Extract the time value
    const timeValue = timeMatches.match('#Value').text();
    const isPM = timeMatches.has('pm');
    
    // Convert to hour value (0-23)
    let hour = parseInt(timeValue, 10);
    if (isPM && hour < 12) {
      hour += 12;
    } else if (!isPM && hour === 12) {
      hour = 0;
    }
    
    // Update the options
    options.byhour = [hour];
    options.byminute = [0];
    
    // Set result as matched
    result.matched = true;
    
    // Add a warning for ambiguous cases
    if (timeValue === '12' && !isPM) {
      result.warnings.push('Interpreted "12" as noon (12:00 PM).');
    }
  }
  
  // Check for special times like "noon", "midnight"
  if (doc.has('noon')) {
    options.byhour = [12];
    options.byminute = [0];
    result.matched = true;
  } else if (doc.has('midnight')) {
    options.byhour = [0];
    options.byminute = [0];
    result.matched = true;
  }
  
  return result;
}
```

### Step 3: Register the Handler

To use your custom pattern handler, you need to register it with the processor. You can do this by adding it to your application code:

```typescript
import { processRecurrencePattern } from 'helios-js';
import { applyTimeOfDayPatterns } from './patterns/timeOfDay';

// Use your custom handler
const options = processRecurrencePattern("every monday at 3pm", {
  // Force specific handlers to use
  forceHandlers: ['frequency', 'dayOfWeek', 'timeOfDay']
});
```

### Warning Generation

Include warnings when a pattern is ambiguous or might be misinterpreted:

```typescript
if (doc.has('biweekly')) {
  // Update options appropriately
  options.freq = RRule.WEEKLY;
  options.interval = 2;
  
  // Flag as matched
  result.matched = true;
  
  // Add warning for ambiguous term
  result.warnings.push('The term "biweekly" is ambiguous and has been interpreted as "every 2 weeks".');
}
```

## Pattern Handler Best Practices

1. **Focus on One Pattern Category**: Each handler should focus on a specific pattern type.

2. **Use CompromiseJS Effectively**: Leverage the full power of CompromiseJS for pattern matching.

3. **Normalize Input**: Remember that input has already been normalized.

4. **Set Clear Confidence Levels**: Use confidence levels to indicate how certain the match is.

5. **Provide Useful Warnings**: Include warnings for ambiguous or potentially incorrect interpretations.

6. **Document Patterns**: Document the patterns your handler recognizes.

## Debugging Pattern Handlers

When developing or troubleshooting pattern handlers, these techniques can help:

### 1. Test Individual Handlers

Test your handler directly with a CompromiseJS document:

```typescript
import { setupCompromise, getDocument } from 'helios-js/compromise';
import { applyTimeOfDayPatterns } from './patterns/timeOfDay';

// Setup CompromiseJS
setupCompromise();

// Create a document
const doc = getDocument("at 3pm");

// Test a specific handler
const options = {};
const result = applyTimeOfDayPatterns(doc, options);
console.log(result, options);
```

### 2. Log Normalized Input

Make sure the input is normalized as expected:

```typescript
import { normalizeInput } from 'helios-js';

const normalized = normalizeInput("Your pattern here");
console.log("Normalized:", normalized);
```

### 3. Use Forced Handlers

Test specific handlers in isolation:

```typescript
import { processRecurrencePattern } from 'helios-js';

const options = processRecurrencePattern("every monday at 3pm", {
  forceHandlers: ['timeOfDay'] // Only use the time-of-day handler
});
console.log(options);
```

### 4. Check Handler Result

Examine the result to understand what was recognized:

```typescript
const options = {};
const result = applyTimeOfDayPatterns(doc, options);

console.log("Matched:", result.matched);
console.log("Confidence:", result.confidence);
console.log("Warnings:", result.warnings);
console.log("Updated options:", options);
```

## Example: Month Name Pattern Handler

Here's a complete example of a custom pattern handler that recognizes month names like "in January", "during February", etc.:

```typescript
import { RRule } from 'rrule';
import type { RecurrenceOptions } from '../../types';
import type { PatternHandlerResult } from '../../processor';
import type { CompromiseDocument } from '../types';
import { MONTHS } from '../../constants';

/**
 * Applies month name pattern recognition using CompromiseJS
 * 
 * @param doc - CompromiseJS document
 * @param options - Current recurrence options
 * @param config - Optional configuration
 * @returns Pattern handler result
 */
export function applyMonthNamePatterns(
  doc: CompromiseDocument,
  options: RecurrenceOptions,
  config?: any
): PatternHandlerResult {
  const result: PatternHandlerResult = {
    matched: false,
    confidence: 1.0,
    warnings: []
  };

  // Match patterns like "in January", "during February"
  const monthMatches = doc.match('(in|during) (january|february|march|april|may|june|july|august|september|october|november|december)');
  
  if (monthMatches.found) {
    // Extract the month name
    const monthName = monthMatches.match('(january|february|march|april|may|june|july|august|september|october|november|december)').text().toLowerCase();
    
    // Map month name to month number (1-12)
    const monthNumbers = {
      'january': 1, 'february': 2, 'march': 3, 'april': 4,
      'may': 5, 'june': 6, 'july': 7, 'august': 8,
      'september': 9, 'october': 10, 'november': 11, 'december': 12
    };
    
    const monthNumber = monthNumbers[monthName];
    
    // Update the options
    if (monthNumber) {
      options.bymonth = [monthNumber];
      result.matched = true;
    }
  }
  
  return result;
}
```

## Conclusion

Pattern handlers are the heart of Helios-JS's natural language processing capabilities. By understanding how they work and how to create custom handlers, you can extend the library to recognize new pattern types and tailor it to your specific needs.

Whether you're adding support for time-of-day patterns, specific month patterns, or any other recurrence rule aspect, the pattern handler system provides a flexible and powerful framework for natural language processing. 