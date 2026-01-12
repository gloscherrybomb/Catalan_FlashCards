import type { Flashcard } from '../types/flashcard';

interface ParsedCategory {
  category: string;
  subcategory?: string;
  gender?: 'masculine' | 'feminine';
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

export function parseCSV(csvContent: string): Flashcard[] {
  const lines = csvContent.trim().split('\n');

  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }

  // Parse header
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine).map(h => h.toLowerCase().trim());

  const frontIndex = headers.findIndex(h => h === 'front');
  const backIndex = headers.findIndex(h => h === 'back');
  const notesIndex = headers.findIndex(h => h === 'notes');

  if (frontIndex === -1 || backIndex === -1) {
    throw new Error('CSV must have "Front" and "Back" columns');
  }

  const flashcards: Flashcard[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);

    const front = values[frontIndex]?.trim() || '';
    const back = values[backIndex]?.trim() || '';
    const notes = notesIndex >= 0 ? values[notesIndex]?.trim() || '' : '';

    if (!front || !back) continue;

    const { category, subcategory, gender } = parseCategory(notes);

    flashcards.push({
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

  return flashcards;
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
  const header = 'Front,Back,Notes';
  const rows = flashcards.map(card => {
    const front = escapeCSV(card.front);
    const back = escapeCSV(card.back);
    const notes = escapeCSV(card.notes);
    return `${front},${back},${notes}`;
  });

  return [header, ...rows].join('\n');
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
