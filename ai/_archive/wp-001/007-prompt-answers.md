I'll methodically analyze each of your questions:

### 1. Why do we need backward compatibility?

Backward compatibility is essential for several important reasons:

- **Existing Implementations**: Users of HeliosJS likely have production code that relies on the current API signatures. Breaking changes would force them to rewrite working code.

- **Migration Path**: Providing backward compatibility gives users a gradual migration path. They can continue using the library while incrementally adopting the new features at their own pace.

- **Version Stability**: Many users may not be able to immediately update dependent code when a new library version is released. Backward compatibility allows them to upgrade the library without breaking existing functionality.

- **Trust**: Libraries that frequently break backward compatibility risk losing user trust. Maintaining backward compatibility demonstrates commitment to stability.

In our implementation, we've maintained backward compatibility by:
1. Preserving the original parameter signatures for public API functions
2. Adding the deprecated `createRRuleWithEndDate` function to support the previous pattern of providing end dates as a separate parameter
3. Ensuring the new parameter types are optional, so existing code continues to work

### 2. Code duplication (ORDINAL_WORD_MAP)

You're right to identify this duplication. Having the `ORDINAL_WORD_MAP` in both `patterns/utils.ts` and `patterns/dayOfMonth.ts` creates several problems:

- **Maintenance burden**: Changes must be made in multiple places
- **Inconsistency risk**: Maps could diverge over time
- **Increased bundle size**: Duplicate code increases the library size

The best solution would be to:
1. Keep a single canonical definition in `patterns/utils.ts`
2. Import and use this shared definition in `patterns/dayOfMonth.ts`
3. Consider moving all such shared constants to a dedicated constants file or directory

This would centralize the mapping logic and ensure consistency across the application.

### 3. Improving splitter.ts documentation

The `splitter.ts` file would benefit from the same level of detailed documentation as `combiner.ts`. Key improvements should include:

- **Module-level documentation**: Explaining the purpose, strategies, and core concepts
- **Section headers**: Adding clear comment blocks that separate the main functional areas
- **Step-by-step explanations**: Adding detailed comments explaining complex algorithms
- **Example-based comments**: Including examples of how different parts transform input
- **Diagram-like comments**: Using ASCII diagrams or formatted comments to visualize transformations
- **"Why" comments**: Explaining reasoning behind implementation decisions

The goal should be to make the code self-explanatory even to developers unfamiliar with the codebase, focusing especially on the pattern splitting algorithm and protected phrase handling.

### 4. Alternatives to custom fuzzy matching

Using a lightweight library instead of our custom implementation would indeed be beneficial:

**Potential libraries**:
- **fuzzysort**: Small (2.5KB) and fast, focused on string fuzzy-search
- **fuse.js**: Powerful fuzzy-search with customizable scoring
- **string-similarity**: Simple library for string similarity calculations
- **fastest-levenshtein**: Very fast Levenshtein distance implementation

**Benefits of using a library**:
- Reduced maintenance burden
- Potentially better performance optimizations
- Community-tested implementation
- More robust handling of edge cases
- Less code to maintain and debug

**Implementation approach**: 
We could import one of these libraries, add a thin wrapper around it for our specific needs, and maintain our current API. This would give us better fuzzy matching with less code.

### 5. Normalizing plurals

The current implementation in `normalizeDayNames()` may be problematic:

```typescript
// Convert plural days to singular (mondays -> monday)
.replace(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)s\b/gi,
  (match) => match.slice(0, -1))
```

This simply removes the 's' without considering the semantic difference between:
- "Saturdays" (meaning "every Saturday")
- "Saturday" (potentially just a single occurrence)

You're right that this requires a more sophisticated approach:

1. **Semantic preservation**: Pluralized day names should be interpreted as recurrence patterns
2. **Context-sensitive handling**: Apply different normalization based on context
3. **Pattern interpretation**: "saturdays and every weds" should become "every saturday and every wednesday"

The proper implementation would:
- Detect pluralized day names specifically
- Convert them to "every [singular day]" instead of just removing the 's'
- Ensure contextual consistency when multiple day specifications exist

This would require modifying not just the normalization function but also how patterns are semantically interpreted in the transformer pipeline.

I agree this is an important distinction that affects the correctness of the library's interpretation of user input.
