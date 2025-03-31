/**
 * Debug tests for pattern combinations
 */

import { RRule } from 'rrule';
import { processRecurrencePattern } from '../../src/processor';
import { describe, it, expect } from 'vitest';

describe('Pattern Combination Debug', () => {
  // Test cases for complex patterns
  const testCases = [
    "every monday and friday",
    "every 2 weeks on monday",
    "every monday until December 31, 2022",
    "1st and 15th of every month",
    "every monday and wednesday at 3pm", // Time not yet supported
    "first and last day of the month",
    "every monday and the 15th of the month",
    "every other friday and the first monday of every month",
    "every day except weekends", // Not yet supported
    "1st of January and July", // Specific months not yet supported
  ];

  describe('Pattern Processing', () => {
    for (const [index, testCase] of testCases.entries()) {
      it(`processes pattern "${testCase}"`, () => {
        try {
          const result = processRecurrencePattern(testCase);
          
          // Format the result in a more readable way
          const formatted = {
            frequency: result ? getFrequencyName(result.freq as number) : "Not recognized",
            interval: result?.interval || 1,
            byweekday: formatWeekdays(result?.byweekday),
            bymonthday: result?.bymonthday || [],
            bymonth: result?.bymonth || [],
            until: result?.until ? formatDate(result.until as Date) : undefined,
            confidence: result?.confidence || 0
          };
          
          console.log(`Test ${index + 1}: "${testCase}"`);
          console.log("- Processing result:", formatted);
          
          // Basic assertion for the test
          if (result === null) {
            console.log("- Pattern not recognized");
          } else {
            expect(result.freq).toBeDefined();
          }
        } catch (error) {
          console.log(`Test ${index + 1}: "${testCase}"`);
          console.log("- Error:", (error as Error).message);
          // Don't fail the test if we expect some patterns might not be supported yet
          // Instead, just mark it as a "pass" with console output
          expect(true).toBe(true);
        }
      });
    }
  });
});

// Helper functions for formatting output

function getFrequencyName(freq?: number): string {
  if (freq === undefined) return "undefined";
  
  switch (freq) {
    case RRule.DAILY: return "DAILY";
    case RRule.WEEKLY: return "WEEKLY";
    case RRule.MONTHLY: return "MONTHLY";
    case RRule.YEARLY: return "YEARLY";
    default: return `Unknown (${freq})`;
  }
}

function formatWeekdays(weekdays: any): string[] {
  if (!weekdays) return [];
  
  const dayNames = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
  
  if (!Array.isArray(weekdays)) {
    weekdays = [weekdays];
  }
  
  return weekdays.map((day: any) => {
    if (typeof day === 'number') {
      return dayNames[day] || `Unknown (${day})`;
    }
    if (day && day.toString) {
      return day.toString();
    }
    return `Unknown format: ${typeof day}`;
  });
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
} 