/**
 * Processor Tests
 * 
 * This module tests the recurrence pattern processor with both factory-based
 * and legacy pattern handlers.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RRule } from 'rrule';
import { processRecurrencePattern, ProcessorMetrics } from '../src/processor';

describe('Pattern Processor', () => {
  describe('Basic Pattern Recognition', () => {
    it('should recognize daily frequency patterns', () => {
      const result = processRecurrencePattern('daily');
      expect(result).not.toBeNull();
      expect(result?.freq).toBe(RRule.DAILY);
      expect(result?.interval).toBe(1);
    });
    
    it('should recognize weekly frequency patterns', () => {
      const result = processRecurrencePattern('weekly');
      expect(result).not.toBeNull();
      expect(result?.freq).toBe(RRule.WEEKLY);
    });
    
    it('should recognize monthly frequency patterns', () => {
      const result = processRecurrencePattern('monthly');
      expect(result).not.toBeNull();
      expect(result?.freq).toBe(RRule.MONTHLY);
    });
    
    it('should recognize yearly frequency patterns', () => {
      const result = processRecurrencePattern('yearly');
      expect(result).not.toBeNull();
      expect(result?.freq).toBe(RRule.YEARLY);
    });
    
    it('should return null for unrecognized patterns', () => {
      const result = processRecurrencePattern('not a pattern');
      expect(result).toBeNull();
    });
    
    it('should handle empty input', () => {
      const result = processRecurrencePattern('');
      expect(result).toBeNull();
    });
  });
  
  describe('Caching', () => {
    it('should cache results by default', () => {
      // Process the same pattern twice
      const firstResult = processRecurrencePattern('daily');
      const secondResult = processRecurrencePattern('daily');
      
      // Verify they're the same object instance
      expect(firstResult).toBe(secondResult);
    });
    
    it('should not use cache when disabled', () => {
      // Process the same pattern twice with caching disabled
      const firstResult = processRecurrencePattern('daily', { useCache: false });
      const secondResult = processRecurrencePattern('daily', { useCache: false });
      
      // Verify they're different object instances
      expect(firstResult).not.toBe(secondResult);
      
      // But they should still have the same values
      expect(firstResult?.freq).toBe(secondResult?.freq);
    });
  });
  
  describe('Metrics Collection', () => {
    it('should collect metrics when enabled', () => {
      const result = processRecurrencePattern('every day', { collectMetrics: true });
      
      // Access metrics
      const metrics = (result as any)._metrics as ProcessorMetrics;
      
      // Verify metrics structure
      expect(metrics).toBeDefined();
      expect(metrics.totalTime).toBeGreaterThan(0);
      expect(metrics.handlerTimes.frequency).toBeGreaterThan(0);
      expect(metrics.matchedPatterns).toBeGreaterThan(0);
      expect(typeof metrics.usedSimplePattern).toBe('boolean');
    });
    
    it('should not collect metrics by default', () => {
      const result = processRecurrencePattern('weekly');
      expect((result as any)._metrics).toBeUndefined();
    });
  });
  
  describe('Simple Pattern Optimization', () => {
    it('should use simple pattern optimization for basic patterns', () => {
      const result = processRecurrencePattern('monthly', { collectMetrics: true });
      const metrics = (result as any)._metrics as ProcessorMetrics;
      
      // Simple patterns should bypass the full handler pipeline
      expect(metrics.usedSimplePattern).toBe(true);
    });
    
    it('should use full pattern processing for complex patterns', () => {
      const result = processRecurrencePattern('every 2 weeks on Monday', { collectMetrics: true });
      const metrics = (result as any)._metrics as ProcessorMetrics;
      
      // Complex patterns should use the full handler pipeline
      expect(metrics.usedSimplePattern).toBe(false);
    });
  });
  
  describe('Default Options', () => {
    it('should apply default options', () => {
      const defaults = {
        freq: RRule.MONTHLY,
        byweekday: [RRule.MO, RRule.WE, RRule.FR]
      };
      
      // Process a pattern that doesn't specify weekdays
      const result = processRecurrencePattern('weekly', { defaults });
      
      // The frequency should be from the pattern, not defaults
      expect(result?.freq).toBe(RRule.WEEKLY);
      
      // But weekdays should come from defaults
      expect(result?.byweekday).toEqual(defaults.byweekday);
    });
  });
  
  describe('Force Handlers', () => {
    it('should only apply forced handlers', () => {
      // Force only frequency handler
      const result = processRecurrencePattern('every 2 weeks on Monday', { 
        forceHandlers: ['frequency'],
        collectMetrics: true
      });
      
      // Should recognize frequency but not interval or day of week
      expect(result?.freq).toBe(RRule.WEEKLY);
      expect(result?.interval).toBe(1); // Default, not 2
      expect(result?.byweekday).toBeNull(); // Not set
      
      // Only frequency handler should be executed
      const metrics = (result as any)._metrics as ProcessorMetrics;
      expect(Object.keys(metrics.handlerTimes)).toEqual(['frequency']);
    });
  });
}); 