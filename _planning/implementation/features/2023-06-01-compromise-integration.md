# Implementation Plan: CompromiseJS Integration for HeliosJS

*Published: June 1, 2023*  
*Last modified: June 1, 2023*

## Overview

This implementation plan outlines the complete overhaul of HeliosJS's pattern recognition system, replacing the current regex-based approach with CompromiseJS - a modern natural language processing library. This change aims to improve maintainability, extensibility, and accuracy of pattern recognition while preserving the domain-specific knowledge already developed.

The implementation will focus on using CompromiseJS for pattern matching while maintaining the core transformation logic that converts recognized patterns to RRule configurations. Additionally, we'll integrate Chrono for enhanced date parsing capabilities.

## Table of Contents

1. [Related Documents](#related-documents)
2. [Goals and Success Criteria](#goals-and-success-criteria)
3. [Implementation Strategy](#implementation-strategy)
4. [Development Phases](#development-phases)
5. [Technical Design](#technical-design)
6. [Testing Strategy](#testing-strategy)
7. [Migration and Rollout](#migration-and-rollout)
8. [Risks and Mitigations](#risks-and-mitigations)
9. [Future Considerations](#future-considerations)

## Related Documents

- Research: [Plural Day Names in Recurrence Patterns](_planning/research/nlp-analysis/plural-day-names.md)
- Pattern Catalog: [Comprehensive Natural Language Pattern Catalog](_planning/research/supported-patterns.md)

## Goals and Success Criteria

### Primary Goals

1. Replace regex-based pattern matching with CompromiseJS
2. Maintain semantic accuracy of pattern recognition
3. Implement proper handling of plural day names
4. Improve maintainability of the pattern recognition system
5. Preserve the public API for a clean rewrite

### Success Criteria

1. All existing tests pass with the new implementation
2. All patterns in the pattern catalog are properly recognized
3. Plural day names are correctly interpreted as recurring patterns
4. Performance remains at or exceeds current levels
5. Code complexity metrics show improvement

## Implementation Strategy

### Approach Summary

We will follow a comprehensive rewrite approach, replacing the current pattern recognition system with a CompromiseJS-based solution. The implementation will:

1. Use CompromiseJS for pattern recognition and text normalization
2. Integrate Chrono for date parsing in "until" patterns
3. Create a custom CompromiseJS plugin for domain-specific recurrence terms
4. Develop pattern handlers that use CompromiseJS instead of regex
5. Ensure seamless integration with the existing RRule transformation logic

### New Architecture

```
User Input → CompromiseJS Processing → Pattern Recognition → RRule Transformation → RRule Instance
                      ↓                         ↓                     ↓
            Custom Language Model       Pattern Handlers       Existing Utilities
```

### Folder Structure Updates

```
src/
  index.ts                 - Main API (remains largely unchanged)
  processor.ts             - New processor using CompromiseJS (replaces transformer.ts)
  compromise/
    setup.ts               - CompromiseJS configuration and plugin setup
    patterns.ts            - Custom language patterns for CompromiseJS
  patterns/
    frequency.ts           - Frequency pattern handler using CompromiseJS
    interval.ts            - Interval pattern handler using CompromiseJS
    dayOfWeek.ts           - Day pattern handler with plural support
    dayOfMonth.ts          - Month day pattern handler
    untilDate.ts           - Date pattern handler using Chrono
  utils/                   - Mostly unchanged utility functions
  types.ts                 - Updated type definitions
```

## Development Phases

### Phase 1: Setup and Infrastructure (1 week)

1. Add dependencies:
   - CompromiseJS (`compromise`)
   - Chrono (`chrono-node`)

2. Create basic infrastructure:
   - Set up CompromiseJS plugin
   - Create processor module structure
   - Define updated TypeScript interfaces

3. Create test infrastructure:
   - Unit test framework for NLP components
   - Comparison tests between old and new implementations

### Phase 2: Core Pattern Recognition Implementation (2 weeks)

1. Implement basic pattern recognition with CompromiseJS:
   - Frequency patterns (daily, weekly, monthly, yearly)
   - Interval patterns (every N days, biweekly, etc.)
   - Day of week patterns with plural support
   - Day of month patterns
   - Until date patterns with Chrono integration

2. Develop custom language model for recurrence terms:
   - Define tags for different recurrence concepts
   - Create rule set for pattern recognition
   - Implement special handling for plural day names

### Phase 3: Integration and Refinement (1 week)

1. Integrate pattern handlers with main processor
2. Connect with existing RRule transformation logic
3. Update public API to use new processor
4. Refine implementations based on test results

### Phase 4: Testing and Optimization (1 week)

1. Comprehensive testing against pattern catalog
2. Performance optimization
3. Edge case handling
4. Documentation updates

## Technical Design

### 1. Core Processor Module

```typescript
// src/processor.ts
import nlp from 'compromise';
import { setupCompromise } from './compromise/setup';
import { applyFrequencyPatterns } from './patterns/frequency';
import { applyIntervalPatterns } from './patterns/interval';
import { applyDayOfWeekPatterns } from './patterns/dayOfWeek';
import { applyDayOfMonthPatterns } from './patterns/dayOfMonth';
import { applyUntilDatePatterns } from './patterns/untilDate';
import type { RecurrenceOptions, TransformerConfig, TransformationResult } from './types';

// Initialize CompromiseJS with our custom plugin
setupCompromise();

/**
 * Processes a natural language recurrence pattern into RRule options
 * 
 * @param pattern - Natural language recurrence pattern
 * @param config - Optional configuration options
 * @returns RRule options and transformation metadata
 */
export function processRecurrencePattern(
  pattern: string,
  config?: Partial<TransformerConfig>
): RecurrenceOptions & TransformationResult {
  // Initialize result object
  const options: RecurrenceOptions & TransformationResult = {
    freq: null,
    interval: 1,
    byweekday: null,
    bymonthday: null,
    bymonth: null,
    until: null,
    count: null,
    wkst: null,
    bysetpos: null,
    byyearday: null,
    byweekno: null,
    byhour: null,
    byminute: null,
    bysecond: null,
    matchedPatterns: [],
    confidence: 1.0,
    warnings: []
  };
  
  // Process pattern with CompromiseJS
  const doc = nlp(pattern);
  
  // Apply pattern handlers in priority order
  // (following the same order as the current implementation)
  const handlers = [
    { name: 'interval', handler: applyIntervalPatterns },
    { name: 'frequency', handler: applyFrequencyPatterns },
    { name: 'dayOfWeek', handler: applyDayOfWeekPatterns },
    { name: 'dayOfMonth', handler: applyDayOfMonthPatterns },
    { name: 'untilDate', handler: applyUntilDatePatterns }
  ];
  
  for (const { name, handler } of handlers) {
    const result = handler(doc, options, config);
    if (result && result.matched) {
      options.matchedPatterns.push(name);
      // Merge metadata from handler result
      if (result.confidence) {
        options.confidence = Math.min(options.confidence, result.confidence);
      }
      if (result.warnings && result.warnings.length > 0) {
        options.warnings.push(...result.warnings);
      }
    }
  }
  
  // Apply default values for missing properties
  applyDefaults(options, config);
  
  return options;
}

/**
 * Applies default values for missing properties
 */
function applyDefaults(options: RecurrenceOptions, config?: Partial<TransformerConfig>): void {
  // Similar to current implementation
}
```

### 2. CompromiseJS Setup and Plugin

```typescript
// src/compromise/setup.ts
import nlp from 'compromise';
import { recurrencePatterns } from './patterns';

/**
 * Sets up CompromiseJS with our custom language model for recurrence patterns
 */
export function setupCompromise(): void {
  // Create custom plugin for recurrence patterns
  const recurrencePlugin = {
    words: {
      // Day names
      monday: 'WeekDay',
      tuesday: 'WeekDay',
      wednesday: 'WeekDay',
      thursday: 'WeekDay',
      friday: 'WeekDay',
      saturday: 'WeekDay',
      sunday: 'WeekDay',
      
      // Plural day forms
      mondays: 'PluralDay',
      tuesdays: 'PluralDay',
      wednesdays: 'PluralDay',
      thursdays: 'PluralDay',
      fridays: 'PluralDay',
      saturdays: 'PluralDay',
      sundays: 'PluralDay',
      
      // Day abbreviations
      mon: 'WeekDayAbbr',
      tue: 'WeekDayAbbr',
      wed: 'WeekDayAbbr',
      thu: 'WeekDayAbbr',
      fri: 'WeekDayAbbr',
      sat: 'WeekDayAbbr',
      sun: 'WeekDayAbbr',
      
      // Special day groups
      weekday: 'DayGroup',
      weekend: 'DayGroup',
      
      // Frequency terms
      daily: 'Frequency',
      weekly: 'Frequency',
      monthly: 'Frequency',
      yearly: 'Frequency',
      annually: 'Frequency',
      
      // Special interval terms
      biweekly: 'Interval',
      fortnightly: 'Interval',
      bimonthly: 'Interval',
      
      // Until terms
      until: 'Until',
      through: 'Until',
      ending: 'Until',
    },
    
    rules: [
      // Plural day name rule (transform to recurring pattern)
      { match: '#PluralDay', tag: 'RecurringDay', reason: 'plural-form' },
      
      // Explicit recurring day
      { match: '(every|each) #WeekDay', tag: 'RecurringDay', reason: 'explicit-recurring' },
      
      // Special day groups
      { match: '(every|each) #DayGroup', tag: 'RecurringDayGroup', reason: 'day-group' },
      
      // Interval patterns
      { match: 'every #Value (day|week|month|year)', tag: 'IntervalPattern', reason: 'numbered-interval' },
      { match: 'every other (day|week|month|year)', tag: 'IntervalPattern', reason: 'every-other' },
      
      // Special intervals
      { match: '#Interval', tag: 'IntervalPattern', reason: 'special-interval' },
      
      // Until patterns
      { match: '#Until .+', tag: 'UntilPattern', reason: 'until-date' },
      
      // Add more rules for other patterns
    ]
  };
  
  // Extended patterns from our custom patterns module
  recurrencePlugin.rules = recurrencePlugin.rules.concat(recurrencePatterns);
  
  // Register the plugin with CompromiseJS
  nlp.extend(recurrencePlugin);
}
```

### 3. Pattern Handlers (Example: Day of Week Pattern)

```typescript
// src/patterns/dayOfWeek.ts
import nlp from 'compromise';
import { RRule } from 'rrule';
import { DAY_MAP, WEEKDAYS, WEEKEND_DAYS } from '../utils/day-mapping';
import type { RecurrenceOptions, PatternHandlerResult } from '../types';

/**
 * Applies day of week pattern recognition using CompromiseJS
 * 
 * @param doc - CompromiseJS document
 * @param options - Current recurrence options
 * @param config - Optional configuration
 * @returns Pattern match result
 */
export function applyDayOfWeekPatterns(
  doc,
  options: RecurrenceOptions,
  config?: any
): PatternHandlerResult {
  const result: PatternHandlerResult = {
    matched: false,
    confidence: 1.0,
    warnings: []
  };
  
  // Handle weekday/weekend groups
  if (doc.has('(every|each) weekday')) {
    options.freq = options.freq || RRule.WEEKLY;
    options.byweekday = WEEKDAYS;
    result.matched = true;
    return result;
  }
  
  if (doc.has('(every|each) weekend')) {
    options.freq = options.freq || RRule.WEEKLY;
    options.byweekday = WEEKEND_DAYS;
    result.matched = true;
    return result;
  }
  
  // Handle recurring days (from explicit "every day" or plural "mondays")
  const recurringDayMatches = doc.match('#RecurringDay');
  
  if (recurringDayMatches.found) {
    // Extract day names, normalizing plurals to singular
    const dayNames = recurringDayMatches
      .terms()
      .map(term => {
        // Get the day name, removing any prefix like "every" and any plural "s"
        let day = term.text().toLowerCase();
        
        // Remove "every" or "each" prefix if present
        day = day.replace(/^(every|each)\s+/, '');
        
        // Remove plural "s" if present
        day = day.replace(/s$/, '');
        
        return day;
      })
      .filter(day => DAY_MAP[day]); // Filter out any invalid day names
    
    // If we found valid day names, set the appropriate RRule options
    if (dayNames.length > 0) {
      options.freq = options.freq || RRule.WEEKLY;
      options.byweekday = dayNames.map(day => DAY_MAP[day]);
      result.matched = true;
    }
  }
  
  return result;
}
```

### 4. Updated Public API Integration

```typescript
// src/index.ts
import { RRule } from 'rrule';
import { processRecurrencePattern } from './processor';
import type { TransformerConfig, TransformationResult } from './types';

/**
 * Converts a natural language recurrence pattern to an RRule options object
 * 
 * @param startDate - The start date for the recurrence pattern
 * @param recurrencePattern - Natural language description
 * @param config - Optional configuration
 * @returns RRule configuration object
 */
export function naturalLanguageToRRule(
  startDate: Date,
  recurrencePattern: string,
  config?: Partial<TransformerConfig>
): RRuleOptions & TransformationResult {
  // Process the natural language pattern
  const options = processRecurrencePattern(recurrencePattern, config);
  
  // Add start date to options
  options.dtstart = startDate;
  
  return options;
}

/**
 * Creates an RRule instance from a natural language recurrence pattern
 * 
 * @param startDate - The start date for the recurrence pattern
 * @param recurrencePattern - Natural language description
 * @param config - Optional configuration
 * @returns RRule instance
 */
export function createRRule(
  startDate: Date,
  recurrencePattern: string,
  config?: Partial<TransformerConfig>
): RRule {
  // Get the RRule options
  const options = naturalLanguageToRRule(startDate, recurrencePattern, config);
  
  // Create and return the RRule instance
  return new RRule(options);
}

// Other API functions (validatePattern, etc.) remain similar but use the new processor
```

## Testing Strategy

### Unit Tests

1. CompromiseJS plugin tests:
   - Test custom tags and rules
   - Test plural day name transformations
   - Test pattern recognition for different categories

2. Pattern handler tests:
   - Test each handler independently
   - Verify correct RRule option generation
   - Test handling of complex combinations

3. Processor tests:
   - Test end-to-end processing pipeline
   - Verify correct options for each pattern type
   - Test with the complete pattern catalog

### Integration Tests

1. API integration tests:
   - Test naturalLanguageToRRule function
   - Test createRRule function
   - Test validatePattern function

2. Cross-module integration tests:
   - Test interactions between pattern handlers
   - Test priority order of pattern application

### Performance Tests

1. Benchmark tests:
   - Compare performance with current implementation
   - Test with large numbers of patterns
   - Identify and optimize slow operations

### Regression Tests

1. Side-by-side comparison:
   - Compare outputs between old and new implementations
   - Ensure consistent behavior for all supported patterns
   - Verify that no edge cases are missed

## Migration and Rollout

### Phase 1: Development

1. Develop the new implementation in parallel with the existing code
2. Build a comprehensive test suite
3. Document the new approach and architecture

### Phase 2: Verification

1. Run side-by-side tests with the current implementation
2. Fix any discrepancies or edge cases
3. Benchmark performance and optimize if needed

### Phase 3: Swap Implementation

1. Replace the transformer with the new processor
2. Update the public API methods to use the new processor
3. Run final verification tests

### Phase 4: Cleanup

1. Remove deprecated code
2. Update all documentation
3. Finalize the implementation

## Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Semantic differences in pattern recognition | High | Medium | Comprehensive testing against pattern catalog; side-by-side comparison with current implementation |
| Performance regression | Medium | Low | Performance benchmarking; optimization of CompromiseJS plugin |
| Edge cases not handled correctly | High | Medium | Extensive testing with edge cases; maintain test coverage |
| CompromiseJS API changes | Medium | Low | Lock dependency version; monitor for updates |
| Increased bundle size | Low | High | Consider code splitting; optimize for production builds |

## Future Considerations

1. **Advanced Pattern Support**:
   - Support for complex positioned patterns (e.g., "first Monday of each month")
   - Support for temporal expressions ("next quarter", "for the next 3 months")

2. **Multilingual Support**:
   - Leverage CompromiseJS's language extensions for multilingual pattern recognition
   - Develop localized pattern handlers

3. **Performance Optimization**:
   - Investigate lazy loading of CompromiseJS components
   - Create specialized builds for different environments

4. **Extended Pattern Customization**:
   - Allow users to define custom patterns
   - Provide extensibility points for domain-specific patterns

5. **User Feedback Integration**:
   - Collect data on unrecognized patterns
   - Use feedback to improve pattern recognition 