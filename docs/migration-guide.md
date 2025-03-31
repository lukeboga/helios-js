# Migration Guide: From Transformer to CompromiseJS

This guide will help you migrate from the original regex-based transformer to the new CompromiseJS-based processor in HeliosJS.

## Backward Compatibility

The CompromiseJS integration is designed to be fully backward compatible with the existing transformer API. This means that in most cases, you can continue using the library as before without any changes to your code.

## Direct Usage of the New Processor

If you want to take advantage of the new features of the CompromiseJS processor, you can use it directly:

```typescript
// Before (using transformer)
import { transformRecurrencePattern } from 'helios-js';
const options = transformRecurrencePattern('every monday');

// After (using processor)
import { processRecurrencePattern } from 'helios-js';
const options = processRecurrencePattern('every monday');
```

## Key Differences

While the APIs are similar, there are some key differences to be aware of:

### Return Value Differences

1. The `processRecurrencePattern` function can return `null` for unrecognized patterns, while `transformRecurrencePattern` always returns an object.

```typescript
// Transformer (always returns an object)
const transformerResult = transformRecurrencePattern('unrecognized pattern');
console.log(transformerResult); // Returns an object with default values and low confidence

// Processor (returns null for unrecognized patterns)
const processorResult = processRecurrencePattern('unrecognized pattern');
console.log(processorResult); // Returns null
```

2. Handle potential `null` return values:

```typescript
// Safe usage with null check
const options = processRecurrencePattern('some pattern');
if (options) {
  const rule = new RRule(options);
  // Use the rule...
} else {
  // Handle unrecognized pattern
  console.log('Pattern not recognized');
}
```

### Configuration Options

The processor accepts a different configuration object:

```typescript
// Transformer configuration
transformRecurrencePattern('every monday', {
  applyDefaults: true,
  enforceRules: ['frequency']
});

// Processor configuration
processRecurrencePattern('every monday', {
  useCache: true,
  forceHandlers: ['frequency'],
  defaults: {
    count: 10
  }
});
```

### Pattern Recognition Differences

Some patterns might be recognized differently by the CompromiseJS processor:

1. **Improved recognition**: The processor is generally better at recognizing complex patterns.
2. **New pattern types**: The processor supports some patterns that the transformer didn't.
3. **Different defaults**: In some edge cases, the processor might use different default values.

## Migration Steps

1. **Test your existing patterns**: Run your existing patterns through both functions to identify any differences:

```typescript
function compareResults(pattern) {
  const oldResult = transformRecurrencePattern(pattern);
  const newResult = processRecurrencePattern(pattern);
  
  console.log(`Pattern: "${pattern}"`);
  console.log('Old:', oldResult);
  console.log('New:', newResult);
  console.log('---');
}

// Test your common patterns
compareResults('every monday');
compareResults('daily');
// ...
```

2. **Add null checks**: When switching to `processRecurrencePattern`, add null checks:

```typescript
function createRule(pattern) {
  const options = processRecurrencePattern(pattern);
  if (options) {
    return new RRule(options);
  }
  return null; // Or a default RRule
}
```

3. **Update configuration**: If you were using configuration options, update them to match the new API.

4. **Consider fallback for unsupported patterns**: For patterns that used to work with the transformer but don't work with the processor:

```typescript
function createRuleWithFallback(pattern) {
  // Try the new processor first
  const options = processRecurrencePattern(pattern);
  
  if (options) {
    return new RRule(options);
  }
  
  // Fall back to the transformer if processor returns null
  console.warn(`Using fallback for pattern: "${pattern}"`);
  const fallbackOptions = transformRecurrencePattern(pattern);
  return new RRule(fallbackOptions);
}
```

## Testing

It's highly recommended to test all your commonly used patterns with the new processor to ensure they are recognized correctly. The debug script included in the repository can help identify potential differences:

```bash
npx tsx test/debug-compromise.ts
```

## Performance Considerations

The CompromiseJS processor includes several optimizations:

1. **Lazy Initialization**: CompromiseJS is only initialized when needed.
2. **Fast Paths**: Common patterns use simple regex for better performance.
3. **Caching**: Results are cached to avoid reprocessing identical patterns.

You can run the benchmark script to compare performance:

```bash
npx tsx test/benchmark-compromise.ts
``` 