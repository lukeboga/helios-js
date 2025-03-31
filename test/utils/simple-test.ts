/**
 * Simple test script for the helios-js library
 * 
 * This tests the natural language to RRule conversion with various patterns
 */
import { RRule } from 'rrule';
import { naturalLanguageToRRule } from '../../src/index';
import type { RecurrenceProcessorOptions } from '../../src/processor';

// List of test cases - natural language to expected results
const testPatterns = [
  // Basic frequencies
  "daily",
  "weekly",
  "monthly",
  "yearly",
  
  // With "every" prefix
  "every day",
  "every week",
  "every month",
  "every year",
  
  // With intervals
  "every 2 days",
  "every 3 weeks",
  "every 4 months",
  "every 5 years",
  
  // With "other" syntax
  "every other day",
  "every other week",
  "every other month",
  "every other year",
  
  // Day of week
  "every monday",
  "every tuesday and thursday",
  "every weekday",
  "every weekend",
  
  // Test misspelling correction
  "every mondey", // misspelled monday
  "every tuseday", // misspelled tuesday
  "every wednessday", // misspelled wednesday
];

// Generate RRule and print output
console.log('Testing natural language to RRule conversion:\n');

// Use Jan 1, 2023 as a consistent start date
const startDate = new Date(2023, 0, 1);

for (const input of testPatterns) {
  try {
    // Convert natural language to RRule options
    const options = naturalLanguageToRRule(
      startDate,
      input,
      // Cast the config to the proper type
      { correctMisspellings: true } as Partial<RecurrenceProcessorOptions>
    );
    
    if (options === null) {
      console.log(`Input: "${input}"`);
      console.log(`Could not parse pattern`);
      console.log('\n--------------------------------------------------\n');
      continue;
    }
    
    // Create RRule instance with proper type conversion
    const rruleOptions: RRule.Options = {
      freq: options.freq,
      dtstart: startDate,
      interval: options.interval || 1
    };
    
    // Add byweekday if present
    if (options.byweekday) {
      rruleOptions.byweekday = options.byweekday as any;
    }
    
    // Add until if present
    if (options.until) {
      rruleOptions.until = options.until;
    }
    
    // Create the RRule instance
    const rrule = new RRule(rruleOptions);
    
    // Print the result
    console.log(`Input: "${input}"`);
    console.log(`RRule text: ${rrule.toString()}`);
    
    // Get the next 10 occurrences with proper callback
    const nextDates = rrule.all((date: Date, index?: number) => {
      return index !== undefined && index < 10;
    });
    
    console.log('Next 10 occurrences:');
    for (const date of nextDates) {
      console.log(`- ${date.toDateString()}`);
    }
  } catch (error) {
    console.log(`Input: "${input}"`);
    console.log(`Error: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  console.log('\n--------------------------------------------------\n');
}
