# Natural Language Patterns Guide

This guide explains the different ways you can express recurring events in natural language that Helios-JS can understand and convert to structured recurrence rules.

## What are Natural Language Patterns?

Natural language patterns are everyday phrases we use to describe when something repeats, like "every Monday" or "daily at noon". Helios-JS converts these human expressions into structured data that computers can process for calendar events, scheduling, and reminders.

## Basic Patterns

### Simple Frequencies

These are the most basic ways to express how often something happens:

| What You Say | What It Means | Examples |
|--------------|---------------|----------|
| "daily" | Happens every day | "Submit daily report" |
| "weekly" | Happens once a week | "Weekly team meeting" |
| "monthly" | Happens once a month | "Monthly budget review" |
| "yearly" or "annually" | Happens once a year | "Yearly performance review" |

### Alternative Terms

You can use different words to express the same frequency:

| What You Say | What It Means | Examples |
|--------------|---------------|----------|
| "every day" | Same as "daily" | "Check email every day" |
| "each day" | Same as "daily" | "Take medication each day" |
| "all days" | Same as "daily" | "Water plants all days" |
| "any day" | Same as "daily" | "Exercise any day" |

These terms work the same way for other frequencies too:
- "each week" = "every week" = "weekly"
- "all months" = "every month" = "monthly"
- "any year" = "every year" = "yearly"

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
| "ending on June 15th" | Stops after that date | "Daily meetings ending on June 15th" |
| "ending next month" | Stops at the end of next month | "Daily reminders ending next month" |
| "until the end of summer" | Stops at the end of summer | "Weekly classes until the end of summer" |
| "stopping on the last day of the quarter" | Stops on the last day of the current quarter | "Weekly reports stopping on the last day of the quarter" |

### Combining with Other Patterns

End date patterns work with all other pattern types:

```javascript
// Daily recurrence ending on a specific date
"daily until December 31, 2023"

// Weekly on specific days with an end date
"every Monday and Wednesday until next month"

// Monthly with a specific day of month and end date
"monthly on the 15th until the end of the year"

// With intervals
"every 2 weeks until June 2024"
```

### How End Dates Work

When you specify an end date:

1. The recurrence continues up to (and including) the specified date
2. Any occurrences that would fall after that date are excluded
3. If the end date doesn't match the recurrence pattern (e.g., "every Monday until Tuesday"), the last occurrence will be the last matching day before the end date

For date expressions like "next month" or "end of year", Helios-JS uses the current date as reference to determine the exact end date.

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