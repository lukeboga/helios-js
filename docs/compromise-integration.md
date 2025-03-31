# CompromiseJS Integration for HeliosJS

This document outlines how HeliosJS integrates [CompromiseJS](https://github.com/spencermountain/compromise) for natural language recurrence pattern processing. This integration replaces the previous regex-based transformer with a more robust and maintainable NLP-based solution.

## Overview

HeliosJS now uses CompromiseJS to parse natural language date recurrence patterns like "every Monday," "biweekly," or "monthly until December" into structured RRule options. This approach provides:

- More reliable pattern recognition
- Better handling of complex patterns
- Easier maintenance and extensibility
- Improved performance for common patterns

## Usage

The CompromiseJS integration is fully backward compatible with the existing API. You can continue using the `transformRecurrencePattern` function as before, or use the new `processRecurrencePattern` function directly:

```typescript
import { processRecurrencePattern } from 'helios-js';
import { RRule } from 'rrule';

// Process a natural language pattern
const options = processRecurrencePattern('every monday and friday');

// Create an RRule instance
const rule = new RRule(options);

// Display the recurrence rule
console.log(rule.toText());  // "every Monday and Friday"

// Get next occurrence dates
const nextDates = rule.all((date) => date.getTime() < Date.now() + 30 * 24 * 60 * 60 * 1000);
console.log(nextDates);  // Next 30 days of occurrences
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

The CompromiseJS integration can handle more complex combinations of patterns:

```typescript
// Complex pattern with day of week and interval
const weeklyOptions = processRecurrencePattern('every other Monday until December');

// Pattern with multiple days and specific end date
const multiDayOptions = processRecurrencePattern('Mondays and Fridays until end of year');

// Pattern with day of month
const monthlyOptions = processRecurrencePattern('1st and 15th of each month');
```

## Performance Considerations

The implementation includes several performance optimizations:

1. **Lazy Initialization**: CompromiseJS is only initialized when needed
2. **Fast Paths**: Simple patterns like "daily" use regex for minimal overhead
3. **Result Caching**: Results are cached to avoid reprocessing identical patterns

## Troubleshooting

If you encounter issues with pattern recognition:

1. Ensure pattern text is clear and unambiguous
2. For complex patterns, try breaking them into simpler components
3. Check the result's `confidence` property; lower values indicate potential issues
4. For patterns not yet supported, you can fall back to manual RRule options

## Extending Pattern Support

If you need to support additional pattern types, you can contribute by adding new pattern handlers in the `src/compromise/patterns` directory. Each handler follows a consistent interface for analyzing patterns and updating recurrence options. 