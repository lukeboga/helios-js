# Getting Started with Helios-JS

This guide will help you quickly get up and running with Helios-JS, a powerful natural language to RRule converter. Whether you're building a calendar application, scheduling system, or just need to handle recurring events, Helios-JS makes it easy to transform human-friendly text into structured recurrence rules.

## Installation

You can install Helios-JS using npm or yarn:

```bash
# Using npm
npm install helios-js

# Using yarn
yarn add helios-js
```

## Basic Usage

### Converting Natural Language to RRule

The simplest way to use Helios-JS is through the `createRRule` function, which converts natural language directly into an RRule object:

```javascript
import { createRRule } from 'helios-js';

// Start date for the recurrence
const startDate = new Date();

// Create an RRule from natural language
const rule = createRRule(startDate, "every monday");

// Get the next 5 occurrences
const nextFive = rule.all((date, i) => i < 5);
console.log(nextFive); // Array of the next 5 Mondays
```

### Advanced Usage with Options

If you need more control over the conversion process, you can use the `naturalLanguageToRRule` function, which returns RRule options that you can modify before creating an RRule:

```javascript
import { naturalLanguageToRRule } from 'helios-js';
import { RRule } from 'rrule';

// Start date for the recurrence
const startDate = new Date();

// Get RRule options from natural language
const options = naturalLanguageToRRule(startDate, "monthly on the 15th");

// Modify options if needed
options.count = 10; // Limit to 10 occurrences

// Create an RRule with the modified options
const rule = new RRule(options);

// Get all occurrences
const allDates = rule.all();
console.log(allDates); // Array of all matching dates
```

## Supported Pattern Types

Helios-JS supports a wide variety of natural language patterns:

### Basic Frequencies

```javascript
createRRule(startDate, "daily");
createRRule(startDate, "weekly");
createRRule(startDate, "monthly");
createRRule(startDate, "yearly");
```

### Intervals

```javascript
createRRule(startDate, "every 2 days");
createRRule(startDate, "every 3 weeks");
createRRule(startDate, "every other month");
createRRule(startDate, "every 5 years");
```

### Specific Days

```javascript
createRRule(startDate, "every monday");
createRRule(startDate, "every tuesday and thursday");
createRRule(startDate, "every weekday");
createRRule(startDate, "every weekend");
```

### Day of Month

```javascript
createRRule(startDate, "monthly on the 15th");
createRRule(startDate, "1st of the month");
createRRule(startDate, "last day of month");
```

### Combined Patterns

```javascript
createRRule(startDate, "every other monday");
createRRule(startDate, "every 2 weeks on friday");
createRRule(startDate, "monthly on the 15th");
```

### End Dates

```javascript
createRRule(startDate, "weekly until December 31, 2023");
createRRule(startDate, "daily until next year");
```

For a complete list of supported patterns, see our [Pattern Guide](./patterns.md).

## Validation

You can check if a pattern is valid before using it:

```javascript
import { validatePattern } from 'helios-js';

const result = validatePattern("every monday and fridays");

if (result.valid) {
  console.log("Pattern is valid with confidence:", result.confidence);
} else {
  console.log("Pattern is invalid:", result.warnings);
}
```

## Configuration Options

Helios-JS offers configuration options for customizing its behavior:

```javascript
import { createRRule } from 'helios-js';

const config = {
  applyDefaults: true,
  // Additional configuration options...
};

const rule = createRRule(startDate, "every monday", config);
```

## Error Handling

Helios-JS provides informative errors and warnings to help you debug pattern issues:

```javascript
try {
  const rule = createRRule(startDate, "evry day");
} catch (error) {
  console.error("Error creating rule:", error.message);
}
```

## Examples

### Creating a Weekly Meeting Schedule

```javascript
import { createRRule } from 'helios-js';

// Team meeting every Monday at 10 AM
const startDate = new Date();
startDate.setHours(10, 0, 0); // Set time to 10:00 AM

const teamMeeting = createRRule(startDate, "every monday");

// Get the next 10 meeting dates
const nextMeetings = teamMeeting.all((date, i) => i < 10);
```

### Monthly Payment Schedule

```javascript
import { createRRule } from 'helios-js';

// Payment due on the 15th of each month
const startDate = new Date();
const paymentSchedule = createRRule(startDate, "monthly on the 15th");

// Get payment dates for the next year
const oneYearFromNow = new Date();
oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

const paymentDates = paymentSchedule.between(startDate, oneYearFromNow);
```

### Bi-Weekly Payroll

```javascript
import { createRRule } from 'helios-js';

// Payroll every two weeks on Friday
const startDate = new Date();
const payrollSchedule = createRRule(startDate, "every 2 weeks on friday");

// Get the next 5 payroll dates
const nextPayrolls = payrollSchedule.all((date, i) => i < 5);
```

## Next Steps

- Explore the [Pattern Guide](./patterns.md) for a comprehensive list of supported patterns
- Check out the [API Reference](../development/api-reference.md) for detailed documentation
- Learn about [Advanced Usage](./advanced-usage.md) for more complex scenarios

## Need Help?

If you encounter any issues or have questions about using Helios-JS, please:

1. Check the [FAQ](./faq.md) for answers to common questions
2. Search existing issues on GitHub
3. Open a new issue if your question hasn't been addressed

Happy scheduling! 