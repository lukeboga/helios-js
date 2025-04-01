# Draft: Updates for `testing-guide.md`

This document outlines the necessary updates to the `docs/development/testing-guide.md` file, focusing on aligning file paths, examples, and testing approaches with the pattern handler modernization plan.

## Change Log to Add

```
> **Change Log**:  
> - [April 2025]: Updated test directory structure to reflect current organization
> - [April 2025]: Added pattern handler test examples using modern factory-based approach
> - [April 2025]: Updated file paths and command examples
> - [April 2025]: Added section on testing matcher and processor functions independently
```

## Test Directory Structure Updates

The current structure described in the guide needs to be updated to reflect the current organization. The main discrepancies are in the `test/unit/compromise` directory structure.

### Current Content (to be updated)

```
test/
├── unit/                  # Unit tests for individual components
│   ├── compromise/        # Tests for CompromiseJS integration
│   │   ├── patterns.test.ts           # Comprehensive pattern handler tests
│   │   ├── compromise.test.ts         # Core processor tests
│   │   ├── untilDate.debug.test.ts    # Debug tests for until date patterns
│   │   └── dayOfMonth.debug.test.ts   # Debug tests for day of month patterns
│   └── patterns/          # Tests for legacy pattern handlers
```

### Updated Content

```
test/
├── unit/                  # Unit tests for individual components
│   ├── compromise/        # Tests for CompromiseJS integration
│   │   ├── patterns/      # Tests for pattern handlers
│   │   │   ├── frequency.test.ts      # Frequency pattern tests
│   │   │   ├── dayOfWeek.test.ts      # Day of week pattern tests
│   │   │   ├── interval.test.ts       # Interval pattern tests
│   │   │   └── untilDate.test.ts      # Until date pattern tests
│   │   ├── matchers/      # Tests for pattern matchers
│   │   ├── processors/    # Tests for pattern processors
│   │   ├── utils/         # Tests for handler utilities
│   │   └── index.test.ts  # Core processor tests
│   ├── normalizer/        # Tests for text normalization
│   │   ├── index.test.ts            # Core normalizer tests
│   │   ├── misspellings.test.ts     # Misspelling correction tests
│   │   └── synonyms.test.ts         # Synonym replacement tests
```

## Pattern Handler Testing Examples

The current examples should be updated to reflect the modern factory-based approach to pattern handlers.

### Current Content (to be updated)

```typescript
// test/unit/compromise/patterns.test.ts
describe('Frequency Pattern Handler', () => {
  describe('Basic Frequencies', () => {
    it('should recognize "daily" pattern', () => {
      const result = processRecurrencePattern('daily');
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.freq).toBe(RRule.DAILY);
        expect(result.interval).toBe(1);
        expect(result.confidence).toBeGreaterThan(0.9);
      }
    });
    
    // More tests...
  });
});
```

### Updated Content

```typescript
// test/unit/compromise/patterns/frequency.test.ts
import { describe, it, expect } from 'vitest';
import { processRecurrencePattern } from '../../../../src/processor';
import { RRule } from 'rrule';
import { frequencyPatternHandler } from '../../../../src/compromise/patterns/frequency';
import { frequencyMatcher } from '../../../../src/compromise/matchers/frequency';
import { Doc } from 'compromise';
import nlp from 'compromise';

describe('Frequency Pattern Handler', () => {
  describe('Handler Integration', () => {
    it('should recognize "daily" pattern', () => {
      const result = processRecurrencePattern('daily');
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.freq).toBe(RRule.DAILY);
        expect(result.interval).toBe(1);
      }
    });
    
    // More integration tests...
  });
  
  describe('Frequency Matcher', () => {
    it('should match daily frequency', () => {
      const doc = nlp('daily');
      const match = frequencyMatcher(doc);
      
      expect(match).not.toBeNull();
      if (match) {
        expect(match.type).toBe('frequency');
        expect(match.value).toBe(RRule.DAILY);
        expect(match.text).toBe('daily');
      }
    });
    
    // More matcher tests...
  });
});
```

## New Section: Testing Pattern Handlers Modularly

Add a new section explaining how to test pattern handlers in the modern architecture:

```markdown
## Testing Modern Pattern Handlers

The modern pattern handler architecture separates concerns into matchers, processors, and handler factories, which changes how we approach testing:

### 1. Testing Pattern Matchers

Pattern matchers should be tested in isolation to verify they correctly identify patterns and extract values:

```typescript
// test/unit/compromise/matchers/weekday.test.ts
describe('Weekday Matcher', () => {
  it('matches simple day of week', () => {
    const doc = nlp('every monday');
    const match = weekdayMatcher(doc);
    
    expect(match).not.toBeNull();
    if (match) {
      expect(match.type).toBe('weekday');
      expect(match.value).toContain(1); // Monday is 1
      expect(match.text).toBe('monday');
    }
  });
  
  it('matches multiple days of week', () => {
    const doc = nlp('every monday and wednesday');
    const match = weekdayMatcher(doc);
    
    expect(match).not.toBeNull();
    if (match) {
      expect(match.type).toBe('weekday');
      expect(match.value).toContain(1); // Monday is 1
      expect(match.value).toContain(3); // Wednesday is 3
      expect(match.text).toBe('monday and wednesday');
    }
  });
});
```

### 2. Testing Pattern Processors

Pattern processors should be tested to verify they correctly update recurrence options based on matches:

```typescript
// test/unit/compromise/processors/weekday.test.ts
describe('Weekday Processor', () => {
  it('updates options with weekday values', () => {
    const match = {
      type: 'weekday',
      value: [1, 3], // Monday and Wednesday
      text: 'monday and wednesday'
    };
    
    const options = {};
    weekdayProcessor(options, match);
    
    expect(options.byweekday).toEqual([RRule.MO, RRule.WE]);
    expect(options.freq).toBe(RRule.WEEKLY);
  });
  
  it('preserves existing frequency if present', () => {
    const match = {
      type: 'weekday',
      value: [1], // Monday
      text: 'monday'
    };
    
    const options = { freq: RRule.MONTHLY };
    weekdayProcessor(options, match);
    
    expect(options.byweekday).toEqual([RRule.MO]);
    expect(options.freq).toBe(RRule.MONTHLY); // Unchanged
  });
});
```

### 3. Testing Complete Pattern Handlers

Finally, test the complete pattern handler to verify its integration:

```typescript
// test/unit/compromise/patterns/weekday.test.ts
describe('Weekday Pattern Handler', () => {
  it('correctly processes weekday patterns', () => {
    // Create a test document
    const doc = nlp('every monday and friday');
    
    // Initial options object
    const options = {};
    
    // Apply the handler
    const result = weekdayPatternHandler.apply(doc, options);
    
    // Verify result
    expect(result.matched).toBe(true);
    expect(options.byweekday).toContainEqual(RRule.MO);
    expect(options.byweekday).toContainEqual(RRule.FR);
    expect(options.freq).toBe(RRule.WEEKLY);
  });
});
```

This modular testing approach:
- Makes it easier to diagnose issues
- Improves test clarity by focusing on specific components
- Facilitates test-driven development
- Provides better test coverage
```

## Misspelling Correction Test Updates

Update the misspelling correction test section to reflect the centralized dictionaries:

### Current Content (to be updated)

```markdown
### Adding New Misspelling Tests

When expanding the misspelling dictionaries:

1. Add new test patterns to `test/debug/misspelling-correction.ts`
2. Add the corresponding misspellings to the appropriate dictionaries in `src/constants.ts`
3. Run the tests to verify corrections work as expected
```

### Updated Content

```markdown
### Adding New Misspelling Tests

When expanding the misspelling dictionaries:

1. Add new test patterns to `test/unit/normalizer/misspellings.test.ts`
2. Add the corresponding misspellings to the centralized registries in `src/constants/patterns.ts`:
   ```typescript
   // For day name misspellings
   SPELLING_CORRECTIONS['mondey'] = 'monday';
   
   // Or use the helper function
   extendSpellingCorrections({
     'mondey': 'monday',
     'tuseday': 'tuesday'
   });
   ```
3. Run the tests to verify corrections work as expected:
   ```bash
   npm run test:unit -- test/unit/normalizer/misspellings.test.ts
   ```
```

## Updated Test Commands

Update the test commands to reflect current npm scripts:

### Current Content (to be updated)

```bash
npm run test:misspellings
```

### Updated Content

```bash
# Run all normalizer tests including misspelling correction
npm run test:unit -- test/unit/normalizer

# Run just the misspelling tests
npm run test:unit -- test/unit/normalizer/misspellings.test.ts
```

## Other Updates

Additional minor updates throughout the document:

1. Update npm script names to match the current package.json
2. Ensure all examples use the modern pattern handler approach
3. Update filenames and paths to match the current structure
4. Add information about testing with the pattern handler factory
5. Update command examples to use the current CLI options

## Implementation Plan

1. Create a draft of the updated document with all changes applied
2. Review for consistency with other documentation updates
3. Update the file at `/docs/development/testing-guide.md`
4. Update the progress tracking table in the implementation approach document 