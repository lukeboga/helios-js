# Testing Guide for HeliosJS

This guide provides comprehensive documentation on the testing approach, structure, and best practices for the HeliosJS library.

## Test Directory Structure

The test directory is organized to clearly separate different types of tests and utilities:

```
test/
├── unit/                  # Unit tests for individual components
│   ├── compromise/        # Tests for CompromiseJS integration
│   │   ├── patterns.test.ts           # Comprehensive pattern handler tests
│   │   ├── compromise.test.ts         # Core processor tests
│   │   ├── untilDate.debug.test.ts    # Debug tests for until date patterns
│   │   └── dayOfMonth.debug.test.ts   # Debug tests for day of month patterns
│   └── patterns/          # Tests for legacy pattern handlers
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
// test/unit/compromise/patterns.test.ts
describe('Frequency Pattern Handler', () => {
  describe('Basic Frequencies', () => {
    it('should recognize "daily" pattern', () => {
      const result = processRecurrencePattern('daily');
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.freq).toBe(RRule.DAILY);
        expect(result.interval).toBe(1);
        expect(result.confidence).toBeGreaterThan(0.9);
      }
    });
    
    // More tests...
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
npm run test:unit -- test/unit/compromise/patterns.test.ts

# Run tests matching a pattern
npm run test:unit -- --run "Frequency Pattern"

# Run all tests in a directory
npm run test:unit -- test/unit/compromise
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

## Conclusion

Testing is a critical part of the HeliosJS development process. Following these guidelines ensures that the library remains reliable, maintainable, and well-documented.

When contributing new code, remember that thorough testing helps:

- Verify behavior works as expected
- Prevent regressions
- Document expected behavior
- Facilitate future refactoring
- Ensure backward compatibility 