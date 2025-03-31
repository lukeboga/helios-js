/**
 * Test Suite for CompromiseJS Integration
 * 
 * This file contains basic tests for the CompromiseJS-based pattern recognition.
 * It compares the results of the new processor against expected values.
 */

import { describe, expect, it } from 'vitest';
import { RRule } from 'rrule';
import { processRecurrencePattern } from '../../../src/processor';

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

// Separate list of patterns that we know don't work yet with the new implementation
// but should not fail the tests
const knownIssuePatterns = [
  'until december'
];

describe('CompromiseJS Pattern Recognition', () => {
  describe('Basic Frequency Patterns', () => {
    it('should recognize "daily"', () => {
      const result = processRecurrencePattern('daily');
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.freq).toBe(RRule.DAILY);
        expect(result.interval).toBe(1);
        expect(result.confidence).toBeGreaterThan(0.9);
      }
    });
    
    it('should recognize "weekly"', () => {
      const result = processRecurrencePattern('weekly');
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.freq).toBe(RRule.WEEKLY);
        expect(result.interval).toBe(1);
        expect(result.confidence).toBeGreaterThan(0.9);
      }
    });
    
    it('should recognize "monthly"', () => {
      const result = processRecurrencePattern('monthly');
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.freq).toBe(RRule.MONTHLY);
        expect(result.interval).toBe(1);
        expect(result.confidence).toBeGreaterThan(0.9);
      }
    });
    
    it('should recognize "yearly"', () => {
      const result = processRecurrencePattern('yearly');
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.freq).toBe(RRule.YEARLY);
        expect(result.interval).toBe(1);
        expect(result.confidence).toBeGreaterThan(0.9);
      }
    });
  });
  
  describe('Interval Patterns', () => {
    it('should recognize "every 2 weeks"', () => {
      const result = processRecurrencePattern('every 2 weeks');
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.freq).toBe(RRule.WEEKLY);
        expect(result.interval).toBe(2);
        expect(result.confidence).toBeGreaterThan(0.9);
      }
    });
    
    it('should recognize "every other month"', () => {
      const result = processRecurrencePattern('every other month');
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.freq).toBe(RRule.MONTHLY);
        expect(result.interval).toBe(2);
        expect(result.confidence).toBeGreaterThan(0.9);
      }
    });
    
    it('should recognize "biweekly"', () => {
      const result = processRecurrencePattern('biweekly');
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.freq).toBe(RRule.WEEKLY);
        expect(result.interval).toBe(2);
        expect(result.confidence).toBeGreaterThan(0.9);
      }
    });
  });
  
  describe('Day of Week Patterns', () => {
    it('should recognize "every monday"', () => {
      const result = processRecurrencePattern('every monday');
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.freq).toBe(RRule.WEEKLY);
        expect(result.byweekday?.length).toBe(1);
        expect(result.byweekday?.[0]).toEqual(RRule.MO);
        expect(result.confidence).toBeGreaterThan(0.9);
      }
    });
    
    it('should recognize plural day forms like "mondays"', () => {
      const result = processRecurrencePattern('mondays');
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.freq).toBe(RRule.WEEKLY);
        expect(result.byweekday?.length).toBe(1);
        expect(result.byweekday?.[0]).toEqual(RRule.MO);
        expect(result.confidence).toBeGreaterThan(0.9);
      }
    });
    
    it('should recognize multiple days', () => {
      const result = processRecurrencePattern('mondays and fridays');
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.freq).toBe(RRule.WEEKLY);
        expect(result.byweekday?.length).toBe(2);
        // Sort to ensure consistent order for comparison
        const sortedDays = result.byweekday ? [...result.byweekday].sort() : [];
        expect(sortedDays[0]).toEqual(RRule.FR);
        expect(sortedDays[1]).toEqual(RRule.MO);
        expect(result.confidence).toBeGreaterThan(0.9);
      }
    });
    
    it('should recognize "every weekday"', () => {
      const result = processRecurrencePattern('every weekday');
      
      expect(result).not.toBeNull();
      if (result) {
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
      }
    });
    
    it('should recognize "every weekend"', () => {
      const result = processRecurrencePattern('every weekend');
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.freq).toBe(RRule.WEEKLY);
        expect(result.byweekday?.length).toBe(2);
        if (result.byweekday) {
          expect(result.byweekday).toContain(RRule.SA);
          expect(result.byweekday).toContain(RRule.SU);
        }
        expect(result.confidence).toBeGreaterThan(0.9);
      }
    });
  });

  // Add more specific test cases for each pattern type as needed
}); 