# Comprehensive Natural Language Pattern Catalog

This document provides a complete catalog of all natural language patterns currently supported by Helios-JS. It serves as both a reference for developers and a planning document for future pattern additions.

## Pattern Notation

In the pattern definitions below:
- `{day}` represents any day of the week: `monday`, `tuesday`, etc.
- `{day-abbr}` represents day abbreviations: `mon`, `tue`, etc.
- `{n}` represents any positive integer: `1`, `2`, `3`, etc.
- `{nth}` represents ordinal numbers: `1st`, `2nd`, `3rd`, etc.
- `{date}` represents any date expression: `December 31`, `next week`, etc.
- `[text]` indicates optional components
- `(a|b)` indicates alternative options (either `a` or `b`)

## Basic Frequency Patterns

### Simple Frequencies

| Pattern | RRule Output | Examples | Notes |
|---------|-------------|----------|-------|
| `daily` | `{ freq: RRule.DAILY }` | "daily", "every day", "each day", "all days", "any day" | Highest confidence |
| `weekly` | `{ freq: RRule.WEEKLY }` | "weekly", "every week", "each week", "all weeks", "any week" | Highest confidence |
| `monthly` | `{ freq: RRule.MONTHLY }` | "monthly", "every month", "each month", "all months", "any month" | Highest confidence |
| `(yearly\|annually)` | `{ freq: RRule.YEARLY }` | "yearly", "annually", "every year", "each year", "all years", "any year" | Both terms are equivalent |

### Alternative Terms

The library supports various ways to express frequency using alternative terms. These terms are normalized to their canonical form during processing:

| Term | Examples | Normalized To | Notes |
|------|----------|---------------|-------|
| `every` | "every day", "every week" | Standard form | Default canonical form |
| `each` | "each day", "each week" | "every" | Equivalent to "every" |
| `all` | "all days", "all weeks" | "every" | Equivalent to "every" |
| `any` | "any day", "any week" | "every" | Equivalent to "every" |

These terms can be used interchangeably in most patterns. For example:
- "each monday" → "every monday" → `{ freq: RRule.WEEKLY, byweekday: [MO] }`
- "all weekdays" → "every weekday" → `{ freq: RRule.WEEKLY, byweekday: [MO,TU,WE,TH,FR] }`
- "any day of the week" → "every day" → `{ freq: RRule.DAILY }`

The synonym replacement is handled by the normalizer before pattern matching, ensuring consistent processing regardless of the term used.

### Every + Unit Patterns

| Pattern | RRule Output | Examples | Notes |
|---------|-------------|----------|-------|
| `every day` | `{ freq: RRule.DAILY }` | "every day" | Equivalent to "daily" |
| `every week` | `{ freq: RRule.WEEKLY }` | "every week" | Equivalent to "weekly" |
| `every month` | `{ freq: RRule.MONTHLY }` | "every month" | Equivalent to "monthly" |
| `every year` | `{ freq: RRule.YEARLY }` | "every year" | Equivalent to "yearly" |

## Interval Patterns

### Numeric Interval Patterns

| Pattern | RRule Output | Examples | Notes |
|---------|-------------|----------|-------|
| `every {n} days?` | `{ freq: RRule.DAILY, interval: n }` | "every 2 days", "every 3 day" | Plural form optional |
| `every {n} weeks?` | `{ freq: RRule.WEEKLY, interval: n }` | "every 4 weeks", "every 3 week" | Plural form optional |
| `every {n} months?` | `{ freq: RRule.MONTHLY, interval: n }` | "every 3 months", "every 6 month" | Plural form optional |
| `every {n} years?` | `{ freq: RRule.YEARLY, interval: n }` | "every 2 years", "every 5 year" | Plural form optional |

### Ordinal Interval Patterns

| Pattern | RRule Output | Examples | Notes |
|---------|-------------|----------|-------|
| `every {nth} days?` | `{ freq: RRule.DAILY, interval: n }` | "every 3rd day", "every 2nd days" | Ordinal converted to number |
| `every {nth} weeks?` | `{ freq: RRule.WEEKLY, interval: n }` | "every 2nd week", "every 4th weeks" | Ordinal converted to number |
| `every {nth} months?` | `{ freq: RRule.MONTHLY, interval: n }` | "every 3rd month", "every 6th months" | Ordinal converted to number |
| `every {nth} years?` | `{ freq: RRule.YEARLY, interval: n }` | "every 2nd year", "every 5th years" | Ordinal converted to number |

### "Every Other" Patterns

| Pattern | RRule Output | Examples | Notes |
|---------|-------------|----------|-------|
| `every other day` | `{ freq: RRule.DAILY, interval: 2 }` | "every other day" | Special case: interval = 2 |
| `every other week` | `{ freq: RRule.WEEKLY, interval: 2 }` | "every other week" | Special case: interval = 2 |
| `every other month` | `{ freq: RRule.MONTHLY, interval: 2 }` | "every other month" | Special case: interval = 2 |
| `every other year` | `{ freq: RRule.YEARLY, interval: 2 }` | "every other year" | Special case: interval = 2 |

### Special Interval Terms

| Pattern | RRule Output | Examples | Notes |
|---------|-------------|----------|-------|
| `(fortnight\|fortnightly)` | `{ freq: RRule.WEEKLY, interval: 2 }` | "fortnight", "fortnightly" | Equivalent to "every 2 weeks" |
| `biweekly` | `{ freq: RRule.WEEKLY, interval: 2 }` | "biweekly" | Equivalent to "every 2 weeks" |
| `bimonthly` | `{ freq: RRule.MONTHLY, interval: 2 }` | "bimonthly" | Equivalent to "every 2 months" |

## Day of Week Patterns

### Single Day Patterns

| Pattern | RRule Output | Examples | Notes |
|---------|-------------|----------|-------|
| `every {day}` | `{ freq: RRule.WEEKLY, byweekday: [day] }` | "every monday", "every tuesday" | Full day name |
| `every {day-abbr}` | `{ freq: RRule.WEEKLY, byweekday: [day] }` | "every mon", "every tue" | 3-letter abbreviation |
| `on {day}` | `{ byweekday: [day] }` | "on monday", "on tuesday" | Sets byweekday without frequency |

### Multiple Day Patterns

| Pattern | RRule Output | Examples | Notes |
|---------|-------------|----------|-------|
| `every {day} and {day}` | `{ freq: RRule.WEEKLY, byweekday: [day1, day2] }` | "every monday and wednesday" | Two specific days |
| `every {day}, {day}, and {day}` | `{ freq: RRule.WEEKLY, byweekday: [day1, day2, day3] }` | "every monday, wednesday, and friday" | Three or more days |

### Day Groups

| Pattern | RRule Output | Examples | Notes |
|---------|-------------|----------|-------|
| `every weekday` | `{ freq: RRule.WEEKLY, byweekday: [MO,TU,WE,TH,FR] }` | "every weekday" | Monday through Friday |
| `every weekend` | `{ freq: RRule.WEEKLY, byweekday: [SA,SU] }` | "every weekend" | Saturday and Sunday |

## Day of Month Patterns

### Specific Day of Month

| Pattern | RRule Output | Examples | Notes |
|---------|-------------|----------|-------|
| `{nth} [day] of [the] month` | `{ freq: RRule.MONTHLY, bymonthday: n }` | "1st of the month", "15th day of month" | Day number with variations |
| `on the {nth}` | `{ freq: RRule.MONTHLY, bymonthday: n }` | "on the 15th", "on the 1st" | Day number with "on the" prefix |
| `day {n} of the month` | `{ freq: RRule.MONTHLY, bymonthday: n }` | "day 10 of the month" | Using cardinal number |

### Special Days of Month

| Pattern | RRule Output | Examples | Notes |
|---------|-------------|----------|-------|
| `last day of [the] month` | `{ freq: RRule.MONTHLY, bymonthday: -1 }` | "last day of month", "last day of the month" | Last day (negative index) |
| `{nth} to last day of month` | `{ freq: RRule.MONTHLY, bymonthday: -n }` | "2nd to last day of month" | Counting from end of month |

## Until Date Patterns

### End Date Specifications

| Pattern | RRule Output | Examples | Notes |
|---------|-------------|----------|-------|
| `until {date}` | `{ until: Date }` | "until December 31, 2023", "until next year" | Sets end date with "until" |
| `ending {date}` | `{ until: Date }` | "ending next month", "ending December" | Sets end date with "ending" |
| `through {date}` | `{ until: Date }` | "through next week", "through Friday" | Sets end date with "through" |

## Combined Patterns

These patterns are created when multiple pattern types are combined in a single input.

### Interval + Day of Week

| Pattern | RRule Output | Examples | Notes |
|---------|-------------|----------|-------|
| `every other {day}` | `{ freq: RRule.WEEKLY, interval: 2, byweekday: [day] }` | "every other monday" | Biweekly on a specific day |
| `every {n} weeks on {day}` | `{ freq: RRule.WEEKLY, interval: n, byweekday: [day] }` | "every 3 weeks on friday" | N-weekly on a specific day |
| `every {n} weeks on {day} and {day}` | `{ freq: RRule.WEEKLY, interval: n, byweekday: [day1, day2] }` | "every 2 weeks on monday and wednesday" | N-weekly on multiple days |

### Frequency + Day

| Pattern | RRule Output | Examples | Notes |
|---------|-------------|----------|-------|
| `(weekly\|every week) on {day}` | `{ freq: RRule.WEEKLY, byweekday: [day] }` | "weekly on monday", "every week on friday" | Weekly on specific day |
| `(monthly\|every month) on the {nth}` | `{ freq: RRule.MONTHLY, bymonthday: n }` | "monthly on the 15th", "every month on the 1st" | Monthly on specific day |
| `(monthly\|every month) on {day}` | `{ freq: RRule.MONTHLY, byweekday: [day] }` | "monthly on monday", "every month on friday" | Monthly on specific weekday |

### Patterns with End Dates

| Pattern | RRule Output | Examples | Notes |
|---------|-------------|----------|-------|
| `{any frequency pattern} until {date}` | `{ freq: X, until: Date, ... }` | "every monday until december", "daily until next year" | Any pattern with end date |
| `{any interval pattern} until {date}` | `{ freq: X, interval: n, until: Date, ... }` | "every 2 weeks until 2023", "every other day until June" | Interval with end date |
| `{any day pattern} until {date}` | `{ freq: X, byweekday: [...], until: Date, ... }` | "every monday and friday until next month" | Days with end date |

## Test Cases

### Simple Frequency Test Cases

```
"daily" → { freq: RRule.DAILY }
"weekly" → { freq: RRule.WEEKLY }
"monthly" → { freq: RRule.MONTHLY }
"yearly" → { freq: RRule.YEARLY }
"annually" → { freq: RRule.YEARLY }
```

### Interval Test Cases

```
"every 3 days" → { freq: RRule.DAILY, interval: 3 }
"every 2nd week" → { freq: RRule.WEEKLY, interval: 2 }
"every other month" → { freq: RRule.MONTHLY, interval: 2 }
"every 5 years" → { freq: RRule.YEARLY, interval: 5 }
"biweekly" → { freq: RRule.WEEKLY, interval: 2 }
"fortnightly" → { freq: RRule.WEEKLY, interval: 2 }
```

### Day of Week Test Cases

```
"every monday" → { freq: RRule.WEEKLY, byweekday: [RRule.MO] }
"every mon" → { freq: RRule.WEEKLY, byweekday: [RRule.MO] }
"every monday and friday" → { freq: RRule.WEEKLY, byweekday: [RRule.MO, RRule.FR] }
"every weekday" → { freq: RRule.WEEKLY, byweekday: [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR] }
"every weekend" → { freq: RRule.WEEKLY, byweekday: [RRule.SA, RRule.SU] }
```

### Day of Month Test Cases

```
"1st of the month" → { freq: RRule.MONTHLY, bymonthday: 1 }
"on the 15th" → { freq: RRule.MONTHLY, bymonthday: 15 }
"day 10 of the month" → { freq: RRule.MONTHLY, bymonthday: 10 }
"last day of month" → { freq: RRule.MONTHLY, bymonthday: -1 }
"2nd to last day of month" → { freq: RRule.MONTHLY, bymonthday: -2 }
```

### Until Date Test Cases

```
"until December 31, 2023" → { until: new Date("2023-12-31") }
"ending next month" → { until: <calculated date for next month> }
"through next week" → { until: <calculated date for end of next week> }
```

### Combined Pattern Test Cases

```
"every other monday" → { freq: RRule.WEEKLY, interval: 2, byweekday: [RRule.MO] }
"every 3 weeks on friday" → { freq: RRule.WEEKLY, interval: 3, byweekday: [RRule.FR] }
"monthly on the 15th" → { freq: RRule.MONTHLY, bymonthday: 15 }
"every monday until december" → { freq: RRule.WEEKLY, byweekday: [RRule.MO], until: <date in december> }
```

## Edge Cases and Special Handling

### Misspellings

The system attempts to correct common misspellings and variations:

```
"evry day" → interpreted as "every day"
"mondays" → interpreted as "monday"
"bi-weekly" → interpreted as "biweekly"
```

### Ambiguous Patterns

Some patterns could have multiple interpretations. The system uses these rules to resolve ambiguity:

```
"biweekly" → interpreted as "every 2 weeks" (not "twice a week")
"every day of the week" → interpreted as "daily"
"every day of the month" → interpreted as "daily"
```

### Unsupported Patterns

The following patterns are planned for future implementation:

1. Specific month patterns: "in January", "every March"
2. Specific time patterns: "at 3pm", "at noon"
3. Nth occurrence patterns: "first Monday of the month"
4. Day position patterns: "last Friday of the month"
5. Count-limited recurrence: "for the next 5 weeks"

## Future Extensions

Planned improvements to the pattern recognition system:

1. Support for month-specific patterns
2. Support for time-of-day specifications
3. Support for positional day patterns (first/last of month)
4. Improved handling of plural forms and possessives
5. More flexible date parsing for end dates 