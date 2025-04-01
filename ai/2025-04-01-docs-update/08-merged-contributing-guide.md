# Contributing to Helios-JS

> **Change Log**:  
> - [April 2025]: Merged `/docs/contribution-guide.md` and `/docs/development/contributing-guide.md`
> - [April 2025]: Updated pattern handler documentation to align with modernization plan
> - [April 2025]: Added CompromiseJS best practices section
> - [April 2025]: Updated project structure to reflect current organization

Thank you for your interest in contributing to Helios-JS! This guide will help you get started with the development environment, understand our coding standards, and learn the contribution workflow.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Environment](#development-environment)
3. [Project Structure](#project-structure)
4. [Coding Standards](#coding-standards)
5. [Testing](#testing)
6. [Documentation](#documentation)
7. [Contribution Workflow](#contribution-workflow)
8. [Pull Request Guidelines](#pull-request-guidelines)
9. [Community and Communication](#community-and-communication)
10. [Pattern Handler Development](#pattern-handler-development)
    - [Handler Structure](#handler-structure)
    - [Creating a New Pattern Handler](#creating-a-new-pattern-handler)
    - [Best Practices](#best-practices)
    - [Example: Modern Pattern Handler](#example-modern-pattern-handler)

## Getting Started

### Prerequisites

To contribute to Helios-JS, you'll need:

- Node.js (v14 or higher)
- npm (v6 or higher) or yarn
- Git
- A GitHub account
- Your favorite IDE (we recommend VS Code with TypeScript support)

### Fork and Clone

1. Fork the Helios-JS repository on GitHub
2. Clone your fork to your local machine:

```bash
git clone https://github.com/YOUR-USERNAME/helios-js.git
cd helios-js
```

3. Add the original repository as an upstream remote:

```bash
git remote add upstream https://github.com/original-owner/helios-js.git
```

## Development Environment

### Installation

Install dependencies:

```bash
# Using npm
npm install

# Using yarn
yarn
```

### Build

Build the project:

```bash
# Using npm
npm run build

# Using yarn
yarn build
```

### Development Mode

Start the development mode with auto-rebuild:

```bash
# Using npm
npm run dev

# Using yarn
yarn dev
```

## Project Structure

Helios-JS follows a modular architecture, with components organized in specific directories:

```
helios-js/
├── src/                  # Source code
│   ├── compromise/       # CompromiseJS integration
│   │   ├── patterns/     # Pattern handlers and matchers
│   │   └── index.ts      # CompromiseJS setup
│   ├── utils/            # Utility functions
│   ├── constants.ts      # Constants and enums
│   ├── errors.ts         # Error definitions
│   ├── index.ts          # Main entry point
│   ├── normalizer.ts     # Text normalization
│   ├── processor.ts      # Recurrence processing
│   └── types.ts          # Type definitions
├── docs/                 # Documentation
│   ├── development/      # Developer documentation
│   └── public/           # User documentation
├── test/                 # Test files
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── debug/            # Debug tests
├── package.json          # Package configuration
└── tsconfig.json         # TypeScript configuration
```

### Key Components

- **src/compromise/**: Contains CompromiseJS integration and pattern handlers
- **src/normalizer.ts**: Handles text normalization before pattern matching
- **src/processor.ts**: Orchestrates the recurrence pattern processing
- **src/index.ts**: Provides the public API

## Coding Standards

Helios-JS follows these coding standards:

### TypeScript

- Use strict TypeScript with explicit types
- Prefer interfaces over type aliases for object types
- Use type guards to narrow types when necessary
- Avoid using `any` unless absolutely necessary

### Naming Conventions

- Use camelCase for variables, functions, and properties
- Use PascalCase for classes, interfaces, and type aliases
- Use UPPER_SNAKE_CASE for constants
- Prefix interfaces with `I` only when they represent object instances (e.g., `IHandler`)
- Use descriptive names that explain what the variable/function does

### File Organization

- Each pattern handler should be in its own file
- Group related functionality in directories
- Keep files focused on a single responsibility
- Use index files to aggregate and re-export functionality

### Comments and Documentation

- Use JSDoc comments for all public APIs
- Include examples in JSDoc for complex functions
- Comment non-obvious code sections or algorithms
- Maintain high-level documentation in markdown files

Example:

```typescript
/**
 * Normalizes a natural language recurrence pattern for more consistent pattern matching.
 * 
 * This function applies several transformations to make the input more consistent:
 * 1. Converts text to lowercase for case-insensitive matching
 * 2. Normalizes whitespace (converts multiple spaces to single spaces)
 * 3. Removes ordinal suffixes from numbers (e.g., "1st" becomes "1")
 * 
 * @param input - The raw natural language recurrence pattern
 * @param options - Optional configuration options
 * @returns Normalized text ready for pattern matching
 * 
 * @example
 * normalizeInput("Every 2nd Week on Monday")
 * // returns "every 2 week on monday"
 */
export function normalizeInput(input: string, options?: NormalizerOptions): string {
  // Implementation...
}
```

### Code Style

- Use 2 spaces for indentation
- Add a semicolon at the end of each statement
- Use single quotes for strings
- Place opening braces on the same line
- Add spaces around operators
- Use arrow functions for callbacks

## Testing

HeliosJS uses Vitest for testing. For comprehensive information about our testing approach, structure, and best practices, see the [Testing Guide](./testing-guide.md).

Key points:

- Tests are organized in the `test/` directory by type (unit, integration, debug)
- Unit tests focus on testing individual components in isolation
- Integration tests verify public API behavior
- Debug tests help diagnose specific issues
- Follow the testing conventions and practices documented in the Testing Guide

Running tests:

```bash
# Run all tests
npm run test:unit

# Run specific tests
npm run test:unit -- --run "Frequency Pattern"

# Run tests in watch mode
npm run test:unit -- --watch
```

## Documentation

Documentation is a crucial part of Helios-JS. We maintain two sets of documentation:

1. **User Documentation**: Located in `docs/public/`, aimed at users of the library
2. **Developer Documentation**: Located in `docs/development/`, aimed at contributors

### Updating Documentation

When making changes to the codebase:

1. Update relevant user documentation if you change or add features
2. Update developer documentation if you change architecture or internal APIs
3. Ensure examples are up-to-date and working

### Documentation Format

All documentation is written in Markdown with the following guidelines:

- Use descriptive headings and subheadings
- Include code examples for clarity
- Use tables for structured information
- Add diagrams where appropriate
- Keep language clear and accessible

## Contribution Workflow

### 1. Choose an Issue

- Look for issues labeled "good first issue" if you're new to the project
- Comment on the issue to let others know you're working on it
- If you want to work on something that doesn't have an issue yet, create one first

### 2. Create a Branch

Create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
```

Use branch naming conventions:
- `feature/` for new features
- `fix/` for bug fixes
- `docs/` for documentation updates
- `refactor/` for code refactoring
- `test/` for adding or updating tests

### 3. Make Changes

Make your changes following the coding standards.

### 4. Write or Update Tests

Add tests for any new functionality or fix bugs to ensure they don't recur.

### 5. Run Tests and Lint

Ensure all tests pass and the code meets the style guidelines:

```bash
npm test
npm run lint
```

### 6. Commit Your Changes

Follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
type(scope): short description

longer description if needed
```

Types include:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Changes to the build process, tools, etc.

Example:
```
feat(patterns): add support for time of day patterns

- Added a new pattern handler for time expressions
- Updated transformer to handle time patterns
- Added tests for time pattern recognition
```

### 7. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 8. Create a Pull Request

Create a pull request to the main repository with:
- A clear title following the commit message format
- A description explaining what the changes do
- Reference to any related issues

## Pull Request Guidelines

When creating a pull request:

1. **Keep It Focused**: Address a single concern or feature
2. **Provide Context**: Explain what the PR does and why
3. **Include Tests**: Ensure your changes are tested
4. **Update Documentation**: Add or update relevant documentation
5. **Follow Up**: Respond to feedback and make requested changes
6. **Be Patient**: The review process takes time

### Review Process

Pull requests will be reviewed by maintainers, who may:
- Ask questions about your approach
- Suggest improvements
- Request changes
- Approve and merge your PR

## Community and Communication

### Getting Help

If you need help while contributing:
- Ask questions in the issue you're working on
- Reach out in the project's discussion forums or chat channels
- Read the existing documentation and code

### Code of Conduct

Remember to adhere to the project's code of conduct at all times. Be respectful, considerate, and constructive in all interactions.

### Recognition

All contributors will be recognized in the project's contributors list. We value every contribution, from code to documentation to bug reports.

## Pattern Handler Development

This section provides guidance for contributing new pattern handlers to extend the natural language processing capabilities of Helios-JS.

### Handler Structure

In Helios-JS, pattern handlers follow a modular, functional approach with three main components:

1. **Pattern Matchers**: Functions that identify specific patterns in the text using CompromiseJS
2. **Pattern Processors**: Functions that update the RecurrenceOptions object based on matched patterns
3. **Pattern Handler Factory**: A function that combines matchers and processors into a complete handler

### Creating a New Pattern Handler

#### 1. Define Pattern Matchers

Create one or more matcher functions that use CompromiseJS to identify patterns:

```typescript
import { Doc } from 'compromise';
import { PatternMatch } from '../../types';

/**
 * Matcher for "nth day of the month" patterns
 */
export const monthDayMatcher = (doc: Doc): PatternMatch | null => {
  // Look for patterns like "15th of the month" or "on the 1st of each month"
  const matches = doc.match('(on the|the|on|) #Value(st|nd|rd|th) (of|) (the|each|every|) month');
  
  if (matches.found) {
    // Extract the day value
    const dayStr = matches.groups('Value').text();
    const day = parseInt(dayStr, 10);
    
    // Validate the day value
    if (day >= 1 && day <= 31) {
      return {
        type: 'monthDay',
        value: day,
        text: matches.text()
      };
    }
  }
  
  return null;
};
```

#### 2. Define Pattern Processor

Create a processor function that updates the RecurrenceOptions based on matched patterns:

```typescript
import { RRule } from 'rrule';
import { RecurrenceOptions, PatternMatch } from '../../types';

/**
 * Processor for month day patterns
 */
export const monthDayProcessor = (options: RecurrenceOptions, match: PatternMatch): void => {
  if (match.type === 'monthDay') {
    options.bymonthday = match.value;
    
    // If no frequency is set, assume monthly
    if (options.freq === undefined) {
      options.freq = RRule.MONTHLY;
    }
  }
};
```

#### 3. Create and Register the Pattern Handler

Use the pattern handler factory to create your handler and register it:

```typescript
// src/compromise/patterns/monthDay.ts
import { createPatternHandler } from '../utils/handlerFactory';
import { monthDayMatcher } from './matchers/monthDayMatcher';
import { monthDayProcessor } from './processors/monthDayProcessor';

/**
 * Month day pattern handler
 */
export const monthDayPatternHandler = createPatternHandler(
  'monthDay',          // Handler name
  [monthDayMatcher],   // Array of matchers
  monthDayProcessor,   // Processor function
  {                    // Handler options
    category: 'date',
    priority: 3        // Lower number = higher priority
  }
);
```

Then register your handler in `src/compromise/index.ts`:

```typescript
// Import your new handler
import { monthDayPatternHandler } from './patterns/monthDay';

// Add to the pattern handlers array
export const patternHandlers = [
  // Existing handlers
  frequencyPatternHandler,
  intervalPatternHandler,
  // ... other handlers
  
  // Your new handler
  monthDayPatternHandler
];
```

### Best Practices

#### 1. CompromiseJS Pattern Matching

- Use CompromiseJS's powerful matching syntax:
  - `#` for tags: `#Month`, `#Value`, `#Weekday`
  - `?` for optional parts: `(on|for)?`
  - `|` for alternatives: `(every|each)`
  - `*` for repeating patterns: `#Weekday+`
- Utilize custom tags where appropriate (see the CompromiseJS Integration Guide)
- Use named groups for extracting values: `.groups('name')`

#### 2. Pattern Matcher Design

- Create focused matchers that each handle a specific pattern variation
- Return `null` when no match is found
- Include the matched text in the result for debugging
- Add a clear pattern type identifier
- Structure return values consistently

#### 3. Pattern Processor Design

- Check the match type before processing
- Update options in a predictable way
- Set default frequency if appropriate
- Handle potential conflicts with other patterns
- Focus on translating the match into RRule options

#### 4. Testing

Create tests for your handler in the `test/unit/compromise` directory:

```typescript
// test/unit/compromise/monthDay.test.ts
import { describe, it, expect } from 'vitest';
import { processRecurrencePattern } from '../../../src/processor';
import { RRule } from 'rrule';

describe('Month Day Pattern Handler', () => {
  it('recognizes basic pattern', () => {
    const result = processRecurrencePattern('15th of the month');
    
    expect(result).not.toBeNull();
    if (result) {
      expect(result.bymonthday).toBe(15);
      expect(result.freq).toBe(RRule.MONTHLY);
    }
  });
  
  // Add more test cases...
});
```

### Example: Modern Pattern Handler

Here's a complete example of a modern pattern handler implementation for weekend patterns:

```typescript
// src/compromise/patterns/weekend.ts

// Import necessary types and utilities
import { Doc } from 'compromise';
import { RRule } from 'rrule';
import { PatternMatch, RecurrenceOptions } from '../../types';
import { createPatternHandler } from '../utils/handlerFactory';

// Define matcher function
const weekendMatcher = (doc: Doc): PatternMatch | null => {
  // Match patterns like "every weekend", "on weekends"
  const matches = doc.match('(every|on|during) (weekend|weekends)');
  
  if (matches.found) {
    return {
      type: 'weekend',
      value: 'weekend',
      text: matches.text()
    };
  }
  
  return null;
};

// Define processor function
const weekendProcessor = (options: RecurrenceOptions, match: PatternMatch): void => {
  if (match.type === 'weekend') {
    // Set to weekly frequency
    options.freq = RRule.WEEKLY;
    
    // Set to Saturday and Sunday
    options.byweekday = [RRule.SA, RRule.SU];
  }
};

// Create and export the pattern handler
export const weekendPatternHandler = createPatternHandler(
  'weekend',
  [weekendMatcher],
  weekendProcessor,
  {
    category: 'dayOfWeek',
    priority: 2
  }
);
```

This approach follows the modern pattern handler structure with clear separation of concerns between matching and processing, making it easier to maintain and extend.

## Thank You!

Your contributions are what make Helios-JS better. Thank you for taking the time to contribute and for following these guidelines! 