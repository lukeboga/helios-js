# CompromiseJS Integration for Natural Language Recurrence Pattern Processing

This PR introduces a complete integration of CompromiseJS for enhanced natural language processing of recurrence patterns in HeliosJS.

## Summary

The integration replaces the original regex-based pattern transformer with a more robust NLP-based processor that leverages CompromiseJS for pattern recognition. This new approach provides better pattern recognition, improved performance, and easier extensibility.

## Features

### Enhanced Pattern Recognition
- More accurate recognition of complex patterns
- Support for a wider range of natural language expressions
- Better handling of edge cases and variations in wording

### Improved Architecture
- Modular pattern handlers for different recurrence types
- Clear separation of concerns with dedicated modules
- Extensible framework for adding new pattern types

### Performance Optimizations
- Lazy initialization of the NLP engine
- Fast-path checks for common patterns
- Result caching to avoid repeated processing
- Benchmark script showing performance improvements

### Backward Compatibility
- Full backward compatibility with the existing transformer API
- Smooth migration path for existing code
- Detailed migration guide for users

## Documentation

This PR includes comprehensive documentation:
- **Integration Guide**: Details on how the CompromiseJS integration works
- **Migration Guide**: Step-by-step instructions for transitioning from the transformer
- **Contribution Guide**: Guidelines for adding new pattern handlers

## Tests

- Complete test suite covering all pattern types
- Comparison tests against the original transformer
- Debug utilities for examining pattern recognition
- Benchmark script for performance analysis

## Future Work

- Support for additional pattern types
- Further performance optimizations
- Enhanced internationalization support

## Affected Components

- `src/processor.ts`: New CompromiseJS-based processor
- `src/compromise/`: New directory for CompromiseJS integration
- `src/transformer.ts`: Updated to delegate to the new processor
- `test/compromise.test.ts`: Test suite for the new integration
- `docs/`: New documentation files 