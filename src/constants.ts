/**
 * Constants Module
 * 
 * This module defines constants used throughout the application.
 * It centralizes string literals, configuration values, and other constants
 * to improve maintainability and reduce duplication.
 * 
 * The constants are organized by category to make them easier to find and use.
 */

import { RRule } from 'rrule';

/**
 * Day name constants used in pattern matching.
 * Includes both full names and common abbreviations for each day of the week.
 */
export const DAYS = {
  // Full day names
  MONDAY: 'monday',
  TUESDAY: 'tuesday',
  WEDNESDAY: 'wednesday',
  THURSDAY: 'thursday',
  FRIDAY: 'friday',
  SATURDAY: 'saturday',
  SUNDAY: 'sunday',

  // Common abbreviations
  MON: 'mon',
  TUE: 'tue',
  WED: 'wed',
  THU: 'thu',
  FRI: 'fri',
  SAT: 'sat',
  SUN: 'sun'
};

/**
 * Time unit constants used in pattern matching.
 * These represent the basic units of time for recurrence patterns.
 */
export const TIME_UNITS = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year'
};

/**
 * Special pattern word constants used in pattern matching.
 * These are common words and phrases that appear in recurrence patterns.
 */
export const SPECIAL_PATTERNS = {
  EVERY: 'every',
  EACH: 'each',
  ALL: 'all',
  ANY: 'any',
  ONCE: 'once',
  ON: 'on',
  IN: 'in',
  WEEKDAY: 'weekday',
  WEEKEND: 'weekend',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
  OTHER: 'other',
  SECOND: 'second',
  THIRD: 'third',
  FOURTH: 'fourth',
  FIRST: 'first',
  LAST: 'last',
  UNTIL: 'until',
  STARTING: 'starting',
  FROM: 'from',
  TO: 'to',
  FOR: 'for',
  TIMES: 'times',
  OF: 'of',
  THE: 'the'
};

/**
 * Frequency term constants used in pattern matching.
 * These are specific words that indicate recurrence frequency.
 */
export const FREQUENCY_TERMS = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
  ANNUALLY: 'annually'
};

/**
 * Ordinal term constants used in pattern matching.
 * These are used for patterns like "first Monday of the month".
 */
export const ORDINAL_TERMS = {
  FIRST: 'first',
  SECOND: 'second',
  THIRD: 'third',
  FOURTH: 'fourth',
  FIFTH: 'fifth',
  LAST: 'last'
};

/**
 * Complete mapping from ordinal words to their numeric values.
 * This is used for converting word-based ordinals to numbers (e.g., "first" -> 1).
 */
export const ORDINAL_WORD_MAP: Record<string, number> = {
  'first': 1,
  'second': 2,
  'third': 3,
  'fourth': 4,
  'fifth': 5,
  'sixth': 6,
  'seventh': 7,
  'eighth': 8,
  'ninth': 9,
  'tenth': 10,
  'eleventh': 11,
  'twelfth': 12,
  'thirteenth': 13,
  'fourteenth': 14,
  'fifteenth': 15,
  'sixteenth': 16,
  'seventeenth': 17,
  'eighteenth': 18,
  'nineteenth': 19,
  'twentieth': 20,
  'twenty-first': 21,
  'twenty-second': 22,
  'twenty-third': 23,
  'twenty-fourth': 24,
  'twenty-fifth': 25,
  'twenty-sixth': 26,
  'twenty-seventh': 27,
  'twenty-eighth': 28,
  'twenty-ninth': 29,
  'thirtieth': 30,
  'thirty-first': 31,
  'last': -1  // Special case for "last day of month"
};

/**
 * Month name constants used in pattern matching.
 * Includes both full names and common abbreviations for each month.
 */
export const MONTHS = {
  // Full month names
  JANUARY: 'january',
  FEBRUARY: 'february',
  MARCH: 'march',
  APRIL: 'april',
  MAY: 'may',
  JUNE: 'june',
  JULY: 'july',
  AUGUST: 'august',
  SEPTEMBER: 'september',
  OCTOBER: 'october',
  NOVEMBER: 'november',
  DECEMBER: 'december',

  // Common abbreviations
  JAN: 'jan',
  FEB: 'feb',
  MAR: 'mar',
  APR: 'apr',
  JUN: 'jun',
  JUL: 'jul',
  AUG: 'aug',
  SEP: 'sep',
  OCT: 'oct',
  NOV: 'nov',
  DEC: 'dec'
};

/**
 * Pattern category constants for organizing and enabling/disabling pattern types.
 * These categories group related pattern handlers together.
 */
export const PATTERN_CATEGORIES = {
  FREQUENCY: 'frequency',
  INTERVAL: 'interval',
  DAY_OF_WEEK: 'dayOfWeek',
  DAY_OF_MONTH: 'dayOfMonth',
  MONTH: 'month',
  UNTIL_DATE: 'untilDate',
  COUNT: 'count',
  POSITION: 'position',
  TIME: 'time'
};

/**
 * Pattern priority constants for determining the order of pattern application.
 * Higher values indicate higher priority, meaning those patterns will be
 * processed first in the transformation pipeline.
 */
export const PATTERN_PRIORITY = {
  INTERVAL: 300,  // Highest priority - interval patterns set both interval and frequency
  FREQUENCY: 200, // Medium priority - frequency patterns set the base recurrence type
  DAY_OF_WEEK: 100, // Lower priority - day patterns add specifications to the frequency
  DAY_OF_MONTH: 90,
  MONTH: 80,
  POSITION: 70,
  COUNT: 60,
  UNTIL_DATE: 50,
  TIME: 40
};

/**
 * Pattern combiner priority constants for determining the order of combination.
 * Higher values indicate higher priority, meaning those combiners will be
 * applied first in the combination pipeline.
 */
export const COMBINER_PRIORITY = {
  DAY_WITH_DAY: 300,          // Combining multiple day specifications (Monday and Wednesday)
  FREQUENCY_WITH_DAY: 250,    // Combining frequency with days (weekly on Monday)
  DAY_WITH_POSITION: 200,     // Combining days with position (first Monday)
  DAY_WITH_MONTH: 150,        // Combining days with months (Monday in January)
  POSITION_WITH_MONTH: 100,   // Combining position with months (first of the month)
  PATTERN_WITH_UNTIL: 50,     // Combining any pattern with an end date
  PATTERN_WITH_COUNT: 40      // Combining any pattern with a count
};

/**
 * Conjunction terms used for splitting and combining patterns.
 * These are words that connect multiple patterns together.
 */
export const CONJUNCTION_TERMS = {
  AND: 'and',
  PLUS: 'plus',
  ALSO: 'also',
  COMMA: ',',
  SEMICOLON: ';'
};

/**
 * Protected phrases that should not be split during pattern parsing.
 * These are special phrases that contain conjunction terms but should be
 * treated as a single unit.
 */
export const PROTECTED_PHRASES = [
  // Word ordinal combinations
  'first and last',
  'first and third',
  'second and fourth',
  'first and third and last',
  'second and fourth and last',
  
  // Numeric ordinal combinations
  '1st and last',
  '2nd and 4th',
  '1st and 3rd',
  '3rd and last',
  '1st and 15th',
  
  // Mixed format combinations
  'first and 15th',
  '1st and third',
  '1st and last day',
  'first and 3rd',
  
  // Business day related combinations that shouldn't be split
  'monday through friday',
  'monday to friday',
  'monday thru friday',
  
  // Weekend related protected phrases
  'saturday and sunday',
  'every other weekend',
  
  // Month range protected phrases
  'january through march',
  'april to june',
  'july thru september',
  
  // Time-related phrases
  'morning and evening',
  'morning and night',
  
  // Other special case phrases
  'every other day',
  'every other week',
  'first and last day of the month',
  'beginning and end of month'
];

/**
 * Term synonyms for more flexible pattern matching.
 * This maps alternative terms to their canonical forms.
 */
export const TERM_SYNONYMS = {
  // Frequency synonyms
  'everyday': 'daily',
  'each day': 'daily',
  'once a day': 'daily',
  'once daily': 'daily',
  'dayly': 'daily',
  'dayli': 'daily',
  'daly': 'daily',
  'dialy': 'daily',
  
  'each week': 'weekly',
  'once a week': 'weekly',
  'once weekly': 'weekly',
  'weekley': 'weekly',
  'wekly': 'weekly',
  'weekle': 'weekly',
  'weakly': 'weekly',
  
  'each month': 'monthly',
  'once a month': 'monthly',
  'once monthly': 'monthly',
  'monthley': 'monthly',
  'monthely': 'monthly',
  'monthy': 'monthly',
  'montly': 'monthly',
  
  'each year': 'yearly',
  'once a year': 'yearly',
  'once yearly': 'yearly',
  'annual': 'yearly',
  'annually': 'yearly',
  'yeerly': 'yearly',
  'yearley': 'yearly',
  'yeary': 'yearly',
  'annualy': 'yearly',
  'anually': 'yearly',

  // Special pattern synonyms
  'all': 'every',
  'each': 'every',
  'any': 'every',
  'evry': 'every',
  'evrery': 'every',
  'evrey': 'every',
  'avery': 'every',
  'ever': 'every',
  'eatch': 'each',
  'eech': 'each',
  
  'work day': 'weekday',
  'work days': 'weekday',
  'workday': 'weekday',
  'workdays': 'weekday',
  'business day': 'weekday',
  'business days': 'weekday',
  'buisness day': 'weekday',
  'buisness days': 'weekday',
  'week day': 'weekday',
  'week days': 'weekday',
  'weekdys': 'weekday',
  'weekdais': 'weekday',
  
  'week end': 'weekend',
  'week ends': 'weekend',
  'weekends': 'weekend',
  'weeknds': 'weekend',
  'wekend': 'weekend',
  'weekand': 'weekend',

  // Interval synonyms
  'alternate': 'other',
  'alternating': 'other',
  'alternit': 'other',
  'everyother': 'every other',
  'evry other': 'every other',
  'every secound': 'every second',
  'every second': 'every other',
  
  'bi-weekly': 'every 2 weeks',
  'biweekly': 'every 2 weeks',
  'bi weekly': 'every 2 weeks',
  'biweekley': 'every 2 weeks',
  'bi-weekley': 'every 2 weeks',
  'bi-wekly': 'every 2 weeks',
  'biweely': 'every 2 weeks',
  
  'fortnightly': 'every 2 weeks',
  'fortnightley': 'every 2 weeks',
  'fort nightly': 'every 2 weeks',
  'fortnight': 'every 2 weeks',
  
  'bi-monthly': 'every 2 months',
  'bimonthly': 'every 2 months',
  'bi monthly': 'every 2 months',
  'bi-monthley': 'every 2 months',
  'bimonthley': 'every 2 months',
  
  'quarterly': 'every 3 months',
  'quartely': 'every 3 months',
  'quaterly': 'every 3 months',
  'quater': 'every 3 months',
  
  'bi-annual': 'every 6 months',
  'biannual': 'every 6 months',
  'bi annual': 'every 6 months',
  'bi-anual': 'every 6 months',
  'bianual': 'every 6 months',
  
  'semi-annual': 'every 6 months',
  'semiannual': 'every 6 months',
  'semi annual': 'every 6 months',
  'semi-anual': 'every 6 months',
  'semianual': 'every 6 months',
  
  // Time and date terminologies
  'untill': 'until',
  'til': 'until',
  'till': 'until',
  'untl': 'until',
  
  'begining': 'beginning',
  'begining of': 'beginning of',
  'begining of month': 'beginning of month',
  
  'end of': 'ending',
  'end of month': 'ending of month',
  'last of month': 'ending of month'
};

/**
 * Day name variants for fuzzy matching.
 * This maps common misspellings and variants to the correct day names.
 */
export const DAY_NAME_VARIANTS = {
  // Monday variants
  'mondays': DAYS.MONDAY,
  'mondey': DAYS.MONDAY,
  'mondy': DAYS.MONDAY,
  'mondai': DAYS.MONDAY,
  'munday': DAYS.MONDAY,
  'moonday': DAYS.MONDAY,
  'mon': DAYS.MONDAY,
  'monda': DAYS.MONDAY,

  // Tuesday variants
  'tuesdays': DAYS.TUESDAY,
  'tues': DAYS.TUESDAY,
  'tusday': DAYS.TUESDAY,
  'tuseday': DAYS.TUESDAY,
  'tursday': DAYS.TUESDAY,
  'twosday': DAYS.TUESDAY,
  'teusday': DAYS.TUESDAY,
  'teus': DAYS.TUESDAY,
  'tue': DAYS.TUESDAY,

  // Wednesday variants
  'wednesdays': DAYS.WEDNESDAY,
  'weds': DAYS.WEDNESDAY,
  'wednes': DAYS.WEDNESDAY,
  'wedness': DAYS.WEDNESDAY,
  'wendsday': DAYS.WEDNESDAY,
  'wensday': DAYS.WEDNESDAY,
  'wendesday': DAYS.WEDNESDAY,
  'wenesday': DAYS.WEDNESDAY,
  'wednessday': DAYS.WEDNESDAY,
  'wed': DAYS.WEDNESDAY,
  'wedneday': DAYS.WEDNESDAY,

  // Thursday variants
  'thursdays': DAYS.THURSDAY,
  'thurs': DAYS.THURSDAY,
  'thur': DAYS.THURSDAY,
  'thrusday': DAYS.THURSDAY,
  'thurday': DAYS.THURSDAY,
  'thurdsay': DAYS.THURSDAY,
  'thersday': DAYS.THURSDAY,
  'thu': DAYS.THURSDAY,
  'thus': DAYS.THURSDAY,

  // Friday variants
  'fridays': DAYS.FRIDAY,
  'friady': DAYS.FRIDAY,
  'fridy': DAYS.FRIDAY,
  'frday': DAYS.FRIDAY,
  'fri': DAYS.FRIDAY,
  'firday': DAYS.FRIDAY,
  'friiday': DAYS.FRIDAY,

  // Saturday variants
  'saturdays': DAYS.SATURDAY,
  'sat': DAYS.SATURDAY,
  'satur': DAYS.SATURDAY,
  'saterday': DAYS.SATURDAY,
  'satday': DAYS.SATURDAY,
  'satuday': DAYS.SATURDAY,
  'saterdy': DAYS.SATURDAY,
  'satarday': DAYS.SATURDAY,
  'saturaday': DAYS.SATURDAY,

  // Sunday variants
  'sundays': DAYS.SUNDAY,
  'sun': DAYS.SUNDAY,
  'suday': DAYS.SUNDAY,
  'sonday': DAYS.SUNDAY,
  'sund': DAYS.SUNDAY,
  'sunda': DAYS.SUNDAY,
  'sundy': DAYS.SUNDAY
};

/**
 * Month name variants for fuzzy matching.
 * This maps common misspellings and variants to the correct month names.
 */
export const MONTH_NAME_VARIANTS = {
  // January variants
  'jan': MONTHS.JANUARY,
  'janurary': MONTHS.JANUARY,
  'janaury': MONTHS.JANUARY,
  'janury': MONTHS.JANUARY,
  'janu': MONTHS.JANUARY,
  'januray': MONTHS.JANUARY,
  'janary': MONTHS.JANUARY,

  // February variants
  'feb': MONTHS.FEBRUARY,
  'feburary': MONTHS.FEBRUARY,
  'febu': MONTHS.FEBRUARY,
  'febuary': MONTHS.FEBRUARY,
  'febrary': MONTHS.FEBRUARY,
  'febraury': MONTHS.FEBRUARY,
  'febury': MONTHS.FEBRUARY,

  // March variants
  'mar': MONTHS.MARCH,
  'mch': MONTHS.MARCH,
  'mrch': MONTHS.MARCH,
  'marh': MONTHS.MARCH,
  'marhc': MONTHS.MARCH,

  // April variants
  'apr': MONTHS.APRIL,
  'apl': MONTHS.APRIL,
  'aprl': MONTHS.APRIL,
  'apil': MONTHS.APRIL,
  'arpil': MONTHS.APRIL,
  'appril': MONTHS.APRIL,

  // May has fewer variants
  'may': MONTHS.MAY,
  'may.': MONTHS.MAY,

  // June variants
  'jun': MONTHS.JUNE,
  'jn': MONTHS.JUNE,
  'jne': MONTHS.JUNE,
  'jun.': MONTHS.JUNE,
  'juen': MONTHS.JUNE,

  // July variants
  'jul': MONTHS.JULY,
  'jl': MONTHS.JULY,
  'jly': MONTHS.JULY,
  'jul.': MONTHS.JULY,
  'jule': MONTHS.JULY,
  'juley': MONTHS.JULY,

  // August variants
  'aug': MONTHS.AUGUST,
  'ag': MONTHS.AUGUST,
  'aug.': MONTHS.AUGUST,
  'augst': MONTHS.AUGUST,
  'augus': MONTHS.AUGUST,
  'agust': MONTHS.AUGUST,

  // September variants
  'sep': MONTHS.SEPTEMBER,
  'sept': MONTHS.SEPTEMBER,
  'septem': MONTHS.SEPTEMBER,
  'sep.': MONTHS.SEPTEMBER,
  'sept.': MONTHS.SEPTEMBER,
  'septmber': MONTHS.SEPTEMBER,
  'septembr': MONTHS.SEPTEMBER,
  'setember': MONTHS.SEPTEMBER,

  // October variants
  'oct': MONTHS.OCTOBER,
  'octo': MONTHS.OCTOBER,
  'oct.': MONTHS.OCTOBER,
  'octber': MONTHS.OCTOBER,
  'octobr': MONTHS.OCTOBER,
  'ocotber': MONTHS.OCTOBER,

  // November variants
  'nov': MONTHS.NOVEMBER,
  'novem': MONTHS.NOVEMBER,
  'nov.': MONTHS.NOVEMBER,
  'novmber': MONTHS.NOVEMBER,
  'novembr': MONTHS.NOVEMBER,
  'noveber': MONTHS.NOVEMBER,

  // December variants
  'dec': MONTHS.DECEMBER,
  'decem': MONTHS.DECEMBER,
  'dec.': MONTHS.DECEMBER,
  'decmber': MONTHS.DECEMBER,
  'decembr': MONTHS.DECEMBER,
  'deceber': MONTHS.DECEMBER,
  'descember': MONTHS.DECEMBER
};

/**
 * Month names and abbreviations used for pattern matching.
 */
export const MONTH_NAMES = {
  // Full month names
  JANUARY: 'january',
  FEBRUARY: 'february',
  MARCH: 'march',
  APRIL: 'april',
  MAY: 'may',
  JUNE: 'june',
  JULY: 'july',
  AUGUST: 'august',
  SEPTEMBER: 'september',
  OCTOBER: 'october',
  NOVEMBER: 'november',
  DECEMBER: 'december',
  
  // Common abbreviations
  JAN: 'jan',
  FEB: 'feb',
  MAR: 'mar',
  APR: 'apr',
  MAY_ABBR: 'may',  // Same as full name but needed for consistency
  JUN: 'jun',
  JUL: 'jul',
  AUG: 'aug',
  SEP: 'sep',
  OCT: 'oct',
  NOV: 'nov',
  DEC: 'dec'
} as const;

/**
 * Type definition for month names strings
 */
export type MonthString = typeof MONTH_NAMES[keyof typeof MONTH_NAMES];

// Type definitions for constants to improve type safety

/**
 * Type for day name strings used in mappings and pattern matching.
 */
export type DayString = typeof DAYS[keyof typeof DAYS];

/**
 * Type for time unit strings used in frequency mappings.
 */
export type TimeUnitString = typeof TIME_UNITS[keyof typeof TIME_UNITS];

/**
 * Type for special pattern strings used in pattern matching.
 */
export type SpecialPatternString = typeof SPECIAL_PATTERNS[keyof typeof SPECIAL_PATTERNS];

/**
 * Type for frequency term strings used in pattern matching.
 */
export type FrequencyTermString = typeof FREQUENCY_TERMS[keyof typeof FREQUENCY_TERMS];

/**
 * Type for ordinal term strings used in pattern matching.
 */
export type OrdinalTermString = typeof ORDINAL_TERMS[keyof typeof ORDINAL_TERMS];

/**
 * Type for pattern category strings used for organizing patterns.
 */
export type PatternCategoryString = typeof PATTERN_CATEGORIES[keyof typeof PATTERN_CATEGORIES];

/**
 * Type for conjunction term strings used for splitting patterns.
 */
export type ConjunctionString = typeof CONJUNCTION_TERMS[keyof typeof CONJUNCTION_TERMS];
