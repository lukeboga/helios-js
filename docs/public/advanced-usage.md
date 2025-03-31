# Advanced Usage Guide

This guide covers advanced features and techniques for users who want to get the most out of Helios-JS or customize its behavior.

## Table of Contents

- [Custom Configuration](#custom-configuration)
- [Creating Custom Pattern Handlers](#creating-custom-pattern-handlers)
- [Advanced Normalization Techniques](#advanced-normalization-techniques)
- [Performance Optimization](#performance-optimization)
- [Integration with Backend Services](#integration-with-backend-services)
- [Working with Complex Patterns](#working-with-complex-patterns)
- [Calendar Integration](#calendar-integration)

## Custom Configuration

Helios-JS is highly configurable, allowing you to customize its behavior to suit your specific needs.

### Transformer Configuration

You can create a custom transformer with specific configuration:

```javascript
import { createTransformer } from 'helios-js';

const customTransformer = createTransformer({
  // Enable or disable specific handlers
  enabledHandlers: ['frequencyPatternHandler', 'dayOfWeekPatternHandler'],
  
  // Configure normalizer options
  normalizerOptions: {
    preserveOrdinalSuffixes: true,
    correctMisspellings: false
  },
  
  // Add hooks for debugging or monitoring
  onBeforeNormalize: (input) => console.log('Processing:', input),
  onAfterNormalize: (normalized) => console.log('Normalized:', normalized),
  onPatternMatch: (handler, result) => console.log(`Matched: ${handler.name}`)
});

// Use the custom transformer
const result = customTransformer.transform('every Monday');
```

### Adjusting Pattern Handler Priorities

Pattern handlers are applied in order of priority. You can customize these priorities:

```javascript
import { createTransformer, handlers } from 'helios-js';

// Get a copy of built-in handlers
const customHandlers = [...handlers];

// Change priorities to affect matching order
const dayOfWeekHandler = customHandlers.find(h => h.name === 'dayOfWeekPatternHandler');
if (dayOfWeekHandler) {
  dayOfWeekHandler.priority = 200; // Higher value = earlier execution
}

const transformer = createTransformer({ handlers: customHandlers });
```

### Custom Validation Rules

You can add custom validation rules to ensure patterns meet your criteria:

```javascript
import { createRRule, validatePattern } from 'helios-js';

// Custom validation function
function customValidate(options, originalInput) {
  // Standard validation
  const standardValidation = validatePattern(options, originalInput);
  if (!standardValidation.isValid) {
    return standardValidation;
  }
  
  // Custom business rules
  if (options.freq === RRule.YEARLY && options.interval > 5) {
    return {
      isValid: false,
      errors: ['Our system only supports yearly recurrence with intervals up to 5 years']
    };
  }
  
  return { isValid: true };
}

// Use in your application
function processUserInput(input) {
  const result = naturalLanguageToRRule(input);
  const validation = customValidate(result.options, input);
  
  if (!validation.isValid) {
    return { error: validation.errors.join('. ') };
  }
  
  return { rule: createRRule(result.options) };
}
```

## Creating Custom Pattern Handlers

You can extend Helios-JS by creating custom pattern handlers for specific use cases.

### Basic Pattern Handler

Here's a template for creating a custom pattern handler:

```javascript
import { createTransformer } from 'helios-js';
import { RRule } from 'rrule';

// Define a custom pattern handler
const businessDaysHandler = {
  name: 'businessDaysPatternHandler',
  priority: 150,
  category: 'custom',
  
  apply: function(input) {
    // Match "business days" or "weekdays"
    const businessDaysRegex = /\b(business days|weekdays)\b/i;
    const match = input.match(businessDaysRegex);
    
    if (!match) {
      return null;
    }
    
    // Return pattern result with RRule options
    return {
      matched: true,
      confidence: 0.9,
      options: {
        freq: RRule.WEEKLY,
        byweekday: [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR]
      },
      meta: {
        handlerName: this.name,
        matchedGroups: match.groups || {}
      }
    };
  }
};

// Create a transformer with the custom handler
const customTransformer = createTransformer({
  handlers: [businessDaysHandler, ...handlers] // Add custom handler first
});

// Use the custom transformer
const result = customTransformer.transform('every business days');
console.log(result.options);
// Output: { freq: 2, byweekday: [0, 1, 2, 3, 4] }
```

### Complex Pattern Handler

For more complex patterns, you might need more sophisticated matching:

```javascript
import { createTransformer, handlers } from 'helios-js';
import { RRule } from 'rrule';

// Handler for "first/second/last workday of month" patterns
const workdayOfMonthHandler = {
  name: 'workdayOfMonthHandler',
  priority: 120,
  category: 'custom',
  
  apply: function(input) {
    // Match patterns like "first workday of month" or "last business day of the month"
    const regex = /\b(first|second|third|fourth|fifth|last)\s+(workday|business day)\s+of\s+(?:the\s+)?month\b/i;
    const match = input.match(regex);
    
    if (!match) {
      return null;
    }
    
    // Get position specifier (first, last, etc.)
    const position = match[1].toLowerCase();
    let bysetpos;
    
    if (position === 'last') {
      bysetpos = -1;
    } else {
      const positions = { 'first': 1, 'second': 2, 'third': 3, 'fourth': 4, 'fifth': 5 };
      bysetpos = positions[position] || 1;
    }
    
    // Return pattern result
    return {
      matched: true,
      confidence: 0.95,
      options: {
        freq: RRule.MONTHLY,
        byweekday: [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR],
        bysetpos: bysetpos
      },
      meta: {
        handlerName: this.name,
        position: position
      }
    };
  }
};

// Register the custom handler
const customTransformer = createTransformer({
  handlers: [workdayOfMonthHandler, ...handlers]
});

// Test the handler
const result = customTransformer.transform('monthly on the last business day of the month');
console.log(result.rule.toText());
// Output: "monthly on the last weekday"
```

## Advanced Normalization Techniques

The normalization pipeline is key to successful pattern recognition. Customizing it can help with specific use cases.

### Custom Synonym Mapping

Add domain-specific synonyms for your application:

```javascript
import { normalizeInput, SynonymMap } from 'helios-js';

// Create custom synonym mappings
const customSynonyms = {
  // Custom time-related synonyms
  'fortnightly': 'every 2 weeks',
  'bimonthly': 'every 2 months',
  'quarterly': 'every 3 months',
  'semester': 'every 6 months',
  
  // Domain-specific terminology
  'trading days': 'business days',
  'sprint': 'every 2 weeks',
  'payroll period': 'every 2 weeks'
};

// Function to apply custom normalization
function enhancedNormalize(input) {
  // First, apply custom synonyms
  let normalized = input.toLowerCase();
  
  Object.entries(customSynonyms).forEach(([term, replacement]) => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    normalized = normalized.replace(regex, replacement);
  });
  
  // Then apply standard normalization
  return normalizeInput(normalized);
}

// Test the enhanced normalization
console.log(enhancedNormalize('Schedule fortnightly meetings'));
// Output: "schedule every 2 weeks meetings"
```

### Handling Different Languages

While Helios-JS is primarily designed for English, you can add basic support for other languages:

```javascript
import { normalizeInput } from 'helios-js';

// Simple Spanish day name translator
const spanishDays = {
  'lunes': 'monday',
  'martes': 'tuesday',
  'miércoles': 'wednesday',
  'miercoles': 'wednesday',
  'jueves': 'thursday',
  'viernes': 'friday',
  'sábado': 'saturday',
  'sabado': 'saturday',
  'domingo': 'sunday'
};

// Simple Spanish frequency translator
const spanishFrequencies = {
  'diario': 'daily',
  'diariamente': 'daily',
  'semanal': 'weekly',
  'semanalmente': 'weekly',
  'mensual': 'monthly',
  'mensualmente': 'monthly',
  'anual': 'yearly',
  'anualmente': 'yearly'
};

// Function to pre-process Spanish patterns
function spanishToEnglish(input) {
  let result = input.toLowerCase();
  
  // Replace day names
  Object.entries(spanishDays).forEach(([spanish, english]) => {
    const regex = new RegExp(`\\b${spanish}\\b`, 'gi');
    result = result.replace(regex, english);
  });
  
  // Replace frequencies
  Object.entries(spanishFrequencies).forEach(([spanish, english]) => {
    const regex = new RegExp(`\\b${spanish}\\b`, 'gi');
    result = result.replace(regex, english);
  });
  
  // Replace common phrases
  result = result.replace(/\bcada\b/gi, 'every');
  
  return result;
}

// Process Spanish input
function processSpanishPattern(spanishInput) {
  const englishInput = spanishToEnglish(spanishInput);
  return naturalLanguageToRRule(englishInput);
}

// Test with Spanish input
const result = processSpanishPattern('cada lunes');
console.log(result.options);
// Output should be equivalent to "every monday"
```

## Performance Optimization

For applications processing many patterns, performance optimization is important.

### Caching Strategies

Implement effective caching for pattern processing:

```javascript
import { naturalLanguageToRRule } from 'helios-js';

// Create a LRU cache with a maximum size
class LRUCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }
  
  get(key) {
    if (!this.cache.has(key)) return undefined;
    
    // Get value and refresh position by deleting and re-adding
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }
  
  set(key, value) {
    // Delete oldest entry if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, value);
  }
}

// Create pattern cache
const patternCache = new LRUCache(500);

// Function to get cached pattern results
function getCachedPattern(input) {
  // Normalize the input to ensure consistent cache hits
  const normalizedInput = input.trim().toLowerCase();
  
  // Check cache first
  const cached = patternCache.get(normalizedInput);
  if (cached) {
    return cached;
  }
  
  // Process pattern and cache result
  const result = naturalLanguageToRRule(normalizedInput);
  patternCache.set(normalizedInput, result);
  return result;
}
```

### Batch Processing

For processing multiple patterns at once:

```javascript
import { createTransformer } from 'helios-js';

// Create a single transformer instance
const transformer = createTransformer();

// Process patterns in batches
function processBatch(patterns) {
  // Pre-allocate results array
  const results = new Array(patterns.length);
  
  // Process each pattern
  for (let i = 0; i < patterns.length; i++) {
    try {
      results[i] = {
        original: patterns[i],
        result: transformer.transform(patterns[i]),
        error: null
      };
    } catch (error) {
      results[i] = {
        original: patterns[i],
        result: null,
        error: error.message
      };
    }
  }
  
  return results;
}

// Example batch processing
const patterns = [
  'every monday',
  'daily until december 31',
  'monthly on the 15th',
  'every 2 weeks on friday'
];

const results = processBatch(patterns);
```

### Minimizing Pattern Handlers

For performance-critical applications, use only the handlers you need:

```javascript
import { createTransformer, handlers } from 'helios-js';

// Identify critical handlers for your use case
const criticalHandlers = handlers.filter(h => 
  ['frequencyPatternHandler', 'intervalPatternHandler', 'dayOfWeekPatternHandler'].includes(h.name)
);

// Create a lightweight transformer
const lightTransformer = createTransformer({
  handlers: criticalHandlers
});

// Use for performance-critical operations
function quickTransform(input) {
  return lightTransformer.transform(input);
}
```

## Integration with Backend Services

Helios-JS can be integrated with various backend technologies.

### REST API Integration

Create a pattern processing service:

```javascript
// Node.js with Express example
const express = require('express');
const { naturalLanguageToRRule } = require('helios-js');
const app = express();

app.use(express.json());

// Endpoint for pattern processing
app.post('/api/process-pattern', (req, res) => {
  try {
    const { pattern } = req.body;
    
    if (!pattern || typeof pattern !== 'string') {
      return res.status(400).json({
        error: 'Invalid input. Please provide a pattern string.'
      });
    }
    
    const result = naturalLanguageToRRule(pattern);
    
    // Return processed pattern with dates
    const rule = result.rule;
    const nextDates = rule.all((date, i) => i < 5); // Get next 5 occurrences
    
    return res.json({
      original: pattern,
      normalized: result.normalizedInput,
      options: result.options,
      confidence: result.confidence,
      nextOccurrences: nextDates
    });
  } catch (error) {
    return res.status(400).json({
      error: error.message,
      details: error.details || {}
    });
  }
});

// Validation endpoint
app.post('/api/validate-pattern', (req, res) => {
  try {
    const { pattern } = req.body;
    const result = naturalLanguageToRRule(pattern);
    
    return res.json({
      isValid: true,
      confidence: result.confidence
    });
  } catch (error) {
    return res.json({
      isValid: false,
      error: error.message,
      suggestedCorrections: error.details?.suggestedCorrections || []
    });
  }
});

app.listen(3000, () => console.log('API running on port 3000'));
```

### Database Integration

Store and query recurrence patterns efficiently:

```javascript
// Using SQLite with Node.js example
const sqlite3 = require('sqlite3').verbose();
const { naturalLanguageToRRule } = require('helios-js');

// Open database connection
const db = new sqlite3.Database('./events.db');

// Create events table
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      pattern_text TEXT NOT NULL,
      pattern_options TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// Function to add a recurring event
function addRecurringEvent(title, patternText) {
  try {
    // Process the pattern
    const result = naturalLanguageToRRule(patternText);
    
    // Store both the pattern text and the serialized options
    const optionsJson = JSON.stringify(result.options);
    
    // Insert into database
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO events (title, pattern_text, pattern_options) VALUES (?, ?, ?)',
        [title, patternText, optionsJson],
        function(err) {
          if (err) return reject(err);
          resolve(this.lastID);
        }
      );
    });
  } catch (error) {
    throw new Error(`Invalid pattern: ${error.message}`);
  }
}

// Function to get upcoming events
function getUpcomingEvents(fromDate, limit = 10) {
  return new Promise((resolve, reject) => {
    // Get all recurring events
    db.all('SELECT id, title, pattern_options FROM events', [], (err, rows) => {
      if (err) return reject(err);
      
      const upcoming = [];
      const now = fromDate || new Date();
      
      // Process each event's recurrence rule
      rows.forEach(row => {
        try {
          // Parse options from JSON
          const options = JSON.parse(row.pattern_options);
          
          // Create RRule with the stored options
          const rule = new RRule({
            ...options,
            dtstart: now // Start looking from the provided date
          });
          
          // Get the next occurrences
          const nextDates = rule.all((date, i) => 
            i < 5 && date > now
          );
          
          // Add each occurrence to the results
          nextDates.forEach(date => {
            upcoming.push({
              id: row.id,
              title: row.title,
              date: date
            });
          });
        } catch (error) {
          console.error(`Error processing event ${row.id}: ${error.message}`);
        }
      });
      
      // Sort by date and limit the results
      upcoming.sort((a, b) => a.date - b.date);
      resolve(upcoming.slice(0, limit));
    });
  });
}
```

## Working with Complex Patterns

Handle more complex or ambiguous patterns with advanced techniques.

### Pattern Segmentation

Break down complex patterns into segments:

```javascript
import { naturalLanguageToRRule } from 'helios-js';

function processComplexPattern(input) {
  // Identify potential segments using connectors
  const segments = input.split(/\s+and\s+|\s*,\s*/g)
    .filter(segment => segment.trim().length > 0);
  
  if (segments.length <= 1) {
    // Simple pattern, process normally
    return naturalLanguageToRRule(input);
  }
  
  // Check if segments might be day specifications in a single pattern
  const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const isDayList = segments.every(segment => 
    dayNames.some(day => segment.toLowerCase().includes(day))
  );
  
  if (isDayList) {
    // Likely a list of days for a single pattern
    return naturalLanguageToRRule(input);
  }
  
  // Otherwise, these might be separate patterns
  // Return the most confident match
  let bestResult = null;
  let bestConfidence = -1;
  
  // Try different combinations
  segments.forEach(segment => {
    try {
      const result = naturalLanguageToRRule(segment);
      if (result.confidence > bestConfidence) {
        bestResult = result;
        bestConfidence = result.confidence;
      }
    } catch (error) {
      // Skip failed segments
    }
  });
  
  // If all segments failed, try the original input
  if (!bestResult) {
    return naturalLanguageToRRule(input);
  }
  
  return bestResult;
}
```

### Handling Context-Specific Patterns

Some patterns may depend on application context:

```javascript
import { createTransformer, handlers } from 'helios-js';
import { RRule } from 'rrule';

// Domain-specific pattern handler for academic terms
const academicTermHandler = {
  name: 'academicTermHandler',
  priority: 200,
  category: 'custom',
  
  apply: function(input) {
    // Match patterns like "fall semester" or "spring term"
    const regex = /\b(fall|spring|summer|winter)\s+(semester|term|quarter)\b/i;
    const match = input.match(regex);
    
    if (!match) {
      return null;
    }
    
    const term = match[1].toLowerCase();
    const periodType = match[2].toLowerCase();
    
    // Define term dates based on context
    let startMonth, startDay, endMonth, endDay;
    
    if (term === 'fall') {
      startMonth = 8; // September
      startDay = 1;
      endMonth = 11; // December
      endDay = 15;
    } else if (term === 'spring') {
      startMonth = 0; // January
      startDay = 15;
      endMonth = 4; // May
      endDay = 15;
    } else if (term === 'summer') {
      startMonth = 5; // June
      startDay = 1; 
      endMonth = 7; // August
      endDay = 15;
    } else { // winter
      startMonth = 11; // December
      startDay = 15;
      endMonth = 0; // January
      endDay = 15;
    }
    
    // Get the current year
    const currentYear = new Date().getFullYear();
    
    // Create start and end dates
    const startDate = new Date(currentYear, startMonth, startDay);
    const endDate = new Date(currentYear, endMonth, endDay);
    
    // Adjust year if needed (for winter term spanning two years)
    if (term === 'winter' && endMonth < startMonth) {
      endDate.setFullYear(currentYear + 1);
    }
    
    // Return daily recurrence between start and end date
    return {
      matched: true,
      confidence: 0.9,
      options: {
        freq: RRule.DAILY,
        dtstart: startDate,
        until: endDate
      },
      meta: {
        handlerName: this.name,
        term: term,
        periodType: periodType,
        academicYear: `${currentYear}-${currentYear+1}`
      }
    };
  }
};

// Create a context-aware transformer
const academicTransformer = createTransformer({
  handlers: [academicTermHandler, ...handlers]
});

// Process academic schedule
const result = academicTransformer.transform('classes every Monday and Wednesday during fall semester');
```

## Calendar Integration

Integrate with calendar systems for complete scheduling solutions.

### Google Calendar Integration

```javascript
// Using Google Calendar API with Node.js
const { google } = require('googleapis');
const { naturalLanguageToRRule } = require('helios-js');
const { RRule } = require('rrule');

// Setup Google Calendar client
const calendar = google.calendar({
  version: 'v3',
  auth: /* your auth client */
});

// Function to create a recurring event
async function createRecurringEvent(summary, description, patternText, startTime, duration) {
  try {
    // Process the natural language pattern
    const result = naturalLanguageToRRule(patternText);
    const rule = result.rule;
    
    // Format as RFC 5545 for Google Calendar
    const ruleString = rule.toString();
    
    // Create start and end times
    const start = new Date(startTime);
    const end = new Date(start.getTime() + duration * 60000); // duration in minutes
    
    // Create event
    const event = {
      summary: summary,
      description: description,
      start: {
        dateTime: start.toISOString(),
        timeZone: 'America/New_York' // Use appropriate timezone
      },
      end: {
        dateTime: end.toISOString(),
        timeZone: 'America/New_York'
      },
      recurrence: [ruleString]
    };
    
    // Insert event
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event
    });
    
    return response.data;
  } catch (error) {
    throw new Error(`Failed to create event: ${error.message}`);
  }
}

// Example usage
createRecurringEvent(
  'Team Meeting',
  'Weekly team status update',
  'every Monday at 10am',
  '2023-01-09T10:00:00',
  60 // 60 minutes
)
.then(event => console.log(`Event created: ${event.htmlLink}`))
.catch(error => console.error(error));
```

### iCalendar Format

Generate standard iCalendar (.ics) files:

```javascript
import { naturalLanguageToRRule } from 'helios-js';
import { createEvents } from 'ics';

// Convert Helios-JS pattern to iCalendar
function createICSFromPattern(title, description, patternText, startTime, durationMinutes) {
  try {
    // Process the pattern
    const result = naturalLanguageToRRule(patternText);
    const rule = result.rule;
    
    // Parse the start time
    const start = new Date(startTime);
    
    // Format recurrence rule for iCalendar
    // Note: ics library handles recurrence rules differently, we'll use its format
    
    // Extract recurrence options
    const options = result.options;
    const rrule = {
      freq: ['YEARLY', 'MONTHLY', 'WEEKLY', 'DAILY'][options.freq - 1],
      interval: options.interval,
      count: options.count,
      until: options.until ? new Date(options.until) : undefined,
      bymonth: options.bymonth,
      byweekday: options.byweekday,
      bymonthday: options.bymonthday
    };
    
    // Create event data for ics
    const event = {
      title: title,
      description: description,
      start: [
        start.getFullYear(),
        start.getMonth() + 1,
        start.getDate(),
        start.getHours(),
        start.getMinutes()
      ],
      duration: { minutes: durationMinutes },
      recurrenceRule: rrule
    };
    
    // Create iCalendar event
    return new Promise((resolve, reject) => {
      createEvents([event], (error, value) => {
        if (error) {
          reject(error);
        } else {
          resolve(value);
        }
      });
    });
  } catch (error) {
    throw new Error(`Failed to create iCalendar: ${error.message}`);
  }
}

// Example usage
createICSFromPattern(
  'Project Review',
  'Bi-weekly project status review',
  'every 2 weeks on Thursday at 2pm',
  '2023-01-05T14:00:00',
  90 // 90 minutes
)
.then(icsData => {
  console.log('Generated iCalendar:');
  console.log(icsData);
  
  // In a browser environment, you could download this as a file:
  /*
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'event.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  */
})
.catch(error => console.error(error));
```

---

With these advanced techniques, you can customize Helios-JS to fit your specific requirements, improve performance, and integrate with other systems. Remember that extending the library requires a good understanding of both recurrence rules and natural language processing. 