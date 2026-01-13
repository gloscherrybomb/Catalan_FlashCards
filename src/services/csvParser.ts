import type { Flashcard } from '../types/flashcard';
import { CSV_CONFIG } from '../config/constants';
import { logger } from './logger';

interface ParsedCategory {
  category: string;
  subcategory?: string;
  gender?: 'masculine' | 'feminine';
}

// CSV validation types
export interface CSVWarning {
  line: number;
  type: 'skipped_row' | 'invalid_gender' | 'duplicate';
  message: string;
}

export interface CSVError {
  line?: number;
  type: 'file_too_large' | 'malformed' | 'missing_columns' | 'empty_file' | 'too_many_rows';
  message: string;
}

export interface CSVParseResult {
  cards: Flashcard[];
  warnings: CSVWarning[];
  errors: CSVError[];
}

const CATEGORY_PATTERNS: [RegExp, string, string?][] = [
  [/^Verb:\s*(\w+)/i, 'Verbs'],
  [/^Indefinite article/i, 'Articles', 'Indefinite'],
  [/^Definite article/i, 'Articles', 'Definite'],
  [/^Adjective/i, 'Adjectives'],
  [/^Occupation/i, 'Nouns'],
  [/^Condition/i, 'Conditions'],
  [/^Location/i, 'Locations'],
  [/^Immediate Future/i, 'Verbs', 'Future'],
  [/Must include/i, 'Possessives'],
  [/^Feminine$/i, 'Nouns'],
  [/^Masculine$/i, 'Nouns'],
];

export function parseCategory(notes: string): ParsedCategory {
  const normalized = notes.trim();
  let category = 'Vocabulary';
  let subcategory: string | undefined;
  let gender: 'masculine' | 'feminine' | undefined;

  // Check for gender
  if (/\bFeminine\b/i.test(normalized)) {
    gender = 'feminine';
  } else if (/\bMasculine\b/i.test(normalized)) {
    gender = 'masculine';
  }

  // Check for category patterns
  for (const [pattern, cat, subcat] of CATEGORY_PATTERNS) {
    const match = normalized.match(pattern);
    if (match) {
      category = cat;
      subcategory = subcat || match[1];
      break;
    }
  }

  // Special handling for verb subcategories
  if (category === 'Verbs') {
    const verbMatch = normalized.match(/Verb:\s*(\w+)/i);
    if (verbMatch) {
      subcategory = verbMatch[1];
    }
  }

  return { category, subcategory, gender };
}

export function generateIconKey(category: string, front: string): string {
  const categoryKey = category.toLowerCase().replace(/\s+/g, '-');
  const wordKey = front.toLowerCase()
    .replace(/[^a-z0-9]/gi, '-')
    .replace(/-+/g, '-')
    .slice(0, 20);

  return `${categoryKey}__${wordKey}`;
}

/**
 * Parse CSV with comprehensive validation.
 * Returns cards along with any warnings and errors encountered.
 */
export function parseCSVWithValidation(csvContent: string): CSVParseResult {
  const result: CSVParseResult = { cards: [], warnings: [], errors: [] };

  // File size validation
  const contentSize = new Blob([csvContent]).size;
  if (contentSize > CSV_CONFIG.MAX_FILE_SIZE_BYTES) {
    result.errors.push({
      type: 'file_too_large',
      message: `File size ${(contentSize / 1024 / 1024).toFixed(2)}MB exceeds maximum of 5MB`,
    });
    return result;
  }

  const lines = csvContent.trim().split('\n');

  if (lines.length < 2) {
    result.errors.push({
      type: 'empty_file',
      message: 'CSV must have at least a header row and one data row',
    });
    return result;
  }

  // Row count validation
  if (lines.length > CSV_CONFIG.MAX_ROWS + 1) {
    result.errors.push({
      type: 'too_many_rows',
      message: `File has ${lines.length - 1} rows, maximum is ${CSV_CONFIG.MAX_ROWS}`,
    });
    return result;
  }

  // Parse and validate header
  const headerLine = lines[0];
  let headers: string[];
  try {
    headers = parseCSVLine(headerLine).map(h => h.toLowerCase().trim());
  } catch {
    result.errors.push({
      line: 1,
      type: 'malformed',
      message: 'Could not parse header row',
    });
    return result;
  }

  const frontIndex = headers.findIndex(h => h === 'front');
  const backIndex = headers.findIndex(h => h === 'back');
  const notesIndex = headers.findIndex(h => h === 'notes');
  const categoryIndex = headers.findIndex(h => h === 'category');

  if (frontIndex === -1 || backIndex === -1) {
    result.errors.push({
      type: 'missing_columns',
      message: 'CSV must have "Front" and "Back" columns',
    });
    return result;
  }

  // Track seen cards for duplicate detection
  const seenCards = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    let values: string[];
    try {
      values = parseCSVLine(line);
    } catch {
      result.warnings.push({
        line: i + 1,
        type: 'skipped_row',
        message: 'Malformed CSV line, skipping',
      });
      continue;
    }

    const front = values[frontIndex]?.trim() || '';
    const back = values[backIndex]?.trim() || '';

    if (!front || !back) {
      result.warnings.push({
        line: i + 1,
        type: 'skipped_row',
        message: 'Missing front or back value',
      });
      continue;
    }

    // Duplicate detection
    const cardKey = `${front.toLowerCase()}|${back.toLowerCase()}`;
    if (seenCards.has(cardKey)) {
      result.warnings.push({
        line: i + 1,
        type: 'duplicate',
        message: `Duplicate card: "${front.substring(0, 30)}..."`,
      });
      continue;
    }
    seenCards.add(cardKey);

    const notes = notesIndex >= 0 ? values[notesIndex]?.trim() || '' : '';
    const explicitCategory = categoryIndex >= 0 ? values[categoryIndex]?.trim() || '' : '';

    // Parse category from notes if not explicitly provided
    const { category: parsedCategory, subcategory, gender: notesGender } = parseCategory(notes);

    // Use explicit category if provided, otherwise use parsed category
    const category = explicitCategory || parsedCategory;

    // Extract gender from back column if present (e.g., "Pa (M)", "Aigua (F)")
    const genderFromBack = extractGenderFromBack(back);
    let gender = genderFromBack || notesGender;

    // Validate gender value
    if (gender && !CSV_CONFIG.VALID_GENDERS.includes(gender)) {
      result.warnings.push({
        line: i + 1,
        type: 'invalid_gender',
        message: `Invalid gender "${gender}", ignoring`,
      });
      gender = undefined;
    }

    result.cards.push({
      id: generateId(),
      front,
      back,
      notes,
      category,
      subcategory,
      gender,
      iconKey: generateIconKey(category, front),
      createdAt: new Date(),
    });
  }

  logger.info('CSV parsed', 'CSVParser', {
    cards: result.cards.length,
    warnings: result.warnings.length,
    errors: result.errors.length,
  });

  return result;
}

/**
 * Parse CSV (backwards-compatible wrapper).
 * Throws on errors, silently skips problematic rows.
 */
export function parseCSV(csvContent: string): Flashcard[] {
  const result = parseCSVWithValidation(csvContent);

  // Throw if there are any errors
  if (result.errors.length > 0) {
    throw new Error(result.errors[0].message);
  }

  return result.cards;
}

function extractGenderFromBack(back: string): 'masculine' | 'feminine' | undefined {
  // Match patterns like (M), (F), (M Pl), (F Pl), (M Singular), (F Singular)
  const genderMatch = back.match(/\(([MF])\s*(?:Pl|Singular|Plural)?\)/i);
  if (genderMatch) {
    return genderMatch[1].toUpperCase() === 'M' ? 'masculine' : 'feminine';
  }
  return undefined;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

function generateId(): string {
  return `card_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function exportToCSV(flashcards: Flashcard[]): string {
  const header = 'Category,Front,Back,Notes';
  const rows = flashcards.map(card => {
    const category = escapeCSV(card.category);
    const front = escapeCSV(card.front);
    const back = escapeCSV(card.back);
    const notes = escapeCSV(card.notes);
    return `${category},${front},${back},${notes}`;
  });

  return [header, ...rows].join('\n');
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
