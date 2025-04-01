# Helios-JS Documentation

Welcome to the Helios-JS documentation. This guide will help you navigate through the various documents available for both users and developers.

## Documentation Overview

The documentation is organized into two main sections:

1. **Public Documentation** - For users of the library
2. **Development Documentation** - For developers contributing to the library

## Public Documentation

Documentation for users who want to integrate and use Helios-JS in their applications:

- [**Getting Started Guide**](./public/getting-started.md) - Quick introduction to installing and using Helios-JS in your projects
- [**Pattern Guide**](./public/patterns.md) - Comprehensive guide to supported natural language patterns
- [**Advanced Usage Guide**](./public/advanced-usage.md) - Advanced features, customization, and optimization
- [**Troubleshooting Guide**](./public/troubleshooting.md) - Solutions to common issues and error handling

## Development Documentation

Documentation for developers who want to understand, extend, or contribute to Helios-JS:

- [**Architecture Overview**](./development/architecture-overview.md) - High-level overview of the system design
- [**API Reference**](./development/api-reference.md) - Detailed reference for all exported functions and types
- [**Normalization Pipeline**](./development/normalization-pipeline.md) - How text preprocessing works
- [**Pattern Handler Guide**](./development/pattern-handler-guide.md) - Creating and extending pattern handlers
- [**NL Patterns**](./development/nl-patterns.md) - Natural language pattern documentation
- [**CompromiseJS Integration**](./development/compromise-integration.md) - How CompromiseJS is integrated for NLP
- [**Testing Guide**](./development/testing-guide.md) - Guide for testing pattern handlers and other components
- [**Contributing Guide**](./development/contributing-guide.md) - How to contribute to the project

## Additional Resources

- [**Pattern Catalog**](../_planning/research/supported-patterns.md) - Exhaustive catalog of supported patterns with examples
- [**Research Notes**](../_planning/research) - Background research that influenced pattern design decisions
- [**Implementation Notes**](../_planning/implementation) - Notes on feature implementations

## Usage Examples

Here's a quick example of how to use Helios-JS:

```javascript
import { naturalLanguageToRRule } from 'helios-js';
import { RRule } from 'rrule';

// Convert natural language to RRule
const result = naturalLanguageToRRule('every Monday and Wednesday');

// Access the RRule object
const rule = result.rule;

// Get next 5 occurrences from today
const nextDates = rule.all((date, i) => i < 5);

// Output options used to create the rule
console.log(result.options);
// { freq: 2, byweekday: [0, 2] }

// Output a text description of the rule
console.log(rule.toText());
// "weekly on Monday and Wednesday"
```

## Understanding the Pattern Recognition Process

Helios-JS transforms natural language into structured recurrence rules through several steps:

1. **Input**: A natural language string describing a recurrence pattern
2. **Normalization**: Preprocessing text for consistent pattern matching
3. **Pattern Recognition**: Identifying patterns through specialized handlers
4. **Transformation**: Converting recognized patterns to RRule options
5. **Rule Creation**: Creating an RRule object with the options
6. **Result**: Returning the rule along with metadata

For more details, see the [Architecture Overview](./development/architecture-overview.md).

## Getting Help

If you can't find what you need in these docs:

1. Check the [Troubleshooting Guide](./public/troubleshooting.md)
2. Search for similar issues in our GitHub repository
3. Open a new issue with a detailed description of your problem

## Contributing to Documentation

Documentation improvements are welcome! See the [Contributing Guide](./development/contributing-guide.md) for information on how to suggest changes or additions to these documents. 