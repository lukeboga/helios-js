# Natural Language Patterns Guide

This guide explains the different ways you can express recurring events in natural language that Helios-JS can understand and convert to structured recurrence rules.

## What are Natural Language Patterns?

Natural language patterns are everyday phrases we use to describe when something repeats, like "every Monday" or "daily at noon". Helios-JS converts these human expressions into structured data that computers can process for calendar events, scheduling, and reminders.

## Basic Patterns

### Simple Frequencies

These are the most basic ways to express how often something happens:

| Pattern | Examples | Notes |
|---------|----------|-------|
| `daily` | "daily", "every day", "each day", "all days" | Most common frequency |
| `weekly` | "weekly", "every week", "each week", "all weeks" | Weekly recurrence |
| `monthly` | "monthly", "every month", "each month", "all months" | Monthly recurrence |
| `yearly` | "yearly", "annually", "every year", "each year", "all years" | Yearly recurrence |

### Alternative Terms

The library supports various ways to express frequency using alternative terms:

| Term | Examples | Equivalent To |
|------|----------|---------------|
| `every` | "every day", "every week" | Standard form |
| `each` | "each day", "each week" | Same as "every" |
| `all` | "all days", "all weeks" | Same as "every" |
| `any` | "any day", "any week" | Same as "every" |

These terms can be used interchangeably in most patterns. For example:
- "each monday" = "every monday"
- "all weekdays" = "every weekday"
- "any day of the week" = "every day"

### Using "Every"

You can also use "every" followed by a time unit:

| What You Say | What It Means | Examples |
|--------------|---------------|----------|
| "every day" | Same as "daily" | "Check email every day" |
| "every week" | Same as "weekly" | "Clean the office every week" |
| "every month" | Same as "monthly" | "Pay rent every month" |
| "every year" | Same as "yearly" | "Renew subscription every year" |

## Specific Days

### Weekdays

You can specify which day(s) of the week:

| What You Say | What It Means | Examples |
|--------------|---------------|----------|
| "every Monday" | Happens each Monday | "Team standup every Monday" |
| "every Tuesday and Thursday" | Happens on both days | "Gym every Tuesday and Thursday" |
| "every weekday" | Monday through Friday | "Work every weekday" |
| "every weekend" | Saturday and Sunday | "Relax every weekend" |

### Day of Month

You can specify which day of the month:

| What You Say | What It Means | Examples |
|--------------|---------------|----------|
| "1st of the month" | Happens on the first day | "Rent due 1st of the month" |
| "on the 15th" | Happens on that day number | "Payday on the 15th" |
| "last day of month" | Happens on the final day | "Monthly report on last day of month" |

## Intervals

Want something to happen every few days, weeks, months, or years? Use intervals:

| What You Say | What It Means | Examples |
|--------------|---------------|----------|
| "every 2 days" | Every other day | "Water plants every 2 days" |
| "every 3 weeks" | Once every three weeks | "Haircut every 3 weeks" |
| "every other month" | Every two months | "Dentist every other month" |
| "every 5 years" | Once every five years | "Renew passport every 5 years" |

## Combined Patterns

You can combine different pattern types:

| What You Say | What It Means | Examples |
|--------------|---------------|----------|
| "every other Monday" | Every two weeks, on Monday | "Biweekly Monday meeting" |
| "every 2 weeks on Friday" | Every two weeks, on Friday | "Paycheck every 2 weeks on Friday" |
| "monthly on the 15th" | Once a month, on the 15th | "Bill due monthly on the 15th" |

## End Dates

You can specify when a recurring event should stop:

| What You Say | What It Means | Examples |
|--------------|---------------|----------|
| "until December 31st" | Stops after that date | "Weekly until December 31st" |
| "until next year" | Stops at year end | "Monthly meetings until next year" |

## Special Terms

Some common expressions have special meanings:

| What You Say | What It Means | Examples |
|--------------|---------------|----------|
| "biweekly" | Every two weeks | "Biweekly paycheck" |
| "bimonthly" | Every two months | "Bimonthly newsletter" |
| "fortnightly" | Every two weeks | "Fortnightly cleaning service" |

## Tips for Clear Patterns

1. **Be specific**: "Every Monday at 9 AM" is clearer than just "weekly"
2. **Use common phrases**: Standard expressions like "every weekday" work best
3. **Keep it simple**: Complex patterns might need to be broken down
4. **Check understanding**: Always verify how the system interpreted your pattern

## Examples in Action

Here are some real-world examples:

- "Team meeting every Monday at 10 AM"
- "Take medication every 12 hours"
- "Pay credit card bill monthly on the 5th"
- "Quarterly business review on the last Friday of the quarter"
- "Annual family vacation every July"

---

For developers looking for more technical details, please check our [developer documentation](../development/nl-patterns.md) on natural language patterns. 