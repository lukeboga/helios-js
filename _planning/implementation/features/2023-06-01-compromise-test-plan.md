# Comprehensive Test Plan for CompromiseJS Integration

*Published: June 1, 2023*  
*Last modified: June 1, 2023*

## Overview

This test plan outlines the comprehensive testing strategy for the CompromiseJS integration in HeliosJS. Testing is a critical component of this implementation to ensure accuracy, reliability, and performance. The plan covers unit testing, integration testing, performance testing, and user acceptance testing.

## Table of Contents

1. [Testing Goals](#testing-goals)
2. [Testing Framework](#testing-framework)
3. [Test Categories](#test-categories)
4. [Pattern Coverage](#pattern-coverage)
5. [Comparison Testing](#comparison-testing)
6. [Edge Case Testing](#edge-case-testing)
7. [Continuous Integration](#continuous-integration)
8. [Test Implementation Timeline](#test-implementation-timeline)

## Testing Goals

1. **Verify Functionality**: Ensure the CompromiseJS-based implementation correctly recognizes all supported patterns
2. **Ensure Compatibility**: Verify that the new implementation matches the behavior of the current implementation
3. **Validate Performance**: Confirm that performance meets or exceeds the current implementation
4. **Stress Test**: Verify behavior under high load and with complex patterns
5. **Identify Edge Cases**: Discover and address edge cases and potential issues

## Testing Framework

We will use the following tools and frameworks for testing:

1. **Test runner**: Jest
2. **Assertion library**: Jest's built-in assertions
3. **Coverage tool**: Istanbul (integrated with Jest)
4. **Mocking**: Jest's mocking capabilities
5. **Benchmarking**: Benchmark.js

## Test Categories

### 1. Unit Tests

Unit tests will verify the correct behavior of individual components in isolation.

#### CompromiseJS Setup and Plugin

```typescript
// test/compromise/setup.test.ts
import nlp from 'compromise';
import { setupCompromise } from '../../src/compromise/setup';

describe('CompromiseJS Setup', () => {
  beforeAll(() => {
    setupCompromise();
  });
  
  describe('Custom Tags', () => {
    it('should correctly tag day names', () => {
      const doc = nlp('monday tuesday wednesday');
      expect(doc.has('#WeekDay')).toBe(true);
      expect(doc.match('#WeekDay').length).toBe(3);
    });
    
    it('should correctly tag plural day names', () => {
      const doc = nlp('mondays tuesdays');
      expect(doc.has('#PluralDay')).toBe(true);
      expect(doc.match('#PluralDay').length).toBe(2);
    });
    
    it('should correctly tag frequency terms', () => {
      const doc = nlp('daily weekly monthly yearly');
      expect(doc.has('#Frequency')).toBe(true);
      expect(doc.match('#Frequency').length).toBe(4);
    });
    
    it('should correctly tag interval terms', () => {
      const doc = nlp('biweekly fortnightly');
      expect(doc.has('#Interval')).toBe(true);
      expect(doc.match('#Interval').length).toBe(2);
    });
    
    it('should correctly tag day groups', () => {
      const doc = nlp('weekday weekend');
      expect(doc.has('#DayGroup')).toBe(true);
      expect(doc.match('#DayGroup').length).toBe(2);
    });
    
    it('should correctly tag until terms', () => {
      const doc = nlp('until through ending');
      expect(doc.has('#Until')).toBe(true);
      expect(doc.match('#Until').length).toBe(3);
    });
  });
  
  describe('Rule Application', () => {
    it('should tag recurring days correctly', () => {
      const doc = nlp('mondays every tuesday');
      expect(doc.has('#RecurringDay')).toBe(true);
      expect(doc.match('#RecurringDay').length).toBe(2);
    });
    
    it('should tag interval patterns correctly', () => {
      const doc = nlp('every 2 weeks every other day');
      expect(doc.has('#IntervalPattern')).toBe(true);
      expect(doc.match('#IntervalPattern').length).toBe(2);
    });
    
    it('should tag until patterns correctly', () => {
      const doc = nlp('until December ending next week');
      expect(doc.has('#UntilPattern')).toBe(true);
      expect(doc.match('#UntilPattern').length).toBe(2);
    });
  });
});
```

#### Pattern Handlers

```typescript
// test/patterns/dayOfWeek.test.ts
import nlp from 'compromise';
import { setupCompromise } from '../../src/compromise/setup';
import { applyDayOfWeekPatterns } from '../../src/patterns/dayOfWeek';
import { RRule } from 'rrule';

describe('Day of Week Pattern Handler', () => {
  beforeAll(() => {
    setupCompromise();
  });
  
  it('should handle single day patterns', () => {
    const doc = nlp('every monday');
    const options = {};
    const result = applyDayOfWeekPatterns(doc, options);
    
    expect(result.matched).toBe(true);
    expect(options.freq).toBe(RRule.WEEKLY);
    expect(options.byweekday).toContain(RRule.MO);
  });
  
  it('should handle multiple days', () => {
    const doc = nlp('every monday and wednesday');
    const options = {};
    const result = applyDayOfWeekPatterns(doc, options);
    
    expect(result.matched).toBe(true);
    expect(options.freq).toBe(RRule.WEEKLY);
    expect(options.byweekday).toContain(RRule.MO);
    expect(options.byweekday).toContain(RRule.WE);
  });
  
  it('should handle plural days', () => {
    const doc = nlp('mondays');
    const options = {};
    const result = applyDayOfWeekPatterns(doc, options);
    
    expect(result.matched).toBe(true);
    expect(options.freq).toBe(RRule.WEEKLY);
    expect(options.byweekday).toContain(RRule.MO);
  });
  
  it('should handle weekdays', () => {
    const doc = nlp('every weekday');
    const options = {};
    const result = applyDayOfWeekPatterns(doc, options);
    
    expect(result.matched).toBe(true);
    expect(options.freq).toBe(RRule.WEEKLY);
    expect(options.byweekday).toContain(RRule.MO);
    expect(options.byweekday).toContain(RRule.TU);
    expect(options.byweekday).toContain(RRule.WE);
    expect(options.byweekday).toContain(RRule.TH);
    expect(options.byweekday).toContain(RRule.FR);
  });
  
  it('should handle weekend', () => {
    const doc = nlp('every weekend');
    const options = {};
    const result = applyDayOfWeekPatterns(doc, options);
    
    expect(result.matched).toBe(true);
    expect(options.freq).toBe(RRule.WEEKLY);
    expect(options.byweekday).toContain(RRule.SA);
    expect(options.byweekday).toContain(RRule.SU);
  });
});

// Similar tests for other pattern handlers (frequency, interval, etc.)
```

#### Processor

```typescript
// test/processor.test.ts
import { processRecurrencePattern } from '../src/processor';
import { RRule } from 'rrule';

describe('Processor', () => {
  describe('Basic patterns', () => {
    it('should process daily pattern', () => {
      const options = processRecurrencePattern('daily');
      expect(options.freq).toBe(RRule.DAILY);
      expect(options.interval).toBe(1);
    });
    
    it('should process weekly pattern', () => {
      const options = processRecurrencePattern('weekly');
      expect(options.freq).toBe(RRule.WEEKLY);
      expect(options.interval).toBe(1);
    });
    
    it('should process monthly pattern', () => {
      const options = processRecurrencePattern('monthly');
      expect(options.freq).toBe(RRule.MONTHLY);
      expect(options.interval).toBe(1);
    });
  });
  
  describe('Interval patterns', () => {
    it('should process numeric interval', () => {
      const options = processRecurrencePattern('every 2 weeks');
      expect(options.freq).toBe(RRule.WEEKLY);
      expect(options.interval).toBe(2);
    });
    
    it('should process "every other" pattern', () => {
      const options = processRecurrencePattern('every other day');
      expect(options.freq).toBe(RRule.DAILY);
      expect(options.interval).toBe(2);
    });
    
    it('should process special interval terms', () => {
      const options = processRecurrencePattern('biweekly');
      expect(options.freq).toBe(RRule.WEEKLY);
      expect(options.interval).toBe(2);
    });
  });
  
  describe('Day patterns', () => {
    it('should process single day', () => {
      const options = processRecurrencePattern('every monday');
      expect(options.freq).toBe(RRule.WEEKLY);
      expect(options.byweekday).toContain(RRule.MO);
    });
    
    it('should process multiple days', () => {
      const options = processRecurrencePattern('every monday and wednesday');
      expect(options.freq).toBe(RRule.WEEKLY);
      expect(options.byweekday).toContain(RRule.MO);
      expect(options.byweekday).toContain(RRule.WE);
    });
    
    it('should process plural days', () => {
      const options = processRecurrencePattern('mondays');
      expect(options.freq).toBe(RRule.WEEKLY);
      expect(options.byweekday).toContain(RRule.MO);
    });
  });
  
  describe('Combined patterns', () => {
    it('should process interval with day', () => {
      const options = processRecurrencePattern('every 2 weeks on monday');
      expect(options.freq).toBe(RRule.WEEKLY);
      expect(options.interval).toBe(2);
      expect(options.byweekday).toContain(RRule.MO);
    });
    
    it('should process day with until', () => {
      const options = processRecurrencePattern('every monday until december');
      expect(options.freq).toBe(RRule.WEEKLY);
      expect(options.byweekday).toContain(RRule.MO);
      expect(options.until).toBeDefined();
    });
  });
});
```

### 2. Integration Tests

Integration tests will verify that the components work correctly together and with the RRule library.

```typescript
// test/integration/naturalLanguageToRRule.test.ts
import { naturalLanguageToRRule, createRRule } from '../../src/index';
import { RRule } from 'rrule';

describe('Natural Language to RRule Integration', () => {
  describe('naturalLanguageToRRule', () => {
    it('should convert simple patterns to RRule options', () => {
      const startDate = new Date(2023, 0, 1);
      const options = naturalLanguageToRRule(startDate, 'daily');
      
      expect(options.freq).toBe(RRule.DAILY);
      expect(options.dtstart).toEqual(startDate);
    });
    
    it('should convert complex patterns to RRule options', () => {
      const startDate = new Date(2023, 0, 1);
      const options = naturalLanguageToRRule(
        startDate, 
        'every 2 weeks on monday and friday until december 31'
      );
      
      expect(options.freq).toBe(RRule.WEEKLY);
      expect(options.interval).toBe(2);
      expect(options.byweekday).toContain(RRule.MO);
      expect(options.byweekday).toContain(RRule.FR);
      expect(options.until).toBeDefined();
      expect(options.dtstart).toEqual(startDate);
    });
  });
  
  describe('createRRule', () => {
    it('should create an RRule instance from a simple pattern', () => {
      const startDate = new Date(2023, 0, 1);
      const rule = createRRule(startDate, 'daily');
      
      expect(rule).toBeInstanceOf(RRule);
      expect(rule.options.freq).toBe(RRule.DAILY);
      expect(rule.options.dtstart).toEqual(startDate);
    });
    
    it('should create an RRule instance that generates correct dates', () => {
      const startDate = new Date(2023, 0, 1); // Sunday
      const rule = createRRule(startDate, 'every monday');
      
      const dates = rule.all((date, i) => i < 3);
      
      // First three Mondays after Jan 1, 2023
      expect(dates[0].getDate()).toBe(2); // Jan 2
      expect(dates[1].getDate()).toBe(9); // Jan 9
      expect(dates[2].getDate()).toBe(16); // Jan 16
    });
    
    it('should create an RRule instance with correct interval', () => {
      const startDate = new Date(2023, 0, 1);
      const rule = createRRule(startDate, 'every 2 weeks');
      
      const dates = rule.all((date, i) => i < 3);
      
      // Biweekly from Jan 1, 2023
      expect(dates[0].getDate()).toBe(1); // Jan 1
      expect(dates[1].getDate()).toBe(15); // Jan 15
      expect(dates[2].getDate()).toBe(29); // Jan 29
    });
    
    it('should create an RRule instance with correct until date', () => {
      const startDate = new Date(2023, 0, 1);
      const rule = createRRule(startDate, 'daily until january 15, 2023');
      
      const dates = rule.all();
      
      expect(dates.length).toBe(15); // Jan 1 to Jan 15
      expect(dates[dates.length - 1].getDate()).toBe(15); // Last date is Jan 15
    });
  });
});
```

### 3. End-to-End Tests

End-to-end tests verify the complete flow from natural language input to RRule output and date generation.

```typescript
// test/e2e/recurrencePatterns.test.ts
import { createRRule } from '../../src/index';
import { RRule } from 'rrule';

describe('End-to-End Recurrence Pattern Tests', () => {
  it('should generate correct dates for daily pattern', () => {
    const startDate = new Date(2023, 0, 1);
    const rule = createRRule(startDate, 'daily');
    
    const dates = rule.all((date, i) => i < 7);
    
    expect(dates.length).toBe(7);
    for (let i = 0; i < 7; i++) {
      expect(dates[i].getDate()).toBe(1 + i);
    }
  });
  
  it('should generate correct dates for weekly pattern with days', () => {
    const startDate = new Date(2023, 0, 1); // Sunday
    const rule = createRRule(startDate, 'weekly on monday and wednesday');
    
    const dates = rule.all((date, i) => i < 4);
    
    // First two weeks of Monday and Wednesday
    expect(dates[0].getDate()).toBe(2); // Monday, Jan 2
    expect(dates[1].getDate()).toBe(4); // Wednesday, Jan 4
    expect(dates[2].getDate()).toBe(9); // Monday, Jan 9
    expect(dates[3].getDate()).toBe(11); // Wednesday, Jan 11
  });
  
  it('should generate correct dates for monthly pattern', () => {
    const startDate = new Date(2023, 0, 15);
    const rule = createRRule(startDate, 'monthly on the 15th');
    
    const dates = rule.all((date, i) => i < 3);
    
    expect(dates[0].getMonth()).toBe(0); // January
    expect(dates[0].getDate()).toBe(15);
    expect(dates[1].getMonth()).toBe(1); // February
    expect(dates[1].getDate()).toBe(15);
    expect(dates[2].getMonth()).toBe(2); // March
    expect(dates[2].getDate()).toBe(15);
  });
  
  it('should generate correct dates for complex pattern', () => {
    const startDate = new Date(2023, 0, 1);
    const rule = createRRule(
      startDate, 
      'every 2 weeks on monday and friday until march 31, 2023'
    );
    
    const dates = rule.all();
    
    // Check that dates are only Mondays and Fridays
    for (const date of dates) {
      const day = date.getDay();
      expect(day === 1 || day === 5).toBe(true); // Monday (1) or Friday (5)
    }
    
    // Check biweekly pattern
    expect(dates[2].getDate() - dates[0].getDate()).toBe(14); // 2 weeks between first and third date
    
    // Check until date
    const lastDate = dates[dates.length - 1];
    expect(lastDate <= new Date(2023, 2, 31)).toBe(true); // Last date is before or on March 31
  });
});
```

### 4. Performance Tests

Performance tests measure the speed and efficiency of the implementation.

```typescript
// test/performance/benchmarks.ts
import { Suite } from 'benchmark';
import { processRecurrencePattern } from '../../src/processor';
import { transformRecurrencePattern } from '../../src/transformer'; // Current implementation

// Sample patterns
const patterns = [
  'daily',
  'weekly',
  'monthly',
  'yearly',
  'every monday',
  'every tuesday and thursday',
  'every 2 weeks',
  'monthly on the 15th',
  'every monday until december',
  'every 2 weeks on monday and wednesday until december 31, 2023'
];

// Create benchmark suite
const suite = new Suite();

// Add benchmarks for both implementations
patterns.forEach(pattern => {
  suite.add(`Current: ${pattern}`, () => {
    transformRecurrencePattern(pattern);
  });
  
  suite.add(`CompromiseJS: ${pattern}`, () => {
    processRecurrencePattern(pattern);
  });
});

// Run benchmarks
suite
  .on('cycle', (event) => {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run({ async: true });
```

### 5. Comparison Tests

Comparison tests verify that the new implementation produces the same results as the current implementation.

```typescript
// test/comparison/patternEquivalence.test.ts
import { processRecurrencePattern } from '../../src/processor';
import { transformRecurrencePattern } from '../../src/transformer'; // Current implementation

describe('Pattern Equivalence Tests', () => {
  // Test patterns from the pattern catalog
  const patterns = [
    'daily',
    'weekly',
    'monthly',
    'yearly',
    'every day',
    'every week',
    'every month',
    'every year',
    'every 2 days',
    'every 3 weeks',
    'every 4 months',
    'every 5 years',
    'every other day',
    'every other week',
    'every other month',
    'every other year',
    'biweekly',
    'fortnightly',
    'every monday',
    'every tuesday and thursday',
    'every weekday',
    'every weekend',
    '1st of the month',
    'on the 15th',
    'last day of month',
    'until december 31',
    'ending next month',
    'every other monday',
    'every 3 weeks on friday',
    'every monday until december'
  ];
  
  // Test each pattern
  patterns.forEach(pattern => {
    it(`should produce equivalent results for: "${pattern}"`, () => {
      const currentOptions = transformRecurrencePattern(pattern);
      const newOptions = processRecurrencePattern(pattern);
      
      // Compare core RRule options
      expect(newOptions.freq).toBe(currentOptions.freq);
      expect(newOptions.interval).toBe(currentOptions.interval);
      
      // Compare byweekday (handling array comparison)
      if (currentOptions.byweekday === null) {
        expect(newOptions.byweekday).toBeNull();
      } else {
        // Sort arrays for consistent comparison
        const sortedCurrent = [...currentOptions.byweekday].sort();
        const sortedNew = [...newOptions.byweekday].sort();
        expect(sortedNew).toEqual(sortedCurrent);
      }
      
      // Compare bymonthday
      expect(newOptions.bymonthday).toEqual(currentOptions.bymonthday);
      
      // Compare other options...
    });
  });
});
```

## Pattern Coverage

To ensure comprehensive testing, we need to test all patterns listed in the pattern catalog document. The following table outlines the pattern categories and test coverage:

| Pattern Category | Examples | Test Coverage |
|-----------------|----------|--------------|
| Basic Frequency | daily, weekly, monthly, yearly | Unit & integration tests |
| Interval | every 2 days, every other week | Unit & integration tests |
| Day of Week | every monday, weekdays | Unit & integration tests |
| Day of Month | 1st of month, last day | Unit & integration tests |
| Until Date | until december, ending next month | Unit & integration tests |
| Combined | every 2 weeks on monday, weekly until december | Integration & E2E tests |
| Plural Day Names | mondays, tuesdays and fridays | Dedicated tests |
| Edge Cases | ambiguous patterns, complex combinations | Special edge case tests |

Each pattern category should have dedicated tests, and we should aim for 100% coverage of all documented patterns.

## Edge Case Testing

The following edge cases will be explicitly tested:

### 1. Misspelled Inputs

```typescript
describe('Misspelled Inputs', () => {
  it('should handle misspelled days', () => {
    const options = processRecurrencePattern('evry mondey');
    expect(options.freq).toBe(RRule.WEEKLY);
    expect(options.byweekday).toContain(RRule.MO);
  });
  
  it('should handle misspelled frequencies', () => {
    const options = processRecurrencePattern('dailly');
    expect(options.freq).toBe(RRule.DAILY);
  });
});
```

### 2. Ambiguous Patterns

```typescript
describe('Ambiguous Patterns', () => {
  it('should handle "biweekly" as every 2 weeks', () => {
    const options = processRecurrencePattern('biweekly');
    expect(options.freq).toBe(RRule.WEEKLY);
    expect(options.interval).toBe(2);
  });
  
  it('should handle "every day of the week"', () => {
    const options = processRecurrencePattern('every day of the week');
    expect(options.freq).toBe(RRule.DAILY);
  });
});
```

### 3. Complex Combinations

```typescript
describe('Complex Combinations', () => {
  it('should handle multiple patterns together', () => {
    const options = processRecurrencePattern(
      'every 2 weeks on monday, wednesday, and friday until december 31, 2023'
    );
    expect(options.freq).toBe(RRule.WEEKLY);
    expect(options.interval).toBe(2);
    expect(options.byweekday).toContain(RRule.MO);
    expect(options.byweekday).toContain(RRule.WE);
    expect(options.byweekday).toContain(RRule.FR);
    expect(options.until).toBeDefined();
  });
});
```

### 4. Plural vs. Possessive

```typescript
describe('Plural vs. Possessive Forms', () => {
  it('should handle plural days as recurring', () => {
    const options = processRecurrencePattern('mondays');
    expect(options.freq).toBe(RRule.WEEKLY);
    expect(options.byweekday).toContain(RRule.MO);
  });
  
  it('should not interpret possessive as plural', () => {
    const options = processRecurrencePattern("monday's meeting");
    expect(options.freq).toBe(RRule.WEEKLY);
    expect(options.byweekday).toContain(RRule.MO);
    // Should not include "meeting" in the recognized pattern
    expect(options.matchedPatterns).not.toContain('meetingPattern');
  });
});
```

### 5. Unusual Input Formats

```typescript
describe('Unusual Input Formats', () => {
  it('should handle excessive whitespace', () => {
    const options = processRecurrencePattern('   every    monday   ');
    expect(options.freq).toBe(RRule.WEEKLY);
    expect(options.byweekday).toContain(RRule.MO);
  });
  
  it('should handle mixed case input', () => {
    const options = processRecurrencePattern('EvErY MoNdAy');
    expect(options.freq).toBe(RRule.WEEKLY);
    expect(options.byweekday).toContain(RRule.MO);
  });
  
  it('should handle unusual punctuation', () => {
    const options = processRecurrencePattern('every monday, and; friday');
    expect(options.freq).toBe(RRule.WEEKLY);
    expect(options.byweekday).toContain(RRule.MO);
    expect(options.byweekday).toContain(RRule.FR);
  });
});
```

## Continuous Integration

The test suite will be integrated into the continuous integration (CI) pipeline to ensure that all tests pass before merging changes.

### CI Configuration

1. **Automated testing**: Run the full test suite on each pull request
2. **Coverage reporting**: Generate and report test coverage statistics
3. **Performance testing**: Run benchmarks and compare with baseline
4. **Edge case testing**: Ensure all edge cases pass

## Test Implementation Timeline

1. **Week 1**: Set up testing infrastructure and write basic unit tests
2. **Week 2**: Implement comprehensive unit tests for all components
3. **Week 3**: Develop integration tests and pattern coverage tests
4. **Week 4**: Add performance tests and edge case tests
5. **Week 5**: Set up CI integration and finalize test suite

## Test Metrics and Success Criteria

1. **Coverage**: Aim for >95% test coverage of all code
2. **Pattern Coverage**: 100% coverage of all patterns in the pattern catalog
3. **Performance**: New implementation should be within 10% of current implementation's speed
4. **Equivalence**: >99% of patterns should produce equivalent results between implementations

This comprehensive test plan will ensure that the CompromiseJS integration is thoroughly validated before deployment, providing confidence in the correctness, reliability, and performance of the new implementation. 