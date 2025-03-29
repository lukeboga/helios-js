# Implementation Plan: Enhanced Plural Day Name Handling

*Published: March 28, 2023*  
*Last modified: March 28, 2023*

## Overview

This plan outlines the implementation of improved handling for pluralized day names in natural language recurrence patterns. Currently, Helios-JS normalizes plural day names (e.g., "Mondays") to singular forms ("monday") without preserving their semantic meaning as recurring patterns. 

We will implement the "Enhanced Normalization" approach recommended in the research, which transforms pluralized day names into explicitly recurring forms (e.g., "Mondays" → "every monday") during normalization. This ensures that the semantic meaning of pluralization as recurrence is preserved throughout the pattern matching pipeline.

## Related Documents

- Research: [Plural Day Names in Recurrence Patterns](_planning/research/nlp-analysis/plural-day-names.md)
- Issues: N/A

## Implementation Strategy

### Approach Summary

We will use the Enhanced Normalization approach because it:
- Preserves the semantic intent of plural day names
- Works with existing pattern handlers without major changes
- Provides explicit and consistent representation of recurrence
- Can be implemented relatively easily within the current architecture

### Components to Modify

1. **Normalizer (`src/normalizer.ts`)**
   - Current behavior: Converts "Mondays" → "monday" (losing semantic meaning)
   - Changes needed: Convert "Mondays" → "every monday" (preserving semantic meaning)
   - Considerations: Ensure no redundancy with existing "every" terms

2. **Day Pattern Handler (`src/patterns/dayOfWeek.ts`)**
   - Current behavior: Processes normalized day names without knowledge of original pluralization
   - Changes needed: No changes needed as normalization will now make recurrence explicit
   - Considerations: Verify pattern still works with the modified normalization

3. **Tests (`test/*.ts`)**
   - Current behavior: Limited testing of plural day forms
   - Changes needed: Add comprehensive test cases for pluralized day names
   - Considerations: Ensure all edge cases are covered

### New Components

No new components are required for this implementation.

## Detailed Implementation Steps

### Phase 1: Enhance Normalization Logic

1. [ ] Modify `normalizeDayNames` function in `src/normalizer.ts`
   ```typescript
   /**
    * Normalizes day names, preserving semantic meaning of pluralized forms.
    * Converts plural days (e.g., "mondays") to explicitly recurring form ("every monday")
    * while avoiding redundancy with existing "every" terms.
    */
   export function normalizeDayNames(input: string): string {
     // First normalize any irregular forms
     let result = normalizeDayIrregulars(input);
     
     // Track if "every" precedes a day name to avoid redundancy
     const everyPattern = /\b(every|each)\s+/gi;
     
     // Find and process pluralized day names
     return result.replace(
       /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)s\b/gi,
       (match, dayName, offset) => {
         // Check if "every" or "each" already precedes this day name
         const precedingText = result.substring(Math.max(0, offset - 10), offset);
         if (everyPattern.test(precedingText)) {
           // If "every" already exists, just return the singular form
           return dayName.toLowerCase();
         } else {
           // Otherwise, add "every" to preserve the semantic meaning
           return `every ${dayName.toLowerCase()}`;
         }
       }
     );
   }
   ```

2. [ ] Update ordering in the `normalizeInput` function to ensure proper processing
   ```typescript
   export function normalizeInput(input: string, options?: Partial<NormalizerOptions>): string {
     // Merge provided options with defaults
     const opts = { ...defaultOptions, ...options };
     
     let normalized = input;
     
     // Apply misspelling correction if enabled
     if (opts.correctMisspellings) {
       normalized = correctMisspellings(normalized);
     }
     
     // Handle day name normalization (keeps semantic meaning of plurals)
     if (opts.normalizeDayNames) {
       normalized = normalizeDayNames(normalized);
     }
     
     // Other normalization steps...
     // ...
     
     return normalized;
   }
   ```

### Phase 2: Testing and Validation

1. [ ] Add unit tests for the enhanced `normalizeDayNames` function
   ```typescript
   describe('normalizeDayNames', () => {
     it('should convert plural days to explicitly recurring form', () => {
       expect(normalizeDayNames('mondays')).toBe('every monday');
       expect(normalizeDayNames('saturdays and sundays')).toBe('every saturday and every sunday');
     });
     
     it('should avoid redundancy with existing "every" terms', () => {
       expect(normalizeDayNames('every mondays')).toBe('every monday');
       expect(normalizeDayNames('each tuesdays')).toBe('each tuesday');
     });
     
     it('should handle mixed singular and plural forms', () => {
       expect(normalizeDayNames('mondays and this friday')).toBe('every monday and this friday');
     });
   });
   ```

2. [ ] Add integration tests for the full normalization pipeline
   ```typescript
   describe('normalizeInput with pluralized days', () => {
     it('should preserve semantics of pluralized day names', () => {
       expect(normalizeInput('meeting on mondays')).toBe('meeting on every monday');
       expect(normalizeInput('tuesdays at 3pm')).toBe('every tuesday at 3pm');
     });
     
     it('should work with complex patterns', () => {
       expect(normalizeInput('mondays, wednesdays, and fridays until december'))
         .toBe('every monday, every wednesday, and every friday until december');
     });
   });
   ```

3. [ ] Add end-to-end tests with RRule generation
   ```typescript
   describe('createRRule with pluralized days', () => {
     it('should generate correct RRules for pluralized day inputs', () => {
       const startDate = new Date(2023, 0, 1);
       
       // Test with pluralized single day
       const rule1 = createRRule(startDate, 'mondays');
       expect(rule1.options.freq).toBe(RRule.WEEKLY);
       expect(rule1.options.byweekday).toContain(RRule.MO);
       
       // Test with pluralized multiple days
       const rule2 = createRRule(startDate, 'tuesdays and thursdays');
       expect(rule2.options.freq).toBe(RRule.WEEKLY);
       expect(rule2.options.byweekday).toContain(RRule.TU);
       expect(rule2.options.byweekday).toContain(RRule.TH);
     });
   });
   ```

## Testing Strategy

### Unit Tests

- [ ] Test normalizeDayNames function with various plural day inputs
- [ ] Test handling of already-prefixed cases ("every mondays")
- [ ] Test mixed forms (plural + singular) in the same input
- [ ] Test edge cases with unusual spacing or capitalization

### Integration Tests

- [ ] Test the full normalization pipeline with pluralized inputs
- [ ] Test interaction with other normalization features
- [ ] Test pattern recognition with normalized plural inputs

### Manual Testing Scenarios

1. Simple pluralized day
   - Steps: Enter "Mondays" as input
   - Expected outcome: RRule for weekly on Monday

2. Multiple pluralized days
   - Steps: Enter "Saturdays and Sundays" as input
   - Expected outcome: RRule for weekly on Saturday and Sunday

3. Mixed with explicit recurrence
   - Steps: Enter "every Tuesday and Thursdays" as input
   - Expected outcome: RRule for weekly on Tuesday and Thursday (no double "every")

## Rollout Plan

1. **Development**: 1-2 days
2. **Code Review**: Ensure the changes don't affect existing functionality
3. **Testing**: Complete unit, integration, and manual tests
4. **Deployment**: Include in the next release

## Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Changes might affect existing pattern matching | High | Low | Comprehensive test coverage including regression tests |
| Added "every" might create redundancy | Medium | Medium | Add context-aware logic to check for preceding "every" terms |
| Performance impact from more complex normalization | Low | Low | Benchmark before/after to ensure minimal impact |

## Future Considerations

- Support for other pluralized time units (e.g., "months", "years")
- More nuanced handling of qualified plurals ("next three Mondays")
- Internationalization support for pluralized day handling in other languages

---

*Implementation plan created by: Helios-JS Team* 