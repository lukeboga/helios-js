# Contributing to HeliosJS

Thank you for your interest in contributing to HeliosJS! This document outlines the coding standards and workflow we follow.

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## Coding Standards

We use ESLint and Prettier to enforce consistent code style. Before submitting your PR, please run:

```bash
npm run fix-style
```

### Key Style Guidelines

- Use TypeScript for all files
- Provide meaningful JSDoc comments for public APIs
- Use strict null checks (`strictNullChecks: true`)
- Write pure functions when possible
- Use meaningful variable names (no single-letter names except in loops)
- Add unit tests for new functionality

### Imports Organization

Imports should be organized in the following order (with a blank line between groups):

1. Node.js built-in modules
2. External dependencies (npm packages)
3. Internal modules (from the project)
4. Parent or sibling imports (relative paths)

```typescript
// Node.js built-ins
import { readFileSync } from 'fs';

// External dependencies
import { RRule } from 'rrule';
import type { Frequency } from 'rrule';

// Internal modules
import { normalizeInput } from './normalizer';
import { InvalidDayError } from './errors';

// Relative imports
import { extractDayNames } from './utils';
```

## Git Workflow

- Create a feature branch from `main`
- Make focused, atomic commits
- Write clear commit messages (present tense, imperative style)
- Keep PRs small and focused on a single issue/feature

## Commit Message Format

```
type(scope): short description

Longer description if needed
```

Types:
- feat: A new feature
- fix: A bug fix
- docs: Documentation changes
- style: Code style changes (formatting, etc.)
- refactor: Code changes that neither fix bugs nor add features
- test: Adding or modifying tests
- chore: Changes to the build process or auxiliary tools

## Testing

All new features and bug fixes should include tests. Run the test suite with:

```bash
npm test
```

## Documentation

Update documentation for any changed functionality. Code should be self-documenting with appropriate comments and JSDoc strings for public APIs.

## Pull Request Process

1. Ensure all tests pass
2. Update documentation if necessary
3. Add your changes to the CHANGELOG.md file
4. Submit your PR with a clear description of the changes and why they're needed

Thank you for contributing! 