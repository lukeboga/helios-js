# Plural Day Names in Recurrence Patterns

## Executive Summary

This document explores the semantic implications of pluralized day names (e.g., "Mondays," "Tuesdays") in natural language recurrence patterns. Current normalization in Helios-JS converts plurals to singular forms without preserving their recurring semantics. We analyze this issue and propose solutions to ensure that the natural language interpretation aligns with user intent.

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Current Implementation Analysis](#current-implementation-analysis)
3. [Semantic Implications](#semantic-implications)
4. [Cross-Linguistic Considerations](#cross-linguistic-considerations)
5. [Real-world Examples](#real-world-examples)
6. [Alternative Approaches](#alternative-approaches)
7. [Implementation Considerations](#implementation-considerations)
8. [Recommendations](#recommendations)
9. [References](#references)

## Problem Statement

In natural language, pluralized day names typically indicate a recurring pattern rather than multiple individual instances. The current normalization process in Helios-JS strips away this semantic distinction, potentially leading to misinterpretation of user input.

**Key Issues:**

1. Semantic information loss when converting plurals to singular forms
2. Inconsistent interpretation of recurrence when mixed with explicit recurrence terms
3. Loss of user intent in the transformation pipeline

## Current Implementation Analysis

### Normalization Logic

The current implementation in `normalizeDayNames()` contains:

```typescript
// Convert plural days to singular (mondays -> monday)
.replace(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)s\b/gi,
  (match) => match.slice(0, -1))
```

This regex pattern captures any day name followed by 's' and removes the 's', resulting in:
- "Mondays" → "monday"
- "Saturdays and Sundays" → "saturday and sunday"

### Processing Pipeline Impact

1. User inputs "Meeting on Mondays at 3pm"
2. Normalizer converts to "meeting on monday at 3pm"
3. Pattern matchers see only "monday" without context that it was pluralized
4. RRule might be generated with `BYDAY: MO` but without the recurring intent explicitly captured

### Test Cases

Testing with current implementation:

| Input                        | Current Normalization    | Desired Interpretation                |
|------------------------------|--------------------------|--------------------------------------|
| "Saturdays"                  | "saturday"               | "every saturday"                     |
| "Mondays and Wednesdays"     | "monday and wednesday"   | "every monday and every wednesday"   |
| "Saturdays until June"       | "saturday until june"    | "every saturday until june"          |

## Semantic Implications

### Linguistic Analysis

In natural language, pluralization of time periods often implies regularity or recurrence:

- **Singular form**: Often refers to a specific instance or a general concept
  - "I have a meeting on Monday" (specific, one-time)
  - "Monday is the start of the work week" (general concept)

- **Plural form**: Almost always indicates recurring instances
  - "I have meetings on Mondays" (recurring, every Monday)
  - "Mondays are always busy" (recurring pattern)

### Context-Dependent Semantics

The interpretation may depend on surrounding context:

1. **With explicit frequency indicators**:
   - "Every Monday" - Explicitly recurring
   - "Mondays" - Implicitly recurring (same meaning)
   - "All Mondays in June" - Bounded recurring

2. **With qualifiers**:
   - "Next three Mondays" - Multiple instances but not indefinitely recurring
   - "Some Mondays" - Occasional instances, not regular

3. **With other time expressions**:
   - "Mondays at 3pm" - Recurring with time specification
   - "Mondays from January to March" - Bounded recurring pattern

## Cross-Linguistic Considerations

While the current focus is on English, it's worth noting that recurrence expressions vary across languages:

- **English**: Uses pluralization ("Mondays")
- **Spanish**: Often uses "los" with plural ("los lunes" for "Mondays")
- **German**: Uses plural forms ("Montage" for "Mondays")
- **French**: Uses plural with "les" ("les lundis" for "Mondays")

A truly multilingual solution would need to account for these variations.

## Real-world Examples

### Common Natural Language Patterns

1. **Simple statements**:
   - "Team meeting on Wednesdays" = "Team meeting every Wednesday"
   - "I work from home on Fridays" = "I work from home every Friday"

2. **Mixed patterns**:
   - "Gym on Mondays, Wednesdays, and Fridays"
   - "Office hours on Tuesdays and this Thursday"

3. **With time qualifiers**:
   - "Yoga class on Mondays at 6pm"
   - "Staff meetings on alternate Fridays"

4. **With date bounds**:
   - "Tuesdays until December 31st"
   - "Mondays starting next week"

### User Survey Insights

Based on natural language studies and user behavior:

- Users naturally express recurring events using plural day names without explicitly saying "every"
- When users say "Mondays," they almost always mean "every Monday" in a recurrence context
- The exception is when there's an explicit qualifier limiting the scope

## Alternative Approaches

### 1. Enhanced Normalization

Transform plural day names to explicitly include "every":

```
"saturdays" → "every saturday"
"mondays and tuesdays" → "every monday and every tuesday"
```

**Algorithm Sketch:**
1. Identify pluralized day names using regex
2. Replace each with "every [singular form]"
3. Process as normal through the pipeline

**Pros:**
- Preserves semantic meaning explicitly
- Makes the recurring intent clear to pattern matchers
- Relatively simple to implement

**Cons:**
- Changes the text more substantially
- Might create redundancy if "every" appears elsewhere
- Could interfere with other pattern matching logic

### 2. Metadata-Enhanced Processing

Keep the normalization simple but preserve the information about pluralization:

```typescript
// Example structure, not actual implementation
{
  normalizedText: "meeting on monday",
  metadata: {
    pluralDays: [
      { original: "mondays", normalized: "monday", position: { start: 11, end: 17 } }
    ]
  }
}
```

**Algorithm Sketch:**
1. During normalization, track which terms were originally pluralized
2. Attach this metadata to the normalized result
3. Pattern matchers use this metadata when interpreting day names

**Pros:**
- Minimally invasive to existing text
- Preserves original information
- More flexible for pattern handlers

**Cons:**
- Requires changes throughout the processing pipeline
- More complex implementation
- Potential for inconsistencies if metadata isn't properly utilized

### 3. Semantic Pre-processing

Introduce a pre-processing step that expands pluralized day patterns semantically:

```
"saturdays and every weds" → "every saturday and every wednesday"
```

**Algorithm Sketch:**
1. Before standard normalization, identify patterns with pluralized day names
2. Transform these patterns to their semantic equivalent with explicit recurrence
3. Apply standard normalization afterward

**Pros:**
- Handles complex cases with mixed forms
- Consistent interpretation throughout the pipeline
- Cleaner than metadata approach

**Cons:**
- Additional processing step
- Could over-interpret in some edge cases
- Might interact in unexpected ways with other normalization steps

### 4. Pattern-Level Recognition

Keep normalization as-is but update pattern handlers to recognize the original pluralized form:

**Algorithm Sketch:**
1. Modify pattern handlers to check the original input for pluralization
2. If a day name was plural in the original, interpret it as recurring
3. Set appropriate RRule properties based on this information

**Pros:**
- Minimal changes to normalization
- Puts the interpretation logic where it belongs (in pattern handlers)
- Can be more nuanced in handling edge cases

**Cons:**
- Requires changes to multiple pattern handlers
- More complex implementation
- Potential for inconsistent handling across patterns

## Implementation Considerations

### Impact on Existing Code

1. **Normalizer changes**: Modifying normalization logic may affect other patterns
2. **Pattern handler changes**: Multiple handlers may need updates
3. **Test coverage**: Need comprehensive tests for various plural patterns

### Performance Implications

1. **Additional processing**: Any solution will add some overhead
2. **Memory usage**: Metadata approach would increase memory footprint
3. **Complexity**: More complex solutions may impact maintainability

### Integration Points

Key integration points to consider:

1. **Normalizer**: Where pluralization is currently handled
2. **Splitter**: May need to account for pluralized forms when splitting patterns
3. **Day pattern handlers**: Need to interpret day names correctly
4. **Combiner**: Must handle mixed plural and singular forms correctly

## Recommendations

Based on the analysis, we recommend the **Enhanced Normalization** approach as it offers the best balance of semantic preservation, implementation simplicity, and integration ease:

1. Modify the normalizer to transform pluralized day names into their explicitly recurring form:
   ```
   "saturdays" → "every saturday"
   ```

2. Update the normalization logic to be context-aware, avoiding redundancy:
   ```
   "every mondays" → "every monday" (not "every every monday")
   ```

3. Ensure consistent handling of mixed forms:
   ```
   "mondays and this friday" → "every monday and this friday"
   ```

4. Add comprehensive tests to verify correct handling of various plural patterns

This approach:
- Preserves the semantic intent of plural day names
- Works with existing pattern handlers without major changes
- Provides explicit and consistent representation of recurrence
- Can be implemented relatively easily within the current architecture

## Next Steps

1. Develop a more detailed implementation plan
2. Update test cases to cover plural day name scenarios
3. Consider implications for other languages if internationalization is planned
4. Document the new behavior for users

## References

1. Carlson, Greg N. "Habitual, Generic, and Bare Plural Predication." The Handbook of Contemporary Semantic Theory, 2nd Edition, 2015.
2. Bybee, Joan. "Frequency of Use and the Organization of Language." Oxford University Press, 2007.
3. iCalendar (RFC 5545) specification - Recurrence patterns
4. NLTK (Natural Language Toolkit) documentation on handling temporal expressions 