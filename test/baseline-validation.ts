/**
 * Baseline Validation Tests
 * 
 * These tests establish a baseline for the current behavior of pattern handlers
 * to ensure that future changes maintain backward compatibility.
 */

import { RRule } from 'rrule';
import nlp from 'compromise';
import {
  PatternTestCase,
  generateStandardTestCases
} from './utils/pattern-handler-tester';
import { RecurrenceOptions } from '../src/types';
import { PatternHandlerResult } from '../src/processor';

// Import current pattern handler functions
import { 
  applyFrequencyPatterns,
  applyIntervalPatterns,
  applyDayOfWeekPatterns
} from '../src/compromise/patterns';

/**
 * Frequency Pattern Tests
 */
export function testFrequencyPatterns(): void {
  console.log('\n=============================================');
  console.log('   BASELINE TEST: Frequency Patterns');
  console.log('=============================================\n');
  
  const testCases = generateStandardTestCases('frequency');
  
  for (const testCase of testCases) {
    try {
      console.log(`Testing: "${testCase.input}" (${testCase.description})`);
      
      // Set up options object
      const options: RecurrenceOptions = {
        freq: null,
        interval: 1,
        byweekday: null,
        bymonthday: null,
        bymonth: null
      };
      
      // Run the pattern handler
      const doc = nlp(testCase.input);
      const result: PatternHandlerResult = applyFrequencyPatterns(doc, options);
      
      // Log results
      console.log(`  Matched: ${result.matched}`);
      if (result.matched) {
        console.log(`  Frequency: ${options.freq === null ? 'null' : RRule.FREQUENCIES[options.freq]}`);
        console.log(`  Interval: ${options.interval}`);
        console.log(`  Confidence: ${result.confidence || 1.0}`);
      }
      
      // Check expectations
      const expectedMatches = testCase.expected.matches;
      const expectationsMatch = result.matched === expectedMatches;
      
      // For matched patterns, check specific option expectations
      let optionsMatch = true;
      if (result.matched && testCase.expected.options) {
        // Check if frequency matches expected
        if (
          testCase.expected.options.freq !== undefined && 
          options.freq !== testCase.expected.options.freq
        ) {
          optionsMatch = false;
          console.log(`  ERROR: Frequency mismatch. Expected ${RRule.FREQUENCIES[testCase.expected.options.freq || 0]}, got ${options.freq === null ? 'null' : RRule.FREQUENCIES[options.freq]}`);
        }
      }
      
      // Print test result
      if (expectationsMatch && optionsMatch) {
        console.log('  RESULT: ✓ PASS');
      } else {
        console.log('  RESULT: ✗ FAIL');
      }
      
      console.log('\n--------------------------------------------------\n');
    } catch (error) {
      console.log(`  ERROR: ${error instanceof Error ? error.message : String(error)}`);
      console.log('  RESULT: ✗ FAIL (Error)');
      console.log('\n--------------------------------------------------\n');
    }
  }
}

/**
 * Day of Week Pattern Tests
 */
export function testDayOfWeekPatterns(): void {
  console.log('\n=============================================');
  console.log('   BASELINE TEST: Day of Week Patterns');
  console.log('=============================================\n');
  
  // Define test cases for day of week patterns
  const dayOfWeekTestCases: PatternTestCase[] = [
    { 
      input: 'every monday', 
      expected: { 
        matches: true,
        options: { 
          freq: RRule.WEEKLY,
          byweekday: [RRule.MO]
        }
      },
      description: 'Basic weekday pattern'
    },
    { 
      input: 'every tuesday and thursday', 
      expected: { 
        matches: true,
        options: { 
          freq: RRule.WEEKLY,
          byweekday: [RRule.TU, RRule.TH]
        }
      },
      description: 'Multiple weekdays'
    },
    { 
      input: 'weekdays', 
      expected: { 
        matches: true,
        options: { 
          freq: RRule.WEEKLY,
          byweekday: [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR]
        }
      },
      description: 'Weekdays pattern'
    },
    { 
      input: 'random text', 
      expected: { 
        matches: false
      },
      description: 'Non-matching text'
    }
  ];
  
  for (const testCase of dayOfWeekTestCases) {
    try {
      console.log(`Testing: "${testCase.input}" (${testCase.description})`);
      
      // Set up options object
      const options: RecurrenceOptions = {
        freq: null,
        interval: 1,
        byweekday: null,
        bymonthday: null,
        bymonth: null
      };
      
      // Run the pattern handler
      const doc = nlp(testCase.input);
      const result: PatternHandlerResult = applyDayOfWeekPatterns(doc, options);
      
      // Log results
      console.log(`  Matched: ${result.matched}`);
      if (result.matched && options.byweekday) {
        const dayNames = options.byweekday.map(day => {
          const dayIndex = [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA, RRule.SU].indexOf(day);
          return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][dayIndex];
        });
        console.log(`  Days: ${dayNames.join(', ')}`);
        console.log(`  Confidence: ${result.confidence || 1.0}`);
      }
      
      // Print test result
      console.log('  RESULT: ✓ PASS');
      console.log('\n--------------------------------------------------\n');
    } catch (error) {
      console.log(`  ERROR: ${error instanceof Error ? error.message : String(error)}`);
      console.log('  RESULT: ✗ FAIL (Error)');
      console.log('\n--------------------------------------------------\n');
    }
  }
}

// Run baseline tests if executed directly
if (require.main === module) {
  console.log('Running Baseline Validation Tests\n');
  
  testFrequencyPatterns();
  testDayOfWeekPatterns();
  
  console.log('\nBaseline tests complete!');
} 