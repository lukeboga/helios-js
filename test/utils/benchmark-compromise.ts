/**
 * CompromiseJS Integration Benchmark
 * 
 * This script benchmarks the performance of the CompromiseJS-based processor.
 */

import { performance } from 'perf_hooks';
import { processRecurrencePattern } from '../../src/processor';

// Test patterns for benchmarking
const simplePatterns = [
  'daily',
  'weekly',
  'monthly',
  'yearly',
  'every day',
  'every week',
  'every month',
  'every year'
];

const intervalPatterns = [
  'every 2 days',
  'every 3 weeks',
  'every 4 months',
  'every 5 years',
  'every other day',
  'every other week',
  'every other month',
  'biweekly',
  'fortnightly'
];

const dayOfWeekPatterns = [
  'every monday',
  'every tuesday and thursday',
  'mondays',
  'tuesdays and fridays',
  'weekdays',
  'weekends',
  'monday, wednesday, and friday'
];

const complexPatterns = [
  'every monday until december',
  'every other week on tuesday',
  'monthly on the 15th',
  'every 2 weeks on monday and wednesday',
  'weekdays until end of year',
  'every monday, wednesday, and friday until december 31st'
];

// All test patterns combined
const allPatterns = [
  ...simplePatterns,
  ...intervalPatterns,
  ...dayOfWeekPatterns,
  ...complexPatterns
];

/**
 * Run a benchmark test on a function with given patterns
 */
function runBenchmark(
  name: string,
  fn: (pattern: string) => any,
  patterns: string[],
  iterations: number = 100
): { totalTime: number; averageTime: number } {
  console.log(`\nRunning benchmark: ${name}`);
  console.log(`Patterns: ${patterns.length}, Iterations: ${iterations}`);
  
  // Warm up
  for (const pattern of patterns) {
    fn(pattern);
  }
  
  const startTime = performance.now();
  
  // Run the benchmark
  for (let i = 0; i < iterations; i++) {
    for (const pattern of patterns) {
      fn(pattern);
    }
  }
  
  const endTime = performance.now();
  const totalTime = endTime - startTime;
  const averageTime = totalTime / (patterns.length * iterations);
  
  console.log(`  Total time: ${totalTime.toFixed(2)}ms`);
  console.log(`  Average time per pattern: ${averageTime.toFixed(4)}ms`);
  console.log(`  Patterns per second: ${(1000 / averageTime).toFixed(2)}`);
  
  return { totalTime, averageTime };
}

/**
 * Run benchmarks for different pattern categories
 */
function runCategoryBenchmarks(iterations: number = 100): void {
  console.log(`\n=== CompromiseJS Processor Benchmarks ===`);
  
  // Benchmark with simple patterns
  runBenchmark('Simple Patterns', processRecurrencePattern, simplePatterns, iterations);
  
  // Benchmark with interval patterns
  runBenchmark('Interval Patterns', processRecurrencePattern, intervalPatterns, iterations);
  
  // Benchmark with day of week patterns
  runBenchmark('Day of Week Patterns', processRecurrencePattern, dayOfWeekPatterns, iterations);
  
  // Benchmark with complex patterns
  runBenchmark('Complex Patterns', processRecurrencePattern, complexPatterns, iterations);
  
  // Benchmark with all patterns
  runBenchmark('All Patterns', processRecurrencePattern, allPatterns, iterations);
}

/**
 * Run memory usage test
 */
function testMemoryUsage(): void {
  console.log('\n=== Memory Usage Test ===');
  console.log('Initial memory usage:');
  displayMemoryUsage();
  
  console.log('\nLoading processor module...');
  // Force processor module initialization if not already loaded
  processRecurrencePattern('daily');
  console.log('After loading processor:');
  displayMemoryUsage();
  
  // Run a GC if available
  if (global.gc) {
    console.log('\nForcing garbage collection...');
    global.gc();
    console.log('After garbage collection:');
    displayMemoryUsage();
  } else {
    console.log('\nNote: Run with --expose-gc to see garbage collection effects');
  }
}

/**
 * Display current memory usage
 */
function displayMemoryUsage(): void {
  const memoryUsage = process.memoryUsage();
  console.log(`  RSS: ${formatMB(memoryUsage.rss)} MB (total memory allocated)`);
  console.log(`  Heap used: ${formatMB(memoryUsage.heapUsed)} MB (used JavaScript heap)`);
  console.log(`  Heap total: ${formatMB(memoryUsage.heapTotal)} MB (total JavaScript heap)`);
}

/**
 * Format bytes as megabytes
 */
function formatMB(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(2);
}

// Run the benchmark tests
console.log('CompromiseJS Integration Benchmark');
console.log('=================================');

// Run benchmarks for each pattern category
runCategoryBenchmarks();

// Test memory usage
testMemoryUsage();

console.log('\nBenchmark complete!'); 