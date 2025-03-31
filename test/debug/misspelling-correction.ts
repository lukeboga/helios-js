/**
 * Misspelling Correction Test Script
 * 
 * This script tests the misspelling correction functionality with
 * various misspelled patterns to verify the system's ability to
 * correctly interpret them.
 */

import { RRule } from 'rrule';
import { naturalLanguageToRRule, validatePattern } from '../../src/index';

console.log('Misspelling Correction Test');
console.log('===========================\n');

// Add more test patterns with common misspellings
const patterns = [
  // Focus on new test patterns
  "evrey weekdys",
  "biweekley on mondy",
  "evry other saturaday",
  "first mondai of the monthy",
  "last friady of eech month",
  "every tusday and thrusday in janaury",
  "weekley on wendsday untl feburary",
  "bi-monthley on the 15th",
  "fridy to sundy",
  "quaterly meetings",
  // Original patterns for comparison
  "every monday",
  "every tuesday and wednesday",
];

// Test each pattern and log results
const startDate = new Date(2023, 0, 1); // Jan 1, 2023

for (const pattern of patterns) {
  console.log(`\n----- Pattern: "${pattern}" -----`);
  
  // First validate the pattern
  const validation = validatePattern(pattern);
  console.log(`Valid: ${validation.valid}, Confidence: ${validation.confidence.toFixed(2)}`);
  
  // Then try to convert to RRule
  const options = naturalLanguageToRRule(startDate, pattern);
  
  if (options === null) {
    console.log('Could not parse pattern');
    continue;
  }
  
  // Display the frequency
  let freqName = 'UNKNOWN';
  if (options.freq !== undefined) {
    switch (options.freq) {
      case RRule.DAILY: freqName = 'DAILY'; break;
      case RRule.WEEKLY: freqName = 'WEEKLY'; break;
      case RRule.MONTHLY: freqName = 'MONTHLY'; break;
      case RRule.YEARLY: freqName = 'YEARLY'; break;
    }
    console.log(`Frequency: ${freqName}`);
  }
  
  // Display interval
  console.log(`Interval: ${options.interval || 1}`);
  
  // Display weekdays if present
  if (options.byweekday && options.byweekday.length) {
    const weekdayMap: Record<number, string> = {
      0: 'Monday',
      1: 'Tuesday',
      2: 'Wednesday',
      3: 'Thursday',
      4: 'Friday',
      5: 'Saturday',
      6: 'Sunday'
    };
    
    const weekdays = options.byweekday.map((day: any) => {
      const weekdayNum = day.weekday as number;
      return weekdayMap[weekdayNum];
    });
    console.log(`Weekdays: ${weekdays.join(', ')}`);
  }
  
  // Display until date if present
  if (options.until) {
    console.log(`Until: ${options.until.toDateString()}`);
  }
  
  // Create RRule for showing occurrences
  const rrule = new RRule({
    ...options,
    dtstart: startDate
  });
  
  // Get next 3 occurrences
  const nextDates = rrule.all((date: Date, index?: number) => {
    return index !== undefined && index < 3;
  });
  
  console.log('Next 3 occurrences:');
  for (const date of nextDates) {
    console.log(`- ${date.toDateString()}`);
  }
}

console.log('\nTest complete!'); 