# Implementation Strategy for Date-Related Combined Patterns

Thank you for clarifying the scope - I agree that focusing on proper date-related patterns while excluding cultural or non-date concepts is the right approach. Let me address your question about implementing combined date-related patterns.

## Analysis of Combined Date Patterns Implementation

The question of whether to implement combined patterns like "every Monday and Friday, and every other weekend" from the start versus adding them later deserves careful consideration.

### Arguments for Implementing Combined Patterns from the Start:

1. **Architectural Foundation**: Building the architecture to support combined patterns from the beginning creates a more robust foundation that won't require significant refactoring later.

2. **Pattern Handler Integration**: The way pattern handlers interact is easier to design before there are many of them - retrofitting combination logic later can be complex.

3. **Consistent User Experience**: Users expect reasonable combinations to work. Supporting basic combinations from the start creates a more intuitive experience.

4. **Testing Efficiency**: Creating tests for complex combined patterns helps identify edge cases in the basic pattern handlers early.

### Arguments for Implementing Combined Patterns Later:

1. **Complexity Management**: Implementing simpler patterns first reduces initial complexity and ensures the core system works correctly.

2. **Clearer Requirements**: After implementing basic patterns, you'll have a better understanding of how combinations should work.

3. **User Feedback**: You can gather user feedback on the most important combinations rather than guessing.

4. **Incremental Validation**: You can validate the architecture with simple patterns before introducing complex combinations.

## Recommended Approach: Hybrid Implementation

After analyzing the codebase and requirements, I recommend a **hybrid approach** that prepares for combinations from the start but implements them incrementally:

### Phase 1: Architecture for Combinations

Design the architecture to explicitly support combinations from the beginning:

1. **Create a Pattern Combination Framework**:
   ```typescript
   interface PatternCombiner {
     // Determine if two patterns can be combined
     canCombine(pattern1: PatternResult, pattern2: PatternResult): boolean;
     
     // Combine two compatible patterns
     combine(pattern1: PatternResult, pattern2: PatternResult): PatternResult;
     
     // Priority of this combiner
     priority: number;
   }
   ```

2. **Implement a Pattern Result Data Structure**:
   ```typescript
   interface PatternResult {
     type: string;
     options: Partial<RecurrenceOptions>;
     metadata: {
       matchedText: string;
       confidence: number;
       isPartial?: boolean;
     };
   }
   ```

3. **Update the Transformer Pipeline**:
   ```typescript
   function transformRecurrencePattern(input: string): TransformationResult {
     // 1. Apply individual pattern handlers
     const individualResults = applyPatternHandlers(input);
     
     // 2. Apply pattern combiners to merge compatible results
     const combinedResults = applyPatternCombiners(individualResults);
     
     // 3. Select the best result or handle multiple possibilities
     return selectFinalResult(combinedResults);
   }
   ```

### Phase 2: Implement Basic Patterns with Combination-Ready Design

Implement the basic patterns (frequency, interval, day of week, etc.) but design them to be combinable:

1. **Make Pattern Handlers Return Structured Results**:
   ```typescript
   interface PatternHandler {
     apply(input: string): PatternResult | null;
     priority: number;
     name: string;
   }
   ```

2. **Ensure Pattern Handlers Are Independent**:
   Make sure each handler extracts its pattern independently without conflicting with others.

3. **Implement Simple Conjunction Support**:
   Support simple conjunctions like "every Monday and Wednesday" within individual handlers.

### Phase 3: Introduce Core Combination Types

Implement the most common and straightforward pattern combinations:

1. **Day-with-Day Combinations**:
   "Every Monday and Friday"

2. **Day-with-Frequency Combinations**:
   "Weekly on Monday" 

3. **Single-Type Multi-Instance Combinations**:
   "The first and last of the month"

### Phase 4: Advanced Combinations (Based on Usage Data)

After validating the core system, extend to more complex combinations:

1. **Multi-Category Combinations**:
   "Every Monday and the first of each month" 

2. **Interval with Pattern Combinations**:
   "Every other weekend and every Wednesday"

## Practical Implementation Recommendations

Based on the current codebase, here's how I recommend implementing this approach:

### 1. Enhance the RecurrenceOptions Interface

Update `src/types.ts` to support tracking which parts of the options have been set:

```typescript
export interface RecurrenceOptions {
  // Existing properties (freq, interval, byweekday, etc.)
  
  // Track which properties have been explicitly set
  setProperties?: Set<string>;
  
  // Optional source information for debugging
  sourcePatterns?: string[];
}
```

### 2. Update Pattern Handlers to Support Partial Matches

Modify pattern handlers to detect and mark partial matches:

```typescript
// In src/patterns/dayOfWeek.ts

export function applyDayOfWeekRules(input: string, options: RecurrenceOptions): boolean {
  // Check for day of week patterns
  
  // If pattern matched:
  if (matched) {
    options.byweekday = matchedDays;
    options.setProperties = options.setProperties || new Set();
    options.setProperties.add('byweekday');
    options.sourcePatterns = options.sourcePatterns || [];
    options.sourcePatterns.push('dayOfWeek');
    return true;  // Return true to indicate a match occurred
  }
  
  return false;  // No match
}
```

### 3. Create a Pattern Result Combiner

Add a new module for combining pattern results:

```typescript
// src/combiner.ts

export function combinePatternResults(
  results: RecurrenceOptions[]
): RecurrenceOptions | null {
  if (results.length === 0) {
    return null;
  }
  
  if (results.length === 1) {
    return results[0];
  }
  
  // Start with a blank slate
  const combined: RecurrenceOptions = {
    freq: null,
    interval: 1,
    byweekday: null,
    bymonthday: null,
    bymonth: null,
    setProperties: new Set(),
    sourcePatterns: []
  };
  
  // Track conflicts
  const conflicts: Record<string, boolean> = {};
  
  // Combine all results
  for (const result of results) {
    // Copy all set properties
    result.setProperties?.forEach(prop => {
      const key = prop as keyof RecurrenceOptions;
      
      // Check for conflicts
      if (combined.setProperties?.has(prop) && 
          JSON.stringify(combined[key]) !== JSON.stringify(result[key])) {
        conflicts[prop] = true;
      }
      
      // Copy the property
      combined[key] = result[key];
      combined.setProperties?.add(prop);
    });
    
    // Merge source patterns
    if (result.sourcePatterns) {
      combined.sourcePatterns = [
        ...(combined.sourcePatterns || []),
        ...result.sourcePatterns
      ];
    }
  }
  
  // Handle conflicts if necessary
  if (Object.keys(conflicts).length > 0) {
    // Implement conflict resolution strategies
    // For now, first pattern wins
  }
  
  return combined;
}
```

### 4. Update Transformer to Use Combiners

Modify `src/transformer.ts` to support pattern combination:

```typescript
export function transformRecurrencePattern(
  input: string,
  config: Partial<TransformerConfig> = {}
): TransformationResult {
  // Normalize input
  const normalizedInput = normalizeInput(input);
  
  // Initialize options
  const options: RecurrenceOptions = initializeOptions();
  
  // Track all partial matches
  const partialMatches: RecurrenceOptions[] = [];
  
  // Apply all handlers and collect partial results
  for (const handler of finalConfig.handlers) {
    // Create a fresh options object for this handler
    const handlerOptions = initializeOptions();
    
    // Apply the handler
    const matched = handler.apply(normalizedInput, handlerOptions);
    
    // If a match occurred, add to partial matches
    if (matched) {
      partialMatches.push(handlerOptions);
    }
  }
  
  // Combine partial matches
  const combinedOptions = combinePatternResults(partialMatches) || options;
  
  // Apply defaults
  if (finalConfig.applyDefaults) {
    applyDefaults(combinedOptions);
  }
  
  // Clean up and return
  return cleanOptions(combinedOptions);
}
```

### 5. Create a Pattern Splitter for Conjunctions

Add a pre-processing step to identify conjunction patterns:

```typescript
// src/patterns/splitter.ts

export function splitConjunctions(input: string): string[] {
  // Simple initial implementation - split on "and", "," etc.
  // This would be enhanced later for more complex conjunctions
  
  // Check for standalone conjunctions (not part of specific terms)
  const parts: string[] = [];
  
  // Example implementation:
  const conjunctionRegex = /\s+and\s+|\s*,\s*/g;
  
  // Split by conjunctions but preserve special phrases
  const protectedTerms = ['first and last'];
  
  // Protect special terms by replacing with placeholders
  let protectedInput = input;
  const replacements: Record<string, string> = {};
  
  protectedTerms.forEach((term, index) => {
    const placeholder = `__PROTECTED_${index}__`;
    if (input.includes(term)) {
      protectedInput = protectedInput.replace(term, placeholder);
      replacements[placeholder] = term;
    }
  });
  
  // Split the protected input
  const roughParts = protectedInput.split(conjunctionRegex);
  
  // Restore protected terms
  parts.push(...roughParts.map(part => {
    Object.entries(replacements).forEach(([placeholder, original]) => {
      part = part.replace(placeholder, original);
    });
    return part.trim();
  }));
  
  return parts.filter(p => p.length > 0);
}
```

### 6. Update Transformer to Handle Conjunctions

Modify the transformer to process split parts:

```typescript
export function transformRecurrencePattern(
  input: string,
  config: Partial<TransformerConfig> = {}
): TransformationResult {
  // First check if input contains conjunctions
  const parts = splitConjunctions(input);
  
  if (parts.length > 1) {
    // Process each part separately
    const partResults = parts.map(part => 
      transformRecurrencePattern(part, { ...config, applyDefaults: false }));
    
    // Combine the results
    return combineResults(partResults);
  }
  
  // Process as single pattern (existing implementation)
  // ...
}
```

## Conclusion: Start with Architecture for Combinations

After analyzing the requirements and current codebase, I recommend **implementing the architecture for combinations from the start, but rolling out combination support incrementally**.

Specifically:
1. Design the pattern handler system to track which properties each handler sets
2. Implement a combiner framework that can merge compatible pattern results
3. Start with the simplest combinations (like "every Monday and Wednesday")
4. Add more complex combinations in phases after validating the approach

This hybrid approach:
- Provides a solid foundation for all future combinations
- Avoids major architectural refactoring later
- Delivers immediate value with basic combinations
- Allows incremental learning and improvement

The date-related combined patterns you mentioned ("every monday and Fri, and every other weekend", "the first and last of the month", "every wednesday and the first of each month") are all reasonable to support with this architecture. While they're more complex than single patterns, building the architecture to support them from the start will make implementing them much easier, whether you do so immediately or in later phases.

This approach balances immediate functionality with long-term architectural robustness, aligning with your goal of providing a high-quality, focused library that can scale to handle more complex patterns in the future.
