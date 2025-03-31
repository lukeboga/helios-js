# HeliosJS - Natural Language to RRule Converter

A powerful library to convert natural language date recurrence patterns into [RRule](https://github.com/jakubroztocil/rrule) configurations.

## Overview

HeliosJS bridges the gap between how humans express recurring events and the structured format required by calendar systems. It allows you to express recurrence patterns in plain English and converts them to the appropriate RRule configuration.

## Features

- Convert natural language to RRule options
- Support for common recurrence patterns:
  - Basic frequencies: "daily", "weekly", "monthly", "yearly"
  - Intervals: "every 2 weeks", "every other day"
  - Days of week: "every Monday", "every Tuesday and Thursday"
  - Special day groups: "every weekday", "every weekend"
  - End dates: "until December 31", "ending next month"
- Extensible pattern recognition system
- Comprehensive normalization pipeline
- TypeScript support with full type definitions

## Installation

```bash
npm install helios-js
# or
yarn add helios-js
```

## Quick Usage

```typescript
import { createRRule } from 'helios-js';

// Create a rule for every Monday
const rule = createRRule(new Date(), "every monday");

// Get the next 5 occurrences
const nextFive = rule.all((date, i) => i < 5);

// Create a rule with a specific pattern
const weeklyRule = createRRule(
  new Date(), 
  "every 2 weeks on Tuesday and Thursday until December 31, 2023"
);
```

## Documentation

For comprehensive documentation, please refer to the [documentation directory](./docs/README.md), which includes:

### User Documentation

- [Getting Started Guide](./docs/public/getting-started.md)
- [Pattern Guide](./docs/public/patterns.md)
- [Advanced Usage Guide](./docs/public/advanced-usage.md)
- [Troubleshooting Guide](./docs/public/troubleshooting.md)

### Developer Documentation

- [Architecture Overview](./docs/development/architecture-overview.md)
- [API Reference](./docs/development/api-reference.md)
- [Normalization Pipeline](./docs/development/normalization-pipeline.md)
- [Pattern Handler Guide](./docs/development/pattern-handler-guide.md)
- [Contributing Guide](./docs/development/contributing-guide.md)

## Core API Functions

### `naturalLanguageToRRule(startDate, recurrencePattern, config?)`

Converts a natural language recurrence pattern to an RRule options object.

```typescript
import { naturalLanguageToRRule } from 'helios-js';

const options = naturalLanguageToRRule(new Date(), "every monday");
```

### `createRRule(startDate, recurrencePattern, config?)`

Creates an RRule instance from a natural language recurrence pattern.

```typescript
import { createRRule } from 'helios-js';

const rule = createRRule(new Date(), "every monday");
```

### `validatePattern(pattern, config?)`

Validates if a natural language pattern can be parsed correctly.

```typescript
import { validatePattern } from 'helios-js';

const validation = validatePattern("every monday");
if (validation.valid) {
  console.log("Pattern is valid!");
}
```

## Project Structure

- `src/index.ts` - Main entry point and public API
- `src/transformer.ts` - Core transformation logic
- `src/normalizer.ts` - Input text normalization
- `src/types.ts` - Type definitions
- `src/constants.ts` - Constant values
- `src/errors.ts` - Custom error classes
- `src/patterns/` - Pattern recognition modules
- `src/utils/` - Utility functions
- `docs/` - Comprehensive documentation

## Contributing

Contributions are welcome! Please see our [Contributing Guide](./docs/development/contributing-guide.md) for details.

## License

MIT
