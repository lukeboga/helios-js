/**
 * Test Suite for CompromiseJS Integration
 * 
 * This file contains basic tests for the CompromiseJS-based pattern recognition.
 * It compares the results of the new processor against expected values and the
 * existing transformer implementation.
 */

import { describe, expect, it } from 'vitest';
import { RRule } from 'rrule';
import { processRecurrencePattern } from '../src/processor';
import { transformRecurrencePattern } from '../src/transformer';

// Sample patterns to test
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

describe('CompromiseJS Pattern Recognition', () => {
  describe('Basic Frequency Patterns', () => {
    it('should recognize "daily"', () => {
      const result = processRecurrencePattern('daily');
      
      expect(result.freq).toBe(RRule.DAILY);
      expect(result.interval).toBe(1);
      expect(result.confidence).toBeGreaterThan(0.9);
    });
    
    it('should recognize "weekly"', () => {
      const result = processRecurrencePattern('weekly');
      
      expect(result.freq).toBe(RRule.WEEKLY);
      expect(result.interval).toBe(1);
      expect(result.confidence).toBeGreaterThan(0.9);
    });
    
    it('should recognize "monthly"', () => {
      const result = processRecurrencePattern('monthly');
      
      expect(result.freq).toBe(RRule.MONTHLY);
      expect(result.interval).toBe(1);
      expect(result.confidence).toBeGreaterThan(0.9);
    });
    
    it('should recognize "yearly"', () => {
      const result = processRecurrencePattern('yearly');
      
      expect(result.freq).toBe(RRule.YEARLY);
      expect(result.interval).toBe(1);
      expect(result.confidence).toBeGreaterThan(0.9);
    });
  });
  
  describe('Interval Patterns', () => {
    it('should recognize "every 2 weeks"', () => {
      const result = processRecurrencePattern('every 2 weeks');
      
      expect(result.freq).toBe(RRule.WEEKLY);
      expect(result.interval).toBe(2);
      expect(result.confidence).toBeGreaterThan(0.9);
    });
    
    it('should recognize "every other month"', () => {
      const result = processRecurrencePattern('every other month');
      
      expect(result.freq).toBe(RRule.MONTHLY);
      expect(result.interval).toBe(2);
      expect(result.confidence).toBeGreaterThan(0.9);
    });
    
    it('should recognize "biweekly"', () => {
      const result = processRecurrencePattern('biweekly');
      
      expect(result.freq).toBe(RRule.WEEKLY);
      expect(result.interval).toBe(2);
      expect(result.confidence).toBeGreaterThan(0.9);
    });
  });
  
  describe('Day of Week Patterns', () => {
    it('should recognize "every monday"', () => {
      const result = processRecurrencePattern('every monday');
      
      expect(result.freq).toBe(RRule.WEEKLY);
      expect(result.byweekday?.length).toBe(1);
      expect(result.byweekday?.[0]).toEqual(RRule.MO);
      expect(result.confidence).toBeGreaterThan(0.9);
    });
    
    it('should recognize plural day forms like "mondays"', () => {
      const result = processRecurrencePattern('mondays');
      
      expect(result.freq).toBe(RRule.WEEKLY);
      expect(result.byweekday?.length).toBe(1);
      expect(result.byweekday?.[0]).toEqual(RRule.MO);
      expect(result.confidence).toBeGreaterThan(0.9);
    });
    
    it('should recognize multiple days', () => {
      const result = processRecurrencePattern('mondays and fridays');
      
      expect(result.freq).toBe(RRule.WEEKLY);
      expect(result.byweekday?.length).toBe(2);
      // Sort to ensure consistent order for comparison
      const sortedDays = result.byweekday ? [...result.byweekday].sort() : [];
      expect(sortedDays[0]).toEqual(RRule.FR);
      expect(sortedDays[1]).toEqual(RRule.MO);
      expect(result.confidence).toBeGreaterThan(0.9);
    });
    
    it('should recognize "every weekday"', () => {
      const result = processRecurrencePattern('every weekday');
      
      expect(result.freq).toBe(RRule.WEEKLY);
      expect(result.byweekday?.length).toBe(5);
      if (result.byweekday) {
        expect(result.byweekday).toContain(RRule.MO);
        expect(result.byweekday).toContain(RRule.TU);
        expect(result.byweekday).toContain(RRule.WE);
        expect(result.byweekday).toContain(RRule.TH);
        expect(result.byweekday).toContain(RRule.FR);
      }
      expect(result.confidence).toBeGreaterThan(0.9);
    });
    
    it('should recognize "every weekend"', () => {
      const result = processRecurrencePattern('every weekend');
      
      expect(result.freq).toBe(RRule.WEEKLY);
      expect(result.byweekday?.length).toBe(2);
      if (result.byweekday) {
        expect(result.byweekday).toContain(RRule.SA);
        expect(result.byweekday).toContain(RRule.SU);
      }
      expect(result.confidence).toBeGreaterThan(0.9);
    });
  });
  
  describe('Comparison with transformer', () => {
    // Test each pattern and compare results with the existing transformer
    patterns.forEach(pattern => {
      it(`should match transformer output for "${pattern}"`, () => {
        const newResult = processRecurrencePattern(pattern);
        const oldResult = transformRecurrencePattern(pattern);
        
        // Compare core properties
        expect(newResult.freq).toEqual(oldResult.freq);
        expect(newResult.interval).toEqual(oldResult.interval);
        
        // Compare byweekday (if set)
        if (oldResult.byweekday !== null && newResult.byweekday !== null) {
          // Convert to arrays
          const oldArray = Array.isArray(oldResult.byweekday) ? oldResult.byweekday : [oldResult.byweekday];
          const newArray = Array.isArray(newResult.byweekday) ? newResult.byweekday : [newResult.byweekday];
          
          // Sort arrays for consistent comparison
          const sortedOld = oldArray.map(d => d.toString()).sort();
          const sortedNew = newArray.map(d => d.toString()).sort();
          
          expect(sortedNew).toEqual(sortedOld);
        }
        
        // Log any differences for debugging
        if (
          newResult.freq !== oldResult.freq ||
          newResult.interval !== oldResult.interval
        ) {
          console.log(`Pattern "${pattern}" has differences:`);
          console.log('New:', newResult);
          console.log('Old:', oldResult);
        }
      });
    });
  });
}); 