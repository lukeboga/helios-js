# Initial Assessment: `api-reference.md`

This document contains the detailed initial assessment of `docs/development/api-reference.md` following our implementation approach. It identifies specific sections requiring modification, categorizes the changes, and establishes priorities for updates.

## 1. Identified Sections Requiring Modification

1. **Core Functions**
   - `naturalLanguageToRRule`: Return type, parameter types
   - `createRRule`: Parameter types
   - `validatePattern`: Parameter types, return type details

2. **Interfaces**
   - `TransformerConfig`: Replace with `RecurrenceProcessorOptions`
   - `ValidationResult`: Remove `matchedPatterns` property
   - `TransformationResult`: Remove or update as this doesn't exist in current implementation

3. **Code Examples**
   - All examples using `config?: Partial<TransformerConfig>` need updating
   - Examples showing `matchedPatterns` field in `ValidationResult` need correction

4. **Advanced Configuration**
   - Section on advanced configuration needs updates to match actual options

## 2. Change Categories

1. **Interface/API Updates** (High Priority)
   - Update return type of `naturalLanguageToRRule` from `RRuleOptions & TransformationResult` to `MinimalRRuleOptions | null`
   - Replace `TransformerConfig` with `RecurrenceProcessorOptions` throughout
   - Update `ValidationResult` interface definition to match actual implementation

2. **Code Example Updates** (Medium Priority)
   - Update all examples to use `RecurrenceProcessorOptions` instead of `TransformerConfig`
   - Fix examples that show non-existent properties

3. **Content Correction** (Medium Priority)
   - Revise advanced configuration section to match actual options available
   - Update explanation of return types to match implementation
   - Correct re-exported types section

4. **Terminology Standardization** (Low Priority)
   - Ensure consistent use of term `RecurrenceProcessorOptions` throughout

## 3. Priority Order Within Document

1. Fix core function signatures and return types
2. Update interface definitions
3. Correct code examples
4. Revise advanced configuration section
5. Update re-exported types

## Specific Discrepancies to Address

1. `naturalLanguageToRRule` function:
   - **Current doc**: Returns `RRuleOptions & TransformationResult`
   - **Actual code**: Returns `MinimalRRuleOptions | null`
   - **Need to update**: Return type definition, explanation, examples

2. Parameter types:
   - **Current doc**: `config?: Partial<TransformerConfig>`
   - **Actual code**: `config?: Partial<RecurrenceProcessorOptions>`
   - **Need to update**: All function signatures, examples, interface references

3. `ValidationResult` interface:
   - **Current doc**: Includes `matchedPatterns` property
   - **Actual code**: Only has `valid`, `confidence`, and `warnings` properties
   - **Need to update**: Interface definition, examples

4. `TransformationResult` interface:
   - **Current doc**: Shown as returned from `naturalLanguageToRRule`
   - **Actual code**: Not used in this way
   - **Need to update**: Remove or clarify that this is for internal use only

5. Configuration objects:
   - **Current doc**: Uses complex configuration objects with many options
   - **Actual code**: Uses simpler `RecurrenceProcessorOptions` with limited fields
   - **Need to update**: Simplify configuration documentation

## Next Steps: Content Development

For each section requiring changes, we will:

1. Extract the original content
2. Create updated content that aligns with the current implementation
3. Verify updates against the actual codebase
4. Ensure consistent terminology throughout

We'll begin with the highest priority changes to function signatures and interface definitions, then proceed to code examples and configuration documentation. 