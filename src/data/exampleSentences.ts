import type { ExampleSentence } from '../types/flashcard';

export interface SentenceCategory {
  id: string;
  name: string;
  nameCatalan: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface SentenceData {
  id: string;
  categoryId: string;
  catalan: string;
  english: string;
  // Words that are the vocabulary focus (indices in split sentence)
  vocabularyIndices: number[];
  // Audio available
  hasAudio: boolean;
  // Grammar concepts covered
  grammarConcepts?: string[];
  // Related flashcard IDs
  relatedCardIds?: string[];
}

// Sentence categories
export const SENTENCE_CATEGORIES: SentenceCategory[] = [
  {
    id: 'greetings',
    name: 'Greetings & Introductions',
    nameCatalan: 'Salutacions i presentacions',
    description: 'Basic greetings and introducing yourself',
    difficulty: 'beginner',
  },
  {
    id: 'numbers',
    name: 'Numbers in Context',
    nameCatalan: 'Números en context',
    description: 'Using numbers in everyday situations',
    difficulty: 'beginner',
  },
  {
    id: 'time',
    name: 'Time Expressions',
    nameCatalan: 'Expressions de temps',
    description: 'Telling time and talking about schedules',
    difficulty: 'beginner',
  },
  {
    id: 'food',
    name: 'Food & Ordering',
    nameCatalan: 'Menjar i demanar',
    description: 'Ordering food and talking about meals',
    difficulty: 'beginner',
  },
  {
    id: 'directions',
    name: 'Directions & Places',
    nameCatalan: 'Direccions i llocs',
    description: 'Asking for and giving directions',
    difficulty: 'intermediate',
  },
  {
    id: 'daily-life',
    name: 'Daily Life',
    nameCatalan: 'Vida quotidiana',
    description: 'Describing everyday activities',
    difficulty: 'intermediate',
  },
  {
    id: 'opinions',
    name: 'Opinions & Preferences',
    nameCatalan: 'Opinions i preferències',
    description: 'Expressing thoughts and preferences',
    difficulty: 'intermediate',
  },
  {
    id: 'past-events',
    name: 'Past Events',
    nameCatalan: 'Esdeveniments passats',
    description: 'Talking about things that happened',
    difficulty: 'advanced',
  },
  {
    id: 'future-plans',
    name: 'Future Plans',
    nameCatalan: 'Plans de futur',
    description: 'Discussing future intentions',
    difficulty: 'advanced',
  },
  {
    id: 'conditionals',
    name: 'Hypotheticals',
    nameCatalan: 'Hipotètics',
    description: 'Expressing conditional situations',
    difficulty: 'advanced',
  },
];

// Example sentences organized by category
export const EXAMPLE_SENTENCES: SentenceData[] = [
  // Greetings & Introductions
  {
    id: 'greet-1',
    categoryId: 'greetings',
    catalan: 'Hola, com et dius?',
    english: 'Hello, what is your name?',
    vocabularyIndices: [0, 2, 3],
    hasAudio: true,
    grammarConcepts: ['questions', 'reflexive-verbs'],
  },
  {
    id: 'greet-2',
    categoryId: 'greetings',
    catalan: 'Em dic Maria, i tu?',
    english: 'My name is Maria, and you?',
    vocabularyIndices: [0, 1],
    hasAudio: true,
    grammarConcepts: ['reflexive-verbs'],
  },
  {
    id: 'greet-3',
    categoryId: 'greetings',
    catalan: 'Bon dia! Com estàs?',
    english: 'Good morning! How are you?',
    vocabularyIndices: [0, 1, 3],
    hasAudio: true,
    grammarConcepts: ['ser-vs-estar', 'questions'],
  },
  {
    id: 'greet-4',
    categoryId: 'greetings',
    catalan: 'Estic molt bé, gràcies.',
    english: 'I am very well, thank you.',
    vocabularyIndices: [0, 2, 4],
    hasAudio: true,
    grammarConcepts: ['ser-vs-estar', 'adverbs'],
  },
  {
    id: 'greet-5',
    categoryId: 'greetings',
    catalan: 'Encantada de conèixer-te!',
    english: 'Nice to meet you!',
    vocabularyIndices: [0, 2],
    hasAudio: true,
    grammarConcepts: ['gender-agreement'],
  },
  {
    id: 'greet-6',
    categoryId: 'greetings',
    catalan: 'Sóc de Barcelona.',
    english: 'I am from Barcelona.',
    vocabularyIndices: [0, 1],
    hasAudio: true,
    grammarConcepts: ['ser-vs-estar'],
  },
  {
    id: 'greet-7',
    categoryId: 'greetings',
    catalan: 'Parles català molt bé!',
    english: 'You speak Catalan very well!',
    vocabularyIndices: [0, 1, 3],
    hasAudio: true,
    grammarConcepts: ['present-tense', 'adverbs'],
  },
  {
    id: 'greet-8',
    categoryId: 'greetings',
    catalan: 'Adéu, fins demà!',
    english: 'Goodbye, see you tomorrow!',
    vocabularyIndices: [0, 1, 2],
    hasAudio: true,
    grammarConcepts: ['farewells'],
  },

  // Numbers in Context
  {
    id: 'num-1',
    categoryId: 'numbers',
    catalan: 'Tinc vint-i-cinc anys.',
    english: 'I am twenty-five years old.',
    vocabularyIndices: [0, 1, 2],
    hasAudio: true,
    grammarConcepts: ['numbers', 'age-expression'],
  },
  {
    id: 'num-2',
    categoryId: 'numbers',
    catalan: 'Són tres euros amb cinquanta.',
    english: 'It is three euros fifty.',
    vocabularyIndices: [0, 1, 2, 4],
    hasAudio: true,
    grammarConcepts: ['numbers', 'prices'],
  },
  {
    id: 'num-3',
    categoryId: 'numbers',
    catalan: 'Hi ha quatre persones aquí.',
    english: 'There are four people here.',
    vocabularyIndices: [1, 2, 3],
    hasAudio: true,
    grammarConcepts: ['numbers', 'hi-ha'],
  },
  {
    id: 'num-4',
    categoryId: 'numbers',
    catalan: 'El meu número de telèfon és...',
    english: 'My phone number is...',
    vocabularyIndices: [1, 2, 4],
    hasAudio: true,
    grammarConcepts: ['numbers', 'possessives'],
  },
  {
    id: 'num-5',
    categoryId: 'numbers',
    catalan: 'Vull dues cerveses, si us plau.',
    english: 'I want two beers, please.',
    vocabularyIndices: [0, 1, 2],
    hasAudio: true,
    grammarConcepts: ['numbers', 'gender-agreement'],
  },

  // Time Expressions
  {
    id: 'time-1',
    categoryId: 'time',
    catalan: 'Quina hora és?',
    english: 'What time is it?',
    vocabularyIndices: [0, 1, 2],
    hasAudio: true,
    grammarConcepts: ['questions', 'time'],
  },
  {
    id: 'time-2',
    categoryId: 'time',
    catalan: 'Són les tres de la tarda.',
    english: 'It is three in the afternoon.',
    vocabularyIndices: [0, 2, 5],
    hasAudio: true,
    grammarConcepts: ['time', 'articles'],
  },
  {
    id: 'time-3',
    categoryId: 'time',
    catalan: 'A quina hora obre la botiga?',
    english: 'What time does the shop open?',
    vocabularyIndices: [1, 3, 5],
    hasAudio: true,
    grammarConcepts: ['time', 'questions'],
  },
  {
    id: 'time-4',
    categoryId: 'time',
    catalan: 'El tren surt a les nou.',
    english: 'The train leaves at nine.',
    vocabularyIndices: [1, 2, 5],
    hasAudio: true,
    grammarConcepts: ['time', 'present-tense'],
  },
  {
    id: 'time-5',
    categoryId: 'time',
    catalan: "Arribo d'aquí a mitja hora.",
    english: 'I arrive in half an hour.',
    vocabularyIndices: [0, 3, 4],
    hasAudio: true,
    grammarConcepts: ['time', 'present-tense'],
  },

  // Food & Ordering
  {
    id: 'food-1',
    categoryId: 'food',
    catalan: 'Què voleu per dinar?',
    english: 'What do you want for lunch?',
    vocabularyIndices: [0, 1, 3],
    hasAudio: true,
    grammarConcepts: ['questions', 'meals'],
  },
  {
    id: 'food-2',
    categoryId: 'food',
    catalan: 'Voldria una amanida, si us plau.',
    english: 'I would like a salad, please.',
    vocabularyIndices: [0, 2],
    hasAudio: true,
    grammarConcepts: ['conditional', 'articles'],
  },
  {
    id: 'food-3',
    categoryId: 'food',
    catalan: 'El peix és molt fresc avui.',
    english: 'The fish is very fresh today.',
    vocabularyIndices: [1, 4, 5],
    hasAudio: true,
    grammarConcepts: ['ser-vs-estar', 'adjectives'],
  },
  {
    id: 'food-4',
    categoryId: 'food',
    catalan: 'Podem veure la carta?',
    english: 'Can we see the menu?',
    vocabularyIndices: [0, 1, 3],
    hasAudio: true,
    grammarConcepts: ['modal-verbs', 'articles'],
  },
  {
    id: 'food-5',
    categoryId: 'food',
    catalan: 'El compte, si us plau.',
    english: 'The bill, please.',
    vocabularyIndices: [1],
    hasAudio: true,
    grammarConcepts: ['articles', 'restaurant'],
  },
  {
    id: 'food-6',
    categoryId: 'food',
    catalan: 'Tinc gana, anem a sopar!',
    english: 'I am hungry, let\'s go have dinner!',
    vocabularyIndices: [1, 4],
    hasAudio: true,
    grammarConcepts: ['expressions', 'imperatives'],
  },

  // Directions & Places
  {
    id: 'dir-1',
    categoryId: 'directions',
    catalan: 'On és l\'estació de tren?',
    english: 'Where is the train station?',
    vocabularyIndices: [0, 2, 4],
    hasAudio: true,
    grammarConcepts: ['questions', 'articles'],
  },
  {
    id: 'dir-2',
    categoryId: 'directions',
    catalan: 'Gira a l\'esquerra al semàfor.',
    english: 'Turn left at the traffic light.',
    vocabularyIndices: [0, 2, 4],
    hasAudio: true,
    grammarConcepts: ['imperatives', 'prepositions'],
  },
  {
    id: 'dir-3',
    categoryId: 'directions',
    catalan: 'És a prop d\'aquí.',
    english: 'It is near here.',
    vocabularyIndices: [1, 2],
    hasAudio: true,
    grammarConcepts: ['ser-vs-estar', 'prepositions'],
  },
  {
    id: 'dir-4',
    categoryId: 'directions',
    catalan: 'Segueix recte fins al final.',
    english: 'Go straight until the end.',
    vocabularyIndices: [0, 1, 4],
    hasAudio: true,
    grammarConcepts: ['imperatives', 'prepositions'],
  },
  {
    id: 'dir-5',
    categoryId: 'directions',
    catalan: 'El museu és a la plaça.',
    english: 'The museum is in the square.',
    vocabularyIndices: [1, 4],
    hasAudio: true,
    grammarConcepts: ['ser-vs-estar', 'prepositions'],
  },

  // Daily Life
  {
    id: 'daily-1',
    categoryId: 'daily-life',
    catalan: 'Em llevo a les set cada dia.',
    english: 'I wake up at seven every day.',
    vocabularyIndices: [0, 1, 4, 5],
    hasAudio: true,
    grammarConcepts: ['reflexive-verbs', 'time'],
  },
  {
    id: 'daily-2',
    categoryId: 'daily-life',
    catalan: 'Treballo en una oficina.',
    english: 'I work in an office.',
    vocabularyIndices: [0, 3],
    hasAudio: true,
    grammarConcepts: ['present-tense', 'prepositions'],
  },
  {
    id: 'daily-3',
    categoryId: 'daily-life',
    catalan: 'M\'agrada llegir abans de dormir.',
    english: 'I like to read before sleeping.',
    vocabularyIndices: [0, 1, 3],
    hasAudio: true,
    grammarConcepts: ['agradar', 'infinitives'],
  },
  {
    id: 'daily-4',
    categoryId: 'daily-life',
    catalan: 'Els caps de setmana surto amb amics.',
    english: 'On weekends I go out with friends.',
    vocabularyIndices: [1, 4, 6],
    hasAudio: true,
    grammarConcepts: ['present-tense', 'prepositions'],
  },
  {
    id: 'daily-5',
    categoryId: 'daily-life',
    catalan: 'Faig esport tres vegades per setmana.',
    english: 'I exercise three times per week.',
    vocabularyIndices: [0, 1, 2, 3],
    hasAudio: true,
    grammarConcepts: ['fer', 'frequency'],
  },

  // Opinions & Preferences
  {
    id: 'opin-1',
    categoryId: 'opinions',
    catalan: 'Penso que és una bona idea.',
    english: 'I think it is a good idea.',
    vocabularyIndices: [0, 4, 5],
    hasAudio: true,
    grammarConcepts: ['opinions', 'subjunctive'],
  },
  {
    id: 'opin-2',
    categoryId: 'opinions',
    catalan: 'Prefereixo el cafè al te.',
    english: 'I prefer coffee to tea.',
    vocabularyIndices: [0, 2, 4],
    hasAudio: true,
    grammarConcepts: ['preferences', 'comparisons'],
  },
  {
    id: 'opin-3',
    categoryId: 'opinions',
    catalan: 'No m\'agrada gens el fred.',
    english: 'I don\'t like the cold at all.',
    vocabularyIndices: [1, 2, 3, 5],
    hasAudio: true,
    grammarConcepts: ['agradar', 'negation'],
  },
  {
    id: 'opin-4',
    categoryId: 'opinions',
    catalan: 'Crec que tens raó.',
    english: 'I believe you are right.',
    vocabularyIndices: [0, 3, 4],
    hasAudio: true,
    grammarConcepts: ['opinions', 'expressions'],
  },
  {
    id: 'opin-5',
    categoryId: 'opinions',
    catalan: 'És millor que arribem d\'hora.',
    english: 'It is better that we arrive early.',
    vocabularyIndices: [1, 4],
    hasAudio: true,
    grammarConcepts: ['comparatives', 'subjunctive'],
  },

  // Past Events
  {
    id: 'past-1',
    categoryId: 'past-events',
    catalan: 'Ahir vaig anar al cinema.',
    english: 'Yesterday I went to the cinema.',
    vocabularyIndices: [0, 2, 5],
    hasAudio: true,
    grammarConcepts: ['past-tense', 'anar'],
  },
  {
    id: 'past-2',
    categoryId: 'past-events',
    catalan: 'Quan era petit, vivia a Girona.',
    english: 'When I was little, I lived in Girona.',
    vocabularyIndices: [0, 1, 2, 3],
    hasAudio: true,
    grammarConcepts: ['imperfect', 'ser-vs-estar'],
  },
  {
    id: 'past-3',
    categoryId: 'past-events',
    catalan: 'He estudiat català durant dos anys.',
    english: 'I have studied Catalan for two years.',
    vocabularyIndices: [0, 1, 2, 4],
    hasAudio: true,
    grammarConcepts: ['present-perfect', 'duration'],
  },
  {
    id: 'past-4',
    categoryId: 'past-events',
    catalan: 'El concert va ser increïble!',
    english: 'The concert was incredible!',
    vocabularyIndices: [1, 3, 4],
    hasAudio: true,
    grammarConcepts: ['past-tense', 'adjectives'],
  },
  {
    id: 'past-5',
    categoryId: 'past-events',
    catalan: 'Ja havia acabat quan vas arribar.',
    english: 'I had already finished when you arrived.',
    vocabularyIndices: [1, 2, 4, 5],
    hasAudio: true,
    grammarConcepts: ['pluperfect', 'past-tense'],
  },

  // Future Plans
  {
    id: 'fut-1',
    categoryId: 'future-plans',
    catalan: 'Demà aniré a la platja.',
    english: 'Tomorrow I will go to the beach.',
    vocabularyIndices: [0, 1, 4],
    hasAudio: true,
    grammarConcepts: ['future-tense', 'anar'],
  },
  {
    id: 'fut-2',
    categoryId: 'future-plans',
    catalan: 'Aquest estiu viatjarem a Menorca.',
    english: 'This summer we will travel to Menorca.',
    vocabularyIndices: [0, 1, 2],
    hasAudio: true,
    grammarConcepts: ['future-tense', 'time-expressions'],
  },
  {
    id: 'fut-3',
    categoryId: 'future-plans',
    catalan: 'Penso estudiar medicina.',
    english: 'I intend to study medicine.',
    vocabularyIndices: [0, 1, 2],
    hasAudio: true,
    grammarConcepts: ['future-intentions', 'infinitives'],
  },
  {
    id: 'fut-4',
    categoryId: 'future-plans',
    catalan: 'El tren arribarà a les cinc.',
    english: 'The train will arrive at five.',
    vocabularyIndices: [1, 2, 5],
    hasAudio: true,
    grammarConcepts: ['future-tense', 'time'],
  },
  {
    id: 'fut-5',
    categoryId: 'future-plans',
    catalan: 'L\'any que ve compraré un cotxe.',
    english: 'Next year I will buy a car.',
    vocabularyIndices: [0, 3, 5],
    hasAudio: true,
    grammarConcepts: ['future-tense', 'time-expressions'],
  },

  // Conditionals
  {
    id: 'cond-1',
    categoryId: 'conditionals',
    catalan: 'Si tingués temps, aprendria a tocar guitarra.',
    english: 'If I had time, I would learn to play guitar.',
    vocabularyIndices: [1, 2, 4],
    hasAudio: true,
    grammarConcepts: ['conditional', 'subjunctive'],
  },
  {
    id: 'cond-2',
    categoryId: 'conditionals',
    catalan: 'Què faries si guanyessis la loteria?',
    english: 'What would you do if you won the lottery?',
    vocabularyIndices: [0, 1, 4],
    hasAudio: true,
    grammarConcepts: ['conditional', 'questions'],
  },
  {
    id: 'cond-3',
    categoryId: 'conditionals',
    catalan: 'Hauria vingut si m\'haguessis avisat.',
    english: 'I would have come if you had warned me.',
    vocabularyIndices: [0, 1, 4],
    hasAudio: true,
    grammarConcepts: ['past-conditional', 'pluperfect-subjunctive'],
  },
  {
    id: 'cond-4',
    categoryId: 'conditionals',
    catalan: 'Si plou, ens quedarem a casa.',
    english: 'If it rains, we will stay at home.',
    vocabularyIndices: [1, 3, 5],
    hasAudio: true,
    grammarConcepts: ['conditional', 'future'],
  },
  {
    id: 'cond-5',
    categoryId: 'conditionals',
    catalan: 'M\'agradaria que vinguessis a la festa.',
    english: 'I would like you to come to the party.',
    vocabularyIndices: [0, 3, 6],
    hasAudio: true,
    grammarConcepts: ['conditional', 'subjunctive'],
  },
];

// Helper functions
export function getSentencesByCategory(categoryId: string): SentenceData[] {
  return EXAMPLE_SENTENCES.filter((s) => s.categoryId === categoryId);
}

export function getSentencesByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): SentenceData[] {
  const categoryIds = SENTENCE_CATEGORIES
    .filter((c) => c.difficulty === difficulty)
    .map((c) => c.id);
  return EXAMPLE_SENTENCES.filter((s) => categoryIds.includes(s.categoryId));
}

export function getSentenceById(id: string): SentenceData | undefined {
  return EXAMPLE_SENTENCES.find((s) => s.id === id);
}

export function getRandomSentences(count: number, difficulty?: 'beginner' | 'intermediate' | 'advanced'): SentenceData[] {
  const pool = difficulty ? getSentencesByDifficulty(difficulty) : EXAMPLE_SENTENCES;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Convert SentenceData to ExampleSentence format
export function toExampleSentence(data: SentenceData): ExampleSentence {
  return {
    catalan: data.catalan,
    english: data.english,
    wordPositions: data.vocabularyIndices,
  };
}
