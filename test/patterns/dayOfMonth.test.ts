import { RRule } from 'rrule';
import { dayOfMonthPatternHandler } from '../../src/patterns/dayOfMonth';
import { transformRecurrencePattern } from '../../src/transformer';
import { describe, it, expect } from '@jest/globals';

describe('Day of Month Pattern Handler', () => {
  // Test the standalone pattern handler
  describe('apply function', () => {
    it('recognizes numeric day of month patterns', () => {
      // Test with numeric day patterns
      const result = dayOfMonthPatternHandler.apply('1st of every month');
      
      expect(result).not.toBeNull();
      expect(result?.options.freq).toBe(RRule.MONTHLY);
      expect(result?.options.bymonthday).toEqual([1]);
    });

    it('recognizes word-form day of month patterns', () => {
      // Test with word-form day patterns
      const result = dayOfMonthPatternHandler.apply('first of the month');
      
      expect(result).not.toBeNull();
      expect(result?.options.freq).toBe(RRule.MONTHLY);
      expect(result?.options.bymonthday).toEqual([1]);
    });

    it('recognizes "on the X" patterns', () => {
      // Test the "on the X" pattern
      const result = dayOfMonthPatternHandler.apply('on the 15th');
      
      expect(result).not.toBeNull();
      expect(result?.options.freq).toBe(RRule.MONTHLY);
      expect(result?.options.bymonthday).toEqual([15]);
    });

    it('recognizes multiple day of month patterns', () => {
      // Test with multiple days (though this might be split by the splitter in real usage)
      const result = dayOfMonthPatternHandler.apply('1st and 15th of every month');
      
      expect(result).not.toBeNull();
      expect(result?.options.freq).toBe(RRule.MONTHLY);
      expect(result?.options.bymonthday).toContain(1);
      expect(result?.options.bymonthday).toContain(15);
    });

    it('returns null for non-matching patterns', () => {
      // Test with non-matching pattern
      const result = dayOfMonthPatternHandler.apply('every monday');
      
      expect(result).toBeNull();
    });
  });

  // Test integration with the transformer
  describe('integration with transformer', () => {
    it('transforms simple day of month patterns', () => {
      const result = transformRecurrencePattern('15th of every month');
      
      expect(result.freq).toBe(RRule.MONTHLY);
      expect(result.bymonthday).toEqual([15]);
    });

    it('transforms combined patterns', () => {
      // This tests that the days combine properly when split by the splitter
      const result = transformRecurrencePattern('1st and 15th of every month');
      
      expect(result.freq).toBe(RRule.MONTHLY);
      expect(result.bymonthday).toContain(1);
      expect(result.bymonthday).toContain(15);
    });
  });
});
