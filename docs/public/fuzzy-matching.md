# Fuzzy Matching for Natural Language Processing

## What is Fuzzy Matching?

Fuzzy matching allows Helios-JS to understand what you mean, even when your spelling isn't perfect. It intelligently corrects common misspellings and variations in natural language inputs.

## Benefits for Users

- **Type naturally**: Don't worry about perfect spelling of day and month names
- **Save time**: No need to double-check your spelling
- **Reduce frustration**: Get accurate results even with typos
- **Natural interaction**: Express recurrence patterns the way you think about them

## Examples of What It Can Handle

| What You Type | What We Understand |
|---------------|-------------------|
| "every mondey" | "every monday" |
| "every tuseday" | "every tuesday" |
| "every wednessday" | "every wednesday" |
| "on thurday" | "on thursday" |
| "monthly on the 1st" | "monthly on the 1st" (no change needed) |

## How It Works

Helios-JS uses an intelligent two-step approach to handle misspellings:

1. **Common misspellings**: We maintain a list of commonly misspelled terms and their correct forms
2. **Smart similarity detection**: For variations not in our list, we use fuzzy matching to identify the closest valid term

This happens automatically and seamlessly as part of the natural language processing pipeline.

## Additional Features

- **Case preservation**: Your capitalization choices are respected
- **Ordinal handling**: Terms like "1st", "2nd", "3rd" are properly recognized
- **Smart thresholds**: Different types of words are handled with appropriate sensitivity

## When to Use

Fuzzy matching is active by default for all natural language inputs. You don't need to do anything special to enable it - just type naturally, and Helios-JS will do its best to understand your intent.

## Limitations

- While the system handles many common misspellings, it may not catch extremely garbled text
- The focus is currently on day and month names, though other terms may be supported in the future
- Only English language is currently supported

---

*For developers interested in the technical implementation details, please refer to the [developer documentation](../development/fuzzy-matcher.md).* 