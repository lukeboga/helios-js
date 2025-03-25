/**
 * Simple test script to verify the natural language to RRule converter
 */
import { createRRule } from '../src/index';

// List of test cases - natural language to expected results
const testCases = [
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "every day",
  "every week",
  "every month",
  "every year",
  "every 2 days",
  "every 3 weeks",
  "every 4 months",
  "every 5 years",
  "every other day",
  "every other week",
  "every other month",
  "every other year",
  "every monday",
  "every tuesday and thursday",
  "every weekday",
  "every weekend"
];

// Set a consistent start date for testing
const startDate = new Date(2023, 0, 1); // January 1, 2023
// Set end date to be 7 years out from start date for better testing
const endDate = new Date(2030, 0, 1); // January 1, 2030

// Process each test case
console.log("Testing natural language to RRule conversion:\n");

testCases.forEach(testCase => {
  console.log(`Input: "${testCase}"`);

  try {
    // Create the RRule from natural language
    const rule = createRRule(startDate, testCase, endDate);

    // Get the next 10 occurrences (limit to 10)
    const occurrences = rule.all((_, i) => i < 10);  // Corrected to pass just the limit

    // Output the results
    console.log("RRule text:", rule.toString());
    console.log("Next 10 occurrences:");
    occurrences.forEach(date => {
      console.log(`- ${date.toDateString()}`);
    });
  } catch (error) {
    console.error("Error:", error.message);
  }

  console.log("\n" + "-".repeat(50) + "\n");
});
