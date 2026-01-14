/**
 * Library Helpers
 * Utilities for adding learned content to the flashcard library
 */

import type { Flashcard } from '../types/flashcard';
import type { StoryVocab } from '../data/stories';
import { useCardStore } from '../stores/cardStore';

// Generate a unique ID for new flashcards
function generateId(): string {
  return `card_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Generate icon key based on category
function generateIconKey(category: string, front: string): string {
  const categoryKey = category.toLowerCase().replace(/\s+/g, '-');
  const wordKey = front.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 10);
  return `${categoryKey}-${wordKey}`;
}

export type LearnedSource = 'conversation' | 'story' | 'grammar' | 'vocabulary-intro';

export interface LearnedItem {
  english: string;
  catalan: string;
  category?: string;
  notes?: string;
  partOfSpeech?: string;
}

/**
 * Add learned content to the flashcard library
 * Automatically deduplicates and saves to storage
 *
 * @param items - Array of items to add
 * @param source - Where the content was learned from
 * @param sourceTitle - Optional title (e.g., story title, scenario name)
 * @returns Number of unique cards added
 */
export async function addToFlashcardLibrary(
  items: LearnedItem[],
  source: LearnedSource,
  sourceTitle?: string
): Promise<number> {
  if (items.length === 0) return 0;

  const cardStore = useCardStore.getState();

  // Build category name based on source
  const categoryPrefix = {
    'conversation': 'Conversation',
    'story': 'Stories',
    'grammar': 'Grammar',
    'vocabulary-intro': 'Vocabulary',
  }[source];

  const newCards: Flashcard[] = items.map(item => {
    const category = item.category ||
      (sourceTitle ? `${categoryPrefix} - ${sourceTitle}` : categoryPrefix);

    const notes = buildNotes(item, source, sourceTitle);

    return {
      id: generateId(),
      front: item.english,
      back: item.catalan,
      category,
      notes,
      iconKey: generateIconKey(category, item.english),
      createdAt: new Date(),
    };
  });

  // Use the store's addFlashcards which handles deduplication
  const addedCount = await cardStore.addFlashcards(newCards);

  return addedCount;
}

/**
 * Build notes string from learned item metadata
 */
function buildNotes(item: LearnedItem, source: LearnedSource, sourceTitle?: string): string {
  const parts: string[] = [];

  if (item.notes) {
    parts.push(item.notes);
  }

  if (item.partOfSpeech) {
    parts.push(`(${item.partOfSpeech})`);
  }

  const sourceLabel = {
    'conversation': 'conversation practice',
    'story': 'reading',
    'grammar': 'grammar lesson',
    'vocabulary-intro': 'vocabulary lesson',
  }[source];

  if (sourceTitle) {
    parts.push(`Learned from ${sourceLabel}: ${sourceTitle}`);
  } else {
    parts.push(`Learned from ${sourceLabel}`);
  }

  return parts.join(' | ');
}

/**
 * Add story vocabulary to the flashcard library
 */
export async function addStoryVocabToLibrary(
  vocab: StoryVocab[],
  storyTitle: string
): Promise<number> {
  const items: LearnedItem[] = vocab.map(v => ({
    english: v.translation,
    catalan: v.word,
    partOfSpeech: v.partOfSpeech,
  }));

  return addToFlashcardLibrary(items, 'story', storyTitle);
}

/**
 * Add conversation phrases to the flashcard library
 */
export async function addConversationPhrasesToLibrary(
  phrases: Array<{ catalan: string; english: string }>,
  scenarioTitle: string
): Promise<number> {
  const items: LearnedItem[] = phrases.map(p => ({
    english: p.english,
    catalan: p.catalan,
  }));

  return addToFlashcardLibrary(items, 'conversation', scenarioTitle);
}

/**
 * Check if a word already exists in the library
 */
export function isWordInLibrary(catalan: string): boolean {
  const cardStore = useCardStore.getState();
  const normalizedCatalan = catalan.toLowerCase().trim();

  return cardStore.flashcards.some(
    card => card.back.toLowerCase().trim() === normalizedCatalan
  );
}

/**
 * Get count of words from a list that are not yet in library
 */
export function getNewWordsCount(catalanWords: string[]): number {
  const cardStore = useCardStore.getState();
  const existingBacks = new Set(
    cardStore.flashcards.map(c => c.back.toLowerCase().trim())
  );

  return catalanWords.filter(
    word => !existingBacks.has(word.toLowerCase().trim())
  ).length;
}
