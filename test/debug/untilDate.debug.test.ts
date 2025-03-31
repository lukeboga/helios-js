/**
 * Debug tests for the until date pattern handling
 */

import { processRecurrencePattern } from '../../src/processor';
import { describe, it, expect } from 'vitest';

describe('Until Date Pattern Debug', () => {
  it('processes "until January 1st, 2023"', () => {
    const result = processRecurrencePattern('until January 1st, 2023');
    console.log('Result:', result);
    
    expect(result).not.toBeNull();
    if (result) {
      expect(result.until).toBeInstanceOf(Date);
    }
  });

  it('processes "ending on December 31, 2022"', () => {
    const result = processRecurrencePattern('ending on December 31, 2022');
    console.log('Result:', result);
    
    expect(result).not.toBeNull();
    if (result) {
      expect(result.until).toBeInstanceOf(Date);
    }
  });

  it('processes "until 12/31/2022"', () => {
    const result = processRecurrencePattern('until 12/31/2022');
    console.log('Result:', result);
    
    expect(result).not.toBeNull();
    if (result) {
      expect(result.until).toBeInstanceOf(Date);
    }
  });

  it('processes "every monday until December 31, 2022"', () => {
    const result = processRecurrencePattern('every monday until December 31, 2022');
    console.log('Result:', result);
    
    expect(result).not.toBeNull();
    if (result) {
      expect(result.freq).toBeDefined();
      expect(result.until).toBeInstanceOf(Date);
    }
  });

  it('processes "every 2 weeks on Monday until January 15, 2023"', () => {
    const result = processRecurrencePattern('every 2 weeks on Monday until January 15, 2023');
    console.log('Result:', result);
    
    expect(result).not.toBeNull();
    if (result) {
      expect(result.freq).toBeDefined();
      expect(result.interval).toBe(2);
      expect(result.until).toBeInstanceOf(Date);
    }
  });
}); 