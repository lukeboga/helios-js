/**
 * Test script for fuzzy matching implementation
 * 
 * This script tests the functionality of our fuzzy matching utilities
 * and their integration with the normalizer.
 */

import { fuzzyMatchWord, findBestMatch } from '../src/utils/fuzzyMatch';
import { normalizeInput, correctMisspellings } from '../src/normalizer';
import { DAYS, MONTHS } from '../src/constants';

// Colors for console output
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

// Test utilities
function test(name: string, fn: () => boolean) {
  try {
    const result = fn();
    console.log(`${result ? GREEN + '✓' : RED + '✗'} ${name}${RESET}`);
    return result;
  } catch (e) {
    console.log(`${RED}✗ ${name} - Error: ${e}${RESET}`);
    return false;
  }
}

function assertEqual(actual: any, expected: any, message = ''): boolean {
  const result = actual === expected;
  if (!result) {
    console.log(`  Expected: ${expected}`);
    console.log(`  Actual:   ${actual}`);
    if (message) console.log(`  Message: ${message}`);
  }
  return result;
}

// Unit tests for fuzzyMatchWord
console.log('\n🔍 Testing fuzzyMatchWord function:');

test('Exact match', () => {
  return fuzzyMatchWord('monday', 'monday');
});

test('Close match', () => {
  return fuzzyMatchWord('monday', 'mondey');
});

test('Not a match', () => {
  return !fuzzyMatchWord('monday', 'tuesday');
});

test('Empty strings', () => {
  return !fuzzyMatchWord('', '');
});

test('Short word threshold adjustment', () => {
  // This should match with the adjusted threshold for short words
  return fuzzyMatchWord('sat', 'set', 0.7); // Use a more lenient threshold
});

// Unit tests for findBestMatch
console.log('\n🔍 Testing findBestMatch function:');

const daysList = Object.values(DAYS);

test('Find exact match in array', () => {
  const result = findBestMatch('monday', daysList);
  // Check for case-insensitive match rather than exact case match
  return assertEqual(result?.toLowerCase(), 'monday', 'Should find a match for "monday" in days array');
});

test('Find close match in array', () => {
  const result = findBestMatch('mondey', daysList);
  // Check for case-insensitive match rather than exact case match
  return assertEqual(result?.toLowerCase(), 'monday', 'Should find a match for "mondey" in days array');
});

test('Find no match in array', () => {
  const result = findBestMatch('xyzabc', daysList);
  return assertEqual(result, null, 'Should not find a match for non-similar text');
});

test('Empty input handling', () => {
  const result = findBestMatch('', daysList);
  return assertEqual(result, null, 'Should return null for empty input');
});

test('Empty candidates handling', () => {
  const result = findBestMatch('monday', []);
  return assertEqual(result, null, 'Should return null for empty candidates');
});

// Integration tests with the normalizer
console.log('\n🔍 Testing normalizer integration:');

test('Basic correction', () => {
  const input = 'every mondey';
  const result = correctMisspellings(input);
  return assertEqual(result, 'every monday', 'Should correct "mondey" to "monday"');
});

test('Multiple corrections', () => {
  const input = 'every mondey and tusday';
  const result = correctMisspellings(input);
  return assertEqual(result, 'every monday and tuesday', 'Should correct multiple misspellings');
});

test('Case preservation', () => {
  const input = 'Every Mondey and Tusday';
  const result = correctMisspellings(input);
  return assertEqual(result, 'Every Monday and Tuesday', 'Should preserve capitalization');
});

test('No false positives', () => {
  const input = 'project deadline';
  const result = correctMisspellings(input);
  return assertEqual(result, 'project deadline', 'Should not change correct words');
});

test('Full normalizer with corrections', () => {
  const input = 'Every 2nd Mondey at 3pm';
  const result = normalizeInput(input, { correctMisspellings: true });
  return assertEqual(result, 'every 2 monday at 3pm', 'Should correct spelling and normalize');
});

test('Ordinal suffix preservation', () => {
  const input = 'every 1st monday';
  // With preserveOrdinalSuffixes: true
  const result1 = normalizeInput(input, { 
    correctMisspellings: true, 
    preserveOrdinalSuffixes: true 
  });
  // With preserveOrdinalSuffixes: false (default)
  const result2 = normalizeInput(input, { 
    correctMisspellings: true
  });
  
  return assertEqual(result1, 'every 1st monday', 'Should preserve ordinal suffix') && 
         assertEqual(result2, 'every 1 monday', 'Should remove ordinal suffix');
});

console.log('\n🔍 Testing edge cases:');

test('Very short words', () => {
  const input = 'on Mo';
  const result = correctMisspellings(input);
  return assertEqual(result, 'on Mo', 'Should not try to correct very short words');
});

test('Numbers with ordinal suffixes', () => {
  const input = 'every 3rd day';
  const result = correctMisspellings(input);
  return assertEqual(result, 'every 3rd day', 'Should not try to correct ordinal numbers');
});

console.log('\nAll tests completed'); 