/**
 * Test Suite for CompromiseJS Public API Integration
 * 
 * This file tests the public API functions (naturalLanguageToRRule, createRRule, validatePattern)
 * with the CompromiseJS integration to ensure they work correctly together.
 */

import { describe, expect, it } from 'vitest';
import { RRule } from 'rrule';
import { 
  naturalLanguageToRRule, 
  createRRule, 
  validatePattern, 
  suggestPatternCorrections 
} from '../../../src/index';

describe('CompromiseJS Public API Integration', () => {
  // Set up test dates
  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  
  describe('naturalLanguageToRRule Function', () => {
    it('should convert "daily" to correct RRule options', () => {
      const options = naturalLanguageToRRule(today, 'daily');
      expect(options).not.toBeNull();
      
      if (options) {
        expect(options.freq).toBe(RRule.DAILY);
        expect(options.dtstart).toEqual(today);
        expect(options.interval).toBe(1);
      }
    });
    
    it('should convert "every Monday" to correct RRule options', () => {
      const options = naturalLanguageToRRule(today, 'every Monday');
      expect(options).not.toBeNull();
      
      if (options) {
        expect(options.freq).toBe(RRule.WEEKLY);
        expect(options.dtstart).toEqual(today);
        expect(options.byweekday).toContainEqual(RRule.MO);
      }
    });
    
    it('should convert "every other week" to correct RRule options', () => {
      const options = naturalLanguageToRRule(today, 'every other week');
      expect(options).not.toBeNull();
      
      if (options) {
        expect(options.freq).toBe(RRule.WEEKLY);
        expect(options.interval).toBe(2);
      }
    });
    
    it('should convert "every month on the 15th" to correct RRule options', () => {
      const options = naturalLanguageToRRule(today, 'every month on the 15th');
      expect(options).not.toBeNull();
      
      if (options) {
        expect(options.freq).toBe(RRule.MONTHLY);
        expect(options.bymonthday).toContain(15);
      }
    });
    
    it('should convert patterns with end dates', () => {
      const options = naturalLanguageToRRule(today, 'daily until next month');
      expect(options).not.toBeNull();
      
      if (options) {
        expect(options.freq).toBe(RRule.DAILY);
        expect(options.until).toBeInstanceOf(Date);
      }
    });
    
    it('should return null for invalid patterns', () => {
      const options = naturalLanguageToRRule(today, 'not a valid pattern');
      expect(options).toBeNull();
    });
  });
  
  describe('createRRule Function', () => {
    it('should create an RRule instance from "daily"', () => {
      const rrule = createRRule(today, 'daily');
      expect(rrule).not.toBeNull();
      
      if (rrule) {
        // Get the next occurrence
        const nextDate = rrule.after(today, false);
        expect(nextDate).not.toBeNull();
        
        if (nextDate) {
          // Should be tomorrow
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          
          // Set hours to 0 for comparison
          tomorrow.setHours(0, 0, 0, 0);
          const nextDateAdjusted = new Date(nextDate);
          nextDateAdjusted.setHours(0, 0, 0, 0);
          
          expect(nextDateAdjusted.getDate()).toBe(tomorrow.getDate());
        }
      }
    });
    
    it('should create an RRule instance from "every Monday"', () => {
      const rrule = createRRule(today, 'every Monday');
      expect(rrule).not.toBeNull();
      
      if (rrule) {
        // Get the next occurrence
        const nextDate = rrule.after(today, false);
        expect(nextDate).not.toBeNull();
        
        if (nextDate) {
          // Should be a Monday
          expect(nextDate.getDay()).toBe(1); // Monday is 1
        }
      }
    });
    
    it('should create an RRule instance with bymonthday', () => {
      const rrule = createRRule(today, 'on the 15th of each month');
      expect(rrule).not.toBeNull();
      
      if (rrule) {
        // Get the next occurrence
        const nextDate = rrule.after(today, false);
        expect(nextDate).not.toBeNull();
        
        if (nextDate) {
          // Should be on the 15th
          expect(nextDate.getDate()).toBe(15);
        }
      }
    });
    
    it('should create an RRule instance with an end date', () => {
      const rrule = createRRule(today, 'daily until next month');
      expect(rrule).not.toBeNull();
      
      if (rrule) {
        // Get all occurrences
        const dates = rrule.all();
        
        // Check that there are occurrences
        expect(dates.length).toBeGreaterThan(0);
        
        // Check that none are past next month
        for (const date of dates) {
          expect(date.getTime()).toBeLessThanOrEqual(nextMonth.getTime());
        }
      }
    });
    
    it('should return null for invalid patterns', () => {
      const rrule = createRRule(today, 'not a valid pattern');
      expect(rrule).toBeNull();
    });
  });
  
  describe('validatePattern Function', () => {
    it('should validate correct patterns', () => {
      const result = validatePattern('every Monday');
      expect(result.valid).toBe(true);
      expect(result.confidence).toBeGreaterThan(0);
    });
    
    it('should invalidate incorrect patterns', () => {
      const result = validatePattern('not a valid pattern');
      expect(result.valid).toBe(false);
    });
    
    it('should validate patterns with complex combinations', () => {
      const result = validatePattern('every other Monday until December');
      expect(result.valid).toBe(true);
    });
    
    it('should return confidence scores for valid patterns', () => {
      const result1 = validatePattern('daily');
      const result2 = validatePattern('every Monday');
      
      expect(result1.confidence).toBeGreaterThan(0);
      expect(result2.confidence).toBeGreaterThan(0);
    });
  });
  
  describe('suggestPatternCorrections Function', () => {
    it('should suggest corrections for misspelled patterns', () => {
      const suggestions = suggestPatternCorrections('evry Monday');
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions).toContain('every Monday');
    });
    
    it('should return empty array for valid patterns', () => {
      const suggestions = suggestPatternCorrections('every Monday');
      expect(suggestions.length).toBe(0);
    });
    
    it('should return empty array for unrecognizable patterns', () => {
      const suggestions = suggestPatternCorrections('completely random text here');
      expect(suggestions.length).toBe(0);
    });
  });
  
  describe('Integration with RRule', () => {
    it('should generate next 3 occurrences of "every Monday"', () => {
      const rrule = createRRule(today, 'every Monday');
      expect(rrule).not.toBeNull();
      
      if (rrule) {
        // Get the next 3 occurrences
        const dates = rrule.all((date, i) => i < 3);
        
        // Check that we have 3 dates
        expect(dates.length).toBe(3);
        
        // Check that they're all Mondays
        for (const date of dates) {
          expect(date.getDay()).toBe(1); // Monday is 1
        }
      }
    });
    
    it('should generate occurrences for "every other day"', () => {
      const rrule = createRRule(today, 'every other day');
      expect(rrule).not.toBeNull();
      
      if (rrule) {
        // Get the next 5 occurrences
        const dates = rrule.all((date, i) => i < 5);
        
        // Check that we have 5 dates
        expect(dates.length).toBe(5);
        
        // Check that they're separated by 2 days
        for (let i = 1; i < dates.length; i++) {
          const diffInMilliseconds = dates[i].getTime() - dates[i-1].getTime();
          const diffInDays = diffInMilliseconds / (1000 * 60 * 60 * 24);
          expect(diffInDays).toBeCloseTo(2, 0); // Allow some floating point variation
        }
      }
    });
    
    it('should generate occurrences for "monthly on the 15th"', () => {
      const rrule = createRRule(today, 'monthly on the 15th');
      expect(rrule).not.toBeNull();
      
      if (rrule) {
        // Get the next 3 occurrences
        const dates = rrule.all((date, i) => i < 3);
        
        // Check that they're all on the 15th
        for (const date of dates) {
          expect(date.getDate()).toBe(15);
        }
        
        // Check that the months are sequential
        if (dates.length >= 2) {
          const monthDiff = (dates[1].getMonth() - dates[0].getMonth() + 12) % 12;
          expect(monthDiff).toBe(1);
        }
      }
    });
    
    it('should respect the until date in "daily until next week"', () => {
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const rrule = createRRule(today, 'daily until next week');
      expect(rrule).not.toBeNull();
      
      if (rrule) {
        // Get all occurrences
        const dates = rrule.all();
        
        // Check that none are past next week
        for (const date of dates) {
          // Allow a day of tolerance for time zone differences
          expect(date.getTime()).toBeLessThanOrEqual(nextWeek.getTime() + 24 * 60 * 60 * 1000);
        }
      }
    });
  });
}); 