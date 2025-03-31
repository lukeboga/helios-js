/**
 * Debug Test for Day of Month Patterns
 * 
 * This test file focuses on the day of month pattern handler to identify and fix issues.
 */

import { describe, expect, it } from 'vitest';
import { processRecurrencePattern } from '../../../src/processor';
import { RRule } from 'rrule';

describe('Day of Month Pattern Handler - Debug Tests', () => {
  describe('Basic Day of Month Patterns', () => {
    it('should recognize "15th of every month"', () => {
      const result = processRecurrencePattern('15th of every month');
      console.log('Pattern result:', result);
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.freq).toBe(RRule.MONTHLY);
        expect(result.bymonthday).toContain(15);
      }
    });
    
    it('should recognize "1st of the month"', () => {
      const result = processRecurrencePattern('1st of the month');
      console.log('Pattern result:', result);
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.freq).toBe(RRule.MONTHLY);
        expect(result.bymonthday).toContain(1);
      }
    });
    
    it('should recognize "on the 5th and 20th of each month"', () => {
      const result = processRecurrencePattern('on the 5th and 20th of each month');
      console.log('Pattern result:', result);
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.freq).toBe(RRule.MONTHLY);
        expect(result.bymonthday).toContain(5);
        expect(result.bymonthday).toContain(20);
      }
    });
  });
  
  describe('Combined With Other Patterns', () => {
    it('should combine day of month with until: "15th of every month until December"', () => {
      const result = processRecurrencePattern('15th of every month until December');
      console.log('Pattern result:', result);
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.freq).toBe(RRule.MONTHLY);
        expect(result.bymonthday).toContain(15);
        expect(result.until).toBeInstanceOf(Date);
        expect(result.until?.getMonth()).toBe(11); // December
      }
    });
    
    it('should combine day of month with interval: "5th of every other month"', () => {
      const result = processRecurrencePattern('5th of every other month');
      console.log('Pattern result:', result);
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.freq).toBe(RRule.MONTHLY);
        expect(result.interval).toBe(2);
        expect(result.bymonthday).toContain(5);
      }
    });
  });
  
  describe('Ordinal Position in Month', () => {
    it('should recognize "first Monday of each month"', () => {
      const result = processRecurrencePattern('first Monday of each month');
      console.log('Pattern result:', result);
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.freq).toBe(RRule.MONTHLY);
        expect(result.byweekday).toContainEqual(RRule.MO);
        expect(result.bysetpos).toContain(1);
      }
    });
    
    it('should recognize "last Friday of every month"', () => {
      const result = processRecurrencePattern('last Friday of every month');
      console.log('Pattern result:', result);
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.freq).toBe(RRule.MONTHLY);
        expect(result.byweekday).toContainEqual(RRule.FR);
        expect(result.bysetpos).toContain(-1);
      }
    });
  });
}); 