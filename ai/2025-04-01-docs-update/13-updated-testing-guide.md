# Testing Guide for HeliosJS

> **Change Log**:  
> - [April 2025]: Updated test directory structure to reflect current organization
> - [April 2025]: Added pattern handler test examples using modern factory-based approach
> - [April 2025]: Updated file paths and command examples
> - [April 2025]: Added section on testing matcher and processor functions independently

This guide provides comprehensive documentation on the testing approach, structure, and best practices for the HeliosJS library.

## Test Directory Structure

The test directory is organized to clearly separate different types of tests and utilities:

```
test/
├── unit/                  # Unit tests for individual components
│   ├── compromise/        # Tests for CompromiseJS integration
│   │   ├── patterns/      # Tests for pattern handlers
│   │   │   ├── frequency.test.ts      # Frequency pattern tests
│   │   │   ├── dayOfWeek.test.ts      # Day of week pattern tests
│   │   │   ├── interval.test.ts       # Interval pattern tests
│   │   │   └── untilDate.test.ts      # Until date pattern tests
│   │   ├── matchers/      # Tests for pattern matchers
│   │   ├── processors/    # Tests for pattern processors
│   │   ├── utils/         # Tests for handler utilities
│   │   └── index.test.ts  # Core processor tests
│   ├── normalizer/        # Tests for text normalization
│   │   ├── index.test.ts            # Core normalizer tests
│   │   ├── misspellings.test.ts     # Misspelling correction tests
│   │   └── synonyms.test.ts         # Synonym replacement tests
├── integration/           # Integration tests for public APIs
│   └── compromise/        # Integration tests for CompromiseJS APIs
├── debug/                 # Debugging tools and test scripts
│   ├── compromise-debug.ts            # Debug script for processor output
│   ├── pattern-combo.debug.test.ts    # Debug tests for pattern combinations
│   └── untilDate.debug.test.ts        # Debug tests for until date handling
├── utils/                 # Utility scripts and benchmarks
│   ├── benchmark-compromise.ts        # Performance benchmarks
│   ├── fuzzy-match.test.ts            # Fuzzy matching tests
│   └── simple-test.ts                 # Simple validation script
└── compromise-api.test.ts # Public API tests for the compromise integration
```

## Testing Framework

HeliosJS uses [Vitest](https://vitest.dev/) for testing, which provides a Jest-compatible API with better performance and TypeScript integration. Key features used include:

- `describe`/`it` blocks for organizing tests
- `expect` assertions with a rich set of matchers
- Test filtering with pattern matching
- Watch mode for development
- Coverage reporting

## Test Types

### Unit Tests

Located in `/test/unit`, these tests focus on testing individual components in isolation to verify they work correctly on their own. Unit tests should:

- Focus on a single function, class, or module
- Mock dependencies when necessary
- Test edge cases and error handling
- Be fast and deterministic

Example:

```typescript
// test/unit/compromise/patterns/frequency.test.ts
import { describe, it, expect } from 'vitest';
import { processRecurrencePattern } from '../../../../src/processor';
import { RRule } from 'rrule';
import { frequencyPatternHandler } from '../../../../src/compromise/patterns/frequency';
import { frequencyMatcher } from '../../../../src/compromise/matchers/frequency';
import { Doc } from 'compromise';
import nlp from 'compromise';

describe('Frequency Pattern Handler', () => {
  describe('Handler Integration', () => {
    it('should recognize "daily" pattern', () => {
      const result = processRecurrencePattern('daily');
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.freq).toBe(RRule.DAILY);
        expect(result.interval).toBe(1);
      }
    });
    
    // More integration tests...
  });
  
  describe('Frequency Matcher', () => {
    it('should match daily frequency', () => {
      const doc = nlp('daily');
      const match = frequencyMatcher(doc);
      
      expect(match).not.toBeNull();
      if (match) {
        expect(match.type).toBe('frequency');
        expect(match.value).toBe(RRule.DAILY);
        expect(match.text).toBe('daily');
      }
    });
    
    // More matcher tests...
  });
});
```

### Integration Tests

Located in `/test/integration`, these tests verify that different components work together correctly. They focus on testing:

- Public API behavior
- Component interactions
- End-to-end workflows
- Real-world usage scenarios

Example:

```typescript
// test/integration/compromise/api.test.ts
describe('CompromiseJS API Integration', () => {
  it('should create RRule from pattern', () => {
    const startDate = new Date(2023, 0, 1);
    const rule = createRRule(startDate, 'every monday');
    
    expect(rule).not.toBeNull();
    if (rule) {
      // Verify rule properties
      expect(rule.options.freq).toBe(RRule.WEEKLY);
      expect(rule.options.byweekday).toContain(RRule.MO);
      
      // Verify next occurrences
      const nextDates = rule.all((date, i) => i < 3);
      expect(nextDates.length).toBe(3);
      expect(nextDates[0].getDay()).toBe(1); // Monday is day 1
    }
  });
});
```

### Debug Tests

Located in `/test/debug`, these tests help diagnose specific issues and verify complex behaviors. They often include more detailed logging and specialized assertions. Debug tests are useful during development but aren't necessarily part of the main test suite.

Example:

```typescript
// test/debug/untilDate.debug.test.ts
describe('Until Date Pattern Debug', () => {
  it('processes "until December 31, 2022"', () => {
    const result = processRecurrencePattern('until December 31, 2022');
    console.log('Result:', result); // Detailed logging for debugging
    
    expect(result).not.toBeNull();
    if (result) {
      expect(result.until).toBeInstanceOf(Date);
      expect(result.until?.getFullYear()).toBe(2022);
      expect(result.until?.getMonth()).toBe(11); // December is 11 (0-indexed)
      expect(result.until?.getDate()).toBe(31);
    }
  });
});
```

### Benchmark Tests

Located in `/test/utils`, these tests measure the performance of different implementations and help identify bottlenecks.

Example:

```typescript
// test/utils/benchmark-compromise.ts
function runBenchmark(name, fn, patterns, iterations = 100) {
  console.log(`\nRunning benchmark: ${name}`);
  
  const startTime = performance.now();
  
  // Run the benchmark
  for (let i = 0; i < iterations; i++) {
    for (const pattern of patterns) {
      fn(pattern);
    }
  }
  
  const endTime = performance.now();
  const totalTime = endTime - startTime;
  const averageTime = totalTime / (patterns.length * iterations);
  
  console.log(`  Total time: ${totalTime.toFixed(2)}ms`);
  console.log(`  Average time per pattern: ${averageTime.toFixed(4)}ms`);
}
```

## Naming Conventions

We follow these naming conventions for test files:

- Unit and Integration tests: `*.test.ts`
- Debug tests: `*.debug.test.ts`
- Utility scripts: `*.ts`

## Running Tests

### Running All Tests

```bash
npm run test:unit
```

### Running Specific Tests

```bash
# Run specific test file
npm run test:unit -- test/unit/compromise/patterns/frequency.test.ts

# Run tests matching a pattern
npm run test:unit -- --run "Frequency Pattern"

# Run all tests in a directory
npm run test:unit -- test/unit/compromise/patterns
```

### Watch Mode

During development, you can use watch mode to automatically rerun tests when files change:

```bash
npm run test:unit -- --watch
```

### Coverage Reports

To generate test coverage reports:

```bash
npm run test:unit -- --coverage
```

## Testing Best Practices

### 1. Test Structure

- Use `describe` blocks to group related tests
- Use nested `describe` blocks for sub-categories
- Write clear test names that describe expected behavior
- Follow the AAA pattern (Arrange, Act, Assert)

Example of good structure:

```typescript
describe('Day of Week Pattern Handler', () => {
  describe('Simple Day Patterns', () => {
    it('should recognize "every monday"', () => {
      // Test implementation
    });
    
    it('should recognize plural forms like "mondays"', () => {
      // Test implementation
    });
  });
  
  describe('Multiple Day Patterns', () => {
    it('should recognize "monday and friday"', () => {
      // Test implementation
    });
  });
});
```

### 2. Test Assertions

- Write specific assertions that clearly validate expectations
- Include messages with assertions for clarity
- Test both positive and negative cases
- Verify error conditions and edge cases

### 3. Test Isolation

- Each test should be independent
- Avoid shared mutable state between tests
- Reset any global state before/after tests
- Mock external dependencies

### 4. Testing Patterns Implementation

When testing pattern handlers, consider:

1. **Basic Recognition**: Test that the pattern is recognized correctly
2. **Parameter Extraction**: Test that parameters (frequency, interval, etc.) are extracted correctly
3. **Variations**: Test different ways to express the same pattern
4. **Edge Cases**: Test boundary conditions and unusual inputs
5. **Combined Patterns**: Test how the pattern works with other patterns

Example:

```typescript
it('should extract the correct interval from "every 3 weeks"', () => {
  const result = processRecurrencePattern('every 3 weeks');
  
  expect(result).not.toBeNull();
  if (result) {
    expect(result.freq).toBe(RRule.WEEKLY);
    expect(result.interval).toBe(3);
  }
});
```

## Testing Modern Pattern Handlers

The modern pattern handler architecture separates concerns into matchers, processors, and handler factories, which changes how we approach testing:

### 1. Testing Pattern Matchers

Pattern matchers should be tested in isolation to verify they correctly identify patterns and extract values:

```typescript
// test/unit/compromise/matchers/weekday.test.ts
describe('Weekday Matcher', () => {
  it('matches simple day of week', () => {
    const doc = nlp('every monday');
    const match = weekdayMatcher(doc);
    
    expect(match).not.toBeNull();
    if (match) {
      expect(match.type).toBe('weekday');
      expect(match.value).toContain(1); // Monday is 1
      expect(match.text).toBe('monday');
    }
  });
  
  it('matches multiple days of week', () => {
    const doc = nlp('every monday and wednesday');
    const match = weekdayMatcher(doc);
    
    expect(match).not.toBeNull();
    if (match) {
      expect(match.type).toBe('weekday');
      expect(match.value).toContain(1); // Monday is 1
      expect(match.value).toContain(3); // Wednesday is 3
      expect(match.text).toBe('monday and wednesday');
    }
  });
});
```

### 2. Testing Pattern Processors

Pattern processors should be tested to verify they correctly update recurrence options based on matches:

```typescript
// test/unit/compromise/processors/weekday.test.ts
describe('Weekday Processor', () => {
  it('updates options with weekday values', () => {
    const match = {
      type: 'weekday',
      value: [1, 3], // Monday and Wednesday
      text: 'monday and wednesday'
    };
    
    const options = {};
    weekdayProcessor(options, match);
    
    expect(options.byweekday).toEqual([RRule.MO, RRule.WE]);
    expect(options.freq).toBe(RRule.WEEKLY);
  });
  
  it('preserves existing frequency if present', () => {
    const match = {
      type: 'weekday',
      value: [1], // Monday
      text: 'monday'
    };
    
    const options = { freq: RRule.MONTHLY };
    weekdayProcessor(options, match);
    
    expect(options.byweekday).toEqual([RRule.MO]);
    expect(options.freq).toBe(RRule.MONTHLY); // Unchanged
  });
});
```

### 3. Testing Complete Pattern Handlers

Finally, test the complete pattern handler to verify its integration:

```typescript
// test/unit/compromise/patterns/weekday.test.ts
describe('Weekday Pattern Handler', () => {
  it('correctly processes weekday patterns', () => {
    // Create a test document
    const doc = nlp('every monday and friday');
    
    // Initial options object
    const options = {};
    
    // Apply the handler
    const result = weekdayPatternHandler.apply(doc, options);
    
    // Verify result
    expect(result.matched).toBe(true);
    expect(options.byweekday).toContainEqual(RRule.MO);
    expect(options.byweekday).toContainEqual(RRule.FR);
    expect(options.freq).toBe(RRule.WEEKLY);
  });
});
```

This modular testing approach:
- Makes it easier to diagnose issues
- Improves test clarity by focusing on specific components
- Facilitates test-driven development
- Provides better test coverage

### 5. Debug Tests

Debug tests are specialized tests that help diagnose issues:

- Include detailed console logging
- Test specific scenarios that are difficult to test in regular unit tests
- Provide more context in assertions
- Focus on edge cases and complex interactions

## Adding New Tests

When implementing a new feature or fixing a bug:

1. **Start with a Test**: Write a failing test that reproduces the issue or demonstrates the expected behavior
2. **Implement the Solution**: Write the minimum code needed to make the test pass
3. **Refactor**: Clean up the code while keeping the tests passing
4. **Add Edge Cases**: Write additional tests for edge cases and error conditions
5. **Benchmark If Needed**: If performance is a concern, add a benchmark test

### Example Workflow:

```typescript
// 1. Write a failing test
it('should recognize "first Monday of each month"', () => {
  const result = processRecurrencePattern('first Monday of each month');
  
  expect(result).not.toBeNull();
  if (result) {
    expect(result.freq).toBe(RRule.MONTHLY);
    expect(result.byweekday).toContainEqual(RRule.MO);
    expect(result.bysetpos).toContain(1);
  }
});

// 2. Implement the solution in src/compromise/patterns/dayOfMonth.ts
// 3. Refactor and ensure tests pass
// 4. Add edge cases
it('should recognize "last Friday of every month"', () => {
  const result = processRecurrencePattern('last Friday of every month');
  
  expect(result).not.toBeNull();
  if (result) {
    expect(result.freq).toBe(RRule.MONTHLY);
    expect(result.byweekday).toContainEqual(RRule.FR);
    expect(result.bysetpos).toContain(-1); // -1 represents last occurrence
  }
});
```

## Troubleshooting Tests

### Common Issues:

1. **Tests Not Found**: Ensure test filenames follow the naming convention (`*.test.ts`)
2. **Async Test Failures**: Use `async/await` for asynchronous tests
3. **Pattern Not Matching**: Check for typos in test filter patterns
4. **Intermittent Failures**: Look for shared state or timing issues

### Debugging Tips:

1. **Console Logging**: Add `console.log` statements to debug values
2. **Isolate the Test**: Run a single test with `--run`
3. **Debug Test Files**: Create special debug test files with detailed logging
4. **Inspect Snapshots**: Use snapshot testing for complex objects

## Continuous Integration

Tests run automatically in CI/CD pipelines:

1. **Pull Requests**: All tests run when PRs are created or updated
2. **Main Branch**: Tests run on every commit to the main branch
3. **Failed Tests**: PRs with failing tests cannot be merged

## Testing Text Normalization and Misspelling Correction

HeliosJS includes specialized tests for text normalization and misspelling correction that verify the system's ability to handle common typos and spelling variations in natural language inputs.

### Text Normalization Tests

Located at `test/unit/normalizer/index.test.ts`, these tests verify the basic text normalization functionality:

```bash
npm run test:unit -- test/unit/normalizer/index.test.ts
```

### Misspelling Correction Tests

Located at `test/unit/normalizer/misspellings.test.ts`, these tests verify the system's ability to correct misspellings:

```bash
npm run test:unit -- test/unit/normalizer/misspellings.test.ts
```

### What's Tested

The misspelling correction tests verify:

1. **Day Name Misspellings**: Common misspellings of weekdays (e.g., "mondey", "tuseday", "wednessday")
2. **Month Name Misspellings**: Variations of month names (e.g., "janurary", "feburary")
3. **Frequency Term Misspellings**: Misspelled frequency terms (e.g., "dayly", "wekly", "monthy")
4. **Special Term Misspellings**: Common variants of special terms (e.g., "evrey", "eech", "untill")
5. **Combined Pattern Misspellings**: Patterns with multiple misspellings (e.g., "evrey weekdys")

### Test Structure

The misspelling correction test:

1. Defines a set of test patterns with common misspellings
2. Processes each pattern using the HeliosJS processor with misspelling correction enabled
3. Verifies that the pattern is correctly interpreted despite misspellings
4. Shows the next occurrences generated from the corrected pattern

### Adding New Misspelling Tests

When expanding the misspelling dictionaries:

1. Add new test patterns to `test/unit/normalizer/misspellings.test.ts`
2. Add the corresponding misspellings to the centralized registries in `src/constants/patterns.ts`:
   ```typescript
   // For day name misspellings
   SPELLING_CORRECTIONS['mondey'] = 'monday';
   
   // Or use the helper function
   extendSpellingCorrections({
     'mondey': 'monday',
     'tuseday': 'tuesday'
   });
   ```
3. Run the tests to verify corrections work as expected:
   ```bash
   npm run test:unit -- test/unit/normalizer/misspellings.test.ts
   ```

### Interpreting Test Results

The test output shows:
- Whether the pattern was successfully processed
- The confidence level of the interpretation
- The extracted parameters (frequency, interval, weekdays)
- The next occurrences based on the corrected pattern

Successful tests should show high confidence levels (0.90+) and correctly generate next occurrences.

## Conclusion

Testing is a critical part of the HeliosJS development process. Following these guidelines ensures that the library remains reliable, maintainable, and well-documented.

When contributing new code, remember that thorough testing helps:

- Verify behavior works as expected
- Prevent regressions
- Document expected behavior
- Facilitate future refactoring
- Ensure backward compatibility 