# Implementation Plan: Plural Day Handling with CompromiseJS

*Published: June 1, 2023*  
*Last modified: June 1, 2023*

## Overview

This implementation plan details the specific approach for handling pluralized day names (e.g., "Mondays", "Tuesdays") within the new CompromiseJS-based pattern recognition system for HeliosJS. It builds upon the research documented in [`plural-day-names.md`](_planning/research/nlp-analysis/plural-day-names.md) and addresses the semantic meaning of pluralized day names as inherently recurring patterns.

## Table of Contents

1. [Related Documents](#related-documents)
2. [Problem Statement](#problem-statement)
3. [Implementation Approach](#implementation-approach)
4. [Technical Details](#technical-details)
5. [Testing Strategy](#testing-strategy)
6. [Edge Cases and Considerations](#edge-cases-and-considerations)

## Related Documents

- Research: [Plural Day Names in Recurrence Patterns](_planning/research/nlp-analysis/plural-day-names.md)
- Implementation: [CompromiseJS Integration](_planning/implementation/features/2023-06-01-compromise-integration.md)

## Problem Statement

In natural language, pluralized day names typically indicate a recurring pattern rather than multiple individual instances. For example, "Mondays" inherently means "every Monday" in a recurrence context. The current implementation in HeliosJS normalizes plural day names to singular forms without preserving their semantic meaning as recurring patterns. With the CompromiseJS integration, we have an opportunity to handle this more elegantly.

## Implementation Approach

We will implement plural day handling directly within the CompromiseJS plugin system, which offers several advantages over the current regex-based approach:

1. **Tag-based recognition**: CompromiseJS allows us to tag pluralized day names specifically and handle them differently
2. **Rule-based transformation**: We can create rules to transform plural day semantics into explicit recurrence
3. **Context-aware processing**: We can consider surrounding context to avoid redundancy
4. **Consistent handling**: The approach will work uniformly across all pattern types

### Key Principles

1. Pluralized day names will be tagged as recurring patterns
2. Explicit recurrence indicators ("every", "each") will be recognized and preserved
3. Redundancy will be avoided (e.g., "every mondays" → "every monday", not "every every monday")
4. The implementation will handle mixed forms (e.g., "mondays and this friday")

## Technical Details

### 1. Tag Definition for Plural Days

Within our CompromiseJS plugin, we'll define specific tags for plural day names:

```typescript
// src/compromise/setup.ts
const recurrencePlugin = {
  words: {
    // Plural day forms
    mondays: 'PluralDay',
    tuesdays: 'PluralDay',
    wednesdays: 'PluralDay',
    thursdays: 'PluralDay',
    fridays: 'PluralDay',
    saturdays: 'PluralDay',
    sundays: 'PluralDay',
    
    // Other tags...
  },
  // ...
};
```

### 2. Recognition Rules

We'll add rules to recognize pluralized day names and tag them as recurring patterns:

```typescript
// src/compromise/setup.ts
const recurrencePlugin = {
  // Words definition...
  
  rules: [
    // Plural day name rule (tag as recurring)
    { match: '#PluralDay', tag: 'RecurringDay', reason: 'plural-form' },
    
    // Explicit recurring day (for comparison)
    { match: '(every|each) #WeekDay', tag: 'RecurringDay', reason: 'explicit-recurring' },
    
    // More rules...
  ]
};
```

### 3. Normalization Functions

We'll create a specialized function for normalizing day names in the context of CompromiseJS processing:

```typescript
// src/compromise/dayNormalizer.ts
import nlp from 'compromise';

/**
 * Normalizes day names in a CompromiseJS document, preserving semantics
 * 
 * @param doc - CompromiseJS document
 * @returns Processed document
 */
export function normalizeDayNames(doc) {
  // Replace plural days with explicit recurrence forms
  // but avoid redundancy with existing "every" terms
  doc.match('#PluralDay')
    .not('(every|each) #PluralDay') // Avoid redundancy
    .replaceWith(match => {
      const term = match.terms(0);
      const day = term.text().toLowerCase().replace(/s$/, '');
      return `every ${day}`;
    });
  
  // Fix redundant forms: "every mondays" → "every monday"
  doc.match('(every|each) #PluralDay')
    .replaceWith(match => {
      const prefix = match.match('(every|each)').text();
      const day = match.match('#PluralDay').text().toLowerCase().replace(/s$/, '');
      return `${prefix} ${day}`;
    });
  
  return doc;
}
```

### 4. Integration with Pattern Handlers

The day of week pattern handler will use the tagged information to generate appropriate RRule options:

```typescript
// src/patterns/dayOfWeek.ts
import nlp from 'compromise';
import { RRule } from 'rrule';
import { DAY_MAP, WEEKDAYS, WEEKEND_DAYS } from '../utils/day-mapping';
import { normalizeDayNames } from '../compromise/dayNormalizer';
import type { RecurrenceOptions, PatternHandlerResult } from '../types';

/**
 * Applies day of week pattern recognition using CompromiseJS
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
  
  // Normalize day names in the document
  normalizeDayNames(doc);
  
  // Handle recurring days (from explicit "every day" or plural "mondays")
  const recurringDayMatches = doc.match('#RecurringDay');
  
  if (recurringDayMatches.found) {
    // Extract the day names (now normalized to singular forms)
    const dayNames = recurringDayMatches
      .terms()
      .map(term => {
        // Remove "every" or "each" prefix
        let day = term.text().toLowerCase().replace(/^(every|each)\s+/, '');
        return day;
      })
      .filter(day => DAY_MAP[day]);
    
    if (dayNames.length > 0) {
      options.freq = options.freq || RRule.WEEKLY;
      options.byweekday = dayNames.map(day => DAY_MAP[day]);
      result.matched = true;
    }
  }
  
  // Handle special day groups and other patterns...
  
  return result;
}
```

### 5. Custom Day-of-Week Extractor

To handle complex day patterns, we'll add a utility function that extracts day information from any CompromiseJS match:

```typescript
// src/compromise/extractors.ts
import { DAY_MAP } from '../utils/day-mapping';

/**
 * Extracts day of week information from a CompromiseJS match
 * Handles both singular and pluralized day names
 * 
 * @param match - CompromiseJS match with day information
 * @returns Array of day name strings (lowercase, singular)
 */
export function extractDayNames(match) {
  const days = [];
  
  // Extract day names from the match
  match.terms().forEach(term => {
    // Get the base text
    let text = term.text().toLowerCase();
    
    // Remove prefixes like "every" or "each"
    text = text.replace(/^(every|each)\s+/, '');
    
    // Remove plural suffix
    text = text.replace(/s$/, '');
    
    // Check if it's a valid day name
    if (DAY_MAP[text]) {
      days.push(text);
    }
  });
  
  return days;
}
```

## Testing Strategy

### Unit Tests for Plural Day Handling

```typescript
// test/pluralDays.test.ts
import nlp from 'compromise';
import { setupCompromise } from '../src/compromise/setup';
import { normalizeDayNames } from '../src/compromise/dayNormalizer';
import { extractDayNames } from '../src/compromise/extractors';
import { processRecurrencePattern } from '../src/processor';
import { RRule } from 'rrule';

describe('Plural Day Name Handling', () => {
  beforeAll(() => {
    setupCompromise();
  });
  
  describe('Tag Recognition', () => {
    it('should tag plural day names as PluralDay', () => {
      const doc = nlp('mondays and tuesdays');
      expect(doc.has('#PluralDay')).toBe(true);
      expect(doc.match('#PluralDay').length).toBe(2);
    });
    
    it('should tag pluralized days as RecurringDay', () => {
      const doc = nlp('mondays and fridays');
      expect(doc.has('#RecurringDay')).toBe(true);
    });
  });
  
  describe('Day Name Normalization', () => {
    it('should transform plural days to explicit recurrence', () => {
      const doc = nlp('mondays');
      normalizeDayNames(doc);
      expect(doc.text()).toBe('every monday');
    });
    
    it('should avoid redundancy with existing "every" terms', () => {
      const doc = nlp('every mondays');
      normalizeDayNames(doc);
      expect(doc.text()).toBe('every monday');
    });
    
    it('should handle multiple plural days', () => {
      const doc = nlp('mondays and wednesdays');
      normalizeDayNames(doc);
      expect(doc.text()).toBe('every monday and every wednesday');
    });
    
    it('should handle mixed singular and plural forms', () => {
      const doc = nlp('tuesdays and friday');
      normalizeDayNames(doc);
      expect(doc.text()).toBe('every tuesday and friday');
    });
  });
  
  describe('Day Extraction', () => {
    it('should extract singular days from plural forms', () => {
      const doc = nlp('mondays and tuesdays');
      const match = doc.match('#PluralDay');
      const days = extractDayNames(match);
      expect(days).toContain('monday');
      expect(days).toContain('tuesday');
    });
  });
  
  describe('Pattern Processing', () => {
    it('should correctly process plural day forms', () => {
      const options = processRecurrencePattern('mondays');
      expect(options.freq).toBe(RRule.WEEKLY);
      expect(options.byweekday).toEqual([RRule.MO]);
    });
    
    it('should correctly process multiple plural days', () => {
      const options = processRecurrencePattern('tuesdays and thursdays');
      expect(options.freq).toBe(RRule.WEEKLY);
      expect(options.byweekday).toContain(RRule.TU);
      expect(options.byweekday).toContain(RRule.TH);
    });
    
    it('should correctly process mixed single/plural days', () => {
      const options = processRecurrencePattern('mondays and friday');
      expect(options.freq).toBe(RRule.WEEKLY);
      expect(options.byweekday).toContain(RRule.MO);
      expect(options.byweekday).toContain(RRule.FR);
    });
  });
});
```

### End-to-End Tests

```typescript
// test/e2e/pluralDay.test.ts
import { createRRule } from '../../src/index';
import { RRule } from 'rrule';

describe('End-to-End Plural Day Tests', () => {
  it('should create correct RRules from plural day inputs', () => {
    const startDate = new Date(2023, 0, 1);
    
    // Test with simple plural day
    const rule1 = createRRule(startDate, 'mondays');
    expect(rule1.options.freq).toBe(RRule.WEEKLY);
    expect(rule1.options.byweekday).toEqual([RRule.MO]);
    
    // Test with multiple plural days
    const rule2 = createRRule(startDate, 'wednesdays and fridays');
    expect(rule2.options.freq).toBe(RRule.WEEKLY);
    expect(rule2.options.byweekday).toContain(RRule.WE);
    expect(rule2.options.byweekday).toContain(RRule.FR);
    
    // Test with explicit recurrence and plural
    const rule3 = createRRule(startDate, 'every mondays');
    expect(rule3.options.freq).toBe(RRule.WEEKLY);
    expect(rule3.options.byweekday).toEqual([RRule.MO]);
    
    // Test with mixed forms
    const rule4 = createRRule(startDate, 'tuesdays and this friday');
    expect(rule4.options.freq).toBe(RRule.WEEKLY);
    expect(rule4.options.byweekday).toContain(RRule.TU);
    expect(rule4.options.byweekday).toContain(RRule.FR);
  });
  
  it('should handle complex recurrence with plurals', () => {
    const startDate = new Date(2023, 0, 1);
    
    // Test with interval and plural
    const rule1 = createRRule(startDate, 'every 2 weeks on mondays');
    expect(rule1.options.freq).toBe(RRule.WEEKLY);
    expect(rule1.options.interval).toBe(2);
    expect(rule1.options.byweekday).toEqual([RRule.MO]);
    
    // Test with plural and until
    const rule2 = createRRule(startDate, 'mondays until december');
    expect(rule2.options.freq).toBe(RRule.WEEKLY);
    expect(rule2.options.byweekday).toEqual([RRule.MO]);
    expect(rule2.options.until).toBeDefined();
  });
});
```

## Edge Cases and Considerations

### 1. Possessive Forms

Some expressions might use possessive forms like "Monday's meeting" which should not be confused with the plural "Mondays". We need to ensure our pattern matching distinguishes between these cases.

```typescript
// In the CompromiseJS rules
{ 
  match: '#WeekDay apostrophe s', 
  tag: 'Possessive', 
  unTag: 'PluralDay'
}
```

### 2. Mixed Recurrence Indicators

When plural days appear alongside explicit recurrence indicators for other days, we need to handle them consistently:

```
"Mondays and every Wednesday" → "every Monday and every Wednesday"
```

### 3. Limited Recurrence

For expressions that limit recurrence to a specific number of occurrences:

```
"The next three Mondays" → This is not an indefinitely recurring pattern
```

We'll need special rules to detect these qualifying expressions and handle them differently.

### 4. Interaction with Other Pattern Types

We need to ensure that plural day handling works correctly when combined with other pattern types:

```
"Mondays at 3pm" → "every Monday at 3pm"
"Every 2 weeks on Tuesdays" → "every 2 weeks on Tuesday"
```

### 5. Performance Considerations

The additional processing for plural day handling should have minimal impact on performance. We'll optimize the implementation to ensure efficient processing, particularly when handling multiple pattern handlers.

## Implementation Timeline

1. **Day 1-2**: Implement core CompromiseJS tags and rules for plural days
2. **Day 3-4**: Develop and test the day name normalization functions
3. **Day 5-6**: Integrate with pattern handlers and test basic functionality
4. **Day 7-8**: Handle edge cases and complex interactions
5. **Day 9-10**: Comprehensive testing and performance optimization

This implementation will be developed as part of the broader CompromiseJS integration but can be prioritized early in the process to ensure this important semantic handling is properly addressed. 