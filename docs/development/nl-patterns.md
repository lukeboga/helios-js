# Technical Reference: Natural Language Pattern Support

This document provides a comprehensive technical reference for all natural language patterns supported by the `naturalLanguageToRRule` function. It details the syntax, corresponding RRule transformations, and implementation specifics.

## Pattern Recognition Architecture

Helios-JS uses a modular pattern recognition system that processes natural language in several stages:

1. **Normalization**: All input is normalized (lowercase, whitespace standardized, abbreviations expanded)
2. **Pattern Splitting**: Complex patterns are split into sub-patterns using conjunction terms
3. **Pattern Recognition**: Each pattern handler processes the input, extracting specific components
4. **Pattern Combination**: Results from multiple patterns are intelligently combined
5. **Default Application**: Missing values are filled with sensible defaults

Pattern handlers are applied in priority order, with higher-priority handlers taking precedence when conflicts arise.

## Pattern Recognition

The pattern recognition system uses a combination of exact matching and synonym replacement to handle various ways users might express the same pattern. This includes:

### Term Synonyms

The system supports alternative terms through the `TERM_SYNONYMS` mapping:

```typescript
// Special pattern synonyms
'all': 'every',
'each': 'every',
'any': 'every',
```

These synonyms are applied during normalization, allowing users to express patterns in different ways:

| Input | Normalized | RRule Output |
|-------|------------|--------------|
| "each day" | "daily" | `{ freq: RRule.DAILY }` |
| "all weekdays" | "every weekday" | `{ freq: RRule.WEEKLY, byweekday: [MO,TU,WE,TH,FR] }` |
| "any monday" | "every monday" | `{ freq: RRule.WEEKLY, byweekday: [MO] }` |

The synonym replacement happens after misspelling correction but before case normalization, ensuring that variations are properly handled while maintaining the correct pattern structure.

## Pattern Handler Priorities

| Handler | Priority | Purpose |
|---------|----------|---------|
| `intervalPatternHandler` | 1000 | Recognizes patterns with explicit intervals |
| `frequencyPatternHandler` | 900 | Recognizes basic frequency terms |
| `dayOfWeekPatternHandler` | 800 | Recognizes day-based patterns |
| `dayOfMonthPatternHandler` | 700 | Recognizes month day-based patterns |
| `untilDatePatternHandler` | 600 | Recognizes end date specifications |

## Supported Pattern Syntax

### Simple Frequency Patterns

| Pattern | RRule Equivalent | Examples |
|---------|------------------|----------|
| `daily` | `{ freq: RRule.DAILY }` | "daily" |
| `weekly` | `{ freq: RRule.WEEKLY }` | "weekly" |
| `monthly` | `{ freq: RRule.MONTHLY }` | "monthly" |
| `yearly\|annually` | `{ freq: RRule.YEARLY }` | "yearly", "annually" |
| `every day` | `{ freq: RRule.DAILY }` | "every day" |
| `every week` | `{ freq: RRule.WEEKLY }` | "every week" |
| `every month` | `{ freq: RRule.MONTHLY }` | "every month" |
| `every year` | `{ freq: RRule.YEARLY }` | "every year" |

### Interval Patterns

| Pattern | RRule Equivalent | Examples |
|---------|------------------|----------|
| `every {n} days?` | `{ freq: RRule.DAILY, interval: n }` | "every 2 days" |
| `every {nth} days?` | `{ freq: RRule.DAILY, interval: n }` | "every 3rd day" |
| `every other day` | `{ freq: RRule.DAILY, interval: 2 }` | "every other day" |
| `every {n} weeks?` | `{ freq: RRule.WEEKLY, interval: n }` | "every 2 weeks" |
| `every {nth} weeks?` | `{ freq: RRule.WEEKLY, interval: n }` | "every 2nd week" |
| `every other week` | `{ freq: RRule.WEEKLY, interval: 2 }` | "every other week" |
| `every {n} months?` | `{ freq: RRule.MONTHLY, interval: n }` | "every 3 months" |
| `every {nth} months?` | `{ freq: RRule.MONTHLY, interval: n }` | "every 3rd month" |
| `every other month` | `{ freq: RRule.MONTHLY, interval: 2 }` | "every other month" |
| `every {n} years?` | `{ freq: RRule.YEARLY, interval: n }` | "every 5 years" |
| `every {nth} years?` | `{ freq: RRule.YEARLY, interval: n }` | "every 5th year" |
| `every other year` | `{ freq: RRule.YEARLY, interval: 2 }` | "every other year" |
| `(fortnight\|fortnightly)` | `{ freq: RRule.WEEKLY, interval: 2 }` | "fortnight", "fortnightly" |
| `biweekly` | `{ freq: RRule.WEEKLY, interval: 2 }` | "biweekly" |
| `bimonthly` | `{ freq: RRule.MONTHLY, interval: 2 }` | "bimonthly" |

### Day of Week Patterns

| Pattern | RRule Equivalent | Examples |
|---------|------------------|----------|
| `every {day}` | `{ freq: RRule.WEEKLY, byweekday: [day] }` | "every monday" |
| `every {day-abbr}` | `{ freq: RRule.WEEKLY, byweekday: [day] }` | "every mon" |
| `every {day} and {day}` | `{ freq: RRule.WEEKLY, byweekday: [day1, day2] }` | "every monday and friday" |
| `every weekday` | `{ freq: RRule.WEEKLY, byweekday: [MO,TU,WE,TH,FR] }` | "every weekday" |
| `every weekend` | `{ freq: RRule.WEEKLY, byweekday: [SA,SU] }` | "every weekend" |
| `on {day}` | `{ byweekday: [day] }` | "on monday" |

### Day of Month Patterns

| Pattern | RRule Equivalent | Examples |
|---------|------------------|----------|
| `{nth} (day\|) of the month` | `{ freq: RRule.MONTHLY, bymonthday: n }` | "1st of the month" |
| `on the {nth}` | `{ freq: RRule.MONTHLY, bymonthday: n }` | "on the 15th" |
| `day {n} of the month` | `{ freq: RRule.MONTHLY, bymonthday: n }` | "day 10 of the month" |
| `last day of (the\|) month` | `{ freq: RRule.MONTHLY, bymonthday: -1 }` | "last day of month" |
| `{nth} to last day of month` | `{ freq: RRule.MONTHLY, bymonthday: -n }` | "2nd to last day of month" |

### Until Date Patterns

| Pattern | RRule Equivalent | Examples |
|---------|------------------|----------|
| `until {date}` | `{ until: Date }` | "until December 31, 2023" |
| `ending {date}` | `{ until: Date }` | "ending next month" |
| `through {date}` | `{ until: Date }` | "through next week" |

### Combined Patterns

| Pattern | RRule Equivalent | Examples |
|---------|------------------|----------|
| `every other {day}` | `{ freq: RRule.WEEKLY, interval: 2, byweekday: [day] }` | "every other monday" |
| `every {n} weeks on {day}` | `{ freq: RRule.WEEKLY, interval: n, byweekday: [day] }` | "every 3 weeks on friday" |
| `monthly on the {nth}` | `{ freq: RRule.MONTHLY, bymonthday: n }` | "monthly on the 15th" |
| `monthly on {day}` | `{ freq: RRule.MONTHLY, byweekday: [day] }` | "monthly on monday" |

## Pattern Handling Implementation

Each pattern handler follows this structure:

```typescript
{
  name: string;           // Name of the pattern type
  priority: number;       // Processing priority (higher first)
  apply: (input: string) => PatternResult | null;  // Pattern matching function
}
```

The `PatternResult` contains:

```typescript
{
  options: RecurrenceOptions;  // Recognized RRule options
  metadata: {
    patternName: string;       // Name of matched pattern
    confidence: number;        // Confidence score (0-1)
    setProperties: Set<string>; // Which options properties were set
    warnings: string[];        // Any potential issues
  }
}
```

## Pattern Combination Logic

When multiple patterns are detected in a single input, the system uses these rules to combine them:

1. **Frequency Consolidation**: The highest priority pattern determines the base frequency
2. **Property Merging**: Non-conflicting properties are merged (e.g., `byweekday` and `bymonthday`)
3. **Conflict Resolution**: When properties conflict, the highest priority pattern wins
4. **Default Application**: Missing properties get default values unless explicitly disabled

## Default Values

If certain properties are not set by any pattern, these defaults are applied:

- `freq`: `RRule.DAILY` (recur daily)
- `interval`: `1` (every occurrence)
- `wkst`: `RRule.MO` (week starts on Monday)

## Normalizer Behavior

The normalizer performs several transformations to standardize input:

- Convert to lowercase
- Trim and normalize whitespace
- Expand common abbreviations (Mon → Monday)
- Standardize numerals (1st → 1)
- Handle spelling variations and misspellings

## Pattern Splitting

Complex patterns with conjunctions are split into sub-patterns. For example:

- "every monday and friday until december" → 
  - "every monday"
  - "every friday" 
  - "until december"

Special phrases (like date ranges) are protected during splitting to preserve their meaning.

## Protected Phrases

The following phrase types are protected during pattern splitting:

- Day ranges ("monday to friday")
- Month ranges ("january through march")
- Ordinal combinations ("1st and 3rd")
- Special frequencies ("every other")
- Time references ("at 3pm")

## Extensions and Customization

The pattern system is extensible through custom pattern handlers. To add support for new patterns:

1. Create a new handler implementing the `PatternHandler` interface
2. Register it with the transformer with an appropriate priority
3. Ensure it returns properly formatted `PatternResult` objects

## RRule Output Mapping

| Pattern Component | RRule Property | Possible Values |
|-------------------|----------------|-----------------|
| Frequency | `freq` | `RRule.DAILY`, `RRule.WEEKLY`, `RRule.MONTHLY`, `RRule.YEARLY` |
| Interval | `interval` | Any positive integer (default: 1) |
| Days of Week | `byweekday` | Array of `RRule.MO`, `RRule.TU`, etc. |
| Days of Month | `bymonthday` | Array of integers 1-31 or negative (-1 to -31) |
| Months | `bymonth` | Array of integers 1-12 |
| End Date | `until` | JavaScript Date object |

## Confidence Scoring

The system assigns confidence scores to pattern matches:

- 1.0: Strong, unambiguous match
- 0.8-0.9: Good match with minor uncertainty
- 0.5-0.7: Potential match with significant uncertainty
- <0.5: Weak match, likely incorrect

## Error Handling

When patterns cannot be recognized or combined properly:

1. The system attempts to recover by applying defaults
2. Warning messages are captured in the `warnings` array
3. The confidence score is reduced to reflect uncertainty
4. The transformation returns the best approximation it can create 