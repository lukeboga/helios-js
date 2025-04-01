/**
 * Pattern Handler Testing Utilities
 * 
 * This file provides utilities for testing pattern handlers, including:
 * - Baseline validation (comparing before/after behavior)
 * - Pattern handler specific tests
 * - Test case generation
 */

import nlp from 'compromise';
import { RRule } from 'rrule';
import { RecurrenceOptions } from '../../src/types';
import { PatternHandlerResult } from '../../src/processor';

export interface PatternTestCase {
  input: string;
  expected: {
    matches: boolean;
    options?: Partial<RecurrenceOptions>;
    ruleText?: string;
    nextDates?: Date[];
  };
  description?: string;
}

export interface PatternHandlerValidationResult {
  success: boolean;
  original: {
    matched: boolean;
    options: Partial<RecurrenceOptions> | null;
  };
  modified: {
    matched: boolean;
    options: Partial<RecurrenceOptions> | null;
  };
  differences: {
    field: string;
    original: any;
    modified: any;
  }[];
  errorMessage?: string;
}

/**
 * Validate that pattern handling behavior is consistent before and after changes
 * @param originalHandler The original pattern handler function
 * @param modifiedHandler The modified pattern handler function
 * @param testCases Array of test cases
 * @returns Validation results for each test case
 */
export function validatePatternHandlers(
  originalHandler: (doc: any, options: RecurrenceOptions) => PatternHandlerResult,
  modifiedHandler: (doc: any, options: RecurrenceOptions) => PatternHandlerResult,
  testCases: PatternTestCase[]
): PatternHandlerValidationResult[] {
  return testCases.map(testCase => {
    try {
      // Process with original handler
      const originalOptions: RecurrenceOptions = {
        freq: RRule.WEEKLY,
        interval: 1,
        byweekday: null,
        bymonthday: null,
        bymonth: null
      };
      const originalDoc = nlp(testCase.input);
      const originalResult = originalHandler(originalDoc, originalOptions);
      
      // Process with modified handler
      const modifiedOptions: RecurrenceOptions = {
        freq: RRule.WEEKLY,
        interval: 1,
        byweekday: null,
        bymonthday: null,
        bymonth: null
      };
      const modifiedDoc = nlp(testCase.input);
      const modifiedResult = modifiedHandler(modifiedDoc, modifiedOptions);
      
      // Compare results
      const differences = findDifferences(originalOptions, modifiedOptions);
      
      return {
        success: 
          (originalResult.matched === modifiedResult.matched) && 
          (differences.length === 0),
        original: {
          matched: originalResult.matched,
          options: originalResult.matched ? originalOptions : null
        },
        modified: {
          matched: modifiedResult.matched,
          options: modifiedResult.matched ? modifiedOptions : null
        },
        differences
      };
    } catch (error) {
      return {
        success: false,
        original: { matched: false, options: null },
        modified: { matched: false, options: null },
        differences: [],
        errorMessage: error instanceof Error ? error.message : String(error)
      };
    }
  });
}

/**
 * Find differences between two RecurrenceOptions objects
 */
function findDifferences(
  original: RecurrenceOptions,
  modified: RecurrenceOptions
): { field: string; original: any; modified: any }[] {
  const differences: { field: string; original: any; modified: any }[] = [];
  
  // Compare each field
  for (const key of Object.keys({...original, ...modified})) {
    const originalValue = original[key as keyof RecurrenceOptions];
    const modifiedValue = modified[key as keyof RecurrenceOptions];
    
    // Skip if both undefined
    if (originalValue === undefined && modifiedValue === undefined) {
      continue;
    }
    
    // Check if different
    if (!isEquivalent(originalValue, modifiedValue)) {
      differences.push({
        field: key,
        original: originalValue,
        modified: modifiedValue
      });
    }
  }
  
  return differences;
}

/**
 * Check if two values are equivalent, handling arrays and objects
 */
function isEquivalent(a: any, b: any): boolean {
  // If exactly the same
  if (a === b) return true;
  
  // If one is undefined but not the other
  if (a === undefined || b === undefined) return false;
  
  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    
    // Sort arrays if they contain primitive values
    if (a.every(item => typeof item !== 'object')) {
      const sortedA = [...a].sort();
      const sortedB = [...b].sort();
      return sortedA.every((val, idx) => isEquivalent(val, sortedB[idx]));
    }
    
    // Otherwise check each element
    return a.every((val, idx) => isEquivalent(val, b[idx]));
  }
  
  // Handle objects
  if (
    typeof a === 'object' && a !== null && 
    typeof b === 'object' && b !== null
  ) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    return keysA.every(key => 
      Object.prototype.hasOwnProperty.call(b, key) && 
      isEquivalent(a[key], b[key])
    );
  }
  
  return false;
}

/**
 * Creates a test report summarizing validation results
 */
export function createValidationReport(
  validationResults: PatternHandlerValidationResult[],
  testCases: PatternTestCase[]
): string {
  let report = 'Pattern Handler Validation Report\n';
  report += '================================\n\n';
  
  const passedCount = validationResults.filter(r => r.success).length;
  const failedCount = validationResults.length - passedCount;
  
  report += `Summary: ${passedCount} passed, ${failedCount} failed\n\n`;
  
  validationResults.forEach((result, index) => {
    const testCase = testCases[index];
    
    report += `Test #${index + 1}: ${testCase.description || testCase.input}\n`;
    report += `Result: ${result.success ? 'PASSED' : 'FAILED'}\n`;
    
    if (!result.success) {
      report += `Input: "${testCase.input}"\n`;
      
      if (result.errorMessage) {
        report += `Error: ${result.errorMessage}\n`;
      } else {
        report += `Original matched: ${result.original.matched}\n`;
        report += `Modified matched: ${result.modified.matched}\n`;
        
        if (result.differences.length > 0) {
          report += 'Differences:\n';
          result.differences.forEach(diff => {
            report += `  - ${diff.field}: ${JSON.stringify(diff.original)} -> ${JSON.stringify(diff.modified)}\n`;
          });
        }
      }
    }
    
    report += '\n';
  });
  
  return report;
}

/**
 * Generate standard test cases for a pattern handler
 */
export function generateStandardTestCases(
  patternType: 'frequency' | 'interval' | 'dayOfWeek' | 'untilDate'
): PatternTestCase[] {
  switch (patternType) {
    case 'frequency':
      return [
        { 
          input: 'daily', 
          expected: { 
            matches: true,
            options: { freq: RRule.DAILY }
          },
          description: 'Basic daily frequency'
        },
        { 
          input: 'weekly', 
          expected: { 
            matches: true,
            options: { freq: RRule.WEEKLY }
          },
          description: 'Basic weekly frequency'
        },
        { 
          input: 'monthly', 
          expected: { 
            matches: true,
            options: { freq: RRule.MONTHLY }
          },
          description: 'Basic monthly frequency'
        },
        { 
          input: 'yearly', 
          expected: { 
            matches: true,
            options: { freq: RRule.YEARLY }
          },
          description: 'Basic yearly frequency'
        },
        { 
          input: 'every day', 
          expected: { 
            matches: true,
            options: { freq: RRule.DAILY }
          },
          description: 'Every day format'
        },
        { 
          input: 'random text', 
          expected: { 
            matches: false
          },
          description: 'Non-matching text'
        }
      ];
      
    // Add other pattern types as needed
    default:
      return [];
  }
} 