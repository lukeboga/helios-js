# Pattern Handler Modernization Plan

This document outlines a plan to modernize the pattern handler architecture in the HeliosJS library to improve code quality, maintainability, and developer experience.

## Core Principles

1. **Functional Approach**: Use a function-based approach with factory patterns instead of class-based/interface-based patterns.
   
2. **Separation of Concerns**: Split pattern handling into distinct matcher and processor functions for better testability and maintenance.
   
3. **Type Safety**: Provide comprehensive type definitions to ensure consistent usage and catch errors early.
   
4. **Consistent Structure**: Standardize the structure of all pattern handlers to make the codebase more predictable.
   
5. **Developer Experience**: Make it easy for developers to add new pattern handlers with minimal boilerplate.

6. **Meaningful Naming**: Ensure all declarations have clear, purpose-focused names that describe what they are or what they do, rather than using abstract or temporal qualifiers (like "Modern" or "Updated").

## Core Architecture Components

The modernized pattern handler architecture will have these key components:

## Current Implementation Analysis

### Case Study: Frequency Pattern Handler

Let's analyze the current implementation of the frequency pattern handler as an example:

```typescript
export function applyFrequencyPatterns(
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

### Key Observations

1. **Mixed Pattern Matching Approaches**:
   - Uses CompromiseJS `.has()` method
   - Also uses direct regex testing on the text
   - This inconsistency appears across different pattern handlers

2. **Side Effects**:
   - Directly modifies the `options` object passed by reference
   - Returns a simple result object with matched flag

3. **Limited CompromiseJS Usage**:
   - Uses only basic text matching
   - Doesn't leverage CompromiseJS's powerful tagging, entity recognition, or pattern matching

4. **Inconsistent Function Structure**:
   - Early returns after first match
   - No consistent pattern for how matches are processed

5. **Duplicated Pattern Definitions**:
   - Patterns like 'daily', 'weekly' are hardcoded
   - Similar patterns are repeated in other handlers

## Modernization Goals

Based on this analysis, we've identified these key modernization goals:

1. **Standardize Pattern Handler Structure**:
   - Create a consistent approach for all handlers
   - Implement clear separation of concerns

2. **Centralize Pattern Definitions**:
   - Move pattern definitions to constants
   - Eliminate duplication

3. **Enhance CompromiseJS Usage**:
   - Leverage more advanced NLP features
   - Create custom tags for domain-specific concepts

4. **Improve Type Safety**:
   - Replace generic `any` types
   - Create specific interfaces for pattern matches

5. **Enable Better Extensibility**:
   - Make it easier to add new pattern types
   - Create reusable components for pattern matching

## Proposed Standardized Approach

### 1. Pattern Handler Factory Function

Create a factory function to generate standardized pattern handlers:

```typescript
export function createPatternHandler(
  name: string,
  matchers: PatternMatcher[],
  processor: PatternProcessor
): PatternHandler {
  return (doc, options, config) => {
    const result: PatternHandlerResult = {
      matched: false,
      confidence: 1.0,
      warnings: []
    };
    
    // Try each matcher in sequence
    for (const matcher of matchers) {
      const match = matcher(doc, config);
      if (match) {
        // Process the match and update options
        processor(options, match, result);
        result.matched = true;
        
        // Add any warnings from the match
        if (match.warnings?.length) {
          result.warnings.push(...match.warnings);
        }
        
        // Update confidence if specified
        if (match.confidence != null) {
          result.confidence = match.confidence;
        }
      }
    }
    
    return result;
  };
}
```

### 2. Pattern Matcher Interface

Define a clear interface for pattern matchers:

```typescript
export interface PatternMatch {
  type: string;
  value: any;
  text: string;
  confidence?: number;
  warnings?: string[];
}

export type PatternMatcher = (
  doc: CompromiseDocument, 
  config?: any
) => PatternMatch | null;
```

### 3. Pattern Processor Interface

Define a clear interface for pattern processors:

```typescript
export type PatternProcessor = (
  options: RecurrenceOptions,
  match: PatternMatch,
  result: PatternHandlerResult
) => void;
```

### 4. Centralized Pattern Definitions

Centralize pattern definitions in the constants file:

```typescript
// In constants.ts
export const FREQUENCY_PATTERNS = {
  DAILY: ['daily', 'every day', 'each day'],
  WEEKLY: ['weekly', 'every week', 'each week'],
  MONTHLY: ['monthly', 'every month', 'each month'],
  YEARLY: ['yearly', 'annually', 'every year', 'each year'],
};

export const REGEX_PATTERNS = {
  INTERVAL: /every\s+(\d+)\s+(day|week|month|year)s?/i,
  DAY_OF_MONTH: /(\d+)(st|nd|rd|th)?\s+(day|)\s+of\s+(the\s+|)month/i,
  // More patterns...
};
```

### 5. Enhanced CompromiseJS Setup

Enhance CompromiseJS setup with custom tags:

```typescript
// In setup.ts
export function setupCompromise(): void {
  nlp.extend((Doc, world) => {
    // Add frequency terms
    world.addWords({
      daily: 'Frequency',
      weekly: 'Frequency',
      monthly: 'Frequency',
      yearly: 'Frequency',
      annually: 'Frequency',
    });
    
    // Add day terms
    world.addWords({
      monday: 'DayOfWeek',
      tuesday: 'DayOfWeek',
      // More days...
    });
    
    // Add custom patterns
    world.addRegex({
      'every #Value (day|days|week|weeks|month|months|year|years)': 'Interval',
    });
  });
}
```

## Implementation Example

Here's how the frequency pattern handler would be implemented using this new approach:

```typescript
// In frequency.ts
import { FREQUENCY_PATTERNS } from '../../constants';
import { PatternMatch, PatternMatcher, PatternProcessor } from '../../types';
import { createPatternHandler } from '../utils';

// Create matchers for different frequency types
const dailyMatcher: PatternMatcher = (doc) => {
  if (doc.match('#Frequency').has('(daily|every day|each day)')) {
    return {
      type: 'frequency',
      value: RRule.DAILY,
      text: doc.match('(daily|every day|each day)').text(),
    };
  }
  return null;
};

const weeklyMatcher: PatternMatcher = (doc) => {
  if (doc.match('#Frequency').has('(weekly|every week|each week)')) {
    return {
      type: 'frequency',
      value: RRule.WEEKLY,
      text: doc.match('(weekly|every week|each week)').text(),
    };
  }
  return null;
};

// Similar matchers for monthly and yearly

// Create processor for frequency patterns
const frequencyProcessor: PatternProcessor = (options, match, result) => {
  if (match.type === 'frequency') {
    options.freq = match.value;
  }
};

// Create the pattern handler
export const applyFrequencyPatterns = createPatternHandler(
  'frequency',
  [dailyMatcher, weeklyMatcher, monthlyMatcher, yearlyMatcher],
  frequencyProcessor
);
```

## Step-by-Step Modernization Process

### Phase 1: Foundation Setup

1. **Create Type Definitions**:
   - Define `PatternMatch`, `PatternMatcher`, and `PatternProcessor` interfaces
   - Create helper functions for pattern handling

2. **Centralize Pattern Definitions**:
   - Move all regex patterns to constants file
   - Create structured pattern groups (frequency, interval, etc.)

3. **Enhance CompromiseJS Setup**:
   - Add custom tags for domain-specific concepts
   - Define custom regex patterns for CompromiseJS

### Phase 2: Create Pattern Handler Factory

1. **Implement Factory Function**:
   - Create the `createPatternHandler` function
   - Add comprehensive error handling and logging

2. **Create Common Matchers**:
   - Implement reusable matchers for common patterns
   - Create a matcher library for shared functionality

3. **Define Standard Processors**:
   - Create processors for common updates (frequency, interval, etc.)
   - Implement result handling logic

### Phase 3: Convert Existing Handlers

1. **Refactor Frequency Handler**:
   - Convert to use the new factory function
   - Create specific matchers and processors

2. **Refactor Interval Handler**:
   - Convert to use the new factory function
   - Create interval-specific matchers

3. **Continue with Other Handlers**:
   - Systematically convert all existing handlers
   - Ensure consistent approach across all

### Phase 4: Documentation and Testing

1. **Update Documentation**:
   - Document the new pattern handler system
   - Create examples for extending with new patterns

2. **Enhance Test Coverage**:
   - Create tests for each matcher
   - Test different combinations of patterns

3. **Create Debugging Tools**:
   - Implement detailed logging for pattern matching
   - Create visualization tools for match results

## Implementation Timeline

1. **Foundation Setup**: 2-3 days
   - Type definitions, centralized patterns, CompromiseJS enhancements

2. **Factory Implementation**: 2-3 days
   - Factory function, common matchers, standard processors

3. **Handler Conversion**: 3-5 days
   - Converting all existing handlers to the new approach

4. **Documentation and Testing**: 2-3 days
   - Updating docs, enhancing tests, creating tools

## Benefits and Impact

This modernization plan offers several significant benefits:

1. **Improved Maintainability**:
   - Consistent structure makes the code easier to understand
   - Centralized patterns reduce duplication

2. **Enhanced Extensibility**:
   - Clear pattern for adding new handlers
   - Reusable components for common functionality

3. **Better Natural Language Processing**:
   - More advanced use of CompromiseJS features
   - More robust pattern recognition

4. **Clearer Documentation**:
   - Documentation can focus on the consistent pattern
   - Examples become more standardized

## Specific Documentation Impacts

As we update the documentation, we should keep this modernization plan in mind:

1. **Pattern Handler Guide**:
   - Should document the factory approach
   - Examples should follow the new pattern

2. **Natural Language Patterns Documentation**:
   - Should reference centralized pattern definitions
   - Should explain how to extend with new patterns

3. **API Reference**:
   - Should clearly document the handler interfaces
   - Should explain the pattern matching process

By aligning our documentation updates with this modernization plan, we ensure the documentation remains relevant and forward-looking, even as the codebase evolves. 