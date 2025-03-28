# Pattern Recognition System

This directory contains the pattern recognition components for the natural language to RRule converter. Each pattern handler specializes in identifying specific types of recurrence expressions in natural language.

## Architecture

The pattern recognition system is designed as a pipeline:

1. Input text is first normalized (lowercase, whitespace standardized)
2. Pattern handlers are applied in priority order
3. Each handler identifies patterns it recognizes and updates the options object
4. The resulting options object is used to create an RRule

## Pattern Handlers

Each pattern handler focuses on a specific category of natural language expressions:

| Handler | Purpose | Examples |
|---------|---------|----------|
| `interval` | Recognizes patterns with explicit intervals | "every 2 weeks", "every other day" |
| `frequency` | Recognizes basic frequency terms | "daily", "weekly", "monthly", "yearly" |
| `dayOfWeek` | Recognizes day-based patterns | "every Monday", "every weekday" |

## Pattern Priority

Patterns are applied in order of priority, from highest to lowest:

1. **Interval patterns** (highest priority) - These set both interval and frequency
2. **Frequency patterns** - These determine the basic recurrence unit
3. **Day of week patterns** (lowest priority) - These add day specifications

## Adding New Pattern Handlers

To create a new pattern handler:

1. Create a new file in this directory (e.g., `dayOfMonth.ts`)
2. Implement the `PatternHandler` interface
3. Export the handler from the patterns module
4. Register the handler in `index.ts` with the appropriate priority

## Future Pattern Categories

Planned future patterns include:

- Day of month patterns ("on the 15th")
- Month patterns ("in January")
- Position patterns ("first Monday of the month")
- Time of day patterns ("at 3pm")

## Utility Functions

The `utils.ts` file provides shared functionality for pattern handlers:

- Day mapping utilities
- Frequency mapping utilities
- Text extraction helpers
