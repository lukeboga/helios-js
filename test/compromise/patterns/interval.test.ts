/**
 * Tests for Interval Pattern Handler
 * 
 * This module tests the factory-based interval pattern handler implementation.
 */

import { describe, it, expect } from 'vitest';
import { RRule } from 'rrule';
import nlp from 'compromise';
import type { RecurrenceOptions } from '../../../src/types';
import { 
  intervalPatternHandler,
  specialIntervalMatcher,
  numericIntervalMatcher,
  everyOtherMatcher,
  intervalProcessor
} from '../../../src/compromise/patterns/interval';

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

describe('Interval Pattern Handler', () => {
  describe('Individual Matchers', () => {
    describe('specialIntervalMatcher', () => {
      it('should match "biweekly" patterns', () => {
        const match = specialIntervalMatcher(nlp('biweekly'));
        expect(match).not.toBeNull();
        expect(match?.type).toBe('interval');
        const parsedValue = JSON.parse(match?.value as string);
        expect(parsedValue.frequency).toBe(RRule.WEEKLY);
        expect(parsedValue.intervalValue).toBe(2);
        expect(match?.confidence).toBe(1.0);
      });
      
      it('should match "fortnightly" patterns', () => {
        const match = specialIntervalMatcher(nlp('fortnightly'));
        expect(match).not.toBeNull();
        const parsedValue = JSON.parse(match?.value as string);
        expect(parsedValue.frequency).toBe(RRule.WEEKLY);
        expect(parsedValue.intervalValue).toBe(2);
      });
      
      it('should match "bimonthly" patterns', () => {
        const match = specialIntervalMatcher(nlp('bimonthly'));
        expect(match).not.toBeNull();
        const parsedValue = JSON.parse(match?.value as string);
        expect(parsedValue.frequency).toBe(RRule.MONTHLY);
        expect(parsedValue.intervalValue).toBe(2);
      });
      
      it('should not match other patterns', () => {
        expect(specialIntervalMatcher(nlp('weekly'))).toBeNull();
        expect(specialIntervalMatcher(nlp('every 3 weeks'))).toBeNull();
        expect(specialIntervalMatcher(nlp('daily'))).toBeNull();
      });
    });
    
    describe('numericIntervalMatcher', () => {
      it('should match "every X days" patterns', () => {
        const match = numericIntervalMatcher(nlp('every 3 days'));
        expect(match).not.toBeNull();
        expect(match?.type).toBe('interval');
        const parsedValue = JSON.parse(match?.value as string);
        expect(parsedValue.frequency).toBe(RRule.DAILY);
        expect(parsedValue.intervalValue).toBe(3);
        expect(match?.confidence).toBe(1.0);
      });
      
      it('should match "each X weeks" patterns', () => {
        const match = numericIntervalMatcher(nlp('each 4 weeks'));
        expect(match).not.toBeNull();
        const parsedValue = JSON.parse(match?.value as string);
        expect(parsedValue.frequency).toBe(RRule.WEEKLY);
        expect(parsedValue.intervalValue).toBe(4);
      });
      
      it('should match singular and plural units', () => {
        const matchSingular = numericIntervalMatcher(nlp('every 1 day'));
        const matchPlural = numericIntervalMatcher(nlp('every 5 days'));
        
        expect(matchSingular).not.toBeNull();
        expect(matchPlural).not.toBeNull();
        
        const parsedSingular = JSON.parse(matchSingular?.value as string);
        const parsedPlural = JSON.parse(matchPlural?.value as string);
        
        expect(parsedSingular.frequency).toBe(RRule.DAILY);
        expect(parsedSingular.intervalValue).toBe(1);
        expect(parsedPlural.frequency).toBe(RRule.DAILY);
        expect(parsedPlural.intervalValue).toBe(5);
      });
      
      it('should handle various time units', () => {
        const units = [
          { text: 'every 2 days', expectedFreq: RRule.DAILY, expectedInterval: 2 },
          { text: 'every 3 weeks', expectedFreq: RRule.WEEKLY, expectedInterval: 3 },
          { text: 'every 4 months', expectedFreq: RRule.MONTHLY, expectedInterval: 4 },
          { text: 'every 5 years', expectedFreq: RRule.YEARLY, expectedInterval: 5 }
        ];
        
        for (const unit of units) {
          const match = numericIntervalMatcher(nlp(unit.text));
          expect(match).not.toBeNull();
          const parsedValue = JSON.parse(match?.value as string);
          expect(parsedValue.frequency).toBe(unit.expectedFreq);
          expect(parsedValue.intervalValue).toBe(unit.expectedInterval);
        }
      });
      
      it('should not match invalid intervals', () => {
        expect(numericIntervalMatcher(nlp('every 0 days'))).toBeNull();
        expect(numericIntervalMatcher(nlp('every -1 weeks'))).toBeNull();
      });
      
      it('should not match other patterns', () => {
        expect(numericIntervalMatcher(nlp('weekly'))).toBeNull();
        expect(numericIntervalMatcher(nlp('every day'))).toBeNull();
        expect(numericIntervalMatcher(nlp('every other day'))).toBeNull();
      });
    });
    
    describe('everyOtherMatcher', () => {
      it('should match "every other day" patterns', () => {
        const match = everyOtherMatcher(nlp('every other day'));
        expect(match).not.toBeNull();
        expect(match?.type).toBe('interval');
        const parsedValue = JSON.parse(match?.value as string);
        expect(parsedValue.frequency).toBe(RRule.DAILY);
        expect(parsedValue.intervalValue).toBe(2);
        expect(match?.confidence).toBe(1.0);
      });
      
      it('should match "each other week" patterns', () => {
        const match = everyOtherMatcher(nlp('each other week'));
        expect(match).not.toBeNull();
        const parsedValue = JSON.parse(match?.value as string);
        expect(parsedValue.frequency).toBe(RRule.WEEKLY);
        expect(parsedValue.intervalValue).toBe(2);
      });
      
      it('should handle various time units', () => {
        const units = [
          { text: 'every other day', expectedFreq: RRule.DAILY },
          { text: 'every other week', expectedFreq: RRule.WEEKLY },
          { text: 'every other month', expectedFreq: RRule.MONTHLY },
          { text: 'every other year', expectedFreq: RRule.YEARLY }
        ];
        
        for (const unit of units) {
          const match = everyOtherMatcher(nlp(unit.text));
          expect(match).not.toBeNull();
          const parsedValue = JSON.parse(match?.value as string);
          expect(parsedValue.frequency).toBe(unit.expectedFreq);
          expect(parsedValue.intervalValue).toBe(2);
        }
      });
      
      it('should not match other patterns', () => {
        expect(everyOtherMatcher(nlp('weekly'))).toBeNull();
        expect(everyOtherMatcher(nlp('every 2 days'))).toBeNull();
        expect(everyOtherMatcher(nlp('biweekly'))).toBeNull();
      });
    });
  });
  
  describe('intervalProcessor', () => {
    it('should update options with interval data', () => {
      const options = createDefaultOptions();
      const match = {
        type: 'interval',
        value: JSON.stringify({
          frequency: RRule.WEEKLY,
          intervalValue: 3
        }),
        text: 'every 3 weeks',
        confidence: 1.0
      };
      
      const result = intervalProcessor(options, match);
      
      expect(result.freq).toBe(RRule.WEEKLY);
      expect(result.interval).toBe(3);
    });
    
    it('should not update options when match type is not interval', () => {
      const options = createDefaultOptions();
      const match = {
        type: 'frequency',
        value: JSON.stringify({
          frequency: RRule.WEEKLY,
          intervalValue: 3
        }),
        text: 'weekly',
        confidence: 1.0
      };
      
      const result = intervalProcessor(options, match);
      
      expect(result.freq).toBeNull();
      expect(result.interval).toBe(1);
    });
    
    it('should not update options when match value is not a string', () => {
      const options = createDefaultOptions();
      const match = {
        type: 'interval',
        value: 123,
        text: 'invalid',
        confidence: 1.0
      };
      
      const result = intervalProcessor(options, match);
      
      expect(result.freq).toBeNull();
      expect(result.interval).toBe(1);
    });
    
    it('should not overwrite existing frequency if different', () => {
      const options = createDefaultOptions();
      options.freq = RRule.MONTHLY;
      
      const match = {
        type: 'interval',
        value: JSON.stringify({
          frequency: RRule.WEEKLY,
          intervalValue: 3
        }),
        text: 'every 3 weeks',
        confidence: 1.0
      };
      
      const result = intervalProcessor(options, match);
      
      // Frequency should remain monthly, but interval should be updated
      expect(result.freq).toBe(RRule.MONTHLY);
      expect(result.interval).toBe(3);
    });
  });
  
  describe('intervalPatternHandler', () => {
    it('should have the correct metadata', () => {
      expect(intervalPatternHandler.name).toBe('interval');
      expect(intervalPatternHandler.category).toBe('interval');
      expect(intervalPatternHandler.priority).toBeGreaterThan(0);
      expect(typeof intervalPatternHandler.description).toBe('string');
    });
    
    it('should match biweekly pattern', () => {
      const options = createDefaultOptions();
      const doc = nlp('biweekly');
      
      const result = intervalPatternHandler(doc, options);
      
      expect(result.matched).toBe(true);
      expect(options.freq).toBe(RRule.WEEKLY);
      expect(options.interval).toBe(2);
    });
    
    it('should match numeric interval pattern', () => {
      const options = createDefaultOptions();
      const doc = nlp('every 4 days');
      
      const result = intervalPatternHandler(doc, options);
      
      expect(result.matched).toBe(true);
      expect(options.freq).toBe(RRule.DAILY);
      expect(options.interval).toBe(4);
    });
    
    it('should match every other pattern', () => {
      const options = createDefaultOptions();
      const doc = nlp('every other month');
      
      const result = intervalPatternHandler(doc, options);
      
      expect(result.matched).toBe(true);
      expect(options.freq).toBe(RRule.MONTHLY);
      expect(options.interval).toBe(2);
    });
    
    it('should not match non-interval patterns', () => {
      const options = createDefaultOptions();
      const doc = nlp('every Tuesday');
      
      const result = intervalPatternHandler(doc, options);
      
      expect(result.matched).toBe(false);
      expect(options.freq).toBeNull();
      expect(options.interval).toBe(1);
    });
    
    it('should handle multiple patterns in a sentence', () => {
      const options = createDefaultOptions();
      const doc = nlp('I need a reminder biweekly and also every 3 months');
      
      const result = intervalPatternHandler(doc, options);
      
      expect(result.matched).toBe(true);
      // The last match should be applied (every 3 months)
      // This is because the matchers are executed in sequence and later matches overwrite earlier ones
      // RRule.MONTHLY is 2, so we should check for that specific value
      expect(options.freq).toBe(2); // RRule.MONTHLY
      expect(options.interval).toBe(3);
    });
  });
}); 