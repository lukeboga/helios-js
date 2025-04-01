# Natural Language Patterns for HeliosJS

> **Change Log**:  
> - [April 2025]: Updated confidence score details
> - [April 2025]: Added error handling section
> - [April 2025]: Expanded pattern recognition architecture details
> - [April 2025]: Updated pattern syntax examples

This document provides a comprehensive technical reference for natural language patterns supported by the `naturalLanguageToRRule` function in HeliosJS.

## Overview

The pattern recognition system in HeliosJS converts natural language expressions into structured recurrence rules. It supports a variety of patterns including:

- Frequency patterns (daily, weekly, monthly, yearly)
- Interval patterns (every X days, biweekly)
- Day of week patterns (every Monday, weekdays)
- Day of month patterns (1st of each month)
- End date patterns (until December)
- Combinations of the above

## Pattern Recognition Architecture

The pattern recognition system processes input text through a pipeline:

1. **Text Normalization**: Standardizes input by converting to lowercase, correcting misspellings, standardizing formats, and removing unnecessary punctuation.

2. **Pattern Matching**: A series of specialized pattern handlers analyze the normalized text to identify specific patterns.

3. **Result Combination**: Multiple pattern matches are combined to form a complete recurrence rule.

4. **Post-Processing**: Validation and error checking ensure the final rule is valid and sensible.

### CompromiseJS Integration

The pattern recognition system leverages [CompromiseJS](https://github.com/spencermountain/compromise) for natural language processing. CompromiseJS provides:

- Part-of-speech tagging
- Named entity recognition
- Phrase matching
- Text normalization

Pattern handlers use CompromiseJS's pattern matching syntax to identify relevant patterns in the input text.

## Supported Pattern Syntax

### Frequency Patterns

Basic frequency patterns define how often an event occurs:

| Pattern | Description | Examples |
|---------|-------------|----------|
| Daily | Occurs every day | "daily", "every day" |
| Weekly | Occurs every week | "weekly", "every week" |
| Monthly | Occurs every month | "monthly", "every month" |
| Yearly | Occurs every year | "yearly", "annually", "every year" |

### Interval Patterns

Interval patterns define frequencies with periods greater than 1:

| Pattern | Description | Examples |
|---------|-------------|----------|
| Every N days | Occurs every N days | "every 2 days", "every 3 days" |
| Every N weeks | Occurs every N weeks | "every 2 weeks", "every other week", "biweekly" |
| Every N months | Occurs every N months | "every 3 months", "every other month", "bimonthly" |
| Every N years | Occurs every N years | "every 2 years", "every other year", "biennially" |

### Day of Week Patterns

Day of week patterns specify which days of the week events occur:

| Pattern | Description | Examples |
|---------|-------------|----------|
| Every [day] | Occurs on specified day(s) | "every Monday", "Tuesdays", "every Monday and Wednesday" |
| Weekdays | Occurs on Monday through Friday | "every weekday", "on weekdays" |
| Weekends | Occurs on Saturday and Sunday | "every weekend", "on weekends" |

### Day of Month Patterns

Day of month patterns specify which days of the month events occur:

| Pattern | Description | Examples |
|---------|-------------|----------|
| Nth of month | Occurs on specified day(s) of month | "1st of each month", "on the 15th", "1st and 15th of each month" |
| Last day of month | Occurs on the last day of each month | "last day of month", "on the last day of each month" |

### End Date Patterns

End date patterns specify when recurrences should stop:

| Pattern | Description | Examples |
|---------|-------------|----------|
| Until [date] | Ends on specified date | "until December", "ending on 12/31/2023" |
| Until [relative date] | Ends on relative date | "until next month", "ending in 3 weeks" |

### Combined Patterns

Multiple patterns can be combined to create complex recurrence rules:

| Combined Pattern | Example |
|------------------|---------|
| Frequency + Day of Week | "weekly on Monday" |
| Interval + Day of Week | "every 2 weeks on Friday" |
| Frequency + End Date | "daily until December" |
| Day of Week + End Date | "every Tuesday until next month" |
| Complex combination | "every other Monday and Friday until end of year" |

## Pattern Handler Implementation

### Pattern Handler Pipeline

Pattern handlers are executed in this sequence:

1. **Frequency Handlers**: Determine basic frequency (daily, weekly, etc.)
2. **Interval Handlers**: Process interval modifiers (every 2 weeks, etc.)
3. **Day of Week Handlers**: Extract specific days of the week
4. **Day of Month Handlers**: Extract specific days of the month
5. **End Date Handlers**: Determine when the recurrence ends

### Pattern Handler Structure

Each pattern handler:

1. Checks if the input matches its pattern
2. Extracts relevant information
3. Updates the recurrence options
4. Assigns a confidence score

### Pattern Handler Example

```typescript
// Simplified example of a frequency pattern handler
const processFrequencyPattern = (text: string): PatternResult | null => {
  // Check for daily patterns
  if (text.match(/\b(daily|every\s+day)\b/i)) {
    return {
      type: 'frequency',
      value: 'daily',
      options: {
        freq: RRule.DAILY,
        interval: 1
      },
      confidence: 0.95
    };
  }
  
  // Check for weekly patterns
  if (text.match(/\b(weekly|every\s+week)\b/i)) {
    return {
      type: 'frequency',
      value: 'weekly',
      options: {
        freq: RRule.WEEKLY,
        interval: 1
      },
      confidence: 0.95
    };
  }
  
  // Not a frequency pattern
  return null;
};
```

## Confidence Scoring

Each pattern match includes a confidence score (0.0-1.0) indicating the system's confidence in the match. Confidence scoring helps:

1. **Resolve conflicts** when multiple patterns match the same input
2. **Prioritize** more specific patterns over general ones
3. **Identify uncertain** or ambiguous inputs
4. **Provide feedback** to users about recognition quality

### How Confidence Scores are Calculated

Confidence scores are determined by:

- **Pattern Specificity**: More specific patterns receive higher scores
- **Match Quality**: How well the input matches the expected pattern
- **Context Consistency**: Whether the pattern is consistent with other recognized patterns
- **Ambiguity**: Whether the input could match multiple patterns

### Confidence Thresholds

- **High Confidence (0.9-1.0)**: Strong matches with high certainty
- **Medium Confidence (0.7-0.9)**: Good matches with some uncertainty
- **Low Confidence (0.5-0.7)**: Potential matches with significant uncertainty
- **Rejected (<0.5)**: Matches below this threshold are typically rejected

## Error Handling

The pattern recognition system handles errors and ambiguities in several ways:

### Unrecognized Patterns

When no patterns are recognized:

1. The function returns `null` to indicate no valid recurrence rule could be created
2. Calling code should handle this case appropriately (e.g., prompt user for clarification)

### Conflicting Patterns

When conflicting patterns are detected:

1. Higher-confidence patterns take precedence over lower-confidence ones
2. More specific patterns take precedence over general ones
3. In case of equal confidence, the system uses predefined resolution rules

### Partial Recognition

When only some aspects of a pattern are recognized:

1. The system fills in reasonable defaults for missing information
2. The confidence score is adjusted downward to reflect the partial match

### Implementation Example

```typescript
// Example error handling in the main processor
function processRecurrencePattern(text: string): RecurrenceResult | null {
  try {
    // Normalize input
    const normalizedText = normalizeInput(text);
    
    // Apply pattern handlers
    const matches = applyPatternHandlers(normalizedText);
    
    // Check if we found any patterns
    if (matches.length === 0) {
      // No patterns recognized
      return null;
    }
    
    // Combine pattern results
    const combinedResult = combinePatternResults(matches);
    
    // Validate final result
    if (!isValidRecurrenceRule(combinedResult.options)) {
      // Invalid combination
      return null;
    }
    
    return {
      options: combinedResult.options,
      confidence: combinedResult.confidence
    };
  } catch (error) {
    // Log error for debugging
    console.error('Error processing pattern:', error);
    
    // Return null to indicate failure
    return null;
  }
}
```

## Extending Pattern Support

To add support for new patterns:

1. Create a new pattern handler that implements the `PatternHandler` interface
2. Register the handler in the pattern handler registry
3. Add tests for the new pattern
4. Update this documentation

See the [Contributing Guide](./contributing-guide.md#pattern-handler-development) for detailed instructions on creating pattern handlers. 