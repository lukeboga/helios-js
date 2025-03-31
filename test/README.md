# Test Directory Structure

This directory contains tests for the Helios.js library. The structure is designed to clearly separate different types of tests and utilities.

## Structure

- **unit/**: Unit tests for individual components
  - **patterns/**: Tests for pattern handlers
  - **compromise/**: Tests for CompromiseJS integration components
- **integration/**: Integration tests for public APIs
  - **compromise/**: Integration tests for CompromiseJS public APIs
- **utils/**: Utility scripts and benchmarks
- **debug/**: Debugging tools and test scripts

## Naming Conventions

- Unit and Integration tests: `*.test.ts`
- Debug tests: `*.debug.test.ts`
- Utility scripts: `*.ts`

## Running Tests

```bash
# Run all tests
npm test

# Run specific tests by pattern
npm test -- test/unit/compromise/patterns.test.ts

# Run all unit tests
npm test -- test/unit

# Run all compromise-related tests
npm test -- test/unit/compromise test/integration/compromise
```

## Test Types

### Unit Tests

These test individual components in isolation. They focus on verifying that each component works correctly on its own. Examples include testing individual pattern handlers or normalized functions.

### Integration Tests

These test how components work together through the public API. They focus on validating that the library works correctly from a user's perspective.

### Debug Scripts

These are scripts used during development for debugging specific functionality. They are not formal tests but help with diagnosing issues.

### Utility Scripts

These include benchmark tests, simple tests for quick validation, and other utilities used during development. 