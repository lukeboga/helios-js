# Natural Language to RRule Converter

## Project Goal

We are developing a JavaScript function that can convert natural language descriptions of recurring events into structured RRule configurations. This function bridges the gap between how humans naturally express recurrence patterns (such as "every Monday" or "weekly") and the formal structure required by the RRule library for handling recurring dates programmatically.

The function takes three arguments:
1. **startDate**: A JavaScript Date object representing when the recurrence begins
2. **recurrencePattern**: A string containing the natural language description (e.g., "every 2 weeks")
3. **endDate**: An optional JavaScript Date object specifying when the recurrence ends

## Development Approach

We've taken a systematic, iterative approach to building this functionality:

1. **Research and Pattern Identification**: We began by categorizing common natural language patterns for expressing recurrence, including simple frequencies, intervals, day specifications, and combinations.

2. **Rule-Based System Design**: We chose a rule-based regex approach over NLP, providing a good balance of simplicity, performance, and maintainability without external dependencies.

3. **Modular Implementation**: The code is structured around separate transformation functions for different pattern categories, making it easy to extend.

4. **Test-Driven Development**: We've built a simple testing framework to validate each pattern interpretation against expected RRule outputs.

5. **Iterative Refinement**: We've refined the implementation based on testing results, particularly addressing pattern priority and conflict resolution.

## Current Implementation Status

Our implementation successfully handles these pattern categories:

### 1. Simple Frequency Patterns
- "daily", "every day"
- "weekly", "every week"
- "monthly", "every month"
- "yearly", "annually", "every year"

### 2. Interval Patterns
- "every X days/weeks/months/years"
- "every other day/week/month/year"

### 3. Day of Week Patterns
- "every Monday" (and other specific days)
- "every Tuesday and Thursday" (combinations with "and")
- "every weekday" (Monday through Friday)
- "every weekend" (Saturday and Sunday)

## Technical Implementation

The implementation uses a rule-based regex system with three main transformation components:

1. **Frequency Rules**: Match basic recurrence frequency patterns
2. **Interval Rules**: Process numeric intervals and modify frequency
3. **Day of Week Rules**: Handle specific day patterns and combinations

These components are carefully sequenced to handle pattern priorities correctly:
- Basic frequency patterns take precedence for clear expressions
- Interval patterns can override frequency based on the time unit
- Day patterns complement frequency settings but don't override monthly/yearly frequencies

## Project Structure

The project is organized as follows:
- `/src/index.ts` - Core implementation
- `/test/simple-test.ts` - Testing script
- `/vite.config.ts` - Build configuration

## Development Environment

The project uses:
- **TypeScript** for type safety
- **Vite** for building
- **Vitest** for testing
- **RRule** as the recurrence rule library

## Future Development Roadmap

We plan to extend the implementation to handle more complex patterns:

1. **Day of Month Patterns**
   - "on the 15th of every month"
   - "on the 1st and 15th of every month"
   - "on the last day of the month"

2. **Month-Based Patterns**
   - "in January and July"
   - "every January"
   - "every quarter"

3. **Positional Patterns**
   - "the first Monday of every month"
   - "the last Friday of the month"

4. **Time Inclusion**
   - "every day at 3pm"
   - "every Monday at 9am and 2pm"

## Guiding Principles

Throughout development, we adhere to these principles:
- **Readability**: Well-commented, descriptive code
- **Maintainability**: Modular design for easy extension
- **Performance**: Efficient pattern matching
- **Progressive Implementation**: Building complexity gradually
- **Thorough Testing**: Validating each pattern category