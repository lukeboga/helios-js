/**
 * CompromiseJS Implementation Debug Script
 * 
 * This script analyzes the output of processRecurrencePattern for different patterns
 * to help debug and understand the results.
 */

import { RRule } from 'rrule';
import { processRecurrencePattern } from '../../src/processor';

// Test patterns to debug
const patterns = [
  'daily',
  'weekly',
  'monthly',
  'yearly',
  'every monday',
  'every 2 weeks',
  'every other month',
  'mondays',
  'mondays and fridays',
  'every weekday',
  'every weekend',
  'biweekly',
  'fortnightly',
  'until december',
  'every tuesday until next month',
  // Additional complex patterns
  'every monday until december',
  'every 2 weeks on tuesday',
  'monthly on the 15th',
  'every 2 weeks on monday and wednesday',
  'weekdays until end of year',
  'first monday of every month',
  'last friday of the month'
];

/**
 * Formats a value for readable output
 */
function formatForDisplay(value: any): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  
  if (Array.isArray(value)) {
    return '[' + value.map(formatForDisplay).join(', ') + ']';
  }
  
  if (value instanceof RRule.Weekday) {
    // Handle weekday objects specially
    return `RRule.${value.toString().toUpperCase()}`;
  }
  
  if (value instanceof Date) {
    // Format dates nicely
    return value.toISOString();
  }
  
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  
  return String(value);
}

/**
 * Display fields of the result object
 */
function displayResult(pattern: string, result: any): void {
  console.log(`\n===== Pattern: "${pattern}" =====`);
  
  if (result === null) {
    console.log('  Result: null (pattern not recognized)');
    return;
  }
  
  // Core fields to display
  const fields = ['freq', 'interval', 'byweekday', 'bymonthday', 'bysetpos', 'until', 'confidence'];
  
  for (const field of fields) {
    const value = result[field];
    
    if (value !== undefined) {
      console.log(`  - ${field}: ${formatForDisplay(value)}`);
    }
  }
  
  // Display frequency as named constant for better readability
  if (result.freq !== undefined) {
    let freqName = 'UNKNOWN';
    switch (result.freq) {
      case RRule.DAILY: freqName = 'DAILY'; break;
      case RRule.WEEKLY: freqName = 'WEEKLY'; break;
      case RRule.MONTHLY: freqName = 'MONTHLY'; break;
      case RRule.YEARLY: freqName = 'YEARLY'; break;
    }
    console.log(`  - freq (name): ${freqName}`);
  }
}

// Run the analysis for each pattern
console.log("CompromiseJS Implementation Debug");
console.log("================================\n");

for (const pattern of patterns) {
  const result = processRecurrencePattern(pattern);
  displayResult(pattern, result);
}

console.log("\nDebug complete!"); 