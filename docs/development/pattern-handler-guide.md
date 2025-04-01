# Pattern Handler Guide

> **Change Log**:  
> - [April 2025]: Completely revised documentation for factory-based pattern handler architecture
> - [April 2025]: Removed references to legacy function-based approach
> - [April 2025]: Added comprehensive examples for creating pattern handlers with the factory pattern
> - [April 2025]: Updated best practices and debugging techniques

This guide explains how pattern handlers work in Helios-JS and provides detailed instructions for creating custom pattern handlers. Whether you're extending the library with new pattern types or troubleshooting existing pattern recognition, this guide will help you understand the pattern handling system.

## What is a Pattern Handler?

A pattern handler is a specialized function responsible for recognizing a specific type of natural language pattern and transforming it into structured RRule options. Each handler focuses on a particular pattern category, such as frequency patterns ("daily", "weekly"), interval patterns ("every 2 weeks"), or day patterns ("every Monday").

Pattern handlers are the core of Helios-JS's natural language processing capabilities. They work together to transform a wide variety of natural language inputs into structured recurrence rules.

## Pattern Handler Architecture

Helios-JS uses a factory-based pattern handler architecture with clear separation between:

1. **Matcher Functions**: Identify specific patterns in text
2. **Processor Functions**: Transform matches into recurrence options
3. **Factory Function**: Combines matchers and processors into handlers with metadata

This architecture provides several benefits:
- **Modularity**: Matchers and processors can be reused across different handlers
- **Testability**: Each component can be tested independently
- **Extensibility**: New patterns can be added by creating new matchers and processors
- **Maintainability**: Consistent structure makes the code easier to understand and modify

### Matcher Functions

Matcher functions identify specific patterns in text and return structured match information:

```typescript
type PatternMatcher = (
  doc: CompromiseDocument, 
  config?: PatternMatcherConfig
) => PatternMatch | null;

interface PatternMatch {
  type: string;       // Category of the pattern (e.g., 'frequency', 'interval')
  value: any;         // Value extracted from the pattern
  text: string;       // Original text that matched
  confidence?: number; // Confidence level of the match (0.0-1.0)
  warnings?: string[]; // Any warnings about potential ambiguities
}
```

### Processor Functions

Processor functions transform pattern matches into recurrence options:

```typescript
type PatternProcessor = (
  options: RecurrenceOptions, 
  match: PatternMatch
) => RecurrenceOptions;
```

### Factory Function

The factory function combines matchers and processors into a complete pattern handler:

```typescript
function createPatternHandler(
  name: string,                           // Unique identifier
  matchers: PatternMatcher[],             // Array of matcher functions
  processor: PatternProcessor,            // Processor function
  options?: {                             // Optional configuration
    category?: string,                    // Handler category
    priority?: number,                    // Priority for application order
    description?: string                  // Description for documentation
  }
): PatternHandler & PatternHandlerMetadata
```

The resulting pattern handler function has this signature:

```typescript
interface PatternHandler {
  (doc: CompromiseDocument, options: RecurrenceOptions): PatternHandlerResult;
}

interface PatternHandlerResult {
  matched: boolean;       // Whether the pattern was matched
  confidence?: number;    // Confidence level of the match (0.0-1.0)
  warnings?: string[];    // Any warnings during processing
}

interface PatternHandlerMetadata {
  name: string;           // Handler name
  category: string;       // Handler category
  priority: number;       // Handler priority
  description: string;    // Handler description
}
```

## Built-in Pattern Handlers

Helios-JS includes several built-in pattern handlers, each responsible for a specific pattern category:

1. **frequencyPatternHandler**: Recognizes basic frequency terms (e.g., "daily", "weekly")
2. **intervalPatternHandler**: Recognizes patterns with explicit intervals (e.g., "every 2 weeks")
3. **dayOfWeekPatternHandler**: Recognizes day-based patterns (e.g., "every Monday", "every weekday")
4. **dayOfMonthPatternHandler**: Recognizes month day patterns (e.g., "1st of the month")
5. **untilDatePatternHandler**: Recognizes end date specifications (e.g., "until December 31st")

These handlers are applied in a specific order based on their priority, as defined in the processor.

## Creating Custom Pattern Handlers

Now that you understand the pattern handler architecture, let's create a custom pattern handler step by step.

### Step 1: Define Matcher Functions

First, identify the patterns you want to recognize and create matcher functions for each. Let's create a handler for time-of-day patterns like "at 3pm", "at noon", etc.

```typescript
import { CompromiseDocument } from '../../compromise/types';
import { PatternMatch, PatternMatcher } from '../../types';

/**
 * Matches specific time patterns like "at 3pm", "at 3:30pm", etc.
 */
export const specificTimeMatcher: PatternMatcher = (
  doc: CompromiseDocument
): PatternMatch | null => {
  // Match patterns like "at 3pm", "at 3:30pm"
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
    
    // Create warnings for ambiguous cases
    const warnings: string[] = [];
    if (timeValue === '12' && !isPM) {
      warnings.push('Interpreted "12" as noon (12:00 PM).');
    }
    
    return {
      type: 'timeOfDay',
      value: {
        hour,
        minute: 0
      },
      text: timeMatches.text(),
      confidence: 1.0,
      warnings
    };
  }
  
  return null;
};

/**
 * Matches special time terms like "noon", "midnight"
 */
export const specialTimeMatcher: PatternMatcher = (
  doc: CompromiseDocument
): PatternMatch | null => {
  // Check for special times like "noon", "midnight"
  if (doc.has('noon')) {
    return {
      type: 'timeOfDay',
      value: {
        hour: 12,
        minute: 0
      },
      text: 'noon',
      confidence: 1.0
    };
  } else if (doc.has('midnight')) {
    return {
      type: 'timeOfDay',
      value: {
        hour: 0,
        minute: 0
      },
      text: 'midnight',
      confidence: 1.0
    };
  }
  
  return null;
};
```

### Step 2: Create a Processor Function

Next, create a processor function that transforms matches into recurrence options:

```typescript
import { PatternMatch, PatternProcessor, RecurrenceOptions } from '../../types';

/**
 * Processor for time-of-day patterns
 */
export const timeOfDayProcessor: PatternProcessor = (
  options: RecurrenceOptions,
  match: PatternMatch
): RecurrenceOptions => {
  if (match.type === 'timeOfDay' && match.value) {
    const { hour, minute } = match.value;
    
    // Update options with the time components
    options.byhour = [hour];
    options.byminute = [minute];
  }
  
  return options;
};
```

### Step 3: Create the Pattern Handler Using the Factory

Finally, use the factory function to create the pattern handler:

```typescript
import { createPatternHandler } from '../../compromise/utils/handlerFactory';
import { 
  specificTimeMatcher, 
  specialTimeMatcher 
} from './timeMatchers';
import { timeOfDayProcessor } from './timeProcessor';

/**
 * Pattern handler for time-of-day patterns
 */
export const timeOfDayPatternHandler = createPatternHandler(
  'timeOfDay',
  [specificTimeMatcher, specialTimeMatcher],
  timeOfDayProcessor,
  {
    category: 'time',
    priority: 45, // Lower than frequency, higher than until date
    description: 'Recognizes time-of-day patterns like "at 3pm", "at noon"'
  }
);
```

### Step 4: Use the Custom Pattern Handler

To use your custom pattern handler, you can add it to your application code:

```typescript
import { processRecurrencePattern } from 'helios-js';
import { timeOfDayPatternHandler } from './patterns/timeOfDay';

// Use your custom handler with the processor
const options = processRecurrencePattern(
  "every monday at 3pm", 
  {
    // Additional handlers to include
    customHandlers: [timeOfDayPatternHandler]
  }
);
```

## Pattern Handler Best Practices

1. **Separate Concerns**: Keep matchers and processors separate for better reusability.

2. **Use Strong Typing**: Leverage TypeScript's type system for pattern matching and processing.

3. **Normalize Input**: Remember that CompromiseJS normalizes the input.

4. **Provide Meaningful Metadata**: Include clear names, categories, and descriptions.

5. **Set Appropriate Priorities**: Consider how handlers interact when determining priority.

6. **Include Error Handling**: Add robust error handling in matcher and processor functions.

7. **Document Expected Patterns**: Clearly document the patterns your handler recognizes.

## Debugging Pattern Handlers

The factory-based architecture makes debugging easier. Here are some techniques:

### 1. Test Individual Matchers

Test your matcher functions directly:

```typescript
import { setupCompromise, getDocument } from 'helios-js/compromise';
import { specificTimeMatcher } from './patterns/timeOfDay';

// Setup CompromiseJS
setupCompromise();

// Create a document
const doc = getDocument("at 3pm");

// Test a specific matcher
const match = specificTimeMatcher(doc);
console.log(match);
```

### 2. Test Processors Independently

Test your processor with mock match data:

```typescript
import { timeOfDayProcessor } from './patterns/timeOfDay';

// Create a mock match
const mockMatch = {
  type: 'timeOfDay',
  value: { hour: 15, minute: 0 },
  text: 'at 3pm',
  confidence: 1.0
};

// Test the processor
const options = {};
const result = timeOfDayProcessor(options, mockMatch);
console.log(options);
```

### 3. Use Forcing and Metrics

Use the processor's forcing and metrics capabilities:

```typescript
import { processRecurrencePattern } from 'helios-js';
import { timeOfDayPatternHandler } from './patterns/timeOfDay';

// Process with metrics enabled
const result = processRecurrencePattern(
  "every monday at 3pm", 
  {
    customHandlers: [timeOfDayPatternHandler],
    forceHandlers: ['timeOfDay'], // Only use this handler
    collectMetrics: true // Enable metrics collection
  }
);

// Examine metrics
console.log(result._metrics);
```

## Example: Month Name Pattern Handler

Here's a complete example of a custom pattern handler for month-specific patterns:

```typescript
// monthMatchers.ts
import { CompromiseDocument } from '../../compromise/types';
import { PatternMatch, PatternMatcher } from '../../types';

/**
 * Matcher for month name patterns like "in January", "during February"
 */
export const monthNameMatcher: PatternMatcher = (
  doc: CompromiseDocument
): PatternMatch | null => {
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
    
    // Return match info if month is valid
    if (monthNumber) {
      return {
        type: 'monthName',
        value: monthNumber,
        text: monthMatches.text(),
        confidence: 1.0
      };
    }
  }
  
  return null;
};

// monthProcessor.ts
import { PatternMatch, PatternProcessor, RecurrenceOptions } from '../../types';

/**
 * Processor for month name patterns
 */
export const monthNameProcessor: PatternProcessor = (
  options: RecurrenceOptions,
  match: PatternMatch
): RecurrenceOptions => {
  if (match.type === 'monthName' && typeof match.value === 'number') {
    options.bymonth = [match.value];
  }
  
  return options;
};

// monthHandler.ts
import { createPatternHandler } from '../../compromise/utils/handlerFactory';
import { monthNameMatcher } from './monthMatchers';
import { monthNameProcessor } from './monthProcessor';

/**
 * Pattern handler for month name patterns
 */
export const monthNamePatternHandler = createPatternHandler(
  'monthName',
  [monthNameMatcher],
  monthNameProcessor,
  {
    category: 'month',
    priority: 40,
    description: 'Recognizes specific month patterns like "in January", "during February"'
  }
);
```

## Pattern Handler Architecture Diagram

Below is a diagram showing the factory-based pattern handler architecture:

```
┌────────────────────┐     ┌───────────────────┐
│  Pattern Matchers  │     │ Pattern Processor │
│  ───────────────   │     │ ───────────────   │
│  - dailyMatcher    │     │ - process matches │
│  - weeklyMatcher   │──┐  │ - update options  │
│  - monthlyMatcher  │  │  │                   │
└────────────────────┘  │  └───────────────────┘
                        │            │
                        │            │
┌────────────────────┐  │            │
│  Factory Function  │  │            │
│  ───────────────   │  │            │
│  createPatternHandler◄─┘            │
└──────────┬─────────┘                │
           │                          │
           │                          │
           ▼                          │
┌────────────────────┐                │
│  Pattern Handler   │                │
│  ───────────────   │                │
│  - metadata        │◄───────────────┘
│  - execute         │
└──────────┬─────────┘
           │
           │
           ▼
┌────────────────────┐
│     Processor      │
│  ───────────────   │
│  - apply handlers  │
│  - collect results │
└────────────────────┘
```

## Conclusion

The factory-based pattern handler architecture provides a flexible and powerful framework for natural language processing in Helios-JS. By separating matcher and processor functions, it enables better reusability, testability, and maintainability.

Whether you're adding support for time-of-day patterns, specific month patterns, or any other recurrence rule aspect, this architecture provides a clear pattern for extending the library's capabilities.

By following the steps outlined in this guide, you can create custom pattern handlers that seamlessly integrate with the core library. 