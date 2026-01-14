/**
 * Grammar-Vocabulary Integration
 * Maps flashcard categories and words to related grammar lessons
 */

import type { Flashcard } from '../types/flashcard';

interface GrammarLink {
  lessonId: string;
  title: string;
  reason: string; // Why this grammar is relevant
}

/**
 * Get related grammar lessons for a flashcard
 */
export function getRelatedGrammar(card: Flashcard): GrammarLink | null {
  const { category, subcategory, back } = card;
  const catalanWord = back.toLowerCase();

  // Verb-specific grammar
  if (category === 'Verbs') {
    if (subcategory === 'Ser' || subcategory === 'Estar') {
      return {
        lessonId: 'ser-vs-estar',
        title: 'Ser vs Estar',
        reason: 'Learn when to use ser vs estar',
      };
    }

    // Check verb endings for conjugation patterns
    if (catalanWord.endsWith('ar')) {
      return {
        lessonId: 'present-tense-ar',
        title: '-AR Verbs',
        reason: 'Learn -ar verb conjugation',
      };
    }

    if (catalanWord.endsWith('er') || catalanWord.endsWith('re')) {
      return {
        lessonId: 'present-tense-er-re',
        title: '-ER/-RE Verbs',
        reason: 'Learn -er/-re verb conjugation',
      };
    }

    if (catalanWord.endsWith('ir')) {
      return {
        lessonId: 'present-tense-ir',
        title: '-IR Verbs',
        reason: 'Learn -ir verb conjugation',
      };
    }

    // Reflexive verbs (usually start with reflexive pronoun patterns)
    if (catalanWord.includes('-se') || catalanWord.endsWith('se')) {
      return {
        lessonId: 'reflexive-verbs',
        title: 'Reflexive Verbs',
        reason: 'Learn reflexive verb usage',
      };
    }

    // Default verb grammar
    return {
      lessonId: 'present-tense-ar',
      title: 'Verb Conjugation',
      reason: 'Learn verb conjugation patterns',
    };
  }

  // Article-specific grammar
  if (category === 'Articles') {
    if (subcategory === 'Definite' || catalanWord.match(/^(el|la|els|les|l')$/)) {
      return {
        lessonId: 'definite-articles',
        title: 'Definite Articles',
        reason: 'Learn el, la, els, les usage',
      };
    }

    if (subcategory === 'Indefinite' || catalanWord.match(/^(un|una|uns|unes)$/)) {
      return {
        lessonId: 'indefinite-articles',
        title: 'Indefinite Articles',
        reason: 'Learn un, una, uns, unes usage',
      };
    }

    if (subcategory === 'Personal') {
      return {
        lessonId: 'personal-articles',
        title: 'Personal Articles',
        reason: 'Learn the unique Catalan personal article',
      };
    }
  }

  // Pronouns
  if (category === 'Pronouns') {
    if (subcategory === 'Subject') {
      return {
        lessonId: 'pronouns-subject',
        title: 'Subject Pronouns',
        reason: 'Learn jo, tu, ell, ella, etc.',
      };
    }

    if (subcategory === 'Object' || catalanWord.match(/^(em|et|el|la|ens|us|els|les)$/)) {
      return {
        lessonId: 'direct-object-pronouns',
        title: 'Object Pronouns',
        reason: 'Learn direct object pronouns',
      };
    }

    if (subcategory === 'Possessive') {
      return {
        lessonId: 'possessive-adjectives',
        title: 'Possessive Adjectives',
        reason: 'Learn meu, teu, seu, etc.',
      };
    }

    if (subcategory === 'Demonstrative') {
      return {
        lessonId: 'demonstratives',
        title: 'Demonstratives',
        reason: 'Learn aquest, aquell, etc.',
      };
    }
  }

  // Adjectives - link to adjective agreement
  if (category === 'Adjectives' || category === 'Colors') {
    return {
      lessonId: 'adjectives',
      title: 'Adjective Agreement',
      reason: 'Learn adjective agreement rules',
    };
  }

  // Nouns with gender - link to gender rules
  if (card.gender) {
    return {
      lessonId: 'gender-nouns',
      title: 'Noun Gender',
      reason: `Why this noun is ${card.gender}`,
    };
  }

  // Family words often have gender patterns
  if (category === 'Family') {
    return {
      lessonId: 'gender-nouns',
      title: 'Noun Gender',
      reason: 'Learn gender patterns in family words',
    };
  }

  // Numbers - link to gender agreement for un/una, dos/dues
  if (category === 'Numbers' && (catalanWord.includes('un') || catalanWord.includes('dos'))) {
    return {
      lessonId: 'gender-nouns',
      title: 'Number Agreement',
      reason: 'Numbers agree in gender with nouns',
    };
  }

  // Questions
  if (category === 'Questions' || card.front.endsWith('?')) {
    return {
      lessonId: 'question-formation',
      title: 'Question Formation',
      reason: 'Learn how to form questions',
    };
  }

  // Negation patterns
  if (catalanWord.includes('no ') || catalanWord.includes('mai') || catalanWord.includes('res')) {
    return {
      lessonId: 'negation-patterns',
      title: 'Negation',
      reason: 'Learn negation patterns',
    };
  }

  return null;
}

/**
 * Check if a grammar lesson exists for navigation
 */
export function grammarLessonExists(lessonId: string): boolean {
  const validLessons = [
    'definite-articles',
    'indefinite-articles',
    'personal-articles',
    'ser-vs-estar',
    'present-tense-ar',
    'gender-nouns',
    'plurals',
    'adjectives',
    'present-tense-er-re',
    'pronouns-subject',
    'word-order-basics',
    'question-formation',
    'negation-patterns',
    'possessive-adjectives',
    'demonstratives',
    'present-tense-ir',
    'reflexive-verbs',
    'direct-object-pronouns',
    'past-periphrastic',
    'imperfect-tense',
    'future-tense',
    'conditional-mood',
    'indirect-object-pronouns',
    'agradar',
    'present-perfect',
    'relative-clauses',
    'present-subjunctive',
  ];

  return validLessons.includes(lessonId);
}
