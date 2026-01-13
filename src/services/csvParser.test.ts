import { describe, it, expect } from 'vitest';
import {
  parseCSV,
  parseCSVWithValidation,
  parseCategory,
  exportToCSV,
} from './csvParser';
import type { Flashcard } from '../types/flashcard';

describe('CSV Parser', () => {
  describe('parseCSV', () => {
    it('should parse valid CSV with Front and Back columns', () => {
      const csv = `Front,Back
Hello,Hola
Goodbye,Adéu`;

      const cards = parseCSV(csv);

      expect(cards).toHaveLength(2);
      expect(cards[0].front).toBe('Hello');
      expect(cards[0].back).toBe('Hola');
      expect(cards[1].front).toBe('Goodbye');
      expect(cards[1].back).toBe('Adéu');
    });

    it('should parse CSV with optional Notes and Category columns', () => {
      const csv = `Category,Front,Back,Notes
Greetings,Hello,Hola,Common greeting
Food,Bread,Pa (M),Noun`;

      const cards = parseCSV(csv);

      expect(cards).toHaveLength(2);
      expect(cards[0].category).toBe('Greetings');
      expect(cards[0].notes).toBe('Common greeting');
      expect(cards[1].category).toBe('Food');
      expect(cards[1].gender).toBe('masculine');
    });

    it('should throw error for missing Front column', () => {
      const csv = `Back,Notes
Hola,Greeting`;

      expect(() => parseCSV(csv)).toThrow('CSV must have "Front" and "Back" columns');
    });

    it('should throw error for missing Back column', () => {
      const csv = `Front,Notes
Hello,Greeting`;

      expect(() => parseCSV(csv)).toThrow('CSV must have "Front" and "Back" columns');
    });

    it('should throw error for empty CSV', () => {
      const csv = `Front,Back`;

      expect(() => parseCSV(csv)).toThrow('CSV must have at least a header row and one data row');
    });

    it('should handle quoted fields with commas', () => {
      const csv = `Front,Back,Notes
"Hello, world","Hola, món",Test`;

      const cards = parseCSV(csv);

      expect(cards[0].front).toBe('Hello, world');
      expect(cards[0].back).toBe('Hola, món');
    });

    it('should handle escaped quotes within fields', () => {
      const csv = `Front,Back
"Say ""Hello""","Di ""Hola"""`;

      const cards = parseCSV(csv);

      expect(cards[0].front).toBe('Say "Hello"');
      expect(cards[0].back).toBe('Di "Hola"');
    });

    it('should skip empty rows', () => {
      const csv = `Front,Back
Hello,Hola

Goodbye,Adéu`;

      const cards = parseCSV(csv);

      expect(cards).toHaveLength(2);
    });

    it('should skip rows with missing front or back', () => {
      const csv = `Front,Back
Hello,Hola
,Missing front
Missing back,`;

      const cards = parseCSV(csv);

      expect(cards).toHaveLength(1);
    });

    it('should parse gender from back column (M)', () => {
      const csv = `Front,Back
Bread,Pa (M)`;

      const cards = parseCSV(csv);

      expect(cards[0].gender).toBe('masculine');
    });

    it('should parse gender from back column (F)', () => {
      const csv = `Front,Back
Water,Aigua (F)`;

      const cards = parseCSV(csv);

      expect(cards[0].gender).toBe('feminine');
    });

    it('should generate unique IDs for each card', () => {
      const csv = `Front,Back
Hello,Hola
Goodbye,Adéu`;

      const cards = parseCSV(csv);

      expect(cards[0].id).not.toBe(cards[1].id);
      expect(cards[0].id).toMatch(/^card_/);
    });
  });

  describe('parseCSVWithValidation', () => {
    it('should return cards and empty warnings/errors for valid CSV', () => {
      const csv = `Front,Back
Hello,Hola`;

      const result = parseCSVWithValidation(csv);

      expect(result.cards).toHaveLength(1);
      expect(result.warnings).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should return error for missing columns', () => {
      const csv = `Front,Notes
Hello,Greeting`;

      const result = parseCSVWithValidation(csv);

      expect(result.cards).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('missing_columns');
    });

    it('should return error for empty file', () => {
      const csv = `Front,Back`;

      const result = parseCSVWithValidation(csv);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('empty_file');
    });

    it('should return warning for skipped rows with missing values', () => {
      const csv = `Front,Back
Hello,Hola
,Missing`;

      const result = parseCSVWithValidation(csv);

      expect(result.cards).toHaveLength(1);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe('skipped_row');
      expect(result.warnings[0].line).toBe(3);
    });

    it('should return warning for duplicate cards', () => {
      const csv = `Front,Back
Hello,Hola
Hello,Hola`;

      const result = parseCSVWithValidation(csv);

      expect(result.cards).toHaveLength(1);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe('duplicate');
    });

    it('should detect duplicates case-insensitively', () => {
      const csv = `Front,Back
Hello,Hola
HELLO,HOLA`;

      const result = parseCSVWithValidation(csv);

      expect(result.cards).toHaveLength(1);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe('duplicate');
    });
  });

  describe('parseCategory', () => {
    it('should parse verb category', () => {
      const result = parseCategory('Verb: Ser');

      expect(result.category).toBe('Verbs');
      expect(result.subcategory).toBe('Ser');
    });

    it('should parse feminine gender', () => {
      const result = parseCategory('Feminine noun');

      expect(result.gender).toBe('feminine');
    });

    it('should parse masculine gender', () => {
      const result = parseCategory('Masculine');

      expect(result.gender).toBe('masculine');
    });

    it('should default to Vocabulary category', () => {
      const result = parseCategory('Some random notes');

      expect(result.category).toBe('Vocabulary');
    });

    it('should parse adjective category', () => {
      const result = parseCategory('Adjective');

      expect(result.category).toBe('Adjectives');
    });

    it('should parse article categories', () => {
      const definite = parseCategory('Definite article');
      const indefinite = parseCategory('Indefinite article');

      expect(definite.category).toBe('Articles');
      expect(definite.subcategory).toBe('Definite');
      expect(indefinite.category).toBe('Articles');
      expect(indefinite.subcategory).toBe('Indefinite');
    });
  });

  describe('exportToCSV', () => {
    it('should export cards to valid CSV', () => {
      const cards: Flashcard[] = [
        {
          id: 'card1',
          front: 'Hello',
          back: 'Hola',
          notes: 'Greeting',
          category: 'Greetings',
          iconKey: 'greetings__hello',
          createdAt: new Date(),
        },
      ];

      const csv = exportToCSV(cards);
      const lines = csv.split('\n');

      expect(lines[0]).toBe('Category,Front,Back,Notes');
      expect(lines[1]).toBe('Greetings,Hello,Hola,Greeting');
    });

    it('should escape commas in values', () => {
      const cards: Flashcard[] = [
        {
          id: 'card1',
          front: 'Hello, world',
          back: 'Hola, món',
          notes: '',
          category: 'Test',
          iconKey: 'test__hello',
          createdAt: new Date(),
        },
      ];

      const csv = exportToCSV(cards);
      const lines = csv.split('\n');

      expect(lines[1]).toBe('Test,"Hello, world","Hola, món",');
    });

    it('should escape quotes in values', () => {
      const cards: Flashcard[] = [
        {
          id: 'card1',
          front: 'Say "Hello"',
          back: 'Di "Hola"',
          notes: '',
          category: 'Test',
          iconKey: 'test__say',
          createdAt: new Date(),
        },
      ];

      const csv = exportToCSV(cards);
      const lines = csv.split('\n');

      expect(lines[1]).toBe('Test,"Say ""Hello""","Di ""Hola""",');
    });
  });
});
