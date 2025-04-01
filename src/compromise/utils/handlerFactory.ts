/**
 * Pattern Handler Factory
 * 
 * This module provides a factory function for creating standardized pattern handlers.
 * It implements the architecture outlined in the Pattern Handler Modernization Plan.
 */

import type { 
  PatternMatch, 
  PatternMatcher, 
  PatternProcessor, 
  PatternHandler,
  PatternHandlerResult,
  PatternHandlerMetadata,
  PatternMatcherConfig,
  RecurrenceOptions
} from '../../types';
import type { CompromiseDocument } from '../types';

/**
 * Default values for handler options
 */
const DEFAULT_HANDLER_OPTIONS = {
  category: 'general',
  priority: 10
};

/**
 * Creates a standardized pattern handler function that follows the factory pattern.
 * 
 * @param name - Unique identifier for the pattern handler
 * @param matchers - Array of matcher functions that identify patterns
 * @param processor - Processor function that updates options based on matches
 * @param options - Optional configuration for the handler
 * @returns A standardized pattern handler function
 */
export function createPatternHandler(
  name: string,
  matchers: PatternMatcher[],
  processor: PatternProcessor,
  options?: { category?: string, priority?: number, description?: string }
): PatternHandler & PatternHandlerMetadata {
  // Validate required inputs
  if (!name || name.trim() === '') {
    throw new Error('Pattern handler name is required');
  }
  
  if (!Array.isArray(matchers) || matchers.length === 0) {
    throw new Error(`Pattern handler "${name}" requires at least one matcher function`);
  }
  
  if (typeof processor !== 'function') {
    throw new Error(`Pattern handler "${name}" requires a valid processor function`);
  }
  
  // Merge with default options
  const handlerOptions = { ...DEFAULT_HANDLER_OPTIONS, ...options };
  
  // Create the handler function
  const handler: PatternHandler = (doc: CompromiseDocument, options: RecurrenceOptions): PatternHandlerResult => {
    // Initialize result with default values and ensure warnings array exists
    const result: PatternHandlerResult = {
      matched: false,
      confidence: 0,
      warnings: [] // Initialize with empty array to avoid undefined warnings
    };
    
    try {
      // Skip if document is empty or invalid
      if (!doc || typeof doc.text !== 'function') {
        result.warnings!.push('Invalid document provided to pattern handler');
        return result;
      }
      
      // Try each matcher in sequence
      for (const matcher of matchers) {
        try {
          const match = matcher(doc, {});
          
          // If we got a match, process it
          if (match) {
            // Process the match and update options
            const updatedOptions = processor(options, match);
            
            // Apply the updates to the original options object
            Object.assign(options, updatedOptions);
            
            // Mark as matched
            result.matched = true;
            
            // Update confidence with the highest value from any match
            if (match.confidence > (result.confidence || 0)) {
              result.confidence = match.confidence;
            }
            
            // Add any warnings from the match
            if (match.warnings && match.warnings.length > 0) {
              if (!result.warnings) result.warnings = [];
              result.warnings.push(...match.warnings);
            }
          }
        } catch (error) {
          // Catch errors in individual matchers to prevent the whole handler from failing
          if (!result.warnings) result.warnings = [];
          result.warnings.push(`Error in matcher: ${error instanceof Error ? error.message : String(error)}`);
          console.error(`Error in matcher for pattern handler "${name}":`, error);
        }
      }
      
      // If no match was found, return an empty result
      return result;
    } catch (error) {
      // Log the error for debugging
      console.error(`Error in pattern handler "${name}":`, error);
      
      // Add error message to warnings
      if (!result.warnings) result.warnings = [];
      result.warnings.push(`Pattern handler error: ${error instanceof Error ? error.message : String(error)}`);
      
      // Return a "no match" result
      return result;
    }
  };
  
  // Attach metadata to the handler function
  const handlerWithMetadata = Object.assign(handler, {
    name,
    category: handlerOptions.category,
    priority: handlerOptions.priority,
    description: handlerOptions.description || `Recognizes ${name} patterns`
  });
  
  return handlerWithMetadata;
}

/**
 * Creates a composite pattern handler that combines multiple handlers.
 * 
 * @param name - Unique identifier for the composite handler
 * @param handlers - Array of handlers to combine
 * @param options - Optional configuration for the composite handler
 * @returns A pattern handler that applies all specified handlers
 */
export function createCompositeHandler(
  name: string,
  handlers: PatternHandler[],
  options?: { category?: string, priority?: number, description?: string }
): PatternHandler & PatternHandlerMetadata {
  // Validate required inputs
  if (!name || name.trim() === '') {
    throw new Error('Composite handler name is required');
  }
  
  if (!Array.isArray(handlers) || handlers.length === 0) {
    throw new Error(`Composite handler "${name}" requires at least one pattern handler`);
  }
  
  // Merge with default options
  const handlerOptions = { ...DEFAULT_HANDLER_OPTIONS, ...options };
  
  // Create the composite handler function
  const compositeHandler: PatternHandler = (doc: CompromiseDocument, options: RecurrenceOptions): PatternHandlerResult => {
    // Initialize result with warnings array
    const result: PatternHandlerResult = {
      matched: false,
      confidence: 0,
      warnings: [] // Initialize with empty array to avoid undefined warnings
    };
    
    try {
      // Apply each handler in sequence
      for (const handler of handlers) {
        try {
          const handlerResult = handler(doc, options);
          
          // If this handler matched something, update our result
          if (handlerResult.matched) {
            result.matched = true;
            
            // Track the highest confidence level
            if (handlerResult.confidence && handlerResult.confidence > (result.confidence || 0)) {
              result.confidence = handlerResult.confidence;
            }
            
            // Collect warnings
            if (handlerResult.warnings && handlerResult.warnings.length > 0) {
              if (!result.warnings) result.warnings = [];
              result.warnings.push(...handlerResult.warnings);
            }
          }
        } catch (error) {
          // Catch errors in individual handlers
          if (!result.warnings) result.warnings = [];
          result.warnings.push(`Error in handler: ${error instanceof Error ? error.message : String(error)}`);
          console.error(`Error in handler for composite handler "${name}":`, error);
        }
      }
      
      return result;
    } catch (error) {
      // Log the error for debugging
      console.error(`Error in composite handler "${name}":`, error);
      
      // Add error message to warnings
      if (!result.warnings) result.warnings = [];
      result.warnings.push(`Composite handler error: ${error instanceof Error ? error.message : String(error)}`);
      
      // Return a "no match" result
      return result;
    }
  };
  
  // Attach metadata to the handler function
  const handlerWithMetadata = Object.assign(compositeHandler, {
    name,
    category: handlerOptions.category,
    priority: handlerOptions.priority,
    description: handlerOptions.description || `Composite handler for ${name} patterns`
  });
  
  return handlerWithMetadata;
} 