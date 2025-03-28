# Condensed List of Supported Natural Language Recurrence Patterns

## Format Notes

* `{day}` represents any day of the week: `monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`, `sunday`
* `{day-abbr}` represents three-letter abbreviation: `mon`, `tue`, `wed`, `thu`, `fri`, `sat`, `sun`
* `{n}` represents any positive integer: `1`, `2`, `3`, etc.
* `{nth}` represents any ordinal number format: `1st`, `2nd`, `3rd`, `4th`, etc.
* `[text]` represents optional text that can be included or omitted
* `(a|b)` represents alternative options where either `a` or `b` can be used

All patterns are case-insensitive and tolerant of extra whitespace. Plural forms (e.g., "days" vs "day") are handled automatically.

## Simple Frequency Patterns

| Pattern | RRule Equivalent | Examples |
|---------|------------------|----------|
| `daily` | FREQ=DAILY | "daily" |
| `every day` | FREQ=DAILY | "every day" |
| `weekly` | FREQ=WEEKLY | "weekly" |
| `every week` | FREQ=WEEKLY | "every week" |
| `monthly` | FREQ=MONTHLY | "monthly" |
| `every month` | FREQ=MONTHLY | "every month" |
| `(yearly\|annually)` | FREQ=YEARLY | "yearly", "annually" |
| `every year` | FREQ=YEARLY | "every year" |

## Interval Patterns

| Pattern | RRule Equivalent | Examples |
|---------|------------------|----------|
| `every {n} (day\|days)` | FREQ=DAILY;INTERVAL={n} | "every 2 days", "every 5 day" |
| `every {nth} (day\|days)` | FREQ=DAILY;INTERVAL={n} | "every 3rd day", "every 2nd days" |
| `every other day` | FREQ=DAILY;INTERVAL=2 | "every other day" |
| `every {n} (week\|weeks)` | FREQ=WEEKLY;INTERVAL={n} | "every 2 weeks", "every 3 week" |
| `every {nth} (week\|weeks)` | FREQ=WEEKLY;INTERVAL={n} | "every 2nd week", "every 3rd weeks" |
| `every other week` | FREQ=WEEKLY;INTERVAL=2 | "every other week" |
| `every {n} (month\|months)` | FREQ=MONTHLY;INTERVAL={n} | "every 2 months", "every 6 month" |
| `every {nth} (month\|months)` | FREQ=MONTHLY;INTERVAL={n} | "every 2nd month", "every 3rd months" |
| `every other month` | FREQ=MONTHLY;INTERVAL=2 | "every other month" |
| `every {n} (year\|years)` | FREQ=YEARLY;INTERVAL={n} | "every 2 years", "every 5 year" |
| `every {nth} (year\|years)` | FREQ=YEARLY;INTERVAL={n} | "every 2nd year", "every 3rd years" |
| `every other year` | FREQ=YEARLY;INTERVAL=2 | "every other year" |

## Day of Week Patterns

| Pattern | RRule Equivalent | Examples |
|---------|------------------|----------|
| `every {day}` | FREQ=WEEKLY;BYDAY={day-code} | "every monday", "every friday" |
| `every {day-abbr}` | FREQ=WEEKLY;BYDAY={day-code} | "every mon", "every fri" |
| `every {day} and {day}` | FREQ=WEEKLY;BYDAY={day-code1},{day-code2} | "every monday and friday" |
| `every {day}, {day}[,] and {day}` | FREQ=WEEKLY;BYDAY={day-code1},{day-code2},{day-code3} | "every monday, wednesday and friday" |
| `every weekday` | FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR | "every weekday" |
| `every weekend` | FREQ=WEEKLY;BYDAY=SA,SU | "every weekend" |

## Combined Patterns

| Pattern | RRule Equivalent | Examples |
|---------|------------------|----------|
| `every other {day}` | FREQ=WEEKLY;INTERVAL=2;BYDAY={day-code} | "every other monday" |
| `every {n} weeks on {day}` | FREQ=WEEKLY;INTERVAL={n};BYDAY={day-code} | "every 2 weeks on tuesday" |
| `every {n} weeks on {day} and {day}` | FREQ=WEEKLY;INTERVAL={n};BYDAY={day-code1},{day-code2} | "every 3 weeks on wednesday and friday" |

## Special Forms

| Pattern | RRule Equivalent | Examples |
|---------|------------------|----------|
| `(fortnight\|fortnightly)` | FREQ=WEEKLY;INTERVAL=2 | "fortnight", "fortnightly" |
| `biweekly` | FREQ=WEEKLY;INTERVAL=2 | "biweekly" |
| `bimonthly` | FREQ=MONTHLY;INTERVAL=2 | "bimonthly" |

## Day Code Mapping

For reference, these are the mappings from day names to RRule day codes:

| Day | Abbreviation | RRule Code |
|-----|--------------|------------|
| monday | mon | MO |
| tuesday | tue | TU |
| wednesday | wed | WE |
| thursday | thu | TH |
| friday | fri | FR |
| saturday | sat | SA |
| sunday | sun | SU |

## Pattern Handling Logic

### Priority Resolution

When multiple pattern components could be interpreted in different ways:

1. **Interval + Unit Patterns** take highest precedence
   * Example: In "every 2 weeks on Monday", the "every 2 weeks" defines the base frequency and interval

2. **Basic Frequency Patterns** are applied when no interval pattern is present
   * Example: In "weekly on Tuesday", "weekly" sets the frequency

3. **Day of Week Patterns** complement other pattern types
   * Example: In "every month on Monday", the monthly frequency is maintained with Monday specification added

### Special Case Handling

1. **Default Frequency**: If no frequency can be determined, the system defaults to daily frequency

2. **Multiple Day Specification**: When multiple days are specified, they are combined rather than overriding each other
   * Example: "every monday and wednesday" sets both days as recurrence days

3. **Whitespace and Capitalization**: The parser normalizes whitespace and is case-insensitive
   * Examples: "every   Monday" and "Every monday" are both valid

4. **Ordinal Numbers**: The parser removes ordinal suffixes (st, nd, rd, th) before processing
   * Examples: "every 2nd day" and "every 2 day" are treated the same