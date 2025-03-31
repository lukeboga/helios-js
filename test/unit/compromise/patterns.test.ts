/**
 * Comprehensive Test Suite for CompromiseJS Pattern Handlers
 * 
 * This file contains detailed tests for each pattern handler in the CompromiseJS
 * integration. The tests verify:
 * 1. Individual pattern recognition
 * 2. Different variations of the same pattern
 * 3. Edge cases and special formats
 * 4. Combinations of multiple patterns
 */

import { describe, expect, it } from 'vitest';
import { RRule } from 'rrule';
import { processRecurrencePattern } from '../../../src/processor';
import { createRRule } from '../../../src/index';

// Helper function to ensure no linting issues with date comparisons
function diffInDays(date1: Date, date2: Date): number {
  const diffInMilliseconds = date2.getTime() - date1.getTime();
  return diffInMilliseconds / (1000 * 60 * 60 * 24);
}

// Initialize an array with a set number of days
function initDaysArray(count: number): Date[] {
  const days: Date[] = [];
  const baseDate = new Date();
  
  for (let i = 0; i < count; i++) {
    const nextDate = new Date(baseDate);
    nextDate.setDate(baseDate.getDate() + i);
    days.push(nextDate);
  }
  
  return days;
}

describe('CompromiseJS Pattern Handlers - Comprehensive Tests', () => {
  // Helper functions for date manipulation
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Helper to get next month date
  const nextMonth = new Date(today);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  describe('Frequency Pattern Handler', () => {
    describe('Basic Frequencies', () => {
      it('should recognize "daily" pattern', () => {
        const result = processRecurrencePattern('daily');
        expect(result).not.toBeNull();
        if (result) {
          expect(result.freq).toBe(RRule.DAILY);
          expect(result.interval).toBe(1);
        }
      });

      it('should recognize "weekly" pattern', () => {
        const result = processRecurrencePattern('weekly');
        expect(result).not.toBeNull();
        if (result) {
          expect(result.freq).toBe(RRule.WEEKLY);
          expect(result.interval).toBe(1);
        }
      });

      it('should recognize "monthly" pattern', () => {
        const result = processRecurrencePattern('monthly');
        expect(result).not.toBeNull();
        if (result) {
          expect(result.freq).toBe(RRule.MONTHLY);
          expect(result.interval).toBe(1);
        }
      });

      it('should recognize "yearly" pattern', () => {
        const result = processRecurrencePattern('yearly');
        expect(result).not.toBeNull();
        if (result) {
          expect(result.freq).toBe(RRule.YEARLY);
          expect(result.interval).toBe(1);
        }
      });
    });

    describe('Frequency Variations', () => {
      it('should recognize "every day" as daily', () => {
        const result = processRecurrencePattern('every day');
        expect(result).not.toBeNull();
        if (result) {
          expect(result.freq).toBe(RRule.DAILY);
          expect(result.interval).toBe(1);
        }
      });

      it('should recognize "each week" as weekly', () => {
        const result = processRecurrencePattern('each week');
        expect(result).not.toBeNull();
        if (result) {
          expect(result.freq).toBe(RRule.WEEKLY);
          expect(result.interval).toBe(1);
        }
      });

      it('should recognize "every month" as monthly', () => {
        const result = processRecurrencePattern('every month');
        expect(result).not.toBeNull();
        if (result) {
          expect(result.freq).toBe(RRule.MONTHLY);
          expect(result.interval).toBe(1);
        }
      });

      it('should recognize "each year" as yearly', () => {
        const result = processRecurrencePattern('each year');
        expect(result).not.toBeNull();
        if (result) {
          expect(result.freq).toBe(RRule.YEARLY);
          expect(result.interval).toBe(1);
        }
      });
    });
  });

  describe('Interval Pattern Handler', () => {
    describe('Numeric Intervals', () => {
      it('should recognize "every 2 days"', () => {
        const result = processRecurrencePattern('every 2 days');
        expect(result).not.toBeNull();
        if (result) {
          expect(result.freq).toBe(RRule.DAILY);
          expect(result.interval).toBe(2);
        }
      });

      it('should recognize "every 3 weeks"', () => {
        const result = processRecurrencePattern('every 3 weeks');
        expect(result).not.toBeNull();
        if (result) {
          expect(result.freq).toBe(RRule.WEEKLY);
          expect(result.interval).toBe(3);
        }
      });

      it('should recognize "every 6 months"', () => {
        const result = processRecurrencePattern('every 6 months');
        expect(result).not.toBeNull();
        if (result) {
          expect(result.freq).toBe(RRule.MONTHLY);
          expect(result.interval).toBe(6);
        }
      });

      it('should recognize "every 2 years"', () => {
        const result = processRecurrencePattern('every 2 years');
        expect(result).not.toBeNull();
        if (result) {
          expect(result.freq).toBe(RRule.YEARLY);
          expect(result.interval).toBe(2);
        }
      });
    });

    describe('Textual Intervals', () => {
      it('should recognize "every other day" as interval 2', () => {
        const result = processRecurrencePattern('every other day');
        expect(result).not.toBeNull();
        if (result) {
          expect(result.freq).toBe(RRule.DAILY);
          expect(result.interval).toBe(2);
        }
      });

      it('should recognize "every other week" as interval 2', () => {
        const result = processRecurrencePattern('every other week');
        expect(result).not.toBeNull();
        if (result) {
          expect(result.freq).toBe(RRule.WEEKLY);
          expect(result.interval).toBe(2);
        }
      });

      it('should recognize "biweekly" as every 2 weeks', () => {
        const result = processRecurrencePattern('biweekly');
        expect(result).not.toBeNull();
        if (result) {
          expect(result.freq).toBe(RRule.WEEKLY);
          expect(result.interval).toBe(2);
        }
      });

      it('should recognize "fortnightly" as every 2 weeks', () => {
        const result = processRecurrencePattern('fortnightly');
        expect(result).not.toBeNull();
        if (result) {
          expect(result.freq).toBe(RRule.WEEKLY);
          expect(result.interval).toBe(2);
        }
      });

      it('should recognize "quarterly" as every 3 months', () => {
        const result = processRecurrencePattern('quarterly');
        expect(result).not.toBeNull();
        if (result) {
          expect(result.freq).toBe(RRule.MONTHLY);
          expect(result.interval).toBe(3);
        }
      });

      it('should recognize "semi-annually" as every 6 months', () => {
        const result = processRecurrencePattern('semi-annually');
        expect(result).not.toBeNull();
        if (result) {
          expect(result.freq).toBe(RRule.MONTHLY);
          expect(result.interval).toBe(6);
        }
      });
    });
  });

  describe('Day of Week Pattern Handler', () => {
    describe('Single Days', () => {
      it('should recognize "every Monday"', () => {
        const result = processRecurrencePattern('every Monday');
        expect(result).not.toBeNull();
        if (result) {
          expect(result.freq).toBe(RRule.WEEKLY);
          expect(result.byweekday).toContainEqual(RRule.MO);
        }
      });

      it('should recognize "Tuesdays"', () => {
        const result = processRecurrencePattern('Tuesdays');
        expect(result).not.toBeNull();
        if (result) {
          expect(result.freq).toBe(RRule.WEEKLY);
          expect(result.byweekday).toContainEqual(RRule.TU);
        }
      });

      it('should recognize "on Wednesdays"', () => {
        const result = processRecurrencePattern('on Wednesdays');
        expect(result).not.toBeNull();
        if (result) {
          expect(result.freq).toBe(RRule.WEEKLY);
          expect(result.byweekday).toContainEqual(RRule.WE);
        }
      });

      it('should recognize case-insensitive days like "friday"', () => {
        const result = processRecurrencePattern('friday');
        expect(result).not.toBeNull();
        if (result) {
          expect(result.freq).toBe(RRule.WEEKLY);
          expect(result.byweekday).toContainEqual(RRule.FR);
        }
      });
    });

    describe('Multiple Days', () => {
      it('should recognize "Monday and Wednesday"', () => {
        const result = processRecurrencePattern('Monday and Wednesday');
        expect(result).not.toBeNull();
        if (result) {
          expect(result.freq).toBe(RRule.WEEKLY);
          expect(result.byweekday).toContainEqual(RRule.MO);
          expect(result.byweekday).toContainEqual(RRule.WE);
          expect(result.byweekday?.length).toBe(2);
        }
      });

      it('should recognize "on Tuesday, Thursday and Friday"', () => {
        const result = processRecurrencePattern('on Tuesday, Thursday and Friday');
        expect(result).not.toBeNull();
        if (result) {
          expect(result.freq).toBe(RRule.WEEKLY);
          expect(result.byweekday).toContainEqual(RRule.TU);
          expect(result.byweekday).toContainEqual(RRule.TH);
          expect(result.byweekday).toContainEqual(RRule.FR);
          expect(result.byweekday?.length).toBe(3);
        }
      });

      it('should recognize "every weekday"', () => {
        const result = processRecurrencePattern('every weekday');
        expect(result).not.toBeNull();
        if (result) {
          expect(result.freq).toBe(RRule.WEEKLY);
          expect(result.byweekday).toContainEqual(RRule.MO);
          expect(result.byweekday).toContainEqual(RRule.TU);
          expect(result.byweekday).toContainEqual(RRule.WE);
          expect(result.byweekday).toContainEqual(RRule.TH);
          expect(result.byweekday).toContainEqual(RRule.FR);
          expect(result.byweekday?.length).toBe(5);
        }
      });

      it('should recognize "every weekend"', () => {
        const result = processRecurrencePattern('every weekend');
        expect(result).not.toBeNull();
        if (result) {
          expect(result.freq).toBe(RRule.WEEKLY);
          expect(result.byweekday).toContainEqual(RRule.SA);
          expect(result.byweekday).toContainEqual(RRule.SU);
          expect(result.byweekday?.length).toBe(2);
        }
      });
    });
  });

  describe('Day of Month Pattern Handler', () => {
    it('should recognize "1st of the month"', () => {
      const result = processRecurrencePattern('1st of the month');
      expect(result).not.toBeNull();
      if (result) {
        expect(result.freq).toBe(RRule.MONTHLY);
        expect(result.bymonthday).toContain(1);
      }
    });

    it('should recognize "on the 15th"', () => {
      const result = processRecurrencePattern('on the 15th');
      expect(result).not.toBeNull();
      if (result) {
        expect(result.freq).toBe(RRule.MONTHLY);
        expect(result.bymonthday).toContain(15);
      }
    });

    it('should recognize "every 30th day of the month"', () => {
      const result = processRecurrencePattern('every 30th day of the month');
      expect(result).not.toBeNull();
      if (result) {
        expect(result.freq).toBe(RRule.MONTHLY);
        expect(result.bymonthday).toContain(30);
      }
    });

    it('should recognize "last day of the month"', () => {
      const result = processRecurrencePattern('last day of the month');
      expect(result).not.toBeNull();
      if (result) {
        expect(result.freq).toBe(RRule.MONTHLY);
        expect(result.bymonthday).toContain(-1);
      }
    });

    it('should recognize multiple days of month', () => {
      const result = processRecurrencePattern('on the 5th and 20th of each month');
      expect(result).not.toBeNull();
      if (result) {
        expect(result.freq).toBe(RRule.MONTHLY);
        expect(result.bymonthday).toContain(5);
        expect(result.bymonthday).toContain(20);
        expect(result.bymonthday?.length).toBe(2);
      }
    });
  });

  describe('Until Date Pattern Handler', () => {
    it('should recognize "until December"', () => {
      const result = processRecurrencePattern('until December');
      expect(result).not.toBeNull();
      if (result) {
        expect(result.until).toBeInstanceOf(Date);
        // December should be month 11 (0-indexed)
        expect(result.until?.getMonth()).toBe(11);
      }
    });

    it('should recognize "until December 31st"', () => {
      const result = processRecurrencePattern('until December 31st');
      expect(result).not.toBeNull();
      if (result) {
        expect(result.until).toBeInstanceOf(Date);
        expect(result.until?.getMonth()).toBe(11);
        expect(result.until?.getDate()).toBe(31);
      }
    });

    it('should recognize "until next month"', () => {
      const result = processRecurrencePattern('until next month');
      expect(result).not.toBeNull();
      if (result) {
        expect(result.until).toBeInstanceOf(Date);
        // Should be approximately the current month + 1
        const expectedMonth = (today.getMonth() + 1) % 12;
        expect(result.until?.getMonth()).toBe(expectedMonth);
      }
    });

    it('should recognize full dates like "until January 15, 2024"', () => {
      const result = processRecurrencePattern('until January 15, 2024');
      expect(result).not.toBeNull();
      if (result) {
        expect(result.until).toBeInstanceOf(Date);
        expect(result.until?.getFullYear()).toBe(2024);
        expect(result.until?.getMonth()).toBe(0); // January is 0
        expect(result.until?.getDate()).toBe(15);
      }
    });
  });

  describe('Combined Patterns', () => {
    it('should combine day and frequency: "every Monday"', () => {
      const result = processRecurrencePattern('every Monday');
      expect(result).not.toBeNull();
      if (result) {
        expect(result.freq).toBe(RRule.WEEKLY);
        expect(result.byweekday).toContainEqual(RRule.MO);
        expect(result.interval).toBe(1);
      }
    });

    it('should combine interval and frequency: "every 2 weeks"', () => {
      const result = processRecurrencePattern('every 2 weeks');
      expect(result).not.toBeNull();
      if (result) {
        expect(result.freq).toBe(RRule.WEEKLY);
        expect(result.interval).toBe(2);
      }
    });

    it('should combine day and interval: "every other Monday"', () => {
      const result = processRecurrencePattern('every other Monday');
      expect(result).not.toBeNull();
      if (result) {
        expect(result.freq).toBe(RRule.WEEKLY);
        expect(result.interval).toBe(2);
        expect(result.byweekday).toContainEqual(RRule.MO);
      }
    });

    it('should combine until with day of week: "every Friday until December"', () => {
      const result = processRecurrencePattern('every Friday until December');
      expect(result).not.toBeNull();
      if (result) {
        expect(result.freq).toBe(RRule.WEEKLY);
        expect(result.byweekday).toContainEqual(RRule.FR);
        expect(result.until).toBeInstanceOf(Date);
        expect(result.until?.getMonth()).toBe(11);
      }
    });

    it('should combine multiple days with until: "Monday and Wednesday until next month"', () => {
      const result = processRecurrencePattern('Monday and Wednesday until next month');
      expect(result).not.toBeNull();
      if (result) {
        expect(result.freq).toBe(RRule.WEEKLY);
        expect(result.byweekday).toContainEqual(RRule.MO);
        expect(result.byweekday).toContainEqual(RRule.WE);
        expect(result.until).toBeInstanceOf(Date);
      }
    });

    it('should combine interval, day, and until: "every 2 weeks on Monday until December 31st"', () => {
      const result = processRecurrencePattern('every 2 weeks on Monday until December 31st');
      expect(result).not.toBeNull();
      if (result) {
        expect(result.freq).toBe(RRule.WEEKLY);
        expect(result.interval).toBe(2);
        expect(result.byweekday).toContainEqual(RRule.MO);
        expect(result.until).toBeInstanceOf(Date);
        expect(result.until?.getMonth()).toBe(11);
        expect(result.until?.getDate()).toBe(31);
      }
    });
  });

  describe('Complex Examples', () => {
    it('should handle "every Monday, Wednesday and Friday"', () => {
      const result = processRecurrencePattern('every Monday, Wednesday and Friday');
      expect(result).not.toBeNull();
      if (result) {
        expect(result.freq).toBe(RRule.WEEKLY);
        expect(result.byweekday).toContainEqual(RRule.MO);
        expect(result.byweekday).toContainEqual(RRule.WE);
        expect(result.byweekday).toContainEqual(RRule.FR);
        expect(result.byweekday?.length).toBe(3);
      }
    });

    it('should handle "every other week on Tuesday and Thursday until December 31st"', () => {
      const result = processRecurrencePattern('every other week on Tuesday and Thursday until December 31st');
      expect(result).not.toBeNull();
      if (result) {
        expect(result.freq).toBe(RRule.WEEKLY);
        expect(result.interval).toBe(2);
        expect(result.byweekday).toContainEqual(RRule.TU);
        expect(result.byweekday).toContainEqual(RRule.TH);
        expect(result.until).toBeInstanceOf(Date);
        expect(result.until?.getMonth()).toBe(11);
        expect(result.until?.getDate()).toBe(31);
      }
    });

    it('should handle "first Monday of every month"', () => {
      const result = processRecurrencePattern('first Monday of every month');
      expect(result).not.toBeNull();
      if (result) {
        expect(result.freq).toBe(RRule.MONTHLY);
        expect(result.byweekday).toContainEqual(RRule.MO);
        expect(result.bysetpos).toContain(1);
      }
    });

    it('should handle "weekdays until next month"', () => {
      const result = processRecurrencePattern('weekdays until next month');
      expect(result).not.toBeNull();
      if (result) {
        expect(result.freq).toBe(RRule.WEEKLY);
        expect(result.byweekday?.length).toBe(5);
        expect(result.until).toBeInstanceOf(Date);
      }
    });
  });

  describe('Using createRRule Function', () => {
    it('should create a valid RRule for "every Monday"', () => {
      const rule = createRRule(today, 'every Monday');
      expect(rule).not.toBeNull();
      
      if (rule) {
        // Get the next occurrence
        const nextDate = rule.after(today, false);
        expect(nextDate).not.toBeNull();
        
        if (nextDate) {
          // The next date should be a Monday
          expect(nextDate.getDay()).toBe(1); // Monday is 1
        }
      }
    });

    it('should create a valid RRule for "every other day"', () => {
      const rule = createRRule(today, 'every other day');
      expect(rule).not.toBeNull();
      
      if (rule) {
        // Get a few occurrences
        const dates = rule.all((date, i) => {
          if (i === undefined) return false;
          return i < 5;
        });
        
        // Make sure we have at least 2 dates to compare
        expect(dates.length).toBeGreaterThan(1);
        
        // Check pairs of dates to verify the 2-day interval
        if (dates.length >= 2) {
          // Check first pair using our helper function
          expect(diffInDays(dates[0], dates[1])).toBe(2);
        }
        
        if (dates.length >= 3) {
          // Check second pair using our helper function
          expect(diffInDays(dates[1], dates[2])).toBe(2);
        }
      }
    });

    it('should create a valid RRule with an end date', () => {
      // Create a rule that ends in one month
      const rule = createRRule(today, 'daily until next month');
      expect(rule).not.toBeNull();
      
      if (rule) {
        // Get all occurrences
        const dates = rule.all();
        
        // Check that none are past next month
        for (const date of dates) {
          expect(date.getTime()).toBeLessThanOrEqual(nextMonth.getTime());
        }
      }
    });
  });
}); 