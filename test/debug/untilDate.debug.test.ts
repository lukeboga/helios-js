/**
 * Debug tests for the until date pattern handler
 */

import { untilDatePatternHandler } from '../../src/patterns/untilDate';
import { transformRecurrencePattern } from '../../src/transformer';
import { describe, it, expect } from 'vitest';

describe('Until Date Pattern Handler Debug', () => {
  it('standalone handler recognizes "until January 1st, 2023"', () => {
    const result = untilDatePatternHandler.apply('until January 1st, 2023');
    console.log('Result:', result);
    
    expect(result).not.toBeNull();
    if (result) {
      expect(result.options.until).toBeInstanceOf(Date);
    }
  });

  it('standalone handler recognizes "ending on December 31, 2022"', () => {
    const result = untilDatePatternHandler.apply('ending on December 31, 2022');
    console.log('Result:', result);
    
    expect(result).not.toBeNull();
    if (result) {
      expect(result.options.until).toBeInstanceOf(Date);
    }
  });

  it('standalone handler recognizes "until 12/31/2022"', () => {
    const result = untilDatePatternHandler.apply('until 12/31/2022');
    console.log('Result:', result);
    
    expect(result).not.toBeNull();
    if (result) {
      expect(result.options.until).toBeInstanceOf(Date);
    }
  });

  it('transforms "every monday until December 31, 2022"', () => {
    const result = transformRecurrencePattern('every monday until December 31, 2022');
    console.log('Result:', result);
    
    expect(result.freq).toBeDefined();
    expect(result.until).toBeInstanceOf(Date);
  });

  it('transforms "every 2 weeks on Monday until January 15, 2023"', () => {
    const result = transformRecurrencePattern('every 2 weeks on Monday until January 15, 2023');
    console.log('Result:', result);
    
    expect(result.freq).toBeDefined();
    expect(result.interval).toBe(2);
    expect(result.until).toBeInstanceOf(Date);
  });
}); 