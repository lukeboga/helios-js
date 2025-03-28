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
- Extensible pattern recognition system
- TypeScript support with full type definitions

## Installation

```bash
npm install helios-js
# or
yarn add helios-js
```

## Usage

```typescript
import { createRRule, datetime } from 'helios-js';

// Create a rule for every Monday
const rule = createRRule(new Date(), "every monday");

// Get the next 5 occurrences
const nextFive = rule.all((date, i) => i < 5);

// Create a rule with a specific start date and end date
const startDate = datetime(2023, 1, 1); // January 1, 2023
const endDate = datetime(2023, 12, 31); // December 31, 2023
const yearlyRule = createRRule(startDate, "yearly", endDate);
```

## API

### `naturalLanguageToRRule(startDate, recurrencePattern, endDate?)`

Converts a natural language recurrence pattern to an RRule options object.

- `startDate`: The start date for the recurrence pattern
- `recurrencePattern`: Natural language description (e.g., "every 2 weeks")
- `endDate`: Optional end date for the recurrence pattern
- Returns: An RRule configuration object

### `createRRule(startDate, recurrencePattern, endDate?)`

Creates an RRule instance from a natural language recurrence pattern.

- `startDate`: The start date for the recurrence pattern
- `recurrencePattern`: Natural language description (e.g., "every Monday")
- `endDate`: Optional end date for the recurrence pattern
- Returns: An RRule instance

### Utility Functions

- `datetime(year, month, day, hour?, minute?, second?)`: Creates a date in UTC format with month starting from 1 (not 0)
- `asWeekdays(weekdays)`: Helps handle type incompatibilities between RRule.Weekday constants and imported Weekday type

## Project Structure

- `src/index.ts` - Main entry point and public API
- `src/transformer.ts` - Core transformation logic
- `src/normalizer.ts` - Input text normalization
- `src/types.ts` - Type definitions
- `src/constants.ts` - Constant values
- `src/errors.ts` - Custom error classes
- `src/patterns/` - Pattern recognition modules
- `src/utils/` - Utility functions

## License

MIT
