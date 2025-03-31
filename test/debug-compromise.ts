/**
 * CompromiseJS Implementation Debug Script
 * 
 * This script compares the outputs of processRecurrencePattern and transformRecurrencePattern
 * to help identify differences and ensure compatibility.
 */

import { RRule } from 'rrule';
import { processRecurrencePattern } from '../src/processor';
import { transformRecurrencePattern } from '../src/transformer';

// Test patterns to compare
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
  'every tuesday until next month'
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
  
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  
  return String(value);
}

/**
 * Compare and display differences between two result objects
 */
function compareResults(pattern: string, newResult: any, oldResult: any): void {
  console.log(`\n===== Pattern: "${pattern}" =====`);
  
  // Core fields to check
  const fields = ['freq', 'interval', 'byweekday', 'bymonthday', 'until', 'confidence'];
  
  for (const field of fields) {
    const newValue = newResult ? newResult[field] : undefined;
    const oldValue = oldResult ? oldResult[field] : undefined;
    
    // Special handling for byweekday to handle array vs single weekday
    if (field === 'byweekday') {
      if (newResult && oldResult) {
        const newArray = Array.isArray(newValue) ? newValue : newValue ? [newValue] : [];
        const oldArray = Array.isArray(oldValue) ? oldValue : oldValue ? [oldValue] : [];
        
        const newStrings = newArray.map(d => d ? d.toString() : '').sort().join(',');
        const oldStrings = oldArray.map(d => d ? d.toString() : '').sort().join(',');
        
        if (newStrings !== oldStrings) {
          console.log(`  - ${field}: DIFFERENT`);
          console.log(`    New: ${formatForDisplay(newValue)}`);
          console.log(`    Old: ${formatForDisplay(oldValue)}`);
        } else {
          console.log(`  - ${field}: OK`);
        }
        continue;
      }
    }
    
    // Regular comparison for other fields
    const isEqual = JSON.stringify(newValue) === JSON.stringify(oldValue);
    if (!isEqual) {
      console.log(`  - ${field}: DIFFERENT`);
      console.log(`    New: ${formatForDisplay(newValue)}`);
      console.log(`    Old: ${formatForDisplay(oldValue)}`);
    } else {
      console.log(`  - ${field}: OK`);
    }
  }
}

// Run the comparison for each pattern
console.log("CompromiseJS Implementation Debug");
console.log("================================\n");

for (const pattern of patterns) {
  const newResult = processRecurrencePattern(pattern);
  const oldResult = transformRecurrencePattern(pattern);
  compareResults(pattern, newResult, oldResult);
}

console.log("\nDebug complete!"); 