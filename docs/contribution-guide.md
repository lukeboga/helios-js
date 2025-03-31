# Contribution Guide: Adding Pattern Handlers

This guide explains how to contribute new pattern handlers to extend the CompromiseJS integration in HeliosJS.

## Overview

The HeliosJS CompromiseJS integration is designed to be extensible. Each type of recurrence pattern is handled by a separate module, making it easy to add support for new patterns.

## Handler Structure

Each pattern handler:
1. Recognizes specific natural language patterns
2. Extracts relevant information
3. Updates the RecurrenceOptions object

## Creating a New Pattern Handler

### 1. Create a Handler Module

Create a new file in `src/compromise/patterns/` with a descriptive name for your pattern type:

```typescript
// src/compromise/patterns/myNewPattern.ts
import { Doc } from 'compromise';
import { PatternHandler, RecurrenceOptions, PatternResult } from '../../types';

/**
 * Applies pattern matching for my new pattern type
 */
export const applyMyNewPatterns: PatternHandler = (
  text: string,
  options: RecurrenceOptions,
  nlp: (text: string) => Doc
): PatternResult => {
  // Initialize result
  const result: PatternResult = {
    matched: false,
    confidence: 1.0,
    warnings: []
  };

  // Process the text with CompromiseJS
  const doc = nlp(text);

  // Pattern recognition logic here
  // ...

  // If pattern is recognized:
  if (/* pattern recognized */) {
    result.matched = true;
    
    // Update options object with the recognized values
    options.property = value;
    
    // Optionally set confidence level
    result.confidence = 0.9;
  }

  return result;
};
```

### 2. Define Pattern Recognition Logic

Use CompromiseJS to identify and extract information from the text:

```typescript
// Match patterns
const matches = doc.match('(every|each) #Value of the #Month');

if (matches.found) {
  const dayValue = matches.groups('Value').text();
  const monthValue = matches.groups('Month').text();
  
  // Convert to numeric values
  const day = parseInt(dayValue, 10);
  const month = getMonthNumber(monthValue);
  
  // Update options
  options.bymonthday = day;
  options.bymonth = month;
  
  result.matched = true;
}
```

### 3. Register Your Handler

Add your handler to the `allHandlers` array in `src/compromise/index.ts`:

```typescript
// Import your new handler
import { applyMyNewPatterns } from './patterns/myNewPattern';

// Add to the handlers array
export const allHandlers: PatternHandler[] = [
  // Existing handlers
  applyFrequencyPatterns,
  applyIntervalPatterns,
  // ... other handlers
  
  // Your new handler
  applyMyNewPatterns
];
```

## Best Practices

### 1. Use Existing Utilities

Leverage helper functions in the `utils` directory for common tasks:

```typescript
import { normalizeNumber } from '../utils/numberUtil';
import { parseDate } from '../utils/dateUtil';
```

### 2. Pattern Recognition Tips

- Start with simple patterns and gradually add complexity
- Use CompromiseJS's powerful matching syntax:
  - `#` for tags: `#Month`, `#Value`, `#Weekday`
  - `?` for optional parts: `(on|for)?`
  - `|` for alternatives: `(every|each)`
  - `*` for repeating patterns: `#Weekday+`

### 3. Testing

Create tests for your handler in the `test/unit/compromise` directory:

```typescript
// test/unit/compromise/yourPattern.test.ts
import { describe, it, expect } from 'vitest';
import { processRecurrencePattern } from '../../../src/processor';
import { RRule } from 'rrule';

describe('Your Pattern Handler', () => {
  it('recognizes basic pattern', () => {
    const result = processRecurrencePattern('your pattern text');
    
    expect(result).not.toBeNull();
    if (result) {
      // Test specific properties
      expect(result.propertyName).toBe(expectedValue);
      expect(result.confidence).toBeGreaterThan(0.9);
    }
  });
  
  // More test cases...
});
```

For comprehensive information about our testing approach, structure, and best practices, see the [Testing Guide](./development/testing-guide.md).

### 4. Performance Considerations

- Avoid complex regex operations if possible
- Use early returns for efficiency
- Consider adding fast-path checks for common patterns

## Example: Month Day Pattern Handler

Here's a simplified example of a handler for "15th of the month" type patterns:

```typescript
export const applyMonthDayPatterns: PatternHandler = (
  text: string,
  options: RecurrenceOptions,
  nlp: (text: string) => Doc
): PatternResult => {
  const result: PatternResult = {
    matched: false,
    confidence: 1.0,
    warnings: []
  };

  // Fast path for common patterns
  if (/\b\d+(st|nd|rd|th) (of )?(the |each |every )?month\b/i.test(text)) {
    const doc = nlp(text);
    
    // Match patterns like "15th of the month" or "on the 1st of each month"
    const matches = doc.match('(on the|the|on|) #Value(st|nd|rd|th) (of|) (the|each|every|) month');
    
    if (matches.found) {
      // Extract the day value
      const dayStr = matches.groups('Value').text();
      const day = parseInt(dayStr, 10);
      
      // Validate the day value
      if (day >= 1 && day <= 31) {
        options.bymonthday = day;
        
        // If no frequency is set, assume monthly
        if (options.freq === null) {
          options.freq = RRule.MONTHLY;
        }
        
        result.matched = true;
        return result;
      }
    }
  }
  
  return result;
};
```

## Submitting Your Contribution

1. Fork the repository
2. Create a branch for your feature
3. Implement your pattern handler
4. Add tests
5. Submit a pull request

We welcome contributions that expand the pattern recognition capabilities of HeliosJS! 