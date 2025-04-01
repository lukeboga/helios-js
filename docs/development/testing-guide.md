# Testing Guide for HeliosJS

> **Change Log**:  
> - [April 2025]: Updated test directory structure details
> - [April 2025]: Added pattern handler test examples
> - [April 2025]: Updated file paths to reflect current repository structure
> - [April 2025]: Expanded coverage section with specifics on what to test

This guide outlines the testing approach, structure, and best practices for the HeliosJS library.

## Overview

HeliosJS uses [Vitest](https://vitest.dev/) as its testing framework. The test suite is organized into:

- **Unit tests**: Testing individual functions and components in isolation
- **Integration tests**: Testing interactions between multiple components
- **Debug tests**: Manual verification tests for specific scenarios

## Test Directory Structure

```
test/
├── unit/
│   ├── core/              # Core function tests
│   ├── compromise/        # Pattern handler tests
│   │   ├── frequency/     # Frequency pattern tests
│   │   ├── dayOfWeek/     # Day of week pattern tests
│   │   ├── dayOfMonth/    # Day of month pattern tests
│   │   ├── interval/      # Interval pattern tests
│   │   ├── endDate/       # End date pattern tests
│   │   └── combined/      # Tests for combined patterns
│   ├── utils/             # Utility function tests
│   └── normalization/     # Text normalization tests
├── integration/           # Integration tests
├── debug/                 # Manual verification tests
└── fixtures/              # Test fixtures and test data
```

## Running Tests

To run the test suite:

```bash
# Run all tests
npm test

# Run specific test files
npm test -- unit/compromise/frequency

# Run tests in watch mode (for development)
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Writing Tests

### Basic Test Structure

Tests should follow this structure:

```typescript
import { describe, it, expect } from 'vitest';
import { functionToTest } from '../../src/path/to/function';

describe('functionToTest', () => {
  it('should handle basic case', () => {
    const result = functionToTest('input');
    expect(result).toBe('expected output');
  });

  it('should handle edge case', () => {
    const result = functionToTest('edge input');
    expect(result).toEqual({ complex: 'output' });
  });

  // Add more test cases as needed
});
```

### Testing Pattern Handlers

When testing pattern handlers, follow this structure:

```typescript
import { describe, it, expect } from 'vitest';
import { processRecurrencePattern } from '../../../src';
import { RRule } from 'rrule';

describe('Frequency Pattern Handler', () => {
  it('should recognize "daily" pattern', () => {
    const result = processRecurrencePattern('daily');
    
    expect(result).not.toBeNull();
    expect(result?.options.freq).toBe(RRule.DAILY);
  });
  
  it('should set appropriate defaults', () => {
    const result = processRecurrencePattern('every day');
    
    expect(result).not.toBeNull();
    expect(result?.options.freq).toBe(RRule.DAILY);
    expect(result?.options.interval).toBe(1);
  });
  
  // Test variations, edge cases, etc.
});
```

### Example: Testing a Modern Pattern Handler

When testing a pattern handler built with the modern factory approach:

```typescript
import { describe, it, expect } from 'vitest';
import { weekendPatternHandler } from '../../../src/compromise/patterns/weekend';
import { createDoc } from '../../../src/compromise/utils/testHelpers';
import { RRule } from 'rrule';

describe('Weekend Pattern Handler', () => {
  // Test the matcher function
  it('should match weekend patterns', () => {
    const doc = createDoc('every weekend');
    const handler = weekendPatternHandler;
    
    // Get matches from the handler's matcher functions
    const matches = handler.matchers.map(matcher => matcher(doc))
      .filter(match => match !== null);
    
    expect(matches.length).toBe(1);
    expect(matches[0]?.type).toBe('weekend');
  });
  
  // Test the processor function
  it('should process weekend patterns correctly', () => {
    const options = {};
    const match = {
      type: 'weekend',
      value: 'weekend',
      text: 'every weekend'
    };
    
    // Process the match
    weekendPatternHandler.processor(options, match);
    
    expect(options.freq).toBe(RRule.WEEKLY);
    expect(options.byweekday).toEqual([RRule.SA, RRule.SU]);
  });
  
  // Test the complete handler
  it('should handle complete weekend pattern', () => {
    const result = processRecurrencePattern('every weekend');
    
    expect(result).not.toBeNull();
    expect(result?.options.freq).toBe(RRule.WEEKLY);
    expect(result?.options.byweekday).toEqual([RRule.SA, RRule.SU]);
  });
});
```

## What to Test

### For Pattern Handlers

Test the following aspects of each pattern handler:

1. **Basic Recognition**: Verify the handler recognizes its intended patterns.
2. **Parameter Extraction**: Confirm that parameters (e.g., intervals, frequencies) are correctly extracted.
3. **Variations**: Test different variations and phrasings of the same pattern.
4. **Edge Cases**: Test unusual inputs that should still work.
5. **Negative Cases**: Verify that non-matching patterns are not incorrectly handled.
6. **Combined Patterns**: Test how the handler works with other patterns.
7. **Confidence Scores**: Verify the confidence scoring is appropriate.

### For Core Functions

Test the following aspects of core functions:

1. **Basic Functionality**: Test the primary use case.
2. **Parameter Validation**: Test how the function handles different parameter values.
3. **Error Handling**: Test how the function responds to invalid inputs.
4. **Edge Cases**: Test boundary conditions and special cases.
5. **Performance**: Test with large or complex inputs where relevant.

### Testing Text Normalization

For text normalization tests:

1. **Basic Normalization**: Test standard cases like lowercase, whitespace, etc.
2. **Misspelling Correction**: Test common and edge-case misspellings.
3. **Synonym Replacement**: Test that synonyms are correctly replaced.
4. **Format Standardization**: Test handling of punctuation and ordinals.

## Mocking

When you need to isolate code from its dependencies, use Vitest's mocking capabilities:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { functionWithDependency } from '../src/module';
import * as dependency from '../src/dependency';

describe('functionWithDependency', () => {
  it('should use the dependency correctly', () => {
    // Mock the dependency
    vi.spyOn(dependency, 'dependencyFunction').mockReturnValue('mocked result');
    
    // Test the function
    const result = functionWithDependency('input');
    
    // Verify the dependency was called correctly
    expect(dependency.dependencyFunction).toHaveBeenCalledWith('input');
    
    // Verify the result
    expect(result).toBe('expected result with mocked dependency');
    
    // Restore the original implementation
    vi.restoreAllMocks();
  });
});
```

## Test Fixtures

Store test fixtures in the `test/fixtures` directory:

```typescript
// test/fixtures/patterns.ts
export const frequencyPatterns = {
  daily: {
    input: 'daily',
    expectedFreq: 0, // RRule.DAILY
    expectedInterval: 1
  },
  weekly: {
    input: 'weekly',
    expectedFreq: 1, // RRule.WEEKLY
    expectedInterval: 1
  }
  // Add more fixtures as needed
};
```

Use fixtures in your tests:

```typescript
import { describe, it, expect } from 'vitest';
import { processRecurrencePattern } from '../src';
import { frequencyPatterns } from './fixtures/patterns';

describe('Frequency patterns', () => {
  Object.entries(frequencyPatterns).forEach(([name, fixture]) => {
    it(`should process ${name} pattern correctly`, () => {
      const result = processRecurrencePattern(fixture.input);
      
      expect(result).not.toBeNull();
      expect(result?.options.freq).toBe(fixture.expectedFreq);
      expect(result?.options.interval).toBe(fixture.expectedInterval);
    });
  });
});
```

## Debugging Tests

The `test/debug` directory contains tests designed for manual verification of complex scenarios:

```typescript
// test/debug/complex-patterns.test.ts
import { describe, it } from 'vitest';
import { processRecurrencePattern } from '../src';
import { RRule } from 'rrule';

describe.skip('Complex pattern debugging', () => {
  it('should process complex pattern', () => {
    const input = 'every other Tuesday and Friday until the end of the year';
    const result = processRecurrencePattern(input);
    
    console.log('Input:', input);
    console.log('Result:', JSON.stringify(result, null, 2));
    
    if (result) {
      const rule = new RRule(result.options);
      console.log('RRule text:', rule.toText());
      console.log('Next 5 occurrences:', rule.all((date, i) => i < 5));
    }
    
    // No assertions, just for manual verification
  });
});
```

Run debug tests explicitly when needed:

```bash
npm test -- debug/complex-patterns
```

## Code Coverage

Aim for high test coverage, especially for core functionality and pattern handlers. Run coverage reports to identify untested code:

```bash
npm test -- --coverage
```

The coverage report will identify:
- Lines of code that haven't been executed during tests
- Branches (if/else statements) that haven't been tested
- Functions that haven't been called during tests

## Continuous Integration

All tests run automatically on pull requests and commits to the main branch. Ensure your tests pass locally before pushing changes:

```bash
npm test
```

## Best Practices

1. **Test Naming**: Use descriptive names that explain what the test is verifying.
2. **Small Tests**: Keep tests focused on a single piece of functionality.
3. **Independence**: Tests should not depend on other tests or their order of execution.
4. **Real-World Inputs**: Include tests with real-world examples.
5. **Avoid Test Duplication**: Use fixtures and test helpers when testing similar functionality.
6. **Consistent Structure**: Follow consistent patterns for test organization and naming.
7. **Test Edge Cases**: Include tests for boundary conditions and error handling.
8. **Clear Expectations**: Make it clear what each test is verifying with descriptive assertions.

By following these guidelines, you'll ensure that HeliosJS remains reliable and maintainable as it evolves. 