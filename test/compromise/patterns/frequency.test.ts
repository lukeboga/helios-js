/**
 * Tests for Frequency Pattern Handler
 * 
 * This module tests the factory-based frequency pattern handler implementation.
 */

import { describe, it, expect } from 'vitest';
import { RRule } from 'rrule';
import nlp from 'compromise';
import type { RecurrenceOptions } from '../../../src/types';
import { 
  frequencyPatternHandler,
  dailyMatcher,
  weeklyMatcher,
  monthlyMatcher,
  yearlyMatcher,
  frequencyProcessor
} from '../../../src/compromise/patterns/frequency';

// Helper function to create default options
const createDefaultOptions = (): RecurrenceOptions => ({
  freq: null,
  interval: 1,
  byweekday: null,
  bymonthday: null,
  bymonth: null,
  until: null,
  confidence: 0
});

describe('Frequency Pattern Handler', () => {
  describe('Individual Matchers', () => {
    describe('dailyMatcher', () => {
      it('should match "daily" patterns', () => {
        const match = dailyMatcher(nlp('daily'));
        expect(match).not.toBeNull();
        expect(match?.type).toBe('frequency');
        expect(match?.value).toBe(RRule.DAILY);
        expect(match?.confidence).toBe(1.0);
      });
      
      it('should match "every day" patterns', () => {
        const match = dailyMatcher(nlp('every day'));
        expect(match).not.toBeNull();
        expect(match?.value).toBe(RRule.DAILY);
      });
      
      it('should match "each day" patterns', () => {
        const match = dailyMatcher(nlp('each day'));
        expect(match).not.toBeNull();
        expect(match?.value).toBe(RRule.DAILY);
      });
      
      it('should not match other frequency patterns', () => {
        expect(dailyMatcher(nlp('weekly'))).toBeNull();
        expect(dailyMatcher(nlp('monthly'))).toBeNull();
        expect(dailyMatcher(nlp('yearly'))).toBeNull();
        expect(dailyMatcher(nlp('every week'))).toBeNull();
      });
    });
    
    describe('weeklyMatcher', () => {
      it('should match "weekly" patterns', () => {
        const match = weeklyMatcher(nlp('weekly'));
        expect(match).not.toBeNull();
        expect(match?.type).toBe('frequency');
        expect(match?.value).toBe(RRule.WEEKLY);
        expect(match?.confidence).toBe(1.0);
      });
      
      it('should match "every week" patterns', () => {
        const match = weeklyMatcher(nlp('every week'));
        expect(match).not.toBeNull();
        expect(match?.value).toBe(RRule.WEEKLY);
      });
      
      it('should match "each week" patterns', () => {
        const match = weeklyMatcher(nlp('each week'));
        expect(match).not.toBeNull();
        expect(match?.value).toBe(RRule.WEEKLY);
      });
      
      it('should not match other frequency patterns', () => {
        expect(weeklyMatcher(nlp('daily'))).toBeNull();
        expect(weeklyMatcher(nlp('monthly'))).toBeNull();
        expect(weeklyMatcher(nlp('yearly'))).toBeNull();
        expect(weeklyMatcher(nlp('every day'))).toBeNull();
      });
    });
    
    describe('monthlyMatcher', () => {
      it('should match "monthly" patterns', () => {
        const match = monthlyMatcher(nlp('monthly'));
        expect(match).not.toBeNull();
        expect(match?.type).toBe('frequency');
        expect(match?.value).toBe(RRule.MONTHLY);
        expect(match?.confidence).toBe(1.0);
      });
      
      it('should match "every month" patterns', () => {
        const match = monthlyMatcher(nlp('every month'));
        expect(match).not.toBeNull();
        expect(match?.value).toBe(RRule.MONTHLY);
      });
      
      it('should match "each month" patterns', () => {
        const match = monthlyMatcher(nlp('each month'));
        expect(match).not.toBeNull();
        expect(match?.value).toBe(RRule.MONTHLY);
      });
      
      it('should not match other frequency patterns', () => {
        expect(monthlyMatcher(nlp('daily'))).toBeNull();
        expect(monthlyMatcher(nlp('weekly'))).toBeNull();
        expect(monthlyMatcher(nlp('yearly'))).toBeNull();
        expect(monthlyMatcher(nlp('every week'))).toBeNull();
      });
    });
    
    describe('yearlyMatcher', () => {
      it('should match "yearly" patterns', () => {
        const match = yearlyMatcher(nlp('yearly'));
        expect(match).not.toBeNull();
        expect(match?.type).toBe('frequency');
        expect(match?.value).toBe(RRule.YEARLY);
        expect(match?.confidence).toBe(1.0);
      });
      
      it('should match "annually" patterns', () => {
        const match = yearlyMatcher(nlp('annually'));
        expect(match).not.toBeNull();
        expect(match?.value).toBe(RRule.YEARLY);
      });
      
      it('should match "every year" patterns', () => {
        const match = yearlyMatcher(nlp('every year'));
        expect(match).not.toBeNull();
        expect(match?.value).toBe(RRule.YEARLY);
      });
      
      it('should match "each year" patterns', () => {
        const match = yearlyMatcher(nlp('each year'));
        expect(match).not.toBeNull();
        expect(match?.value).toBe(RRule.YEARLY);
      });
      
      it('should not match other frequency patterns', () => {
        expect(yearlyMatcher(nlp('daily'))).toBeNull();
        expect(yearlyMatcher(nlp('weekly'))).toBeNull();
        expect(yearlyMatcher(nlp('monthly'))).toBeNull();
        expect(yearlyMatcher(nlp('every day'))).toBeNull();
      });
    });
  });
  
  describe('frequencyProcessor', () => {
    it('should update options with frequency value', () => {
      const options = createDefaultOptions();
      const match = {
        type: 'frequency',
        value: RRule.DAILY,
        text: 'daily',
        confidence: 1.0
      };
      
      const result = frequencyProcessor(options, match);
      
      expect(result.freq).toBe(RRule.DAILY);
    });
    
    it('should not update options when match type is not frequency', () => {
      const options = createDefaultOptions();
      const match = {
        type: 'interval',
        value: 2,
        text: 'every 2 days',
        confidence: 1.0
      };
      
      const result = frequencyProcessor(options, match);
      
      expect(result.freq).toBeNull();
    });
    
    it('should not update options when value is not a number', () => {
      const options = createDefaultOptions();
      const match = {
        type: 'frequency',
        value: 'not-a-number',
        text: 'invalid',
        confidence: 1.0
      };
      
      const result = frequencyProcessor(options, match);
      
      expect(result.freq).toBeNull();
    });
  });
  
  describe('frequencyPatternHandler', () => {
    it('should have the correct metadata', () => {
      expect(frequencyPatternHandler.name).toBe('frequency');
      expect(frequencyPatternHandler.category).toBe('frequency');
      expect(frequencyPatternHandler.priority).toBeGreaterThan(0);
      expect(typeof frequencyPatternHandler.description).toBe('string');
    });
    
    it('should match daily pattern', () => {
      const options = createDefaultOptions();
      const doc = nlp('daily');
      
      const result = frequencyPatternHandler(doc, options);
      
      expect(result.matched).toBe(true);
      expect(options.freq).toBe(RRule.DAILY);
    });
    
    it('should match weekly pattern', () => {
      const options = createDefaultOptions();
      const doc = nlp('every week');
      
      const result = frequencyPatternHandler(doc, options);
      
      expect(result.matched).toBe(true);
      expect(options.freq).toBe(RRule.WEEKLY);
    });
    
    it('should match monthly pattern', () => {
      const options = createDefaultOptions();
      const doc = nlp('monthly');
      
      const result = frequencyPatternHandler(doc, options);
      
      expect(result.matched).toBe(true);
      expect(options.freq).toBe(RRule.MONTHLY);
    });
    
    it('should match yearly pattern', () => {
      const options = createDefaultOptions();
      const doc = nlp('annually');
      
      const result = frequencyPatternHandler(doc, options);
      
      expect(result.matched).toBe(true);
      expect(options.freq).toBe(RRule.YEARLY);
    });
    
    it('should not match non-frequency patterns', () => {
      const options = createDefaultOptions();
      const doc = nlp('every other day');
      
      const result = frequencyPatternHandler(doc, options);
      
      expect(result.matched).toBe(false);
      expect(options.freq).toBeNull();
    });
    
    it('should handle multiple patterns in a sentence', () => {
      const options = createDefaultOptions();
      const doc = nlp('I need to do this weekly and check every day');
      
      const result = frequencyPatternHandler(doc, options);
      
      expect(result.matched).toBe(true);
      // The first match should be applied (weekly)
      expect(options.freq).toBe(RRule.WEEKLY);
    });
  });
}); 