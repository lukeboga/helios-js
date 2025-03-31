# Architecture Overview

This document provides a comprehensive technical overview of Helios-JS's architecture, explaining the system's components, data flow, and design principles.

## System Architecture

Helios-JS follows a modular, pipeline-based architecture designed for extensibility, readability, and maintainability. The system consists of several core components that work together to transform natural language inputs into structured RRule outputs.

<!-- Note: Architecture diagram needs to be created. For now, imagine a pipeline flow from input text through normalization, pattern recognition, to RRule output. -->

### High-Level Data Flow

1. **Input**: Natural language pattern (e.g., "every Monday and Friday")
2. **Normalization**: Text is standardized for consistent processing
3. **Pattern Splitting**: Complex patterns are broken into sub-patterns
4. **Pattern Recognition**: Individual pattern handlers identify pattern components
5. **Pattern Combination**: Compatible pattern results are merged
6. **Default Application**: Missing properties get sensible defaults
7. **Output**: Structured RRule options ready for use

## Core Components

### 1. Entry Point (`index.ts`)

The public API provides three main functions:
- `naturalLanguageToRRule`: Converts text to RRule options
- `createRRule`: Creates an RRule instance from text
- `validatePattern`: Validates if a pattern can be parsed correctly

These functions serve as the interface between users and the internal transformation pipeline.

### 2. Normalizer (`normalizer.ts`)

The normalizer preprocesses input text to standardize it for pattern matching:

- Converts text to lowercase
- Standardizes whitespace
- Corrects common misspellings
- Expands abbreviations
- Applies synonym replacements
- Removes ordinal suffixes when appropriate
- Normalizes punctuation

This preprocessing makes pattern recognition more robust by handling common text variations.

### 3. Pattern Splitter (`patterns/splitter.ts`)

For complex patterns, the splitter breaks input into manageable sub-patterns:

- Identifies conjunction terms (and, comma, etc.)
- Protects special phrases from being split incorrectly
- Produces a list of individual pattern components

Example: "every Monday and Friday until December" → ["every Monday", "every Friday", "until December"]

### 4. Transformer (`transformer.ts`)

The transformer orchestrates the transformation process:

- Applies pattern handlers in priority order
- Coordinates pattern combination
- Applies default values for missing properties
- Creates clean output options

This component serves as the central coordinator for the transformation pipeline.

### 5. Pattern Handlers (`patterns/` directory)

Each pattern handler specializes in recognizing a specific pattern type:

| Handler | Purpose | Examples | Priority |
|---------|---------|----------|----------|
| `intervalPatternHandler` | Recognizes interval patterns | "every 2 weeks", "every other day" | Highest |
| `frequencyPatternHandler` | Recognizes basic frequency | "daily", "weekly", "monthly" | High |
| `dayOfWeekPatternHandler` | Recognizes day patterns | "every Monday", "on weekdays" | Medium |
| `dayOfMonthPatternHandler` | Recognizes month day patterns | "1st of the month", "on the 15th" | Medium |
| `untilDatePatternHandler` | Recognizes end dates | "until December", "ending next week" | Low |

Handlers are applied in priority order, with higher priority handlers processing first.

### 6. Pattern Combiners (`patterns/combiner.ts`)

Combiners merge the results from multiple pattern handlers:

- Identify compatible pattern results
- Resolve conflicts between overlapping patterns
- Merge pattern options intelligently
- Combine metadata for user feedback

### 7. Utilities (`utils/` directory)

Shared utilities provide common functionality:

- Day name mapping
- Frequency mapping
- Text manipulation helpers
- Date handling utilities

## Data Structures

### Pattern Result

The `PatternResult` interface represents the output of pattern recognition:

```typescript
interface PatternResult {
  options: RecurrenceOptions;  // RRule options extracted from the pattern
  metadata: PatternMatchMetadata;  // Metadata about the match
}
```

### Pattern Match Metadata

The `PatternMatchMetadata` interface provides context about a pattern match:

```typescript
interface PatternMatchMetadata {
  patternName: string;  // Handler name that produced the result
  category: string;     // Pattern category (frequency, interval, etc.)
  matchedText: string;  // The specific text that was matched
  confidence: number;   // Confidence level (0.0 to 1.0)
  isPartial: boolean;   // Whether this is a partial match
  setProperties: Set<keyof RecurrenceOptions>;  // Properties set by this pattern
  warnings?: string[];  // Optional warnings about this match
}
```

### Transformation Result

The `TransformationResult` interface extends RRule's options with metadata:

```typescript
interface TransformationResult extends RRuleOptions {
  matchedPatterns?: string[];  // List of pattern types that were matched
  warnings?: string[];         // Any warnings generated during transformation
  confidence?: number;         // Confidence score (0.0 to 1.0)
}
```

## Design Principles

### 1. Modularity

The system is designed with distinct, single-responsibility modules that are easy to understand, test, and extend.

### 2. Pipeline Architecture

Data flows through a series of transformation stages, with each stage performing a specific task and passing the result to the next stage.

### 3. Priority-Based Processing

Pattern handlers are applied in priority order, ensuring that more specific patterns take precedence over general ones.

### 4. Extensibility

The system is designed for easy extension with new pattern handlers, which can be added without modifying existing code.

### 5. Robustness

Error handling, confidence scoring, and fallback mechanisms ensure the system gracefully handles unexpected inputs.

## Extension Points

Helios-JS is designed to be easily extended:

1. **Adding New Pattern Handlers**:
   - Create a new file in the `patterns/` directory
   - Implement the `PatternHandler` interface
   - Register the handler in `patterns/index.ts`

2. **Adding New Pattern Combiners**:
   - Implement the `PatternCombiner` interface
   - Add the combiner to the transformer's configuration

3. **Customizing Normalization**:
   - Configure the normalizer with custom options
   - Add new synonym mappings

4. **Adding New Utilities**:
   - Create new utility functions in the appropriate module
   - Export them for use throughout the system

## Conclusion

Helios-JS's architecture is designed to handle the complexities of natural language processing while remaining maintainable and extensible. The pipeline approach allows for a clear flow of data through the system, while the modular design makes it easy to understand and extend individual components.

This overview should provide a solid foundation for understanding how the system works and how to contribute to its development. 