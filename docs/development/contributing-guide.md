# Contributing to Helios-JS

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
│   ├── patterns/         # Pattern handlers
│   ├── utils/            # Utility functions
│   ├── constants.ts      # Constants and enums
│   ├── errors.ts         # Error definitions
│   ├── index.ts          # Main entry point
│   ├── normalizer.ts     # Text normalization
│   ├── transformer.ts    # Transformation pipeline
│   └── types.ts          # Type definitions
├── docs/                 # Documentation
│   ├── public/           # User documentation
│   └── development/      # Developer documentation
├── test/                 # Test files
├── _planning/            # Planning and research documents
├── package.json          # Package configuration
└── tsconfig.json         # TypeScript configuration
```

### Key Components

- **src/patterns/**: Contains pattern handlers for different recurrence pattern types
- **src/normalizer.ts**: Handles text normalization before pattern matching
- **src/transformer.ts**: Orchestrates the transformation pipeline
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

Helios-JS uses Jest for testing. Follow these guidelines when adding or modifying tests:

### Test Structure

- Group tests for a single unit using `describe`
- Use descriptive test names that explain what's being tested
- Follow the AAA (Arrange, Act, Assert) pattern

Example:

```typescript
describe('normalizeInput', () => {
  it('converts text to lowercase', () => {
    // Arrange
    const input = 'Every Monday';
    
    // Act
    const result = normalizeInput(input);
    
    // Assert
    expect(result).toBe('every monday');
  });
  
  it('removes ordinal suffixes from numbers', () => {
    // Arrange
    const input = 'every 2nd week';
    
    // Act
    const result = normalizeInput(input);
    
    // Assert
    expect(result).toBe('every 2 week');
  });
});
```

### Running Tests

Run tests with:

```bash
# Using npm
npm test

# Using yarn
yarn test
```

Run tests in watch mode during development:

```bash
# Using npm
npm test -- --watch

# Using yarn
yarn test --watch
```

### Test Coverage

Aim for high test coverage, especially for core functionality:

```bash
# Using npm
npm test -- --coverage

# Using yarn
yarn test --coverage
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

## Thank You!

Your contributions are what make Helios-JS better. Thank you for taking the time to contribute and for following these guidelines! 