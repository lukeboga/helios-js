/**
 * CompromiseJS Types Module
 * 
 * This module defines TypeScript types for working with CompromiseJS.
 */

import nlp from 'compromise';

/**
 * Type for CompromiseJS document
 */
export type CompromiseDocument = ReturnType<typeof nlp>; 