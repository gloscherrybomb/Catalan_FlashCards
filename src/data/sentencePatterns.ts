// Sentence patterns for teaching Catalan sentence structure
// Each pattern shows the grammatical structure with color-coded parts

export interface PatternPart {
  label: string;        // e.g., "Subject", "Verb", "Object"
  labelCatalan: string; // e.g., "Subjecte", "Verb", "Objecte"
  example: string;      // e.g., "El noi", "menja", "una poma"
  color: 'subject' | 'verb' | 'object' | 'adjective' | 'adverb' | 'question' | 'negative' | 'pronoun' | 'preposition';
}

export interface SentencePattern {
  id: string;
  name: string;
  nameCatalan: string;
  description: string;
  pattern: PatternPart[];
  fullExample: {
    catalan: string;
    english: string;
  };
  notes?: string[];
  relatedLessonId?: string;
}

// Color mapping for pattern parts
export const PATTERN_COLORS: Record<PatternPart['color'], { bg: string; text: string; border: string }> = {
  subject: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-300 dark:border-blue-700' },
  verb: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', border: 'border-green-300 dark:border-green-700' },
  object: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-300 dark:border-purple-700' },
  adjective: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-300 dark:border-orange-700' },
  adverb: { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-700 dark:text-pink-300', border: 'border-pink-300 dark:border-pink-700' },
  question: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-300 dark:border-yellow-700' },
  negative: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', border: 'border-red-300 dark:border-red-700' },
  pronoun: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-300 dark:border-cyan-700' },
  preposition: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-300 dark:border-indigo-700' },
};

export const SENTENCE_PATTERNS: SentencePattern[] = [
  // Basic Statements
  {
    id: 'svo-basic',
    name: 'Basic Statement (SVO)',
    nameCatalan: 'Frase bàsica (SVO)',
    description: 'The most common sentence structure: Subject + Verb + Object',
    pattern: [
      { label: 'Subject', labelCatalan: 'Subjecte', example: 'El noi', color: 'subject' },
      { label: 'Verb', labelCatalan: 'Verb', example: 'menja', color: 'verb' },
      { label: 'Object', labelCatalan: 'Objecte', example: 'una poma', color: 'object' },
    ],
    fullExample: {
      catalan: 'El noi menja una poma.',
      english: 'The boy eats an apple.',
    },
    notes: [
      'Like English, Catalan follows Subject-Verb-Object order',
      'The subject can be dropped when clear from context',
    ],
    relatedLessonId: 'word-order-basics',
  },
  {
    id: 'noun-adjective',
    name: 'Noun + Adjective',
    nameCatalan: 'Nom + Adjectiu',
    description: 'Adjectives usually come AFTER the noun in Catalan',
    pattern: [
      { label: 'Article', labelCatalan: 'Article', example: 'un', color: 'subject' },
      { label: 'Noun', labelCatalan: 'Nom', example: 'gat', color: 'object' },
      { label: 'Adjective', labelCatalan: 'Adjectiu', example: 'negre', color: 'adjective' },
    ],
    fullExample: {
      catalan: 'un gat negre',
      english: 'a black cat',
    },
    notes: [
      'Most adjectives follow the noun (unlike English)',
      'Colors, nationalities, and descriptive adjectives follow',
      'A few common adjectives (bon, mal, gran) can precede',
    ],
    relatedLessonId: 'word-order-basics',
  },

  // Questions
  {
    id: 'yes-no-question',
    name: 'Yes/No Question',
    nameCatalan: 'Pregunta de sí/no',
    description: 'Simply raise intonation - no word order change needed!',
    pattern: [
      { label: 'Verb', labelCatalan: 'Verb', example: 'Parles', color: 'verb' },
      { label: 'Object', labelCatalan: 'Objecte', example: 'català', color: 'object' },
      { label: '?', labelCatalan: '?', example: '?', color: 'question' },
    ],
    fullExample: {
      catalan: 'Parles català?',
      english: 'Do you speak Catalan?',
    },
    notes: [
      'No auxiliary verb needed (unlike English "do")',
      'Just raise your voice at the end',
      'Subject is often dropped',
    ],
    relatedLessonId: 'question-formation',
  },
  {
    id: 'wh-question',
    name: 'Question Word Question',
    nameCatalan: 'Pregunta amb interrogatiu',
    description: 'Question word comes first, then verb, then rest',
    pattern: [
      { label: 'Question Word', labelCatalan: 'Interrogatiu', example: 'On', color: 'question' },
      { label: 'Verb', labelCatalan: 'Verb', example: 'vius', color: 'verb' },
      { label: '?', labelCatalan: '?', example: '?', color: 'question' },
    ],
    fullExample: {
      catalan: 'On vius?',
      english: 'Where do you live?',
    },
    notes: [
      'Què (what), Qui (who), On (where), Quan (when)',
      'Com (how), Per què (why), Quin/a (which)',
    ],
    relatedLessonId: 'question-formation',
  },

  // Negation
  {
    id: 'simple-negation',
    name: 'Simple Negation',
    nameCatalan: 'Negació simple',
    description: 'Place "no" directly before the verb',
    pattern: [
      { label: 'Subject', labelCatalan: 'Subjecte', example: 'Jo', color: 'subject' },
      { label: 'NO', labelCatalan: 'NO', example: 'no', color: 'negative' },
      { label: 'Verb', labelCatalan: 'Verb', example: 'parlo', color: 'verb' },
      { label: 'Object', labelCatalan: 'Objecte', example: 'anglès', color: 'object' },
    ],
    fullExample: {
      catalan: 'Jo no parlo anglès.',
      english: "I don't speak English.",
    },
    notes: [
      '"No" always comes directly before the verb',
      'No auxiliary needed (unlike English "don\'t")',
    ],
    relatedLessonId: 'negation-patterns',
  },
  {
    id: 'double-negative',
    name: 'Double Negative',
    nameCatalan: 'Doble negació',
    description: 'Use "no" + verb + negative word (unlike English!)',
    pattern: [
      { label: 'NO', labelCatalan: 'NO', example: 'No', color: 'negative' },
      { label: 'Verb', labelCatalan: 'Verb', example: 'vull', color: 'verb' },
      { label: 'Neg. Word', labelCatalan: 'Paraula neg.', example: 'res', color: 'negative' },
    ],
    fullExample: {
      catalan: 'No vull res.',
      english: "I don't want anything.",
    },
    notes: [
      'Double negatives are CORRECT in Catalan',
      'res (nothing), ningú (nobody), mai (never), cap (none)',
    ],
    relatedLessonId: 'negation-patterns',
  },

  // Pronouns
  {
    id: 'object-pronoun',
    name: 'Object Pronoun Placement',
    nameCatalan: 'Posició del pronom',
    description: 'Object pronouns go BEFORE the conjugated verb',
    pattern: [
      { label: 'Pronoun', labelCatalan: 'Pronom', example: 'El', color: 'pronoun' },
      { label: 'Verb', labelCatalan: 'Verb', example: 'veig', color: 'verb' },
    ],
    fullExample: {
      catalan: 'El veig.',
      english: 'I see it/him.',
    },
    notes: [
      'Pronouns: em, et, el, la, ens, us, els, les',
      'Goes before verb, not after like in English',
    ],
    relatedLessonId: 'direct-object-pronouns',
  },
  {
    id: 'reflexive-verb',
    name: 'Reflexive Verb',
    nameCatalan: 'Verb reflexiu',
    description: 'Reflexive pronoun + verb',
    pattern: [
      { label: 'Subject', labelCatalan: 'Subjecte', example: 'Jo', color: 'subject' },
      { label: 'Reflexive', labelCatalan: 'Reflexiu', example: 'em', color: 'pronoun' },
      { label: 'Verb', labelCatalan: 'Verb', example: 'llevo', color: 'verb' },
    ],
    fullExample: {
      catalan: 'Jo em llevo.',
      english: 'I get up.',
    },
    notes: [
      'em, et, es, ens, us, es',
      'Many daily routine verbs are reflexive',
    ],
    relatedLessonId: 'reflexive-verbs',
  },

  // Past Tense
  {
    id: 'past-periphrastic',
    name: 'Past Tense (Periphrastic)',
    nameCatalan: 'Pretèrit perifràstic',
    description: 'Anar (go) + infinitive = past tense!',
    pattern: [
      { label: 'Subject', labelCatalan: 'Subjecte', example: 'Jo', color: 'subject' },
      { label: 'Anar', labelCatalan: 'Anar', example: 'vaig', color: 'verb' },
      { label: 'Infinitive', labelCatalan: 'Infinitiu', example: 'menjar', color: 'verb' },
    ],
    fullExample: {
      catalan: 'Jo vaig menjar.',
      english: 'I ate.',
    },
    notes: [
      'vaig, vas, va, vam, vau, van + infinitive',
      'Most common past tense in spoken Catalan',
    ],
    relatedLessonId: 'past-periphrastic',
  },

  // Relative Clauses
  {
    id: 'relative-clause',
    name: 'Relative Clause',
    nameCatalan: 'Oració de relatiu',
    description: 'Connect clauses with "que" (that/which/who)',
    pattern: [
      { label: 'Noun', labelCatalan: 'Nom', example: 'El llibre', color: 'object' },
      { label: 'que', labelCatalan: 'que', example: 'que', color: 'pronoun' },
      { label: 'Clause', labelCatalan: 'Oració', example: 'llegeixes', color: 'verb' },
    ],
    fullExample: {
      catalan: 'El llibre que llegeixes és bo.',
      english: 'The book that you are reading is good.',
    },
    notes: [
      'que = that/which/who (for people and things)',
      'on = where (for places)',
      'qui = who (after prepositions)',
    ],
    relatedLessonId: 'relative-clauses',
  },
];

// Get patterns by related lesson
export function getPatternsByLesson(lessonId: string): SentencePattern[] {
  return SENTENCE_PATTERNS.filter(p => p.relatedLessonId === lessonId);
}

// Get all patterns
export function getAllPatterns(): SentencePattern[] {
  return SENTENCE_PATTERNS;
}
