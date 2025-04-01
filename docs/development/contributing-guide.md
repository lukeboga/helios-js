# Contributing to HeliosJS

> **Change Log**:  
> - [April 2025]: Merged duplicate guides into a single document
> - [April 2025]: Added pattern handler development guidelines
> - [April 2025]: Updated file structure to reflect current repository organization
> - [April 2025]: Added section on modern pattern handler architecture

This guide provides essential information for contributors to the HeliosJS project.

## Development Setup

### Prerequisites

- Node.js (v18 or later)
- npm (v9 or later)
- Git

### Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/helios-js.git
   cd helios-js
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run tests to ensure everything is working:
   ```bash
   npm test
   ```

## Project Structure

```
helios-js/
├── src/                 # Source code
│   ├── compromise/      # CompromiseJS integration
│   │   ├── patterns/    # Pattern handlers
│   │   ├── utils/       # Utility functions
│   │   └── index.ts     # Main entry point
│   ├── constants.ts     # Constants and configuration
│   ├── patterns/        # Legacy pattern handlers
│   ├── types.ts         # TypeScript type definitions
│   └── index.ts         # Library entry point
├── docs/                # Documentation
│   └── development/     # Developer documentation
├── test/                # Test files
│   ├── unit/            # Unit tests
│   ├── integration/     # Integration tests
│   └── fixtures/        # Test fixtures
├── package.json         # npm package definition
└── tsconfig.json        # TypeScript configuration
```

## Development Workflow

### Making Changes

1. Create a new branch for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes, following the coding standards

3. Write tests for your changes:
   ```bash
   # Run tests
   npm test
   
   # Run tests in watch mode (during development)
   npm test -- --watch
   ```

4. Update documentation as needed

5. Commit your changes:
   ```bash
   git commit -m "feat: add your feature description"
   ```

### Pull Requests

1. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Create a pull request through the GitHub interface

3. Ensure the CI tests pass

4. Address any review comments

## Coding Standards

### Code Style

HeliosJS follows standardized code style rules enforced by ESLint and Prettier. The configuration files are in the repository root.

- Use 2 spaces for indentation
- Use single quotes for strings
- Always use semicolons
- Prefer arrow functions
- Use explicit type annotations for function parameters and return types

### TypeScript Guidelines

- Always define proper interfaces for function parameters and return types
- Use descriptive variable and function names
- Avoid using `any` type; prefer specific types or generics
- Use readonly properties where appropriate

Example:

```typescript
// Good
interface PatternResult {
  readonly type: string;
  readonly value: string;
  readonly confidence: number;
}

function processPattern(input: string, options?: ProcessOptions): PatternResult | null {
  // Implementation
}

// Avoid
function processPattern(input, options?) {
  // Implementation
}
```

## Pattern Handler Development

Pattern handlers are the core of HeliosJS's natural language processing capabilities. They recognize specific patterns in text and convert them into structured recurrence rules.

### Pattern Handler Structure

A pattern handler should:

1. Identify a specific pattern in natural language text
2. Extract relevant parameters from the pattern
3. Update the recurrence options based on the pattern

### Modern Pattern Handler Architecture

HeliosJS is transitioning to a factory-based pattern handler architecture:

```typescript
// src/compromise/patterns/dayOfWeek.ts
import { Doc } from 'compromise';
import { RRule } from 'rrule';
import { PatternMatch, RecurrenceOptions } from '../../types';
import { createPatternHandler } from '../utils/handlerFactory';
import { DAY_NAMES, DAY_NAME_MAP } from '../../constants';

// 1. Define one or more matcher functions
const dayOfWeekMatcher = (doc: Doc): PatternMatch | null => {
  // Match "every monday" or similar patterns
  const matches = doc.match('(every|on) [<day>#WeekDay]');
  
  if (matches.found) {
    const day = matches.groups('day').text().toLowerCase();
    return {
      type: 'dayOfWeek',
      value: day,
      text: matches.text()
    };
  }
  
  return null;
};

const pluralDayMatcher = (doc: Doc): PatternMatch | null => {
  // Match "mondays" or similar patterns
  const dayPattern = DAY_NAMES.map(day => `${day}s`).join('|');
  const matches = doc.match(`(${dayPattern})`);
  
  if (matches.found) {
    // Extract day name without the plural 's'
    const dayWithS = matches.text().toLowerCase();
    const day = dayWithS.substring(0, dayWithS.length - 1);
    
    return {
      type: 'dayOfWeek',
      value: day,
      text: matches.text()
    };
  }
  
  return null;
};

// 2. Define a processor function
const dayOfWeekProcessor = (options: RecurrenceOptions, match: PatternMatch): void => {
  if (match.type === 'dayOfWeek') {
    const day = match.value;
    
    // Set weekly frequency
    options.freq = RRule.WEEKLY;
    
    // Set the day of week
    if (DAY_NAME_MAP[day]) {
      options.byweekday = [DAY_NAME_MAP[day]];
    }
  }
};

// 3. Create and export the pattern handler
export const dayOfWeekPatternHandler = createPatternHandler(
  'dayOfWeek',                       // Handler name
  [dayOfWeekMatcher, pluralDayMatcher], // Array of matchers
  dayOfWeekProcessor,                // Processor function
  {
    category: 'dayOfWeek',
    priority: 3
  }
);
```

The factory approach provides several benefits:

1. **Separation of Concerns**: Matchers and processors have distinct responsibilities
2. **Reusability**: Matcher functions can be shared across handlers
3. **Testability**: Each component can be tested independently
4. **Type Safety**: Strong typing throughout the pipeline
5. **Consistency**: Standard structure for all pattern handlers

### Key Interfaces

#### PatternMatch

```typescript
interface PatternMatch {
  type: string;       // Type of pattern matched
  value: string;      // Extracted value
  text: string;       // Original matched text
  [key: string]: any; // Additional properties
}
```

#### PatternHandler

```typescript
interface PatternHandler {
  name: string;                                  // Handler name
  matchers: Array<(doc: Doc) => PatternMatch | null>; // Pattern matchers
  processor: (options: RecurrenceOptions, match: PatternMatch) => void; // Processor
  category: string;                              // Handler category
  priority: number;                              // Processing priority
}
```

### Best Practices for Pattern Handlers

1. **Focus on a Single Pattern Type**: Each handler should recognize one type of pattern
2. **Prioritize Precision**: Aim for high-confidence matches
3. **Use CompromiseJS Features**: Leverage NLP capabilities for pattern recognition
4. **Add Comprehensive Tests**: Test variations and edge cases
5. **Document Supported Patterns**: Update the pattern documentation
6. **Keep Side Effects Contained**: Limit modifications to the options object
7. **Centralize Pattern Definitions**: Use constants for pattern strings

### Example: Adding a New Pattern Handler

To add a new pattern handler:

1. **Decide on Pattern Type**: Choose a specific pattern to handle
2. **Create a New File**: Add a new file in `src/compromise/patterns/`
3. **Implement Matchers and Processor**: Follow the factory pattern
4. **Register the Handler**: Update the handler registry
5. **Add Tests**: Create test cases in the appropriate test directory
6. **Update Documentation**: Document the new pattern support

## Testing

Refer to the [Testing Guide](./testing-guide.md) for detailed information on:

- Test organization and structure
- How to write effective tests
- Testing pattern handlers
- Debugging tests
- Performance testing

## Documentation

When making changes, update the relevant documentation:

- **Code Documentation**: Add JSDoc comments to functions and classes
- **API Reference**: Update the API documentation
- **Usage Examples**: Provide examples for new features
- **README**: Update installation and usage instructions if needed

### Documentation Style

- Use clear, concise language
- Provide examples for complex features
- Follow Markdown formatting conventions
- Include links to related documentation

## Release Process

The release process is managed by the core team:

1. **Version Bump**: Update version in package.json
2. **Changelog**: Document changes since last release
3. **Release Tags**: Create a release tag
4. **npm Publish**: Publish to the npm registry

## Getting Help

If you need assistance with contributing:

- **Issues**: Check existing GitHub issues or create a new one
- **Discussions**: Use GitHub Discussions for questions
- **Comments**: Add comments to PRs for specific questions

## Code of Conduct

All contributors are expected to adhere to the project's Code of Conduct, which promotes a respectful and inclusive environment.

## License

By contributing to HeliosJS, you agree that your contributions will be licensed under the project's MIT license. 