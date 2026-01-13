// Essential A1 Catalan vocabulary for new users
import type { Flashcard } from '../types/flashcard';

export interface StarterCard {
  front: string;
  back: string;
  category: string;
  gender?: 'masculine' | 'feminine';
  notes?: string;
}

// Generate a unique ID for starter cards
function generateId(category: string, index: number): string {
  return `starter_${category.toLowerCase().replace(/\s+/g, '_')}_${index}`;
}

// Convert starter cards to full Flashcard objects
export function createFlashcardsFromStarter(cards: StarterCard[]): Flashcard[] {
  return cards.map((card, index) => ({
    id: generateId(card.category, index),
    front: card.front,
    back: card.back,
    category: card.category,
    gender: card.gender,
    notes: card.notes || '',
    iconKey: `${card.category.toLowerCase()}__${card.front.toLowerCase().replace(/\s+/g, '-')}`,
    createdAt: new Date(),
  }));
}

export const STARTER_VOCABULARY: StarterCard[] = [
  // Greetings (15 words)
  { front: 'hello', back: 'hola', category: 'Greetings', notes: 'Informal greeting' },
  { front: 'good morning', back: 'bon dia', category: 'Greetings', notes: 'Used until noon' },
  { front: 'good afternoon', back: 'bona tarda', category: 'Greetings', notes: 'Used after noon' },
  { front: 'good evening / good night', back: 'bona nit', category: 'Greetings', notes: 'Used in evening' },
  { front: 'goodbye', back: 'adéu', category: 'Greetings', notes: 'Formal goodbye' },
  { front: 'see you later', back: 'fins després', category: 'Greetings' },
  { front: 'see you tomorrow', back: 'fins demà', category: 'Greetings' },
  { front: 'thank you', back: 'gràcies', category: 'Greetings', notes: 'Also: merci (informal)' },
  { front: 'please', back: 'si us plau', category: 'Greetings', notes: 'Formal' },
  { front: "you're welcome", back: 'de res', category: 'Greetings' },
  { front: 'yes', back: 'sí', category: 'Greetings' },
  { front: 'no', back: 'no', category: 'Greetings' },
  { front: 'excuse me / sorry', back: 'perdó', category: 'Greetings' },
  { front: 'How are you?', back: 'Com estàs?', category: 'Greetings', notes: 'Informal' },
  { front: "I'm fine", back: 'Estic bé', category: 'Greetings' },

  // Family (12 words)
  { front: 'father', back: 'pare', category: 'Family', gender: 'masculine' },
  { front: 'mother', back: 'mare', category: 'Family', gender: 'feminine' },
  { front: 'brother', back: 'germà', category: 'Family', gender: 'masculine' },
  { front: 'sister', back: 'germana', category: 'Family', gender: 'feminine' },
  { front: 'son', back: 'fill', category: 'Family', gender: 'masculine' },
  { front: 'daughter', back: 'filla', category: 'Family', gender: 'feminine' },
  { front: 'grandfather', back: 'avi', category: 'Family', gender: 'masculine' },
  { front: 'grandmother', back: 'àvia', category: 'Family', gender: 'feminine' },
  { front: 'husband', back: 'marit', category: 'Family', gender: 'masculine' },
  { front: 'wife', back: 'muller', category: 'Family', gender: 'feminine' },
  { front: 'friend (male)', back: 'amic', category: 'Family', gender: 'masculine' },
  { front: 'friend (female)', back: 'amiga', category: 'Family', gender: 'feminine' },

  // Numbers (10 words)
  { front: 'one', back: 'un / una', category: 'Numbers', notes: 'Gender depends on noun' },
  { front: 'two', back: 'dos / dues', category: 'Numbers', notes: 'Gender depends on noun' },
  { front: 'three', back: 'tres', category: 'Numbers' },
  { front: 'four', back: 'quatre', category: 'Numbers' },
  { front: 'five', back: 'cinc', category: 'Numbers' },
  { front: 'six', back: 'sis', category: 'Numbers' },
  { front: 'seven', back: 'set', category: 'Numbers' },
  { front: 'eight', back: 'vuit', category: 'Numbers' },
  { front: 'nine', back: 'nou', category: 'Numbers' },
  { front: 'ten', back: 'deu', category: 'Numbers' },

  // Colors (10 words)
  { front: 'red', back: 'vermell', category: 'Colors', gender: 'masculine', notes: 'Feminine: vermella' },
  { front: 'blue', back: 'blau', category: 'Colors', gender: 'masculine', notes: 'Feminine: blava' },
  { front: 'green', back: 'verd', category: 'Colors', gender: 'masculine', notes: 'Feminine: verda' },
  { front: 'yellow', back: 'groc', category: 'Colors', gender: 'masculine', notes: 'Feminine: groga' },
  { front: 'white', back: 'blanc', category: 'Colors', gender: 'masculine', notes: 'Feminine: blanca' },
  { front: 'black', back: 'negre', category: 'Colors', gender: 'masculine', notes: 'Feminine: negra' },
  { front: 'orange', back: 'taronja', category: 'Colors', notes: 'Invariable' },
  { front: 'pink', back: 'rosa', category: 'Colors', notes: 'Invariable' },
  { front: 'brown', back: 'marró', category: 'Colors', notes: 'Invariable' },
  { front: 'grey', back: 'gris', category: 'Colors', notes: 'Invariable' },

  // Food & Drink (20 words)
  { front: 'water', back: 'aigua', category: 'Food & Drink', gender: 'feminine' },
  { front: 'bread', back: 'pa', category: 'Food & Drink', gender: 'masculine' },
  { front: 'coffee', back: 'cafè', category: 'Food & Drink', gender: 'masculine' },
  { front: 'tea', back: 'te', category: 'Food & Drink', gender: 'masculine' },
  { front: 'milk', back: 'llet', category: 'Food & Drink', gender: 'feminine' },
  { front: 'beer', back: 'cervesa', category: 'Food & Drink', gender: 'feminine' },
  { front: 'wine', back: 'vi', category: 'Food & Drink', gender: 'masculine' },
  { front: 'apple', back: 'poma', category: 'Food & Drink', gender: 'feminine' },
  { front: 'orange (fruit)', back: 'taronja', category: 'Food & Drink', gender: 'feminine' },
  { front: 'tomato', back: 'tomàquet', category: 'Food & Drink', gender: 'masculine' },
  { front: 'meat', back: 'carn', category: 'Food & Drink', gender: 'feminine' },
  { front: 'fish', back: 'peix', category: 'Food & Drink', gender: 'masculine' },
  { front: 'chicken', back: 'pollastre', category: 'Food & Drink', gender: 'masculine' },
  { front: 'egg', back: 'ou', category: 'Food & Drink', gender: 'masculine' },
  { front: 'cheese', back: 'formatge', category: 'Food & Drink', gender: 'masculine' },
  { front: 'rice', back: 'arròs', category: 'Food & Drink', gender: 'masculine' },
  { front: 'salad', back: 'amanida', category: 'Food & Drink', gender: 'feminine' },
  { front: 'sugar', back: 'sucre', category: 'Food & Drink', gender: 'masculine' },
  { front: 'salt', back: 'sal', category: 'Food & Drink', gender: 'feminine' },
  { front: 'the bill', back: 'el compte', category: 'Food & Drink', gender: 'masculine' },

  // Common Verbs (15 words)
  { front: 'to be (permanent)', back: 'ser', category: 'Verbs', notes: 'Jo sóc, tu ets, ell és' },
  { front: 'to be (temporary)', back: 'estar', category: 'Verbs', notes: 'Jo estic, tu estàs, ell està' },
  { front: 'to have', back: 'tenir', category: 'Verbs', notes: 'Jo tinc, tu tens, ell té' },
  { front: 'to want', back: 'voler', category: 'Verbs', notes: 'Jo vull, tu vols, ell vol' },
  { front: 'to be able to / can', back: 'poder', category: 'Verbs', notes: 'Jo puc, tu pots, ell pot' },
  { front: 'to go', back: 'anar', category: 'Verbs', notes: 'Jo vaig, tu vas, ell va' },
  { front: 'to come', back: 'venir', category: 'Verbs', notes: 'Jo vinc, tu véns, ell ve' },
  { front: 'to do / to make', back: 'fer', category: 'Verbs', notes: 'Jo faig, tu fas, ell fa' },
  { front: 'to say / to tell', back: 'dir', category: 'Verbs', notes: 'Jo dic, tu dius, ell diu' },
  { front: 'to eat', back: 'menjar', category: 'Verbs', notes: 'Regular -ar verb' },
  { front: 'to drink', back: 'beure', category: 'Verbs', notes: 'Jo bec, tu beus, ell beu' },
  { front: 'to speak', back: 'parlar', category: 'Verbs', notes: 'Regular -ar verb' },
  { front: 'to understand', back: 'entendre', category: 'Verbs', notes: "Jo entenc, tu entens, ell entén" },
  { front: 'to live', back: 'viure', category: 'Verbs', notes: 'Jo visc, tu vius, ell viu' },
  { front: 'to work', back: 'treballar', category: 'Verbs', notes: 'Regular -ar verb' },

  // Common Phrases (18 words)
  { front: "I don't understand", back: 'No entenc', category: 'Phrases' },
  { front: 'I speak a little Catalan', back: 'Parlo una mica de català', category: 'Phrases' },
  { front: 'Do you speak English?', back: 'Parles anglès?', category: 'Phrases', notes: 'Informal' },
  { front: 'What is your name?', back: 'Com et dius?', category: 'Phrases', notes: 'Informal' },
  { front: 'My name is...', back: 'Em dic...', category: 'Phrases' },
  { front: 'Nice to meet you', back: 'Encantat/da', category: 'Phrases', notes: 'Masc/Fem ending' },
  { front: 'Where is...?', back: 'On és...?', category: 'Phrases' },
  { front: 'How much does it cost?', back: 'Quant costa?', category: 'Phrases' },
  { front: 'I would like...', back: 'Voldria...', category: 'Phrases', notes: 'Polite form' },
  { front: 'I want...', back: 'Vull...', category: 'Phrases' },
  { front: 'I need...', back: 'Necessito...', category: 'Phrases' },
  { front: 'Can you help me?', back: "Em pots ajudar?", category: 'Phrases', notes: 'Informal' },
  { front: 'What time is it?', back: 'Quina hora és?', category: 'Phrases' },
  { front: 'today', back: 'avui', category: 'Phrases' },
  { front: 'tomorrow', back: 'demà', category: 'Phrases' },
  { front: 'yesterday', back: 'ahir', category: 'Phrases' },
  { front: 'here', back: 'aquí', category: 'Phrases' },
  { front: 'there', back: 'allà', category: 'Phrases' },
];

// Get all starter flashcards as full Flashcard objects
export function getStarterFlashcards(): Flashcard[] {
  return createFlashcardsFromStarter(STARTER_VOCABULARY);
}

// Get starter flashcards by category
export function getStarterByCategory(category: string): Flashcard[] {
  const filtered = STARTER_VOCABULARY.filter(card => card.category === category);
  return createFlashcardsFromStarter(filtered);
}

// Get all categories in starter vocabulary
export function getStarterCategories(): string[] {
  return [...new Set(STARTER_VOCABULARY.map(card => card.category))];
}

// Total count of starter cards
export const STARTER_VOCABULARY_COUNT = STARTER_VOCABULARY.length;
