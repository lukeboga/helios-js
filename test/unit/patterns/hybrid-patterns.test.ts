import { describe, it, expect } from 'vitest';
import { RRule } from 'rrule';
import { transformRecurrencePattern } from '../../src/transformer';
import { splitPattern } from '../../src/patterns/splitter';

describe('Hybrid Pattern System', () => {
  // Helper function to compare dates (ignoring time)
  function isSameDate(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }
  
  describe('Pattern Splitter', () => {
    it('splits simple conjunctive patterns', () => {
      const result = splitPattern('every monday and friday');
      expect(result.patterns).toHaveLength(2);
      expect(result.patterns).toContain('every monday');
      expect(result.patterns).toContain('friday');
    });
    
    it('protects special phrases from splitting', () => {
      const result = splitPattern('first and last day of month');
      expect(result.patterns).toHaveLength(1);
      expect(result.patterns[0]).toBe('first and last day of month');
    });
    
    it('handles complex patterns with multiple conjunctions', () => {
      const result = splitPattern('every monday, wednesday and friday');
      expect(result.patterns).toHaveLength(3);
      expect(result.patterns).toContain('every monday');
      expect(result.patterns).toContain('wednesday');
      expect(result.patterns).toContain('friday');
    });
  });
  
  describe('Complex Pattern Transformation', () => {
    it('combines multiple day patterns', () => {
      const result = transformRecurrencePattern('every monday and friday');
      
      expect(result.freq).toBe(RRule.WEEKLY);
      expect(result.byweekday).toHaveLength(2);
      // Check that it contains both Monday (0) and Friday (4)
      expect(result.byweekday!.map(d => d.weekday)).toContain(0);
      expect(result.byweekday!.map(d => d.weekday)).toContain(4);
    });
    
    it('combines interval with day patterns', () => {
      const result = transformRecurrencePattern('every 2 weeks on monday');
      
      expect(result.freq).toBe(RRule.WEEKLY);
      expect(result.interval).toBe(2);
      expect(result.byweekday).toHaveLength(1);
      expect(result.byweekday![0].weekday).toBe(0); // Monday is 0
    });
    
    it('combines dates with other patterns', () => {
      const result = transformRecurrencePattern('every monday until December 31, 2022');
      
      expect(result.freq).toBe(RRule.WEEKLY);
      expect(result.byweekday).toHaveLength(1);
      expect(result.byweekday![0].weekday).toBe(0); // Monday is 0
      expect(result.until).toBeInstanceOf(Date);
      
      const expectedDate = new Date(2022, 11, 31);
      expect(isSameDate(result.until as Date, expectedDate)).toBe(true);
    });
    
    it('combines multiple day-of-month patterns', () => {
      const result = transformRecurrencePattern('1st and 15th of every month');
      
      expect(result.freq).toBe(RRule.MONTHLY);
      expect(result.bymonthday).toContain(1);
      expect(result.bymonthday).toContain(15);
    });
    
    it('combines day-of-week with day-of-month patterns', () => {
      const result = transformRecurrencePattern('every monday and the 15th of the month');
      
      // This one is tricky - what's the expected behavior?
      // The intent is likely "every Monday AND the 15th of each month"
      expect(result.freq).toBe(RRule.MONTHLY);
      expect(result.byweekday).toBeDefined();
      expect(result.bymonthday).toContain(15);
    });
  });
}); 