/**
 * Debug Test for Until Date Patterns
 * 
 * This test file focuses on the until date pattern handler to identify and fix issues.
 */

import { describe, expect, it } from 'vitest';
import { processRecurrencePattern } from '../../../src/processor';
import { RRule } from 'rrule';

describe('Until Date Pattern Handler - Debug Tests', () => {
  describe('Basic Until Patterns', () => {
    it('should recognize "until december"', () => {
      const result = processRecurrencePattern('until december');
      console.log('Pattern result:', result);
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.freq).toBe(RRule.DAILY);
        expect(result.until).toBeInstanceOf(Date);
        expect(result.until?.getMonth()).toBe(11); // December is month 11 (0-indexed)
      }
    });
    
    it('should recognize "daily until next month"', () => {
      const result = processRecurrencePattern('daily until next month');
      console.log('Pattern result:', result);
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.freq).toBe(RRule.DAILY);
        expect(result.until).toBeInstanceOf(Date);
        
        // Next month should be current month + 1
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        
        // Should be roughly the same month (allowing for month boundaries)
        expect(result.until?.getMonth()).toBe(nextMonth.getMonth());
      }
    });
    
    it('should parse specific date format "until 12/31/2023"', () => {
      const result = processRecurrencePattern('until 12/31/2023');
      console.log('Pattern result:', result);
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.freq).toBe(RRule.DAILY);
        expect(result.until).toBeInstanceOf(Date);
        expect(result.until?.getMonth()).toBe(11); // December
        expect(result.until?.getDate()).toBe(31);
        expect(result.until?.getFullYear()).toBe(2023);
      }
    });
  });
  
  describe('Combined With Other Patterns', () => {
    it('should combine frequency and until: "weekly until december"', () => {
      const result = processRecurrencePattern('weekly until december');
      console.log('Pattern result:', result);
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.freq).toBe(RRule.WEEKLY);
        expect(result.until).toBeInstanceOf(Date);
        expect(result.until?.getMonth()).toBe(11); // December
      }
    });
    
    it('should combine day of week and until: "every monday until december"', () => {
      const result = processRecurrencePattern('every monday until december');
      console.log('Pattern result:', result);
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.freq).toBe(RRule.WEEKLY);
        expect(result.byweekday).toContainEqual(RRule.MO);
        expect(result.until).toBeInstanceOf(Date);
        expect(result.until?.getMonth()).toBe(11); // December
      }
    });
  });
  
  describe('Alternative Phrases', () => {
    it('should recognize "ending on december 31st"', () => {
      const result = processRecurrencePattern('ending on december 31st');
      console.log('Pattern result:', result);
      
      expect(result).not.toBeNull();
      if (result) {
        // The frequency is monthly (1) due to recognition of the specific day
        expect(result.freq).toBe(RRule.MONTHLY);
        expect(result.until).toBeInstanceOf(Date);
        expect(result.until?.getMonth()).toBe(11); // December
        expect(result.until?.getDate()).toBe(31);
      }
    });
    
    it('should recognize "through the end of the year"', () => {
      const result = processRecurrencePattern('through the end of the year');
      console.log('Pattern result:', result);
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.freq).toBe(RRule.DAILY);
        expect(result.until).toBeInstanceOf(Date);
        
        // Should be December 31 of current year
        const endOfYear = new Date();
        endOfYear.setMonth(11); // December
        endOfYear.setDate(31);
        
        expect(result.until?.getMonth()).toBe(11);
        expect(result.until?.getDate()).toBe(31);
        expect(result.until?.getFullYear()).toBe(endOfYear.getFullYear());
      }
    });
  });
}); 