# Troubleshooting Guide

This guide helps you diagnose and fix common issues when using Helios-JS.

## Table of Contents

- [Common Error Types](#common-error-types)
- [Pattern Recognition Issues](#pattern-recognition-issues)
- [Invalid Recurrence Rules](#invalid-recurrence-rules)
- [Performance Concerns](#performance-concerns)
- [Integration Problems](#integration-problems)
- [Debugging Techniques](#debugging-techniques)
- [FAQ](#frequently-asked-questions)

## Common Error Types

Helios-JS returns specific error types to help you understand what went wrong:

### ParseError

Occurs when a natural language pattern cannot be parsed.

```javascript
// Example error
{
  type: 'ParseError',
  message: 'Could not parse the input pattern: "every monnday"',
  details: {
    originalInput: 'every monnday',
    normalizedInput: 'every monnday',
    suggestedCorrections: ['every monday']
  }
}
```

**Solution:**
- Check input for typos or unsupported patterns
- Use the `suggestedCorrections` to help users fix their input
- Consider implementing the suggested corrections automatically

### ValidationError

Occurs when a pattern is recognized but produces an invalid RRule.

```javascript
// Example error
{
  type: 'ValidationError',
  message: 'Pattern produces an invalid recurrence rule: "every 0 days"',
  details: {
    originalInput: 'every 0 days',
    ruleOptions: { freq: 3, interval: 0 }
  }
}
```

**Solution:**
- Validate user input before passing to Helios-JS
- Add constraints to prevent users from entering invalid values
- Implement validation in your UI to catch common issues

### ConfigurationError

Occurs when the library is configured incorrectly.

```javascript
// Example error
{
  type: 'ConfigurationError',
  message: 'Invalid configuration: pattern handler priority must be a number'
}
```

**Solution:**
- Double-check your configuration options
- Ensure custom pattern handlers follow the required interface
- Read the API documentation for correct configuration values

## Pattern Recognition Issues

### Unrecognized Patterns

If Helios-JS fails to recognize valid patterns:

**Solutions:**
1. Check if your pattern is supported (see the [Patterns Guide](./patterns.md))
2. Ensure input is properly normalized before processing
3. Try using the `suggestPatternCorrections` function:

```javascript
import { suggestPatternCorrections } from 'helios-js';

const suggestions = suggestPatternCorrections('every mondy');
// Returns: ['every monday']
```

4. Consider creating a custom pattern handler if needed

### Ambiguous Patterns

Some natural language expressions can be ambiguous:

**Example:** "every 1st of the month" vs "every 1st day of the month"

**Solutions:**
1. Guide users toward using more explicit patterns
2. Check the confidence score in the transformation result
3. Implement clarification prompts for low-confidence results

```javascript
import { naturalLanguageToRRule } from 'helios-js';

const result = naturalLanguageToRRule('every 1st');
if (result.confidence < 0.8) {
  // Ask user for clarification
}
```

## Invalid Recurrence Rules

### Zero-Interval Issue

RRule doesn't support an interval of 0:

**Example:** "every 0 days" is invalid

**Solution:**
- Validate user input to ensure positive intervals
- Add UI constraints to prevent zero values
- Handle this case specifically in your application logic

### Conflicting Options

Some option combinations are invalid:

**Example:** "every day on Monday" (both daily frequency and specific day)

**Solutions:**
1. Guide users to more logical combinations
2. Use the more specific option (in this case, weekly on Monday)
3. Implement logic to resolve conflicts:

```javascript
function resolveConflicts(options) {
  if (options.freq === RRule.DAILY && options.byweekday) {
    // Convert to weekly recurrence
    options.freq = RRule.WEEKLY;
  }
  return options;
}
```

## Performance Concerns

### Slow Pattern Recognition

If pattern recognition is taking too long:

**Solutions:**
1. Limit pattern length
2. Disable complex pattern handlers if not needed
3. Implement caching for common patterns
4. Consider pre-processing inputs:

```javascript
// Implementing a simple cache
const patternCache = new Map();

function getCachedPattern(input) {
  if (patternCache.has(input)) {
    return patternCache.get(input);
  }
  
  const result = naturalLanguageToRRule(input);
  patternCache.set(input, result);
  return result;
}
```

### Memory Usage

For large applications processing many patterns:

**Solutions:**
1. Process patterns in batches
2. Implement a cache eviction strategy
3. Use a lightweight configuration:

```javascript
import { createTransformer } from 'helios-js';

// Create a lightweight transformer with only essential handlers
const lightTransformer = createTransformer({
  disableHandlers: ['complexDatePatternHandler', 'fuzzyMatchHandler']
});
```

## Integration Problems

### Frontend Framework Integration

When integrating with React, Vue, Angular, etc.:

**Solutions:**
1. Wrap Helios-JS in a service or hook
2. Handle errors and loading states
3. Implement debouncing for input fields

**React Example:**
```javascript
import { useState, useEffect } from 'react';
import { naturalLanguageToRRule } from 'helios-js';

function useRecurrencePattern(input) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    if (!input) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const transformResult = naturalLanguageToRRule(input);
      setResult(transformResult);
    } catch (err) {
      setError(err);
    } finally {
      setIsProcessing(false);
    }
  }, [input]);
  
  return { result, error, isProcessing };
}
```

### Server-Side Processing

When using Helios-JS in Node.js:

**Solutions:**
1. Implement input sanitization
2. Add request size limits
3. Consider caching results:

```javascript
// Express middleware example
function heliosMiddleware(req, res, next) {
  try {
    const pattern = req.body.pattern;
    if (!pattern || typeof pattern !== 'string') {
      return res.status(400).json({ error: 'Invalid pattern input' });
    }
    
    if (pattern.length > 200) {
      return res.status(400).json({ error: 'Pattern too long' });
    }
    
    const result = naturalLanguageToRRule(pattern);
    req.recurrenceResult = result;
    next();
  } catch (error) {
    res.status(400).json({ 
      error: error.message,
      details: error.details || {}
    });
  }
}
```

## Debugging Techniques

### Enable Debug Mode

Helios-JS has a built-in debug mode:

```javascript
import { setDebugMode } from 'helios-js';

// Enable debug logging
setDebugMode(true);

// Process a pattern - will log detailed information
const result = naturalLanguageToRRule('every 2 weeks on Monday');
```

### Inspect Normalization

To understand how your input is being normalized:

```javascript
import { normalizeInput } from 'helios-js';

const normalized = normalizeInput('Every 2nd Monday of the month');
console.log('Normalized:', normalized);
// Output: "every 2 monday of the month"
```

### Log Transformation Steps

Track the transformation process:

```javascript
import { createTransformer } from 'helios-js';

const transformer = createTransformer({
  onBeforeNormalize: (input) => console.log('Original input:', input),
  onAfterNormalize: (normalized) => console.log('Normalized input:', normalized),
  onPatternMatch: (handler, result) => console.log(
    `Handler ${handler.name} matched with confidence ${result.confidence}`
  )
});

transformer.transform('every Monday and Wednesday');
```

## Frequently Asked Questions

### Why doesn't Helios-JS recognize my pattern?

Helios-JS supports a wide range of patterns, but not every possible natural language expression. Check the [Patterns Guide](./patterns.md) for supported patterns and consider using a more standardized format if your pattern isn't recognized.

### How do I handle timezone issues?

Helios-JS focuses on pattern recognition, not timezone handling. For timezone support:

1. Use a dedicated library like Luxon, Moment-Timezone, or date-fns-tz
2. Process the resulting dates after RRule generation
3. Store timezone information separately

```javascript
import { RRule } from 'rrule';
import { DateTime } from 'luxon';

// Get recurrence rule
const rule = naturalLanguageToRRule('every Monday at 9am').rule;

// Generate dates in UTC
const dates = rule.all().map(date => {
  // Convert to user's timezone
  return DateTime.fromJSDate(date)
    .setZone('America/New_York')
    .toJSDate();
});
```

### Can I extend Helios-JS with custom syntax?

Yes, you can create custom pattern handlers to recognize your own syntax:

1. Define the pattern syntax and mapping to RRule options
2. Create a pattern handler class
3. Register it with the transformer

See the [Pattern Handler Guide](../development/pattern-handler-guide.md) for detailed instructions.

### Why do I get different results for similar patterns?

Natural language can be ambiguous. For example:
- "Monthly on the 1st" → The 1st day of every month
- "Monthly on the 1st Monday" → The 1st Monday of every month

These are different patterns that produce different recurrence rules. Be specific in your patterns and provide examples to users.

### How do I display human-readable descriptions of a recurrence rule?

While Helios-JS focuses on parsing natural language to RRule, you can:

1. Use RRule's `toText()` method for basic descriptions
2. Create your own formatter for more natural descriptions
3. Use a library like `rrule-to-text` for better formatting

```javascript
// Basic RRule text
const rule = naturalLanguageToRRule('every 2 weeks on Monday').rule;
console.log(rule.toText());
// Output: "every 2 weeks on Monday"

// Custom formatting
function formatRecurrence(rule) {
  const options = rule.options;
  if (options.freq === RRule.WEEKLY && options.interval === 2) {
    return `Bi-weekly on ${options.byweekday.map(day => 
      ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day]).join(', ')}`;
  }
  // Add more custom formatting rules
  return rule.toText();
}
```

---

If you encounter issues not covered in this guide, please check our [GitHub issues](https://github.com/your-org/helios-js/issues) or open a new issue with detailed information about your problem. 