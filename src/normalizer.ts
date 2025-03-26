/**
 * Normalizer Module
 * 
 * This module handles preprocessing of natural language input text
 * to standardize it for pattern matching. It applies various text
 * transformations to make pattern recognition more consistent and
 * handle common variations in how users might express recurrence patterns.
 * 
 * The normalizer is the first step in the transformation pipeline,
 * ensuring that downstream pattern recognition has clean, consistent input.
 */

/**
 * Normalizes a natural language recurrence pattern for more consistent pattern matching.
 * 
 * This function applies several transformations to make the input more consistent:
 * 1. Converts text to lowercase for case-insensitive matching
 * 2. Normalizes whitespace (converts multiple spaces to single spaces)
 * 3. Trims leading and trailing whitespace
 * 4. Removes ordinal suffixes from numbers (e.g., "1st" becomes "1")
 * 
 * @param {string} input - The raw natural language recurrence pattern
 * @returns {string} Normalized text ready for pattern matching
 * 
 * @example
 * normalizeInput("Every 2nd Week on Monday")
 * // returns "every 2 week on monday"
 * 
 * @example
 * normalizeInput("  monthly  on the 1st  ")
 * // returns "monthly on the 1"
 */
export function normalizeInput(input: string): string {
  return input
    .toLowerCase()                          // Convert to lowercase
    .replace(/\s+/g, ' ')                   // Normalize whitespace
    .trim()                                 // Remove leading/trailing whitespace
    .replace(/(\d+)(st|nd|rd|th)/g, '$1');  // Remove ordinal suffixes (1st -> 1)
}

/**
 * Splits a normalized input string into potential pattern segments.
 * 
 * This is a helper function that can be used to break down complex
 * recurrence patterns into smaller parts for more focused analysis.
 * 
 * @param {string} input - The normalized input string
 * @returns {string[]} Array of pattern segments
 * 
 * @example
 * splitPatternSegments("every 2 weeks on monday and wednesday")
 * // returns ["every 2 weeks", "on monday and wednesday"]
 */
export function splitPatternSegments(input: string): string[] {
  // Common delimiters in recurrence patterns
  const delimiters = [' on ', ' starting ', ' until ', ' from '];

  let segments: string[] = [input];

  // Split by each delimiter while preserving the delimiter with the second segment
  delimiters.forEach(delimiter => {
    const newSegments: string[] = [];

    segments.forEach(segment => {
      const parts = segment.split(new RegExp(`(${delimiter})`, 'i'));

      if (parts.length > 1) {
        // Add first part as a segment
        newSegments.push(parts[0]);

        // Join the rest with the delimiter
        newSegments.push(
          parts.slice(1).join('')
        );
      } else {
        newSegments.push(segment);
      }
    });

    segments = newSegments;
  });

  // Filter out empty segments and trim each segment
  return segments
    .filter(segment => segment.trim().length > 0)
    .map(segment => segment.trim());
}

/**
 * Normalizes day names in the input text to improve pattern matching.
 * 
 * This function handles plural forms of days (e.g., "Mondays" to "monday")
 * and ensures consistent formatting.
 * 
 * @param {string} input - The input text to normalize
 * @returns {string} Text with normalized day names
 * 
 * @example
 * normalizeDayNames("every mondays and fridays")
 * // returns "every monday and friday"
 */
export function normalizeDayNames(input: string): string {
  return input
    // Convert plural days to singular (mondays -> monday)
    .replace(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)s\b/gi,
      (match) => match.slice(0, -1));
}

/**
 * This module could be extended in the future with additional normalizers for:
 * - Synonym handling (e.g., "fortnightly" -> "every 2 weeks")
 * - Spelling correction for common mistakes
 * - Language-specific normalizations
 * - More sophisticated sentence structure analysis
 */
