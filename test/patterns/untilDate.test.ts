import { untilDatePatternHandler } from '../../src/patterns/untilDate';
import { transformRecurrencePattern } from '../../src/transformer';
import { describe, it, expect } from 'vitest';
import { RRule } from 'rrule';

describe('Until Date Pattern Handler', () => {
  // Helper function to compare dates (ignoring time)
  function isSameDate(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  // Test the standalone pattern handler
  describe('apply function', () => {
    it('recognizes "until" date patterns', () => {
      // Test with "until [date]" pattern
      const result = untilDatePatternHandler.apply('until January 1st, 2023');
      
      expect(result).not.toBeNull();
      expect(result?.options.until).toBeInstanceOf(Date);
      
      const expectedDate = new Date(2023, 0, 1); // January is 0-indexed
      expect(isSameDate(result?.options.until as Date, expectedDate)).toBe(true);
    });

    it('recognizes "ending on" date patterns', () => {
      // Test with "ending on [date]" pattern
      const result = untilDatePatternHandler.apply('ending on December 31, 2022');
      
      expect(result).not.toBeNull();
      expect(result?.options.until).toBeInstanceOf(Date);
      
      const expectedDate = new Date(2022, 11, 31); // December is 11
      expect(isSameDate(result?.options.until as Date, expectedDate)).toBe(true);
    });

    it('recognizes formatted date patterns', () => {
      // Test with MM/DD/YYYY format
      const result = untilDatePatternHandler.apply('until 12/31/2022');
      
      expect(result).not.toBeNull();
      expect(result?.options.until).toBeInstanceOf(Date);
      
      const expectedDate = new Date(2022, 11, 31);
      expect(isSameDate(result?.options.until as Date, expectedDate)).toBe(true);
    });

    it('returns null for non-matching patterns', () => {
      // Test with non-matching pattern
      const result = untilDatePatternHandler.apply('every monday');
      
      expect(result).toBeNull();
    });

    it('returns null for invalid dates', () => {
      // Test with invalid date
      const result = untilDatePatternHandler.apply('until invalid date');
      
      expect(result).toBeNull();
    });
  });

  // Test integration with the transformer
  describe('integration with transformer', () => {
    it('transforms patterns with end dates', () => {
      const result = transformRecurrencePattern('every monday until December 31, 2022');
      
      expect(result.freq).toBe(RRule.WEEKLY);
      expect(result.until).toBeInstanceOf(Date);
      
      const expectedDate = new Date(2022, 11, 31);
      expect(isSameDate(result.until as Date, expectedDate)).toBe(true);
    });

    it('combines end dates with other pattern types', () => {
      // Test combined with other pattern types
      const result = transformRecurrencePattern('every 2 weeks on Monday until January 15, 2023');
      
      expect(result.freq).toBe(RRule.WEEKLY);
      expect(result.interval).toBe(2);
      expect(result.until).toBeInstanceOf(Date);
      
      const expectedDate = new Date(2023, 0, 15);
      expect(isSameDate(result.until as Date, expectedDate)).toBe(true);
    });
  });
});
