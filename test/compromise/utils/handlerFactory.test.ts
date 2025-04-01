/**
 * Unit tests for Pattern Handler Factory
 * 
 * Tests the functionality of the factory functions for creating standardized pattern handlers.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPatternHandler, createCompositeHandler } from '../../../src/compromise/utils/handlerFactory';
import type { 
  PatternMatch, 
  PatternMatcher, 
  PatternProcessor, 
  PatternHandler,
  PatternHandlerResult,
  RecurrenceOptions 
} from '../../../src/types';
import { RRule } from 'rrule';
import nlp from 'compromise';
import type { CompromiseDocument } from '../../../src/compromise/types';

describe('Pattern Handler Factory', () => {
  // Mock console.error to prevent console output during tests
  const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});
  
  // Reset mocks before each test
  beforeEach(() => {
    consoleErrorMock.mockClear();
  });
  
  describe('createPatternHandler', () => {
    it('should create a handler with proper metadata', () => {
      // Create simple mock matcher and processor
      const mockMatcher: PatternMatcher = () => null;
      const mockProcessor: PatternProcessor = (options) => options;
      
      // Create handler with factory
      const handler = createPatternHandler('test', [mockMatcher], mockProcessor);
      
      // Verify metadata is properly attached
      expect(handler.name).toBe('test');
      expect(handler.category).toBe('general'); // Default value
      expect(handler.priority).toBe(10); // Default value
      expect(handler.description).toBe('Recognizes test patterns');
      expect(typeof handler).toBe('function');
    });
    
    it('should use custom options when provided', () => {
      // Create simple mock matcher and processor
      const mockMatcher: PatternMatcher = () => null;
      const mockProcessor: PatternProcessor = (options) => options;
      
      // Create handler with custom options
      const handler = createPatternHandler('test', [mockMatcher], mockProcessor, {
        category: 'custom',
        priority: 20,
        description: 'Custom description'
      });
      
      // Verify custom options are used
      expect(handler.category).toBe('custom');
      expect(handler.priority).toBe(20);
      expect(handler.description).toBe('Custom description');
    });
    
    it('should throw error for invalid inputs', () => {
      // Create simple mock matcher and processor
      const mockMatcher: PatternMatcher = () => null;
      const mockProcessor: PatternProcessor = (options) => options;
      
      // Test error for empty name
      expect(() => createPatternHandler('', [mockMatcher], mockProcessor))
        .toThrow('Pattern handler name is required');
      
      // Test error for empty matchers array
      expect(() => createPatternHandler('test', [], mockProcessor))
        .toThrow('Pattern handler "test" requires at least one matcher function');
      
      // Test error for invalid processor
      expect(() => createPatternHandler('test', [mockMatcher], null as any))
        .toThrow('Pattern handler "test" requires a valid processor function');
    });
    
    it('should return no match when matcher returns null', () => {
      // Create matcher that returns null (no match)
      const mockMatcher: PatternMatcher = () => null;
      const mockProcessor: PatternProcessor = (options) => options;
      
      // Create handler
      const handler = createPatternHandler('test', [mockMatcher], mockProcessor);
      
      // Run handler with mock document
      const doc = nlp('test text');
      const options: RecurrenceOptions = {
        freq: null,
        interval: 1,
        byweekday: null,
        bymonthday: null,
        bymonth: null,
        until: null,
        confidence: 0
      };
      
      const result = handler(doc, options);
      
      // Verify no match result
      expect(result.matched).toBe(false);
      expect(result.confidence).toBe(0);
      expect(result.warnings).toEqual([]);
    });
    
    it('should return match when matcher returns a match', () => {
      // Create a matcher that returns a match
      const mockMatch: PatternMatch = {
        type: 'frequency',
        value: RRule.DAILY,
        text: 'daily',
        confidence: 0.9
      };
      
      const mockMatcher: PatternMatcher = () => mockMatch;
      const mockProcessor: PatternProcessor = (options) => {
        options.freq = RRule.DAILY;
        return options;
      };
      
      // Create handler
      const handler = createPatternHandler('frequency', [mockMatcher], mockProcessor);
      
      // Run handler with mock document
      const doc = nlp('daily');
      const options: RecurrenceOptions = {
        freq: null,
        interval: 1,
        byweekday: null,
        bymonthday: null,
        bymonth: null,
        until: null,
        confidence: 0
      };
      
      const result = handler(doc, options);
      
      // Verify match result
      expect(result.matched).toBe(true);
      expect(result.confidence).toBe(0.9);
      expect(options.freq).toBe(RRule.DAILY);
    });
    
    it('should handle warnings from matchers', () => {
      // Create a matcher that returns a match with warnings
      const mockMatch: PatternMatch = {
        type: 'frequency',
        value: RRule.DAILY,
        text: 'daily',
        confidence: 0.7,
        warnings: ['Ambiguous match']
      };
      
      const mockMatcher: PatternMatcher = () => mockMatch;
      const mockProcessor: PatternProcessor = (options) => options;
      
      // Create handler
      const handler = createPatternHandler('test', [mockMatcher], mockProcessor);
      
      // Run handler
      const doc = nlp('test text');
      const options: RecurrenceOptions = {
        freq: null,
        interval: 1,
        byweekday: null,
        bymonthday: null,
        bymonth: null,
        until: null,
        confidence: 0
      };
      
      const result = handler(doc, options);
      
      // Verify warnings are passed through
      expect(result.warnings).toContain('Ambiguous match');
    });
    
    it('should handle errors in matchers gracefully', () => {
      // Create a matcher that throws an error
      const errorMatcher: PatternMatcher = () => {
        throw new Error('Test error in matcher');
      };
      
      const mockProcessor: PatternProcessor = (options) => options;
      
      // Create handler
      const handler = createPatternHandler('test', [errorMatcher], mockProcessor);
      
      // Run handler
      const doc = nlp('test text');
      const options: RecurrenceOptions = {
        freq: null,
        interval: 1,
        byweekday: null,
        bymonthday: null,
        bymonth: null,
        until: null,
        confidence: 0
      };
      
      const result = handler(doc, options);
      
      // Verify error is handled
      expect(result.matched).toBe(false);
      expect(result.warnings).toContain('Error in matcher: Test error in matcher');
      expect(consoleErrorMock).toHaveBeenCalled();
    });
    
    it('should try multiple matchers until a match is found', () => {
      // Create matchers with different behaviors
      const noMatchMatcher: PatternMatcher = () => null;
      const matchMatcher: PatternMatcher = () => ({
        type: 'test',
        value: 'value',
        text: 'text',
        confidence: 0.8
      });
      
      const mockProcessor: PatternProcessor = (options) => options;
      
      // Create handler with multiple matchers
      const handler = createPatternHandler('test', [noMatchMatcher, matchMatcher], mockProcessor);
      
      // Run handler
      const doc = nlp('test text');
      const options: RecurrenceOptions = {
        freq: null,
        interval: 1,
        byweekday: null,
        bymonthday: null,
        bymonth: null,
        until: null,
        confidence: 0
      };
      
      const result = handler(doc, options);
      
      // Verify second matcher was used
      expect(result.matched).toBe(true);
      expect(result.confidence).toBe(0.8);
    });
  });
  
  describe('createCompositeHandler', () => {
    it('should create a composite handler with proper metadata', () => {
      // Create mock handlers
      const mockHandler1: PatternHandler = () => ({ matched: false, warnings: [] });
      const mockHandler2: PatternHandler = () => ({ matched: false, warnings: [] });
      
      // Create composite handler
      const compositeHandler = createCompositeHandler('composite', [mockHandler1, mockHandler2]);
      
      // Verify metadata
      expect(compositeHandler.name).toBe('composite');
      expect(compositeHandler.category).toBe('general');
      expect(compositeHandler.priority).toBe(10);
      expect(compositeHandler.description).toBe('Composite handler for composite patterns');
    });
    
    it('should throw error for invalid inputs', () => {
      // Create mock handler
      const mockHandler: PatternHandler = () => ({ matched: false, warnings: [] });
      
      // Test error for empty name
      expect(() => createCompositeHandler('', [mockHandler]))
        .toThrow('Composite handler name is required');
      
      // Test error for empty handlers array
      expect(() => createCompositeHandler('composite', []))
        .toThrow('Composite handler "composite" requires at least one pattern handler');
    });
    
    it('should combine results from multiple handlers', () => {
      // Create mock handlers
      const handler1: PatternHandler = () => ({ 
        matched: true, 
        confidence: 0.7,
        warnings: ['Warning from handler1'] 
      });
      
      const handler2: PatternHandler = () => ({ 
        matched: true, 
        confidence: 0.9,
        warnings: ['Warning from handler2'] 
      });
      
      // Create composite handler
      const compositeHandler = createCompositeHandler('composite', [handler1, handler2]);
      
      // Run composite handler
      const doc = nlp('test text');
      const options: RecurrenceOptions = {
        freq: null,
        interval: 1,
        byweekday: null,
        bymonthday: null,
        bymonth: null,
        until: null,
        confidence: 0
      };
      
      const result = compositeHandler(doc, options);
      
      // Verify combined results
      expect(result.matched).toBe(true);
      expect(result.confidence).toBe(0.9); // Should use the highest confidence
      expect(result.warnings).toContain('Warning from handler1');
      expect(result.warnings).toContain('Warning from handler2');
    });
    
    it('should handle errors in individual handlers gracefully', () => {
      // Create mock handlers, one that throws an error
      const handlerWithError: PatternHandler = () => {
        throw new Error('Test error in handler');
      };
      
      const normalHandler: PatternHandler = () => ({ 
        matched: true,
        confidence: 0.8,
        warnings: [] 
      });
      
      // Create composite handler
      const compositeHandler = createCompositeHandler('composite', [handlerWithError, normalHandler]);
      
      // Run composite handler
      const doc = nlp('test text');
      const options: RecurrenceOptions = {
        freq: null,
        interval: 1,
        byweekday: null,
        bymonthday: null,
        bymonth: null,
        until: null,
        confidence: 0
      };
      
      const result = compositeHandler(doc, options);
      
      // Verify error is handled and normal handler still works
      expect(result.matched).toBe(true);
      expect(result.warnings).toContain('Error in handler: Test error in handler');
      expect(consoleErrorMock).toHaveBeenCalled();
    });
  });
}); 